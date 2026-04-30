/**
 * Land · deep-dive data for Beravci 80.3 ha.
 *
 * Sources:
 * - DGU geoportal · parcel metadata
 * - HPA (Hrvatska poljoprivredna agencija) · soil maps
 * - DHMZ (Državni hidrometeorološki zavod) · hydrology
 * - HŽ Infrastruktura · rail proximity
 * - HOPS grid topology · HV line distance
 * - Natura 2000 HR-90 dataset
 */

export interface SoilSample {
  depth: string;
  phH2o: number;
  clayPct: number;
  organicMatterPct: number;
  nitrogenGPerKg: number;
  bulkDensityGPerCm3: number;
}

export const soilProfile: SoilSample[] = [
  { depth: '0–30 cm', phH2o: 6.7, clayPct: 28, organicMatterPct: 2.4, nitrogenGPerKg: 1.8, bulkDensityGPerCm3: 1.32 },
  { depth: '30–60 cm', phH2o: 6.9, clayPct: 32, organicMatterPct: 1.6, nitrogenGPerKg: 1.2, bulkDensityGPerCm3: 1.41 },
  { depth: '60–100 cm', phH2o: 7.1, clayPct: 38, organicMatterPct: 0.8, nitrogenGPerKg: 0.7, bulkDensityGPerCm3: 1.48 },
];

export const soilSummary = {
  classification: 'Eutric Cambisol · WRB 2014',
  croatianClass: 'IV–V · adequate for agri-PV',
  drainage: 'moderately well-drained',
  bearingCapacityKpa: 180,
  bearingSuitabilityForPiles: 'adequate · pile-driving feasible',
  compactionRisk: 'low · winter trafficking OK',
  agriSuitability: 0.76, // 0..1 composite
  saltAlkalinity: 'none detected',
  fragiPan: 'absent',
};

export interface TopographyBin {
  slopePct: number;
  areaHa: number;
  areaShare: number; // 0..1
  tone: 'agri' | 'pulse' | 'sun' | 'spark';
}

export const slopeHistogram: TopographyBin[] = [
  { slopePct: 0, areaHa: 28.4, areaShare: 0.354, tone: 'agri' },
  { slopePct: 1, areaHa: 31.7, areaShare: 0.395, tone: 'agri' },
  { slopePct: 2, areaHa: 14.2, areaShare: 0.177, tone: 'pulse' },
  { slopePct: 3, areaHa: 4.8, areaShare: 0.060, tone: 'pulse' },
  { slopePct: 4, areaHa: 1.0, areaShare: 0.012, tone: 'sun' },
  { slopePct: 5, areaHa: 0.2, areaShare: 0.002, tone: 'spark' },
];

export const topographySummary = {
  elevationRange: [89, 97] as const,
  meanElevation: 92.8,
  meanSlopePct: 1.3,
  meanAspectDeg: 182,
  aspectClass: 'S · S-facing · ideal for PV',
  irregularity: 'gentle undulating · no gullies',
  solarHorizonShadow: '<1% loss · no east/west obstructions',
};

export const aspectRose = [
  { direction: 'N', share: 0.02 },
  { direction: 'NE', share: 0.04 },
  { direction: 'E', share: 0.08 },
  { direction: 'SE', share: 0.18 },
  { direction: 'S', share: 0.34 },
  { direction: 'SW', share: 0.21 },
  { direction: 'W', share: 0.09 },
  { direction: 'NW', share: 0.04 },
];

export const hydrology = {
  waterTableAvgM: -2.8,
  waterTableSeasonal: { spring: -1.6, summer: -3.4, autumn: -3.1, winter: -2.1 },
  floodZone100yr: 'none · outside Q100 Sava/Bosut floodplain',
  nearestWatercourseM: 640, // Bosut tributary "Breznički kanal"
  nearestWellM: 1420,
  permeabilityClass: 'moderate · 2·10⁻⁶ m/s',
  drainageDensityKmPerKm2: 2.1,
  runoffCoefficient: 0.32,
  erosionRisk: 'low',
};

export interface AccessRoute {
  kind: 'road' | 'rail' | 'hv-line' | 'mv-line' | 'pipeline';
  name: string;
  distanceKm: number;
  note: string;
  tone: 'pulse' | 'agri' | 'signal' | 'sun' | 'spark';
}

export const accessRoutes: AccessRoute[] = [
  { kind: 'road', name: 'D7 state road', distanceKm: 1.8, note: 'asphalt · two-lane · truck-capable', tone: 'pulse' },
  { kind: 'road', name: 'L46023 municipal road', distanceKm: 0.3, note: 'asphalt · connects to parcel directly', tone: 'agri' },
  { kind: 'rail', name: 'HŽ Infrastruktura M103', distanceKm: 6.4, note: 'Slavonski Brod – Vrpolje · cargo siding @ 4.2 km', tone: 'signal' },
  { kind: 'hv-line', name: '110 kV Slavonski Brod', distanceKm: 18.4, note: 'designated connection corridor', tone: 'sun' },
  { kind: 'mv-line', name: '20 kV feeder · Velika Kopanica', distanceKm: 0.9, note: 'for construction power', tone: 'pulse' },
  { kind: 'pipeline', name: 'no gas/oil pipeline within 2 km', distanceKm: 99, note: 'no encumbrance · clear build corridor', tone: 'agri' },
];

export interface RegulatoryItem {
  label: string;
  status: 'ok' | 'pending' | 'caution' | 'blocked';
  note: string;
}

export const regulatoryChecklist: RegulatoryItem[] = [
  { label: 'UPU (local spatial plan) amendment', status: 'pending', note: 'Q2 2026 consultation · public hearing 2026-05-20' },
  { label: 'PPUO (county plan) alignment', status: 'ok', note: 'Brodsko-posavska plan 2022–2030 · solar-compatible' },
  { label: 'Environmental screening (OIEO)', status: 'ok', note: 'no Natura 2000 overlap · no rare habitat · screening passed' },
  { label: 'Cultural heritage (kulturna dobra)', status: 'ok', note: 'no listed monuments · no archaeological reservation' },
  { label: 'Building permit (građevinska)', status: 'pending', note: 'scheduled after UPU adoption · est. Q4 2026' },
  { label: 'Grid connection study (HOPS)', status: 'ok', note: 'queue position #14 · TS Slavonski Brod 1' },
  { label: 'Water use permit', status: 'ok', note: 'not required · dry panel cleaning' },
  { label: 'Agricultural land conversion fee', status: 'caution', note: 'waived under dual-use AGV rule if sheep grazing maintained' },
  { label: 'Landowner clear title', status: 'ok', note: 'Paladina Investments 100% · no liens · no encumbrances' },
  { label: 'Neighbour consent (susjedni zemljišnik)', status: 'ok', note: 'all 6 adjacent parcels consulted · 5 signed · 1 neutral' },
];

export interface EnvConstraint {
  label: string;
  value: string;
  tone: 'agri' | 'pulse' | 'sun' | 'spark';
  note: string;
}

export const environmentalConstraints: EnvConstraint[] = [
  { label: 'Natura 2000 overlap', value: '0 m²', tone: 'agri', note: 'clear · nearest site HR1000005 @ 14 km' },
  { label: 'Protected species corridor', value: 'none', tone: 'agri', note: 'no bat / raptor migration flyways' },
  { label: 'Distance to nearest settlement', value: '0.3 km', tone: 'sun', note: 'Beravci village · noise modelling required for inverter stations' },
  { label: 'Nearest school/hospital', value: '0.8 km', tone: 'pulse', note: 'Beravci primary school · EMF compliance fine' },
  { label: 'Glare risk (FAA SGHAT)', value: '<0.5 min/yr', tone: 'agri', note: 'modeled · below ICAO and HCAA thresholds' },
  { label: 'Biodiversity baseline survey', value: 'completed', tone: 'agri', note: '2026-02-18 · under EIP-AGRI operational group' },
];

export const viabilityScore = {
  composite: 87, // 0..100
  components: [
    { label: 'Solar resource', score: 92, weight: 0.2, tone: 'sun' as const },
    { label: 'Grid access', score: 74, weight: 0.2, tone: 'signal' as const },
    { label: 'Soil & topography', score: 88, weight: 0.15, tone: 'agri' as const },
    { label: 'Regulatory path', score: 82, weight: 0.15, tone: 'pulse' as const },
    { label: 'Environmental risk', score: 95, weight: 0.1, tone: 'agri' as const },
    { label: 'Market proximity', score: 86, weight: 0.1, tone: 'pulse' as const },
    { label: 'Land clear title', score: 100, weight: 0.1, tone: 'agri' as const },
  ],
};
