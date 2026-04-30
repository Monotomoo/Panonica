/**
 * AI Offtake math — pure functions consumed by /offtake components.
 * No store side effects · cheap to memo.
 */

import type { Buyer } from '@/mock/aiCorridor';

/* ============================ BLENDED PPA ============================ */

export interface BlendedPpa {
  totalSliceMW: number;
  weightedPriceEurMwh: number;
  weightedTenor: number;
  greenPremiumWeighted: number;
  cfeMatchPct: number;        // 24/7-CFE-required share
  riskScore: number;          // probability-weighted credit/exec risk
}

/** Blend price across the buyer stack using probability × MW-share weights. */
export function blendPpa(buyers: Buyer[]): BlendedPpa {
  const totalSliceMW = buyers.reduce((s, b) => s + b.ourSliceMW * b.probability, 0) || 1e-9;

  let weightedPrice = 0;
  let weightedTenor = 0;
  let weightedGreen = 0;
  let cfeMatchMW = 0;
  let weightedRisk = 0;

  for (const b of buyers) {
    const w = (b.ourSliceMW * b.probability) / totalSliceMW;
    weightedPrice += b.ppaPriceEurMwh * w;
    weightedTenor += b.tenorYears * w;
    weightedGreen += b.greenPremiumEurMwh * w;
    if (b.cfeRequirement === '24-7') cfeMatchMW += b.ourSliceMW * b.probability;

    // Higher rating = lower risk · map AAA=0.05 ... speculative=0.6
    const ratingRisk: Record<string, number> = {
      AAA: 0.05, AA: 0.10, A: 0.18, BBB: 0.32, BB: 0.50, speculative: 0.70,
    };
    const execRisk = 1 - b.probability;
    weightedRisk += (ratingRisk[b.creditRating] * 0.4 + execRisk * 0.6) * w;
  }

  return {
    totalSliceMW,
    weightedPriceEurMwh: weightedPrice,
    weightedTenor,
    greenPremiumWeighted: weightedGreen,
    cfeMatchPct: (cfeMatchMW / totalSliceMW) * 100,
    riskScore: weightedRisk,
  };
}

/* ============================ 24/7 CFE MATCHING ============================ */

/**
 * Generate a 24h × 12m grid of solar production fraction.
 * Returns matrix[hour][month] of value 0..1 representing fraction of nameplate.
 *
 * Posavina-specific · clear-sky cosine curve modulated by seasonal day-length.
 */
export function buildSolarProductionGrid(): number[][] {
  // matrix[24][12]
  const grid: number[][] = Array.from({ length: 24 }, () => Array(12).fill(0));
  for (let m = 0; m < 12; m++) {
    // Day length proxy · radians of daylight (peak ~Jun=5)
    const dayLengthHrs = 9 + 6 * Math.sin(((m - 2) / 12) * 2 * Math.PI);
    const sunrise = 12 - dayLengthHrs / 2;
    const sunset = 12 + dayLengthHrs / 2;
    // Peak intensity scales seasonally · Jun=1.0 · Dec=0.4
    const peak = 0.55 + 0.45 * Math.sin(((m - 2) / 12) * 2 * Math.PI);
    for (let h = 0; h < 24; h++) {
      if (h < sunrise || h > sunset) {
        grid[h][m] = 0;
        continue;
      }
      // Half-cosine over the daylight window
      const t = (h - sunrise) / (sunset - sunrise);
      const intensity = peak * Math.sin(t * Math.PI);
      grid[h][m] = Math.max(0, Math.min(1, intensity));
    }
  }
  return grid;
}

/**
 * Hyperscaler load profile · ~constant 0.92 baseline · slight evening peak for AI training
 * batch jobs · returns matrix[24][12] of fraction-of-peak.
 */
export function buildHyperscalerLoadGrid(): number[][] {
  const grid: number[][] = Array.from({ length: 24 }, () => Array(12).fill(0.92));
  for (let h = 0; h < 24; h++) {
    // Slight bump 18-23h · AI inference + training peak
    let bump = 0;
    if (h >= 18 && h <= 23) bump = 0.06;
    if (h >= 2 && h <= 5) bump = 0.04;  // batch training overnight
    for (let m = 0; m < 12; m++) {
      // Summer cooling overhead +3%
      const seasonal = m >= 5 && m <= 8 ? 0.03 : 0;
      grid[h][m] = Math.min(1.0, 0.92 + bump + seasonal);
    }
  }
  return grid;
}

/**
 * 24/7 CFE match · fraction of buyer load directly covered by KB solar
 * (rest = battery dispatch + grid import). Assumes battery covers 4h/day at 50% bandwidth.
 */
export function computeCfeMatch(
  solarGrid: number[][],
  loadGrid: number[][],
  ourMwShareOfLoad: number, // 0..1 · KB output / buyer demand
  batteryHrs: number = 4,
): { matchPct: number; matrix: number[][] } {
  const matrix: number[][] = Array.from({ length: 24 }, () => Array(12).fill(0));
  let totalLoad = 0;
  let totalCovered = 0;
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 12; m++) {
      const load = loadGrid[h][m];
      const directSolar = Math.min(load, solarGrid[h][m] * ourMwShareOfLoad);
      // Simple battery model: shift up to batteryHrs of daytime surplus into night
      const surplus = Math.max(0, solarGrid[h][m] * ourMwShareOfLoad - load);
      const isNightHour = solarGrid[h][m] < 0.05;
      const battery = isNightHour ? Math.min(load - directSolar, surplus * (batteryHrs / 24)) : 0;
      const covered = Math.min(load, directSolar + battery);
      matrix[h][m] = load > 0 ? covered / load : 0;
      totalLoad += load;
      totalCovered += covered;
    }
  }
  return { matchPct: (totalCovered / totalLoad) * 100, matrix };
}

/* ============================ MONTE CARLO ============================ */

export interface McRun {
  id: number;
  pantheonOutcome: 'cancel' | 'partial' | 'full';
  hroteEurMwh: number;
  recPremiumEurMwh: number;
  regulatoryDelayMonths: number;
  npv25yEur: number;
  irrEquityPct: number;
  momY10: number;
}

interface McInputs {
  buyers: Buyer[];
  baseCapexEur: number;       // 21M
  baseAnnualMwh: number;      // 39_200
  runs: number;
}

/** Box-Muller Gaussian sample. */
function gauss(): number {
  const u = Math.max(Math.random(), 1e-9);
  const v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/** Categorical sample · weights must sum to 1. */
function categorical<T>(items: T[], weights: number[]): T {
  const r = Math.random();
  let acc = 0;
  for (let i = 0; i < items.length; i++) {
    acc += weights[i];
    if (r <= acc) return items[i];
  }
  return items[items.length - 1];
}

export function runOfftakeMonteCarlo({
  buyers,
  baseCapexEur,
  baseAnnualMwh,
  runs,
}: McInputs): McRun[] {
  const out: McRun[] = [];

  for (let i = 0; i < runs; i++) {
    // Sample variables
    const pantheonOutcome = categorical(
      ['cancel', 'partial', 'full'] as const,
      [0.45, 0.20, 0.35], // 35% probability of full Pantheon
    );
    const hroteEurMwh = Math.max(50, 94 + gauss() * 17);
    const recPremiumEurMwh = Math.max(0, 11 + gauss() * 5);
    const regulatoryDelayMonths = Math.max(0, 4 + gauss() * 6);

    // Compute scenario blended price
    const scenarioBuyers = buyers.map((b) => {
      if (b.id === 'pantheon') {
        if (pantheonOutcome === 'cancel') return { ...b, ourSliceMW: 0 };
        if (pantheonOutcome === 'partial') return { ...b, ourSliceMW: b.ourSliceMW * 0.4 };
        return b;
      }
      if (b.id === 'merchant') return { ...b, ppaPriceEurMwh: hroteEurMwh };
      // Apply REC premium fluctuation to corporate/hyperscaler
      if (b.type === 'corporate' || b.type === 'hyperscaler') {
        return {
          ...b,
          ppaPriceEurMwh: b.ppaPriceEurMwh - 11 + recPremiumEurMwh,
        };
      }
      return b;
    });

    const blended = blendPpa(scenarioBuyers);
    const annualRevenue = baseAnnualMwh * blended.weightedPriceEurMwh;

    // Apply regulatory delay penalty (months of lost revenue)
    const delayPenalty = (annualRevenue / 12) * regulatoryDelayMonths * 0.7;

    // 25-yr NPV at 8%
    let npv = -baseCapexEur - delayPenalty;
    for (let y = 1; y <= 25; y++) {
      const rev = annualRevenue * Math.pow(1.015, y - 1) * Math.pow(0.996, y - 1);
      const opex = 225_000 * Math.pow(1.02, y - 1);
      const cf = rev - opex;
      npv += cf / Math.pow(1.08, y);
    }

    // Simplified equity IRR · solve for r in NPV=0 over 25y · Newton's method 6 iter
    let r = 0.10;
    for (let iter = 0; iter < 6; iter++) {
      let v = -baseCapexEur - delayPenalty;
      let dv = 0;
      for (let y = 1; y <= 25; y++) {
        const rev = annualRevenue * Math.pow(1.015, y - 1) * Math.pow(0.996, y - 1);
        const opex = 225_000 * Math.pow(1.02, y - 1);
        const cf = rev - opex;
        v += cf / Math.pow(1 + r, y);
        dv -= (y * cf) / Math.pow(1 + r, y + 1);
      }
      r = r - v / dv;
      if (!isFinite(r) || r < -0.5 || r > 1) {
        r = 0.05;
        break;
      }
    }
    const irrEquityPct = r * 100;

    // MoM at year 10 · simplified
    let cumCash = 0;
    for (let y = 1; y <= 10; y++) {
      const rev = annualRevenue * Math.pow(1.015, y - 1) * Math.pow(0.996, y - 1);
      cumCash += rev * 0.42; // post-debt-service equity dividend approximation
    }
    const exitEv = annualRevenue * Math.pow(1.015, 9) * 0.65 / 0.065; // 6.5% cap on Y10 EBITDA proxy
    const momY10 = (cumCash + exitEv * 0.25) / (baseCapexEur * 0.25);

    out.push({
      id: i,
      pantheonOutcome,
      hroteEurMwh,
      recPremiumEurMwh,
      regulatoryDelayMonths,
      npv25yEur: npv,
      irrEquityPct: Math.max(-5, Math.min(35, irrEquityPct)),
      momY10: Math.max(0, Math.min(20, momY10)),
    });
  }

  return out;
}

/** Compute P10 / P50 / P90 + mean from Monte Carlo runs. */
export function summarizeRuns(
  runs: McRun[],
  metric: 'npv25yEur' | 'irrEquityPct' | 'momY10',
): { p10: number; p50: number; p90: number; mean: number; min: number; max: number } {
  const values = runs.map((r) => r[metric]).sort((a, b) => a - b);
  const pick = (p: number) => values[Math.floor(values.length * p)];
  return {
    p10: pick(0.1),
    p50: pick(0.5),
    p90: pick(0.9),
    mean: values.reduce((s, v) => s + v, 0) / values.length,
    min: values[0],
    max: values[values.length - 1],
  };
}
