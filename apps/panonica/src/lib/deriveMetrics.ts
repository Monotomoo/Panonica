/**
 * Shared derivation of investment metrics from a ConfigState.
 * Used by: Scenarios Lab, AI Assist, Sensitivity Tornado, Risk Center.
 *
 * All calculations are deterministic; same config in → same numbers out,
 * so A/B/C comparisons always reconcile.
 */

import { configs } from '@/mock/configs';
import {
  computeBom,
  inverterCatalog,
  panelCatalog,
  storageChemistries,
} from '@/mock/configDeep';
import type { ConfigState } from '@/store/configStore';
import type { ConfiguratorState } from '@/mock/configDeep';

export interface DerivedMetrics {
  capexEur: number;
  opexEur: number;
  revenueEur: number;
  ebitdaEur: number;
  yieldGWh: number;
  lcoeEurPerMWh: number;
  paybackYears: number;
  irrPct: number;
  npv25Eur: number;
  co2Tons: number;
  households: number;
  agriIncomeEur: number;
  landEfficiencyPct: number;
  agriMaintainedPct: number;
  exitEvEur: number;
  equityMom: number;
  performanceRatioPct: number;
  moduleCount: number;
  inverterCount: number;
  gearingPct: number;
}

export function deriveMetrics(live: ConfigState): DerivedMetrics {
  const base = configs[live.activeScenario];
  const k = live.capacityMW / base.installedMW;
  const trackingMul =
    live.tracking === '2-axis' ? 1.12 : live.tracking === '1-axis' ? 1.06 : 1;
  const batteryUplift = live.battery * 15_000;

  const opex = base.opex * Math.sqrt(k) + live.battery * 6_000;
  const yieldGWh = base.annualYieldGWh * k * trackingMul;
  const revenue = base.revenue * k * trackingMul + batteryUplift;
  const agriIncome =
    live.underPanel === 'none' ? 0 : base.agriIncome * (0.8 + live.rowSpacing / 20);
  const lcoe = Math.round(
    base.lcoeEurPerMWh * (1 + (live.rowSpacing - base.rowSpacing) * 0.015),
  );
  const payback = Math.max(
    4,
    base.payback * Math.sqrt(1 / (trackingMul * (1 + batteryUplift / Math.max(revenue, 1)))),
  );
  const irr = Math.min(18, base.irr * trackingMul * (1 + live.battery * 0.005));
  const co2 = base.co2Avoided * k * trackingMul;
  const households = Math.round(base.householdsPowered * k * trackingMul);
  const agriMaintained =
    live.underPanel === 'none' ? 0 : Math.min(0.9, 0.5 + live.rowSpacing / 18);
  const landEfficiency = base.landEfficiency;

  // BOM capex (deterministic from full state)
  const panel = panelCatalog.find((p) => p.id === live.panelId) ?? panelCatalog[0];
  const inverter = inverterCatalog.find((i) => i.id === live.inverterId) ?? inverterCatalog[0];
  const chem = storageChemistries.find((c) => c.id === live.batteryChem) ?? storageChemistries[0];
  const configState: ConfiguratorState = {
    capacityMW: live.capacityMW,
    dcAcRatio: live.dcAcRatio,
    batteryMWh: live.battery,
    batteryChem: live.batteryChem,
    mvKv: live.mvKv,
    gcr: live.gcr,
    fenceHeightM: live.fenceHeightM,
    cctvCount: live.cctvCount,
    tracking: live.tracking,
    underPanel: live.underPanel,
    panelHeightM: live.panelHeight,
    rowSpacingM: live.rowSpacing,
  };
  const bom = computeBom(configState, panel, inverter, chem);

  // NPV25 = -CAPEX + sum over 25 years of annual revenue - annual opex, discounted 8%
  let npv25 = -bom.total;
  for (let y = 1; y <= 25; y++) {
    const cf = revenue * Math.pow(1.02, y - 1) - opex * Math.pow(1.02, y - 1);
    npv25 += cf / Math.pow(1.08, y);
  }

  // Exit EV (simplified): stabilized EBITDA y10 / 6.5% cap
  const ebitdaY10 = (revenue - opex) * Math.pow(1.02, 9) * Math.pow(0.995, 9);
  const exitEv = ebitdaY10 / 0.065;

  // Equity MoM: equity at exit / equity invested, with 25% min sponsor equity
  const equityIn = Math.max(bom.total * 0.25, 0);
  const residualDebt = (bom.total - equityIn) * 0.33; // approx y10 balance on 15yr
  const equityAtExit = exitEv - residualDebt;
  const cumulativeDistY10 = (revenue - opex) * 4; // rough
  const mom = equityIn > 0 ? (equityAtExit + cumulativeDistY10) / equityIn : 0;

  // Gearing: debt / total capex
  const gearing = 1 - equityIn / bom.total;

  // Performance ratio (simplified; full model in solarDeep.ts)
  const pr = 0.843;

  const ebitda = revenue - opex;

  return {
    capexEur: bom.total,
    opexEur: opex,
    revenueEur: revenue,
    ebitdaEur: ebitda,
    yieldGWh,
    lcoeEurPerMWh: lcoe,
    paybackYears: payback,
    irrPct: irr,
    npv25Eur: npv25,
    co2Tons: co2,
    households,
    agriIncomeEur: agriIncome,
    landEfficiencyPct: landEfficiency * 100,
    agriMaintainedPct: agriMaintained * 100,
    exitEvEur: exitEv,
    equityMom: mom,
    performanceRatioPct: pr * 100,
    moduleCount: bom.moduleCount,
    inverterCount: bom.inverterCount,
    gearingPct: gearing * 100,
  };
}

export const metricLabels: Record<keyof DerivedMetrics, { label: string; unit: string; format: (v: number) => string; betterHigher: boolean | null; tone: 'pulse' | 'sun' | 'agri' | 'signal' | 'spark' }> = {
  capexEur: { label: 'CAPEX · total', unit: '€', format: (v) => `€${(v / 1_000_000).toFixed(2)}M`, betterHigher: false, tone: 'sun' },
  opexEur: { label: 'OPEX · annual', unit: '€', format: (v) => `€${(v / 1000).toFixed(0)}k`, betterHigher: false, tone: 'spark' },
  revenueEur: { label: 'Revenue · annual', unit: '€', format: (v) => `€${(v / 1_000_000).toFixed(2)}M`, betterHigher: true, tone: 'agri' },
  ebitdaEur: { label: 'EBITDA · annual', unit: '€', format: (v) => `€${(v / 1_000_000).toFixed(2)}M`, betterHigher: true, tone: 'agri' },
  yieldGWh: { label: 'Annual yield', unit: 'GWh', format: (v) => `${v.toFixed(1)} GWh`, betterHigher: true, tone: 'pulse' },
  lcoeEurPerMWh: { label: 'LCOE', unit: '€/MWh', format: (v) => `€${v}/MWh`, betterHigher: false, tone: 'signal' },
  paybackYears: { label: 'Payback', unit: 'yr', format: (v) => `${v.toFixed(1)} yr`, betterHigher: false, tone: 'pulse' },
  irrPct: { label: 'IRR · equity', unit: '%', format: (v) => `${v.toFixed(1)}%`, betterHigher: true, tone: 'agri' },
  npv25Eur: { label: 'NPV · 25 yr @ 8%', unit: '€', format: (v) => `€${(v / 1_000_000).toFixed(1)}M`, betterHigher: true, tone: 'agri' },
  co2Tons: { label: 'CO₂ avoided', unit: 't/yr', format: (v) => `${Math.round(v).toLocaleString()} t/yr`, betterHigher: true, tone: 'agri' },
  households: { label: 'Households powered', unit: '', format: (v) => v.toLocaleString(), betterHigher: true, tone: 'pulse' },
  agriIncomeEur: { label: 'Agri income', unit: '€', format: (v) => v === 0 ? '—' : `€${(v / 1000).toFixed(0)}k`, betterHigher: true, tone: 'agri' },
  landEfficiencyPct: { label: 'Land efficiency', unit: '%', format: (v) => `${v.toFixed(0)}%`, betterHigher: true, tone: 'pulse' },
  agriMaintainedPct: { label: 'Agri maintained', unit: '%', format: (v) => v === 0 ? '—' : `${v.toFixed(0)}%`, betterHigher: true, tone: 'agri' },
  exitEvEur: { label: 'Exit EV · y10', unit: '€', format: (v) => `€${(v / 1_000_000).toFixed(1)}M`, betterHigher: true, tone: 'sun' },
  equityMom: { label: 'Equity MoM', unit: '×', format: (v) => `${v.toFixed(2)}×`, betterHigher: true, tone: 'sun' },
  performanceRatioPct: { label: 'Performance ratio', unit: '%', format: (v) => `${v.toFixed(1)}%`, betterHigher: true, tone: 'pulse' },
  moduleCount: { label: 'Module count', unit: '', format: (v) => v.toLocaleString(), betterHigher: null, tone: 'pulse' },
  inverterCount: { label: 'Inverter count', unit: '', format: (v) => v.toLocaleString(), betterHigher: null, tone: 'signal' },
  gearingPct: { label: 'Gearing · debt/capex', unit: '%', format: (v) => `${v.toFixed(0)}%`, betterHigher: null, tone: 'pulse' },
};
