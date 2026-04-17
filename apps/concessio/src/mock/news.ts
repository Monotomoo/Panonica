export interface NewsItem {
  source: string;
  date: string;
  asset: string | null;
  headline: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export const news: NewsItem[] = [
  { source: 'HRT', date: '2026-04-14', asset: 'kupari', headline: 'Demolition complete at Kupari, building permit expected Q2', sentiment: 'positive' },
  { source: 'Index', date: '2026-04-10', asset: 'beravci', headline: 'MP Vukovac questions Beravci spatial plan amendments', sentiment: 'negative' },
  { source: 'Poslovni', date: '2026-04-08', asset: null, headline: 'FZOEU announces €30M modernisation fund disbursement', sentiment: 'positive' },
  { source: 'N1', date: '2026-03-28', asset: 'igh-split', headline: 'Constitutional Court reversal in IGH case opens new appeal path', sentiment: 'neutral' },
  { source: 'Jutarnji', date: '2026-01-27', asset: 'beravci', headline: 'Pannonian Solar Initiative gains industry backing at Energetika 2026', sentiment: 'positive' },
  { source: 'Večernji', date: '2026-04-02', asset: 'kupari', headline: '3LHD finalizes Kupari Four Seasons architectural plans', sentiment: 'positive' },
  { source: 'Balkan Insight', date: '2026-03-15', asset: null, headline: "Croatia's EU Modernisation Fund allocates €200M for 2026 calls", sentiment: 'positive' },
];
