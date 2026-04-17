export type SubsidyStatus = 'open' | 'closing-soon' | 'closed';
export type SubsidyEligibility = 'eligible' | 'eligible-docs-pending' | 'not-eligible';

export interface SubsidyProgram {
  program: string;
  call: string;
  fullName: string;
  maxAmount: number;
  coveragePercent: number;
  deadline: string;
  status: SubsidyStatus;
  eligibility: SubsidyEligibility;
  description: string;
  accent: 'pulse' | 'signal' | 'sun' | 'agri' | 'spark';
}

export const subsidies: SubsidyProgram[] = [
  {
    program: 'FZOEU',
    call: 'Obnovljivi izvori energije za gospodarstvo',
    fullName: 'Fond za zaštitu okoliša i energetsku učinkovitost',
    maxAmount: 6_000_000,
    coveragePercent: 40,
    deadline: '2026-05-31',
    status: 'open',
    eligibility: 'eligible',
    description:
      'Sufinanciranje solarnih elektrana za poduzetnike. Maksimalno 40% opravdanih troškova.',
    accent: 'pulse',
  },
  {
    program: 'NPOO',
    call: 'C1.3 R2-I2 — OIE u poljoprivredi',
    fullName: 'Nacionalni plan oporavka i otpornosti',
    maxAmount: 12_000_000,
    coveragePercent: 60,
    deadline: '2026-09-30',
    status: 'open',
    eligibility: 'eligible',
    description:
      'Agrivoltaika i obnovljivi izvori u poljoprivrednom sektoru. Do 60% sufinanciranje.',
    accent: 'agri',
  },
  {
    program: 'EU MF',
    call: 'Electricity from Renewable Sources',
    fullName: 'European Modernisation Fund',
    maxAmount: 20_000_000,
    coveragePercent: 45,
    deadline: '2026-07-15',
    status: 'open',
    eligibility: 'eligible-docs-pending',
    description:
      'Direct EU funding for utility-scale renewable projects in modernisation-eligible states.',
    accent: 'signal',
  },
  {
    program: 'HBOR',
    call: 'Zeleni kredit — OIE',
    fullName: 'Hrvatska banka za obnovu i razvitak',
    maxAmount: 25_000_000,
    coveragePercent: 80,
    deadline: 'ongoing',
    status: 'open',
    eligibility: 'eligible',
    description:
      'Povoljni krediti za obnovljive izvore. Fiksna kamata 1.9%, rok do 20 godina.',
    accent: 'sun',
  },
  {
    program: 'EBRD',
    call: 'Green Economy Financing',
    fullName: 'European Bank for Reconstruction and Development',
    maxAmount: 40_000_000,
    coveragePercent: 50,
    deadline: '2026-12-31',
    status: 'open',
    eligibility: 'eligible',
    description:
      'Strukturirano financiranje OIE projekata iznad 20 MW. Mogućnost equity participacije.',
    accent: 'signal',
  },
  {
    program: 'ŽUPANIJA',
    call: 'Brodsko-posavska — Poticaji za zelenu gradnju',
    fullName: 'Brodsko-posavska županija',
    maxAmount: 150_000,
    coveragePercent: 15,
    deadline: '2026-03-30',
    status: 'closing-soon',
    eligibility: 'eligible',
    description: 'Županijski poticaj za infrastrukturne troškove. Limitirana sredstva.',
    accent: 'spark',
  },
];

export const fundingStackBaselineCapex = 34_200_000;
