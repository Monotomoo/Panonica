export type ConfigKey = 'pure-pv' | 'agri-sheep' | 'agri-crops';

export interface ConfigScenario {
  key: ConfigKey;
  name: string;
  installedMW: number;
  panelHeight: number;
  rowSpacing: number;
  tracking: 'fixed' | '1-axis' | '2-axis';
  battery: number;
  underPanel: 'none' | 'sheep' | 'soy' | 'herbs';
  capex: number;
  opex: number;
  annualYieldGWh: number;
  agriIncome: number;
  revenue: number;
  lcoeEurPerMWh: number;
  payback: number;
  irr: number;
  npv20: number;
  co2Avoided: number;
  householdsPowered: number;
  landEfficiency: number;
  agriMaintained: number;
}

export const configs: Record<ConfigKey, ConfigScenario> = {
  'pure-pv': {
    key: 'pure-pv',
    name: 'Pure PV',
    installedMW: 52,
    panelHeight: 2.5,
    rowSpacing: 6,
    tracking: '1-axis',
    battery: 0,
    underPanel: 'none',
    capex: 41_500_000,
    opex: 415_000,
    annualYieldGWh: 68,
    agriIncome: 0,
    revenue: 3_200_000,
    lcoeEurPerMWh: 48,
    payback: 11.2,
    irr: 7.8,
    npv20: 18_200_000,
    co2Avoided: 55_000,
    householdsPowered: 19_500,
    landEfficiency: 0.78,
    agriMaintained: 0,
  },
  'agri-sheep': {
    key: 'agri-sheep',
    name: 'Phase 1 · Agri-PV + Sheep',
    installedMW: 30,  // queue-approved phase 1 · matches Builder + Context + Corridor + Thesis
    panelHeight: 4.2,
    rowSpacing: 8.5,
    tracking: 'fixed',
    battery: 12,
    underPanel: 'sheep',
    capex: 21_000_000,  // scaled proportionally · matches Thesis €21M
    opex: 225_000,
    annualYieldGWh: 39.2,  // matches Builder-derived yield
    agriIncome: 142_000,
    revenue: 2_094_000,
    lcoeEurPerMWh: 42,
    payback: 7.4,
    irr: 11.4,
    npv20: 23_400_000,
    co2Avoided: 34_000,
    householdsPowered: 11_200,
    landEfficiency: 0.65,
    agriMaintained: 0.78,
  },
  'agri-crops': {
    key: 'agri-crops',
    name: 'Agri-PV + Soy',
    installedMW: 42,
    panelHeight: 4.8,
    rowSpacing: 10,
    tracking: 'fixed',
    battery: 18,
    underPanel: 'soy',
    capex: 37_800_000,
    opex: 295_000,
    annualYieldGWh: 55,
    agriIncome: 220_000,
    revenue: 2_880_000,
    lcoeEurPerMWh: 44,
    payback: 9.7,
    irr: 10.6,
    npv20: 27_100_000,
    co2Avoided: 46_000,
    householdsPowered: 15_750,
    landEfficiency: 0.6,
    agriMaintained: 0.82,
  },
};

export const configOrder: ConfigKey[] = ['pure-pv', 'agri-sheep', 'agri-crops'];
