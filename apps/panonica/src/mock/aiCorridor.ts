/**
 * AI Offtake Corridor · mock data for /offtake route
 *
 * Six buyers + eight Croatian / CEE data-center pipeline projects + key
 * transmission paths · all reconcile to the Kopanica-Beravci 30 MW Phase 1
 * + 40 MW Phase 2 buildout.
 *
 * Pantheon framing per Q5=B: 35% probability of stated 1 GW scale by 2029.
 * Other buyers calibrated to public DC pipeline announcements + corporate
 * green-PPA market intel circa Q2 2026.
 */

export type BuyerType =
  | 'hyperscaler'   // Big Tech AI campus (Pantheon, Azure)
  | 'datacenter'    // Telco/colo/regional DC
  | 'corporate'     // Industrial off-take (INA, BMW, Bosch)
  | 'merchant'      // HROTE / HUPX spot
  | 'export';       // Cross-border via interconnector

export type CreditRating =
  | 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'speculative';

export type CfeRequirement = '24-7' | 'annual' | 'none';

export interface Buyer {
  id: string;
  name: string;
  shortName: string;
  type: BuyerType;
  capacityMW: number;          // total demand the buyer represents
  ourSliceMW: number;          // KB's proposed allocation
  ppaPriceEurMwh: number;
  greenPremiumEurMwh: number;  // premium over merchant
  tenorYears: number;
  startYear: number;
  probability: number;         // 0..1
  creditRating: CreditRating;
  cfeRequirement: CfeRequirement;
  geo: { lat: number; lon: number; city: string };
  status: 'firm' | 'lol' | 'mou' | 'rumored' | 'public';
  riskNote: string;
  tone: 'pulse' | 'sun' | 'agri' | 'signal' | 'spark';
}

/* ============================ BUYERS ============================ */

export const buyers: Buyer[] = [
  {
    id: 'pantheon',
    name: 'Pantheon AI Campus · Topusko',
    shortName: 'PANTHEON',
    type: 'hyperscaler',
    capacityMW: 1000,
    ourSliceMW: 25,           // realistic 2.5% slice of stated need
    ppaPriceEurMwh: 115,
    greenPremiumEurMwh: 21,
    tenorYears: 25,
    startYear: 2029,
    probability: 0.35,
    creditRating: 'BBB',
    cfeRequirement: '24-7',
    geo: { lat: 45.30, lon: 15.97, city: 'Topusko' },
    status: 'public',
    riskNote:
      'Carić & Dujmović skeptical · €50B claim is unprecedented for CEE · Croatia lacks 1 GW spare capacity · 2027 construction start at risk',
    tone: 'spark',
  },
  {
    id: 'azure-cee',
    name: 'Microsoft Azure · CEE region',
    shortName: 'AZURE',
    type: 'hyperscaler',
    capacityMW: 200,
    ourSliceMW: 18,
    ppaPriceEurMwh: 112,
    greenPremiumEurMwh: 18,
    tenorYears: 15,
    startYear: 2028,
    probability: 0.60,
    creditRating: 'AAA',
    cfeRequirement: '24-7',
    geo: { lat: 45.81, lon: 15.98, city: 'Zagreb metro' },
    status: 'rumored',
    riskNote:
      'Azure CEE expansion confirmed · Croatia DC site assessment Q1 2026 · final selection between Zagreb / Ljubljana / Budapest',
    tone: 'pulse',
  },
  {
    id: 'ht-zagreb',
    name: 'Croatian Telecom DC · Zagreb',
    shortName: 'HT ZAG',
    type: 'datacenter',
    capacityMW: 45,
    ourSliceMW: 12,
    ppaPriceEurMwh: 105,
    greenPremiumEurMwh: 11,
    tenorYears: 12,
    startYear: 2027,
    probability: 0.95,
    creditRating: 'AA',
    cfeRequirement: 'annual',
    geo: { lat: 45.81, lon: 15.98, city: 'Zagreb' },
    status: 'firm',
    riskNote:
      'HT existing tier-3 expansion · permitted · groundbreaking Q3 2026 · seeking 100% renewable supply · letter of intent stage',
    tone: 'agri',
  },
  {
    id: 'ina-green',
    name: 'INA Refineries · green-PPA',
    shortName: 'INA',
    type: 'corporate',
    capacityMW: 60,
    ourSliceMW: 8,
    ppaPriceEurMwh: 100,
    greenPremiumEurMwh: 6,
    tenorYears: 10,
    startYear: 2026,
    probability: 0.90,
    creditRating: 'A',
    cfeRequirement: 'annual',
    geo: { lat: 45.43, lon: 16.93, city: 'Sisak refinery' },
    status: 'mou',
    riskNote:
      'INA decarbonization plan · MOL group Scope-2 commitment · Sisak + Rijeka refineries · MOU signed Q4 2025',
    tone: 'sun',
  },
  {
    id: 'merchant',
    name: 'HROTE merchant · spot pool',
    shortName: 'HROTE',
    type: 'merchant',
    capacityMW: 9999,        // residual sink
    ourSliceMW: 0,           // computed dynamically as residual
    ppaPriceEurMwh: 94,
    greenPremiumEurMwh: 0,
    tenorYears: 1,           // rolling
    startYear: 2026,
    probability: 1.0,
    creditRating: 'AA',
    cfeRequirement: 'none',
    geo: { lat: 45.81, lon: 15.98, city: 'HROTE Zagreb' },
    status: 'firm',
    riskNote:
      'HROTE day-ahead clearing · €94/MWh 2026 average · volatility ±18% on weather + cross-border coupling',
    tone: 'signal',
  },
  {
    id: 'bih-export',
    name: 'HR ↔ BiH cross-border export',
    shortName: 'BIH EXPORT',
    type: 'export',
    capacityMW: 50,
    ourSliceMW: 5,
    ppaPriceEurMwh: 98,
    greenPremiumEurMwh: 4,
    tenorYears: 5,
    startYear: 2027,
    probability: 0.75,
    creditRating: 'A',
    cfeRequirement: 'none',
    geo: { lat: 44.87, lon: 18.81, city: 'Tuzla / Brčko' },
    status: 'lol',
    riskNote:
      'NOSBiH market coupling target Q2 2027 · €5–8/MWh peak spread vs HR · 220 kV interconnector Žerjavinec available',
    tone: 'pulse',
  },
];

/* ============================ DC PIPELINE ============================ */

export interface DcProject {
  id: string;
  name: string;
  operator: string;
  capacityMW: number;
  status: 'operational' | 'construction' | 'permitted' | 'announced' | 'rumored';
  startYear: number;
  geo: { lat: number; lon: number; city: string };
  isPantheon?: boolean;
  isOurOfftaker?: boolean;
  note: string;
}

export const dcProjects: DcProject[] = [
  {
    id: 'pantheon',
    name: 'Pantheon AI Campus',
    operator: 'consortium · undisclosed',
    capacityMW: 1000,
    status: 'announced',
    startYear: 2029,
    geo: { lat: 45.30, lon: 15.97, city: 'Topusko' },
    isPantheon: true,
    isOurOfftaker: true,
    note: '€50B claimed · 1 GW · skeptical analyst consensus',
  },
  {
    id: 'azure-zg',
    name: 'Microsoft Azure CEE',
    operator: 'Microsoft',
    capacityMW: 200,
    status: 'rumored',
    startYear: 2028,
    geo: { lat: 45.81, lon: 15.98, city: 'Zagreb' },
    isOurOfftaker: true,
    note: 'CEE region selection · Q1 2026 site assessment',
  },
  {
    id: 'ht-zg-existing',
    name: 'HT Tier-3 ZAG-1',
    operator: 'Hrvatski Telekom',
    capacityMW: 22,
    status: 'operational',
    startYear: 2019,
    geo: { lat: 45.79, lon: 15.95, city: 'Zagreb' },
    note: 'Existing carrier-neutral colo · expanding',
  },
  {
    id: 'ht-zg-new',
    name: 'HT Tier-3 ZAG-2 expansion',
    operator: 'Hrvatski Telekom',
    capacityMW: 45,
    status: 'permitted',
    startYear: 2027,
    geo: { lat: 45.81, lon: 15.98, city: 'Zagreb' },
    isOurOfftaker: true,
    note: 'Permit issued · groundbreaking Q3 2026',
  },
  {
    id: 'a1-split',
    name: 'A1 Split DC',
    operator: 'A1 Hrvatska',
    capacityMW: 8,
    status: 'operational',
    startYear: 2022,
    geo: { lat: 43.51, lon: 16.45, city: 'Split' },
    note: 'Coastal redundancy · Adriatic cable landing',
  },
  {
    id: 'srbija-novisad',
    name: 'Vojvodina AI campus',
    operator: 'SBB / Telenor',
    capacityMW: 80,
    status: 'construction',
    startYear: 2027,
    geo: { lat: 45.25, lon: 19.85, city: 'Novi Sad' },
    note: 'Cross-border target · €8/MWh export spread',
  },
  {
    id: 'sap-budapest',
    name: 'SAP Budapest hyperscale',
    operator: 'SAP',
    capacityMW: 130,
    status: 'permitted',
    startYear: 2028,
    geo: { lat: 47.50, lon: 19.04, city: 'Budapest' },
    note: 'CEE German-corporate anchor · 24/7 CFE',
  },
  {
    id: 'aws-bucharest',
    name: 'AWS Bucharest region',
    operator: 'Amazon',
    capacityMW: 350,
    status: 'announced',
    startYear: 2029,
    geo: { lat: 44.43, lon: 26.10, city: 'Bucharest' },
    note: 'Regional CEE landing · scope creep risk',
  },
];

/* ============================ TRANSMISSION ============================ */

export interface TransmissionPath {
  id: string;
  fromCity: string;
  toCity: string;
  voltageKv: number;
  capacityMw: number;
  fromGeo: { lat: number; lon: number };
  toGeo: { lat: number; lon: number };
  utilization: number; // 0..1
  status: 'operational' | 'planned' | 'under-construction';
}

export const transmission: TransmissionPath[] = [
  // Kopanica-Beravci → TS Slavonski Brod 1 (PCC)
  {
    id: 'kb-tsb',
    fromCity: 'Kopanica-Beravci',
    toCity: 'TS Slavonski Brod 1',
    voltageKv: 35,
    capacityMw: 35,
    fromGeo: { lat: 45.1348, lon: 18.4130 },
    toGeo: { lat: 45.157, lon: 18.015 },
    utilization: 0.32,
    status: 'planned',
  },
  // TS Slavonski Brod → 400 kV national backbone
  {
    id: 'tsb-400',
    fromCity: 'TS Slavonski Brod 1',
    toCity: 'Žerjavinec 400 kV',
    voltageKv: 400,
    capacityMw: 800,
    fromGeo: { lat: 45.157, lon: 18.015 },
    toGeo: { lat: 45.95, lon: 16.34 },
    utilization: 0.58,
    status: 'operational',
  },
  // Žerjavinec → Topusko (toward Pantheon site)
  {
    id: 'zerj-topusko',
    fromCity: 'Žerjavinec 400 kV',
    toCity: 'Topusko (Pantheon)',
    voltageKv: 400,
    capacityMw: 600,
    fromGeo: { lat: 45.95, lon: 16.34 },
    toGeo: { lat: 45.30, lon: 15.97 },
    utilization: 0.41,
    status: 'planned', // Pantheon needs new 400 kV connection
  },
  // Žerjavinec → Zagreb (Azure / HT)
  {
    id: 'zerj-zg',
    fromCity: 'Žerjavinec 400 kV',
    toCity: 'Zagreb DC cluster',
    voltageKv: 400,
    capacityMw: 1200,
    fromGeo: { lat: 45.95, lon: 16.34 },
    toGeo: { lat: 45.81, lon: 15.98 },
    utilization: 0.72,
    status: 'operational',
  },
  // Cross-border BiH (Žerjavinec ↔ Tuzla)
  {
    id: 'hr-bih',
    fromCity: 'TS Slavonski Brod 1',
    toCity: 'Tuzla (BiH)',
    voltageKv: 220,
    capacityMw: 350,
    fromGeo: { lat: 45.157, lon: 18.015 },
    toGeo: { lat: 44.535, lon: 18.677 },
    utilization: 0.45,
    status: 'operational',
  },
];

/* ============================ EU TAXONOMY ============================ */

export interface TaxonomyObjective {
  id: string;
  name: string;
  short: string;
  ourScore: number;       // 0..100
  required: number;       // threshold for compliance
  status: 'aligned' | 'partial' | 'misaligned';
  goCertEur: number;      // GO certificate revenue this objective unlocks
  note: string;
}

export const taxonomyObjectives: TaxonomyObjective[] = [
  {
    id: 'climate-mitigation',
    name: 'Climate change mitigation',
    short: 'mitigation',
    ourScore: 96,
    required: 80,
    status: 'aligned',
    goCertEur: 380_000,
    note: '34,000 t CO₂ avoided/yr · LCA 680 kg/MWp · 14-month payback',
  },
  {
    id: 'climate-adaptation',
    name: 'Climate change adaptation',
    short: 'adaptation',
    ourScore: 84,
    required: 70,
    status: 'aligned',
    goCertEur: 0,
    note: 'Posavina flood-zone marginal · sub-station above 100yr level · DNSH passes',
  },
  {
    id: 'water',
    name: 'Sustainable water use',
    short: 'water',
    ourScore: 92,
    required: 60,
    status: 'aligned',
    goCertEur: 0,
    note: 'Zero-water solar · negligible cleaning cycle · DNSH passes',
  },
  {
    id: 'circular',
    name: 'Circular economy',
    short: 'circular',
    ourScore: 78,
    required: 70,
    status: 'aligned',
    goCertEur: 110_000,
    note: 'Module take-back via JinkoSolar · steel framing recyclable · CRCF eligible',
  },
  {
    id: 'pollution',
    name: 'Pollution prevention',
    short: 'pollution',
    ourScore: 88,
    required: 60,
    status: 'aligned',
    goCertEur: 0,
    note: 'No emissions · low noise · agri-PV preserves topsoil · DNSH passes',
  },
  {
    id: 'biodiversity',
    name: 'Biodiversity & ecosystems',
    short: 'biodiversity',
    ourScore: 82,
    required: 70,
    status: 'aligned',
    goCertEur: 95_000,
    note: 'Sheep grazing under panels · biodiversity uplift +25% at year 5 · CAP Pillar 2 ecoscheme',
  },
];

/* ============================ MONTE CARLO PARAMS ============================ */

export const mcOfftakeParams = {
  runs: 1000,
  variables: {
    pantheonOutcome: { weights: [0.45, 0.20, 0.35], labels: ['cancel', 'partial', 'full'] }, // 35% prob → 0.35 share of "full"
    hroteMerchant: { mean: 94, std: 17 },          // €/MWh 2026
    recPremium: { mean: 11, std: 5 },              // €/MWh corporate green premium
    regulatoryDelayMonths: { mean: 4, std: 6 },    // months
    dcPipelineGrowth: { mean: 0.18, std: 0.08 },   // CEE DC capacity 2026→2030 CAGR
  },
  outputs: ['npv25y', 'irrEquity', 'momY10'],
};
