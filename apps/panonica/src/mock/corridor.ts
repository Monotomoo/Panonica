/**
 * Corridor · transport · borders · infrastructure · business zone.
 *
 * Primary source: Paladina's own 2023 project deck
 * (Kopanica_Paladina_V2.pdf · May 2023) + Velika Kopanica 2020 teaser.
 *
 * Cross-referenced against HAK map · ENTSO-E TYNDP corridor data ·
 * Hrvatske autoceste + HŽ Infrastruktura timetables.
 */

export interface TransportCorridor {
  id: string;
  designation: string;
  kind: 'road' | 'rail' | 'river' | 'highway';
  label: string;
  note: string;
  accessKm: number;
  tone: 'pulse' | 'signal' | 'sun' | 'agri' | 'spark';
}

export const transportCorridors: TransportCorridor[] = [
  {
    id: 'corridor-x',
    designation: 'Pan-European Corridor X',
    kind: 'highway',
    label: 'A3 Zagreb → Lipovac',
    note: 'Junction Velika Kopanica · direct exit at site',
    accessKm: 1.8,
    tone: 'pulse',
  },
  {
    id: 'corridor-vc',
    designation: 'Pan-European Corridor Vc',
    kind: 'rail',
    label: 'Budapest → Osijek → Sarajevo → Ploče',
    note: 'MP13C railway · Strizivojna/Vrpolje – Slavonski Šamac',
    accessKm: 6.4,
    tone: 'signal',
  },
  {
    id: 'a5',
    designation: 'Motorway A5',
    kind: 'highway',
    label: 'Osijek → Sarajevo (Vc backbone)',
    note: 'North-south spine · connects to A3 at site',
    accessKm: 14.2,
    tone: 'pulse',
  },
  {
    id: 'rail-station',
    designation: 'HŽ rail station',
    kind: 'rail',
    label: 'Kopanica-Beravci',
    note: 'Cargo siding capable · passenger + freight',
    accessKm: 4.2,
    tone: 'signal',
  },
  {
    id: 'sava-port',
    designation: 'Sava River Port',
    kind: 'river',
    label: 'Slavonski Brod river terminal',
    note: 'Inland waterway to Black Sea · transformer + module barging',
    accessKm: 22,
    tone: 'agri',
  },
  {
    id: 'd7',
    designation: 'State road D7',
    kind: 'road',
    label: 'Dubošević → Beli Manastir → Osijek → Đakovo → Slavonski Šamac',
    note: 'Primary north-south · daily construction access',
    accessKm: 1.8,
    tone: 'pulse',
  },
  {
    id: 'd4',
    designation: 'State road D4',
    kind: 'road',
    label: 'Southern boundary · parallel to A3',
    note: 'Reserves the southern edge of the business zone',
    accessKm: 0.3,
    tone: 'sun',
  },
];

export interface BorderDistance {
  country: string;
  flag: string;
  distanceKm: number;
  note: string;
  exportMarket: string;
}

export const borderDistances: BorderDistance[] = [
  {
    country: 'Bosnia & Herzegovina',
    flag: 'BiH',
    distanceKm: 11,
    note: 'Closest foreign electricity market · EPBiH / Elektroprivreda HZ-HB',
    exportMarket: 'BAM-denominated PPA · cross-border wheeling',
  },
  {
    country: 'Serbia',
    flag: 'SR',
    distanceKm: 56,
    note: 'EMS (Elektromreža Srbije) · MIBEL-coupled market',
    exportMarket: 'EUR spot · day-ahead via Serbian hub',
  },
  {
    country: 'Hungary',
    flag: 'HU',
    distanceKm: 110,
    note: 'MAVIR · Hungarian TSO · MEKH regulator',
    exportMarket: 'EUR spot · HUPX day-ahead',
  },
];

export const onSiteInfrastructure = [
  {
    id: 'hv-line',
    label: 'High-voltage transmission line',
    status: 'on-site',
    note: '110 kV corridor passes the parcel · HOPS connection via MV → HV step-up',
    tone: 'pulse' as const,
    paladina2023: true,
  },
  {
    id: 'gas-pipeline',
    label: 'Main high-pressure gas pipeline',
    status: 'on-site',
    note: 'Plinacro backbone · optional hybrid generation during grid constraint',
    tone: 'sun' as const,
    paladina2023: true,
  },
  {
    id: 'wastewater',
    label: 'Wastewater drainage',
    status: 'designed',
    note: 'Central treatment plant → Mostanik + Mešanje Ždrilo canals',
    tone: 'signal' as const,
    paladina2023: true,
  },
  {
    id: 'water-supply',
    label: 'Municipal water supply',
    status: 'available',
    note: 'Velika Kopanica network · sufficient for panel washing + site use',
    tone: 'signal' as const,
    paladina2023: false,
  },
  {
    id: 'internet',
    label: 'Fiber optic',
    status: 'available',
    note: 'HAKOM-registered · required for SCADA telemetry + Agros LoRa gateway',
    tone: 'pulse' as const,
    paladina2023: false,
  },
  {
    id: 'gas-genset-option',
    label: 'Gas generation co-location',
    status: 'option',
    note: 'Original 2023 plan: CCGT/CHP anchor for industrial zone · now less central but technically feasible',
    tone: 'agri' as const,
    paladina2023: true,
  },
];

export const businessZone = {
  totalAreaSqm: 770_000,
  totalAreaHa: 77,
  masterPlanYear: 2020,
  masterPlanSource: 'Velika Kopanica 2020 teaser · Municipality of Velika Kopanica',
  designatedUses: [
    { label: 'Business + Production', sharePct: 30, tone: 'pulse' as const },
    { label: 'Logistics + Warehousing', sharePct: 20, tone: 'signal' as const },
    { label: 'Renewable Energy (Solar · Wind)', sharePct: 35, tone: 'sun' as const },
    { label: 'Agricultural Production', sharePct: 15, tone: 'agri' as const },
  ],
};

export const paladinaHistory = {
  originalPlanYear: 2023,
  originalCapacityMW: 70,
  originalAreaHa: 73,
  originalPhase: 'Preliminary design phase',
  originalReadyToBuild: '1H 2024',
  originalConstruction: '2024',
  actualStatus: '2026 · UPU amendment pending · queue position #14',
  plannerQuote:
    '"Fully owned land · Power: 70 MW · Ready to build 1H 2024"',
  pitchLine:
    'Ivan Paladina · Developer & Investor · Former Minister of Construction, Spatial Planning and State Assets · Former President of IGH (SEE engineering leader)',
};

// Phase 1 / Phase 2 split
export const capacityPhases = {
  phase1: {
    label: 'Phase 1 · queue-approved',
    capacityMW: 30,
    areaHa: 50,
    statusNote: 'HOPS-allocated at TS Slavonski Brod 1 · Q3 2027 connection',
    confidence: 0.95,
    tone: 'agri' as const,
  },
  phase2: {
    label: 'Phase 2 · queue expansion',
    capacityMW: 40,
    areaHa: 23,
    statusNote: "Targets Paladina's original 70 MW total · contingent on TS upgrade or 2nd substation build",
    confidence: 0.45,
    tone: 'pulse' as const,
  },
  totalOriginal: 70, // Paladina 2023 plan
  totalCurrent: 70, // same if phase 2 lands
};

export const corridorImagery = {
  europeCorridors: '/imagery/paladina-2023/europe-corridors.jpg',
  regionMap: '/imagery/paladina-2023/region-map.jpg',
  zoneZoom: '/imagery/paladina-2023/zone-zoom.jpg',
  exitsStationsPorts: '/imagery/paladina-2023/exits-stations-ports.jpg',
  paladinaDeckPDF: '/imagery/paladina-2023/paladina-2023-deck.pdf',
};

// Cross-border electricity export thesis
export const crossBorderThesis = {
  distanceToBiHBorderKm: 11,
  nearestBiHSubstation: 'Samac · 400 kV · EPBiH',
  nearestBiHSubstationDistanceKm: 38,
  priceSpreadEurPerMWh: 8, // typical HR → BiH spread during peak
  exportProbabilityPct: 62, // market-coupled days/yr when spread is positive
  regulatoryFrictionNote:
    'HOPS + NOSBiH wheeling agreement exists · ENTSO-E CACM compliant · single border auction',
  thesisLine:
    '30 MW exported during peak-price windows to BiH at €8/MWh uplift adds ~€380k/yr on top of domestic PPA.',
};
