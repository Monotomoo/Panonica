/**
 * Project Store — Full EPC-grade state for the /build route.
 *
 * This is the engineering source of truth for every technical and financial
 * input an investor, EPC, bank, or regulator would ever ask about.
 * 16 sections · ~120 fields.
 *
 * Separate from `configStore` (which is the lighter Configurator state).
 * They cross-link: Builder can "send to Configurator" and vice versa.
 */

import { create } from 'zustand';

/* ============================== 01 · SITE ============================== */

export interface SiteState {
  projectName: string;
  ownerEntity: string;
  polygonCoords: [number, number][] | null;  // WGS84 [lon, lat]
  centroidLat: number;
  centroidLon: number;
  areaHa: number;
  elevationMinM: number;
  elevationMaxM: number;
  meanSlopePct: number;
  meanAspectDeg: number;
  soilWrbClass: 'Eutric Cambisol' | 'Fluvisol' | 'Luvisol' | 'Gleysol' | 'Stagnosol' | 'other';
  soilBearingKpa: number;
  drainageClass: 'excessive' | 'well' | 'moderate' | 'imperfect' | 'poor';
  waterTableAvgM: number;
  floodZone100yr: 'clear' | 'marginal' | 'inside';
  prevLandUse: 'arable' | 'pasture' | 'fallow' | 'orchard' | 'industrial' | 'mixed';
  accessRoadsKm: number;
  setbacksBoundaryM: number;
}

/* ========================= 02 · CLIMATE & RESOURCE ===================== */

export interface ClimateState {
  ghiKwhM2Yr: number;  // Global horizontal irradiance
  dniKwhM2Yr: number;
  dhiKwhM2Yr: number;
  peakSunHours: number;
  ambientTempMinC: number;
  ambientTempMaxC: number;
  ambientTempAvgC: number;
  windDesignMps: number;  // 50-year return
  snowLoadKpa: number;
  seismicZoneMSK: number; // 1..10
  hailDaysPerYear: number;
  droughtDaysPerYear: number;
  soilingLossPctYr: number;
  weatherStationRef: string;
}

/* ============================ 03 · LAND USE =========================== */

export interface LandUseState {
  zoningClass: string;
  upuStatus: 'approved' | 'pending' | 'amendment' | 'not-required';
  upuConsultationDate: string;
  agriClassification: 'preserved' | 'conversion-required' | 'dual-use' | 'non-agricultural';
  setbackBoundaryM: number;
  setbackRoadM: number;
  setbackBuildingM: number;
  setbackWaterCourseM: number;
  natura2000OverlapM2: number;
  protectedSpeciesNote: string;
  culturalHeritageNote: string;
  glareRiskMinPerYr: number;
  noiseLimitDbA: number;
  neighbourConsentStatus: 'all-signed' | 'majority' | 'pending' | 'disputed';
}

/* ============================= 04 · GENERATION ========================= */

export interface GenerationState {
  moduleMake: string;
  moduleModel: string;
  moduleWp: number;
  moduleVoc: number;
  moduleIsc: number;
  moduleVmpp: number;
  moduleImpp: number;
  moduleAreaM2: number;
  moduleEfficiencyPct: number;
  moduleBifacial: boolean;
  moduleBifacialGainPct: number;
  moduleTempCoefPct: number; // %/°C
  moduleFirstYearDegradationPct: number;
  moduleAnnualDegradationPct: number;
  moduleWarrantyYears: number;
  tilt: 'fixed' | 'seasonal' | '1-axis' | '2-axis';
  tiltDeg: number;
  azimuthDeg: number;
  trackRangeDeg: number;
  foundation: 'pile-driven' | 'screw' | 'ballast' | 'concrete';
  groundCoverageRatio: number;
  rowPitchM: number;
  panelHeightMinM: number;
  panelHeightMaxM: number;
  pileLengthM: number;
  moduleCountTarget: number;
  capacityDcKw: number;
}

/* ========================= 05 · POWER ELECTRONICS ===================== */

export interface PowerElectronicsState {
  inverterTopology: 'string' | 'central' | 'micro' | 'hybrid';
  inverterMake: string;
  inverterModel: string;
  inverterKw: number;
  inverterEffCec: number;
  inverterEffMax: number;
  inverterMpptChannels: number;
  inverterMpptVmin: number;
  inverterMpptVmax: number;
  inverterIpRating: string;
  inverterCount: number;
  dcAcRatio: number;
  stringsPerMppt: number;
  modulesPerString: number;
  vocStackV: number;  // derived, check vs inverterMpptVmax+safety
  iscPerStringA: number;
  dcCableMm2: number;
  dcCableLengthAvgM: number;
  acCollectionVoltageV: number;
  acCableMm2: number;
  acCableLengthAvgM: number;
  acCableMaterial: 'aluminium' | 'copper';
  transformerKva: number;
  transformerVectorGroup: string;
  transformerNoLoadLossesKw: number;
  transformerLoadLossesKw: number;
  transformerCount: number;
  protectionScheme: 'NH-fuses' | 'MCCB' | 'MCCB+relays' | 'differential+87T';
  surgeArrestersInstalled: boolean;
  lightningRodsCount: number;
}

/* ========================== 06 · GRID CONNECTION ====================== */

export interface GridConnectionState {
  pccSubstation: string;
  pccVoltageKv: number;
  pccDistanceKm: number;
  cableRouteOption: 'direct' | 'along-road' | 'mixed';
  cableMaterial: 'aluminium' | 'copper';
  cableCrossSectionMm2: number;
  cableInstallation: 'duct' | 'direct-bury' | 'aerial' | 'mixed';
  ferrantiRisePct: number;
  shortCircuitKa: number;
  earthingScheme: 'TN-S' | 'TN-C-S' | 'TT' | 'IT';
  mvSwitchgearMake: string;
  meteringClass: '0.2S' | '0.5S' | '1';
  reactivePowerKvar: number;
  reactiveCompensationType: 'capacitor' | 'STATCOM' | 'SVC' | 'none';
  lvrtCompliant: boolean;
  hvrtCompliant: boolean;
  frequencyResponseCompliant: boolean;
  thdPct: number;
  flickerPst: number;
  communicationProtocol: 'IEC 61850' | 'Modbus TCP' | 'DNP3' | 'proprietary';
  gridQueuePosition: number;
  gridQueueTotal: number;
  expectedConnectionDate: string;
}

/* ============================ 07 · STORAGE ============================ */

export interface StorageState {
  enabled: boolean;
  energyMwh: number;
  powerMw: number;
  chemistry: 'lfp' | 'nmc' | 'flow' | 'sodium-ion' | 'sla';
  cRateCharge: number;
  cRateDischarge: number;
  roundTripEffPct: number;
  cyclesTo80Pct: number;
  dodPct: number;
  thermalManagement: 'passive-air' | 'forced-air' | 'liquid';
  fireSuppressionSystem: 'water-mist' | 'aerosol' | 'inert-gas' | 'none';
  bmsVendor: string;
  emsVendor: string;
  gridServicesEnabled: ('arbitrage' | 'freq-response' | 'capacity-market' | 'black-start' | 'spinning-reserve')[];
  degradationPerYearPct: number;
  cycleLifeCosted: boolean;
  augmentationPlanned: boolean;
}

/* ========================== 08 · AGRICULTURE ========================== */

export interface AgricultureState {
  system: 'none' | 'sheep' | 'soy' | 'herbs' | 'berries' | 'bees' | 'mixed-rotation';
  stockingRateHeadPerHa: number;
  flockSizeHead: number;
  breed: 'romanov' | 'dalmatian-pramenka' | 'merinolandschaf' | 'mixed' | 'n/a';
  grazingPaddocks: number;
  coopPartner: string;
  coopSharePct: number;
  capPillar1Eligible: boolean;
  capPillar2Ecoscheme: boolean;
  eipAgriOperational: boolean;
  organicConversionPlanned: boolean;
  crcfCarbonCreditEligible: boolean;
  annualAgriRevenueEur: number;
  annualCapPaymentsEur: number;
}

/* ============================ 09 · CIVIL & BoS ======================== */

export interface CivilBosState {
  sitePrepCutM3: number;
  sitePrepFillM3: number;
  topsoilStrippedM3: number;
  drainageLengthM: number;
  internalRoadsLengthM: number;
  internalRoadsSurface: 'gravel' | 'asphalt' | 'compacted-earth';
  fencePerimeterM: number;
  fenceHeightM: number;
  fenceGauge: 'light' | 'medium' | 'heavy';
  fenceType: 'mesh' | 'palisade' | 'rabbit-proof';
  cctvCount: number;
  cctvThermalCount: number;
  motionSensorsCount: number;
  lightingStrategy: 'on-demand' | 'always-on' | 'dusk-to-dawn' | 'none';
  lightingPolesCount: number;
  omBuildingAreaM2: number;
  parkingSpaces: number;
  cableTrenchDepthCm: number;
  cableTrenchWidthCm: number;
  sparePartsStoreAreaM2: number;
}

/* ========================= 10 · SCADA & TELEMETRY ===================== */

export interface ScadaState {
  scadaMasterVendor: string;
  scadaProtocol: 'IEC 61850' | 'Modbus TCP' | 'DNP3' | 'OPC UA';
  telemetryPollingMs: number;
  dataRetentionDays: number;
  commsBackbone: 'fiber' | 'cellular-4g' | 'cellular-5g' | 'radio' | 'hybrid';
  commsRedundancy: boolean;
  localHmiCount: number;
  remoteAccess: 'vpn' | 'direct' | 'jump-host' | 'operator-only';
  cyberHardening: 'baseline' | 'iec-62443-2-4' | 'iec-62443-3-3' | 'custom';
  iecCertified: boolean;
  agrosIntegrationEnabled: boolean;
}

/* ============================== 11 · FINANCE ========================== */

export interface FinanceStateFull {
  discountRatePct: number;
  inflationRatePct: number;
  corporateTaxRatePct: number;
  vatRatePct: number;
  propertyTaxRatePct: number;
  depreciationLife: number;
  ppaPriceEurMwh: number;
  ppaTenorYears: number;
  ppaEscalationPctYr: number;
  ppaTakeOrPay: boolean;
  ppaPriceFloor: boolean;
  guaranteesOfOriginRevenueEurMwh: number;
  capacityMarketRevenueEurMwYr: number;
  senior_debtPct: number;
  senior_ratePct: number;
  senior_tenorYears: number;
  senior_dscrCovenant: number;
  mezzanine_debtPct: number;
  mezzanine_ratePct: number;
  sponsorEquityPct: number;
  equityIrrTargetPct: number;
  dividendPolicy: 'quarterly' | 'annual' | 'at-refi' | 'at-exit';
  refinancingYear: number;
  exitYear: number;
  exitCapRatePct: number;
  insuranceAnnualEur: number;
  contingencyPctCapex: number;
}

/* ============================ 12 · PERMITTING ========================= */

export interface PermittingState {
  upuAmendment: PermitStatus;
  ppuoAlignment: PermitStatus;
  oieoScreening: PermitStatus;
  culturalHeritage: PermitStatus;
  buildingPermit: PermitStatus;
  gridConnectionStudy: PermitStatus;
  waterUsePermit: PermitStatus;
  agriConversionFee: PermitStatus;
  landTitle: PermitStatus;
  neighbourConsent: PermitStatus;
}

export type PermitStatus = 'ok' | 'pending' | 'caution' | 'blocked' | 'n/a';

/* ============================ 13 · CONSTRUCTION ======================= */

export interface ConstructionState {
  epcContractType: 'turnkey' | 'split' | 'multi-contract' | 'design-build' | 'direct';
  mainEpc: string;
  groundBreakingMonth: number;  // months from today
  codMonth: number;
  designMonths: number;
  permittingMonths: number;
  procurementMonths: number;
  civilMonths: number;
  installMonths: number;
  electricalMonths: number;
  commissioningMonths: number;
  peakCrewSize: number;
  qualityStandard: 'IEC 62446-1' | 'ISO 9001' | 'TÜV' | 'custom';
  hseStandard: 'ISO 45001' | 'OHSAS 18001' | 'local';
  liquidatedDamagesPctPerWeek: number;
  performanceBondPctCapex: number;
}

/* ============================ 14 · OPERATIONS ========================= */

export interface OperationsState {
  omModel: 'in-house' | 'outsourced' | 'hybrid';
  omPartner: string;
  omContractYears: number;
  monitoringFrequency: 'realtime' | '1min' | '5min' | '15min' | 'hourly';
  performanceRatioTarget: number;
  availabilityGuaranteePct: number;
  maintenanceResponseSla: string;
  preventiveMaintenanceCycles: number;
  sparePartsInventoryEur: number;
  moduleCleaningStrategy: 'rain-only' | 'scheduled-2x' | 'scheduled-4x' | 'robotic-daily';
  vegetationManagement: 'sheep' | 'mowing' | 'herbicide' | 'mixed';
}

/* ========================= 15 · RISK & INSURANCE ====================== */

export interface RiskInsuranceState {
  propertyAllRiskCover: boolean;
  revenueLossCover: boolean;
  liabilityCover: boolean;
  cyberCover: boolean;
  environmentalCover: boolean;
  insurancePremiumAnnualEur: number;
  deductibleEur: number;
  forceMajeureList: string[];
  climateScenario: 'current' | 'rcp45' | 'rcp85';
  hedging: 'none' | 'ppa-floor' | 'collar' | 'forwards';
  counterpartyConcentrationPct: number;
}

/* ============================ 16 · ESG & EXIT ========================= */

export interface EsgExitState {
  lifecycleCarbonTco2PerMwp: number;
  waterUseM3PerYr: number;
  biodiversityBaselineScore: number;
  biodiversityUpliftPctAt5yr: number;
  euTaxonomyDnshCompliant: boolean;
  crcfCarbonCreditAnnualTco2: number;
  communityBenefitsEurYr: number;
  localEmploymentFte: number;
  modernSlaveryCheckDone: boolean;
  conflictMineralsCheckDone: boolean;
  exitScenarioType: 'ipp-strategic' | 'infra-fund' | 'yieldco-ipo' | 'hold-to-maturity';
  targetAcquirerPool: string[];
}

/* =========================== META / PROGRESS ========================== */

export interface ProjectMeta {
  preset: 'blank' | 'beravci-default' | 'ribic-breg' | 'obrovac' | 'worst-case' | 'custom';
  createdAt: string;
  lastEditedAt: string;
  version: string;
  sectionStatus: Record<SectionKey, 'empty' | 'partial' | 'complete' | 'invalid'>;
  changelog: { at: string; path: string; from: unknown; to: unknown }[];
}

export type SectionKey =
  | 'site'
  | 'climate'
  | 'landUse'
  | 'generation'
  | 'powerElectronics'
  | 'gridConnection'
  | 'storage'
  | 'agriculture'
  | 'civilBos'
  | 'scada'
  | 'finance'
  | 'permitting'
  | 'construction'
  | 'operations'
  | 'riskInsurance'
  | 'esgExit';

export const SECTION_ORDER: SectionKey[] = [
  'site',
  'climate',
  'landUse',
  'generation',
  'powerElectronics',
  'gridConnection',
  'storage',
  'agriculture',
  'civilBos',
  'scada',
  'finance',
  'permitting',
  'construction',
  'operations',
  'riskInsurance',
  'esgExit',
];

export const SECTION_LABELS: Record<SectionKey, { num: string; title: string; tone: string }> = {
  site: { num: '01', title: 'Site', tone: 'pulse' },
  climate: { num: '02', title: 'Climate & Resource', tone: 'sun' },
  landUse: { num: '03', title: 'Land Use', tone: 'agri' },
  generation: { num: '04', title: 'Generation', tone: 'sun' },
  powerElectronics: { num: '05', title: 'Power Electronics', tone: 'signal' },
  gridConnection: { num: '06', title: 'Grid Connection', tone: 'signal' },
  storage: { num: '07', title: 'Storage', tone: 'pulse' },
  agriculture: { num: '08', title: 'Agriculture', tone: 'agri' },
  civilBos: { num: '09', title: 'Civil & BoS', tone: 'pulse' },
  scada: { num: '10', title: 'SCADA & Telemetry', tone: 'signal' },
  finance: { num: '11', title: 'Finance', tone: 'agri' },
  permitting: { num: '12', title: 'Permitting', tone: 'pulse' },
  construction: { num: '13', title: 'Construction', tone: 'sun' },
  operations: { num: '14', title: 'Operations', tone: 'pulse' },
  riskInsurance: { num: '15', title: 'Risk & Insurance', tone: 'spark' },
  esgExit: { num: '16', title: 'ESG & Exit', tone: 'agri' },
};

/* =============================== STORE =============================== */

export interface ProjectState {
  site: SiteState;
  climate: ClimateState;
  landUse: LandUseState;
  generation: GenerationState;
  powerElectronics: PowerElectronicsState;
  gridConnection: GridConnectionState;
  storage: StorageState;
  agriculture: AgricultureState;
  civilBos: CivilBosState;
  scada: ScadaState;
  finance: FinanceStateFull;
  permitting: PermittingState;
  construction: ConstructionState;
  operations: OperationsState;
  riskInsurance: RiskInsuranceState;
  esgExit: EsgExitState;
  meta: ProjectMeta;
}

export interface ProjectStore extends ProjectState {
  update: <S extends SectionKey, K extends keyof ProjectState[S]>(
    section: S,
    key: K,
    value: ProjectState[S][K],
  ) => void;
  loadPreset: (preset: ProjectMeta['preset']) => void;
  resetSection: (section: SectionKey) => void;
  resetAll: () => void;
  hydrate: (state: Partial<ProjectState>) => void;
  getCompletionPct: () => number;
}

/* ============================ DEFAULTS =============================== */

const blankSite: SiteState = {
  projectName: '',
  ownerEntity: '',
  polygonCoords: null,
  centroidLat: 45.1348,
  centroidLon: 18.4130,
  areaHa: 0,
  elevationMinM: 0,
  elevationMaxM: 0,
  meanSlopePct: 0,
  meanAspectDeg: 180,
  soilWrbClass: 'Eutric Cambisol',
  soilBearingKpa: 150,
  drainageClass: 'moderate',
  waterTableAvgM: -2.5,
  floodZone100yr: 'clear',
  prevLandUse: 'arable',
  accessRoadsKm: 0,
  setbacksBoundaryM: 5,
};

// Real parcel geometry · digitized from Paladina "velika kopanica_teaser_2020" PDF
// Business Zone Velika Kopanica · bordered by A3 (W), D7 (S), MP13C railway (E),
// Moštanik + Međašnje Ždrilo canals (N). Railway station = "Kopanica-Beravci"
// (this is where the legacy "Beravci" project name came from — it's the station,
// not the village). Centroid 45.1348°N 18.4130°E · area ~80.3 ha via turf.js.
// 7-vertex irregular polygon, elongated NNE-SSW to match cadastral footprint.
const kopanicaBeravciSite: SiteState = {
  projectName: 'Kopanica-Beravci Agrivoltaic Zone',
  ownerEntity: 'Paladina Investments',
  polygonCoords: [
    [18.4120, 45.1402], // N  — narrow northern tip, canal border
    [18.4160, 45.1388], // NE — bending east along irrigation channel
    [18.4180, 45.1345], // E  — MP13C railway border
    [18.4170, 45.1305], // SE — near Kopanica-Beravci station
    [18.4135, 45.1285], // S  — D7 state road border
    [18.4085, 45.1305], // SW — A3 exit cloverleaf (west of parcel)
    [18.4082, 45.1355], // W  — A3 motorway shoulder
  ],
  centroidLat: 45.1348,
  centroidLon: 18.4130,
  areaHa: 80.3,
  elevationMinM: 86,
  elevationMaxM: 91,
  meanSlopePct: 0.7, // Posavina floodplain · near-flat
  meanAspectDeg: 182,
  soilWrbClass: 'Fluvisol',  // Sava valley alluvium · more accurate than Cambisol
  soilBearingKpa: 160,
  drainageClass: 'imperfect', // near Moštanik canal · water table shallow
  waterTableAvgM: -1.8,
  floodZone100yr: 'marginal', // Sava 2.5 km S · parcel on higher terrace
  prevLandUse: 'arable',
  accessRoadsKm: 0.3,
  setbacksBoundaryM: 5,
};

const beravciClimate: ClimateState = {
  ghiKwhM2Yr: 1382,
  dniKwhM2Yr: 1620,
  dhiKwhM2Yr: 595,
  peakSunHours: 4.9,
  ambientTempMinC: -14,
  ambientTempMaxC: 37,
  ambientTempAvgC: 11.2,
  windDesignMps: 27,
  snowLoadKpa: 1.2,
  seismicZoneMSK: 7,
  hailDaysPerYear: 0.8,
  droughtDaysPerYear: 12,
  soilingLossPctYr: 3.1,
  weatherStationRef: 'DHMZ Slavonski Brod · 23.6 km · ISO 9060 Class-B',
};

const beravciLandUse: LandUseState = {
  zoningClass: 'Agricultural / gospodarska zona',
  upuStatus: 'amendment',
  upuConsultationDate: '2026-05-20',
  agriClassification: 'dual-use',
  setbackBoundaryM: 5,
  setbackRoadM: 10,
  setbackBuildingM: 15,
  setbackWaterCourseM: 30,
  natura2000OverlapM2: 0,
  protectedSpeciesNote: 'no migration corridors · baseline survey 2026-02-18',
  culturalHeritageNote: 'no listed monuments · no archaeological reservation',
  glareRiskMinPerYr: 0.4,
  noiseLimitDbA: 55,
  neighbourConsentStatus: 'majority',
};

const beravciGeneration: GenerationState = {
  moduleMake: 'JinkoSolar',
  moduleModel: 'Tiger Neo 620 n-TOPCon',
  moduleWp: 620,
  moduleVoc: 54.8,
  moduleIsc: 14.34,
  moduleVmpp: 45.9,
  moduleImpp: 13.51,
  moduleAreaM2: 2.79,
  moduleEfficiencyPct: 22.5,
  moduleBifacial: true,
  moduleBifacialGainPct: 8,
  moduleTempCoefPct: -0.30,
  moduleFirstYearDegradationPct: 1.0,
  moduleAnnualDegradationPct: 0.40,
  moduleWarrantyYears: 30,
  tilt: 'fixed',
  tiltDeg: 25,
  azimuthDeg: 180,
  trackRangeDeg: 0,
  foundation: 'pile-driven',
  groundCoverageRatio: 0.38,
  rowPitchM: 8.5,
  panelHeightMinM: 1.2,
  panelHeightMaxM: 4.2,
  pileLengthM: 2.4,
  moduleCountTarget: 48_387,
  capacityDcKw: 30_000,
};

const beravciPower: PowerElectronicsState = {
  inverterTopology: 'string',
  inverterMake: 'SMA',
  inverterModel: 'Sunny Tripower CORE2 STP 110-60',
  inverterKw: 110,
  inverterEffCec: 98.6,
  inverterEffMax: 98.9,
  inverterMpptChannels: 12,
  inverterMpptVmin: 500,
  inverterMpptVmax: 1000,
  inverterIpRating: 'IP65',
  inverterCount: 218,
  dcAcRatio: 1.25,
  stringsPerMppt: 2,
  modulesPerString: 26,
  vocStackV: 1425,
  iscPerStringA: 14.34,
  dcCableMm2: 6,
  dcCableLengthAvgM: 120,
  acCollectionVoltageV: 800,
  acCableMm2: 240,
  acCableLengthAvgM: 180,
  acCableMaterial: 'aluminium',
  transformerKva: 16_000,
  transformerVectorGroup: 'Dyn11',
  transformerNoLoadLossesKw: 14,
  transformerLoadLossesKw: 78,
  transformerCount: 2,
  protectionScheme: 'differential+87T',
  surgeArrestersInstalled: true,
  lightningRodsCount: 14,
};

const beravciGrid: GridConnectionState = {
  pccSubstation: 'TS Slavonski Brod 1 · 110/35 kV',
  pccVoltageKv: 35,
  pccDistanceKm: 22.8,
  cableRouteOption: 'along-road',
  cableMaterial: 'aluminium',
  cableCrossSectionMm2: 240,
  cableInstallation: 'direct-bury',
  ferrantiRisePct: 2.2,
  shortCircuitKa: 12,
  earthingScheme: 'TN-S',
  mvSwitchgearMake: 'Končar / ABB',
  meteringClass: '0.2S',
  reactivePowerKvar: 6000,
  reactiveCompensationType: 'capacitor',
  lvrtCompliant: true,
  hvrtCompliant: true,
  frequencyResponseCompliant: true,
  thdPct: 2.8,
  flickerPst: 0.42,
  communicationProtocol: 'IEC 61850',
  gridQueuePosition: 14,
  gridQueueTotal: 62,
  expectedConnectionDate: '2027-09-01',
};

const beravciStorage: StorageState = {
  enabled: true,
  energyMwh: 12,
  powerMw: 6,
  chemistry: 'lfp',
  cRateCharge: 0.5,
  cRateDischarge: 0.5,
  roundTripEffPct: 92,
  cyclesTo80Pct: 6500,
  dodPct: 90,
  thermalManagement: 'liquid',
  fireSuppressionSystem: 'aerosol',
  bmsVendor: 'CATL / Sungrow',
  emsVendor: 'Sungrow EMS3000',
  gridServicesEnabled: ['arbitrage', 'freq-response'],
  degradationPerYearPct: 2.0,
  cycleLifeCosted: true,
  augmentationPlanned: true,
};

const beravciAgri: AgricultureState = {
  system: 'sheep',
  stockingRateHeadPerHa: 1.2,
  flockSizeHead: 96,
  breed: 'dalmatian-pramenka',
  grazingPaddocks: 4,
  coopPartner: 'Pramenka Slavonia Agri-PV Cooperative',
  coopSharePct: 30,
  capPillar1Eligible: true,
  capPillar2Ecoscheme: true,
  eipAgriOperational: true,
  organicConversionPlanned: false,
  crcfCarbonCreditEligible: true,
  annualAgriRevenueEur: 117_000,
  annualCapPaymentsEur: 33_000,
};

const beravciCivil: CivilBosState = {
  sitePrepCutM3: 8200,
  sitePrepFillM3: 6400,
  topsoilStrippedM3: 12_000,
  drainageLengthM: 1800,
  internalRoadsLengthM: 2400,
  internalRoadsSurface: 'gravel',
  fencePerimeterM: 3850,
  fenceHeightM: 2.4,
  fenceGauge: 'medium',
  fenceType: 'rabbit-proof',
  cctvCount: 10,
  cctvThermalCount: 4,
  motionSensorsCount: 18,
  lightingStrategy: 'on-demand',
  lightingPolesCount: 12,
  omBuildingAreaM2: 120,
  parkingSpaces: 10,
  cableTrenchDepthCm: 80,
  cableTrenchWidthCm: 50,
  sparePartsStoreAreaM2: 60,
};

const beravciScada: ScadaState = {
  scadaMasterVendor: 'Sungrow iSolarCloud · Schneider EcoStruxure',
  scadaProtocol: 'IEC 61850',
  telemetryPollingMs: 1000,
  dataRetentionDays: 1825,
  commsBackbone: 'fiber',
  commsRedundancy: true,
  localHmiCount: 2,
  remoteAccess: 'vpn',
  cyberHardening: 'iec-62443-2-4',
  iecCertified: true,
  agrosIntegrationEnabled: true,
};

const beravciFinance: FinanceStateFull = {
  discountRatePct: 8,
  inflationRatePct: 2,
  corporateTaxRatePct: 12,
  vatRatePct: 25,
  propertyTaxRatePct: 0.3,
  depreciationLife: 25,
  ppaPriceEurMwh: 95,
  ppaTenorYears: 25,
  ppaEscalationPctYr: 1.5,
  ppaTakeOrPay: true,
  ppaPriceFloor: true,
  guaranteesOfOriginRevenueEurMwh: 3,
  capacityMarketRevenueEurMwYr: 3200,
  senior_debtPct: 65,
  senior_ratePct: 4.75,
  senior_tenorYears: 15,
  senior_dscrCovenant: 1.30,
  mezzanine_debtPct: 10,
  mezzanine_ratePct: 8.5,
  sponsorEquityPct: 25,
  equityIrrTargetPct: 12,
  dividendPolicy: 'annual',
  refinancingYear: 8,
  exitYear: 10,
  exitCapRatePct: 6.5,
  insuranceAnnualEur: 116_000,
  contingencyPctCapex: 8,
};

const beravciPermitting: PermittingState = {
  upuAmendment: 'pending',
  ppuoAlignment: 'ok',
  oieoScreening: 'ok',
  culturalHeritage: 'ok',
  buildingPermit: 'pending',
  gridConnectionStudy: 'ok',
  waterUsePermit: 'ok',
  agriConversionFee: 'caution',
  landTitle: 'ok',
  neighbourConsent: 'ok',
};

const beravciConstruction: ConstructionState = {
  epcContractType: 'turnkey',
  mainEpc: 'TBD · Končar Obnovljivi izvori · Solida d.o.o.',
  groundBreakingMonth: 8,
  codMonth: 17,
  designMonths: 3,
  permittingMonths: 6,
  procurementMonths: 4,
  civilMonths: 3,
  installMonths: 3,
  electricalMonths: 3,
  commissioningMonths: 1.5,
  peakCrewSize: 72,
  qualityStandard: 'IEC 62446-1',
  hseStandard: 'ISO 45001',
  liquidatedDamagesPctPerWeek: 0.2,
  performanceBondPctCapex: 10,
};

const beravciOps: OperationsState = {
  omModel: 'hybrid',
  omPartner: 'Solida d.o.o. · 5-yr contract',
  omContractYears: 5,
  monitoringFrequency: '1min',
  performanceRatioTarget: 0.843,
  availabilityGuaranteePct: 98.5,
  maintenanceResponseSla: '24h response · 72h resolution',
  preventiveMaintenanceCycles: 4,
  sparePartsInventoryEur: 320_000,
  moduleCleaningStrategy: 'scheduled-2x',
  vegetationManagement: 'sheep',
};

const beravciRisk: RiskInsuranceState = {
  propertyAllRiskCover: true,
  revenueLossCover: true,
  liabilityCover: true,
  cyberCover: true,
  environmentalCover: false,
  insurancePremiumAnnualEur: 116_000,
  deductibleEur: 50_000,
  forceMajeureList: ['hail', 'flood', 'theft', 'fire', 'grid-fault', 'cyber'],
  climateScenario: 'current',
  hedging: 'ppa-floor',
  counterpartyConcentrationPct: 100,
};

const beravciEsg: EsgExitState = {
  lifecycleCarbonTco2PerMwp: 680,
  waterUseM3PerYr: 0,
  biodiversityBaselineScore: 62,
  biodiversityUpliftPctAt5yr: 25,
  euTaxonomyDnshCompliant: true,
  crcfCarbonCreditAnnualTco2: 42_000,
  communityBenefitsEurYr: 18_000,
  localEmploymentFte: 8,
  modernSlaveryCheckDone: true,
  conflictMineralsCheckDone: true,
  exitScenarioType: 'infra-fund',
  targetAcquirerPool: ['Sonnedix', 'Ib Vogt', 'HEP OIE', 'Končar', 'Solida consortium'],
};

function freshMeta(preset: ProjectMeta['preset']): ProjectMeta {
  return {
    preset,
    createdAt: new Date().toISOString(),
    lastEditedAt: new Date().toISOString(),
    version: '0.1',
    sectionStatus: Object.fromEntries(
      SECTION_ORDER.map((k) => [k, preset === 'blank' ? 'empty' : 'complete']),
    ) as Record<SectionKey, 'empty' | 'partial' | 'complete' | 'invalid'>,
    changelog: [],
  };
}

export const BERAVCI_DEFAULT: ProjectState = {
  site: kopanicaBeravciSite,
  climate: beravciClimate,
  landUse: beravciLandUse,
  generation: beravciGeneration,
  powerElectronics: beravciPower,
  gridConnection: beravciGrid,
  storage: beravciStorage,
  agriculture: beravciAgri,
  civilBos: beravciCivil,
  scada: beravciScada,
  finance: beravciFinance,
  permitting: beravciPermitting,
  construction: beravciConstruction,
  operations: beravciOps,
  riskInsurance: beravciRisk,
  esgExit: beravciEsg,
  meta: freshMeta('beravci-default'),
};

export const BLANK_DEFAULT: ProjectState = {
  ...BERAVCI_DEFAULT,
  site: blankSite,
  generation: { ...beravciGeneration, capacityDcKw: 0, moduleCountTarget: 0 },
  storage: { ...beravciStorage, enabled: false, energyMwh: 0, powerMw: 0 },
  meta: freshMeta('blank'),
};

/* ========================== RIBIĆ BREG PRESET ========================= */

const ribicBreg: ProjectState = {
  ...BERAVCI_DEFAULT,
  site: {
    ...kopanicaBeravciSite,
    projectName: 'Ribić Breg Agri-PV',
    ownerEntity: 'Solida d.o.o.',
    areaHa: 60,
    centroidLat: 45.89,
    centroidLon: 16.85,
    polygonCoords: null,
  },
  generation: { ...beravciGeneration, capacityDcKw: 30_000, moduleCountTarget: 48_387 },
  gridConnection: { ...beravciGrid, pccSubstation: 'TS Bjelovar', pccDistanceKm: 12 },
  meta: freshMeta('ribic-breg'),
};

const obrovac: ProjectState = {
  ...BERAVCI_DEFAULT,
  site: {
    ...kopanicaBeravciSite,
    projectName: 'Obrovac SE',
    ownerEntity: 'Končar Obnovljivi izvori',
    areaHa: 55,
    centroidLat: 44.195,
    centroidLon: 15.685,
  },
  climate: { ...beravciClimate, ghiKwhM2Yr: 1540, peakSunHours: 5.3 },
  generation: { ...beravciGeneration, capacityDcKw: 28_000 },
  agriculture: { ...beravciAgri, system: 'none' },
  meta: freshMeta('obrovac'),
};

const worstCase: ProjectState = {
  ...BERAVCI_DEFAULT,
  climate: {
    ...beravciClimate,
    ghiKwhM2Yr: 1180,
    soilingLossPctYr: 6,
    hailDaysPerYear: 2.1,
  },
  gridConnection: { ...beravciGrid, gridQueuePosition: 42 },
  finance: { ...beravciFinance, ppaPriceEurMwh: 78, senior_ratePct: 6.5 },
  permitting: {
    ...beravciPermitting,
    upuAmendment: 'caution',
    buildingPermit: 'caution',
    agriConversionFee: 'blocked',
  },
  meta: freshMeta('worst-case'),
};

export function presetState(preset: ProjectMeta['preset']): ProjectState {
  switch (preset) {
    case 'blank':
      return BLANK_DEFAULT;
    case 'ribic-breg':
      return ribicBreg;
    case 'obrovac':
      return obrovac;
    case 'worst-case':
      return worstCase;
    case 'beravci-default':
    default:
      return BERAVCI_DEFAULT;
  }
}

// v2 = Kopanica-Beravci rebase · invalidates old v1 (Beravci-only) session state
const STORAGE_KEY = 'panonica.project.v2';

function readStorage(): ProjectState {
  if (typeof window === 'undefined') return BERAVCI_DEFAULT;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return BERAVCI_DEFAULT;
    return { ...BERAVCI_DEFAULT, ...JSON.parse(raw) };
  } catch {
    return BERAVCI_DEFAULT;
  }
}

function writeStorage(s: ProjectState) {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* too big or disabled */
  }
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  ...readStorage(),

  update: (section, key, value) => {
    const state = get();
    const current = state[section] as Record<string, unknown>;
    const from = current[key as string];
    const nextSection = { ...current, [key]: value };
    const changelogEntry = {
      at: new Date().toISOString(),
      path: `${section}.${String(key)}`,
      from,
      to: value,
    };
    const next: ProjectState = {
      ...state,
      [section]: nextSection,
      meta: {
        ...state.meta,
        lastEditedAt: new Date().toISOString(),
        preset: 'custom',
        changelog: [changelogEntry, ...state.meta.changelog].slice(0, 40),
      },
    } as ProjectState;
    writeStorage(next);
    set(next);
  },

  loadPreset: (preset) => {
    const next = presetState(preset);
    writeStorage(next);
    set(next);
  },

  resetSection: (section) => {
    const fresh = BERAVCI_DEFAULT[section];
    const next = {
      ...get(),
      [section]: fresh,
    } as ProjectState;
    writeStorage(next);
    set(next);
  },

  resetAll: () => {
    writeStorage(BERAVCI_DEFAULT);
    set(BERAVCI_DEFAULT);
  },

  hydrate: (partial) => {
    const next = { ...get(), ...partial } as ProjectState;
    writeStorage(next);
    set(next);
  },

  getCompletionPct: () => {
    const s = get();
    const total = SECTION_ORDER.length;
    const done = SECTION_ORDER.filter((k) => s.meta.sectionStatus[k] === 'complete').length;
    return Math.round((done / total) * 100);
  },
}));
