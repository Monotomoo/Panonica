import { useProjectStore } from '@/store/projectStore';
import { Field, FieldGroup, FieldRow, NumInput, SectionBody, Segmented, Select, TextInput, Toggle, Derived } from '../BuilderPrimitives';

export function GenerationSection() {
  const s = useProjectStore((s) => s.generation);
  const update = useProjectStore((s) => s.update);
  const u = <K extends keyof typeof s>(k: K) => (v: (typeof s)[K]) => update('generation', k, v);

  const derivedCountFromCapacity = Math.ceil((s.capacityDcKw * 1000) / s.moduleWp);

  return (
    <SectionBody title="04 · Generation" subtitle="Module spec · mounting · tracking · foundation. Drives BoM + yield.">
      <FieldGroup title="Module (datasheet)">
        <FieldRow cols={2}>
          <Field label="Make"><TextInput value={s.moduleMake} onChange={u('moduleMake')} placeholder="JinkoSolar" /></Field>
          <Field label="Model"><TextInput value={s.moduleModel} onChange={u('moduleModel')} placeholder="Tiger Neo 620" /></Field>
        </FieldRow>
        <FieldRow cols={4}>
          <Field label="Wp"><NumInput value={s.moduleWp} onChange={u('moduleWp')} step={5} tone="sun" /></Field>
          <Field label="Voc" unit="V"><NumInput value={s.moduleVoc} onChange={u('moduleVoc')} step={0.1} /></Field>
          <Field label="Isc" unit="A"><NumInput value={s.moduleIsc} onChange={u('moduleIsc')} step={0.1} /></Field>
          <Field label="Vmpp" unit="V"><NumInput value={s.moduleVmpp} onChange={u('moduleVmpp')} step={0.1} /></Field>
          <Field label="Impp" unit="A"><NumInput value={s.moduleImpp} onChange={u('moduleImpp')} step={0.1} /></Field>
          <Field label="η" unit="%"><NumInput value={s.moduleEfficiencyPct} onChange={u('moduleEfficiencyPct')} step={0.1} /></Field>
          <Field label="Area" unit="m²"><NumInput value={s.moduleAreaM2} onChange={u('moduleAreaM2')} step={0.01} /></Field>
          <Field label="Warranty" unit="yr"><NumInput value={s.moduleWarrantyYears} onChange={u('moduleWarrantyYears')} step={1} /></Field>
        </FieldRow>
        <FieldRow cols={4}>
          <Field label="Bifacial"><Toggle value={s.moduleBifacial} onChange={u('moduleBifacial')} /></Field>
          <Field label="Bifacial gain" unit="%"><NumInput value={s.moduleBifacialGainPct} onChange={u('moduleBifacialGainPct')} step={0.5} /></Field>
          <Field label="Temp coef" unit="%/°C"><NumInput value={s.moduleTempCoefPct} onChange={u('moduleTempCoefPct')} step={0.01} /></Field>
          <Field label="Y1 degradation" unit="%"><NumInput value={s.moduleFirstYearDegradationPct} onChange={u('moduleFirstYearDegradationPct')} step={0.1} /></Field>
          <Field label="Annual degr" unit="%"><NumInput value={s.moduleAnnualDegradationPct} onChange={u('moduleAnnualDegradationPct')} step={0.05} /></Field>
        </FieldRow>
      </FieldGroup>

      <FieldGroup title="Mounting & tracking">
        <FieldRow cols={3}>
          <Field label="Tilt system">
            <Segmented value={s.tilt} onChange={u('tilt')} options={[
              { value: 'fixed', label: 'Fixed' },
              { value: 'seasonal', label: 'Seasonal' },
              { value: '1-axis', label: '1-axis' },
              { value: '2-axis', label: '2-axis' },
            ]} size="sm" />
          </Field>
          <Field label="Tilt angle" unit="°"><NumInput value={s.tiltDeg} onChange={u('tiltDeg')} step={1} /></Field>
          <Field label="Azimuth" unit="° from N"><NumInput value={s.azimuthDeg} onChange={u('azimuthDeg')} step={1} /></Field>
          <Field label="Tracker range" unit="°"><NumInput value={s.trackRangeDeg} onChange={u('trackRangeDeg')} step={5} /></Field>
          <Field label="Foundation">
            <Segmented value={s.foundation} onChange={u('foundation')} options={[
              { value: 'pile-driven', label: 'Pile' },
              { value: 'screw', label: 'Screw' },
              { value: 'ballast', label: 'Ballast' },
              { value: 'concrete', label: 'Concrete' },
            ]} size="sm" />
          </Field>
          <Field label="Pile length" unit="m"><NumInput value={s.pileLengthM} onChange={u('pileLengthM')} step={0.1} /></Field>
        </FieldRow>
      </FieldGroup>

      <FieldGroup title="Layout">
        <FieldRow cols={4}>
          <Field label="GCR" hint="Ground coverage ratio · 0.30-0.45 for AGV"><NumInput value={s.groundCoverageRatio} onChange={u('groundCoverageRatio')} step={0.01} /></Field>
          <Field label="Row pitch" unit="m"><NumInput value={s.rowPitchM} onChange={u('rowPitchM')} step={0.1} /></Field>
          <Field label="Height · low" unit="m"><NumInput value={s.panelHeightMinM} onChange={u('panelHeightMinM')} step={0.1} /></Field>
          <Field label="Height · high" unit="m"><NumInput value={s.panelHeightMaxM} onChange={u('panelHeightMaxM')} step={0.1} /></Field>
        </FieldRow>
      </FieldGroup>

      <FieldGroup title="Capacity targets">
        <FieldRow cols={3}>
          <Field label="DC capacity" unit="kWp" required><NumInput value={s.capacityDcKw} onChange={u('capacityDcKw')} step={100} tone="pulse" /></Field>
          <Field label="Module count" unit="units"><NumInput value={s.moduleCountTarget} onChange={u('moduleCountTarget')} step={10} /></Field>
          <Derived label="Count from capacity" value={derivedCountFromCapacity.toLocaleString()} sub="auto-check" />
        </FieldRow>
      </FieldGroup>
    </SectionBody>
  );
}
