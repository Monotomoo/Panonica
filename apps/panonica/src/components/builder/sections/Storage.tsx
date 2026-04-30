import { useProjectStore } from '@/store/projectStore';
import { ChipGroup, Field, FieldGroup, FieldRow, NumInput, SectionBody, Segmented, TextInput, Toggle, Derived } from '../BuilderPrimitives';

export function StorageSection() {
  const s = useProjectStore((s) => s.storage);
  const update = useProjectStore((s) => s.update);
  const u = <K extends keyof typeof s>(k: K) => (v: (typeof s)[K]) => update('storage', k, v);

  const durationH = s.powerMw > 0 ? s.energyMwh / s.powerMw : 0;

  if (!s.enabled) {
    return (
      <SectionBody title="07 · Storage" subtitle="Battery is disabled. Enable to spec the storage asset.">
        <div className="flex items-center gap-4 rounded-md border border-border bg-surface/30 p-6">
          <Toggle value={s.enabled} onChange={u('enabled')} label="enable storage" />
          <span className="font-mono text-[11px] text-text-secondary">
            LFP batteries enable noon-peak arbitrage + grid services · typical 6-18 MWh for 30 MW PV
          </span>
        </div>
      </SectionBody>
    );
  }

  return (
    <SectionBody title="07 · Storage" subtitle="Battery sizing · chemistry · thermal · grid services.">
      <div className="flex items-center gap-4">
        <Toggle value={s.enabled} onChange={u('enabled')} label="enabled" />
      </div>

      <FieldGroup title="Sizing">
        <FieldRow cols={4}>
          <Field label="Energy" unit="MWh"><NumInput value={s.energyMwh} onChange={u('energyMwh')} step={1} tone="pulse" /></Field>
          <Field label="Power" unit="MW"><NumInput value={s.powerMw} onChange={u('powerMw')} step={0.5} tone="pulse" /></Field>
          <Derived label="Duration" value={`${durationH.toFixed(1)} h`} sub="E/P ratio" />
          <Field label="DoD" unit="%"><NumInput value={s.dodPct} onChange={u('dodPct')} step={5} /></Field>
        </FieldRow>
      </FieldGroup>

      <FieldGroup title="Chemistry & performance">
        <FieldRow cols={3}>
          <Field label="Chemistry">
            <Segmented value={s.chemistry} onChange={u('chemistry')} options={[
              { value: 'lfp', label: 'LFP' }, { value: 'nmc', label: 'NMC' }, { value: 'flow', label: 'Flow' }, { value: 'sodium-ion', label: 'Na-ion' }, { value: 'sla', label: 'SLA' },
            ]} size="sm" />
          </Field>
          <Field label="C-rate charge"><NumInput value={s.cRateCharge} onChange={u('cRateCharge')} step={0.05} /></Field>
          <Field label="C-rate discharge"><NumInput value={s.cRateDischarge} onChange={u('cRateDischarge')} step={0.05} /></Field>
          <Field label="Round-trip η" unit="%"><NumInput value={s.roundTripEffPct} onChange={u('roundTripEffPct')} step={0.5} /></Field>
          <Field label="Cycles to 80%"><NumInput value={s.cyclesTo80Pct} onChange={u('cyclesTo80Pct')} step={100} /></Field>
          <Field label="Degradation" unit="%/yr"><NumInput value={s.degradationPerYearPct} onChange={u('degradationPerYearPct')} step={0.1} /></Field>
        </FieldRow>
      </FieldGroup>

      <FieldGroup title="Thermal & safety">
        <FieldRow cols={2}>
          <Field label="Thermal management">
            <Segmented value={s.thermalManagement} onChange={u('thermalManagement')} options={[
              { value: 'passive-air', label: 'Passive' }, { value: 'forced-air', label: 'Forced air' }, { value: 'liquid', label: 'Liquid' },
            ]} size="sm" />
          </Field>
          <Field label="Fire suppression">
            <Segmented value={s.fireSuppressionSystem} onChange={u('fireSuppressionSystem')} options={[
              { value: 'water-mist', label: 'Mist' }, { value: 'aerosol', label: 'Aerosol' }, { value: 'inert-gas', label: 'Inert gas' }, { value: 'none', label: 'None' },
            ]} size="sm" />
          </Field>
        </FieldRow>
      </FieldGroup>

      <FieldGroup title="Management">
        <FieldRow cols={2}>
          <Field label="BMS vendor"><TextInput value={s.bmsVendor} onChange={u('bmsVendor')} /></Field>
          <Field label="EMS vendor"><TextInput value={s.emsVendor} onChange={u('emsVendor')} /></Field>
          <Field label="Cycle life in model"><Toggle value={s.cycleLifeCosted} onChange={u('cycleLifeCosted')} /></Field>
          <Field label="Augmentation planned"><Toggle value={s.augmentationPlanned} onChange={u('augmentationPlanned')} /></Field>
        </FieldRow>
        <Field label="Grid services" hint="Select all revenue streams this battery will chase">
          <ChipGroup value={s.gridServicesEnabled} onChange={u('gridServicesEnabled')} options={[
            { value: 'arbitrage', label: 'Energy arbitrage' },
            { value: 'freq-response', label: 'Frequency response' },
            { value: 'capacity-market', label: 'Capacity market' },
            { value: 'black-start', label: 'Black start' },
            { value: 'spinning-reserve', label: 'Spinning reserve' },
          ]} />
        </Field>
      </FieldGroup>
    </SectionBody>
  );
}
