/**
 * PolygonMap — Site Intelligence Map (builder section 01)
 *
 * The "insanely good" site map that Ivan sees first when he opens the Builder.
 *
 * Library:      Leaflet 1.9 (Mapbox GL v3 has a worker init issue in this build).
 * Tile source:  Google Maps satellite (mt0-3 CDN), universally reachable.
 * Overlays:     parcel · A3 / D7 / rail / canals / Sava · landmarks · sun path · measure
 * Tools:        draw parcel (click-to-add) · clear · measure (click ruler) · recenter
 * Intro:        cinematic flyTo Croatia → Slavonia → Kopanica-Beravci (3.5 s)
 * Fallback:     if Google tiles ever fail, static JPEG + SVG polygon keeps the demo alive
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import area from '@turf/area';
import centroid from '@turf/centroid';
import {
  Pencil,
  Ruler,
  RotateCcw,
  Target,
  Eye,
  EyeOff,
  Sun,
  Train,
  Navigation,
} from 'lucide-react';
import { cn } from '@paladian/ui';

import 'leaflet/dist/leaflet.css';

import {
  infrastructureFC,
  landmarksFC,
  INFRA_DISTANCES,
  SITE_CENTER,
} from '@/mock/siteGeo';

/* ============================== TYPES ================================= */

interface PolygonChange {
  coords: [number, number][];
  areaHa: number;
  centroid: [number, number];
  perimeterM: number;
}

interface Props {
  initialCoords: [number, number][] | null;
  initialCenter: [number, number];
  onChange: (change: PolygonChange) => void;
}

interface LayerFlags {
  infrastructure: boolean;
  landmarks: boolean;
  sunPath: boolean;
}

/* ============================== HELPERS =============================== */

function haversineMeters(a: [number, number], b: [number, number]): number {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[1] - a[1]);
  const dLon = toRad(b[0] - a[0]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[1])) * Math.cos(toRad(b[1])) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function perimeterMeters(coords: [number, number][]): number {
  let sum = 0;
  for (let i = 0; i < coords.length; i++) {
    sum += haversineMeters(coords[i], coords[(i + 1) % coords.length]);
  }
  return sum;
}

function computeStats(coords: [number, number][]): PolygonChange {
  const polygon = coordsToGeoJson(coords);
  const areaM2 = area(polygon);
  const c = centroid(polygon);
  const [lon, lat] = c.geometry.coordinates as [number, number];
  return {
    coords,
    areaHa: areaM2 / 10_000,
    centroid: [lon, lat],
    perimeterM: perimeterMeters(coords),
  };
}

function coordsToGeoJson(coords: [number, number][]): any {
  const ring = [...coords, coords[0]];
  return {
    type: 'Feature',
    properties: {},
    geometry: { type: 'Polygon', coordinates: [ring] },
  };
}

/** NOAA-simplified solar position for mid-latitudes. Returns degrees. */
function sunPosition(lat: number, date: Date): { azimuth: number; elevation: number } {
  const doy = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86_400_000,
  );
  const decl = 23.45 * Math.sin(((360 / 365) * (doy - 81) * Math.PI) / 180);
  const hour = date.getHours() + date.getMinutes() / 60;
  const hra = (hour - 12) * 15;
  const latR = (lat * Math.PI) / 180;
  const declR = (decl * Math.PI) / 180;
  const hraR = (hra * Math.PI) / 180;
  const elev = Math.asin(
    Math.sin(latR) * Math.sin(declR) + Math.cos(latR) * Math.cos(declR) * Math.cos(hraR),
  );
  const az = Math.atan2(
    -Math.sin(hraR),
    Math.cos(hraR) * Math.sin(latR) - Math.tan(declR) * Math.cos(latR),
  );
  return {
    azimuth: ((az * 180) / Math.PI + 360) % 360,
    elevation: (elev * 180) / Math.PI,
  };
}

/** Project an offset from a center point given azimuth + distance. */
function projectOffset(
  center: [number, number],
  azimuthDeg: number,
  distanceM: number,
): [number, number] {
  const R = 6_371_000;
  const bearing = (azimuthDeg * Math.PI) / 180;
  const [lon0, lat0] = center;
  const lat0R = (lat0 * Math.PI) / 180;
  const lon0R = (lon0 * Math.PI) / 180;
  const angDist = distanceM / R;
  const lat1R = Math.asin(
    Math.sin(lat0R) * Math.cos(angDist) +
      Math.cos(lat0R) * Math.sin(angDist) * Math.cos(bearing),
  );
  const lon1R =
    lon0R +
    Math.atan2(
      Math.sin(bearing) * Math.sin(angDist) * Math.cos(lat0R),
      Math.cos(angDist) - Math.sin(lat0R) * Math.sin(lat1R),
    );
  return [(lon1R * 180) / Math.PI, (lat1R * 180) / Math.PI];
}

/** Build the sun path as a polyline (sunrise → sunset) for a given date. */
function buildSunPath(
  center: [number, number],
  date: Date,
  radiusM: number = 900,
): { coords: [number, number][]; current: [number, number] | null } {
  const coords: [number, number][] = [];
  const lat = center[1];
  let current: [number, number] | null = null;
  for (let hour = 4; hour <= 21; hour += 0.5) {
    const d = new Date(date);
    d.setHours(Math.floor(hour), (hour % 1) * 60, 0, 0);
    const { azimuth, elevation } = sunPosition(lat, d);
    if (elevation <= 0) continue;
    const dist = radiusM * (0.35 + 0.65 * Math.sin((elevation * Math.PI) / 180));
    const p = projectOffset(center, azimuth, dist);
    coords.push(p);
    if (Math.abs(hour - (date.getHours() + date.getMinutes() / 60)) < 0.26) {
      current = p;
    }
  }
  return { coords, current };
}

/** Convert [lon, lat] GeoJSON coords to Leaflet [lat, lon] */
const toLL = (c: [number, number]): [number, number] => [c[1], c[0]];

/* ============================== COMPONENT ============================ */

export function PolygonMap({ initialCoords, initialCenter, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const parcelLayerRef = useRef<L.Polygon | null>(null);
  const infraLayerRef = useRef<L.GeoJSON | null>(null);
  const landmarksLayerRef = useRef<L.GeoJSON | null>(null);
  const sunLayersRef = useRef<L.LayerGroup | null>(null);
  const [sunReadout, setSunReadout] = useState<{ elevation: number; azimuth: number; ghi: number } | null>(null);
  const measureGroupRef = useRef<L.LayerGroup | null>(null);
  const drawVerticesRef = useRef<[number, number][]>([]);
  const drawPreviewRef = useRef<L.Polygon | null>(null);

  const [stats, setStats] = useState<PolygonChange | null>(
    initialCoords ? computeStats(initialCoords) : null,
  );
  const [drawMode, setDrawMode] = useState<'idle' | 'drawing' | 'measuring'>('idle');
  const drawModeRef = useRef<'idle' | 'drawing' | 'measuring'>('idle');
  drawModeRef.current = drawMode;

  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [layers, setLayers] = useState<LayerFlags>({
    infrastructure: true,
    landmarks: true,
    sunPath: false,
  });
  const [sunHour, setSunHour] = useState<number>(
    new Date().getHours() + new Date().getMinutes() / 60,
  );
  const [measurePts, setMeasurePts] = useState<[number, number][]>([]);

  /* ============================ INIT MAP =========================== */

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let map: L.Map;
    try {
      map = L.map(containerRef.current, {
        zoomControl: true,
        attributionControl: false,
        doubleClickZoom: false, // reserve for measure/draw finish
      }).setView([45.8, 16.5], 6); // Croatia-wide for cinematic intro
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[PolygonMap] Leaflet init failed:', err);
      setMapError('Map init failed · using static fallback');
      return;
    }

    // Google Maps satellite tiles
    const tiles = L.tileLayer('https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
      subdomains: '0123',
      maxZoom: 20,
      attribution: '© Google',
    });
    let failedTiles = 0;
    tiles.on('tileerror', () => {
      failedTiles += 1;
      if (failedTiles > 6) {
        setMapError('Satellite tiles unreachable · using static fallback');
      }
    });
    tiles.addTo(map);

    // Debug handle
    (window as any).__panonicaMap = map;

    // ════════════════════════════════════════════════════════════════════
    // CINEMATIC INTRO · hide all overlays in a pane with opacity 0 so we
    // don't see screen-space dots (landmarks, tiny parcel polygon) during
    // the Croatia→Kopanica-Beravci flight. Fade in 300 ms AFTER landing.
    // ════════════════════════════════════════════════════════════════════
    map.createPane('intro-parcel');
    map.createPane('intro-infra');
    map.createPane('intro-landmarks');
    map.createPane('intro-sun');
    map.createPane('intro-measure');
    const panes = ['intro-parcel', 'intro-infra', 'intro-landmarks', 'intro-sun', 'intro-measure'] as const;
    panes.forEach((p, i) => {
      const el = map.getPane(p)!;
      el.style.opacity = '0';
      el.style.transition = `opacity 700ms cubic-bezier(0.16, 1, 0.3, 1) ${80 * i}ms`;
      // Stack order: infra beneath landmarks beneath parcel beneath sun beneath measure
      el.style.zIndex = String(410 + i);
    });

    // Parcel (in its pane)
    if (initialCoords && initialCoords.length >= 3) {
      const poly = L.polygon(initialCoords.map(toLL), {
        color: '#7C5CFF',
        weight: 2.4,
        fillColor: '#7C5CFF',
        fillOpacity: 0.22,
        pane: 'intro-parcel',
      }).addTo(map);
      parcelLayerRef.current = poly;
    }

    // Infrastructure lines (in its pane)
    const infraLayer = L.geoJSON(infrastructureFC as any, {
      style: (f: any) => ({
        color: f?.properties?.color ?? '#FAFAFA',
        weight: f?.properties?.width ?? 2,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
      }),
      pane: 'intro-infra',
    }).addTo(map);
    infraLayerRef.current = infraLayer;

    // Landmarks (in its pane)
    const landmarkLayer = L.geoJSON(landmarksFC as any, {
      pointToLayer: (f: any, latlng) => {
        const kind = f?.properties?.kind ?? 'settlement';
        const radius = kind === 'substation' ? 7 : kind === 'station' ? 6 : 4;
        return L.circleMarker(latlng, {
          radius,
          color: '#0A0A0B',
          fillColor: f?.properties?.color ?? '#FAFAFA',
          fillOpacity: 0.9,
          weight: 2,
          pane: 'intro-landmarks',
        }).bindTooltip(
          `<b>${f?.properties?.name ?? ''}</b><br/><span style="opacity:0.7">${f?.properties?.label ?? ''}</span>`,
          { direction: 'top', offset: [0, -6], className: 'panonica-tooltip' },
        );
      },
    }).addTo(map);
    landmarksLayerRef.current = landmarkLayer;

    // Measure group (empty, in its pane)
    measureGroupRef.current = L.layerGroup().addTo(map);

    mapRef.current = map;
    setMapReady(true);

    // Observe container resize · Leaflet doesn't auto-invalidate when its parent
    // changes size (flex/grid reflow, collapsing left-nav, window resize).
    // Without this, tiles stay at the initial measurement and the map looks cut off.
    const ro = new ResizeObserver(() => {
      if (mapRef.current) mapRef.current.invalidateSize({ animate: false });
    });
    ro.observe(containerRef.current);
    (map as any).__resizeObserver = ro;

    // Global click for measure / draw modes
    const onMapClick = (e: L.LeafletMouseEvent) => {
      const p: [number, number] = [e.latlng.lng, e.latlng.lat];
      const mode = drawModeRef.current;
      if (mode === 'measuring') {
        setMeasurePts((prev) => [...prev, p]);
      } else if (mode === 'drawing') {
        drawVerticesRef.current.push(p);
        updateDrawPreview();
      }
    };
    map.on('click', onMapClick);

    // Double-click finishes draw/measure
    const onDblClick = () => {
      const mode = drawModeRef.current;
      if (mode === 'drawing') {
        finishDraw();
      } else if (mode === 'measuring') {
        setDrawMode('idle');
      }
    };
    map.on('dblclick', onDblClick);

    // Cinematic intro — Leaflet's flyTo silently bails in this env; setView
    // with {animate:true,duration} is equivalent for our continental→site flight.
    // Fade-in is triggered off `moveend` instead of a fixed timeout so it always
    // lands correctly even if animation speed varies.
    const fadeInOverlays = () => {
      const m = mapRef.current;
      if (!m) return;
      ['intro-parcel', 'intro-infra', 'intro-landmarks', 'intro-sun', 'intro-measure'].forEach((p) => {
        const el = m.getPane(p);
        if (el) el.style.opacity = '1';
      });
    };

    const introTimerId = window.setTimeout(() => {
      const m = mapRef.current;
      if (!m) return;
      m.setView(toLL(initialCenter ?? SITE_CENTER), 14, {
        animate: true,
        duration: 3.2,
        easeLinearity: 0.18,
      });
      // moveend fires when the animation lands
      m.once('moveend', fadeInOverlays);
      // Safety net: fade in by 5 s even if moveend never fires
      window.setTimeout(fadeInOverlays, 5000);
    }, 500);
    (map as any).__introTimerId = introTimerId;

    return () => {
      const ro = (map as any).__resizeObserver as ResizeObserver | undefined;
      if (ro) ro.disconnect();
      const tid = (map as any).__introTimerId;
      if (tid) window.clearTimeout(tid);
      map.remove();
      mapRef.current = null;
    };

    // Internal helpers (closures over map)
    function updateDrawPreview() {
      if (!mapRef.current) return;
      if (drawPreviewRef.current) {
        mapRef.current.removeLayer(drawPreviewRef.current);
        drawPreviewRef.current = null;
      }
      if (drawVerticesRef.current.length >= 2) {
        drawPreviewRef.current = L.polygon(
          drawVerticesRef.current.map(toLL),
          { color: '#7C5CFF', weight: 2.4, fillOpacity: 0.18, dashArray: '6 4' },
        ).addTo(mapRef.current);
      }
    }

    function finishDraw() {
      if (drawVerticesRef.current.length < 3) {
        setDrawMode('idle');
        return;
      }
      const coords = drawVerticesRef.current.slice();
      drawVerticesRef.current = [];
      // Remove preview
      if (drawPreviewRef.current && mapRef.current) {
        mapRef.current.removeLayer(drawPreviewRef.current);
        drawPreviewRef.current = null;
      }
      // Remove old parcel
      if (parcelLayerRef.current && mapRef.current) {
        mapRef.current.removeLayer(parcelLayerRef.current);
      }
      // Add new parcel
      if (mapRef.current) {
        parcelLayerRef.current = L.polygon(coords.map(toLL), {
          color: '#7C5CFF',
          weight: 2.4,
          fillColor: '#7C5CFF',
          fillOpacity: 0.22,
        }).addTo(mapRef.current);
      }
      const next = computeStats(coords);
      setStats(next);
      onChange(next);
      setDrawMode('idle');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ============================ LAYER TOGGLES =========================== */

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    const toggleLayer = (
      ref: React.MutableRefObject<L.GeoJSON | L.Polyline | L.CircleMarker | null>,
      on: boolean,
    ) => {
      const layer = ref.current;
      if (!layer) return;
      if (on && !map.hasLayer(layer)) map.addLayer(layer);
      if (!on && map.hasLayer(layer)) map.removeLayer(layer);
    };

    toggleLayer(infraLayerRef as any, layers.infrastructure);
    toggleLayer(landmarksLayerRef as any, layers.landmarks);
    toggleLayer(sunLayersRef as any, layers.sunPath);
  }, [layers, mapReady]);

  /* ============================ SUN PATH UPDATE ========================== */

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    // Tear down previous sun overlays
    if (sunLayersRef.current) {
      map.removeLayer(sunLayersRef.current);
      sunLayersRef.current = null;
    }

    if (!layers.sunPath) {
      setSunReadout(null);
      return;
    }

    const date = new Date();
    date.setHours(Math.floor(sunHour), Math.round((sunHour % 1) * 60), 0, 0);
    const center = initialCenter ?? SITE_CENTER;
    const parcelCenter = (stats?.centroid ?? center) as [number, number];

    // ── Solar state
    const sun = sunPosition(center[1], date);
    const elevRad = (Math.max(sun.elevation, 0) * Math.PI) / 180;
    // GHI ≈ 1361 W/m² × sin(elevation) × clear-sky factor 0.72 (Posavina annual avg)
    const ghi = Math.max(0, 1361 * Math.sin(elevRad) * 0.72);
    setSunReadout({ elevation: sun.elevation, azimuth: sun.azimuth, ghi });

    // ── Arc geometry
    const { coords, current } = buildSunPath(center, date, 900);
    const sunrise = coords[0];
    const sunset = coords[coords.length - 1];

    // ── Shadow cone (from parcel centroid · opposite azimuth · length scales 1/tan)
    const shadowAz = (sun.azimuth + 180) % 360;
    const shadowLengthM = sun.elevation > 1
      ? Math.min(700, Math.max(30, 180 / Math.max(Math.tan(elevRad), 0.03)))
      : 0;
    const coneWidthStart = 60;  // 60 m at parcel edge
    const coneWidthEnd = 140;   // widens to 140 m at tip
    const coneStart1 = projectOffset(parcelCenter, shadowAz - 90, coneWidthStart);
    const coneStart2 = projectOffset(parcelCenter, shadowAz + 90, coneWidthStart);
    const tipPoint = projectOffset(parcelCenter, shadowAz, shadowLengthM);
    const coneTip1 = projectOffset(tipPoint, shadowAz - 90, coneWidthEnd);
    const coneTip2 = projectOffset(tipPoint, shadowAz + 90, coneWidthEnd);

    // ── GHI heat ring (pulse expands with elevation · brightens at noon)
    const heatRadiusM = 200 + (Math.max(sun.elevation, 0) / 90) * 300;

    const group = L.layerGroup();

    // Heat ring glow around parcel (fades at dawn/dusk)
    if (sun.elevation > 0) {
      const heatOpacity = Math.min(0.18, (sun.elevation / 90) * 0.22);
      L.circle(toLL(parcelCenter), {
        radius: heatRadiusM,
        color: '#FFB800',
        fillColor: '#FFD54A',
        fillOpacity: heatOpacity,
        weight: 0,
        pane: 'intro-sun',
      }).addTo(group);
    }

    // Shadow cone
    if (shadowLengthM > 0) {
      L.polygon(
        [toLL(coneStart1), toLL(coneTip1), toLL(coneTip2), toLL(coneStart2)],
        {
          color: '#0A0A0B',
          weight: 0,
          fillColor: '#0A0A0B',
          fillOpacity: 0.35,
          pane: 'intro-sun',
        },
      ).addTo(group);
    }

    // Arc polyline — dimmer at horizon, brighter at noon
    if (coords.length >= 2) {
      L.polyline(coords.map(toLL), {
        color: '#FFB800',
        weight: 2,
        dashArray: '4 4',
        opacity: 0.55,
        pane: 'intro-sun',
      }).addTo(group);
    }

    // Sunrise / sunset horizon markers
    if (sunrise) {
      L.circleMarker(toLL(sunrise), {
        radius: 4,
        color: '#FFB800',
        fillColor: '#FFB800',
        fillOpacity: 0.5,
        weight: 1,
        pane: 'intro-sun',
      })
        .bindTooltip('sunrise', {
          permanent: true,
          direction: 'right',
          offset: [4, 0],
          className: 'panonica-tooltip',
        })
        .addTo(group);
    }
    if (sunset) {
      L.circleMarker(toLL(sunset), {
        radius: 4,
        color: '#FFB800',
        fillColor: '#FFB800',
        fillOpacity: 0.5,
        weight: 1,
        pane: 'intro-sun',
      })
        .bindTooltip('sunset', {
          permanent: true,
          direction: 'left',
          offset: [-4, 0],
          className: 'panonica-tooltip',
        })
        .addTo(group);
    }

    // Sun disk (layered glow: outer halo → inner halo → solid disk)
    if (current && sun.elevation > 0) {
      const diskR = 5 + (sun.elevation / 90) * 6;         // 5–11 px
      const innerHaloR = diskR * 1.8;
      const outerHaloR = diskR * 3.2;

      L.circleMarker(toLL(current), {
        radius: outerHaloR,
        color: '#FFB800',
        fillColor: '#FFB800',
        fillOpacity: 0.14,
        weight: 0,
        pane: 'intro-sun',
      }).addTo(group);
      L.circleMarker(toLL(current), {
        radius: innerHaloR,
        color: '#FFD54A',
        fillColor: '#FFD54A',
        fillOpacity: 0.32,
        weight: 0,
        pane: 'intro-sun',
      }).addTo(group);
      L.circleMarker(toLL(current), {
        radius: diskR,
        color: '#FFFFFF',
        fillColor: '#FFD54A',
        fillOpacity: 0.98,
        weight: 1.2,
        pane: 'intro-sun',
      })
        .bindTooltip(
          `☀ ${Math.floor(sunHour).toString().padStart(2, '0')}:${Math.round((sunHour % 1) * 60).toString().padStart(2, '0')} · elev ${sun.elevation.toFixed(0)}°`,
          {
            permanent: true,
            direction: 'top',
            offset: [0, -8],
            className: 'panonica-tooltip',
          },
        )
        .addTo(group);
    }

    group.addTo(map);
    sunLayersRef.current = group;
  }, [sunHour, layers.sunPath, mapReady, initialCenter, stats]);

  /* ============================ MEASURE OVERLAY ============================ */

  useEffect(() => {
    const map = mapRef.current;
    const group = measureGroupRef.current;
    if (!map || !mapReady || !group) return;
    group.clearLayers();

    if (measurePts.length >= 1) {
      measurePts.forEach((pt, i) => {
        L.circleMarker(toLL(pt), {
          radius: 5,
          color: '#0A0A0B',
          fillColor: '#5BD9A1',
          fillOpacity: 0.95,
          weight: 2,
        })
          .bindTooltip(`P${i + 1}`, {
            permanent: true,
            direction: 'top',
            offset: [0, -6],
            className: 'panonica-tooltip',
          })
          .addTo(group);
      });
    }
    if (measurePts.length >= 2) {
      L.polyline(measurePts.map(toLL), {
        color: '#5BD9A1',
        weight: 2.4,
        dashArray: '1 2',
        opacity: 0.95,
      }).addTo(group);
    }
  }, [measurePts, mapReady]);

  const measureTotalM = useMemo(() => {
    if (measurePts.length < 2) return 0;
    let sum = 0;
    for (let i = 1; i < measurePts.length; i++) {
      sum += haversineMeters(measurePts[i - 1], measurePts[i]);
    }
    return sum;
  }, [measurePts]);

  /* ============================ CONTROLS =============================== */

  const startDrawing = () => {
    drawVerticesRef.current = [];
    if (drawPreviewRef.current && mapRef.current) {
      mapRef.current.removeLayer(drawPreviewRef.current);
      drawPreviewRef.current = null;
    }
    if (parcelLayerRef.current && mapRef.current) {
      mapRef.current.removeLayer(parcelLayerRef.current);
      parcelLayerRef.current = null;
    }
    setStats(null);
    setDrawMode('drawing');
  };

  const clearPolygon = () => {
    if (parcelLayerRef.current && mapRef.current) {
      mapRef.current.removeLayer(parcelLayerRef.current);
      parcelLayerRef.current = null;
    }
    if (drawPreviewRef.current && mapRef.current) {
      mapRef.current.removeLayer(drawPreviewRef.current);
      drawPreviewRef.current = null;
    }
    drawVerticesRef.current = [];
    setStats(null);
    setMeasurePts([]);
    setDrawMode('idle');
  };

  const recenter = () => {
    if (!mapRef.current) return;
    mapRef.current.flyTo(toLL(initialCenter ?? SITE_CENTER), 14.4, { duration: 1.4 });
  };

  const startMeasuring = () => {
    setDrawMode('measuring');
    setMeasurePts([]);
  };

  const toggle = useCallback(
    (k: keyof LayerFlags) => setLayers((s) => ({ ...s, [k]: !s[k] })),
    [],
  );

  /* ============================ FALLBACK ============================ */

  if (mapError) {
    return (
      <div className="relative overflow-hidden rounded-md">
        <img
          src="/imagery/kopanica-close.jpg"
          alt="Kopanica-Beravci satellite"
          className="h-[440px] w-full object-cover"
        />
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full pointer-events-none">
          <polygon
            points={(initialCoords ?? []).map(([lon, lat]) => {
              const cx = initialCenter[0];
              const cy = initialCenter[1];
              const dx = (lon - cx) * 3000;
              const dy = -(lat - cy) * 3000;
              return `${50 + dx},${50 + dy}`;
            }).join(' ')}
            fill="rgb(124 92 255 / 0.25)"
            stroke="rgb(124 92 255)"
            strokeWidth={0.4}
          />
        </svg>
        <div className="absolute left-3 bottom-3 max-w-[360px] rounded-md border border-sun/40 bg-canvas/90 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-sun backdrop-blur">
          <Ruler className="mr-1.5 inline h-3 w-3" strokeWidth={1.8} />
          {mapError}
        </div>
        {stats && <StatsCard stats={stats} mode="static" />}
      </div>
    );
  }

  /* ============================ RENDER ============================ */

  return (
    <div className="relative">
      <div ref={containerRef} className="h-[440px] w-full rounded-sm bg-canvas" />

      {/* LEFT · draw + measure controls */}
      <div className="absolute left-3 bottom-3 z-[400] flex flex-wrap gap-1.5 rounded-md border border-border-bright bg-canvas/85 p-1 backdrop-blur">
        <ToolButton
          active={drawMode === 'drawing'}
          onClick={startDrawing}
          icon={Pencil}
          label="draw parcel"
          tone="pulse"
        />
        <ToolButton
          active={drawMode === 'measuring'}
          onClick={startMeasuring}
          icon={Ruler}
          label={
            drawMode === 'measuring'
              ? `measuring · ${(measureTotalM / 1000).toFixed(2)} km`
              : 'measure'
          }
          tone="agri"
        />
        <ToolButton onClick={clearPolygon} icon={RotateCcw} label="clear" tone="spark" />
        <ToolButton onClick={recenter} icon={Target} label="recenter" tone="signal" />
      </div>

      {/* RIGHT · layer toggle panel */}
      <div className="absolute right-3 bottom-3 z-[400] flex flex-col gap-1.5 rounded-md border border-border-bright bg-canvas/85 p-1 backdrop-blur">
        <LayerToggle
          on={layers.infrastructure}
          onClick={() => toggle('infrastructure')}
          icon={Navigation}
          label="roads + rail"
          hint="A3 · D7 · MP13C · canals"
        />
        <LayerToggle
          on={layers.landmarks}
          onClick={() => toggle('landmarks')}
          icon={Train}
          label="landmarks"
          hint="village · station · PCC"
        />
        <LayerToggle
          on={layers.sunPath}
          onClick={() => toggle('sunPath')}
          icon={Sun}
          label="sun path"
          hint="solar azimuth arc"
        />
      </div>

      {/* Sun hour panel — slider + solar readout (elevation · azimuth · GHI) */}
      {layers.sunPath && (
        <div className="absolute bottom-20 right-3 z-[400] flex min-w-[260px] flex-col gap-2 rounded-md border border-sun/40 bg-canvas/92 p-3 backdrop-blur">
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-sun">
            <span>sun hour</span>
            <span className="tabular-nums">
              {Math.floor(sunHour).toString().padStart(2, '0')}:
              {Math.round((sunHour % 1) * 60).toString().padStart(2, '0')}
            </span>
          </div>
          <input
            type="range"
            min={4}
            max={21}
            step={0.25}
            value={sunHour}
            onChange={(e) => setSunHour(parseFloat(e.target.value))}
            className="accent-sun"
          />
          {sunReadout && (
            <div className="mt-1 grid grid-cols-3 gap-2 border-t border-sun/20 pt-2 font-mono text-[9px] uppercase tracking-[0.2em]">
              <SunMicro
                label="elev"
                value={`${Math.max(0, sunReadout.elevation).toFixed(0)}°`}
                tone={sunReadout.elevation > 0 ? 'text-sun' : 'text-text-muted'}
              />
              <SunMicro
                label="azim"
                value={`${sunReadout.azimuth.toFixed(0)}° ${compassDirection(sunReadout.azimuth)}`}
                tone="text-sun"
              />
              <SunMicro
                label="ghi"
                value={`${sunReadout.ghi.toFixed(0)} W/m²`}
                tone={sunReadout.ghi > 100 ? 'text-sun' : 'text-text-muted'}
              />
            </div>
          )}
          <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted">
            <span>shadow cone</span>
            <span className={sunReadout && sunReadout.elevation > 2 ? 'text-sun' : 'text-text-muted'}>
              {sunReadout && sunReadout.elevation > 2
                ? `${(180 / Math.max(Math.tan((Math.max(sunReadout.elevation, 0) * Math.PI) / 180), 0.03)).toFixed(0)} m`
                : 'sun below horizon'}
            </span>
          </div>
        </div>
      )}

      {/* TOP LEFT · status chips */}
      <div className="pointer-events-none absolute left-3 top-3 z-[400] flex flex-col gap-1.5">
        <div className="rounded-md border border-pulse/40 bg-canvas/85 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.22em] text-pulse backdrop-blur">
          <span className="mr-2 text-text-muted">site</span>
          kopanica-beravci
          <span className="mx-2 text-text-muted">·</span>
          45.1348°N · 18.4130°E
        </div>
        <div className="rounded-md border border-agri/40 bg-canvas/85 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.22em] text-agri backdrop-blur">
          tiles · google satellite · leaflet
        </div>
      </div>

      {/* MODE BANNER */}
      {drawMode === 'drawing' && (
        <div className="absolute left-1/2 top-3 z-[400] -translate-x-1/2 rounded-md border border-pulse/40 bg-canvas/90 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-pulse backdrop-blur">
          {drawVerticesRef.current.length === 0
            ? 'click to place first vertex'
            : `${drawVerticesRef.current.length} pts · double-click to close polygon`}
        </div>
      )}
      {drawMode === 'measuring' && (
        <div className="absolute left-1/2 top-3 z-[400] -translate-x-1/2 rounded-md border border-agri/40 bg-canvas/90 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-agri backdrop-blur">
          {measurePts.length === 0
            ? 'click to place first point'
            : `${measurePts.length} pts · ${(measureTotalM / 1000).toFixed(2)} km · double-click to finish`}
        </div>
      )}

      {/* STATS CARD */}
      {stats && <StatsCard stats={stats} mode="live" />}

      {/* INFRASTRUCTURE DISTANCES */}
      {stats && (
        <div className="absolute left-3 top-[5.2rem] z-[400] flex flex-col gap-0.5 rounded-md border border-signal/40 bg-canvas/85 px-3 py-2 font-mono text-[10px] backdrop-blur">
          <div className="mb-1 uppercase tracking-[0.22em] text-signal">
            <Navigation className="mr-1.5 inline h-3 w-3" strokeWidth={1.8} />
            infrastructure · pdf-verified
          </div>
          <DistRow label="A3 exit" value={`${INFRA_DISTANCES.a3ExitKm.toFixed(1)} km`} tone="sun" />
          <DistRow label="D7 road" value="0.0 km · border" tone="spark" />
          <DistRow label="rail station" value={`${INFRA_DISTANCES.railStationKm.toFixed(1)} km`} tone="signal" />
          <DistRow label="TS Slav. Brod 1" value={`${INFRA_DISTANCES.substationKm.toFixed(1)} km`} tone="agri" />
          <DistRow label="Sava / BiH" value={`${INFRA_DISTANCES.savaRiverKm.toFixed(1)} km`} tone="text-muted" />
        </div>
      )}
    </div>
  );
}

/* ============================ SUB-COMPONENTS ============================ */

function StatsCard({
  stats,
  mode,
}: {
  stats: PolygonChange;
  mode: 'live' | 'static';
}) {
  return (
    <div className="absolute right-3 top-3 z-[400] flex flex-col gap-0.5 rounded-md border border-pulse/40 bg-canvas/85 px-3 py-2 font-mono text-[10px] backdrop-blur">
      <div className="flex items-center gap-1.5 uppercase tracking-[0.22em] text-pulse">
        <Ruler className="h-3 w-3" strokeWidth={1.8} />
        parcel · {mode === 'static' ? 'static' : 'turf.js'}
      </div>
      <div className="flex items-baseline gap-2 text-text-primary">
        <span className="font-display text-xl tabular-nums text-pulse">{stats.areaHa.toFixed(1)}</span>
        <span className="uppercase tracking-[0.22em] text-text-muted">ha</span>
        <span className="ml-2 font-display text-base tabular-nums text-text-secondary">
          {(stats.perimeterM / 1000).toFixed(2)}
        </span>
        <span className="uppercase tracking-[0.22em] text-text-muted">km perim</span>
      </div>
      <div className="text-text-muted tabular-nums">{stats.coords.length} vertices</div>
      <div className="text-text-muted tabular-nums">
        {stats.centroid[1].toFixed(4)}°N {stats.centroid[0].toFixed(4)}°E
      </div>
    </div>
  );
}

function ToolButton({
  active,
  onClick,
  icon: Icon,
  label,
  tone,
}: {
  active?: boolean;
  onClick: () => void;
  icon: any;
  label: string;
  tone: 'pulse' | 'agri' | 'sun' | 'signal' | 'spark';
}) {
  const activeCls: Record<typeof tone, string> = {
    pulse: 'bg-pulse/20 text-pulse border-pulse/40',
    agri: 'bg-agri/20 text-agri border-agri/40',
    sun: 'bg-sun/20 text-sun border-sun/40',
    signal: 'bg-signal/20 text-signal border-signal/40',
    spark: 'bg-spark/20 text-spark border-spark/40',
  };
  const hoverCls: Record<typeof tone, string> = {
    pulse: 'text-text-secondary hover:bg-surface hover:text-pulse',
    agri: 'text-text-secondary hover:bg-surface hover:text-agri',
    sun: 'text-text-secondary hover:bg-surface hover:text-sun',
    signal: 'text-text-secondary hover:bg-surface hover:text-signal',
    spark: 'text-text-secondary hover:bg-surface hover:text-spark',
  };
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] transition-colors',
        active ? activeCls[tone] : hoverCls[tone],
      )}
    >
      <Icon className="h-3 w-3" strokeWidth={1.8} />
      {label}
    </button>
  );
}

function LayerToggle({
  on,
  onClick,
  icon: Icon,
  label,
  hint,
}: {
  on: boolean;
  onClick: () => void;
  icon: any;
  label: string;
  hint: string;
}) {
  return (
    <button
      onClick={onClick}
      title={hint}
      className={cn(
        'flex items-center justify-between gap-3 rounded-sm px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] transition-colors',
        on
          ? 'bg-pulse/10 text-pulse'
          : 'text-text-muted hover:bg-surface hover:text-text-primary',
      )}
    >
      <span className="flex items-center gap-1.5">
        <Icon className="h-3 w-3" strokeWidth={1.8} />
        {label}
      </span>
      {on ? (
        <Eye className="h-3 w-3 opacity-70" strokeWidth={1.8} />
      ) : (
        <EyeOff className="h-3 w-3 opacity-50" strokeWidth={1.8} />
      )}
    </button>
  );
}

function DistRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 tabular-nums">
      <span className="uppercase tracking-[0.2em] text-text-muted">{label}</span>
      <span className={`text-${tone}`}>{value}</span>
    </div>
  );
}

function SunMicro({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-text-muted">{label}</span>
      <span className={cn('tabular-nums', tone)}>{value}</span>
    </div>
  );
}

function compassDirection(azimuth: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(((azimuth % 360) + 360) % 360 / 45) % 8];
}
