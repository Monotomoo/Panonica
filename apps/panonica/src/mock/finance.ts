/**
 * Finance workbook data + helpers.
 * Built around the Configurator's live scenario state but self-contained so the
 * Finance screen can render without depending on configurator state.
 *
 * All numbers reconcile with Ribić Breg benchmark (€700k/MW capex, €90/MWh PPA,
 * 25-year tenor, 0.5 MW/ha density) scaled to 30 MW on 80.3 ha Kopanica-Beravci.
 */

export interface RevenueStream {
  label: string;
  annualEur: number;
  tone: 'pulse' | 'agri' | 'sun' | 'signal';
  note: string;
}

export const revenueStack: RevenueStream[] = [
  {
    label: 'Electricity PPA',
    annualEur: 3_933_000,
    tone: 'pulse',
    note: '30 MW × 1,380 kWh/kWp × €95/MWh',
  },
  {
    label: 'Guarantees of Origin',
    annualEur: 124_200,
    tone: 'signal',
    note: '41,400 MWh × €3/MWh · Croatian HROTE registry',
  },
  {
    label: 'Capacity Market',
    annualEur: 96_000,
    tone: 'sun',
    note: '30 MW × €3.2k/MW·yr · post-2027 ancillary',
  },
  {
    label: 'Grazing Lease',
    annualEur: 42_000,
    tone: 'agri',
    note: '~1,100 sheep @ €38/head/yr · Slavonian AGV cooperative',
  },
];

export interface OpexLine {
  label: string;
  annualEur: number;
  pctOfRevenue: number;
  note: string;
}

export const opexLines: OpexLine[] = [
  { label: 'O&M · panels + inverters', annualEur: 210_000, pctOfRevenue: 5.1, note: '€7k/MW/yr baseline' },
  { label: 'Insurance', annualEur: 84_000, pctOfRevenue: 2.0, note: 'Property + revenue loss' },
  { label: 'Grid fees (HOPS)', annualEur: 66_000, pctOfRevenue: 1.6, note: 'Transmission access' },
  { label: 'Land & security', annualEur: 48_000, pctOfRevenue: 1.2, note: 'Lease / fencing / CCTV' },
  { label: 'SPV admin + audit', annualEur: 35_000, pctOfRevenue: 0.8, note: 'Legal, accounting, reporting' },
  { label: 'Repowering reserve', annualEur: 110_000, pctOfRevenue: 2.7, note: 'Y11+ inverter replacement sinking fund' },
];

export const capexBreakdown = [
  { label: 'Modules', eur: 9_600_000, pct: 45.7, note: '30 MW · €320/kWp · tier-1 Chinese' },
  { label: 'Inverters + BOS', eur: 4_100_000, pct: 19.5, note: 'String inverters + DC cabling' },
  { label: 'Mounting + tracking', eur: 2_400_000, pct: 11.4, note: 'Fixed tilt, AGV-compatible' },
  { label: 'Civil + grid connection', eur: 3_100_000, pct: 14.8, note: '18.4 km cable to TS Slavonski Brod 1' },
  { label: 'Dev fees + permits', eur: 1_200_000, pct: 5.7, note: 'UPU + environmental + grid studies' },
  { label: 'Battery storage (optional)', eur: 600_000, pct: 2.9, note: '8 MWh LFP · demo toggled off' },
];

export const capexTotal = capexBreakdown.reduce((a, l) => a + l.eur, 0);
export const opexTotal = opexLines.reduce((a, l) => a + l.annualEur, 0);
export const revenueTotal = revenueStack.reduce((a, l) => a + l.annualEur, 0);

/* ------------------------------ SENSITIVITY ------------------------------- */

export const sensitivityAxes = {
  pricePerMWh: [60, 70, 80, 90, 100, 110, 120, 130, 140], // €/MWh
  yieldKwhPerKwp: [1200, 1250, 1300, 1350, 1400, 1450, 1500], // kWh/kWp
};

// Current operating point: €95/MWh, 1,380 kWh/kWp
export const sensitivityOperating = {
  price: 95,
  yield: 1380,
  irr: 11.4,
};

export function sensitivityIrr(price: number, yieldKwh: number): number {
  // Linear approx around operating point: d(IRR)/d(price) = 0.22, d(IRR)/d(yield) = 0.019
  const base = 11.4;
  const dPrice = (price - 95) * 0.22;
  const dYield = (yieldKwh - 1380) * 0.019;
  return Math.max(0, base + dPrice + dYield);
}

/* ------------------------------ MONTE CARLO ------------------------------- */

export const monteCarloSeed = {
  runs: 1000,
  priceMean: 95,
  priceStd: 14,
  yieldMean: 1380,
  yieldStd: 65,
  capexDeltaStd: 0.045, // ±4.5% capex uncertainty
  opexDeltaStd: 0.08, // ±8% opex uncertainty
  degradationYearlyMean: 0.005, // 0.5%/yr
  degradationYearlyStd: 0.002,
};

/* --------------------------------- DEBT ----------------------------------- */

export const debtParams = {
  dscrMin: 1.1,
  dscrMax: 1.6,
  dscrDefault: 1.3,
  tenorOptions: [10, 12, 15, 18] as const,
  tenorDefault: 15,
  ratePerAnnum: 0.0475, // SOFR + 200bps · green project finance standard
  sponsorEquityMinPct: 0.25,
  totalCapex: capexTotal,
};

// Given DSCR target, tenor, and annual EBITDA → max debt (capital recovery factor)
export function maxDebtSize(ebitda: number, dscr: number, tenorYears: number, rate = debtParams.ratePerAnnum) {
  const annualDebtService = ebitda / dscr;
  // Max principal from annuity formula: P = A × (1 - (1+r)^-n) / r
  const maxPrincipal = annualDebtService * (1 - Math.pow(1 + rate, -tenorYears)) / rate;
  return {
    maxDebt: maxPrincipal,
    debtService: annualDebtService,
    gearing: maxPrincipal / debtParams.totalCapex,
    equityIn: Math.max(debtParams.totalCapex * debtParams.sponsorEquityMinPct, debtParams.totalCapex - maxPrincipal),
  };
}

/* ----------------------------- COMPARABLES -------------------------------- */

export interface Comparable {
  name: string;
  operator: string;
  region: string;
  capacityMW: number;
  areaHa: number;
  capexPerMW: number; // €
  yieldKwhPerKwp: number;
  status: 'operational' | 'construction' | 'permit' | 'queue';
  irrEquity: number;
  distanceKm: number; // distance to Kopanica-Beravci
  isBeravci?: boolean;
}

export const comparables: Comparable[] = [
  {
    name: 'Ribić Breg',
    operator: 'Solida d.o.o.',
    region: 'Bjelovar-Bilogora',
    capacityMW: 30,
    areaHa: 60,
    capexPerMW: 700_000,
    yieldKwhPerKwp: 1310,
    status: 'operational',
    irrEquity: 11.4,
    distanceKm: 125,
  },
  {
    name: 'Obrovac SE',
    operator: 'Končar Obnovljivi izvori',
    region: 'Zadar',
    capacityMW: 28,
    areaHa: 55,
    capexPerMW: 745_000,
    yieldKwhPerKwp: 1440,
    status: 'operational',
    irrEquity: 10.8,
    distanceKm: 445,
  },
  {
    name: 'Donji Miholjac AGV',
    operator: 'Enerkon d.o.o.',
    region: 'Osijek-Baranja',
    capacityMW: 18,
    areaHa: 38,
    capexPerMW: 720_000,
    yieldKwhPerKwp: 1370,
    status: 'construction',
    irrEquity: 12.1,
    distanceKm: 72,
  },
  {
    name: 'Petrinja SE',
    operator: 'HEP OIE',
    region: 'Sisak-Moslavina',
    capacityMW: 9,
    areaHa: 22,
    capexPerMW: 780_000,
    yieldKwhPerKwp: 1335,
    status: 'permit',
    irrEquity: 9.6,
    distanceKm: 220,
  },
  {
    name: 'Vukovar Utility',
    operator: 'Brodmerkur Green',
    region: 'Vukovar-Srijem',
    capacityMW: 45,
    areaHa: 90,
    capexPerMW: 695_000,
    yieldKwhPerKwp: 1385,
    status: 'queue',
    irrEquity: 11.8,
    distanceKm: 58,
  },
  {
    name: 'Marof AGV',
    operator: 'Solida d.o.o.',
    region: 'Međimurje',
    capacityMW: 12,
    areaHa: 28,
    capexPerMW: 735_000,
    yieldKwhPerKwp: 1295,
    status: 'operational',
    irrEquity: 10.4,
    distanceKm: 215,
  },
  {
    name: 'Kopanica-Beravci · Paladina',
    operator: 'Paladina Investments',
    region: 'Brodsko-Posavska',
    capacityMW: 30,
    areaHa: 80.3,
    capexPerMW: 700_000,
    yieldKwhPerKwp: 1380,
    status: 'permit',
    irrEquity: 11.4,
    distanceKm: 0,
    isBeravci: true,
  },
];

/* ====================== EXTENDED MARKET RADAR POOL ======================
 * 11 additional Pannonian solar projects (real-ish operators, fictional specifics)
 * competing for the same HOPS queue allocations + FZOEU + NPOO funding in 2026-27.
 * Powers /market route · bubble chart, FZOEU pie, strategic radar.
 * ======================================================================= */

export const marketRadarExtra: Comparable[] = [
  {
    name: 'Slatina Agri-PV',
    operator: 'Solventus Energija',
    region: 'Virovitica-Podravina',
    capacityMW: 22,
    areaHa: 48,
    capexPerMW: 740_000,
    yieldKwhPerKwp: 1355,
    status: 'queue',
    irrEquity: 10.9,
    distanceKm: 104,
  },
  {
    name: 'Požega West',
    operator: 'Econerg d.o.o.',
    region: 'Požega-Slavonia',
    capacityMW: 16,
    areaHa: 35,
    capexPerMW: 760_000,
    yieldKwhPerKwp: 1365,
    status: 'permit',
    irrEquity: 10.2,
    distanceKm: 68,
  },
  {
    name: 'Đakovo South',
    operator: 'Green Pannonia Ltd',
    region: 'Osijek-Baranja',
    capacityMW: 35,
    areaHa: 72,
    capexPerMW: 715_000,
    yieldKwhPerKwp: 1375,
    status: 'queue',
    irrEquity: 11.2,
    distanceKm: 45,
  },
  {
    name: 'Nova Gradiška SE',
    operator: 'HEP OIE',
    region: 'Brodsko-Posavska',
    capacityMW: 14,
    areaHa: 32,
    capexPerMW: 755_000,
    yieldKwhPerKwp: 1378,
    status: 'construction',
    irrEquity: 10.1,
    distanceKm: 22,
  },
  {
    name: 'Bizovac Solar',
    operator: 'Enerkon d.o.o.',
    region: 'Osijek-Baranja',
    capacityMW: 20,
    areaHa: 44,
    capexPerMW: 725_000,
    yieldKwhPerKwp: 1382,
    status: 'permit',
    irrEquity: 11.0,
    distanceKm: 62,
  },
  {
    name: 'Ilok Border-PV',
    operator: 'Končar Obnovljivi izvori',
    region: 'Vukovar-Srijem',
    capacityMW: 50,
    areaHa: 108,
    capexPerMW: 685_000,
    yieldKwhPerKwp: 1392,
    status: 'queue',
    irrEquity: 12.4,
    distanceKm: 125,
  },
  {
    name: 'Vinkovci Agri',
    operator: 'Vetroelektrane Sava',
    region: 'Vukovar-Srijem',
    capacityMW: 26,
    areaHa: 58,
    capexPerMW: 730_000,
    yieldKwhPerKwp: 1370,
    status: 'permit',
    irrEquity: 10.7,
    distanceKm: 88,
  },
  {
    name: 'Valpovo West',
    operator: 'Solventus Energija',
    region: 'Osijek-Baranja',
    capacityMW: 11,
    areaHa: 26,
    capexPerMW: 790_000,
    yieldKwhPerKwp: 1360,
    status: 'queue',
    irrEquity: 9.2,
    distanceKm: 74,
  },
  {
    name: 'Orahovica Solar',
    operator: 'Econerg d.o.o.',
    region: 'Virovitica-Podravina',
    capacityMW: 18,
    areaHa: 41,
    capexPerMW: 750_000,
    yieldKwhPerKwp: 1358,
    status: 'construction',
    irrEquity: 10.5,
    distanceKm: 118,
  },
  {
    name: 'Županja Border',
    operator: 'Brodmerkur Green',
    region: 'Vukovar-Srijem',
    capacityMW: 38,
    areaHa: 82,
    capexPerMW: 705_000,
    yieldKwhPerKwp: 1388,
    status: 'queue',
    irrEquity: 11.9,
    distanceKm: 40,
  },
  {
    name: 'Pakrac Hill PV',
    operator: 'HEP OIE',
    region: 'Požega-Slavonia',
    capacityMW: 9,
    areaHa: 20,
    capexPerMW: 810_000,
    yieldKwhPerKwp: 1340,
    status: 'permit',
    irrEquity: 8.7,
    distanceKm: 95,
  },
];

export const allPannonianProjects: Comparable[] = [...comparables, ...marketRadarExtra];

/* ============================ MARKET METRICS ============================ */

export interface MarketAxisScore {
  axis: string;
  kopanicaBeravci: number;   // 0..10
  marketAvg: number;
  note: string;
}

export const strategicRadar: MarketAxisScore[] = [
  { axis: 'grid access', kopanicaBeravci: 9.2, marketAvg: 6.5, note: 'HOPS queue #14 · TS Slav. Brod 1 22.8 km · HV on-site' },
  { axis: 'on-site infra', kopanicaBeravci: 9.6, marketAvg: 5.1, note: 'HV line + gas pipeline at parcel · no CAPEX cable run' },
  { axis: 'scale', kopanicaBeravci: 7.3, marketAvg: 6.2, note: '30 MW Phase 1 + 40 MW Phase 2 optionality on 80.3 ha' },
  { axis: 'operator exp', kopanicaBeravci: 6.0, marketAvg: 7.4, note: 'First project · co-op with Solida + Končar as EPC partners' },
  { axis: 'fund eligibility', kopanicaBeravci: 8.7, marketAvg: 7.1, note: 'FZOEU 85% match · NPOO green transition · HBOR Zeleni' },
  { axis: 'agri-PV bonus', kopanicaBeravci: 9.4, marketAvg: 4.8, note: 'Dalmatian Pramenka · CAP Pillar 2 ecoscheme · EIP-AGRI' },
  { axis: 'transport', kopanicaBeravci: 9.8, marketAvg: 5.8, note: 'A3 exit 0.3 km · D7 border · rail 0.7 km · Sava 2.5 km · BiH 11 km' },
  { axis: 'export optionality', kopanicaBeravci: 8.1, marketAvg: 3.2, note: 'BiH market 11 km · HUPX·BOR coupling · €380k/yr export upside' },
];

export const fzoeuPool = {
  totalEur: 42_000_000,       // FZOEU call OI-2026-03 pool
  applicants: 18,              // including Kopanica-Beravci
  maxPerApplicantEur: 2_500_000,
  kopanicaBeravciBidEur: 4_200_000, // capped at 20% of €21M CAPEX
  expectedAwardRatio: 0.35,    // estimated success probability
  deadline: '2026-07-15',
};

/* -------------------------------- EXIT ------------------------------------ */

export const exitAssumptions = {
  yearOfExit: 10,
  capRateMin: 0.045,
  capRateMax: 0.08,
  capRateDefault: 0.065,
  year10Ebitda: 2_820_000, // forward-looking Y11-Y25 stabilized
  equityInvested: 5_250_000, // at 75% gearing default
  cumulativeDistributionsY1to10: 4_200_000,
  kupariStakePaper: 3_200_000, // his 10%
  igHDebtOverhang: 21_500_000, // historical IGH bond exposure
};

export function exitEv(capRate: number, ebitda = exitAssumptions.year10Ebitda) {
  return ebitda / capRate;
}

export function equityMom(capRate: number) {
  const ev = exitEv(capRate);
  const residualDebt = 6_800_000; // Y10 outstanding debt on 15yr tenor
  const equityAtExit = ev - residualDebt;
  return (equityAtExit + exitAssumptions.cumulativeDistributionsY1to10) / exitAssumptions.equityInvested;
}
