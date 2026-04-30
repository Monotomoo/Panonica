import { useProjectStore } from '@/store/projectStore';
import { Field, FieldGroup, FieldRow, NumInput, SectionBody, Segmented } from '../BuilderPrimitives';

export function CivilBosSection() {
  const s = useProjectStore((s) => s.civilBos);
  const update = useProjectStore((s) => s.update);
  const u = <K extends keyof typeof s>(k: K) => (v: (typeof s)[K]) => update('civilBos', k, v);

  return (
    <SectionBody title="09 · Civil & BoS" subtitle="Site prep · drainage · roads · fence · security · O&M building · trenching.">
      <FieldGroup title="Earthworks">
        <FieldRow cols={3}>
          <Field label="Cut" unit="m³"><NumInput value={s.sitePrepCutM3} onChange={u('sitePrepCutM3')} step={100} /></Field>
          <Field label="Fill" unit="m³"><NumInput value={s.sitePrepFillM3} onChange={u('sitePrepFillM3')} step={100} /></Field>
          <Field label="Topsoil stripped" unit="m³"><NumInput value={s.topsoilStrippedM3} onChange={u('topsoilStrippedM3')} step={100} /></Field>
        </FieldRow>
      </FieldGroup>

      <FieldGroup title="Drainage & roads">
        <FieldRow cols={3}>
          <Field label="Drainage length" unit="m"><NumInput value={s.drainageLengthM} onChange={u('drainageLengthM')} step={50} /></Field>
          <Field label="Internal roads" unit="m"><NumInput value={s.internalRoadsLengthM} onChange={u('internalRoadsLengthM')} step={50} /></Field>
          <Field label="Surface">
            <Segmented value={s.internalRoadsSurface} onChange={u('internalRoadsSurface')} options={[
              { value: 'gravel', label: 'Gravel' },
              { value: 'asphalt', label: 'Asphalt' },
              { value: 'compacted-earth', label: 'Earth' },
            ]} size="sm" />
          </Field>
        </FieldRow>
      </FieldGroup>

      <FieldGroup title="Fencing">
        <FieldRow cols={4}>
          <Field label="Perimeter" unit="m"><NumInput value={s.fencePerimeterM} onChange={u('fencePerimeterM')} step={50} /></Field>
          <Field label="Height" unit="m"><NumInput value={s.fenceHeightM} onChange={u('fenceHeightM')} step={0.1} /></Field>
          <Field label="Gauge">
            <Segmented value={s.fenceGauge} onChange={u('fenceGauge')} options={[
              { value: 'light', label: 'Light' }, { value: 'medium', label: 'Medium' }, { value: 'heavy', label: 'Heavy' },
            ]} size="sm" />
          </Field>
          <Field label="Type">
            <Segmented value={s.fenceType} onChange={u('fenceType')} options={[
              { value: 'mesh', label: 'Mesh' }, { value: 'palisade', label: 'Palisade' }, { value: 'rabbit-proof', label: 'Rabbit-proof' },
            ]} size="sm" />
          </Field>
        </FieldRow>
      </FieldGroup>

      <FieldGroup title="Security & monitoring">
        <FieldRow cols={3}>
          <Field label="CCTV towers"><NumInput value={s.cctvCount} onChange={u('cctvCount')} step={1} /></Field>
          <Field label="CCTV thermal"><NumInput value={s.cctvThermalCount} onChange={u('cctvThermalCount')} step={1} /></Field>
          <Field label="Motion sensors"><NumInput value={s.motionSensorsCount} onChange={u('motionSensorsCount')} step={1} /></Field>
          <Field label="Lighting">
            <Segmented value={s.lightingStrategy} onChange={u('lightingStrategy')} options={[
              { value: 'on-demand', label: 'On-demand' }, { value: 'always-on', label: 'Always' }, { value: 'dusk-to-dawn', label: 'Dusk-dawn' }, { value: 'none', label: 'None' },
            ]} size="sm" />
          </Field>
          <Field label="Lighting poles"><NumInput value={s.lightingPolesCount} onChange={u('lightingPolesCount')} step={1} /></Field>
        </FieldRow>
      </FieldGroup>

      <FieldGroup title="Buildings & trenching">
        <FieldRow cols={4}>
          <Field label="O&M building" unit="m²"><NumInput value={s.omBuildingAreaM2} onChange={u('omBuildingAreaM2')} step={10} /></Field>
          <Field label="Parking spaces"><NumInput value={s.parkingSpaces} onChange={u('parkingSpaces')} step={1} /></Field>
          <Field label="Spare-parts store" unit="m²"><NumInput value={s.sparePartsStoreAreaM2} onChange={u('sparePartsStoreAreaM2')} step={10} /></Field>
          <Field label="Cable trench depth" unit="cm"><NumInput value={s.cableTrenchDepthCm} onChange={u('cableTrenchDepthCm')} step={5} /></Field>
          <Field label="Cable trench width" unit="cm"><NumInput value={s.cableTrenchWidthCm} onChange={u('cableTrenchWidthCm')} step={5} /></Field>
        </FieldRow>
      </FieldGroup>
    </SectionBody>
  );
}
