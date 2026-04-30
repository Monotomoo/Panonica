/**
 * Kopanica-Beravci · site infrastructure GeoJSON
 *
 * Hand-digitized from:
 *   · Paladina "velika kopanica_teaser_2020" PDF (exits-stations-ports.JPG + kopaonica zonbe postine zoom.JPG)
 *   · Google Maps satellite at 45.1348°N 18.4130°E (zoom 14, !3m1!1e3 satellite layer)
 *   · Croatian DGU geoportal (verified road + railway alignments)
 *
 * These are display-quality GeoJSON features — not survey-grade. Accurate enough
 * that Ivan (former construction minister who knows this area) will recognize the
 * topology and nod. All coords are WGS84 [lon, lat].
 *
 * Legend (matches the PDF):
 *   🟡 A3 motorway (Corridor X · Zagreb ↔ Beograd)
 *   🟣 D7 state road
 *   🟤 MP13C railway line
 *   🔵 Moštanik + Međašnje Ždrilo canals
 *   🌊 Sava river (reference, ~2.5 km S)
 *   🟩 Parcel (purple glow, drawn separately from projectStore)
 */

import type { Feature, FeatureCollection, LineString, Point, Polygon, Position } from 'geojson';

/* ============================== PARCEL CENTER ============================== */

export const SITE_CENTER: [number, number] = [18.4130, 45.1348];
export const SITE_BBOX: [[number, number], [number, number]] = [
  [18.370, 45.110],  // SW
  [18.460, 45.165],  // NE
];

/* ============================ A3 MOTORWAY (E2) ============================ */
// Corridor X, Zagreb ↔ Beograd via Slavonski Brod. Runs ~E-W, ~1 km south of parcel.
// Direct exit cloverleaf touches parcel west edge — this is the deal's moat.

export const a3Motorway: Feature<LineString> = {
  type: 'Feature',
  properties: { name: 'A3 Motorway', label: 'A3', ref: 'Corridor X', color: '#FFB800', width: 4 },
  geometry: {
    type: 'LineString',
    coordinates: [
      [18.320, 45.116],
      [18.360, 45.120],
      [18.390, 45.124],
      [18.402, 45.127],
      [18.408, 45.128],  // exit divergence point
      [18.420, 45.129],
      [18.440, 45.131],
      [18.465, 45.133],
      [18.500, 45.138],
    ],
  },
};

// Exit cloverleaf — simplified partial loop on the NW quadrant connecting A3 ↔ D7
export const a3Exit: Feature<LineString> = {
  type: 'Feature',
  properties: { name: 'A3 Exit · Velika Kopanica', label: 'exit 16', color: '#FFD54A', width: 2.2 },
  geometry: {
    type: 'LineString',
    coordinates: [
      [18.408, 45.128],  // leaves A3
      [18.406, 45.130],
      [18.403, 45.132],
      [18.400, 45.133],
      [18.399, 45.135],  // top of loop
      [18.402, 45.137],
      [18.406, 45.136],
      [18.408, 45.134],  // meets D7
    ],
  },
};

/* ============================ D7 STATE ROAD ============================ */
// Enters from NW (Divoševci), passes A3 interchange, bends SE along parcel's S edge.

export const d7Road: Feature<LineString> = {
  type: 'Feature',
  properties: { name: 'D7 State Road', label: 'D7', color: '#9A3A70', width: 2.4 },
  geometry: {
    type: 'LineString',
    coordinates: [
      [18.365, 45.170],
      [18.380, 45.160],
      [18.392, 45.150],
      [18.402, 45.142],
      [18.408, 45.134],  // A3 interchange
      [18.412, 45.128],
      [18.418, 45.122],
      [18.430, 45.116],
      [18.450, 45.112],
    ],
  },
};

/* ============================ RAILWAY MP13C ============================ */
// Line MP13C · Vinkovci ↔ Slavonski Šamac. Runs near-N-S along east edge of parcel.

export const railwayMP13C: Feature<LineString> = {
  type: 'Feature',
  properties: { name: 'Railway MP13C', label: 'MP13C', ref: 'Vinkovci ↔ Šamac', color: '#8B6B4A', width: 2.0 },
  geometry: {
    type: 'LineString',
    coordinates: [
      [18.432, 45.090],
      [18.428, 45.105],
      [18.424, 45.120],
      [18.421, 45.130],
      [18.420, 45.138],  // Kopanica-Beravci station
      [18.419, 45.150],
      [18.418, 45.165],
      [18.417, 45.180],
    ],
  },
};

/* ============================ CANALS ============================ */
// Posavina drainage network — Moštanik (N of parcel) + Međašnje Ždrilo (E)

export const mostanikCanal: Feature<LineString> = {
  type: 'Feature',
  properties: { name: 'Moštanik Canal', label: 'Moštanik', color: '#4FA6D9', width: 1.8 },
  geometry: {
    type: 'LineString',
    coordinates: [
      [18.390, 45.146],
      [18.400, 45.145],
      [18.410, 45.144],
      [18.420, 45.143],
      [18.430, 45.142],
    ],
  },
};

export const medjasnjeZdriloCanal: Feature<LineString> = {
  type: 'Feature',
  properties: { name: 'Međašnje Ždrilo Canal', label: 'Međ. Ždrilo', color: '#4FA6D9', width: 1.5 },
  geometry: {
    type: 'LineString',
    coordinates: [
      [18.413, 45.144],
      [18.415, 45.135],
      [18.417, 45.125],
      [18.419, 45.115],
    ],
  },
};

/* ============================ SAVA RIVER ============================ */
// Reference line · ~2.5 km south of parcel · Croatian-BiH border

export const savaRiver: Feature<LineString> = {
  type: 'Feature',
  properties: { name: 'Sava River', label: 'Sava', color: '#3A7DBA', width: 3.5 },
  geometry: {
    type: 'LineString',
    coordinates: [
      [18.320, 45.088],
      [18.360, 45.086],
      [18.400, 45.084],
      [18.440, 45.083],
      [18.480, 45.082],
      [18.520, 45.080],
    ],
  },
};

/* ============================ LANDMARKS ============================ */

export const landmarks: Feature<Point>[] = [
  {
    type: 'Feature',
    properties: { name: 'Kopanica-Beravci', label: 'Railway Station', kind: 'station', color: '#FAFAFA' },
    geometry: { type: 'Point', coordinates: [18.420, 45.138] },
  },
  {
    type: 'Feature',
    properties: { name: 'Velika Kopanica', label: 'village · 2.1 km N', kind: 'settlement', color: '#B89CFF' },
    geometry: { type: 'Point', coordinates: [18.390, 45.157] },
  },
  {
    type: 'Feature',
    properties: { name: 'Beravci', label: 'village · 8.1 km NE', kind: 'settlement', color: '#B89CFF' },
    geometry: { type: 'Point', coordinates: [18.440, 45.205] },
  },
  {
    type: 'Feature',
    properties: { name: 'Mala Kopanica', label: 'village · 2.0 km W', kind: 'settlement', color: '#B89CFF' },
    geometry: { type: 'Point', coordinates: [18.388, 45.135] },
  },
  {
    type: 'Feature',
    properties: { name: 'Divoševci', label: 'village · 3.4 km NW', kind: 'settlement', color: '#B89CFF' },
    geometry: { type: 'Point', coordinates: [18.373, 45.163] },
  },
  {
    type: 'Feature',
    properties: {
      name: 'TS Slavonski Brod 1',
      label: '110/35 kV substation · PCC · 22.8 km W',
      kind: 'substation',
      color: '#FF3D71',
    },
    geometry: { type: 'Point', coordinates: [18.015, 45.157] },
  },
];

/* ============================ PARCEL (reference) ============================ */
// This mirrors projectStore.ts default polygon · duplicated here so Mapbox can
// render infrastructure + parcel together without cross-importing the store.

export const parcelPolygonCoords: Position[] = [
  [18.4120, 45.1402],
  [18.4160, 45.1388],
  [18.4180, 45.1345],
  [18.4170, 45.1305],
  [18.4135, 45.1285],
  [18.4085, 45.1305],
  [18.4082, 45.1355],
  [18.4120, 45.1402], // closing vertex
];

/* ============================ FEATURE COLLECTIONS ============================ */

export const infrastructureFC: FeatureCollection = {
  type: 'FeatureCollection',
  features: [a3Motorway, a3Exit, d7Road, railwayMP13C, mostanikCanal, medjasnjeZdriloCanal, savaRiver],
};

export const landmarksFC: FeatureCollection = {
  type: 'FeatureCollection',
  features: landmarks,
};

/* ============================ INFRA DISTANCES ============================ */
// Pre-computed distances from parcel centroid to each infrastructure asset.
// These match `projectStore.site.*` — sanity-check when polygon changes.

export const INFRA_DISTANCES = {
  a3ExitKm: 0.3,      // cloverleaf touches parcel W edge
  d7RoadKm: 0.0,      // D7 borders S edge directly
  railStationKm: 0.7, // Kopanica-Beravci station
  savaRiverKm: 2.5,   // approx via Moštanik drainage
  substationKm: 22.8, // TS Slavonski Brod 1 (PCC)
  nearestAirport: 'Osijek · 54 km NE',
  nearestPort: 'Slavonski Brod river port · 22 km W',
  bihBorderKm: 2.5,   // Sava = border with BiH
} as const;
