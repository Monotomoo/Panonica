export type EntityType = 'person' | 'company' | 'government';

export interface EntityRole {
  role: string;
  years: string;
}

export interface Entity {
  slug: string;
  name: string;
  type: EntityType;
  country: string;
  born?: number;
  parent?: string;
  status?: string;
  renamedTo?: string;
  notes?: string;
  roles?: EntityRole[];
}

export const entities: Entity[] = [
  {
    slug: 'kupari-luxury-hotels',
    name: 'Kupari Luxury Hotels d.o.o.',
    type: 'company',
    country: 'HR',
    status: 'active',
    notes: 'Registered 2015. Renamed from Avenue Ulaganja.',
  },
  {
    slug: 'hpl-croatia-ltd',
    name: 'HPL Croatia Ltd',
    type: 'company',
    country: 'HR',
    parent: 'Hotel Properties Ltd (SG)',
    status: 'active',
  },
  {
    slug: 'hotel-properties-ltd',
    name: 'Hotel Properties Ltd',
    type: 'company',
    country: 'SG',
    notes: 'Singapore-listed hospitality holding. Founder Ong Beng Seng.',
  },
  {
    slug: 'avenue-ulaganja',
    name: 'Avenue Ulaganja d.o.o.',
    type: 'company',
    country: 'HR',
    status: 'renamed/dissolved',
    renamedTo: 'Kupari Luxury Hotels',
  },
  {
    slug: 'avenue-osteuropa',
    name: 'Avenue Osteuropa GmbH',
    type: 'company',
    country: 'AT',
  },
  {
    slug: 'avenue-holdings',
    name: 'Avenue Holdings',
    type: 'company',
    country: 'AT',
    status: 'liquidation',
  },
  {
    slug: 'sergej-gljadelkin',
    name: 'Sergej Gljadelkin',
    type: 'person',
    country: 'RU/HR',
    notes: 'Russian-born, Croatian citizenship.',
  },
  {
    slug: 'ivan-paladina',
    name: 'Ivan Paladina',
    type: 'person',
    country: 'HR',
    born: 1983,
    roles: [
      { role: 'Director, Avenue Ulaganja', years: '2015–2018' },
      { role: 'President, Institut IGH', years: '2015–2017' },
      { role: 'Director, Delta Savjetovanje', years: '2018–present' },
      { role: 'Minister, Construction (RH)', years: '2022-03-09 – 2023-01-17' },
      { role: 'Director, Paladina Investments', years: '2023–present' },
      { role: 'Lead, Pannonian Solar Initiative', years: '2026–present' },
    ],
  },
  {
    slug: 'ong-beng-seng',
    name: 'Ong Beng Seng',
    type: 'person',
    country: 'SG',
    notes: 'Founder, Hotel Properties Ltd.',
  },
  {
    slug: 'four-seasons-hotels',
    name: 'Four Seasons Hotels',
    type: 'company',
    country: 'CA',
    notes: 'Operator (post-Ritz-Carlton replacement)',
  },
  {
    slug: 'ritz-carlton',
    name: 'Ritz-Carlton (Marriott)',
    type: 'company',
    country: 'US',
    status: 'withdrew 2017',
  },
  {
    slug: '3lhd',
    name: '3LHD',
    type: 'company',
    country: 'HR',
    notes: 'Croatian architecture studio.',
  },
  {
    slug: 'tering',
    name: 'Tering / Termoinženjering',
    type: 'company',
    country: 'HR',
  },
  {
    slug: 'institut-igh',
    name: 'Institut IGH d.d.',
    type: 'company',
    country: 'HR',
    status: 'related via ownership',
  },
  {
    slug: 'hidroelektra-niskogradnja',
    name: 'Hidroelektra Niskogradnja',
    type: 'company',
    country: 'HR',
    status: 'bankrupt',
  },
  {
    slug: 'titan-grupa',
    name: 'Titan Grupa',
    type: 'company',
    country: 'HR',
    notes: 'Earlier Paladina connection.',
  },
  {
    slug: 'gov-rh',
    name: 'Government of the Republic of Croatia',
    type: 'government',
    country: 'HR',
  },
  {
    slug: 'opcina-zupa-dubrovacka',
    name: 'Općina Župa Dubrovačka',
    type: 'government',
    country: 'HR',
  },
  {
    slug: 'opcina-velika-kopanica',
    name: 'Općina Velika Kopanica',
    type: 'government',
    country: 'HR',
  },
  {
    slug: 'paladina-investments',
    name: 'Paladina Investments',
    type: 'company',
    country: 'HR',
  },
];

export function findEntity(slug: string) {
  return entities.find((e) => e.slug === slug);
}
