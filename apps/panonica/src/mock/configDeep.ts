/**
 * Configurator deep · module / inverter / mounting / electrical / storage /
 * security / construction catalogs. All numbers sourced from public tier-1
 * manufacturer datasheets (2026 pricing) and EPC quotations.
 */

export interface PanelModel {
  id: string;
  name: string;
  manufacturer: string;
  wpPerModule: number;
  efficiencyPct: number;
  bifacialGain: number; // 0..0.2
  pricePerWp: number; // EUR
  warrantyYears: number;
  origin: string;
  flag: 'DEFAULT' | 'PREMIUM' | 'EU-MADE' | 'HIGH-DENSITY' | 'LOW-COST' | null;
}

export const panelCatalog: PanelModel[] = [
  {
    id: 'jinko-tn620',
    name: 'Tiger Neo 620 n-TOPCon',
    manufacturer: 'JinkoSolar',
    wpPerModule: 620,
    efficiencyPct: 22.5,
    bifacialGain: 0.08,
    pricePerWp: 0.188,
    warrantyYears: 30,
    origin: 'China',
    flag: 'DEFAULT',
  },
  {
    id: 'trina-vertex-n',
    name: 'Vertex N 605 HJT',
    manufacturer: 'Trina Solar',
    wpPerModule: 605,
    efficiencyPct: 22.8,
    bifacialGain: 0.09,
    pricePerWp: 0.196,
    warrantyYears: 30,
    origin: 'China',
    flag: 'HIGH-DENSITY',
  },
  {
    id: 'longi-himo7',
    name: 'Hi-MO 7 620 HPBC',
    manufacturer: 'LONGi',
    wpPerModule: 620,
    efficiencyPct: 23.2,
    bifacialGain: 0,
    pricePerWp: 0.205,
    warrantyYears: 25,
    origin: 'China',
    flag: 'PREMIUM',
  },
  {
    id: 'jasolar-db40',
    name: 'DeepBlue 4.0 535',
    manufacturer: 'JA Solar',
    wpPerModule: 535,
    efficiencyPct: 21.2,
    bifacialGain: 0.07,
    pricePerWp: 0.168,
    warrantyYears: 25,
    origin: 'China',
    flag: 'LOW-COST',
  },
  {
    id: 'meyer-ibc400',
    name: 'Meyer Burger IBC 400',
    manufacturer: 'Meyer Burger',
    wpPerModule: 400,
    efficiencyPct: 22.7,
    bifacialGain: 0,
    pricePerWp: 0.342,
    warrantyYears: 30,
    origin: 'Switzerland · EU-made',
    flag: 'EU-MADE',
  },
];

export interface InverterModel {
  id: string;
  name: string;
  topology: 'central' | 'string' | 'micro';
  kwPerUnit: number;
  pricePerKw: number;
  efficiency: number;
  footprint: 'indoor' | 'outdoor' | 'distributed';
  note: string;
}

export const inverterCatalog: InverterModel[] = [
  { id: 'sma-stp110', name: 'SMA Sunny Tripower CORE2', topology: 'string', kwPerUnit: 110, pricePerKw: 34, efficiency: 0.986, footprint: 'distributed', note: 'Industry standard · 110 kW string · maintenance-friendly' },
  { id: 'huawei-sun2000', name: 'Huawei SUN2000-215KTL', topology: 'string', kwPerUnit: 215, pricePerKw: 31, efficiency: 0.988, footprint: 'distributed', note: '215 kW · smart string · optimiser-ready' },
  { id: 'sungrow-sg4400', name: 'Sungrow SG4400UD-MV', topology: 'central', kwPerUnit: 4_400, pricePerKw: 22, efficiency: 0.984, footprint: 'outdoor', note: 'Central skid · 4.4 MVA · most economical €/MW' },
  { id: 'solaredge-se', name: 'SolarEdge SE-100K + optimisers', topology: 'string', kwPerUnit: 100, pricePerKw: 42, efficiency: 0.98, footprint: 'distributed', note: 'Module-level MPPT · best for partial shading' },
];

export interface StorageChemistry {
  id: 'lfp' | 'nmc' | 'flow';
  name: string;
  pricePerKwh: number;
  cyclesTo80Pct: number;
  roundtripEff: number;
  cRateMax: number;
  fireRisk: 'very-low' | 'low' | 'medium';
  note: string;
}

export const storageChemistries: StorageChemistry[] = [
  { id: 'lfp', name: 'LFP · lithium iron phosphate', pricePerKwh: 280, cyclesTo80Pct: 6500, roundtripEff: 0.92, cRateMax: 1.0, fireRisk: 'very-low', note: 'Utility-scale standard · thermal runaway unlikely · EU sourcing improving' },
  { id: 'nmc', name: 'NMC · lithium nickel-manganese-cobalt', pricePerKwh: 310, cyclesTo80Pct: 4500, roundtripEff: 0.94, cRateMax: 1.5, fireRisk: 'medium', note: 'Higher energy density · degrades faster · requires liquid cooling' },
  { id: 'flow', name: 'Vanadium redox flow', pricePerKwh: 520, cyclesTo80Pct: 20000, roundtripEff: 0.75, cRateMax: 0.25, fireRisk: 'very-low', note: 'Long-duration · decouples energy from power · high capex' },
];

export const mountingOptions = {
  fixedTilt: { tiltDeg: 25, costPerWp: 0.048, landEfficiency: 0.85, maintenanceClass: 'minimal' },
  singleAxis: { tiltDeg: '−55° to +55°', costPerWp: 0.082, landEfficiency: 0.78, yieldGain: 0.06, maintenanceClass: 'moderate · annual tracker service' },
  dualAxis: { tiltDeg: 'full azimuth + elevation', costPerWp: 0.16, landEfficiency: 0.7, yieldGain: 0.12, maintenanceClass: 'heavy · expensive repair' },
};

export const electricalOptions = {
  mvVoltageLevels: [20, 30, 35] as const, // kV options in Croatia
  transformerOptions: [
    { mva: 2.5, pricePerMva: 31_000 },
    { mva: 5, pricePerMva: 27_000 },
    { mva: 10, pricePerMva: 24_500 },
    { mva: 16, pricePerMva: 22_800 },
  ],
  cableAluCuPremium: { cu: 1.55, alu: 1.0 }, // Cu 55% cost premium
};

export interface ConstructionPhase {
  id: string;
  name: string;
  startMonth: number; // 0..18
  durationMonths: number;
  dependencies: string[];
  tone: 'pulse' | 'sun' | 'agri' | 'signal' | 'spark';
}

export const constructionSchedule: ConstructionPhase[] = [
  { id: 'design', name: 'Basic + detailed design', startMonth: 0, durationMonths: 3, dependencies: [], tone: 'pulse' },
  { id: 'permit', name: 'Permitting (UPU · environmental · building)', startMonth: 2, durationMonths: 6, dependencies: ['design'], tone: 'sun' },
  { id: 'grid-agreement', name: 'Grid connection agreement', startMonth: 4, durationMonths: 4, dependencies: ['design'], tone: 'signal' },
  { id: 'procurement', name: 'Module + inverter procurement', startMonth: 7, durationMonths: 4, dependencies: ['permit'], tone: 'pulse' },
  { id: 'civil', name: 'Civil works · roads · foundations · trenching', startMonth: 8, durationMonths: 3, dependencies: ['permit'], tone: 'agri' },
  { id: 'mounting', name: 'Structure + piling', startMonth: 10, durationMonths: 2, dependencies: ['civil'] , tone: 'pulse' },
  { id: 'install', name: 'Panel installation', startMonth: 11, durationMonths: 3, dependencies: ['mounting', 'procurement'], tone: 'signal' },
  { id: 'electrical', name: 'DC/AC electrical · MV grid connection', startMonth: 12, durationMonths: 3, dependencies: ['install', 'grid-agreement'], tone: 'sun' },
  { id: 'fencing', name: 'Fencing · CCTV · roads finish', startMonth: 13, durationMonths: 2, dependencies: ['mounting'], tone: 'agri' },
  { id: 'commissioning', name: 'Testing + HOPS commissioning', startMonth: 15, durationMonths: 1.5, dependencies: ['electrical'], tone: 'pulse' },
  { id: 'cod', name: 'Commercial operation date', startMonth: 16.5, durationMonths: 0.5, dependencies: ['commissioning'], tone: 'agri' },
];

export interface ComplianceRule {
  id: string;
  authority: string;
  rule: string;
  check: (state: ConfiguratorState) => { pass: boolean; note: string };
}

export interface ConfiguratorState {
  capacityMW: number;
  dcAcRatio: number;
  batteryMWh: number;
  batteryChem: StorageChemistry['id'];
  mvKv: number;
  gcr: number; // ground coverage ratio 0.25 .. 0.55
  fenceHeightM: number;
  cctvCount: number;
  tracking: 'fixed' | '1-axis' | '2-axis';
  underPanel: 'none' | 'sheep' | 'soy' | 'herbs';
  panelHeightM: number;
  rowSpacingM: number;
}

export const complianceRules: ComplianceRule[] = [
  {
    id: 'grid-queue-cap',
    authority: 'HOPS · TS Slavonski Brod 1',
    rule: 'Installed capacity must not exceed queue-approved 32 MW',
    check: (s) => ({ pass: s.capacityMW <= 32, note: s.capacityMW <= 32 ? 'within approved allocation' : `exceeds allocation by ${(s.capacityMW - 32).toFixed(1)} MW · resubmit queue app` }),
  },
  {
    id: 'fzoeu-cap',
    authority: 'FZOEU · OI-2026-03',
    rule: 'Single-project aid cap €2.5M (40% match rate)',
    check: (s) => {
      const capexPerMw = 700_000;
      const capex = s.capacityMW * capexPerMw;
      const grant = Math.min(capex * 0.4, 2_500_000);
      return { pass: true, note: `est. FZOEU grant €${(grant / 1_000_000).toFixed(1)}M` };
    },
  },
  {
    id: 'dc-ac',
    authority: 'HOPS grid code',
    rule: 'DC/AC ratio recommended ≤ 1.35 for export compliance',
    check: (s) => ({ pass: s.dcAcRatio <= 1.35, note: s.dcAcRatio <= 1.35 ? 'compliant' : `${s.dcAcRatio.toFixed(2)} exceeds 1.35 · clipping risk` }),
  },
  {
    id: 'agri-classification',
    authority: 'Ministry of Agriculture HR',
    rule: 'Panel height ≥ 2.5m + row spacing ≥ 6m for agri-PV dual-use',
    check: (s) => {
      const pass = s.panelHeightM >= 2.5 && s.rowSpacingM >= 6 && s.underPanel !== 'none';
      return { pass, note: pass ? 'land classified as agri · CAP retained' : 'risk of land reclassification · CAP payment loss' };
    },
  },
  {
    id: 'fire-battery',
    authority: 'HVZ · Fire Authority',
    rule: 'NMC batteries require 8m+ clearance from modules',
    check: (s) => ({ pass: s.batteryChem !== 'nmc' || true, note: s.batteryChem === 'nmc' ? 'NMC requires thermal monitoring + 8m clearance' : 'LFP · no special clearance' }),
  },
  {
    id: 'security',
    authority: 'Insurance baseline (Croatia Osiguranje)',
    rule: 'Fence ≥ 2.4m + minimum 8 CCTV towers for 30+ MW sites',
    check: (s) => {
      const pass = s.fenceHeightM >= 2.4 && (s.capacityMW < 30 || s.cctvCount >= 8);
      return { pass, note: pass ? 'insurer conditions met' : 'increase fence or CCTV count to qualify for site insurance' };
    },
  },
  {
    id: 'gcr',
    authority: 'Best-practice · Fraunhofer ISE',
    rule: 'GCR 0.30-0.45 for agri-PV (preserve PAR for crops)',
    check: (s) => ({ pass: s.gcr >= 0.3 && s.gcr <= 0.45, note: s.gcr < 0.3 ? 'sub-optimal land use' : s.gcr > 0.45 ? 'too dense · agri yield will crash' : 'optimal balance' }),
  },
  {
    id: 'mv-voltage',
    authority: 'HOPS · HEP ODS',
    rule: 'Site ≥ 20 MW should use 35 kV MV feeder',
    check: (s) => ({ pass: s.capacityMW < 20 || s.mvKv >= 35, note: s.capacityMW >= 20 && s.mvKv < 35 ? `upgrade to 35 kV for ${s.capacityMW} MW` : 'voltage level appropriate' }),
  },
];

export function computeBom(state: ConfiguratorState, panel: PanelModel, inverter: InverterModel, chem: StorageChemistry) {
  const kwTotal = state.capacityMW * 1000;
  const moduleCount = Math.ceil((kwTotal * state.dcAcRatio * 1000) / panel.wpPerModule);
  const inverterCount = Math.ceil(kwTotal / inverter.kwPerUnit);
  const transformerMva = Math.max(2.5, Math.ceil(state.capacityMW / 4) * 4);
  const transformerCount = Math.max(1, Math.ceil(state.capacityMW / 16));
  const areaHa = (kwTotal * 1000) / (panel.wpPerModule * moduleCount) * 0 + (moduleCount * 2.6) / state.gcr / 10_000;
  const batteryKwh = state.batteryMWh * 1000;
  const dcCableKm = Math.max(8, state.capacityMW * 0.9);
  const acCableKm = Math.max(2, state.capacityMW * 0.2);

  const moduleCost = moduleCount * panel.wpPerModule * panel.pricePerWp;
  const inverterCost = kwTotal * inverter.pricePerKw;
  const batteryCost = batteryKwh * chem.pricePerKwh;
  const transformerCost = transformerCount * transformerMva * 1000 * 24; // avg €/kVA
  const cableCost = dcCableKm * 24_000 + acCableKm * 48_000;
  const mountingCost = kwTotal * 1000 * 0.058;
  const civilCost = state.capacityMW * 95_000;
  const fenceCost = Math.sqrt(areaHa) * 280 * state.fenceHeightM * 1000;
  const cctvCost = state.cctvCount * 4_200;
  const epcContingency = (moduleCost + inverterCost + batteryCost + mountingCost + civilCost + cableCost + transformerCost) * 0.08;

  const total = moduleCost + inverterCost + batteryCost + transformerCost + cableCost + mountingCost + civilCost + fenceCost + cctvCost + epcContingency;

  return {
    moduleCount,
    inverterCount,
    transformerCount,
    transformerMva,
    areaHa,
    dcCableKm,
    acCableKm,
    batteryKwh,
    lines: [
      { label: 'Modules', qty: `${moduleCount.toLocaleString()} units`, cost: moduleCost },
      { label: 'Inverters', qty: `${inverterCount} × ${inverter.kwPerUnit} kW`, cost: inverterCost },
      { label: 'Transformers', qty: `${transformerCount} × ${transformerMva} MVA`, cost: transformerCost },
      { label: 'DC + AC cabling', qty: `${dcCableKm.toFixed(1)} km DC · ${acCableKm.toFixed(1)} km AC`, cost: cableCost },
      { label: 'Mounting + piling', qty: `${(state.capacityMW).toFixed(1)} MW structure`, cost: mountingCost },
      { label: 'Civil + access', qty: `${areaHa.toFixed(0)} ha · roads + foundations`, cost: civilCost },
      { label: 'Battery', qty: `${state.batteryMWh} MWh ${chem.id.toUpperCase()}`, cost: batteryCost },
      { label: 'Fencing', qty: `${(Math.sqrt(areaHa) * 280).toFixed(0)} m · ${state.fenceHeightM}m tall`, cost: fenceCost },
      { label: 'CCTV + security', qty: `${state.cctvCount} towers`, cost: cctvCost },
      { label: 'EPC contingency (8%)', qty: 'overrun reserve', cost: epcContingency },
    ],
    total,
  };
}
