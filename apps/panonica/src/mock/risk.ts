/**
 * Risk Center · climate · insurance · political · force majeure.
 *
 * Pure data + calculation utilities. The screen renders sliders for
 * each category; a combined-IRR widget shows the net stress effect.
 *
 * Baseline IRR: 11.4% (Agri-PV + Sheep 30 MW). Every risk modifier
 * moves this by a bounded delta. Deltas are calibrated from Munich Re
 * + Swiss Re solar insurance benchmarks + Fraunhofer ISE climate
 * derating studies + HAPIH agricultural force majeure tables.
 */

export interface ClimateScenario {
  id: 'rcp45' | 'rcp85' | 'current';
  label: string;
  description: string;
  yieldDelta2030Pct: number; // change in annual yield by 2030
  panelTempPenaltyPct: number;
  hailFrequencyPerYear: number;
  droughtLoadDays: number;
  tone: 'agri' | 'pulse' | 'sun' | 'spark';
}

export const climateScenarios: ClimateScenario[] = [
  {
    id: 'current',
    label: 'Current climate',
    description: 'PVGIS TMY baseline · no climate adjustment',
    yieldDelta2030Pct: 0,
    panelTempPenaltyPct: 0,
    hailFrequencyPerYear: 0.8,
    droughtLoadDays: 12,
    tone: 'agri',
  },
  {
    id: 'rcp45',
    label: 'RCP 4.5 · moderate warming',
    description: '+1.8°C by 2050 · EU target-compliant trajectory',
    yieldDelta2030Pct: -1.2,
    panelTempPenaltyPct: 0.8,
    hailFrequencyPerYear: 1.2,
    droughtLoadDays: 18,
    tone: 'sun',
  },
  {
    id: 'rcp85',
    label: 'RCP 8.5 · high-emissions',
    description: '+3.7°C by 2100 · no-action scenario (stress test)',
    yieldDelta2030Pct: -2.8,
    panelTempPenaltyPct: 2.1,
    hailFrequencyPerYear: 2.1,
    droughtLoadDays: 32,
    tone: 'spark',
  },
];

export interface ForceMajeureEvent {
  id: string;
  label: string;
  probability: number; // 0..1 annual
  revenueLossPct: number; // % of annual revenue when event happens
  capitalLossEur: number; // one-time asset damage
  insurable: boolean;
  premiumPerYearEur: number;
  deductibleEur: number;
  tone: 'spark' | 'sun' | 'pulse' | 'signal';
}

export const forceMajeureEvents: ForceMajeureEvent[] = [
  {
    id: 'hail',
    label: 'Hail · panel damage',
    probability: 0.22, // 1 in ~4.5 years
    revenueLossPct: 3.5,
    capitalLossEur: 180_000,
    insurable: true,
    premiumPerYearEur: 38_000,
    deductibleEur: 50_000,
    tone: 'spark',
  },
  {
    id: 'flood',
    label: 'Flood · civil + electrical damage',
    probability: 0.04,
    revenueLossPct: 9.0,
    capitalLossEur: 420_000,
    insurable: true,
    premiumPerYearEur: 22_000,
    deductibleEur: 80_000,
    tone: 'signal',
  },
  {
    id: 'theft',
    label: 'Theft · panels + cabling',
    probability: 0.08,
    revenueLossPct: 1.5,
    capitalLossEur: 95_000,
    insurable: true,
    premiumPerYearEur: 18_000,
    deductibleEur: 15_000,
    tone: 'pulse',
  },
  {
    id: 'fire',
    label: 'Fire · inverter/battery event',
    probability: 0.012,
    revenueLossPct: 6.0,
    capitalLossEur: 310_000,
    insurable: true,
    premiumPerYearEur: 26_000,
    deductibleEur: 40_000,
    tone: 'spark',
  },
  {
    id: 'grid-fault',
    label: 'Grid fault · forced outage',
    probability: 0.15,
    revenueLossPct: 2.0,
    capitalLossEur: 0,
    insurable: false,
    premiumPerYearEur: 0,
    deductibleEur: 0,
    tone: 'sun',
  },
  {
    id: 'cyber',
    label: 'Cyber · SCADA compromise',
    probability: 0.03,
    revenueLossPct: 4.0,
    capitalLossEur: 80_000,
    insurable: true,
    premiumPerYearEur: 12_000,
    deductibleEur: 25_000,
    tone: 'pulse',
  },
];

export interface PoliticalRisk {
  id: string;
  label: string;
  description: string;
  defaultProbability: number; // 0..1
  irrImpactPp: number; // points of IRR if it hits
  mitigation: string;
  tone: 'pulse' | 'sun' | 'agri' | 'spark' | 'signal';
}

export const politicalRisks: PoliticalRisk[] = [
  {
    id: 'fzoeu-denied',
    label: 'FZOEU grant denied',
    description: 'OI-2026-03 application rejected or under-funded',
    defaultProbability: 0.15,
    irrImpactPp: -2.2,
    mitigation: 'HBOR Zeleni kredit fallback + next-cycle reapplication',
    tone: 'sun',
  },
  {
    id: 'npoo-denied',
    label: 'NPOO tranche denied',
    description: 'C1.2.R1-I1 allocation not awarded',
    defaultProbability: 0.20,
    irrImpactPp: -3.1,
    mitigation: 'Reapply to EU Innovation Fund · debt-heavy structure',
    tone: 'spark',
  },
  {
    id: 'ppa-failure',
    label: 'PPA counterparty default',
    description: 'HEP or third-party offtake fails · price exposed to spot',
    defaultProbability: 0.04,
    irrImpactPp: -2.8,
    mitigation: 'Parent guarantee · 10% holdback · 2nd offtaker standby',
    tone: 'signal',
  },
  {
    id: 'upu-delay',
    label: 'UPU amendment delay',
    description: 'Municipal spatial plan consultation slips past Q3 2026',
    defaultProbability: 0.30,
    irrImpactPp: -0.6,
    mitigation: 'Direct county-level engagement · dual-track permit filing',
    tone: 'pulse',
  },
  {
    id: 'land-reclassify',
    label: 'Land reclassification risk',
    description: 'Ministry re-examines agri-PV under new zoning rules',
    defaultProbability: 0.06,
    irrImpactPp: -4.5,
    mitigation: 'Active sheep grazing + HAPIH certification preserves status',
    tone: 'spark',
  },
  {
    id: 'curtailment',
    label: 'Curtailment above forecast',
    description: 'Zone curtailment >3%/yr before 2030',
    defaultProbability: 0.25,
    irrImpactPp: -1.4,
    mitigation: 'Battery dispatch + balancing market participation',
    tone: 'pulse',
  },
  {
    id: 'carbon-price',
    label: 'Carbon price collapse',
    description: 'ETS price drops below €45/t · CRCF revenue halves',
    defaultProbability: 0.10,
    irrImpactPp: -0.5,
    mitigation: 'CRCF not in base case · upside only',
    tone: 'agri',
  },
  {
    id: 'election',
    label: 'Government change · policy shift',
    description: 'Renewable Energy Act 2027 review delays subsidy cycles',
    defaultProbability: 0.12,
    irrImpactPp: -1.0,
    mitigation: 'EU-level NPOO commitments stable across elections',
    tone: 'sun',
  },
];

/* ---------------------------- Calculations ----------------------------- */

export function expectedLossPerYear(e: ForceMajeureEvent, annualRevenue: number, withInsurance: boolean): number {
  const grossLoss = e.probability * (annualRevenue * (e.revenueLossPct / 100) + e.capitalLossEur);
  if (!e.insurable || !withInsurance) return grossLoss;
  // Insurance pays gross loss minus deductible; premium is certain
  const claimablePerEvent = Math.max(0, annualRevenue * (e.revenueLossPct / 100) + e.capitalLossEur - e.deductibleEur);
  const insuredLoss = e.premiumPerYearEur + e.probability * (e.deductibleEur);
  return insuredLoss;
}

export function climateStressIrr(baseIrr: number, scenario: ClimateScenario): number {
  const delta = scenario.yieldDelta2030Pct * 0.15; // each 1% yield loss ≈ 0.15pp IRR
  const tempDelta = scenario.panelTempPenaltyPct * 0.08;
  return baseIrr + delta - tempDelta;
}

export function combinedIrr(
  baseIrr: number,
  climate: ClimateScenario,
  politicalProbs: Record<string, number>,
  forceMajeureCoverage: boolean,
  annualRevenue: number,
): { irr: number; breakdown: { id: string; label: string; deltaPp: number }[] } {
  let irr = climateStressIrr(baseIrr, climate);
  const breakdown: { id: string; label: string; deltaPp: number }[] = [
    {
      id: 'climate',
      label: climate.label,
      deltaPp: climateStressIrr(baseIrr, climate) - baseIrr,
    },
  ];

  // Political risks — prob-weighted contribution
  for (const r of politicalRisks) {
    const p = politicalProbs[r.id] ?? r.defaultProbability;
    const delta = p * r.irrImpactPp;
    irr += delta;
    breakdown.push({ id: r.id, label: r.label, deltaPp: delta });
  }

  // Force majeure: convert expected losses to IRR via revenue multiple
  let fmLoss = 0;
  for (const e of forceMajeureEvents) {
    fmLoss += expectedLossPerYear(e, annualRevenue, forceMajeureCoverage);
  }
  const fmDeltaPp = -(fmLoss / annualRevenue) * 0.8; // pp approximation
  irr += fmDeltaPp;
  breakdown.push({
    id: 'force-majeure',
    label: forceMajeureCoverage ? 'Force majeure · insured' : 'Force majeure · uninsured',
    deltaPp: fmDeltaPp,
  });

  return { irr, breakdown };
}
