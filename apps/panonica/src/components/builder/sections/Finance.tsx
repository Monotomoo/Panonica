import { useProjectStore } from '@/store/projectStore';
import { Field, FieldGroup, FieldRow, NumInput, SectionBody, Segmented, Toggle, Derived } from '../BuilderPrimitives';

export function FinanceSection() {
  const s = useProjectStore((s) => s.finance);
  const update = useProjectStore((s) => s.update);
  const u = <K extends keyof typeof s>(k: K) => (v: (typeof s)[K]) => update('finance', k, v);

  const stackSum = s.senior_debtPct + s.mezzanine_debtPct + s.sponsorEquityPct;

  return (
    <SectionBody title="11 · Finance" subtitle="Discount · tax · PPA · capital stack · exit. Live-feeds the right-panel IRR/DSCR.">
      <FieldGroup title="Macro">
        <FieldRow cols={4}>
          <Field label="Discount rate" unit="%"><NumInput value={s.discountRatePct} onChange={u('discountRatePct')} step={0.5} /></Field>
          <Field label="Inflation" unit="%"><NumInput value={s.inflationRatePct} onChange={u('inflationRatePct')} step={0.1} /></Field>
          <Field label="Corporate tax" unit="%"><NumInput value={s.corporateTaxRatePct} onChange={u('corporateTaxRatePct')} step={1} /></Field>
          <Field label="VAT" unit="%"><NumInput value={s.vatRatePct} onChange={u('vatRatePct')} step={1} /></Field>
          <Field label="Property tax" unit="%"><NumInput value={s.propertyTaxRatePct} onChange={u('propertyTaxRatePct')} step={0.1} /></Field>
          <Field label="Depreciation life" unit="yr"><NumInput value={s.depreciationLife} onChange={u('depreciationLife')} step={1} /></Field>
          <Field label="EPC contingency" unit="%"><NumInput value={s.contingencyPctCapex} onChange={u('contingencyPctCapex')} step={0.5} hint="Standard 8% utility-scale" /></Field>
          <Field label="Insurance · annual" unit="€/yr"><NumInput value={s.insuranceAnnualEur} onChange={u('insuranceAnnualEur')} step={1000} /></Field>
        </FieldRow>
      </FieldGroup>

      <FieldGroup title="Revenue · PPA">
        <FieldRow cols={4}>
          <Field label="PPA price" unit="€/MWh"><NumInput value={s.ppaPriceEurMwh} onChange={u('ppaPriceEurMwh')} step={1} tone="agri" /></Field>
          <Field label="Tenor" unit="yr"><NumInput value={s.ppaTenorYears} onChange={u('ppaTenorYears')} step={1} /></Field>
          <Field label="Escalation" unit="%/yr"><NumInput value={s.ppaEscalationPctYr} onChange={u('ppaEscalationPctYr')} step={0.1} /></Field>
          <Field label="Take-or-pay"><Toggle value={s.ppaTakeOrPay} onChange={u('ppaTakeOrPay')} /></Field>
          <Field label="Price floor"><Toggle value={s.ppaPriceFloor} onChange={u('ppaPriceFloor')} /></Field>
          <Field label="GoO" unit="€/MWh"><NumInput value={s.guaranteesOfOriginRevenueEurMwh} onChange={u('guaranteesOfOriginRevenueEurMwh')} step={0.5} /></Field>
          <Field label="Capacity market" unit="€/MW·yr"><NumInput value={s.capacityMarketRevenueEurMwYr} onChange={u('capacityMarketRevenueEurMwYr')} step={100} /></Field>
        </FieldRow>
      </FieldGroup>

      <FieldGroup title="Capital stack">
        <FieldRow cols={3}>
          <Field label="Senior debt" unit="%"><NumInput value={s.senior_debtPct} onChange={u('senior_debtPct')} step={1} /></Field>
          <Field label="Mezzanine" unit="%"><NumInput value={s.mezzanine_debtPct} onChange={u('mezzanine_debtPct')} step={1} /></Field>
          <Field label="Sponsor equity" unit="%"><NumInput value={s.sponsorEquityPct} onChange={u('sponsorEquityPct')} step={1} /></Field>
        </FieldRow>
        <Derived label="Stack total" value={`${stackSum}%`} sub="must equal 100%" tone={stackSum === 100 ? 'agri' : 'spark'} />
      </FieldGroup>

      <FieldGroup title="Debt terms">
        <FieldRow cols={4}>
          <Field label="Senior rate" unit="%"><NumInput value={s.senior_ratePct} onChange={u('senior_ratePct')} step={0.25} /></Field>
          <Field label="Senior tenor" unit="yr"><NumInput value={s.senior_tenorYears} onChange={u('senior_tenorYears')} step={1} /></Field>
          <Field label="DSCR covenant"><NumInput value={s.senior_dscrCovenant} onChange={u('senior_dscrCovenant')} step={0.05} /></Field>
          <Field label="Mezz rate" unit="%"><NumInput value={s.mezzanine_ratePct} onChange={u('mezzanine_ratePct')} step={0.25} /></Field>
          <Field label="Equity IRR target" unit="%"><NumInput value={s.equityIrrTargetPct} onChange={u('equityIrrTargetPct')} step={0.5} /></Field>
          <Field label="Refinancing year" unit="yr"><NumInput value={s.refinancingYear} onChange={u('refinancingYear')} step={1} /></Field>
          <Field label="Dividend policy">
            <Segmented value={s.dividendPolicy} onChange={u('dividendPolicy')} options={[
              { value: 'quarterly', label: 'Quarterly' }, { value: 'annual', label: 'Annual' }, { value: 'at-refi', label: 'At refi' }, { value: 'at-exit', label: 'At exit' },
            ]} size="sm" />
          </Field>
        </FieldRow>
      </FieldGroup>

      <FieldGroup title="Exit">
        <FieldRow cols={3}>
          <Field label="Exit year" unit="yr"><NumInput value={s.exitYear} onChange={u('exitYear')} step={1} /></Field>
          <Field label="Exit cap rate" unit="%"><NumInput value={s.exitCapRatePct} onChange={u('exitCapRatePct')} step={0.25} tone="sun" /></Field>
        </FieldRow>
      </FieldGroup>
    </SectionBody>
  );
}
