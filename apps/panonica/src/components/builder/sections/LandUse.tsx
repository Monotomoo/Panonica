import { useProjectStore } from '@/store/projectStore';
import { Field, FieldGroup, FieldRow, NumInput, SectionBody, Segmented, TextInput } from '../BuilderPrimitives';

export function LandUseSection() {
  const s = useProjectStore((s) => s.landUse);
  const update = useProjectStore((s) => s.update);
  const u = <K extends keyof typeof s>(k: K) => (v: (typeof s)[K]) => update('landUse', k, v);

  return (
    <SectionBody title="03 · Land Use" subtitle="Zoning · setbacks · agri classification · environmental constraints.">
      <FieldGroup title="Zoning & classification">
        <FieldRow cols={2}>
          <Field label="Zoning class"><TextInput value={s.zoningClass} onChange={u('zoningClass')} /></Field>
          <Field label="UPU status">
            <Segmented value={s.upuStatus} onChange={u('upuStatus')} options={[
              { value: 'approved', label: 'Approved' },
              { value: 'pending', label: 'Pending' },
              { value: 'amendment', label: 'Amendment' },
              { value: 'not-required', label: 'N/R' },
            ]} size="sm" />
          </Field>
          <Field label="UPU consultation date"><TextInput value={s.upuConsultationDate} onChange={u('upuConsultationDate')} placeholder="2026-05-20" /></Field>
          <Field label="Agri classification">
            <Segmented value={s.agriClassification} onChange={u('agriClassification')} options={[
              { value: 'preserved', label: 'Preserved' },
              { value: 'conversion-required', label: 'Conversion' },
              { value: 'dual-use', label: 'Dual-use' },
              { value: 'non-agricultural', label: 'Non-agri' },
            ]} size="sm" />
          </Field>
        </FieldRow>
      </FieldGroup>

      <FieldGroup title="Setbacks (m)">
        <FieldRow cols={4}>
          <Field label="Boundary"><NumInput value={s.setbackBoundaryM} onChange={u('setbackBoundaryM')} step={1} /></Field>
          <Field label="Road"><NumInput value={s.setbackRoadM} onChange={u('setbackRoadM')} step={1} /></Field>
          <Field label="Building"><NumInput value={s.setbackBuildingM} onChange={u('setbackBuildingM')} step={1} /></Field>
          <Field label="Watercourse"><NumInput value={s.setbackWaterCourseM} onChange={u('setbackWaterCourseM')} step={1} /></Field>
        </FieldRow>
      </FieldGroup>

      <FieldGroup title="Environmental constraints">
        <FieldRow cols={2}>
          <Field label="Natura 2000 overlap" unit="m²"><NumInput value={s.natura2000OverlapM2} onChange={u('natura2000OverlapM2')} step={100} /></Field>
          <Field label="Glare risk" unit="min/yr"><NumInput value={s.glareRiskMinPerYr} onChange={u('glareRiskMinPerYr')} step={0.1} hint="FAA SGHAT modeled" /></Field>
          <Field label="Noise limit" unit="dB(A)"><NumInput value={s.noiseLimitDbA} onChange={u('noiseLimitDbA')} step={1} /></Field>
          <Field label="Neighbour consent">
            <Segmented value={s.neighbourConsentStatus} onChange={u('neighbourConsentStatus')} options={[
              { value: 'all-signed', label: 'All signed' },
              { value: 'majority', label: 'Majority' },
              { value: 'pending', label: 'Pending' },
              { value: 'disputed', label: 'Disputed' },
            ]} size="sm" />
          </Field>
        </FieldRow>
        <Field label="Protected species note"><TextInput value={s.protectedSpeciesNote} onChange={u('protectedSpeciesNote')} /></Field>
        <Field label="Cultural heritage note"><TextInput value={s.culturalHeritageNote} onChange={u('culturalHeritageNote')} /></Field>
      </FieldGroup>
    </SectionBody>
  );
}
