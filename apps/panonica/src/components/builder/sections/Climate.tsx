import { useProjectStore } from '@/store/projectStore';
import { Field, FieldGroup, FieldRow, NumInput, SectionBody, TextInput } from '../BuilderPrimitives';

export function ClimateSection() {
  const s = useProjectStore((s) => s.climate);
  const update = useProjectStore((s) => s.update);
  const u = <K extends keyof typeof s>(k: K) => (v: (typeof s)[K]) => update('climate', k, v);

  return (
    <SectionBody title="02 · Climate & Resource" subtitle="Solar resource · design-case weather · seismic + snow + wind loads that drive structural CAPEX.">
      <FieldGroup title="Solar resource">
        <FieldRow cols={4}>
          <Field label="GHI" unit="kWh/m²·yr" hint="Global horizontal irradiance"><NumInput value={s.ghiKwhM2Yr} onChange={u('ghiKwhM2Yr')} step={1} tone="sun" /></Field>
          <Field label="DNI" unit="kWh/m²·yr" hint="Direct normal (for tracker yield)"><NumInput value={s.dniKwhM2Yr} onChange={u('dniKwhM2Yr')} step={1} /></Field>
          <Field label="DHI" unit="kWh/m²·yr" hint="Diffuse horizontal"><NumInput value={s.dhiKwhM2Yr} onChange={u('dhiKwhM2Yr')} step={1} /></Field>
          <Field label="Peak sun hours" unit="h/day"><NumInput value={s.peakSunHours} onChange={u('peakSunHours')} step={0.1} tone="sun" /></Field>
        </FieldRow>
        <Field label="Reference weather station"><TextInput value={s.weatherStationRef} onChange={u('weatherStationRef')} /></Field>
      </FieldGroup>

      <FieldGroup title="Ambient conditions">
        <FieldRow cols={3}>
          <Field label="Temp · min" unit="°C"><NumInput value={s.ambientTempMinC} onChange={u('ambientTempMinC')} step={1} /></Field>
          <Field label="Temp · max" unit="°C"><NumInput value={s.ambientTempMaxC} onChange={u('ambientTempMaxC')} step={1} /></Field>
          <Field label="Temp · avg" unit="°C"><NumInput value={s.ambientTempAvgC} onChange={u('ambientTempAvgC')} step={0.1} /></Field>
        </FieldRow>
      </FieldGroup>

      <FieldGroup title="Structural design loads">
        <FieldRow cols={4}>
          <Field label="Wind · design" unit="m/s" hint="50-year return · from national code"><NumInput value={s.windDesignMps} onChange={u('windDesignMps')} step={0.5} /></Field>
          <Field label="Snow load" unit="kPa"><NumInput value={s.snowLoadKpa} onChange={u('snowLoadKpa')} step={0.1} /></Field>
          <Field label="Seismic zone" unit="MSK-64"><NumInput value={s.seismicZoneMSK} onChange={u('seismicZoneMSK')} step={1} min={1} max={10} /></Field>
          <Field label="Hail days / yr"><NumInput value={s.hailDaysPerYear} onChange={u('hailDaysPerYear')} step={0.1} /></Field>
        </FieldRow>
      </FieldGroup>

      <FieldGroup title="Module performance environment">
        <FieldRow cols={2}>
          <Field label="Drought days / yr"><NumInput value={s.droughtDaysPerYear} onChange={u('droughtDaysPerYear')} step={1} /></Field>
          <Field label="Soiling loss" unit="%/yr"><NumInput value={s.soilingLossPctYr} onChange={u('soilingLossPctYr')} step={0.1} hint="Slavonian summers run 4–6%" /></Field>
        </FieldRow>
      </FieldGroup>
    </SectionBody>
  );
}
