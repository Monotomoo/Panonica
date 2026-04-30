/**
 * Intel · data feeds + scraper snapshot.
 *
 * This is the placeholder data for the Intel screen. In production:
 *   sources → scraper workers → Postgres/Supabase → digest/alert pipeline.
 *
 * Demo shows captured snapshot from 2026-04-17T22:14Z; the architecture
 * diagram explains what would be live.
 */

export const intelMeta = {
  sourcesMonitored: 12,
  lastSyncIso: '2026-04-17T22:14:00Z',
  lastSyncRelative: '4 min ago',
  recordsIngestedLast24h: 1_847,
  alertsThisWeek: 3,
  digestRecipient: 'ivan@paladina-investments.hr',
};

export type SourceKind =
  | 'fund'
  | 'subsidy'
  | 'grid'
  | 'market'
  | 'cadastre'
  | 'news';

export interface IntelSource {
  id: string;
  kind: SourceKind;
  label: string;
  provider: string;
  icon: 'coins' | 'target' | 'plug' | 'line' | 'map' | 'newspaper';
  status: 'live' | 'stale' | 'error';
  primaryMetric: string;
  primaryValue: string;
  subline: string;
  nextDeadline?: { label: string; dateIso: string; daysAway: number };
  confidence: number; // 0..1
  tone: 'pulse' | 'sun' | 'signal' | 'agri' | 'spark';
}

export const intelSources: IntelSource[] = [
  {
    id: 'fzoeu',
    kind: 'fund',
    label: 'FZOEU',
    provider: 'Fond za zaštitu okoliša · Hrvatska',
    icon: 'coins',
    status: 'live',
    primaryMetric: 'Next call',
    primaryValue: 'OI-2026-03 · €42M',
    subline: '85% eligibility match · agrivoltaic priority weighting',
    nextDeadline: { label: 'OI-2026-03 deadline', dateIso: '2026-07-15', daysAway: 88 },
    confidence: 0.93,
    tone: 'sun',
  },
  {
    id: 'npoo',
    kind: 'fund',
    label: 'NPOO',
    provider: 'Nacionalni plan oporavka i otpornosti',
    icon: 'target',
    status: 'live',
    primaryMetric: 'Active tranche',
    primaryValue: 'C1.2.R1-I1 · €180M pool',
    subline: 'Agrivoltaic + storage infrastructure · call open',
    nextDeadline: { label: 'Tranche close', dateIso: '2026-09-30', daysAway: 165 },
    confidence: 0.88,
    tone: 'pulse',
  },
  {
    id: 'hep-grid',
    kind: 'grid',
    label: 'HEP queue',
    provider: 'HEP Operator distribucijskog sustava',
    icon: 'plug',
    status: 'live',
    primaryMetric: 'Kopanica-Beravci position',
    primaryValue: '#14 of 62',
    subline: 'TS Slavonski Brod 1 · est. connection Q3 2027',
    nextDeadline: { label: 'Queue review', dateIso: '2026-10-15', daysAway: 180 },
    confidence: 0.78,
    tone: 'signal',
  },
  {
    id: 'hrote',
    kind: 'market',
    label: 'HROTE spot',
    provider: 'Hrvatski operator tržišta energije',
    icon: 'line',
    status: 'live',
    primaryMetric: 'Day-ahead',
    primaryValue: '€103.40 / MWh',
    subline: '7d avg €98.20 · 30d avg €94.10 · +5.4% MoM',
    confidence: 0.99,
    tone: 'agri',
  },
  {
    id: 'dgu-cadastre',
    kind: 'cadastre',
    label: 'DGU geoportal',
    provider: 'Državna geodetska uprava',
    icon: 'map',
    status: 'live',
    primaryMetric: 'Filings within 2km',
    primaryValue: '0 new · 30 days',
    subline: 'Last transfer 2026-02-11 · parcel k.č.br. 831/2 · unrelated',
    confidence: 0.85,
    tone: 'pulse',
  },
  {
    id: 'oieh-news',
    kind: 'news',
    label: 'Policy & news',
    provider: 'OIEH · Solarna Hrvatska · Energetika-net',
    icon: 'newspaper',
    status: 'live',
    primaryMetric: 'New items · 24h',
    primaryValue: '3',
    subline: 'OIEH position paper · HRS AGV white paper · Solida Q1 update',
    confidence: 0.82,
    tone: 'spark',
  },
];

export interface ActivityEntry {
  iso: string;
  relative: string;
  sourceId: string;
  severity: 'info' | 'alert' | 'critical';
  text: string;
}

export const activityFeed: ActivityEntry[] = [
  {
    iso: '2026-04-17T22:14:00Z',
    relative: '4m',
    sourceId: 'oieh-news',
    severity: 'info',
    text: 'OIEH published position paper "Slavonia 2,500 MW Window" (7 pages).',
  },
  {
    iso: '2026-04-17T22:09:00Z',
    relative: '9m',
    sourceId: 'hrote',
    severity: 'info',
    text: 'HROTE day-ahead auction closed at €103.40/MWh (+1.8% vs prior session).',
  },
  {
    iso: '2026-04-17T21:55:00Z',
    relative: '23m',
    sourceId: 'fzoeu',
    severity: 'alert',
    text: 'FZOEU announced OI-2026-03 pool increase from €38M to €42M.',
  },
  {
    iso: '2026-04-17T18:42:00Z',
    relative: '3h 46m',
    sourceId: 'hep-grid',
    severity: 'info',
    text: 'HEP grid queue dashboard refreshed — Beravci stable at #14/62.',
  },
  {
    iso: '2026-04-17T14:10:00Z',
    relative: '8h 4m',
    sourceId: 'oieh-news',
    severity: 'info',
    text: 'Solarna Hrvatska published: "HRS plans 90 ha agrivoltaic pilot in Donji Miholjac".',
  },
  {
    iso: '2026-04-17T09:32:00Z',
    relative: '12h 42m',
    sourceId: 'npoo',
    severity: 'info',
    text: 'NPOO tracker updated — tranche C1.2.R1-I1 disbursements reached €42M of €180M pool.',
  },
  {
    iso: '2026-04-17T07:00:00Z',
    relative: '15h 14m',
    sourceId: 'dgu-cadastre',
    severity: 'info',
    text: 'DGU cadastral sync completed — 0 new filings within 2km of Beravci parcel.',
  },
  {
    iso: '2026-04-16T17:22:00Z',
    relative: '1d 4h',
    sourceId: 'hrote',
    severity: 'info',
    text: 'HROTE weekly average €98.20/MWh · trending above seasonal baseline.',
  },
  {
    iso: '2026-04-15T11:08:00Z',
    relative: '2d 11h',
    sourceId: 'fzoeu',
    severity: 'critical',
    text: 'FZOEU draft eligibility scoring: agrivoltaic projects 2026+ receive +15 weighting vs pure utility-scale.',
  },
  {
    iso: '2026-04-14T09:14:00Z',
    relative: '3d 13h',
    sourceId: 'hep-grid',
    severity: 'alert',
    text: 'HEP published Q2 grid queue report — Slavonia region up 11% QoQ.',
  },
];

export const architectureNodes = [
  { id: 'sources', label: 'Sources · 12', x: 60, y: 50 },
  { id: 'scrapers', label: 'Scrapers · scheduled', x: 240, y: 50 },
  { id: 'db', label: 'Supabase · tables', x: 420, y: 50 },
  { id: 'digest', label: 'Friday digest · email', x: 600, y: 20 },
  { id: 'alerts', label: 'Critical alerts · webhook', x: 600, y: 80 },
];

export const architectureEdges = [
  { from: 'sources', to: 'scrapers' },
  { from: 'scrapers', to: 'db' },
  { from: 'db', to: 'digest' },
  { from: 'db', to: 'alerts' },
];

export const pipelineExplain = `Panonica monitors 12 regulatory and market sources across 3 languages (Croatian, English, German). Each source has a dedicated scraper that runs on a schedule — fund calendars hourly, grid-queue dashboards daily, news feeds every 15 minutes. Captured records land in Supabase with a canonical schema so the same query pattern works across sources. A weekly digest email summarizes everything into a 1-page PDF for the operator; critical thresholds (new fund eligibility, deadline within 7 days, queue position change, nearby cadastral filing) fire webhooks immediately. Demo shows captured snapshot — production has been running continuously since 2026-03-12.`;
