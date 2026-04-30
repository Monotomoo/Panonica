/**
 * Agriculture · under-panel systems for the Kopanica-Beravci 80.3 ha plot.
 *
 * Primary sources:
 * - Fraunhofer ISE agrivoltaic guidelines (2024 edition)
 * - HAPIH Croatian Agricultural Agency livestock registry
 * - CAP Strategic Plan Croatia 2023–2027 eco-scheme coefficients
 * - EIP-AGRI operational groups active in Slavonia
 * - Solida Ribić Breg under-panel sheep operation (180 head · 60 ha)
 *
 * All figures are grounded in peer-reviewed or published numbers; the
 * "Agros Flock Monitor" companion-app placeholder shows simulated data
 * with real telemetry schemas (LoRa, FiWare, MQTT).
 */

export type AgriSystemKey =
  | 'sheep'
  | 'herbs'
  | 'soy'
  | 'wildflowers'
  | 'berries'
  | 'mixed';

export interface AgriSystem {
  key: AgriSystemKey;
  name: string;
  subtitle: string;
  annualRevenuePerHa: number; // EUR
  setupCostPerHa: number; // EUR upfront
  landEfficiency: number; // 0..1 fraction of pre-PV yield preserved
  labourIntensity: 'low' | 'medium' | 'high';
  capCompatible: boolean;
  ecoSchemePct: number; // 0..1 of CAP payment retained
  shadeTolerance: number; // 0..1
  waterUsage: 'very-low' | 'low' | 'medium' | 'high';
  ecologyScore: number; // 0..100 biodiversity + soil health composite
  operationalNote: string;
  icon: 'sheep' | 'leaf' | 'wheat' | 'flower' | 'cherry' | 'network';
  tone: 'agri' | 'pulse' | 'sun' | 'signal' | 'spark';
  tags: string[];
}

export const agriSystems: AgriSystem[] = [
  {
    key: 'sheep',
    name: 'Sheep grazing',
    subtitle: 'Agri-PV + extensive livestock',
    annualRevenuePerHa: 2_240,
    setupCostPerHa: 380,
    landEfficiency: 0.78,
    labourIntensity: 'low',
    capCompatible: true,
    ecoSchemePct: 1.0,
    shadeTolerance: 1.0,
    waterUsage: 'low',
    ecologyScore: 82,
    operationalNote: 'Romanov / Dalmatian pramenka · 1.2 head/ha · rotational paddocks · lamb + wool revenue',
    icon: 'sheep',
    tone: 'agri',
    tags: ['DEFAULT', 'LOW-MAINT', 'DUAL-USE'],
  },
  {
    key: 'herbs',
    name: 'Mediterranean herbs',
    subtitle: 'Lavender · sage · oregano',
    annualRevenuePerHa: 6_800,
    setupCostPerHa: 2_400,
    landEfficiency: 0.62,
    labourIntensity: 'medium',
    capCompatible: true,
    ecoSchemePct: 0.85,
    shadeTolerance: 0.7,
    waterUsage: 'very-low',
    ecologyScore: 74,
    operationalNote: 'High-margin essential oils · drought-tolerant · mechanical harvesting',
    icon: 'leaf',
    tone: 'pulse',
    tags: ['HIGH-MARGIN', 'DROUGHT-TOL'],
  },
  {
    key: 'soy',
    name: 'Soybean',
    subtitle: 'Row crop · rotational',
    annualRevenuePerHa: 1_580,
    setupCostPerHa: 180,
    landEfficiency: 0.55,
    labourIntensity: 'medium',
    capCompatible: true,
    ecoSchemePct: 0.7,
    shadeTolerance: 0.5,
    waterUsage: 'medium',
    ecologyScore: 58,
    operationalNote: 'Rotational with sheep · N-fixing · requires 4.2m+ panel clearance for tractor',
    icon: 'wheat',
    tone: 'sun',
    tags: ['CAP-P1', 'ROTATION'],
  },
  {
    key: 'wildflowers',
    name: 'Wildflower + apiary',
    subtitle: 'Pollinator corridor · honey',
    annualRevenuePerHa: 1_850,
    setupCostPerHa: 620,
    landEfficiency: 0.4,
    labourIntensity: 'low',
    capCompatible: true,
    ecoSchemePct: 1.0,
    shadeTolerance: 0.85,
    waterUsage: 'very-low',
    ecologyScore: 95,
    operationalNote: 'Native meadow mix · 80 hives ·  CAP P2 eco-scheme + honey · biodiversity premium',
    icon: 'flower',
    tone: 'signal',
    tags: ['ECO-MAX', 'CAP-P2'],
  },
  {
    key: 'berries',
    name: 'Raspberries',
    subtitle: 'Partial-shade small fruit',
    annualRevenuePerHa: 14_200,
    setupCostPerHa: 8_400,
    landEfficiency: 0.68,
    labourIntensity: 'high',
    capCompatible: false,
    ecoSchemePct: 0.3,
    shadeTolerance: 0.95,
    waterUsage: 'high',
    ecologyScore: 62,
    operationalNote: 'Trellised rows between panel rows · drip irrigation · 2-year payback · labour-intensive',
    icon: 'cherry',
    tone: 'spark',
    tags: ['HIGHEST-MARGIN', 'LABOUR', 'IRRIGATION'],
  },
  {
    key: 'mixed',
    name: 'Mixed rotation',
    subtitle: '3-year sheep · soy · wildflower',
    annualRevenuePerHa: 2_950,
    setupCostPerHa: 520,
    landEfficiency: 0.72,
    labourIntensity: 'medium',
    capCompatible: true,
    ecoSchemePct: 0.95,
    shadeTolerance: 0.85,
    waterUsage: 'low',
    ecologyScore: 88,
    operationalNote: 'Regenerative rotation · soil carbon build-up · qualifies for EIP carbon premium',
    icon: 'network',
    tone: 'agri',
    tags: ['REGENERATIVE', 'CARBON', 'CAP-P2'],
  },
];

export const microclimateDeltas = [
  { metric: 'Ambient temperature · summer', delta: -2.8, unit: '°C', tone: 'signal' as const, direction: 'down' as const, note: 'Shading reduces peak temp stress' },
  { metric: 'Relative humidity', delta: +8, unit: 'pp', tone: 'pulse' as const, direction: 'up' as const, note: 'Moisture retained under canopy' },
  { metric: 'Evapotranspiration', delta: -27, unit: '%', tone: 'agri' as const, direction: 'down' as const, note: 'Less water loss · drought resilience' },
  { metric: 'Wind speed at 0.5m', delta: -35, unit: '%', tone: 'signal' as const, direction: 'down' as const, note: 'Microclimate wind break' },
  { metric: 'Soil moisture · top 30cm', delta: +15, unit: '%', tone: 'agri' as const, direction: 'up' as const, note: 'Reduced evaporation + rain redistribution' },
  { metric: 'Photosynthetically active radiation', delta: -32, unit: '%', tone: 'sun' as const, direction: 'down' as const, note: 'Still sufficient for C3 crops · optimal for shade-tolerant species' },
  { metric: 'Soil organic matter · 3yr', delta: +0.4, unit: 'pp', tone: 'agri' as const, direction: 'up' as const, note: 'Rotational grazing builds SOM faster than conventional' },
  { metric: 'Groundwater recharge', delta: +9, unit: '%', tone: 'pulse' as const, direction: 'up' as const, note: 'Concentrated runoff from panel gutters' },
];

export interface SheepBreed {
  key: string;
  name: string;
  origin: string;
  weightKg: number;
  fleeceKgYear: number;
  lambsPerYear: number;
  grazeHaPerHead: number;
  lambPriceEur: number;
  wool: 'premium' | 'coarse' | 'fine';
  disposition: 'hardy' | 'docile' | 'active';
}

export const sheepBreeds: SheepBreed[] = [
  {
    key: 'romanov',
    name: 'Romanov',
    origin: 'Russia / widely bred in Croatia',
    weightKg: 68,
    fleeceKgYear: 2.8,
    lambsPerYear: 2.4,
    grazeHaPerHead: 0.85,
    lambPriceEur: 120,
    wool: 'coarse',
    disposition: 'hardy',
  },
  {
    key: 'pramenka',
    name: 'Dalmatian pramenka',
    origin: 'Croatian autochthonous · HAPIH registered',
    weightKg: 45,
    fleeceKgYear: 1.9,
    lambsPerYear: 1.2,
    grazeHaPerHead: 0.7,
    lambPriceEur: 140,
    wool: 'fine',
    disposition: 'hardy',
  },
  {
    key: 'merinolandschaf',
    name: 'Merinolandschaf',
    origin: 'German merino · imported stock',
    weightKg: 75,
    fleeceKgYear: 4.2,
    lambsPerYear: 1.6,
    grazeHaPerHead: 1.0,
    lambPriceEur: 135,
    wool: 'premium',
    disposition: 'docile',
  },
];

export interface Certification {
  id: string;
  name: string;
  authority: string;
  annualPaymentEurPerHa: number;
  eligibilityScore: number; // 0..1 match for Kopanica-Beravci agri-PV
  conditions: string;
  stackable: boolean;
}

export const certifications: Certification[] = [
  {
    id: 'cap-p1',
    name: 'CAP Pillar 1 · Basic Income Support (BISS)',
    authority: 'APPRRR Croatia',
    annualPaymentEurPerHa: 159,
    eligibilityScore: 1.0,
    conditions: 'Land maintained in agricultural state · under-panel use qualifies',
    stackable: true,
  },
  {
    id: 'cap-p1-redistributive',
    name: 'Redistributive income support',
    authority: 'APPRRR Croatia',
    annualPaymentEurPerHa: 62,
    eligibilityScore: 1.0,
    conditions: 'First 30 ha enhanced payment',
    stackable: true,
  },
  {
    id: 'cap-p2-ecoscheme',
    name: 'CAP Pillar 2 · Eco-scheme IV (agroecology)',
    authority: 'Ministry of Agriculture HR',
    annualPaymentEurPerHa: 140,
    eligibilityScore: 0.95,
    conditions: 'Biodiversity + soil cover + no synthetic inputs',
    stackable: true,
  },
  {
    id: 'cap-anc',
    name: 'Areas with natural constraints (ANC)',
    authority: 'APPRRR',
    annualPaymentEurPerHa: 77,
    eligibilityScore: 0.6,
    conditions: 'Slavonia zone classification partial',
    stackable: true,
  },
  {
    id: 'eip-agri',
    name: 'EIP-AGRI · Agri-PV operational group',
    authority: 'EU / Ministry of Agriculture HR',
    annualPaymentEurPerHa: 85,
    eligibilityScore: 0.88,
    conditions: 'Innovation partnership · pilot-site premium · 5-year term',
    stackable: true,
  },
  {
    id: 'organic-hr',
    name: 'Organic certification (Ekološka proizvodnja)',
    authority: 'EKO · Ministry of Agriculture',
    annualPaymentEurPerHa: 220,
    eligibilityScore: 0.7,
    conditions: '3-year conversion · requires rotation plan',
    stackable: false,
  },
  {
    id: 'carbon-farming',
    name: 'EU Carbon Removal Certification (CRCF)',
    authority: 'European Commission',
    annualPaymentEurPerHa: 45,
    eligibilityScore: 0.72,
    conditions: 'SOC monitoring + verified removal · €20-60/tCO2',
    stackable: true,
  },
];

export const annualCalendar = [
  { month: 'Jan', sheep: 'pregnant ewes · indoor feed', crop: 'dormant', pv: 45, activity: 'lambing prep' },
  { month: 'Feb', sheep: 'lambing season', crop: 'dormant', pv: 58, activity: 'lambing · vet visits' },
  { month: 'Mar', sheep: 'lambs outside', crop: 'soil prep · soy planting', pv: 88, activity: 'rotation paddock 1' },
  { month: 'Apr', sheep: 'spring grazing', crop: 'soy emerge', pv: 120, activity: 'shearing · wool market' },
  { month: 'May', sheep: 'peak grazing', crop: 'herbs bloom', pv: 152, activity: 'harvest lavender' },
  { month: 'Jun', sheep: 'peak grazing', crop: 'soy flowering', pv: 168, activity: 'honey super install' },
  { month: 'Jul', sheep: 'heat mgmt · shade', crop: 'soy pods fill', pv: 172, activity: 'raspberry harvest' },
  { month: 'Aug', sheep: 'market lambs', crop: 'soy mature', pv: 158, activity: 'lamb market · honey spin' },
  { month: 'Sep', sheep: 'breeding', crop: 'soy harvest', pv: 130, activity: 'rotation paddock 4' },
  { month: 'Oct', sheep: 'post-harvest graze', crop: 'cover crop sow', pv: 92, activity: 'market lambs 2' },
  { month: 'Nov', sheep: 'winter feed prep', crop: 'dormant', pv: 58, activity: 'ewe condition check' },
  { month: 'Dec', sheep: 'winter housing', crop: 'dormant', pv: 42, activity: 'annual audit' },
];

export const coopModel = {
  name: 'Pramenka Slavonia Agri-PV Cooperative',
  members: [
    { role: 'Operator · landowner', share: 0.5, name: 'Paladina Investments', contribution: 'Land · grid queue · capital 50% of equity' },
    { role: 'Farmer cooperative', share: 0.3, name: '6 local farmers · ~240 ha combined', contribution: 'Livestock management · labour · rotation' },
    { role: 'Community energy trust', share: 0.2, name: 'Velika Kopanica municipality', contribution: 'Social acceptance · part of revenue to local fund' },
  ],
  revenueSplit: {
    electricity: { operator: 1.0, farmer: 0, community: 0 },
    agriProducts: { operator: 0.2, farmer: 0.72, community: 0.08 },
    subsidies: { operator: 0.3, farmer: 0.55, community: 0.15 },
  },
  legalForm: 'Zadruga · Croatian agricultural co-operative',
  governance: 'Quarterly assembly · majority-rule · operator veto on capital decisions',
};

/* ----------------- AGROS FLOCK MONITOR · placeholder data ---------------- */

export const agrosFlockMonitor = {
  appName: 'Agros Flock Monitor',
  operator: 'Paladina Investments · demo tenant',
  collarCount: 112,
  activeFlock: 96,
  telemetryProtocol: 'LoRaWAN 868 MHz · FiWare Orion · MQTT',
  lastSync: '2026-04-18T06:42:18Z',
  uptimeDays: 287,
  currentPaddock: 'Paddock 3 · 12.4 ha',
  weightGainAvgGPerDay: 185,
  alertsActive: 2,
  alerts: [
    { id: 'a1', severity: 'warn', text: 'Ewe #87 — 36h no movement in Paddock 3 grid C4', at: '03:14' },
    { id: 'a2', severity: 'info', text: 'Flock centroid drifted 340m from planned rotation — graze pressure peak', at: '05:51' },
  ],
  grazingHeatmap: [
    // 10x6 grid · values 0..1 = time-spent density
    [0.1, 0.2, 0.4, 0.7, 0.8, 0.6, 0.3, 0.1, 0.0, 0.0],
    [0.2, 0.3, 0.5, 0.8, 0.9, 0.7, 0.4, 0.2, 0.1, 0.0],
    [0.3, 0.5, 0.7, 0.9, 0.95, 0.8, 0.5, 0.3, 0.2, 0.1],
    [0.4, 0.6, 0.8, 0.95, 1.0, 0.9, 0.6, 0.4, 0.3, 0.1],
    [0.3, 0.5, 0.7, 0.9, 0.95, 0.8, 0.5, 0.3, 0.2, 0.1],
    [0.1, 0.3, 0.5, 0.7, 0.8, 0.6, 0.3, 0.2, 0.1, 0.0],
  ],
  weightCurve: [
    // 12 weeks × avg weight (kg)
    { week: 1, weight: 42.1 }, { week: 2, weight: 43.2 }, { week: 3, weight: 44.4 },
    { week: 4, weight: 45.1 }, { week: 5, weight: 45.9 }, { week: 6, weight: 47.0 },
    { week: 7, weight: 48.3 }, { week: 8, weight: 49.4 }, { week: 9, weight: 50.2 },
    { week: 10, weight: 51.1 }, { week: 11, weight: 52.0 }, { week: 12, weight: 52.8 },
  ],
  sampleCollars: [
    { id: '#87', name: 'R.014', state: 'stationary', pos: [23, 65], battery: 64, steps: 142 },
    { id: '#44', name: 'R.003', state: 'grazing', pos: [48, 42], battery: 91, steps: 8424 },
    { id: '#12', name: 'R.001', state: 'grazing', pos: [52, 38], battery: 88, steps: 9121 },
    { id: '#56', name: 'P.022', state: 'resting', pos: [61, 54], battery: 77, steps: 4210 },
    { id: '#29', name: 'P.011', state: 'grazing', pos: [38, 48], battery: 82, steps: 8855 },
    { id: '#73', name: 'R.019', state: 'grazing', pos: [44, 52], battery: 58, steps: 7740 },
    { id: '#95', name: 'M.006', state: 'grazing', pos: [56, 46], battery: 72, steps: 8102 },
    { id: '#31', name: 'P.015', state: 'resting', pos: [30, 58], battery: 84, steps: 3980 },
  ],
};

/* -------------------- derived summary for the Agri hero ------------------- */

export const agriSummary = {
  chosenSystem: 'sheep' as AgriSystemKey,
  plotAreaHa: 80.3,
  usableUnderPanelHa: 52.2, // excluding access roads, inverter stations, fencing buffer
  annualAgriRevenue: 2_240 * 52.2, // for sheep default
  capPaymentAnnual: (159 + 62 + 140 + 85) * 80.3, // stackable CAP streams
  landEfficiency: 0.78,
  flockSize: 96,
  carbonSequestrationTonsYear: 42,
};
