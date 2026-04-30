import { Suspense, lazy } from 'react';
import { useProjectStore } from '@/store/projectStore';
import {
  Field,
  FieldGroup,
  FieldRow,
  NumInput,
  Select,
  SectionBody,
  TextInput,
  Segmented,
} from '../BuilderPrimitives';

const PolygonMap = lazy(() => import('../PolygonMap').then((m) => ({ default: m.PolygonMap })));

export function SiteSection() {
  const s = useProjectStore((s) => s.site);
  const update = useProjectStore((s) => s.update);
  const u = <K extends keyof typeof s>(k: K) => (v: (typeof s)[K]) => update('site', k, v);

  return (
    <SectionBody
      title="01 · Site"
      subtitle="Define the parcel · draw the polygon or enter area directly. Every downstream number depends on this."
    >
      <FieldGroup title="Project identity">
        <FieldRow cols={2}>
          <Field label="Project name">
            <TextInput value={s.projectName} onChange={u('projectName')} placeholder="Beravci Agrivoltaic Zone" />
          </Field>
          <Field label="Owner entity">
            <TextInput value={s.ownerEntity} onChange={u('ownerEntity')} placeholder="Paladina Investments" />
          </Field>
        </FieldRow>
      </FieldGroup>

      <FieldGroup title="Location · polygon">
        <div className="rounded-md border border-border bg-canvas/40 overflow-hidden">
          <Suspense
            fallback={
              <div className="flex h-[320px] items-center justify-center font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
                loading mapbox polygon tool…
              </div>
            }
          >
            <PolygonMap
              initialCoords={s.polygonCoords}
              initialCenter={[s.centroidLon, s.centroidLat]}
              onChange={({ coords, areaHa, centroid }) => {
                update('site', 'polygonCoords', coords);
                update('site', 'areaHa', Math.round(areaHa * 10) / 10);
                update('site', 'centroidLat', centroid[1]);
                update('site', 'centroidLon', centroid[0]);
              }}
            />
          </Suspense>
        </div>
        <FieldRow cols={4}>
          <Field label="Centroid lat" unit="°N">
            <NumInput value={s.centroidLat} onChange={u('centroidLat')} step={0.0001} />
          </Field>
          <Field label="Centroid lon" unit="°E">
            <NumInput value={s.centroidLon} onChange={u('centroidLon')} step={0.0001} />
          </Field>
          <Field label="Area" unit="ha" required>
            <NumInput value={s.areaHa} onChange={u('areaHa')} step={0.1} tone="pulse" />
          </Field>
          <Field label="Setback · boundary" unit="m">
            <NumInput value={s.setbacksBoundaryM} onChange={u('setbacksBoundaryM')} step={1} />
          </Field>
        </FieldRow>
      </FieldGroup>

      <FieldGroup title="Topography">
        <FieldRow cols={3}>
          <Field label="Elevation min" unit="m a.s.l."><NumInput value={s.elevationMinM} onChange={u('elevationMinM')} step={1} /></Field>
          <Field label="Elevation max" unit="m a.s.l."><NumInput value={s.elevationMaxM} onChange={u('elevationMaxM')} step={1} /></Field>
          <Field label="Mean slope" unit="%"><NumInput value={s.meanSlopePct} onChange={u('meanSlopePct')} step={0.1} /></Field>
          <Field label="Mean aspect" unit="° from N"><NumInput value={s.meanAspectDeg} onChange={u('meanAspectDeg')} step={1} hint="180° = due south · ideal for Northern hemisphere PV" /></Field>
        </FieldRow>
      </FieldGroup>

      <FieldGroup title="Soil & hydrology">
        <FieldRow cols={2}>
          <Field label="Soil WRB class">
            <Select
              value={s.soilWrbClass}
              onChange={u('soilWrbClass')}
              options={[
                { value: 'Eutric Cambisol', label: 'Eutric Cambisol' },
                { value: 'Fluvisol', label: 'Fluvisol' },
                { value: 'Luvisol', label: 'Luvisol' },
                { value: 'Gleysol', label: 'Gleysol' },
                { value: 'Stagnosol', label: 'Stagnosol' },
                { value: 'other', label: 'Other' },
              ]}
            />
          </Field>
          <Field label="Soil bearing" unit="kPa" hint="Below 100 kPa requires pile length increase"><NumInput value={s.soilBearingKpa} onChange={u('soilBearingKpa')} step={10} /></Field>
          <Field label="Drainage class">
            <Segmented
              value={s.drainageClass}
              onChange={u('drainageClass')}
              options={[
                { value: 'excessive', label: 'Excessive' },
                { value: 'well', label: 'Well' },
                { value: 'moderate', label: 'Moderate' },
                { value: 'imperfect', label: 'Imperfect' },
                { value: 'poor', label: 'Poor' },
              ]}
            />
          </Field>
          <Field label="Water table · avg" unit="m below surface"><NumInput value={s.waterTableAvgM} onChange={u('waterTableAvgM')} step={0.1} /></Field>
          <Field label="Q100 flood zone">
            <Segmented
              value={s.floodZone100yr}
              onChange={u('floodZone100yr')}
              options={[
                { value: 'clear', label: 'Clear' },
                { value: 'marginal', label: 'Marginal' },
                { value: 'inside', label: 'Inside' },
              ]}
            />
          </Field>
        </FieldRow>
      </FieldGroup>

      <FieldGroup title="Access & prior use">
        <FieldRow cols={2}>
          <Field label="Previous land use">
            <Segmented
              value={s.prevLandUse}
              onChange={u('prevLandUse')}
              options={[
                { value: 'arable', label: 'Arable' },
                { value: 'pasture', label: 'Pasture' },
                { value: 'fallow', label: 'Fallow' },
                { value: 'orchard', label: 'Orchard' },
                { value: 'industrial', label: 'Industrial' },
                { value: 'mixed', label: 'Mixed' },
              ]}
              size="sm"
            />
          </Field>
          <Field label="Access roads" unit="km"><NumInput value={s.accessRoadsKm} onChange={u('accessRoadsKm')} step={0.1} /></Field>
        </FieldRow>
      </FieldGroup>
    </SectionBody>
  );
}
