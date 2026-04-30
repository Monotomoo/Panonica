/**
 * The macro story — why Kopanica-Beravci, why now.
 *
 * Sources:
 * - Solarna Hrvatska — net-metering → net-billing transition 2026-01-01
 * - OIEH (Obnovljivi izvori energije Hrvatska) — 2,500 MW free grid capacity in
 *   Slavonia/Banovina/Istria; "1% EU arable = 900 GW" projection
 * - HROTE / HEP grid queue public data
 * - Solida d.o.o. — Ribić Breg agrivoltaic project (30 MW · 60 ha · operational 2024)
 * - Paladina Investments — 80.3 ha Kopanica-Beravci plot (UPU phase)
 */

export interface IrrPoint {
  year: number;
  rooftop: number; // % IRR for household rooftop under regime of that year
  utilityAgv: number; // % IRR for utility-scale agrivoltaic
  regime: 'net-metering' | 'net-billing';
}

export const irrCollapse: IrrPoint[] = [
  { year: 2022, rooftop: 17.8, utilityAgv: 8.4, regime: 'net-metering' },
  { year: 2023, rooftop: 18.2, utilityAgv: 8.9, regime: 'net-metering' },
  { year: 2024, rooftop: 16.9, utilityAgv: 9.6, regime: 'net-metering' },
  { year: 2025, rooftop: 14.1, utilityAgv: 10.4, regime: 'net-metering' },
  { year: 2026, rooftop: 8.2, utilityAgv: 11.4, regime: 'net-billing' },
  { year: 2027, rooftop: 6.9, utilityAgv: 12.1, regime: 'net-billing' },
  { year: 2028, rooftop: 6.1, utilityAgv: 12.6, regime: 'net-billing' },
];

export const regulatoryAnchor = {
  timestamp: '2026-01-01T00:00:00Z',
  event: 'Net metering terminated.',
  replacement: 'Net billing — exports priced at HROTE spot, imports at retail tariff.',
  impact: 'Household export IRR drops 20–30%. Utility-scale subsidies unchanged.',
  source: 'Solarna Hrvatska · Zakon o OIE i Zakon o obnovljivim izvorima energije (2025)',
};

export interface Corridor {
  name: string;
  freeCapacityMW: number;
  allocatedMW: number;
  substations: number;
  beravciHere: boolean;
}

export const corridors: Corridor[] = [
  { name: 'Slavonia', freeCapacityMW: 1180, allocatedMW: 210, substations: 18, beravciHere: true },
  { name: 'Banovina', freeCapacityMW: 820, allocatedMW: 145, substations: 11, beravciHere: false },
  { name: 'Istria', freeCapacityMW: 520, allocatedMW: 180, substations: 9, beravciHere: false },
];

export const gridWindow = {
  totalFreeMW: corridors.reduce((a, c) => a + c.freeCapacityMW, 0),
  totalAllocatedMW: corridors.reduce((a, c) => a + c.allocatedMW, 0),
  totalSubstations: corridors.reduce((a, c) => a + c.substations, 0),
  closingEstimateMonths: 28, // industry estimate — queue filling rate
  queuePositionsTotal: 462, // Croatia-wide (HEP published)
  queueBeravci: 14, // TS Slavonski Brod 1
};

export const oihPosition = {
  euArableHectares: 161_000_000, // EU total arable land
  onePercentOfArableHa: 1_610_000,
  projectedGW: 900,
  currentEuPvGW: 150,
  multiplier: 6,
  source: 'OIEH position paper · Agrivoltaic potential in EU agricultural land (2025)',
  framingLine:
    'Agrivoltaics on just 1% of EU arable land would produce 900 GW — six times current EU PV capacity.',
};

export const ribicBregComp = {
  name: 'Ribić Breg',
  operator: 'Solida d.o.o.',
  region: 'Bjelovar-Bilogora',
  capacityMW: 30,
  areaHa: 60,
  densityMWperHa: 0.5,
  status: 'operational',
  operationalSince: '2024-Q3',
  capexPerMW: 700_000,
  capexTotal: 21_000_000,
  ppaPrice: 90, // €/MWh
  ppaTenor: 25,
  expectedEbitdaPerYear: 2_700_000,
  estimatedAssetValue: 24_500_000, // EV at completion
  underPanelUse: 'sheep grazing · ~1,100 head',
  co2AvoidedYear: 34_000,
};

export const beravciExtrapolation = {
  areaHa: 80.3,
  densityMWperHa: ribicBregComp.densityMWperHa, // 0.5 MW/ha using Ribić Breg benchmark
  maxCapacityMW: 40, // density × area, capped by grid queue allocation
  realisticCapacityMW: 30, // matches queue-approved capacity
  capexPerMW: 700_000,
  capexTotal: 21_000_000,
  ppaPrice: 95, // €/MWh — slightly higher, Slavonia forward-curve
  ppaTenor: 25,
  y10CumulativeFcf: 18_900_000,
  exitCapRate: 0.065,
  exitEv: 30_400_000, // EBITDA / cap rate
  exitMoM: 3.2, // vs equity in
  kupariStakeNominalValue: 3_200_000, // his 10% at disputed valuation
  ratioToKupari: 9.5, // Beravci exit / Kupari nominal 10%
};

export const subsidyWindowCalendar = [
  { month: 'May 2026', event: 'FZOEU OI-2026-03 call opens · €42M pool · agrivoltaic priority' },
  { month: 'Jul 2026', event: 'FZOEU OI-2026-03 deadline' },
  { month: 'Sep 2026', event: 'NPOO C1.2.R1-I1 tranche closing' },
  { month: 'Oct 2026', event: 'HEP queue review · expected Kopanica-Beravci promotion to #8' },
  { month: 'Feb 2027', event: 'EU Innovation Fund small-scale call (projected)' },
  { month: 'Q3 2027', event: 'Grid connection target date · Kopanica-Beravci → TS Slavonski Brod 1' },
];

export const paladinaPositioning = {
  appearances: [
    { event: 'Energetika 2026 conference', role: 'speaker', topic: 'Utility-scale solar for Eastern Croatia' },
    { event: 'OIEH advocacy working group', role: 'member', topic: 'Agrivoltaic land classification' },
    { event: 'Pannonian Solar Initiative', role: 'founding signatory', topic: 'Public-private deployment framework' },
  ],
  thesis:
    'Positioning as spokesperson for utility-scale solar in Eastern Croatia precisely when (a) household economics collapse and (b) utility-scale + agrivoltaic become the only serious play.',
};

export const punchline = {
  headline: 'You are not building a solar farm.',
  subhead:
    'You are warehousing grid rights and subsidy eligibility for a 25-year window that closes in 2028.',
  cta: 'Configure the asset',
};
