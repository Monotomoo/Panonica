import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CircleDot,
  Clock,
  Compass,
  Droplets,
  Fence,
  Layers,
  Map as MapIcon,
  MapPin,
  Mountain,
  Navigation,
  Scale,
  ShieldCheck,
  Sprout,
  Truck,
  X,
} from 'lucide-react';
import { NumberTicker, DataPanel, cn } from '@paladian/ui';
import { ParcelMap } from '@/components/ParcelMap';
import { beravciParcel } from '@/mock/parcel';
import {
  accessRoutes,
  aspectRose,
  environmentalConstraints,
  hydrology,
  regulatoryChecklist,
  slopeHistogram,
  soilProfile,
  soilSummary,
  topographySummary,
  viabilityScore,
} from '@/mock/landDeep';

type LayerKey = 'satellite' | 'cadastral' | 'soil' | 'slope' | 'constraints';

const LAYERS: { key: LayerKey; label: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }> }[] = [
  { key: 'satellite', label: 'Satellite', icon: MapIcon },
  { key: 'cadastral', label: 'Cadastral', icon: Layers },
  { key: 'soil', label: 'Soil', icon: Sprout },
  { key: 'slope', label: 'Slope', icon: Mountain },
  { key: 'constraints', label: 'Constraints', icon: ShieldCheck },
];

export function LandRoute() {
  const [layer, setLayer] = useState<LayerKey>('satellite');
  const [hoverCadastral, setHoverCadastral] = useState<string | null>(null);

  return (
    <section className="flex min-h-full flex-col">
      <div className="grid h-[calc(100vh-2.75rem)] grid-cols-[1.4fr_1fr] gap-0">
        {/* LEFT — map with layer selector */}
        <div className="relative min-h-full">
          <MapLayers layer={layer} onHoverCadastral={setHoverCadastral} />

          {/* Layer chips */}
          <div className="absolute left-4 top-4 flex flex-col gap-2 pr-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
              map layer
            </span>
            <div className="flex flex-wrap gap-1 rounded-md border border-border/60 bg-canvas/80 p-1 backdrop-blur">
              {LAYERS.map((l) => {
                const Icon = l.icon;
                const active = layer === l.key;
                return (
                  <button
                    key={l.key}
                    onClick={() => setLayer(l.key)}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors',
                      active
                        ? 'bg-pulse/15 text-pulse ring-1 ring-pulse/40'
                        : 'text-text-muted hover:bg-surface hover:text-text-secondary',
                    )}
                  >
                    <Icon className="h-3 w-3" strokeWidth={1.8} />
                    {l.label}
                  </button>
                );
              })}
            </div>

            {hoverCadastral && layer === 'cadastral' && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 rounded-md border border-pulse/40 bg-canvas/80 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-pulse backdrop-blur"
              >
                hovered · k.č.br. {hoverCadastral}
              </motion.div>
            )}
          </div>

          <div className="pointer-events-none absolute right-4 top-4 flex flex-col items-end gap-1">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
              45.2074°N 18.4393°E · zoom 14.5
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
              satellite · mapbox static tiles
            </span>
          </div>
        </div>

        {/* RIGHT — metadata panel */}
        <div className="flex min-h-full flex-col justify-between overflow-y-auto border-l border-border bg-surface/40 px-8 py-10">
          <div>
            <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
              <MapPin className="h-3 w-3" strokeWidth={1.8} /> parcel overview
            </div>
            <h1 className="font-display text-4xl uppercase tracking-tech-tight text-text-primary">
              Kopanica-Beravci
            </h1>
            <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.2em] text-text-secondary">
              Općina Velika Kopanica · Brodsko-posavska županija
            </div>

            <div className="mt-6 flex items-baseline gap-4">
              <div className="font-display text-5xl tracking-tech-tight text-pulse">
                <NumberTicker value={80.3} decimals={1} duration={1.3} />
              </div>
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-text-muted">
                hectares
              </span>
            </div>

            {/* Viability composite */}
            <div className="mt-6 rounded-lg border border-agri/40 bg-agri/5 p-4 shadow-glow-pulse">
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-agri">
                  viability score · composite
                </span>
                <span className="font-display text-3xl tracking-tech-tight text-agri">
                  <NumberTicker value={viabilityScore.composite} duration={1.6} />
                  <span className="ml-1 text-xs text-text-muted">/100</span>
                </span>
              </div>
              <div className="mt-2 flex h-1.5 w-full overflow-hidden rounded-full bg-border">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${viabilityScore.composite}%` }}
                  transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full bg-agri"
                />
              </div>
              <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
                weighted · solar · grid · soil · reg · env · market · title
              </div>
            </div>

            <div className="mt-8">
              <DataPanel
                title="PARCEL METADATA"
                rows={[
                  {
                    label: 'estimated value',
                    value: (
                      <span>
                        €1,050,000{' '}
                        <span className="text-text-muted">(HRK 7,568,152)</span>
                      </span>
                    ),
                    tone: 'pulse',
                  },
                  { label: 'land use (current)', value: 'Agricultural / gospodarska zona' },
                  { label: 'zoning (pending)', value: 'UPU amendment · Velika Kopanica' },
                  { label: 'nearest settlement', value: 'Velika Kopanica (2.1 km N)' },
                  { label: 'nearest city', value: 'Slavonski Brod (23.6 km)' },
                  { label: 'road access', value: 'D7 state road (direct border) · A3 exit (0.3 km)' },
                  { label: 'elevation range', value: `${topographySummary.elevationRange[0]}–${topographySummary.elevationRange[1]} m a.s.l.` },
                  { label: 'mean aspect', value: topographySummary.aspectClass },
                  { label: 'soil class', value: soilSummary.croatianClass },
                  { label: 'water table', value: `${hydrology.waterTableAvgM} m avg`, tone: 'signal' },
                  {
                    label: 'acquisition',
                    value: 'IGH bond recovery · 2019',
                    tone: 'muted',
                  },
                ]}
              />
            </div>

            <div className="mt-8">
              <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
                parcel breakdown · {beravciParcel.parcels.building + beravciParcel.parcels.arable}{' '}
                registered parcels
              </div>
              <div className="flex flex-wrap gap-[3px]">
                {beravciParcel.cadastralNumbers.map((id, i) => {
                  const isArable = i >= beravciParcel.parcels.building;
                  return (
                    <motion.div
                      key={id}
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        delay: 0.4 + i * 0.012,
                        duration: 0.25,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      title={`${id} · ${isArable ? 'oranica' : 'građevinsko'}`}
                      className={cn(
                        'h-4 w-5 rounded-[2px] transition-colors',
                        isArable
                          ? 'bg-agri/15 hover:bg-agri/40'
                          : 'bg-pulse/15 hover:bg-pulse/40',
                      )}
                    />
                  );
                })}
              </div>
              <div className="mt-3 flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <span className="inline-block h-2 w-2 rounded-sm bg-pulse/60" /> građevinsko × 45
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="inline-block h-2 w-2 rounded-sm bg-agri/60" /> oranica × 6
                </span>
              </div>
            </div>
          </div>

          <div className="mt-10 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
            <span>deep dive below</span>
            <span className="h-px flex-1 bg-border-bright" />
            <span className="text-pulse">scroll</span>
          </div>
        </div>
      </div>

      {/* DEEP DIVE BAND */}
      <ViabilityBreakdown />
      <SoilPanel />
      <TopoHydroPanel />
      <AccessEnvPanel />
      <RegulatoryPanel />

      <div className="flex justify-end border-t border-border px-12 py-6">
        <Link
          to="/solar"
          className="group inline-flex items-center gap-3 rounded-md border border-border-bright bg-surface px-5 py-3 transition-all hover:border-pulse hover:shadow-glow-pulse"
        >
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-text-secondary group-hover:text-pulse">
            analyze solar potential
          </span>
          <ArrowRight className="h-4 w-4 text-text-secondary transition-transform group-hover:translate-x-0.5 group-hover:text-pulse" strokeWidth={1.8} />
        </Link>
      </div>
    </section>
  );
}

/* =============================== MAP LAYERS =============================== */

function MapLayers({ layer, onHoverCadastral }: { layer: LayerKey; onHoverCadastral: (id: string | null) => void }) {
  return (
    <div className="relative h-full w-full overflow-hidden">
      <ParcelMap
        backgroundUrl="/imagery/kopanica-close.jpg"
        imageOpacity={layer === 'satellite' ? 0.95 : layer === 'cadastral' ? 0.65 : 0.35}
        drawOnMount
        drawDelay={0.3}
        tone={layer === 'soil' ? 'agri' : layer === 'slope' ? 'sun' : layer === 'constraints' ? 'spark' : 'pulse'}
        showSunArc
        liveSunPosition
        showCentroidPulse
        showScaleBar
        showRealCadastral={layer === 'cadastral'}
        onCadastralHover={onHoverCadastral}
      />

      {/* Overlay for soil */}
      {layer === 'soil' && (
        <div className="pointer-events-none absolute inset-0">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
            <defs>
              <pattern id="soilDots" x="0" y="0" width="3" height="3" patternUnits="userSpaceOnUse">
                <circle cx="1.5" cy="1.5" r="0.3" fill="rgb(74 222 128)" fillOpacity="0.55" />
              </pattern>
            </defs>
            <rect x="40" y="37" width="22" height="24" fill="url(#soilDots)" />
            <text x="50" y="50" fontSize="1.6" textAnchor="middle" className="fill-agri font-mono" fontWeight="600">
              Eutric Cambisol
            </text>
            <text x="50" y="53" fontSize="1.2" textAnchor="middle" className="fill-agri/80 font-mono">
              pH 6.7 · clay 28% · OM 2.4%
            </text>
          </svg>
        </div>
      )}

      {/* Overlay for slope */}
      {layer === 'slope' && (
        <div className="pointer-events-none absolute inset-0">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
            {/* contour lines */}
            {[41, 45, 49, 53, 57].map((y, i) => (
              <path
                key={i}
                d={`M 38 ${y} Q 50 ${y - 2} 62 ${y}`}
                fill="none"
                stroke="rgb(255 184 0)"
                strokeOpacity={0.6}
                strokeWidth={0.2}
                strokeDasharray="1 1"
              />
            ))}
            <text x="50" y="45" fontSize="1.5" textAnchor="middle" className="fill-sun font-mono" fontWeight="600">
              gentle S-facing slope
            </text>
            <text x="50" y="48" fontSize="1.1" textAnchor="middle" className="fill-sun/80 font-mono">
              mean 1.3% · max 4.6%
            </text>
          </svg>
        </div>
      )}

      {/* Overlay for constraints */}
      {layer === 'constraints' && (
        <div className="pointer-events-none absolute inset-0">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
            {/* nearest settlement arc */}
            <circle cx={38} cy={64} r={4} fill="rgb(255 61 113)" fillOpacity={0.15} stroke="rgb(255 61 113)" strokeOpacity={0.5} strokeWidth={0.2} strokeDasharray="0.6 0.6" />
            <text x={38} y={63} fontSize={1.5} textAnchor="middle" className="fill-spark font-mono" fontWeight="600">V. Kopanica</text>
            <text x={38} y={65.5} fontSize={1.1} textAnchor="middle" className="fill-spark/80 font-mono">2.1 km · noise</text>
            {/* glare direction */}
            <text x={75} y={25} fontSize={1.3} textAnchor="middle" className="fill-agri font-mono" fontWeight="600">glare &lt; 0.5 min/yr</text>
            <text x={75} y={27} fontSize={1.1} textAnchor="middle" className="fill-agri/80 font-mono">FAA SGHAT modeled</text>
          </svg>
        </div>
      )}
    </div>
  );
}

/* ========================= VIABILITY BREAKDOWN ========================== */

function ViabilityBreakdown() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.2, once: true });

  return (
    <div ref={ref} className="border-t border-border bg-surface/30 px-12 py-12">
      <div className="mb-6 flex flex-col gap-2">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
          <Scale className="h-3.5 w-3.5 text-agri" strokeWidth={1.8} />
          composite viability · 7 axes
        </div>
        <h2 className="font-display text-2xl uppercase tracking-tech-tight text-text-primary">
          what makes kopanica-beravci a {viabilityScore.composite}
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4 lg:grid-cols-7">
        {viabilityScore.components.map((c, i) => {
          const t = { sun: 'text-sun', signal: 'text-signal', agri: 'text-agri', pulse: 'text-pulse' }[c.tone];
          const bg = { sun: 'bg-sun', signal: 'bg-signal', agri: 'bg-agri', pulse: 'bg-pulse' }[c.tone];
          return (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.05 + i * 0.06 }}
              className="flex flex-col gap-2 rounded-lg border border-border bg-surface/40 p-4"
            >
              <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
                {c.label}
              </span>
              <span className={cn('font-display text-3xl tracking-tech-tight', t)}>
                {c.score}
              </span>
              <div className="flex h-1 w-full overflow-hidden rounded-full bg-border">
                <motion.div
                  className={cn('h-full', bg)}
                  initial={{ width: 0 }}
                  animate={inView ? { width: `${c.score}%` } : {}}
                  transition={{ duration: 1.2, delay: 0.15 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
              <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
                weight · {(c.weight * 100).toFixed(0)}%
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* =============================== SOIL PANEL ============================== */

function SoilPanel() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.2, once: true });

  return (
    <div ref={ref} className="border-t border-border px-12 py-12">
      <div className="mb-6 flex flex-col gap-2">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
          <Sprout className="h-3.5 w-3.5 text-agri" strokeWidth={1.8} />
          soil · {soilSummary.classification}
        </div>
        <h2 className="font-display text-2xl uppercase tracking-tech-tight text-text-primary">
          what's under the topsoil
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_1fr]">
        {/* Profile columns */}
        <div className="rounded-lg border border-border bg-surface/40 p-5">
          <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
            vertical profile · 3 horizons
          </div>
          <div className="flex gap-3">
            {soilProfile.map((s, i) => (
              <motion.div
                key={s.depth}
                initial={{ opacity: 0, y: 10 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.05 + i * 0.08 }}
                className="flex flex-1 flex-col gap-2 rounded-md border border-border/60 bg-canvas p-4"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
                  {s.depth}
                </span>
                <SoilBar label="pH H₂O" value={s.phH2o} min={5} max={8} unit="" tone="pulse" />
                <SoilBar label="Clay" value={s.clayPct} min={0} max={45} unit="%" tone="sun" />
                <SoilBar label="OM" value={s.organicMatterPct} min={0} max={4} unit="%" tone="agri" />
                <SoilBar label="N" value={s.nitrogenGPerKg} min={0} max={3} unit="g/kg" tone="signal" />
                <SoilBar label="ρ" value={s.bulkDensityGPerCm3} min={1.0} max={1.6} unit="g/cm³" tone="spark" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="flex flex-col gap-3">
          <SummaryCard label="drainage class" value={soilSummary.drainage} tone="pulse" />
          <SummaryCard label="bearing capacity" value={`${soilSummary.bearingCapacityKpa} kPa`} sub={soilSummary.bearingSuitabilityForPiles} tone="sun" />
          <SummaryCard label="compaction risk" value={soilSummary.compactionRisk} tone="agri" />
          <SummaryCard label="alkalinity / salt" value={soilSummary.saltAlkalinity} tone="agri" />
          <SummaryCard label="agri suitability" value={`${(soilSummary.agriSuitability * 100).toFixed(0)}/100`} tone="agri" progress={soilSummary.agriSuitability} />
        </div>
      </div>
    </div>
  );
}

function SoilBar({ label, value, min, max, unit, tone }: { label: string; value: number; min: number; max: number; unit: string; tone: 'pulse' | 'sun' | 'agri' | 'signal' | 'spark' }) {
  const pct = ((value - min) / (max - min)) * 100;
  const bg = { pulse: 'bg-pulse', sun: 'bg-sun', agri: 'bg-agri', signal: 'bg-signal', spark: 'bg-spark' }[tone];
  const text = { pulse: 'text-pulse', sun: 'text-sun', agri: 'text-agri', signal: 'text-signal', spark: 'text-spark' }[tone];
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between font-mono text-[10px]">
        <span className="uppercase tracking-[0.2em] text-text-muted">{label}</span>
        <span className={cn('tabular-nums', text)}>
          {value.toFixed(1)} {unit}
        </span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-border">
        <motion.div
          className={cn('h-full', bg)}
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.0 }}
        />
      </div>
    </div>
  );
}

function SummaryCard({ label, value, sub, tone, progress }: { label: string; value: string; sub?: string; tone: 'pulse' | 'sun' | 'agri'; progress?: number }) {
  const t = { pulse: 'text-pulse', sun: 'text-sun', agri: 'text-agri' }[tone];
  const bg = { pulse: 'bg-pulse', sun: 'bg-sun', agri: 'bg-agri' }[tone];
  return (
    <div className="rounded-lg border border-border bg-surface/40 p-4">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">{label}</span>
      <div className={cn('mt-1 font-display text-xl tracking-tech-tight', t)}>{value}</div>
      {sub && <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">{sub}</span>}
      {progress !== undefined && (
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-border">
          <motion.div className={cn('h-full', bg)} initial={{ width: 0 }} whileInView={{ width: `${progress * 100}%` }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 1.2 }} />
        </div>
      )}
    </div>
  );
}

/* ======================== TOPOGRAPHY + HYDROLOGY ========================= */

function TopoHydroPanel() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.2, once: true });

  return (
    <div ref={ref} className="border-t border-border bg-surface/20 px-12 py-12">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Topography */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
            <Mountain className="h-3.5 w-3.5 text-sun" strokeWidth={1.8} />
            topography · mean slope {topographySummary.meanSlopePct}%
          </div>

          <div className="rounded-lg border border-border bg-surface/40 p-5">
            <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
              slope histogram · 80.3 ha
            </div>
            <div className="flex items-end justify-between gap-2 h-32">
              {slopeHistogram.map((b) => {
                const t = { agri: 'bg-agri', pulse: 'bg-pulse', sun: 'bg-sun', spark: 'bg-spark' }[b.tone];
                return (
                  <div key={b.slopePct} className="flex flex-1 flex-col items-center gap-1">
                    <span className="font-mono text-[9px] tabular-nums text-text-muted">
                      {b.areaHa.toFixed(1)}
                    </span>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={inView ? { height: `${b.areaShare * 100}%` } : {}}
                      transition={{ duration: 1.0, delay: 0.1 * b.slopePct }}
                      className={cn('w-full rounded-t-sm', t)}
                      style={{ minHeight: '4px' }}
                    />
                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted">
                      {b.slopePct}{b.slopePct === 5 ? '+' : ''}%
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3 font-mono text-[10px]">
              <MiniKv label="elevation" value={`${topographySummary.elevationRange[0]}–${topographySummary.elevationRange[1]} m`} tone="pulse" />
              <MiniKv label="mean aspect" value={`${topographySummary.meanAspectDeg}° S`} tone="sun" />
              <MiniKv label="horizon shadow" value={topographySummary.solarHorizonShadow} tone="agri" />
            </div>
          </div>

          {/* Aspect rose */}
          <div className="rounded-lg border border-border bg-surface/40 p-5">
            <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
              aspect distribution
            </div>
            <div className="relative mx-auto h-[180px] w-[180px]">
              <svg viewBox="-100 -100 200 200" className="h-full w-full">
                {[25, 50, 75, 100].map((r) => (
                  <circle key={r} cx={0} cy={0} r={r * 0.9} fill="none" stroke="rgb(42 42 48)" strokeWidth={0.5} strokeDasharray="2 2" />
                ))}
                {aspectRose.map((a, i) => {
                  const angle = (i / aspectRose.length) * 2 * Math.PI - Math.PI / 2;
                  const r = a.share * 280;
                  const x = Math.cos(angle) * r;
                  const y = Math.sin(angle) * r;
                  const labelX = Math.cos(angle) * 96;
                  const labelY = Math.sin(angle) * 96;
                  return (
                    <g key={a.direction}>
                      <motion.line
                        x1={0}
                        y1={0}
                        x2={x}
                        y2={y}
                        stroke={a.direction === 'S' ? 'rgb(255 184 0)' : 'rgb(124 92 255)'}
                        strokeWidth={4}
                        strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={inView ? { pathLength: 1, opacity: 1 } : {}}
                        transition={{ duration: 0.9, delay: 0.2 + i * 0.05 }}
                      />
                      <text
                        x={labelX}
                        y={labelY}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize={10}
                        className={cn('font-mono', a.direction === 'S' ? 'fill-sun' : 'fill-text-muted')}
                      >
                        {a.direction}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>

        {/* Hydrology */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
            <Droplets className="h-3.5 w-3.5 text-signal" strokeWidth={1.8} />
            hydrology · {hydrology.floodZone100yr.split('·')[0].trim()}
          </div>

          {/* Water table profile */}
          <div className="rounded-lg border border-border bg-surface/40 p-5">
            <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
              water table · seasonal (m below surface)
            </div>
            <div className="flex items-end justify-between gap-3 h-32">
              {Object.entries(hydrology.waterTableSeasonal).map(([season, value]) => (
                <div key={season} className="flex flex-1 flex-col items-center gap-1">
                  <span className="font-mono text-[9px] tabular-nums text-text-muted">{value} m</span>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={inView ? { height: `${Math.abs(value) / 4 * 100}%` } : {}}
                    transition={{ duration: 1.0, delay: 0.1 * Math.random() }}
                    className="w-full rounded-t-sm bg-signal/60"
                    style={{ minHeight: '4px' }}
                  />
                  <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted">{season}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
              ground · {hydrology.waterTableAvgM} m avg · never breaches 1 m
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <MiniKv label="flood Q100" value="clear" tone="agri" bordered />
            <MiniKv label="runoff coef." value={String(hydrology.runoffCoefficient)} tone="signal" bordered />
            <MiniKv label="nearest watercourse" value={`${hydrology.nearestWatercourseM} m`} tone="pulse" bordered />
            <MiniKv label="permeability" value={hydrology.permeabilityClass.split('·')[0].trim()} tone="signal" bordered />
            <MiniKv label="erosion risk" value={hydrology.erosionRisk} tone="agri" bordered />
            <MiniKv label="drainage density" value={`${hydrology.drainageDensityKmPerKm2} km/km²`} tone="pulse" bordered />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========================= ACCESS + ENVIRONMENTAL ======================== */

function AccessEnvPanel() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.2, once: true });

  return (
    <div ref={ref} className="grid grid-cols-1 gap-6 border-t border-border px-12 py-12 lg:grid-cols-2">
      {/* Access routes */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
          <Truck className="h-3.5 w-3.5 text-pulse" strokeWidth={1.8} />
          access · logistics · construction routing
        </div>
        <div className="flex flex-col gap-2">
          {accessRoutes.map((r, i) => {
            const toneBg = { pulse: 'bg-pulse/10 border-pulse/30 text-pulse', agri: 'bg-agri/10 border-agri/30 text-agri', signal: 'bg-signal/10 border-signal/30 text-signal', sun: 'bg-sun/10 border-sun/30 text-sun', spark: 'bg-spark/10 border-spark/30 text-spark' }[r.tone];
            const Icon = r.kind === 'road' ? Navigation : r.kind === 'rail' ? Compass : r.kind === 'hv-line' || r.kind === 'mv-line' ? CircleDot : Truck;
            return (
              <motion.div
                key={`${r.kind}-${r.name}`}
                initial={{ opacity: 0, x: -8 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.05 + i * 0.06 }}
                className={cn('flex items-center gap-3 rounded-lg border bg-surface/40 p-4', toneBg)}
              >
                <Icon className="h-4 w-4" strokeWidth={1.6} />
                <div className="flex-1 font-mono text-[11px]">
                  <div className="text-text-primary">{r.name}</div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
                    {r.note}
                  </div>
                </div>
                <div className="font-display text-xl tracking-tech-tight">
                  {r.distanceKm < 90 ? `${r.distanceKm} km` : '—'}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Environmental */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
          <Fence className="h-3.5 w-3.5 text-agri" strokeWidth={1.8} />
          environmental constraints
        </div>
        <div className="grid grid-cols-1 gap-2">
          {environmentalConstraints.map((e, i) => {
            const t = { agri: 'text-agri border-agri/30', pulse: 'text-pulse border-pulse/30', sun: 'text-sun border-sun/30', spark: 'text-spark border-spark/30' }[e.tone];
            return (
              <motion.div
                key={e.label}
                initial={{ opacity: 0, y: 6 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.05 + i * 0.06 }}
                className={cn('flex items-baseline justify-between rounded-lg border bg-surface/40 p-4', t)}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
                    {e.label}
                  </span>
                  <span className="font-mono text-[10px] text-text-secondary">{e.note}</span>
                </div>
                <span className={cn('font-display text-lg tracking-tech-tight', t.split(' ')[0])}>
                  {e.value}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ============================ REGULATORY ================================ */

function RegulatoryPanel() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.2, once: true });
  const okCount = regulatoryChecklist.filter((r) => r.status === 'ok').length;
  const pendingCount = regulatoryChecklist.filter((r) => r.status === 'pending').length;
  const cautionCount = regulatoryChecklist.filter((r) => r.status === 'caution').length;

  return (
    <div ref={ref} className="border-t border-border bg-surface/30 px-12 py-12">
      <div className="mb-6 flex items-baseline justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
            <ShieldCheck className="h-3.5 w-3.5 text-pulse" strokeWidth={1.8} />
            regulatory · permitting · clearance checklist
          </div>
          <h2 className="font-display text-2xl uppercase tracking-tech-tight text-text-primary">
            10 gates · {okCount} cleared · {pendingCount} pending · {cautionCount} conditional
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {regulatoryChecklist.map((r, i) => {
          const meta = {
            ok: { Icon: Check, tone: 'text-agri border-agri/30 bg-agri/5' },
            pending: { Icon: Clock, tone: 'text-sun border-sun/30 bg-sun/5' },
            caution: { Icon: AlertTriangle, tone: 'text-pulse border-pulse/30 bg-pulse/5' },
            blocked: { Icon: X, tone: 'text-spark border-spark/30 bg-spark/5' },
          }[r.status];
          const Icon = meta.Icon;
          return (
            <motion.div
              key={r.label}
              initial={{ opacity: 0, y: 6 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.04 * i }}
              className={cn('flex items-start gap-3 rounded-lg border p-4', meta.tone)}
            >
              <Icon className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.8} />
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-[11px] text-text-primary">{r.label}</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
                  {r.note}
                </span>
              </div>
              <span className={cn('ml-auto font-mono text-[9px] uppercase tracking-[0.22em]', meta.tone.split(' ')[0])}>
                {r.status}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* =============================== HELPERS ================================= */

function MiniKv({ label, value, tone, bordered }: { label: string; value: string; tone: 'pulse' | 'sun' | 'agri' | 'signal'; bordered?: boolean }) {
  const t = { pulse: 'text-pulse', sun: 'text-sun', agri: 'text-agri', signal: 'text-signal' }[tone];
  return (
    <div className={cn('flex flex-col gap-0.5', bordered && 'rounded-md border border-border bg-surface/30 p-3')}>
      <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">{label}</span>
      <span className={cn('font-mono text-sm tabular-nums', t)}>{value}</span>
    </div>
  );
}
