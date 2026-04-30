import { useProjectStore } from '@/store/projectStore';
import { Field, FieldGroup, FieldRow, NumInput, SectionBody, Segmented, Select, TextInput, Toggle } from '../BuilderPrimitives';

export function GridConnectionSection() {
  const s = useProjectStore((s) => s.gridConnection);
  const update = useProjectStore((s) => s.update);
  const u = <K extends keyof typeof s>(k: K) => (v: (typeof s)[K]) => update('gridConnection', k, v);

  return (
    <SectionBody title="06 · Grid Connection" subtitle="PCC · MV cable · protection · ride-through compliance · HOPS queue.">
      <FieldGroup title="Point of connection">
        <FieldRow cols={2}>
          <Field label="PCC substation"><TextInput value={s.pccSubstation} onChange={u('pccSubstation')} /></Field>
          <Field label="Voltage" unit="kV">
            <Segmented value={String(s.pccVoltageKv)} onChange={(v) => u('pccVoltageKv')(parseInt(v, 10))} options={[
              { value: '20', label: '20' }, { value: '30', label: '30' }, { value: '35', label: '35' }, { value: '110', label: '110' },
            ]} size="sm" />
          </Field>
          <Field label="Distance" unit="km"><NumInput value={s.pccDistanceKm} onChange={u('pccDistanceKm')} step={0.1} /></Field>
          <Field label="Route">
            <Segmented value={s.cableRouteOption} onChange={u('cableRouteOption')} options={[
              { value: 'direct', label: 'Direct' }, { value: 'along-road', label: 'Along road' }, { value: 'mixed', label: 'Mixed' },
            ]} size="sm" />
          </Field>
        </FieldRow>
      </FieldGroup>

      <FieldGroup title="MV cable">
        <FieldRow cols={4}>
          <Field label="Material">
            <Segmented value={s.cableMaterial} onChange={u('cableMaterial')} options={[
              { value: 'aluminium', label: 'Al' }, { value: 'copper', label: 'Cu' },
            ]} size="sm" />
          </Field>
          <Field label="Cross-section" unit="mm²"><NumInput value={s.cableCrossSectionMm2} onChange={u('cableCrossSectionMm2')} step={10} /></Field>
          <Field label="Installation">
            <Segmented value={s.cableInstallation} onChange={u('cableInstallation')} options={[
              { value: 'duct', label: 'Duct' }, { value: 'direct-bury', label: 'Buried' }, { value: 'aerial', label: 'Aerial' }, { value: 'mixed', label: 'Mixed' },
            ]} size="sm" />
          </Field>
          <Field label="Ferranti rise" unit="%"><NumInput value={s.ferrantiRisePct} onChange={u('ferrantiRisePct')} step={0.1} /></Field>
        </FieldRow>
      </FieldGroup>

      <FieldGroup title="Protection & earthing">
        <FieldRow cols={4}>
          <Field label="Short-circuit" unit="kA"><NumInput value={s.shortCircuitKa} onChange={u('shortCircuitKa')} step={0.5} /></Field>
          <Field label="Earthing">
            <Segmented value={s.earthingScheme} onChange={u('earthingScheme')} options={[
              { value: 'TN-S', label: 'TN-S' }, { value: 'TN-C-S', label: 'TN-C-S' }, { value: 'TT', label: 'TT' }, { value: 'IT', label: 'IT' },
            ]} size="sm" />
          </Field>
          <Field label="MV switchgear"><TextInput value={s.mvSwitchgearMake} onChange={u('mvSwitchgearMake')} /></Field>
          <Field label="Metering class">
            <Segmented value={s.meteringClass} onChange={u('meteringClass')} options={[
              { value: '0.2S', label: '0.2S' }, { value: '0.5S', label: '0.5S' }, { value: '1', label: '1' },
            ]} size="sm" />
          </Field>
        </FieldRow>
      </FieldGroup>

      <FieldGroup title="Reactive compensation">
        <FieldRow cols={2}>
          <Field label="Reactive power" unit="kVAr"><NumInput value={s.reactivePowerKvar} onChange={u('reactivePowerKvar')} step={100} /></Field>
          <Field label="Compensation type">
            <Segmented value={s.reactiveCompensationType} onChange={u('reactiveCompensationType')} options={[
              { value: 'capacitor', label: 'Capacitor' }, { value: 'STATCOM', label: 'STATCOM' }, { value: 'SVC', label: 'SVC' }, { value: 'none', label: 'None' },
            ]} size="sm" />
          </Field>
        </FieldRow>
      </FieldGroup>

      <FieldGroup title="Grid code compliance">
        <FieldRow cols={3}>
          <Field label="LVRT compliant"><Toggle value={s.lvrtCompliant} onChange={u('lvrtCompliant')} /></Field>
          <Field label="HVRT compliant"><Toggle value={s.hvrtCompliant} onChange={u('hvrtCompliant')} /></Field>
          <Field label="Freq response"><Toggle value={s.frequencyResponseCompliant} onChange={u('frequencyResponseCompliant')} /></Field>
          <Field label="THD" unit="%"><NumInput value={s.thdPct} onChange={u('thdPct')} step={0.1} hint="Max 5% per HOPS" /></Field>
          <Field label="Flicker Pst"><NumInput value={s.flickerPst} onChange={u('flickerPst')} step={0.1} /></Field>
          <Field label="Comms protocol">
            <Segmented value={s.communicationProtocol} onChange={u('communicationProtocol')} options={[
              { value: 'IEC 61850', label: 'IEC 61850' }, { value: 'Modbus TCP', label: 'Modbus' }, { value: 'DNP3', label: 'DNP3' }, { value: 'proprietary', label: 'Proprietary' },
            ]} size="sm" />
          </Field>
        </FieldRow>
      </FieldGroup>

      <FieldGroup title="HEP queue">
        <FieldRow cols={3}>
          <Field label="Queue position"><NumInput value={s.gridQueuePosition} onChange={u('gridQueuePosition')} step={1} /></Field>
          <Field label="Total in queue"><NumInput value={s.gridQueueTotal} onChange={u('gridQueueTotal')} step={1} /></Field>
          <Field label="Expected COD"><TextInput value={s.expectedConnectionDate} onChange={u('expectedConnectionDate')} placeholder="2027-09-01" /></Field>
        </FieldRow>
      </FieldGroup>
    </SectionBody>
  );
}
