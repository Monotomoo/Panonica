export type EventStatus = 'done' | 'active' | 'upcoming';

export interface KupariEvent {
  id: string;
  year: number;
  month: number;
  label: string;
  actor: string;
  status: EventStatus;
  source?: string;
  description?: string;
}

export const kupariMeta = {
  dealId: 'HR-CON-2015-KUPARI-01',
  status: 'ACTIVE · Construction phase',
  landHa: 17,
  seaHa: 8.6,
  concessionYears: 99,
  expiry: 2114,
  investmentEUR: 150_000_000,
  operator: 'Four Seasons Hotels',
  location: 'Kupari · Župa Dubrovačka',
  paladinaStakePct: 10,
};

export const kupariTimeline: KupariEvent[] = [
  { id: 'k01', year: 2015, month: 10, label: 'Concession tender issued', actor: 'Gov RH', status: 'done', source: 'vlada.gov.hr/2015-10' },
  { id: 'k02', year: 2015, month: 11, label: 'Bid received — Avenue Ulaganja', actor: 'Avenue · Gljadelkin', status: 'done' },
  { id: 'k03', year: 2015, month: 12, label: 'Avenue wins (sole bidder)', actor: 'Gov RH', status: 'done', source: 'nn.hr/123-2015' },
  { id: 'k04', year: 2016, month: 3, label: 'Contract signed · Ritz-Carlton LOI', actor: 'Avenue + Marriott', status: 'done' },
  { id: 'k05', year: 2017, month: 8, label: 'Ritz-Carlton withdraws', actor: 'Marriott', status: 'done' },
  { id: 'k06', year: 2018, month: 6, label: 'Amendment I · Four Seasons operator', actor: 'Gov + Avenue', status: 'done', source: 'nn.hr/amendment-i-2018' },
  { id: 'k07', year: 2018, month: 9, label: 'IGH ownership: Avenue acquires 51.3%', actor: 'Avenue', status: 'done' },
  { id: 'k08', year: 2018, month: 12, label: 'Paladina exits Avenue director role', actor: 'Paladina', status: 'done', description: 'Retains 10% residual claim via exit agreement.' },
  { id: 'k09', year: 2020, month: 1, label: 'Paladina opens court case for 10% exit', actor: 'Paladina', status: 'done' },
  { id: 'k10', year: 2021, month: 9, label: 'HPL Singapore acquires 50% of Avenue', actor: 'HPL', status: 'done', source: 'poslovni.hr/hpl-kupari-2021' },
  { id: 'k11', year: 2022, month: 3, label: 'Paladina becomes construction minister', actor: 'Gov RH', status: 'done' },
  { id: 'k12', year: 2022, month: 4, label: 'HPL acquires additional 40%', actor: 'HPL', status: 'done' },
  { id: 'k13', year: 2023, month: 4, label: 'Amendment II signed', actor: 'Bačić gov', status: 'done', source: 'hina.hr/kupari-amendment-ii' },
  { id: 'k14', year: 2023, month: 5, label: 'Paladina loses commercial court', actor: 'Commercial Court', status: 'done' },
  { id: 'k15', year: 2024, month: 6, label: 'UPU Kupari I adopted', actor: 'Općina Župa Dubrovačka', status: 'done' },
  { id: 'k16', year: 2024, month: 9, label: 'Location permit process opens', actor: 'Gov', status: 'done' },
  { id: 'k17', year: 2025, month: 5, label: 'Demolition begins', actor: 'HPL', status: 'done' },
  { id: 'k18', year: 2025, month: 10, label: 'Demolition substantially complete', actor: 'Site', status: 'done' },
  { id: 'k19', year: 2026, month: 6, label: 'Building permit expected', actor: 'Gov RH', status: 'active' },
  { id: 'k20', year: 2027, month: 3, label: 'Main construction phase', actor: 'HPL + 3LHD', status: 'upcoming' },
  { id: 'k21', year: 2029, month: 5, label: 'Projected opening', actor: 'Four Seasons', status: 'upcoming' },
];

/**
 * Edges for the Kupari entity graph.
 * Relationship codes: own (ownership), contract, director, grantor, related, origin-ru
 */
export interface KupariEdge {
  from: string;
  to: string;
  label: string;
  kind: 'own' | 'contract' | 'director' | 'grantor' | 'related' | 'origin-ru';
}

export const kupariEdges: KupariEdge[] = [
  { from: 'gov-rh', to: 'kupari-luxury-hotels', label: 'concession grantor', kind: 'grantor' },
  { from: 'hpl-croatia-ltd', to: 'kupari-luxury-hotels', label: 'owns 90%', kind: 'own' },
  { from: 'ivan-paladina', to: 'kupari-luxury-hotels', label: 'owns 10% (contested)', kind: 'own' },
  { from: 'hotel-properties-ltd', to: 'hpl-croatia-ltd', label: '100% parent', kind: 'own' },
  { from: 'ong-beng-seng', to: 'hotel-properties-ltd', label: 'founder', kind: 'director' },
  { from: 'avenue-ulaganja', to: 'kupari-luxury-hotels', label: 'renamed to', kind: 'related' },
  { from: 'sergej-gljadelkin', to: 'avenue-ulaganja', label: 'founding director', kind: 'origin-ru' },
  { from: 'ivan-paladina', to: 'avenue-ulaganja', label: 'director 2015–2018', kind: 'director' },
  { from: 'four-seasons-hotels', to: 'kupari-luxury-hotels', label: 'operator', kind: 'contract' },
  { from: '3lhd', to: 'kupari-luxury-hotels', label: 'architecture', kind: 'contract' },
  { from: 'tering', to: 'kupari-luxury-hotels', label: 'MEP eng.', kind: 'contract' },
  { from: 'institut-igh', to: 'ivan-paladina', label: 'president 2015–2017', kind: 'related' },
  { from: 'avenue-ulaganja', to: 'institut-igh', label: 'acquired 51.3% (2018)', kind: 'own' },
  { from: 'hidroelektra-niskogradnja', to: 'institut-igh', label: 'historic subsidiary', kind: 'related' },
  { from: 'titan-grupa', to: 'ivan-paladina', label: 'earlier tenure', kind: 'related' },
  { from: 'ritz-carlton', to: 'kupari-luxury-hotels', label: 'withdrew 2017', kind: 'related' },
];

export const kupariSources = [
  { id: 1, source: 'Government of Croatia', url: 'vlada.gov.hr', title: 'Kupari concession contract', date: '2016-03-31' },
  { id: 2, source: 'Narodne novine', url: 'nn.hr', title: 'NN 123/2018 — Amendment I', date: '2018-06-14' },
  { id: 3, source: 'Poslovni dnevnik', url: 'poslovni.hr', title: 'Kupari Luxury Hotels ownership change', date: '2021-09-08' },
  { id: 4, source: 'HRT', url: 'hrt.hr', title: 'Singapore investor takes over Kupari', date: '2022-04-28' },
  { id: 5, source: 'Hina', url: 'hina.hr', title: 'Amendment II signed', date: '2023-04-27' },
  { id: 6, source: 'Općina Župa Dubrovačka', url: 'zupa-dubrovacka.hr', title: 'UPU Kupari I adoption decision', date: '2024-06-15' },
  { id: 7, source: 'The Dubrovnik Times', url: 'thedubrovniktimes.com', title: 'Demolition begins at Kupari', date: '2025-05-30' },
  { id: 8, source: 'Index.hr', url: 'index.hr', title: 'Paladina 10% stake valuation dispute', date: '2023-05-26' },
  { id: 9, source: 'Narodne novine', url: 'nn.hr', title: 'Building permit applications — hospitality', date: '2026-01-18' },
  { id: 10, source: 'Balkan Insight', url: 'balkaninsight.com', title: 'Kupari complex awaits makeover', date: '2017-09-08' },
];

export const kupariSignals = [
  { level: 'warn', label: 'Single bidder', detail: 'Sole bidder in 2015 tender' },
  { level: 'warn', label: 'Multiple ownership transfers', detail: '3 ownership changes in 7 years' },
  { level: 'info', label: 'Extended timeline', detail: 'Completion now +9 years from tender' },
  { level: 'info', label: 'Operator changes', detail: 'Ritz-Carlton → Four Seasons' },
  { level: 'info', label: 'Cross-border ownership', detail: 'Singapore-registered majority' },
  { level: 'info', label: 'Minor stake holder with political office', detail: 'Paladina was minister 2022–2023' },
] as const;
