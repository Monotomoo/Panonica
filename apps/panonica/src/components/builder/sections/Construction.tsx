import { useProjectStore } from '@/store/projectStore';
import { Field, FieldGroup, FieldRow, NumInput, SectionBody, Segmented, TextInput } from '../BuilderPrimitives';

export function ConstructionSection() {
  const s = useProjectStore((s) => s.construction);
  const update = useProjectStore((s) => s.update);
  const u = <K extends keyof typeof s>(k: K) => (v: (typeof s)[K]) => update('construction', k, v);

  return (
    <SectionBody title="13 · Construction" subtitle="EPC contracting · schedule · crew · QA/HSE · LDs and performance bond.">
      <FieldGroup title="Contracting">
        <FieldRow cols={2}>
          <Field label="EPC contract">
            <Segmented value={s.epcContractType} onChange={u('epcContractType')} options={[
              { value: 'turnkey', label: 'Turnkey' }, { value: 'split', label: 'Split' }, { value: 'multi-contract', label: 'Multi' }, { value: 'design-build', label: 'Design-build' }, { value: 'direct', label: 'Direct' },
            ]} size="sm" />
          </Field>
          <Field label="Main EPC"><TextInput value={s.mainEpc} onChange={u('mainEpc')} /></Field>
        </FieldRow>
      </FieldGroup>

      <FieldGroup title="Schedule (months from today)">
        <FieldRow cols={4}>
          <Field label="Design"><NumInput value={s.designMonths} onChange={u('designMonths')} step={0.5} /></Field>
          <Field label="Permitting"><NumInput value={s.permittingMonths} onChange={u('permittingMonths')} step={0.5} /></Field>
          <Field label="Procurement"><NumInput value={s.procurementMonths} onChange={u('procurementMonths')} step={0.5} /></Field>
          <Field label="Civil"><NumInput value={s.civilMonths} onChange={u('civilMonths')} step={0.5} /></Field>
          <Field label="Install"><NumInput value={s.installMonths} onChange={u('installMonths')} step={0.5} /></Field>
          <Field label="Electrical"><NumInput value={s.electricalMonths} onChange={u('electricalMonths')} step={0.5} /></Field>
          <Field label="Commissioning"><NumInput value={s.commissioningMonths} onChange={u('commissioningMonths')} step={0.5} /></Field>
          <Field label="Ground-break" unit="m"><NumInput value={s.groundBreakingMonth} onChange={u('groundBreakingMonth')} step={1} /></Field>
          <Field label="COD" unit="m"><NumInput value={s.codMonth} onChange={u('codMonth')} step={1} /></Field>
        </FieldRow>
      </FieldGroup>

      <FieldGroup title="Workforce & quality">
        <FieldRow cols={3}>
          <Field label="Peak crew size"><NumInput value={s.peakCrewSize} onChange={u('peakCrewSize')} step={1} /></Field>
          <Field label="Quality standard">
            <Segmented value={s.qualityStandard} onChange={u('qualityStandard')} options={[
              { value: 'IEC 62446-1', label: 'IEC 62446-1' }, { value: 'ISO 9001', label: 'ISO 9001' }, { value: 'TÜV', label: 'TÜV' }, { value: 'custom', label: 'Custom' },
            ]} size="sm" />
          </Field>
          <Field label="HSE standard">
            <Segmented value={s.hseStandard} onChange={u('hseStandard')} options={[
              { value: 'ISO 45001', label: 'ISO 45001' }, { value: 'OHSAS 18001', label: 'OHSAS 18001' }, { value: 'local', label: 'Local' },
            ]} size="sm" />
          </Field>
        </FieldRow>
      </FieldGroup>

      <FieldGroup title="Risk allocation">
        <FieldRow cols={2}>
          <Field label="LDs / week" unit="% of CAPEX"><NumInput value={s.liquidatedDamagesPctPerWeek} onChange={u('liquidatedDamagesPctPerWeek')} step={0.05} hint="Standard 0.1-0.3%/week" /></Field>
          <Field label="Performance bond" unit="% of CAPEX"><NumInput value={s.performanceBondPctCapex} onChange={u('performanceBondPctCapex')} step={1} hint="Industry floor 5% · lenders typically 10%" /></Field>
        </FieldRow>
      </FieldGroup>
    </SectionBody>
  );
}
