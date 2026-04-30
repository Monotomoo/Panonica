import { useProjectStore } from '@/store/projectStore';
import { ChipGroup, Field, FieldGroup, FieldRow, NumInput, SectionBody, Segmented, Toggle } from '../BuilderPrimitives';

export function RiskInsuranceSection() {
  const s = useProjectStore((s) => s.riskInsurance);
  const update = useProjectStore((s) => s.update);
  const u = <K extends keyof typeof s>(k: K) => (v: (typeof s)[K]) => update('riskInsurance', k, v);

  return (
    <SectionBody title="15 · Risk & Insurance" subtitle="Coverage package · hedging · force majeure · counterparty concentration.">
      <FieldGroup title="Insurance cover">
        <FieldRow cols={3}>
          <Field label="Property all-risk"><Toggle value={s.propertyAllRiskCover} onChange={u('propertyAllRiskCover')} /></Field>
          <Field label="Revenue loss"><Toggle value={s.revenueLossCover} onChange={u('revenueLossCover')} /></Field>
          <Field label="Liability"><Toggle value={s.liabilityCover} onChange={u('liabilityCover')} /></Field>
          <Field label="Cyber"><Toggle value={s.cyberCover} onChange={u('cyberCover')} /></Field>
          <Field label="Environmental"><Toggle value={s.environmentalCover} onChange={u('environmentalCover')} /></Field>
        </FieldRow>
        <FieldRow cols={2}>
          <Field label="Premium · annual" unit="€"><NumInput value={s.insurancePremiumAnnualEur} onChange={u('insurancePremiumAnnualEur')} step={1000} /></Field>
          <Field label="Deductible" unit="€"><NumInput value={s.deductibleEur} onChange={u('deductibleEur')} step={5000} /></Field>
        </FieldRow>
      </FieldGroup>

      <FieldGroup title="Force majeure exposure">
        <Field label="Events in register" hint="Select the classes of event your insurance + contracts cover">
          <ChipGroup value={s.forceMajeureList} onChange={u('forceMajeureList')} options={[
            { value: 'hail', label: 'Hail' },
            { value: 'flood', label: 'Flood' },
            { value: 'theft', label: 'Theft' },
            { value: 'fire', label: 'Fire' },
            { value: 'grid-fault', label: 'Grid fault' },
            { value: 'cyber', label: 'Cyber' },
            { value: 'terrorism', label: 'Terrorism' },
            { value: 'war', label: 'War' },
            { value: 'earthquake', label: 'Earthquake' },
          ]} />
        </Field>
      </FieldGroup>

      <FieldGroup title="Hedging & market">
        <FieldRow cols={3}>
          <Field label="Climate scenario">
            <Segmented value={s.climateScenario} onChange={u('climateScenario')} options={[
              { value: 'current', label: 'Current' }, { value: 'rcp45', label: 'RCP 4.5' }, { value: 'rcp85', label: 'RCP 8.5' },
            ]} size="sm" />
          </Field>
          <Field label="Hedging instrument">
            <Segmented value={s.hedging} onChange={u('hedging')} options={[
              { value: 'none', label: 'None' }, { value: 'ppa-floor', label: 'PPA floor' }, { value: 'collar', label: 'Collar' }, { value: 'forwards', label: 'Forwards' },
            ]} size="sm" />
          </Field>
          <Field label="Counterparty · concentration" unit="%"><NumInput value={s.counterpartyConcentrationPct} onChange={u('counterpartyConcentrationPct')} step={5} /></Field>
        </FieldRow>
      </FieldGroup>
    </SectionBody>
  );
}
