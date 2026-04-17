export interface MilestoneEvent {
  year: number;
  quarter?: number;
  label: string;
  status: 'done' | 'active' | 'upcoming';
  actor?: string;
}

export const beravciTimeline: MilestoneEvent[] = [
  { year: 2019, quarter: 2, label: 'Parcel acquired via IGH bond recovery', status: 'done', actor: 'Paladina Investments' },
  { year: 2024, quarter: 4, label: 'UPU amendment process initiated', status: 'done', actor: 'Općina Velika Kopanica' },
  { year: 2026, quarter: 2, label: 'UPU public consultation', status: 'active', actor: 'Općina Velika Kopanica' },
  { year: 2026, quarter: 3, label: 'UPU adoption', status: 'upcoming', actor: 'Općina' },
  { year: 2026, quarter: 4, label: 'Location permit filed', status: 'upcoming', actor: 'Paladina Investments' },
  { year: 2027, quarter: 1, label: 'Grid connection approval', status: 'upcoming', actor: 'HEP ODS' },
  { year: 2027, quarter: 3, label: 'Building permit', status: 'upcoming', actor: 'Brodsko-posavska županija' },
  { year: 2028, quarter: 2, label: 'Construction start', status: 'upcoming' },
  { year: 2029, quarter: 1, label: 'Commercial operation', status: 'upcoming' },
];
