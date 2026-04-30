import { useProjectStore } from '@/store/projectStore';
import { Field, FieldGroup, FieldRow, NumInput, SectionBody, Segmented, TextInput, Toggle } from '../BuilderPrimitives';

export function AgricultureSection() {
  const s = useProjectStore((s) => s.agriculture);
  const update = useProjectStore((s) => s.update);
  const u = <K extends keyof typeof s>(k: K) => (v: (typeof s)[K]) => update('agriculture', k, v);

  return (
    <SectionBody title="08 · Agriculture" subtitle="Under-panel system · stocking · CAP eligibility · co-op partnership.">
      <FieldGroup title="System selection">
        <Field label="System type">
          <Segmented value={s.system} onChange={u('system')} options={[
            { value: 'none', label: 'None' },
            { value: 'sheep', label: 'Sheep' },
            { value: 'soy', label: 'Soy' },
            { value: 'herbs', label: 'Herbs' },
            { value: 'berries', label: 'Berries' },
            { value: 'bees', label: 'Bees' },
            { value: 'mixed-rotation', label: 'Mixed' },
          ]} size="sm" />
        </Field>
      </FieldGroup>

      {s.system !== 'none' && (
        <>
          <FieldGroup title="Stocking & breeds">
            <FieldRow cols={3}>
              <Field label="Stocking rate" unit="head/ha"><NumInput value={s.stockingRateHeadPerHa} onChange={u('stockingRateHeadPerHa')} step={0.1} /></Field>
              <Field label="Flock size" unit="head"><NumInput value={s.flockSizeHead} onChange={u('flockSizeHead')} step={4} /></Field>
              <Field label="Breed">
                <Segmented value={s.breed} onChange={u('breed')} options={[
                  { value: 'romanov', label: 'Romanov' },
                  { value: 'dalmatian-pramenka', label: 'Pramenka' },
                  { value: 'merinolandschaf', label: 'Merinolandschaf' },
                  { value: 'mixed', label: 'Mixed' },
                  { value: 'n/a', label: 'N/A' },
                ]} size="sm" />
              </Field>
              <Field label="Grazing paddocks"><NumInput value={s.grazingPaddocks} onChange={u('grazingPaddocks')} step={1} /></Field>
            </FieldRow>
          </FieldGroup>

          <FieldGroup title="Partnership">
            <FieldRow cols={2}>
              <Field label="Co-op partner"><TextInput value={s.coopPartner} onChange={u('coopPartner')} /></Field>
              <Field label="Co-op share" unit="%"><NumInput value={s.coopSharePct} onChange={u('coopSharePct')} step={5} /></Field>
            </FieldRow>
          </FieldGroup>

          <FieldGroup title="Eligibility">
            <FieldRow cols={2}>
              <Field label="CAP Pillar 1 (BISS)"><Toggle value={s.capPillar1Eligible} onChange={u('capPillar1Eligible')} /></Field>
              <Field label="CAP Pillar 2 eco-scheme"><Toggle value={s.capPillar2Ecoscheme} onChange={u('capPillar2Ecoscheme')} /></Field>
              <Field label="EIP-AGRI operational"><Toggle value={s.eipAgriOperational} onChange={u('eipAgriOperational')} /></Field>
              <Field label="Organic conversion"><Toggle value={s.organicConversionPlanned} onChange={u('organicConversionPlanned')} /></Field>
              <Field label="CRCF carbon credit"><Toggle value={s.crcfCarbonCreditEligible} onChange={u('crcfCarbonCreditEligible')} /></Field>
            </FieldRow>
          </FieldGroup>

          <FieldGroup title="Revenue">
            <FieldRow cols={2}>
              <Field label="Agri revenue · annual" unit="€/yr"><NumInput value={s.annualAgriRevenueEur} onChange={u('annualAgriRevenueEur')} step={1000} /></Field>
              <Field label="CAP payments · annual" unit="€/yr"><NumInput value={s.annualCapPaymentsEur} onChange={u('annualCapPaymentsEur')} step={1000} /></Field>
            </FieldRow>
          </FieldGroup>
        </>
      )}
    </SectionBody>
  );
}
