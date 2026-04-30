import { useProjectStore } from '@/store/projectStore';
import { Field, FieldGroup, FieldRow, NumInput, SectionBody, Segmented, Select, TextInput, Toggle, Derived } from '../BuilderPrimitives';

export function PowerElectronicsSection() {
  const s = useProjectStore((s) => s.powerElectronics);
  const gen = useProjectStore((s) => s.generation);
  const update = useProjectStore((s) => s.update);
  const u = <K extends keyof typeof s>(k: K) => (v: (typeof s)[K]) => update('powerElectronics', k, v);

  const derivedVocStack = (s.modulesPerString * gen.moduleVoc).toFixed(0);
  const derivedTotalInverterKw = s.inverterCount * s.inverterKw;
  const derivedTargetAcKw = gen.capacityDcKw / Math.max(s.dcAcRatio, 0.1);

  return (
    <SectionBody title="05 · Power Electronics" subtitle="Inverter selection · DC/AC design · string voltage stack · MV transformer.">
      <FieldGroup title="Inverter">
        <FieldRow cols={2}>
          <Field label="Make"><TextInput value={s.inverterMake} onChange={u('inverterMake')} /></Field>
          <Field label="Model"><TextInput value={s.inverterModel} onChange={u('inverterModel')} /></Field>
        </FieldRow>
        <FieldRow cols={4}>
          <Field label="Topology">
            <Segmented value={s.inverterTopology} onChange={u('inverterTopology')} options={[
              { value: 'string', label: 'String' },
              { value: 'central', label: 'Central' },
              { value: 'micro', label: 'Micro' },
              { value: 'hybrid', label: 'Hybrid' },
            ]} size="sm" />
          </Field>
          <Field label="Rated" unit="kW"><NumInput value={s.inverterKw} onChange={u('inverterKw')} step={5} tone="signal" /></Field>
          <Field label="η CEC" unit="%"><NumInput value={s.inverterEffCec} onChange={u('inverterEffCec')} step={0.1} /></Field>
          <Field label="η max" unit="%"><NumInput value={s.inverterEffMax} onChange={u('inverterEffMax')} step={0.1} /></Field>
          <Field label="MPPT channels"><NumInput value={s.inverterMpptChannels} onChange={u('inverterMpptChannels')} step={1} /></Field>
          <Field label="MPPT Vmin" unit="V"><NumInput value={s.inverterMpptVmin} onChange={u('inverterMpptVmin')} step={10} /></Field>
          <Field label="MPPT Vmax" unit="V"><NumInput value={s.inverterMpptVmax} onChange={u('inverterMpptVmax')} step={10} /></Field>
          <Field label="IP rating"><TextInput value={s.inverterIpRating} onChange={u('inverterIpRating')} /></Field>
        </FieldRow>
        <FieldRow cols={3}>
          <Field label="Count" required><NumInput value={s.inverterCount} onChange={u('inverterCount')} step={1} tone="signal" /></Field>
          <Derived label="Installed AC" value={`${(derivedTotalInverterKw / 1000).toFixed(1)} MW`} sub="count × rated" />
          <Derived label="Target AC (from DC)" value={`${(derivedTargetAcKw / 1000).toFixed(1)} MW`} tone="pulse" sub="DC / DC·AC ratio" />
        </FieldRow>
      </FieldGroup>

      <FieldGroup title="DC design">
        <FieldRow cols={4}>
          <Field label="DC/AC ratio"><NumInput value={s.dcAcRatio} onChange={u('dcAcRatio')} step={0.01} tone="signal" /></Field>
          <Field label="Strings / MPPT"><NumInput value={s.stringsPerMppt} onChange={u('stringsPerMppt')} step={1} /></Field>
          <Field label="Modules / string"><NumInput value={s.modulesPerString} onChange={u('modulesPerString')} step={1} /></Field>
          <Derived label="Voc stack" value={`${derivedVocStack} V`} tone={parseFloat(derivedVocStack) > s.inverterMpptVmax ? 'spark' : 'agri'} sub={`max ${s.inverterMpptVmax}V`} />
          <Field label="Isc / string" unit="A"><NumInput value={s.iscPerStringA} onChange={u('iscPerStringA')} step={0.1} /></Field>
          <Field label="DC cable" unit="mm²"><NumInput value={s.dcCableMm2} onChange={u('dcCableMm2')} step={1} /></Field>
          <Field label="DC cable avg" unit="m"><NumInput value={s.dcCableLengthAvgM} onChange={u('dcCableLengthAvgM')} step={10} /></Field>
        </FieldRow>
      </FieldGroup>

      <FieldGroup title="AC collection">
        <FieldRow cols={4}>
          <Field label="AC voltage" unit="V"><NumInput value={s.acCollectionVoltageV} onChange={u('acCollectionVoltageV')} step={10} /></Field>
          <Field label="AC cable" unit="mm²"><NumInput value={s.acCableMm2} onChange={u('acCableMm2')} step={10} /></Field>
          <Field label="AC cable avg" unit="m"><NumInput value={s.acCableLengthAvgM} onChange={u('acCableLengthAvgM')} step={10} /></Field>
          <Field label="Cable material">
            <Segmented value={s.acCableMaterial} onChange={u('acCableMaterial')} options={[
              { value: 'aluminium', label: 'Al' },
              { value: 'copper', label: 'Cu' },
            ]} size="sm" />
          </Field>
        </FieldRow>
      </FieldGroup>

      <FieldGroup title="Step-up transformer">
        <FieldRow cols={4}>
          <Field label="Rating" unit="kVA"><NumInput value={s.transformerKva} onChange={u('transformerKva')} step={500} /></Field>
          <Field label="Vector group"><TextInput value={s.transformerVectorGroup} onChange={u('transformerVectorGroup')} placeholder="Dyn11" /></Field>
          <Field label="Count"><NumInput value={s.transformerCount} onChange={u('transformerCount')} step={1} /></Field>
          <Field label="No-load losses" unit="kW"><NumInput value={s.transformerNoLoadLossesKw} onChange={u('transformerNoLoadLossesKw')} step={1} /></Field>
          <Field label="Load losses" unit="kW"><NumInput value={s.transformerLoadLossesKw} onChange={u('transformerLoadLossesKw')} step={1} /></Field>
        </FieldRow>
      </FieldGroup>

      <FieldGroup title="Protection">
        <FieldRow cols={3}>
          <Field label="Protection scheme">
            <Segmented value={s.protectionScheme} onChange={u('protectionScheme')} options={[
              { value: 'NH-fuses', label: 'NH fuses' },
              { value: 'MCCB', label: 'MCCB' },
              { value: 'MCCB+relays', label: 'MCCB + relays' },
              { value: 'differential+87T', label: '87T diff' },
            ]} size="sm" />
          </Field>
          <Field label="Surge arresters"><Toggle value={s.surgeArrestersInstalled} onChange={u('surgeArrestersInstalled')} /></Field>
          <Field label="Lightning rods"><NumInput value={s.lightningRodsCount} onChange={u('lightningRodsCount')} step={1} /></Field>
        </FieldRow>
      </FieldGroup>
    </SectionBody>
  );
}
