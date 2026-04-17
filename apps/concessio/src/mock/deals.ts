export interface Deal {
  slug: string;
  name: string;
  location: string;
  category: 'hospitality' | 'energy' | 'infrastructure' | 'tourism' | 'real-estate';
  status: 'active' | 'completed' | 'stalled' | 'awarded';
  investmentEUR: number;
  timelineYears: number;
  operator?: string;
  description?: string;
}

export const deals: Deal[] = [
  { slug: 'kupari', name: 'Kupari Four Seasons', location: 'Župa Dubrovačka', category: 'hospitality', status: 'active', investmentEUR: 150_000_000, timelineYears: 11, operator: 'Four Seasons' },
  { slug: 'plat', name: 'Plat', location: 'Dubrovnik', category: 'hospitality', status: 'active', investmentEUR: 100_000_000, timelineYears: 8 },
  { slug: 'hotel-marjan', name: 'Hotel Marjan', location: 'Split', category: 'hospitality', status: 'active', investmentEUR: 100_000_000, timelineYears: 5, operator: 'Adris/Maistra' },
  { slug: 'srdj-golf', name: 'Srđ Golf', location: 'Dubrovnik', category: 'tourism', status: 'stalled', investmentEUR: 240_000_000, timelineYears: 22 },
  { slug: 'brijuni-rivijera', name: 'Brijuni Rivijera', location: 'Istria', category: 'tourism', status: 'awarded', investmentEUR: 400_000_000, timelineYears: 15 },
  { slug: 'hvar-four-seasons', name: 'Hvar Four Seasons', location: 'Hvar', category: 'hospitality', status: 'completed', investmentEUR: 85_000_000, timelineYears: 6, operator: 'Four Seasons' },
  { slug: 'sheraton-dubrovnik-riviera', name: 'Sheraton Dubrovnik Riviera', location: 'Mlini', category: 'hospitality', status: 'completed', investmentEUR: 70_000_000, timelineYears: 7, operator: 'Adris' },
];

export const featuredDeals = ['kupari', 'plat', 'brijuni-rivijera', 'srdj-golf'];
