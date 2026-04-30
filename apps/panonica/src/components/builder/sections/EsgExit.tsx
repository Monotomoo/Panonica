import { useProjectStore } from '@/store/projectStore';
import { ChipGroup, Field, FieldGroup, FieldRow, NumInput, SectionBody, Segmented, Toggle } from '../BuilderPrimitives';

export function EsgExitSection() {
  const s = useProjectStore((s) => s.esgExit);
  const update = useProjectStore((s) => s.update);
  const u = <K extends keyof typeof s>(k: K) => (v: (typeof s)[K]) => update('esgExit', k, v);

  return (
    <SectionBody title="16 · ESG & Exit" subtitle="Lifecycle carbon · EU Taxonomy DNSH · community benefits · acquirer pool.">
      <FieldGroup title="Carbon & environment">
        <FieldRow cols={3}>
          <Field label="Lifecycle carbon" unit="tCO₂/MWp"><NumInput value={s.lifecycleCarbonTco2PerMwp} onChange={u('lifecycleCarbonTco2PerMwp')} step={10} /></Field>
          <Field label="Water use" unit="m³/yr"><NumInput value={s.waterUseM3PerYr} onChange={u('waterUseM3PerYr')} step={10} /></Field>
          <Field label="CRCF annual" unit="tCO₂"><NumInput value={s.crcfCarbonCreditAnnualTco2} onChange={u('crcfCarbonCreditAnnualTco2')} step={100} /></Field>
        </FieldRow>
      </FieldGroup>

      <FieldGroup title="Biodiversity & community">
        <FieldRow cols={4}>
          <Field label="Biodiversity baseline" unit="score"><NumInput value={s.biodiversityBaselineScore} onChange={u('biodiversityBaselineScore')} step={1} /></Field>
          <Field label="Uplift @ 5yr" unit="%"><NumInput value={s.biodiversityUpliftPctAt5yr} onChange={u('biodiversityUpliftPctAt5yr')} step={1} /></Field>
          <Field label="Community benefits" unit="€/yr"><NumInput value={s.communityBenefitsEurYr} onChange={u('communityBenefitsEurYr')} step={1000} /></Field>
          <Field label="Local employment" unit="FTE"><NumInput value={s.localEmploymentFte} onChange={u('localEmploymentFte')} step={1} /></Field>
        </FieldRow>
      </FieldGroup>

      <FieldGroup title="Compliance">
        <FieldRow cols={3}>
          <Field label="EU Taxonomy DNSH"><Toggle value={s.euTaxonomyDnshCompliant} onChange={u('euTaxonomyDnshCompliant')} /></Field>
          <Field label="Modern Slavery Act check"><Toggle value={s.modernSlaveryCheckDone} onChange={u('modernSlaveryCheckDone')} /></Field>
          <Field label="Conflict minerals check"><Toggle value={s.conflictMineralsCheckDone} onChange={u('conflictMineralsCheckDone')} /></Field>
        </FieldRow>
      </FieldGroup>

      <FieldGroup title="Exit strategy">
        <FieldRow cols={1}>
          <Field label="Scenario">
            <Segmented value={s.exitScenarioType} onChange={u('exitScenarioType')} options={[
              { value: 'ipp-strategic', label: 'IPP strategic' },
              { value: 'infra-fund', label: 'Infra fund' },
              { value: 'yieldco-ipo', label: 'YieldCo IPO' },
              { value: 'hold-to-maturity', label: 'Hold to maturity' },
            ]} size="sm" />
          </Field>
          <Field label="Target acquirer pool">
            <ChipGroup value={s.targetAcquirerPool} onChange={u('targetAcquirerPool')} options={[
              { value: 'Sonnedix', label: 'Sonnedix' },
              { value: 'Ib Vogt', label: 'Ib Vogt' },
              { value: 'HEP OIE', label: 'HEP OIE' },
              { value: 'Končar', label: 'Končar' },
              { value: 'Solida consortium', label: 'Solida' },
              { value: 'EnBW', label: 'EnBW' },
              { value: 'Brookfield', label: 'Brookfield' },
              { value: 'BlackRock Infra', label: 'BlackRock' },
            ]} />
          </Field>
        </FieldRow>
      </FieldGroup>
    </SectionBody>
  );
}
