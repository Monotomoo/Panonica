/**
 * 25-year life-cycle event register for the Time Machine.
 * Month-indexed (month 0 = today). Pre-COD events happen in month 0-17.
 * Post-COD events are year-indexed.
 */

export type EventKind =
  | 'milestone'
  | 'financial'
  | 'technical'
  | 'operational'
  | 'exit'
  | 'risk';

export interface TimelineEvent {
  month: number;      // 0..300 (25 years)
  label: string;
  detail: string;
  kind: EventKind;
  tone: 'pulse' | 'sun' | 'agri' | 'signal' | 'spark';
  milestone?: boolean; // shown as a large marker
}

export const TIMELINE_EVENTS: TimelineEvent[] = [
  // CONSTRUCTION PHASE · 0-17 months
  { month: 0, label: 'Preliminary design', detail: 'Basic + detailed engineering begins · site surveys', kind: 'milestone', tone: 'pulse', milestone: true },
  { month: 2, label: 'UPU consultation', detail: 'Municipal spatial plan amendment · public hearing May 20', kind: 'milestone', tone: 'pulse' },
  { month: 4, label: 'Grid connection agreement', detail: 'HOPS signs · Kopanica-Beravci queue promoted to #8', kind: 'technical', tone: 'signal' },
  { month: 5, label: 'FZOEU OI-2026-03 submission', detail: '€4.2M grant application · 85% eligibility match', kind: 'financial', tone: 'sun' },
  { month: 6, label: 'Building permit', detail: 'Građevinska dozvola issued · 12 weeks from submission', kind: 'milestone', tone: 'pulse', milestone: true },
  { month: 7, label: 'Module procurement', detail: 'JinkoSolar Tiger Neo 620 · 48,387 units · CIF Koper', kind: 'financial', tone: 'sun' },
  { month: 8, label: 'Ground-breaking', detail: 'Civil works begin · drainage + roads + foundations', kind: 'milestone', tone: 'agri', milestone: true },
  { month: 10, label: 'Pile-driving complete', detail: '3,840 piles · avg 2.4m · bearing tests pass', kind: 'technical', tone: 'agri' },
  { month: 11, label: 'First MW installed', detail: 'Panel installation ramps · 6-week run to full array', kind: 'milestone', tone: 'pulse' },
  { month: 13, label: 'Inverter commissioning', detail: '218 × 110 kW SMA · DC isolation tests', kind: 'technical', tone: 'signal' },
  { month: 14, label: 'MV cable pulled', detail: '22.8 km 35 kV cable · Kopanica-Beravci → TS Slavonski Brod 1', kind: 'technical', tone: 'signal' },
  { month: 15, label: 'HOPS commissioning', detail: 'Grid-synch tests · LVRT/HVRT verification', kind: 'technical', tone: 'signal' },
  { month: 16, label: 'Battery install', detail: '12 MWh LFP · liquid cooling · aerosol suppression', kind: 'technical', tone: 'pulse' },
  { month: 17, label: 'Commercial Operation Date (COD)', detail: '30 MW exports first kWh · 25-yr PPA clock starts', kind: 'milestone', tone: 'agri', milestone: true },

  // OPERATIONAL YEAR 1 · months 17-29
  { month: 18, label: 'First O&M cycle', detail: 'Panel cleaning · inverter firmware · sheep flock arrives', kind: 'operational', tone: 'agri' },
  { month: 20, label: 'Agros Flock Monitor live', detail: '112 LoRa collars deployed · Paladina dashboard online', kind: 'technical', tone: 'pulse' },
  { month: 24, label: 'Year 1 performance test', detail: 'PR 85.1% vs 84.3% modeled · DSCR 1.85× observed', kind: 'financial', tone: 'agri' },
  { month: 29, label: 'First CAP Pillar 2 payment', detail: '€28k eco-scheme · sheep grazing maintained', kind: 'financial', tone: 'sun' },

  // YEAR 2-5 · highlights
  { month: 36, label: 'Module warranty inspection', detail: 'JinkoSolar Y2 audit · 99.2% functional', kind: 'technical', tone: 'agri' },
  { month: 45, label: 'Cross-border PPA pilot', detail: '3 MW exported to EPBiH · €8/MWh uplift', kind: 'financial', tone: 'signal' },
  { month: 60, label: 'Year 5 refinance option', detail: 'Could drop senior rate 4.75% → 4.15% · evaluating', kind: 'financial', tone: 'pulse' },

  // MID-LIFE · years 6-15
  { month: 84, label: 'Senior debt refinance', detail: '€11M → €13M @ 4.25% · 5-yr remaining · frees €1.8M equity', kind: 'milestone', tone: 'agri', milestone: true },
  { month: 96, label: 'Inverter mid-life audit', detail: 'Warranty drop-off at Y10 · replacement reserve utilized', kind: 'technical', tone: 'signal' },
  { month: 108, label: 'Battery augmentation', detail: '+4 MWh to offset degradation · €1.1M', kind: 'technical', tone: 'pulse' },
  { month: 120, label: 'Year 10 EXIT WINDOW OPENS', detail: 'Exit EV €30M · MoM 7.8× · infra-fund bid pending', kind: 'exit', tone: 'sun', milestone: true },
  { month: 132, label: 'CRCF carbon credits verified', detail: '1st batch · €45/ha·yr · €3.6k incremental', kind: 'financial', tone: 'agri' },

  // LATE LIFE · years 15-25
  { month: 180, label: 'Senior debt paid', detail: 'Capital stack = 25% mezzanine + 75% equity', kind: 'financial', tone: 'agri', milestone: true },
  { month: 192, label: 'Inverter replacement #1', detail: 'Full inverter bank refresh · €3.2M · Y25 extension', kind: 'technical', tone: 'signal' },
  { month: 216, label: 'Mezzanine repaid', detail: 'Capital stack = 100% equity · all cashflow to sponsor', kind: 'financial', tone: 'agri' },
  { month: 240, label: 'Year 20 · repowering decision', detail: 'Panels 20-yr · replace or continue · analysis phase', kind: 'technical', tone: 'sun' },
  { month: 264, label: 'PPA 25-yr anniversary', detail: 'PPA expiry · renew with HEP or go to spot', kind: 'milestone', tone: 'agri', milestone: true },
  { month: 300, label: 'Year 25 · end of modeled life', detail: 'Repowering + extension · or decommission · depends on policy 2051', kind: 'milestone', tone: 'pulse', milestone: true },
];

export const TIMELINE_TOTAL_MONTHS = 300;  // 25 years

/* Event tone helper */
export const KIND_COLORS: Record<EventKind, string> = {
  milestone: 'pulse',
  financial: 'sun',
  technical: 'signal',
  operational: 'agri',
  exit: 'sun',
  risk: 'spark',
};
