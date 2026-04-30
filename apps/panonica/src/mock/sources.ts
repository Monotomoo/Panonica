/**
 * Shared source registry · used by the <Sourced> hover-tooltip component.
 * Every investor-facing headline number cites one of these. Demo polish —
 * "nothing invented, everything traceable."
 */

export interface Source {
  id: string;
  name: string;
  authority: string;
  date: string; // ISO or year
  url?: string;
  note?: string;
}

export const SOURCES: Record<string, Source> = {
  // Regulatory
  'fzoeu-oi-2026-03': {
    id: 'fzoeu-oi-2026-03',
    name: 'FZOEU OI-2026-03 call text',
    authority: 'Fond za zaštitu okoliša i energetsku učinkovitost',
    date: '2026-03-01',
    url: 'https://fzoeu.hr/en/calls/',
    note: '€42M pool · deadline 2026-07-15 · agrivoltaic priority weighting',
  },
  'npoo-c12-r1-i1': {
    id: 'npoo-c12-r1-i1',
    name: 'NPOO Strategic Plan Croatia 2023–2027',
    authority: 'Nacionalni plan oporavka i otpornosti',
    date: '2025-12-12',
    url: 'https://planoporavka.gov.hr/',
    note: 'Tranche C1.2.R1-I1 · closing 2026-09-30 · €180M pool',
  },
  'net-billing-law': {
    id: 'net-billing-law',
    name: 'Zakon o obnovljivim izvorima energije · amended 2025',
    authority: 'Ministarstvo gospodarstva HR',
    date: '2026-01-01',
    note: 'Net metering → net billing · exports at HROTE spot',
  },
  // Grid
  'hops-grid-code-2024': {
    id: 'hops-grid-code-2024',
    name: 'HOPS Grid Code 2024 rev.3',
    authority: 'Hrvatski operator prijenosnog sustava',
    date: '2024-11-08',
    url: 'https://www.hops.hr/',
    note: 'Pravila o tehničkim zahtjevima za priključenje',
  },
  'hep-queue-q1-2026': {
    id: 'hep-queue-q1-2026',
    name: 'HEP grid queue register · Q1 2026',
    authority: 'HEP Operator distribucijskog sustava',
    date: '2026-03-15',
    note: 'Kopanica-Beravci #14 of 62 · TS Slavonski Brod 1',
  },
  // Market
  'hrote-spot-2026': {
    id: 'hrote-spot-2026',
    name: 'HROTE day-ahead auction · 30-day rolling avg',
    authority: 'Hrvatski operator tržišta energije',
    date: '2026-04-17',
    note: '€94.10/MWh · 30-day · April 2026',
  },
  'entsoe-tyndp-2024': {
    id: 'entsoe-tyndp-2024',
    name: 'ENTSO-E TYNDP 2024 · Croatia section',
    authority: 'ENTSO-E',
    date: '2024-10-31',
    note: 'Regional capacity + curtailment forecast',
  },
  // Comparables
  'solida-ribic-breg': {
    id: 'solida-ribic-breg',
    name: 'Ribić Breg operational report · Q1 2026',
    authority: 'Solida d.o.o.',
    date: '2026-04-08',
    note: '30 MW · 60 ha · operational since Q3 2024 · €700k/MW · €90/MWh PPA',
  },
  'oieh-slavonia': {
    id: 'oieh-slavonia',
    name: 'OIEH position paper · Slavonia 2,500 MW Window',
    authority: 'Obnovljivi izvori energije Hrvatska',
    date: '2026-04-17',
    note: 'Free grid capacity corridor · 28-month window estimate',
  },
  // Climate/solar
  'pvgis-tmy': {
    id: 'pvgis-tmy',
    name: 'PVGIS TMY · 45.21°N 18.44°E',
    authority: 'European Commission JRC',
    date: '2023-10-01',
    url: 'https://re.jrc.ec.europa.eu/pvg_tools/',
    note: '1,382 kWh/m²/yr · 4.9 peak sun hours',
  },
  'fraunhofer-ise-agv': {
    id: 'fraunhofer-ise-agv',
    name: 'Fraunhofer ISE agrivoltaic guidelines · 2024 edition',
    authority: 'Fraunhofer Institute for Solar Energy Systems',
    date: '2024-06-15',
    note: '17-site long-term monitoring · microclimate + panel-temp modeling',
  },
  'nrel-degradation': {
    id: 'nrel-degradation',
    name: 'Jordan & Kurtz solar degradation meta-study',
    authority: 'National Renewable Energy Laboratory',
    date: '2022-04-01',
    note: '0.5%/yr median · P10/P90 bands used in Monte Carlo',
  },
  // Land + cadastral
  'dgu-geoportal': {
    id: 'dgu-geoportal',
    name: 'DGU cadastral geoportal',
    authority: 'Državna geodetska uprava',
    date: '2026-02-11',
    url: 'https://geoportal.dgu.hr/',
    note: 'Velika Kopanica k.č.br. register · 51 parcels · last transfer 2026-02-11',
  },
  'hpa-soil': {
    id: 'hpa-soil',
    name: 'HPA soil classification map',
    authority: 'Hrvatska poljoprivredna agencija',
    date: '2024-09-01',
    note: 'Eutric Cambisol · WRB 2014 · IV-V agri-PV suitability',
  },
  // Agriculture
  'hapih-livestock': {
    id: 'hapih-livestock',
    name: 'HAPIH livestock registry · 2025',
    authority: 'Hrvatska agencija za poljoprivredu i hranu',
    date: '2025-06-01',
    note: 'Romanov + Dalmatian pramenka breed metrics',
  },
  'cap-2023-2027': {
    id: 'cap-2023-2027',
    name: 'CAP Strategic Plan Croatia 2023–2027',
    authority: 'Ministarstvo poljoprivrede HR · EU CAP',
    date: '2023-01-01',
    note: 'P1 BISS + P2 eco-scheme + ANC + EIP-AGRI allocations',
  },
  // Paladina specific
  'paladina-parcel': {
    id: 'paladina-parcel',
    name: 'Paladina Investments · parcel title · k.č.br. register',
    authority: 'Katastar · DGU',
    date: '2019-03-14',
    note: 'IGH bond recovery · 80.3 ha · clear title · no liens',
  },
  'paladina-2023-deck': {
    id: 'paladina-2023-deck',
    name: 'Velika Kopanica Solar Power Plant Project · V2',
    authority: 'Ivan Paladina · Developer & Investor',
    date: '2023-05-16',
    url: '/imagery/paladina-2023/paladina-2023-deck.pdf',
    note: 'Paladina\'s own 2023 project deck · 70 MW · 73 ha · preliminary design phase',
  },
  'paladina-2020-teaser': {
    id: 'paladina-2020-teaser',
    name: 'Velika Kopanica Project · 2020 Teaser',
    authority: 'Municipality of Velika Kopanica',
    date: '2020-06-01',
    note: '770,000 sqm business zone · designated for mixed-use (renewables · logistics · production · agriculture)',
  },
};

export function getSource(id: string): Source | null {
  return SOURCES[id] ?? null;
}
