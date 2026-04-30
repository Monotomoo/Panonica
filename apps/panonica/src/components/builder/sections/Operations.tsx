import { useProjectStore } from '@/store/projectStore';
import { Field, FieldGroup, FieldRow, NumInput, SectionBody, Segmented, TextInput } from '../BuilderPrimitives';

export function OperationsSection() {
  const s = useProjectStore((s) => s.operations);
  const update = useProjectStore((s) => s.update);
  const u = <K extends keyof typeof s>(k: K) => (v: (typeof s)[K]) => update('operations', k, v);

  return (
    <SectionBody title="14 · Operations" subtitle="O&M model · performance guarantee · cleaning · vegetation management.">
      <FieldGroup title="O&M">
        <FieldRow cols={2}>
          <Field label="Model">
            <Segmented value={s.omModel} onChange={u('omModel')} options={[
              { value: 'in-house', label: 'In-house' }, { value: 'outsourced', label: 'Outsourced' }, { value: 'hybrid', label: 'Hybrid' },
            ]} size="sm" />
          </Field>
          <Field label="Partner"><TextInput value={s.omPartner} onChange={u('omPartner')} /></Field>
          <Field label="Contract length" unit="yr"><NumInput value={s.omContractYears} onChange={u('omContractYears')} step={1} /></Field>
          <Field label="SLA"><TextInput value={s.maintenanceResponseSla} onChange={u('maintenanceResponseSla')} /></Field>
        </FieldRow>
      </FieldGroup>

      <FieldGroup title="Performance">
        <FieldRow cols={3}>
          <Field label="PR target"><NumInput value={s.performanceRatioTarget} onChange={u('performanceRatioTarget')} step={0.01} /></Field>
          <Field label="Availability" unit="%"><NumInput value={s.availabilityGuaranteePct} onChange={u('availabilityGuaranteePct')} step={0.1} hint="< 97% problematic" /></Field>
          <Field label="Monitoring frequency">
            <Segmented value={s.monitoringFrequency} onChange={u('monitoringFrequency')} options={[
              { value: 'realtime', label: 'Realtime' }, { value: '1min', label: '1 min' }, { value: '5min', label: '5 min' }, { value: '15min', label: '15 min' }, { value: 'hourly', label: 'Hourly' },
            ]} size="sm" />
          </Field>
        </FieldRow>
      </FieldGroup>

      <FieldGroup title="Maintenance">
        <FieldRow cols={3}>
          <Field label="Preventive cycles / yr"><NumInput value={s.preventiveMaintenanceCycles} onChange={u('preventiveMaintenanceCycles')} step={1} /></Field>
          <Field label="Spare-parts inventory" unit="€"><NumInput value={s.sparePartsInventoryEur} onChange={u('sparePartsInventoryEur')} step={10_000} /></Field>
        </FieldRow>
        <FieldRow cols={2}>
          <Field label="Module cleaning">
            <Segmented value={s.moduleCleaningStrategy} onChange={u('moduleCleaningStrategy')} options={[
              { value: 'rain-only', label: 'Rain-only' }, { value: 'scheduled-2x', label: '2×/yr' }, { value: 'scheduled-4x', label: '4×/yr' }, { value: 'robotic-daily', label: 'Robotic' },
            ]} size="sm" />
          </Field>
          <Field label="Vegetation management">
            <Segmented value={s.vegetationManagement} onChange={u('vegetationManagement')} options={[
              { value: 'sheep', label: 'Sheep' }, { value: 'mowing', label: 'Mowing' }, { value: 'herbicide', label: 'Herbicide' }, { value: 'mixed', label: 'Mixed' },
            ]} size="sm" />
          </Field>
        </FieldRow>
      </FieldGroup>
    </SectionBody>
  );
}
