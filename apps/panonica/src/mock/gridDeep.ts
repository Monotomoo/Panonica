/**
 * Grid · deep-dive data · HOPS/HEP grid code compliance, queue analytics,
 * curtailment forecasting.
 *
 * Sources:
 * - HOPS Grid Code 2024 rev.3 (Pravila o tehničkim zahtjevima)
 * - HEP ODS queue register Q1 2026
 * - ENTSO-E TYNDP 2024 Croatia section
 * - IEC 61400-27 (wind + PV model library)
 * - IEC 61850-7-420 (DER comms)
 */

export interface GridCodeCheck {
  id: string;
  category: 'voltage' | 'frequency' | 'quality' | 'comms' | 'protection';
  rule: string;
  threshold: string;
  beravciValue: string;
  pass: boolean;
  note: string;
}

export const gridCodeMatrix: GridCodeCheck[] = [
  {
    id: 'lvrt',
    category: 'voltage',
    rule: 'Low Voltage Ride-Through',
    threshold: '0.15 s @ 0.05 pu · then linear to 1.5 s @ 0.8 pu',
    beravciValue: '0.15 s @ 0.05 pu · compliant',
    pass: true,
    note: 'Sungrow inverters · type-tested · HOPS certificate on file',
  },
  {
    id: 'hvrt',
    category: 'voltage',
    rule: 'High Voltage Ride-Through',
    threshold: '0.25 s @ 1.25 pu · 5 s @ 1.15 pu',
    beravciValue: '0.25 s @ 1.30 pu',
    pass: true,
    note: 'Exceeds minimum · headroom for grid events',
  },
  {
    id: 'pq',
    category: 'voltage',
    rule: 'Reactive power capability (P-Q envelope)',
    threshold: 'cos φ ≥ 0.95 lead/lag at full P',
    beravciValue: 'cos φ 0.93 lead · 0.93 lag',
    pass: true,
    note: 'At PCC after MV transformer · Q compensation bank sized 6 MVAr',
  },
  {
    id: 'freq-response',
    category: 'frequency',
    rule: 'Frequency response · LFSM-O',
    threshold: '50.2 Hz deadband · 2% droop to 51.5 Hz',
    beravciValue: '50.2 Hz deadband · 1.8% droop',
    pass: true,
    note: 'Over-frequency curtailment active · mandatory for HR',
  },
  {
    id: 'freq-protection',
    category: 'frequency',
    rule: 'Frequency protection thresholds',
    threshold: 'Trip outside 47.5–51.5 Hz',
    beravciValue: 'Trip 47.5 / 51.5 Hz',
    pass: true,
    note: 'Underfrequency load shedding coordinated with ENTSO-E',
  },
  {
    id: 'thd',
    category: 'quality',
    rule: 'Total Harmonic Distortion (current)',
    threshold: 'THD ≤ 5% · individual ≤ 3%',
    beravciValue: 'THD 2.8% · H5 1.4% · H7 1.1%',
    pass: true,
    note: 'Measured at 1 MW test bench · 3rd-party cert',
  },
  {
    id: 'flicker',
    category: 'quality',
    rule: 'Flicker · short-term severity',
    threshold: 'Pst ≤ 1.0 at PCC',
    beravciValue: 'Pst 0.42',
    pass: true,
    note: 'Inherently low for PV · only transient cloud shadowing',
  },
  {
    id: 'dc-injection',
    category: 'quality',
    rule: 'DC current injection',
    threshold: '< 0.5% of In',
    beravciValue: '0.08%',
    pass: true,
    note: 'Transformer isolated · essentially zero DC leakage',
  },
  {
    id: 'comms',
    category: 'comms',
    rule: 'DER communication protocol',
    threshold: 'IEC 61850-7-420 via HOPS SCADA',
    beravciValue: 'IEC 61850 MMS · dual redundant',
    pass: true,
    note: 'Fibre + cellular backup · 500ms polling · 1s commanded setpoints',
  },
  {
    id: 'fault-contribution',
    category: 'protection',
    rule: 'Fault current contribution',
    threshold: '≥ 2 × In for 200 ms',
    beravciValue: '2.4 × In · 250 ms',
    pass: true,
    note: 'Enables discrimination of local vs bulk faults',
  },
  {
    id: 'islanding',
    category: 'protection',
    rule: 'Anti-islanding detection',
    threshold: 'Disconnect within 2 s · IEEE 1547',
    beravciValue: '1.6 s avg · passive + active',
    pass: true,
    note: 'RoCoF + vector shift · both monitored',
  },
  {
    id: 'ferranti',
    category: 'voltage',
    rule: 'Ferranti rise on long MV cables',
    threshold: 'ΔV at PCC ≤ 3% at no-load',
    beravciValue: '2.2% @ 18.4 km · 35 kV',
    pass: true,
    note: 'Cable reactance · reactive compensation sized',
  },
];

export interface PQPoint {
  p: number;
  qLead: number;
  qLag: number;
}

export const pqEnvelope: PQPoint[] = [
  { p: 0, qLead: -0.4, qLag: 0.4 },
  { p: 0.2, qLead: -0.39, qLag: 0.39 },
  { p: 0.4, qLead: -0.37, qLag: 0.37 },
  { p: 0.6, qLead: -0.34, qLag: 0.34 },
  { p: 0.8, qLead: -0.29, qLag: 0.29 },
  { p: 1.0, qLead: -0.23, qLag: 0.23 },
];

export const curtailmentHistory = [
  { year: 2022, ratePct: 0.2, hours: 17, reason: 'Planned maintenance only' },
  { year: 2023, ratePct: 0.4, hours: 35, reason: 'Market negative prices × 3' },
  { year: 2024, ratePct: 0.6, hours: 52, reason: 'Summer over-generation start' },
  { year: 2025, ratePct: 0.8, hours: 70, reason: 'Queue growing · first mild congestion' },
];

export const curtailmentForecast = [
  { year: 2026, ratePct: 1.0, hours: 88 },
  { year: 2027, ratePct: 1.2, hours: 105 },
  { year: 2028, ratePct: 1.8, hours: 158 },
  { year: 2029, ratePct: 2.2, hours: 193 },
  { year: 2030, ratePct: 2.8, hours: 245 },
];

export const curtailmentDrivers = [
  { label: 'Negative market prices (noon peak)', sharePct: 42, tone: 'sun' },
  { label: 'N-1 contingency reserve', sharePct: 21, tone: 'pulse' },
  { label: 'TS Slavonski Brod transformer limit', sharePct: 18, tone: 'signal' },
  { label: 'Planned maintenance', sharePct: 12, tone: 'agri' },
  { label: 'Voltage balance on MV feeder', sharePct: 7, tone: 'spark' },
] as const;

export const curtailmentMitigations = [
  { label: '8 MWh storage · shift noon peak', savingsPct: 42, capex: '€2.24M', tone: 'pulse' },
  { label: 'Take-or-pay PPA clause', savingsPct: 25, capex: 'contract only', tone: 'agri' },
  { label: 'Oversize DC/AC to clip summer', savingsPct: 12, capex: '+€400k modules', tone: 'signal' },
  { label: 'Participate in balancing market', savingsPct: 18, capex: 'OMS integration', tone: 'sun' },
] as const;

export interface QueueEntry {
  position: number;
  project: string;
  operator: string;
  capacityMW: number;
  submissionDate: string;
  expectedConnection: string;
  isBeravci?: boolean;
}

export const gridQueue: QueueEntry[] = [
  { position: 1, project: 'Donji Miholjac AGV', operator: 'Enerkon', capacityMW: 18, submissionDate: '2024-03', expectedConnection: 'Q4 2026' },
  { position: 2, project: 'Vinkovci Solar Park', operator: 'HEP OIE', capacityMW: 42, submissionDate: '2024-05', expectedConnection: 'Q1 2027' },
  { position: 3, project: 'Požega SE', operator: 'Končar', capacityMW: 28, submissionDate: '2024-06', expectedConnection: 'Q1 2027' },
  { position: 4, project: 'Nova Gradiška PV', operator: 'Brodmerkur', capacityMW: 35, submissionDate: '2024-07', expectedConnection: 'Q2 2027' },
  { position: 5, project: 'Slavonski Brod Rooftop Cluster', operator: 'Sunkraft', capacityMW: 12, submissionDate: '2024-09', expectedConnection: 'Q2 2027' },
  { position: 6, project: 'Našice Biomass + PV', operator: 'Bioplin HR', capacityMW: 22, submissionDate: '2024-10', expectedConnection: 'Q2 2027' },
  { position: 7, project: 'Županja AGV', operator: 'Solida', capacityMW: 25, submissionDate: '2024-11', expectedConnection: 'Q2 2027' },
  { position: 8, project: 'Đakovo Solar', operator: 'HEP OIE', capacityMW: 30, submissionDate: '2024-12', expectedConnection: 'Q3 2027' },
  { position: 9, project: 'Osijek East SE', operator: 'Solvis', capacityMW: 40, submissionDate: '2025-01', expectedConnection: 'Q3 2027' },
  { position: 10, project: 'Vrpolje AGV', operator: 'Enerkon', capacityMW: 15, submissionDate: '2025-02', expectedConnection: 'Q3 2027' },
  { position: 11, project: 'Andrijaševci PV', operator: 'Brodmerkur Green', capacityMW: 20, submissionDate: '2025-03', expectedConnection: 'Q3 2027' },
  { position: 12, project: 'Županja North', operator: 'Sunkraft', capacityMW: 18, submissionDate: '2025-04', expectedConnection: 'Q3 2027' },
  { position: 13, project: 'Vukovar Utility', operator: 'Brodmerkur Green', capacityMW: 45, submissionDate: '2025-05', expectedConnection: 'Q3 2027' },
  { position: 14, project: 'Kopanica-Beravci Agri-PV', operator: 'Paladina Investments', capacityMW: 30, submissionDate: '2025-06', expectedConnection: 'Q3 2027', isBeravci: true },
  { position: 15, project: 'Mikanovci SE', operator: 'Končar', capacityMW: 18, submissionDate: '2025-07', expectedConnection: 'Q4 2027' },
  { position: 16, project: 'Gundinci AGV Pilot', operator: 'Solida', capacityMW: 8, submissionDate: '2025-08', expectedConnection: 'Q4 2027' },
];

export const queueStats = {
  totalProjects: 62,
  totalCapacityMW: 1_284,
  beravciPosition: 14,
  monthlyVelocity: 2.1, // positions/month
  estMonthsToConnection: 18,
  reviewBatchMonthly: 4,
};

export interface SingleLineNode {
  id: string;
  x: number;
  y: number;
  label: string;
  subLabel: string;
  kind: 'source' | 'switch' | 'trafo' | 'protection' | 'meter' | 'grid';
  tone: 'pulse' | 'sun' | 'signal' | 'agri' | 'spark';
}

export const singleLineNodes: SingleLineNode[] = [
  { id: 'pv', x: 40, y: 100, label: 'PV ARRAY', subLabel: '30 MWp · DC', kind: 'source', tone: 'sun' },
  { id: 'comb', x: 160, y: 100, label: 'COMBINERS', subLabel: '42 units', kind: 'switch', tone: 'pulse' },
  { id: 'inv', x: 280, y: 100, label: 'INVERTERS', subLabel: '140 × 215 kW', kind: 'switch', tone: 'signal' },
  { id: 'lv-board', x: 400, y: 100, label: 'LV SWBD', subLabel: '0.8 kV · 30 MW', kind: 'switch', tone: 'signal' },
  { id: 'mv-trafo', x: 520, y: 100, label: 'MV TRAFO', subLabel: '2 × 16 MVA · 0.8/35 kV', kind: 'trafo', tone: 'sun' },
  { id: 'mv-swbd', x: 640, y: 100, label: 'MV SWBD', subLabel: '35 kV ring', kind: 'switch', tone: 'pulse' },
  { id: 'prot', x: 760, y: 100, label: 'PROT · 87T · 50/51N', subLabel: 'IEC 61850 GOOSE', kind: 'protection', tone: 'spark' },
  { id: 'cable', x: 880, y: 100, label: '35 kV CABLE', subLabel: '18.4 km · Al 3×240', kind: 'switch', tone: 'signal' },
  { id: 'meter', x: 1000, y: 100, label: 'REVENUE METER', subLabel: 'class 0.2S · 4-Q', kind: 'meter', tone: 'agri' },
  { id: 'grid', x: 1120, y: 100, label: 'TS SB 1', subLabel: '110/35 kV · HOPS', kind: 'grid', tone: 'pulse' },
];
