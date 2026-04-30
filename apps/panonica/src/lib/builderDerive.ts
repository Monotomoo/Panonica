/**
 * Live BoM + Finance derivation from the full Builder state.
 * Richer than computeBom in configDeep — uses every technical input.
 */

import type { ProjectState } from '@/store/projectStore';

export interface BuilderBomLine {
  section: string;
  label: string;
  qty: string;
  unitEur: number;
  totalEur: number;
  note?: string;
}

export interface BuilderBomResult {
  lines: BuilderBomLine[];
  capexTotal: number;
  byCategory: Record<string, number>;
  capexPerKw: number;
  moduleCount: number;
  inverterCount: number;
  areaHa: number;
}

const CATEGORIES = [
  'modules',
  'inverters',
  'mounting',
  'dc',
  'ac',
  'transformers',
  'grid',
  'storage',
  'civil',
  'security',
  'scada',
  'soft',
] as const;

export function deriveBuilderBom(s: ProjectState): BuilderBomResult {
  const lines: BuilderBomLine[] = [];
  const byCategory: Record<string, number> = {};

  const capacityKw = s.generation.capacityDcKw;
  const moduleCount = s.generation.moduleCountTarget || (capacityKw / s.generation.moduleWp) * 1000;
  const areaHa = s.site.areaHa || 80.3;
  const inverterCount = s.powerElectronics.inverterCount;

  const push = (section: string, label: string, qty: string, unitEur: number, totalEur: number, note?: string) => {
    lines.push({ section, label, qty, unitEur, totalEur, note });
    byCategory[section] = (byCategory[section] || 0) + totalEur;
  };

  // Modules
  const modulePriceEur = s.generation.moduleWp * 0.188; // €0.188/Wp typical
  const moduleTotal = moduleCount * modulePriceEur;
  push('modules', `${s.generation.moduleMake} ${s.generation.moduleModel}`,
    `${Math.round(moduleCount).toLocaleString()} × ${s.generation.moduleWp} Wp`,
    modulePriceEur, moduleTotal,
    `${s.generation.moduleEfficiencyPct}% η${s.generation.moduleBifacial ? ' · bifacial' : ''}`);

  // Inverters
  const inverterUnitPrice = s.powerElectronics.inverterKw * 34;
  const inverterTotal = inverterCount * inverterUnitPrice;
  push('inverters', `${s.powerElectronics.inverterMake} ${s.powerElectronics.inverterModel}`,
    `${inverterCount} × ${s.powerElectronics.inverterKw} kW`,
    inverterUnitPrice, inverterTotal,
    s.powerElectronics.inverterTopology);

  // Mounting
  const mountingTotal = capacityKw * 1000 * 0.058 *
    (s.generation.tilt === 'fixed' ? 1 : s.generation.tilt === '1-axis' ? 1.7 : 3.3);
  push('mounting', `${s.generation.tilt} mounting + foundation`,
    `${capacityKw.toLocaleString()} kW structure · ${s.generation.foundation}`,
    0, mountingTotal,
    `tilt ${s.generation.tiltDeg}° · pile ${s.generation.pileLengthM}m`);

  // DC cabling
  const dcTotal = moduleCount * 0.5 * s.powerElectronics.dcCableMm2 * 2.4;
  push('dc', `DC cabling ${s.powerElectronics.dcCableMm2} mm²`,
    `avg ${s.powerElectronics.dcCableLengthAvgM}m/string`,
    0, dcTotal);

  // AC collection
  const acLengthKm = s.powerElectronics.acCableLengthAvgM * inverterCount / 1000;
  const acPricePerKm = s.powerElectronics.acCableMaterial === 'copper' ? 72_000 : 48_000;
  const acTotal = acLengthKm * acPricePerKm;
  push('ac', `AC collection ${s.powerElectronics.acCableMm2} mm² ${s.powerElectronics.acCableMaterial}`,
    `${acLengthKm.toFixed(1)} km @ ${s.powerElectronics.acCollectionVoltageV}V`,
    0, acTotal);

  // Transformers
  const transformerTotal = s.powerElectronics.transformerCount *
    s.powerElectronics.transformerKva * 24;
  push('transformers', `Step-up ${s.powerElectronics.transformerKva} kVA ${s.powerElectronics.transformerVectorGroup}`,
    `${s.powerElectronics.transformerCount} units`,
    s.powerElectronics.transformerKva * 24, transformerTotal);

  // Grid connection (MV cable + switchgear)
  const gridCableTotal = s.gridConnection.pccDistanceKm * 1000 *
    (s.gridConnection.cableMaterial === 'copper' ? 240 : 150);
  push('grid', `${s.gridConnection.cableCrossSectionMm2} mm² ${s.gridConnection.cableMaterial} MV cable`,
    `${s.gridConnection.pccDistanceKm} km @ ${s.gridConnection.pccVoltageKv} kV`,
    0, gridCableTotal);

  const switchgearTotal = 240_000;
  push('grid', `MV switchgear + protection + metering`,
    `${s.gridConnection.mvSwitchgearMake}`,
    0, switchgearTotal,
    `earthing ${s.gridConnection.earthingScheme} · class ${s.gridConnection.meteringClass}`);

  // Storage
  let storageTotal = 0;
  if (s.storage.enabled && s.storage.energyMwh > 0) {
    const pricePerKwh = s.storage.chemistry === 'lfp' ? 280
      : s.storage.chemistry === 'nmc' ? 310
      : s.storage.chemistry === 'flow' ? 520
      : s.storage.chemistry === 'sodium-ion' ? 210
      : 180;
    storageTotal = s.storage.energyMwh * 1000 * pricePerKwh;
    push('storage', `${s.storage.chemistry.toUpperCase()} battery system`,
      `${s.storage.energyMwh} MWh / ${s.storage.powerMw} MW`,
      pricePerKwh, storageTotal,
      `${s.storage.thermalManagement} · ${s.storage.fireSuppressionSystem}`);
  }

  // Civil
  const civilTotal = capacityKw * 95 + // €95/kW base
    s.civilBos.sitePrepCutM3 * 8 +
    s.civilBos.drainageLengthM * 45 +
    s.civilBos.internalRoadsLengthM * 42 +
    s.civilBos.omBuildingAreaM2 * 1100;
  push('civil', `Civil works · grading · roads · drainage · O&M building`,
    `${s.civilBos.sitePrepCutM3.toLocaleString()} m³ cut · ${s.civilBos.internalRoadsLengthM} m roads`,
    0, civilTotal);

  // Security
  const securityTotal = s.civilBos.fencePerimeterM * 62 * s.civilBos.fenceHeightM +
    s.civilBos.cctvCount * 4_200 +
    s.civilBos.cctvThermalCount * 8_400 +
    s.civilBos.motionSensorsCount * 380;
  push('security', `Fencing + CCTV + sensors + lighting`,
    `${s.civilBos.fencePerimeterM} m fence · ${s.civilBos.fenceHeightM}m tall`,
    0, securityTotal,
    `${s.civilBos.cctvCount} CCTV · ${s.civilBos.cctvThermalCount} thermal`);

  // SCADA
  const scadaTotal = 180_000 + capacityKw * 8;
  push('scada', `SCADA master + comms + HMI + cyber hardening`,
    `${s.scada.scadaProtocol} · ${s.scada.commsBackbone}`,
    0, scadaTotal);

  // Soft costs
  const hardCost = Object.values(byCategory).reduce((a, b) => a + b, 0);
  const devFees = hardCost * 0.055;
  push('soft', 'Development fees + permits + studies',
    '5.5% of hard cost',
    0, devFees);

  const contingency = hardCost * (s.finance.contingencyPctCapex / 100);
  push('soft', `EPC contingency (${s.finance.contingencyPctCapex}%)`,
    'overrun reserve',
    0, contingency);

  const capexTotal = lines.reduce((a, l) => a + l.totalEur, 0);

  return {
    lines,
    capexTotal,
    byCategory,
    capexPerKw: capacityKw > 0 ? capexTotal / capacityKw : 0,
    moduleCount: Math.round(moduleCount),
    inverterCount,
    areaHa,
  };
}

/* ============================== FINANCE =============================== */

export interface BuilderFinanceResult {
  annualRevenueEur: number;
  annualOpexEur: number;
  annualEbitdaEur: number;
  y1CashflowEur: number;
  paybackYears: number;
  irrPct: number;
  dscrY1: number;
  npv25Eur: number;
  exitEvEur: number;
  equityMom: number;
  capacityFactor: number;
  annualYieldGwh: number;
  capexEur: number;
  equityInEur: number;
  annualDebtServiceEur: number;
}

export function deriveBuilderFinance(s: ProjectState, bom: BuilderBomResult): BuilderFinanceResult {
  // Annual yield
  const ghi = s.climate.ghiKwhM2Yr;
  const tiltFactor = s.generation.tilt === 'fixed' ? 1.05 : s.generation.tilt === '1-axis' ? 1.12 : 1.18;
  const prGross = 0.86;
  const soilingFactor = 1 - (s.climate.soilingLossPctYr / 100);
  const bifacialGain = s.generation.moduleBifacial ? 1 + (s.generation.moduleBifacialGainPct / 100) : 1;
  const specificYieldKwhPerKwp = ghi * tiltFactor * prGross * soilingFactor * bifacialGain;
  // capacityDcKw is in kWp; specificYield in kWh/kWp/yr → multiply to get kWh/yr
  const annualYieldKwh = s.generation.capacityDcKw * specificYieldKwhPerKwp;
  const annualYieldGwh = annualYieldKwh / 1_000_000;

  // Revenue
  const electricityRev = annualYieldKwh * (s.finance.ppaPriceEurMwh / 1000);
  const gooRev = annualYieldKwh * (s.finance.guaranteesOfOriginRevenueEurMwh / 1000);
  const capacityRev = (s.generation.capacityDcKw / 1000) * s.finance.capacityMarketRevenueEurMwYr;
  const agriRev = s.agriculture.annualAgriRevenueEur + s.agriculture.annualCapPaymentsEur;
  const annualRevenueEur = electricityRev + gooRev + capacityRev + agriRev;

  // OpEx
  const omCost = (s.generation.capacityDcKw / 1000) * 9200;
  const insurance = s.finance.insuranceAnnualEur;
  const landLease = s.site.areaHa * 800;
  const audits = 35_000;
  const repowering = bom.capexTotal * 0.003;
  const annualOpexEur = omCost + insurance + landLease + audits + repowering;

  const ebitda = annualRevenueEur - annualOpexEur;

  // Debt
  const capexTotal = bom.capexTotal;
  const seniorDebt = capexTotal * (s.finance.senior_debtPct / 100);
  const mezzDebt = capexTotal * (s.finance.mezzanine_debtPct / 100);
  const equityIn = capexTotal * (s.finance.sponsorEquityPct / 100);

  // Annuity-style debt service
  const seniorRate = s.finance.senior_ratePct / 100;
  const seniorDs = seniorDebt *
    (seniorRate / (1 - Math.pow(1 + seniorRate, -s.finance.senior_tenorYears)));
  const mezzRate = s.finance.mezzanine_ratePct / 100;
  const mezzDs = mezzDebt > 0
    ? mezzDebt * (mezzRate / (1 - Math.pow(1 + mezzRate, -10)))
    : 0;
  const annualDebtServiceEur = seniorDs + mezzDs;

  const dscrY1 = annualDebtServiceEur > 0 ? ebitda / annualDebtServiceEur : 999;

  const taxable = ebitda - annualDebtServiceEur;
  const tax = Math.max(0, taxable) * (s.finance.corporateTaxRatePct / 100);
  const y1Cashflow = ebitda - annualDebtServiceEur - tax;

  // NPV over 25 years
  const disc = s.finance.discountRatePct / 100;
  const infl = s.finance.inflationRatePct / 100;
  const degr = (s.generation.moduleAnnualDegradationPct) / 100;
  let npv = -capexTotal;
  for (let y = 1; y <= 25; y++) {
    const rev = annualRevenueEur * Math.pow(1 - degr, y - 1) * Math.pow(1 + infl, y - 1);
    const op = annualOpexEur * Math.pow(1 + infl, y - 1);
    const cf = rev - op;
    npv += cf / Math.pow(1 + disc, y);
  }

  // Payback
  let cum = -capexTotal;
  let payback = 25;
  for (let y = 1; y <= 25; y++) {
    const rev = annualRevenueEur * Math.pow(1 - degr, y - 1);
    const op = annualOpexEur;
    cum += (rev - op);
    if (cum >= 0) { payback = y; break; }
  }

  // IRR approximation (unlevered)
  const irrPct = solveIrr(annualRevenueEur, annualOpexEur, capexTotal, degr);

  // Exit (year 10 EBITDA / capRate)
  const ebitdaY10 = (annualRevenueEur * Math.pow(1 - degr, 9) * Math.pow(1 + infl, 9)) -
    (annualOpexEur * Math.pow(1 + infl, 9));
  const exitEv = ebitdaY10 / (s.finance.exitCapRatePct / 100);

  // Equity MoM (rough)
  const residualDebt = seniorDebt * 0.33;
  const cumulativeDistY10 = y1Cashflow * 4;
  const equityAtExit = exitEv - residualDebt;
  const mom = equityIn > 0 ? (equityAtExit + cumulativeDistY10) / equityIn : 0;

  // Capacity factor
  const capacityFactor = annualYieldKwh / (s.generation.capacityDcKw * 8760);

  return {
    annualRevenueEur,
    annualOpexEur,
    annualEbitdaEur: ebitda,
    y1CashflowEur: y1Cashflow,
    paybackYears: payback,
    irrPct,
    dscrY1,
    npv25Eur: npv,
    exitEvEur: exitEv,
    equityMom: mom,
    capacityFactor,
    annualYieldGwh,
    capexEur: capexTotal,
    equityInEur: equityIn,
    annualDebtServiceEur,
  };
}

function solveIrr(rev: number, opex: number, capex: number, degr: number): number {
  let lo = 0;
  let hi = 0.35;
  for (let i = 0; i < 28; i++) {
    const mid = (lo + hi) / 2;
    let npv = -capex;
    for (let y = 1; y <= 25; y++) {
      const cf = (rev * Math.pow(1 - degr, y - 1)) - opex;
      npv += cf / Math.pow(1 + mid, y);
    }
    if (npv > 0) lo = mid;
    else hi = mid;
  }
  return ((lo + hi) / 2) * 100;
}
