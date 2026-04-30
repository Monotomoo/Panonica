import { useProjectStore } from '@/store/projectStore';
import { Field, FieldGroup, SectionBody, Segmented } from '../BuilderPrimitives';
import type { PermitStatus } from '@/store/projectStore';

const statusOptions: { value: PermitStatus; label: string }[] = [
  { value: 'ok', label: 'OK' },
  { value: 'pending', label: 'Pending' },
  { value: 'caution', label: 'Caution' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'n/a', label: 'N/A' },
];

export function PermittingSection() {
  const s = useProjectStore((s) => s.permitting);
  const update = useProjectStore((s) => s.update);
  const u = <K extends keyof typeof s>(k: K) => (v: (typeof s)[K]) => update('permitting', k, v);

  const gates: { key: keyof typeof s; label: string; note: string }[] = [
    { key: 'upuAmendment', label: 'UPU amendment', note: 'Municipal spatial plan · Velika Kopanica' },
    { key: 'ppuoAlignment', label: 'PPUO alignment', note: 'County plan · Brodsko-posavska' },
    { key: 'oieoScreening', label: 'Environmental (OIEO)', note: 'Natura 2000 · biodiversity · glare' },
    { key: 'culturalHeritage', label: 'Cultural heritage', note: 'Monuments · archaeological reservation' },
    { key: 'buildingPermit', label: 'Building permit', note: 'Građevinska dozvola' },
    { key: 'gridConnectionStudy', label: 'Grid connection study', note: 'HOPS · TS Slavonski Brod 1' },
    { key: 'waterUsePermit', label: 'Water use', note: 'Panel washing · drainage · wastewater' },
    { key: 'agriConversionFee', label: 'Agri conversion fee', note: 'Waived under dual-use AGV rule' },
    { key: 'landTitle', label: 'Land title', note: 'Clear · no liens · Paladina 100%' },
    { key: 'neighbourConsent', label: 'Neighbour consent', note: 'Susjedni zemljišnik' },
  ];

  return (
    <SectionBody title="12 · Permitting" subtitle="10-gate regulatory checklist. Blocked = cannot proceed. Pending on critical path.">
      <FieldGroup title="Gates">
        <div className="grid grid-cols-1 gap-2">
          {gates.map((g) => (
            <div key={String(g.key)} className="flex items-center gap-4 rounded-md border border-border bg-surface/30 p-3">
              <div className="flex min-w-[220px] flex-col gap-0.5">
                <span className="font-mono text-[11px] text-text-primary">{g.label}</span>
                <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">{g.note}</span>
              </div>
              <div className="flex-1">
                <Segmented value={s[g.key]} onChange={u(g.key)} options={statusOptions} size="sm" />
              </div>
            </div>
          ))}
        </div>
      </FieldGroup>
    </SectionBody>
  );
}
