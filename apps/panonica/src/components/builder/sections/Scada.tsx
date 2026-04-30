import { useProjectStore } from '@/store/projectStore';
import { Field, FieldGroup, FieldRow, NumInput, SectionBody, Segmented, TextInput, Toggle } from '../BuilderPrimitives';

export function ScadaSection() {
  const s = useProjectStore((s) => s.scada);
  const update = useProjectStore((s) => s.update);
  const u = <K extends keyof typeof s>(k: K) => (v: (typeof s)[K]) => update('scada', k, v);

  return (
    <SectionBody title="10 · SCADA & Telemetry" subtitle="Monitoring master · protocol · comms · cyber · Agros companion integration.">
      <FieldGroup title="SCADA master">
        <FieldRow cols={2}>
          <Field label="Master vendor"><TextInput value={s.scadaMasterVendor} onChange={u('scadaMasterVendor')} /></Field>
          <Field label="Protocol">
            <Segmented value={s.scadaProtocol} onChange={u('scadaProtocol')} options={[
              { value: 'IEC 61850', label: 'IEC 61850' }, { value: 'Modbus TCP', label: 'Modbus' }, { value: 'DNP3', label: 'DNP3' }, { value: 'OPC UA', label: 'OPC UA' },
            ]} size="sm" />
          </Field>
          <Field label="Polling" unit="ms"><NumInput value={s.telemetryPollingMs} onChange={u('telemetryPollingMs')} step={100} /></Field>
          <Field label="Retention" unit="days"><NumInput value={s.dataRetentionDays} onChange={u('dataRetentionDays')} step={30} /></Field>
        </FieldRow>
      </FieldGroup>

      <FieldGroup title="Communications">
        <FieldRow cols={2}>
          <Field label="Backbone">
            <Segmented value={s.commsBackbone} onChange={u('commsBackbone')} options={[
              { value: 'fiber', label: 'Fiber' }, { value: 'cellular-4g', label: '4G' }, { value: 'cellular-5g', label: '5G' }, { value: 'radio', label: 'Radio' }, { value: 'hybrid', label: 'Hybrid' },
            ]} size="sm" />
          </Field>
          <Field label="Redundant link"><Toggle value={s.commsRedundancy} onChange={u('commsRedundancy')} /></Field>
          <Field label="Local HMI count"><NumInput value={s.localHmiCount} onChange={u('localHmiCount')} step={1} /></Field>
          <Field label="Remote access">
            <Segmented value={s.remoteAccess} onChange={u('remoteAccess')} options={[
              { value: 'vpn', label: 'VPN' }, { value: 'direct', label: 'Direct' }, { value: 'jump-host', label: 'Jump-host' }, { value: 'operator-only', label: 'Op-only' },
            ]} size="sm" />
          </Field>
        </FieldRow>
      </FieldGroup>

      <FieldGroup title="Cyber & integrations">
        <FieldRow cols={2}>
          <Field label="Cyber hardening">
            <Segmented value={s.cyberHardening} onChange={u('cyberHardening')} options={[
              { value: 'baseline', label: 'Baseline' }, { value: 'iec-62443-2-4', label: 'IEC 62443-2-4' }, { value: 'iec-62443-3-3', label: 'IEC 62443-3-3' }, { value: 'custom', label: 'Custom' },
            ]} size="sm" />
          </Field>
          <Field label="IEC-certified"><Toggle value={s.iecCertified} onChange={u('iecCertified')} /></Field>
          <Field label="Agros Flock Monitor integration" hint="Companion app for sheep telemetry · shares backend"><Toggle value={s.agrosIntegrationEnabled} onChange={u('agrosIntegrationEnabled')} /></Field>
        </FieldRow>
      </FieldGroup>
    </SectionBody>
  );
}
