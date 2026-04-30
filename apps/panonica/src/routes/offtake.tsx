import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Building,
  CheckCircle2,
  Cpu,
  Crosshair,
  Database,
  Factory,
  Gauge,
  Globe,
  Plug,
  Radar,
  Radio,
  ShieldCheck,
  Signal,
  Target,
  Waves,
  Zap,
} from 'lucide-react';
import { cn } from '@paladian/ui';
import { Sparkline } from '@/components/Sparkline';
import {
  buyers as defaultBuyers,
  dcProjects,
  transmission,
  taxonomyObjectives,
  mcOfftakeParams,
  type Buyer,
  type BuyerType,
} from '@/mock/aiCorridor';
import {
  blendPpa,
  buildSolarProductionGrid,
  buildHyperscalerLoadGrid,
  computeCfeMatch,
  runOfftakeMonteCarlo,
  summarizeRuns,
} from '@/lib/offtakeMath';

/**
 * AI Offtake Corridor · /offtake
 *
 * Wartime situation-room view of Croatia's data-center / AI demand pipeline
 * vs. Kopanica-Beravci's supply. Six buyers (Pantheon among them, not central),
 * heavy Monte Carlo, 24/7 CFE matching, Croatian corridor map with radar sweep.
 */

const KB_BASE_CAPEX = 21_000_000;
const KB_ANNUAL_MWH = 39_200;
const KB_PHASE2_MW = 70; // 30 + 40

type SystemStatus = 'green' | 'yellow' | 'red';

/* ============================ ROUTE ============================ */

export function OfftakeRoute() {
  // Buyer slice MW · user can adjust
  const [buyerStack, setBuyerStack] = useState<Buyer[]>(defaultBuyers);

  const totalCommitMW = useMemo(
    () =>
      buyerStack.reduce(
        (s, b) => s + (b.id === 'merchant' ? 0 : b.ourSliceMW * b.probability),
        0,
      ),
    [buyerStack],
  );

  const merchantResidualMW = Math.max(0, KB_PHASE2_MW - totalCommitMW);

  const blended = useMemo(() => blendPpa(buyerStack), [buyerStack]);

  // System status traffic light
  const status: SystemStatus =
    blended.cfeMatchPct > 60 && blended.riskScore < 0.4
      ? 'green'
      : blended.cfeMatchPct > 30 || blended.riskScore < 0.55
        ? 'yellow'
        : 'red';

  const setSliceMW = (buyerId: string, mw: number) => {
    setBuyerStack((prev) =>
      prev.map((b) => (b.id === buyerId ? { ...b, ourSliceMW: Math.max(0, mw) } : b)),
    );
  };

  return (
    <section className="flex min-h-full flex-col gap-0 bg-[#06070A]">
      <SituationHeader
        status={status}
        totalCommitMW={totalCommitMW}
        merchantResidualMW={merchantResidualMW}
        blended={blended}
      />
      <CorridorMap />
      <BuyerStack
        buyers={buyerStack}
        merchantResidualMW={merchantResidualMW}
        onSlice={setSliceMW}
        blended={blended}
      />
      <CFEMatchingGrid buyers={buyerStack} />
      <PantheonGantt />
      <TaxonomyScorecard />
      <OfftakeMonteCarlo buyers={buyerStack} />
      <Footer />
    </section>
  );
}

/* ============================ SITUATION HEADER ============================ */

function SituationHeader({
  status,
  totalCommitMW,
  merchantResidualMW,
  blended,
}: {
  status: SystemStatus;
  totalCommitMW: number;
  merchantResidualMW: number;
  blended: ReturnType<typeof blendPpa>;
}) {
  const statusColor = { green: '#5BD9A1', yellow: '#FFB800', red: '#FF3D71' }[status];
  const statusLabel = { green: 'OPERATIONAL', yellow: 'CAUTION', red: 'ALERT' }[status];

  return (
    <div className="relative overflow-hidden border-b-2 border-[#1a1d24] px-12 py-6">
      {/* Grid backdrop */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative z-10 flex items-center justify-between gap-6">
        {/* LEFT · status + title */}
        <div className="flex items-center gap-4">
          <motion.span
            animate={{ opacity: [1, 0.4, 1], scale: [1, 1.15, 1] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            className="relative flex h-3 w-3"
          >
            <span
              className="absolute inset-0 rounded-full"
              style={{ background: statusColor, boxShadow: `0 0 18px ${statusColor}` }}
            />
          </motion.span>
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-[9px] uppercase tracking-[0.32em]" style={{ color: statusColor }}>
              psoc · offtake corridor · {statusLabel}
            </span>
            <h1 className="font-display text-2xl uppercase tracking-tech-tight text-text-primary">
              AI offtake situation room
            </h1>
          </div>
        </div>

        {/* CENTER · live counters */}
        <div className="flex items-center gap-5 font-mono text-[10px] uppercase tracking-[0.22em]">
          <CounterChip label="committed" value={`${totalCommitMW.toFixed(1)} MW`} tone={statusColor} />
          <CounterChip label="merchant residual" value={`${merchantResidualMW.toFixed(1)} MW`} tone="#6B7180" />
          <CounterChip label="blended ppa" value={`€${blended.weightedPriceEurMwh.toFixed(0)}`} tone="#FFB800" />
          <CounterChip label="green premium" value={`+€${blended.greenPremiumWeighted.toFixed(0)}`} tone="#5BD9A1" />
          <CounterChip label="cfe 24/7" value={`${blended.cfeMatchPct.toFixed(0)}%`} tone="#7C5CFF" />
          <CounterChip label="risk" value={`${(blended.riskScore * 100).toFixed(0)}%`} tone={blended.riskScore > 0.5 ? '#FF3D71' : '#FFB800'} />
        </div>

        {/* RIGHT · timestamp */}
        <div className="flex flex-col items-end gap-0.5 font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
          <span>{new Date().toISOString().slice(0, 19).replace('T', ' · ')}</span>
          <span className="text-text-secondary">classification · pre-pitch · IVAN PALADINA</span>
        </div>
      </div>
    </div>
  );
}

function CounterChip({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="flex flex-col gap-0">
      <span className="text-text-muted">{label}</span>
      <span className="font-display text-base tracking-tech-tight tabular-nums" style={{ color: tone }}>
        {value}
      </span>
    </div>
  );
}

/* ============================ CORRIDOR MAP ============================ */

function CorridorMap() {
  const [selected, setSelected] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.2, once: true });

  // SVG viewbox covers Croatia + parts of BiH/Hungary/Serbia
  // Approximate WGS84 bounding box: lon 13.5–20.0, lat 42.5–46.5
  const bbox = { lonMin: 13.2, lonMax: 20.5, latMin: 42.3, latMax: 46.6 };
  const W = 900;
  const H = 500;

  const project = (lon: number, lat: number) => {
    const x = ((lon - bbox.lonMin) / (bbox.lonMax - bbox.lonMin)) * W;
    const y = H - ((lat - bbox.latMin) / (bbox.latMax - bbox.latMin)) * H;
    return { x, y };
  };

  const KB = project(18.4130, 45.1348);

  const statusColor = (s: string) =>
    ({
      operational: '#5BD9A1',
      construction: '#FFB800',
      permitted: '#7C5CFF',
      announced: '#FF3D71',
      rumored: '#6B7180',
    }[s] ?? '#FAFAFA');

  return (
    <div ref={ref} className="border-b-2 border-[#1a1d24] px-12 py-10">
      <div className="mb-5 flex items-baseline justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
            <Radar className="h-3.5 w-3.5 animate-pulse" strokeWidth={1.8} style={{ color: '#5BD9A1' }} />
            corridor map · cee data-center pipeline
          </div>
          <h2 className="font-display text-2xl uppercase tracking-tech-tight text-text-primary">
            the demand wave
          </h2>
          <p className="max-w-3xl font-mono text-[11px] text-text-secondary">
            Eight live data-center / AI compute projects across Croatia + neighbours.
            Pulses sized by capacity. Lines = transmission paths to Kopanica-Beravci PCC at TS Slavonski Brod 1.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
          {(['operational', 'construction', 'permitted', 'announced', 'rumored'] as const).map((s) => (
            <span key={s} className="inline-flex items-center gap-1.5">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: statusColor(s), boxShadow: `0 0 6px ${statusColor(s)}` }}
              />
              {s}
            </span>
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.7 }}
        className="relative overflow-hidden rounded-md border border-[#1a1d24] bg-[#0a0c12]"
      >
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" style={{ aspectRatio: `${W}/${H}` }}>
          {/* Grid pattern */}
          <defs>
            <pattern id="situ-grid" width={50} height={50} patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(91, 217, 161, 0.08)" strokeWidth={0.5} />
            </pattern>
            <radialGradient id="radar-cone" cx="0" cy="0.5" r="1">
              <stop offset="0%" stopColor="#5BD9A1" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#5BD9A1" stopOpacity={0} />
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <rect width={W} height={H} fill="url(#situ-grid)" />

          {/* Croatia silhouette · simplified */}
          <path
            d="M 100 200 L 130 175 L 175 165 L 220 160 L 270 165 L 330 175 L 390 195 L 450 215 L 510 230 L 555 250 L 580 290 L 575 340 L 550 380 L 510 410 L 460 425 L 405 415 L 360 395 L 310 410 L 270 440 L 220 425 L 175 395 L 140 360 L 115 320 L 100 270 Z"
            fill="rgba(124, 92, 255, 0.06)"
            stroke="rgba(124, 92, 255, 0.4)"
            strokeWidth={0.8}
          />

          {/* Transmission lines */}
          {transmission.map((t) => {
            const a = project(t.fromGeo.lon, t.fromGeo.lat);
            const b = project(t.toGeo.lon, t.toGeo.lat);
            const lineColor = t.voltageKv >= 400 ? '#FFB800' : t.voltageKv >= 220 ? '#7C5CFF' : '#5BD9A1';
            const isPlanned = t.status === 'planned';
            return (
              <g key={t.id}>
                <line
                  x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                  stroke={lineColor}
                  strokeWidth={1.3}
                  strokeOpacity={isPlanned ? 0.5 : 0.85}
                  strokeDasharray={isPlanned ? '4 4' : undefined}
                />
                <text
                  x={(a.x + b.x) / 2}
                  y={(a.y + b.y) / 2 - 4}
                  fontSize={7}
                  fontFamily="monospace"
                  fill={lineColor}
                  fillOpacity={0.7}
                  textAnchor="middle"
                >
                  {t.voltageKv} kV · {(t.utilization * 100).toFixed(0)}%
                </text>
              </g>
            );
          })}

          {/* Radar sweep around Kopanica-Beravci · indicates "we are scanning the demand" */}
          <motion.g
            animate={{ rotate: 360 }}
            transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: `${KB.x}px ${KB.y}px` }}
          >
            <path
              d={`M ${KB.x} ${KB.y} L ${KB.x + 200} ${KB.y - 35} A 200 200 0 0 1 ${KB.x + 200} ${KB.y + 35} Z`}
              fill="url(#radar-cone)"
            />
          </motion.g>

          {/* DC project pulses */}
          {dcProjects.map((p) => {
            const pos = project(p.geo.lon, p.geo.lat);
            const color = p.isPantheon ? '#FF3D71' : statusColor(p.status);
            const r = Math.min(22, 4 + Math.sqrt(p.capacityMW) / 1.5);
            return (
              <g
                key={p.id}
                onMouseEnter={() => setSelected(p.id)}
                onMouseLeave={() => setSelected(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Pulse ring */}
                <motion.circle
                  cx={pos.x}
                  cy={pos.y}
                  r={r}
                  fill="none"
                  stroke={color}
                  strokeWidth={1}
                  initial={{ opacity: 0.6 }}
                  animate={{ r: [r, r * 2.3], opacity: [0.6, 0] }}
                  transition={{ duration: 2.4, repeat: Infinity, delay: Math.random() * 2 }}
                />
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={r * 0.55}
                  fill={color}
                  fillOpacity={p.isOurOfftaker ? 0.95 : 0.45}
                  stroke={p.isOurOfftaker ? '#FAFAFA' : color}
                  strokeWidth={p.isOurOfftaker ? 1.5 : 0.5}
                  filter="url(#glow)"
                />
                <text
                  x={pos.x}
                  y={pos.y + r + 12}
                  fontSize={9}
                  fontFamily="monospace"
                  fill={color}
                  textAnchor="middle"
                >
                  {p.geo.city.toUpperCase()}
                </text>
                <text
                  x={pos.x}
                  y={pos.y + r + 22}
                  fontSize={7.5}
                  fontFamily="monospace"
                  fill="#6B7180"
                  textAnchor="middle"
                >
                  {p.capacityMW} MW
                </text>
              </g>
            );
          })}

          {/* Kopanica-Beravci anchor · always highlighted */}
          <g>
            <circle cx={KB.x} cy={KB.y} r={9} fill="#7C5CFF" stroke="#FAFAFA" strokeWidth={2} filter="url(#glow)" />
            <motion.circle
              cx={KB.x} cy={KB.y} r={9}
              fill="none"
              stroke="#7C5CFF"
              strokeWidth={1.5}
              animate={{ r: [9, 30], opacity: [0.6, 0] }}
              transition={{ duration: 2.4, repeat: Infinity }}
            />
            <text x={KB.x} y={KB.y - 14} fontSize={11} fontFamily="monospace" fill="#B89CFF" textAnchor="middle">
              KOPANICA-BERAVCI
            </text>
            <text x={KB.x} y={KB.y - 4} fontSize={8.5} fontFamily="monospace" fill="#7C5CFF" textAnchor="middle">
              30 + 40 MW · supply
            </text>
          </g>

          {/* Selected project tooltip */}
          {selected && (() => {
            const p = dcProjects.find((d) => d.id === selected);
            if (!p) return null;
            const pos = project(p.geo.lon, p.geo.lat);
            return (
              <g>
                <rect
                  x={pos.x + 18}
                  y={pos.y - 50}
                  width={230}
                  height={70}
                  fill="#06070A"
                  stroke="#5BD9A1"
                  strokeWidth={1}
                  rx={3}
                />
                <text x={pos.x + 26} y={pos.y - 33} fontSize={10} fontFamily="monospace" fill="#5BD9A1" letterSpacing={1}>
                  {p.name.toUpperCase()}
                </text>
                <text x={pos.x + 26} y={pos.y - 20} fontSize={8.5} fontFamily="monospace" fill="#FAFAFA">
                  {p.operator}
                </text>
                <text x={pos.x + 26} y={pos.y - 8} fontSize={8.5} fontFamily="monospace" fill="#FFB800">
                  {p.capacityMW} MW · {p.status} · COD {p.startYear}
                </text>
                <foreignObject x={pos.x + 26} y={pos.y - 2} width={210} height={30}>
                  <div className="font-mono text-[8.5px] leading-tight text-text-muted">{p.note}</div>
                </foreignObject>
              </g>
            );
          })()}
        </svg>
      </motion.div>
    </div>
  );
}

/* ============================ BUYER STACK ============================ */

function BuyerStack({
  buyers,
  merchantResidualMW,
  onSlice,
  blended,
}: {
  buyers: Buyer[];
  merchantResidualMW: number;
  onSlice: (id: string, mw: number) => void;
  blended: ReturnType<typeof blendPpa>;
}) {
  return (
    <div className="border-b-2 border-[#1a1d24] bg-[#0a0c12] px-12 py-10">
      <div className="mb-5 flex flex-col gap-2">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
          <Database className="h-3.5 w-3.5 text-pulse" strokeWidth={1.8} />
          counterparty stack · live pricing
        </div>
        <h2 className="font-display text-2xl uppercase tracking-tech-tight text-text-primary">
          the buyer waterfall
        </h2>
        <p className="max-w-3xl font-mono text-[11px] text-text-secondary">
          Drag the MW slider per buyer. Pricing × probability × tenor blends in real time.
          Whatever you don't commit cascades to the HROTE merchant pool at €94/MWh.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {buyers.map((b, i) => (
          <BuyerRow
            key={b.id}
            buyer={b}
            isMerchant={b.id === 'merchant'}
            merchantResidualMW={merchantResidualMW}
            onSlice={onSlice}
            delay={i * 0.06}
          />
        ))}
      </div>

      {/* Blended rollup */}
      <div className="mt-6 grid grid-cols-5 gap-3">
        <RollupCard label="effective MW" value={`${blended.totalSliceMW.toFixed(1)} MW`} tone="pulse" />
        <RollupCard label="blended €/MWh" value={`€${blended.weightedPriceEurMwh.toFixed(1)}`} tone="sun" />
        <RollupCard label="weighted tenor" value={`${blended.weightedTenor.toFixed(1)} yr`} tone="agri" />
        <RollupCard label="green premium" value={`+€${blended.greenPremiumWeighted.toFixed(1)}`} tone="agri" />
        <RollupCard label="risk score" value={`${(blended.riskScore * 100).toFixed(0)}%`} tone={blended.riskScore > 0.5 ? 'spark' : 'pulse'} />
      </div>
    </div>
  );
}

function BuyerRow({
  buyer,
  isMerchant,
  merchantResidualMW,
  onSlice,
  delay,
}: {
  buyer: Buyer;
  isMerchant: boolean;
  merchantResidualMW: number;
  onSlice: (id: string, mw: number) => void;
  delay: number;
}) {
  const toneText: Record<Buyer['tone'], string> = {
    pulse: 'text-pulse',
    sun: 'text-sun',
    agri: 'text-agri',
    signal: 'text-signal',
    spark: 'text-spark',
  };
  const toneBg: Record<Buyer['tone'], string> = {
    pulse: 'border-pulse/40 bg-pulse/5',
    sun: 'border-sun/40 bg-sun/5',
    agri: 'border-agri/40 bg-agri/5',
    signal: 'border-signal/40 bg-signal/5',
    spark: 'border-spark/40 bg-spark/5',
  };
  const typeIcon: Record<BuyerType, any> = {
    hyperscaler: Cpu,
    datacenter: Database,
    corporate: Factory,
    merchant: Activity,
    export: Globe,
  };
  const Icon = typeIcon[buyer.type];

  const sliceMW = isMerchant ? merchantResidualMW : buyer.ourSliceMW;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
      className={cn(
        'grid grid-cols-[2.2fr_1fr_1.5fr_0.8fr] items-center gap-4 rounded-md border bg-[#0a0c12] p-4',
        toneBg[buyer.tone],
      )}
    >
      {/* LEFT · identity */}
      <div className="flex items-start gap-3">
        <Icon className={cn('h-5 w-5 mt-0.5 shrink-0', toneText[buyer.tone])} strokeWidth={1.6} />
        <div className="flex flex-col gap-0.5">
          <div className="flex items-baseline gap-2">
            <span className={cn('font-display text-sm uppercase tracking-tech-tight', toneText[buyer.tone])}>
              {buyer.shortName}
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
              · {buyer.type} · {buyer.creditRating} · {buyer.cfeRequirement}
            </span>
          </div>
          <span className="font-mono text-[10px] text-text-secondary">{buyer.name}</span>
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted">
            {buyer.geo.city} · {buyer.startYear} · {buyer.tenorYears}-yr · {(buyer.probability * 100).toFixed(0)}% prob
          </span>
        </div>
      </div>

      {/* MIDDLE · price */}
      <div className="flex flex-col gap-0">
        <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
          PPA price
        </span>
        <span className={cn('font-display text-2xl tracking-tech-tight tabular-nums', toneText[buyer.tone])}>
          €{buyer.ppaPriceEurMwh}
        </span>
        <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-agri">
          green +€{buyer.greenPremiumEurMwh}
        </span>
      </div>

      {/* RIGHT · MW slider */}
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
            our slice
          </span>
          <span className={cn('font-display text-base tracking-tech-tight tabular-nums', toneText[buyer.tone])}>
            {sliceMW.toFixed(1)} MW
          </span>
        </div>
        {!isMerchant ? (
          <input
            type="range"
            min={0}
            max={Math.min(40, buyer.capacityMW * 0.1)}
            step={0.5}
            value={buyer.ourSliceMW}
            onChange={(e) => onSlice(buyer.id, parseFloat(e.target.value))}
            className={cn(
              'w-full cursor-pointer',
              `accent-${buyer.tone}`,
            )}
          />
        ) : (
          <div className="text-[9px] font-mono uppercase tracking-[0.22em] text-text-muted">
            residual sink · auto
          </div>
        )}
        <div className="flex items-center justify-between font-mono text-[8.5px] uppercase tracking-[0.22em] text-text-muted">
          <span>0</span>
          <span className="text-text-secondary">
            buyer demand {buyer.capacityMW >= 9999 ? '∞' : `${buyer.capacityMW} MW`}
          </span>
        </div>
      </div>

      {/* FAR RIGHT · status badge */}
      <div className="flex flex-col items-end gap-1">
        <StatusBadge status={buyer.status} />
        <span className="font-mono text-[8.5px] uppercase tracking-[0.22em] text-text-muted text-right">
          {(buyer.ourSliceMW * buyer.probability).toFixed(1)} MW · risk-adj
        </span>
      </div>
    </motion.div>
  );
}

function StatusBadge({ status }: { status: Buyer['status'] }) {
  const map: Record<Buyer['status'], { label: string; cls: string }> = {
    firm: { label: 'firm', cls: 'border-agri/50 bg-agri/15 text-agri' },
    lol: { label: 'LOL', cls: 'border-pulse/50 bg-pulse/15 text-pulse' },
    mou: { label: 'MOU', cls: 'border-pulse/50 bg-pulse/15 text-pulse' },
    rumored: { label: 'rumored', cls: 'border-sun/50 bg-sun/15 text-sun' },
    public: { label: 'public', cls: 'border-spark/50 bg-spark/15 text-spark' },
  };
  const e = map[status];
  return (
    <span className={cn('rounded-sm border px-1.5 py-0.5 font-mono text-[8.5px] uppercase tracking-[0.24em]', e.cls)}>
      {e.label}
    </span>
  );
}

function RollupCard({ label, value, tone }: { label: string; value: string; tone: Buyer['tone'] }) {
  const toneText: Record<Buyer['tone'], string> = {
    pulse: 'text-pulse border-pulse/40 bg-pulse/5',
    sun: 'text-sun border-sun/40 bg-sun/5',
    agri: 'text-agri border-agri/40 bg-agri/5',
    signal: 'text-signal border-signal/40 bg-signal/5',
    spark: 'text-spark border-spark/40 bg-spark/5',
  };
  return (
    <div className={cn('flex flex-col gap-1 rounded-md border bg-[#0a0c12] p-3', toneText[tone])}>
      <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-text-muted">{label}</span>
      <motion.span
        key={value}
        initial={{ opacity: 0.5, y: -2 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className={cn('font-display text-2xl tracking-tech-tight tabular-nums', toneText[tone].split(' ')[0])}
      >
        {value}
      </motion.span>
    </div>
  );
}

/* ============================ CFE MATCHING ============================ */

function CFEMatchingGrid({ buyers }: { buyers: Buyer[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.2, once: true });

  // Compute total committed MW vs total demand to derive matching fraction
  const totalCommitMW = buyers
    .filter((b) => b.id !== 'merchant')
    .reduce((s, b) => s + b.ourSliceMW * b.probability, 0);
  const totalDemandMW = buyers
    .filter((b) => b.cfeRequirement !== 'none' && b.id !== 'merchant')
    .reduce((s, b) => s + b.ourSliceMW * b.probability, 0);

  // Solar / load grids
  const solarGrid = useMemo(() => buildSolarProductionGrid(), []);
  const loadGrid = useMemo(() => buildHyperscalerLoadGrid(), []);
  // Our share of load · clamped 0..1
  const ourShare = Math.min(1, totalCommitMW / Math.max(50, totalDemandMW * 6)); // 6 = oversizing factor for solar vs constant load
  const { matchPct, matrix } = useMemo(
    () => computeCfeMatch(solarGrid, loadGrid, ourShare),
    [solarGrid, loadGrid, ourShare],
  );

  const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

  return (
    <div ref={ref} className="border-b-2 border-[#1a1d24] px-12 py-10">
      <div className="mb-5 flex items-baseline justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
            <Gauge className="h-3.5 w-3.5 text-agri" strokeWidth={1.8} />
            24/7 CFE matching · 288 hour-month cells
          </div>
          <h2 className="font-display text-2xl uppercase tracking-tech-tight text-text-primary">
            green hour by green hour
          </h2>
          <p className="max-w-3xl font-mono text-[11px] text-text-secondary">
            Hyperscaler load needs <span className="text-pulse">24/7 carbon-free supply</span> for EU Taxonomy. KB solar covers daylight hours · battery shifts ~4h surplus into evening · grid imports cover the gap. Match score:
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
            blended match
          </span>
          <motion.span
            key={matchPct.toFixed(1)}
            initial={{ scale: 0.96, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.35 }}
            className={cn(
              'font-display text-5xl tracking-tech-tight tabular-nums',
              matchPct > 60 ? 'text-agri' : matchPct > 40 ? 'text-sun' : 'text-spark',
            )}
          >
            {matchPct.toFixed(0)}%
          </motion.span>
          <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
            of buyer load covered
          </span>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.7 }}
        className="rounded-md border border-[#1a1d24] bg-[#0a0c12] p-5"
      >
        <svg viewBox="0 0 700 340" className="block w-full" style={{ aspectRatio: '700/340' }}>
          {/* Y axis · hours */}
          {Array.from({ length: 24 }).map((_, h) => (
            <text
              key={h}
              x={26}
              y={26 + h * 12 + 9}
              fontSize={7}
              fontFamily="monospace"
              fill="#6B7180"
              textAnchor="end"
            >
              {h.toString().padStart(2, '0')}h
            </text>
          ))}
          {/* X axis · months */}
          {months.map((m, i) => (
            <text
              key={i}
              x={42 + i * 52 + 24}
              y={22}
              fontSize={9}
              fontFamily="monospace"
              fill="#8B93A3"
              textAnchor="middle"
            >
              {m}
            </text>
          ))}
          {/* Cells */}
          {matrix.map((row, h) =>
            row.map((v, m) => (
              <motion.rect
                key={`${h}-${m}`}
                x={42 + m * 52}
                y={26 + h * 12}
                width={50}
                height={11}
                rx={1}
                fill={cfeColor(v)}
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ duration: 0.3, delay: 0.001 * (h * 12 + m) }}
              >
                <title>
                  {h.toString().padStart(2, '0')}:00 · {months[m]} · {(v * 100).toFixed(0)}% covered
                </title>
              </motion.rect>
            )),
          )}
        </svg>

        <div className="mt-3 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
          <div className="flex items-center gap-1.5">
            <span>match</span>
            {[0.05, 0.25, 0.5, 0.75, 0.95].map((v) => (
              <span
                key={v}
                className="inline-block h-3 w-4 rounded-sm"
                style={{ background: cfeColor(v) }}
              />
            ))}
            <span>100%</span>
          </div>
          <span className="text-pulse">grid-import gap = ~{(100 - matchPct).toFixed(0)}% · need 4h+ battery to close it</span>
        </div>
      </motion.div>
    </div>
  );
}

function cfeColor(t: number): string {
  if (t < 0.05) return '#1a1d24';
  if (t < 0.2) return '#1f2840';
  if (t < 0.4) return '#23477a';
  if (t < 0.6) return '#236f8e';
  if (t < 0.8) return '#3aab87';
  return '#5BD9A1';
}

/* ============================ PANTHEON GANTT ============================ */

function PantheonGantt() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.2, once: true });

  // Time axis · 2026 → 2032
  const startY = 2026, endY = 2032;
  const span = endY - startY;

  const phases = [
    { id: 'p-finance', label: 'Pantheon · financial close', start: 2026.5, end: 2027.0, tone: '#FFB800' },
    { id: 'p-site', label: 'Pantheon · site prep + expropriation', start: 2027.0, end: 2027.8, tone: '#FF3D71' },
    { id: 'p-build', label: 'Pantheon · construction', start: 2027.8, end: 2029.0, tone: '#7C5CFF' },
    { id: 'p-ramp', label: 'Pantheon · ramp · 0 → 250 MW', start: 2029.0, end: 2030.0, tone: '#7C5CFF' },
    { id: 'p-full', label: 'Pantheon · full ops · 1000 MW', start: 2030.0, end: 2032.0, tone: '#5BD9A1' },
  ];

  const kbMilestones = [
    { y: 2026.4, label: 'KB FZOEU OI-2026-03 deadline', tone: '#FFB800' },
    { y: 2027.7, label: 'KB COD · Phase 1 · 30 MW', tone: '#5BD9A1' },
    { y: 2027.8, label: 'KB Pantheon LOI signed', tone: '#7C5CFF' },
    { y: 2029.5, label: 'KB Phase 2 · +40 MW · 70 MW total', tone: '#5BD9A1' },
    { y: 2031.0, label: 'KB refi · DSCR achieved', tone: '#FFB800' },
  ];

  const xFor = (year: number) => ((year - startY) / span) * 100;

  return (
    <div ref={ref} className="border-b-2 border-[#1a1d24] bg-[#0a0c12] px-12 py-10">
      <div className="mb-5 flex flex-col gap-2">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
          <Building className="h-3.5 w-3.5 text-pulse" strokeWidth={1.8} />
          construction gantt · pantheon vs. kopanica-beravci
        </div>
        <h2 className="font-display text-2xl uppercase tracking-tech-tight text-text-primary">
          when does the buyer arrive
        </h2>
        <p className="max-w-3xl font-mono text-[11px] text-text-secondary">
          KB Phase 1 COD lands <span className="text-agri">~18 months before</span> Pantheon's first ramp MW. We're early — and early-positioning is the optionality. Even if Pantheon slips 2030 → 2032, our 25-yr clock starts in 2027 regardless.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.7 }}
        className="rounded-md border border-[#1a1d24] bg-[#06070A] p-5"
      >
        {/* Year ticks */}
        <div className="relative mb-3 h-5">
          {Array.from({ length: span + 1 }).map((_, i) => {
            const y = startY + i;
            return (
              <div
                key={y}
                className="absolute font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted"
                style={{ left: `${xFor(y)}%` }}
              >
                {y}
              </div>
            );
          })}
        </div>

        {/* Bars */}
        <div className="relative flex flex-col gap-2">
          {phases.map((p, i) => (
            <div key={p.id} className="relative h-6">
              <motion.div
                initial={{ width: 0 }}
                animate={inView ? { width: `${(xFor(p.end) - xFor(p.start))}%` } : {}}
                transition={{ duration: 0.9, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                className="absolute top-0 h-6 rounded-sm"
                style={{
                  left: `${xFor(p.start)}%`,
                  background: `linear-gradient(90deg, ${p.tone}33, ${p.tone}aa)`,
                  border: `1px solid ${p.tone}`,
                  boxShadow: `0 0 16px ${p.tone}55`,
                }}
              />
              <span
                className="absolute top-1 font-mono text-[10px] uppercase tracking-[0.22em] text-text-primary"
                style={{ left: `${xFor(p.start) + 0.5}%` }}
              >
                {p.label}
              </span>
            </div>
          ))}
        </div>

        {/* KB milestones rail */}
        <div className="relative mt-6 border-t border-[#1a1d24] pt-3">
          <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted mb-2">
            kopanica-beravci milestones
          </div>
          <div className="relative h-12">
            {kbMilestones.map((m) => (
              <div
                key={m.label}
                className="absolute top-0"
                style={{ left: `${xFor(m.y)}%`, transform: 'translateX(-50%)' }}
              >
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ background: m.tone, boxShadow: `0 0 10px ${m.tone}` }}
                />
                <div
                  className="mt-1 whitespace-nowrap font-mono text-[8.5px] uppercase tracking-[0.22em]"
                  style={{ color: m.tone }}
                >
                  {m.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ============================ TAXONOMY SCORECARD ============================ */

function TaxonomyScorecard() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.2, once: true });

  const totalGoCert = taxonomyObjectives.reduce((s, o) => s + o.goCertEur, 0);

  return (
    <div ref={ref} className="border-b-2 border-[#1a1d24] px-12 py-10">
      <div className="mb-5 flex items-baseline justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
            <ShieldCheck className="h-3.5 w-3.5 text-agri" strokeWidth={1.8} />
            EU Taxonomy · 6 environmental objectives
          </div>
          <h2 className="font-display text-2xl uppercase tracking-tech-tight text-text-primary">
            certified-green supply
          </h2>
          <p className="max-w-3xl font-mono text-[11px] text-text-secondary">
            Hyperscalers require <span className="text-agri">EU-Taxonomy-aligned</span> generation for Scope-2 reporting. KB scores 4 of 4 alignable objectives + GO certificate revenue stack. This is the differentiator vs. merchant solar.
          </p>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
            GO certificates · annual
          </span>
          <span className="font-display text-3xl tracking-tech-tight tabular-nums text-agri">
            €{(totalGoCert / 1000).toFixed(0)}k
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
            stackable on top of PPA
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {taxonomyObjectives.map((o, i) => (
          <motion.div
            key={o.id}
            initial={{ opacity: 0, y: 6 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            className="flex flex-col gap-2 rounded-md border border-agri/30 bg-agri/5 p-4"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-agri">
                {o.short}
              </span>
              <CheckCircle2 className="h-4 w-4 text-agri" strokeWidth={1.8} />
            </div>
            <span className="font-display text-base uppercase tracking-tech-tight text-text-primary">
              {o.name}
            </span>

            {/* Score bar · ours vs threshold */}
            <div className="relative h-2 overflow-hidden rounded-full bg-[#1a1d24]">
              <motion.div
                initial={{ width: 0 }}
                animate={inView ? { width: `${o.ourScore}%` } : {}}
                transition={{ duration: 0.8, delay: 0.3 + i * 0.06 }}
                className="absolute left-0 top-0 h-full bg-agri"
              />
              <div
                className="absolute top-0 h-full w-[2px] bg-text-primary"
                style={{ left: `${o.required}%` }}
              />
            </div>
            <div className="flex items-baseline justify-between font-mono text-[9px] uppercase tracking-[0.22em]">
              <span className="text-agri tabular-nums">our {o.ourScore}/100</span>
              <span className="text-text-muted">threshold {o.required}</span>
            </div>

            <p className="font-mono text-[9.5px] leading-relaxed text-text-secondary">
              {o.note}
            </p>
            {o.goCertEur > 0 && (
              <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-sun">
                GO cert · €{(o.goCertEur / 1000).toFixed(0)}k/yr
              </span>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ============================ MONTE CARLO ============================ */

function OfftakeMonteCarlo({ buyers }: { buyers: Buyer[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.2, once: true });

  const runs = useMemo(
    () =>
      runOfftakeMonteCarlo({
        buyers,
        baseCapexEur: KB_BASE_CAPEX,
        baseAnnualMwh: KB_ANNUAL_MWH,
        runs: mcOfftakeParams.runs,
      }),
    [buyers],
  );

  const irrSummary = useMemo(() => summarizeRuns(runs, 'irrEquityPct'), [runs]);
  const npvSummary = useMemo(() => summarizeRuns(runs, 'npv25yEur'), [runs]);
  const momSummary = useMemo(() => summarizeRuns(runs, 'momY10'), [runs]);

  // Bucket IRR runs into histogram (0..30% in 0.5pp steps · 60 buckets)
  const histogram = useMemo(() => {
    const buckets = Array(60).fill(0);
    for (const r of runs) {
      const idx = Math.floor(Math.max(0, Math.min(59, r.irrEquityPct / 0.5)));
      buckets[idx]++;
    }
    return buckets;
  }, [runs]);

  const maxBucket = Math.max(...histogram);

  // Outcome-mix split
  const outcomeMix = useMemo(() => {
    const cancel = runs.filter((r) => r.pantheonOutcome === 'cancel').length;
    const partial = runs.filter((r) => r.pantheonOutcome === 'partial').length;
    const full = runs.filter((r) => r.pantheonOutcome === 'full').length;
    const n = runs.length;
    return { cancel: cancel / n, partial: partial / n, full: full / n };
  }, [runs]);

  return (
    <div ref={ref} className="border-b-2 border-[#1a1d24] bg-[#0a0c12] px-12 py-10">
      <div className="mb-5 flex items-baseline justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
            <Crosshair className="h-3.5 w-3.5 text-spark" strokeWidth={1.8} />
            monte carlo · 1,000 runs · pantheon × commodity × policy
          </div>
          <h2 className="font-display text-2xl uppercase tracking-tech-tight text-text-primary">
            the risk envelope
          </h2>
          <p className="max-w-3xl font-mono text-[11px] text-text-secondary">
            1,000 simulations across Pantheon-cancel/partial/full × HROTE merchant ±18% × REC premium ±€5 × regulatory delay 0–10 mo. Every bar is a possible outcome. The bank cares about <span className="text-pulse">P10 IRR</span> — the answer is well above their {' '}
            <span className="text-spark">8% covenant</span>.
          </p>
        </div>

        <div className="flex flex-col items-end gap-0.5">
          <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
            P10 / P50 / P90
          </span>
          <span className="font-display text-3xl tracking-tech-tight tabular-nums">
            <span className="text-spark">{irrSummary.p10.toFixed(1)}</span>
            <span className="text-text-muted"> · </span>
            <span className="text-pulse">{irrSummary.p50.toFixed(1)}</span>
            <span className="text-text-muted"> · </span>
            <span className="text-agri">{irrSummary.p90.toFixed(1)}</span>
            <span className="text-text-muted text-base"> %</span>
          </span>
        </div>
      </div>

      {/* Histogram */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.7 }}
        className="rounded-md border border-[#1a1d24] bg-[#06070A] p-5"
      >
        <svg viewBox="0 0 700 220" className="block w-full" style={{ aspectRatio: '700/220' }}>
          {histogram.map((count, i) => {
            const h = (count / maxBucket) * 170;
            const x = 30 + i * 11;
            const irr = i * 0.5;
            const color = irr < 8 ? '#FF3D71' : irr < 11 ? '#FFB800' : irr < 14 ? '#7C5CFF' : '#5BD9A1';
            return (
              <motion.rect
                key={i}
                x={x}
                y={190 - h}
                width={9}
                height={h}
                fill={color}
                fillOpacity={0.85}
                initial={{ height: 0, y: 190 }}
                animate={inView ? { height: h, y: 190 - h } : {}}
                transition={{ duration: 0.6, delay: i * 0.005, ease: [0.16, 1, 0.3, 1] }}
              >
                <title>{irr.toFixed(1)}-{(irr + 0.5).toFixed(1)}% · {count} runs</title>
              </motion.rect>
            );
          })}
          {/* P-marker lines */}
          {[
            { v: irrSummary.p10, color: '#FF3D71', label: 'P10' },
            { v: irrSummary.p50, color: '#7C5CFF', label: 'P50' },
            { v: irrSummary.p90, color: '#5BD9A1', label: 'P90' },
            { v: 8, color: '#FFB800', label: 'covenant' },
          ].map((m, i) => {
            const x = 30 + (m.v / 0.5) * 11;
            return (
              <g key={i}>
                <line x1={x} x2={x} y1={20} y2={190} stroke={m.color} strokeWidth={1.4} strokeDasharray="3 3" />
                <text x={x + 3} y={20 + 14 * (i % 2)} fontSize={8.5} fontFamily="monospace" fill={m.color}>
                  {m.label} · {m.v.toFixed(1)}%
                </text>
              </g>
            );
          })}
          {/* X axis labels */}
          {[0, 5, 10, 15, 20, 25, 30].map((v) => {
            const x = 30 + (v / 0.5) * 11;
            return (
              <g key={v}>
                <text x={x} y={205} fontSize={9} fontFamily="monospace" fill="#6B7180" textAnchor="middle">
                  {v}%
                </text>
              </g>
            );
          })}
          <text x={350} y={216} fontSize={8.5} fontFamily="monospace" fill="#6B7180" textAnchor="middle">
            equity IRR distribution · 1,000 runs
          </text>
        </svg>
      </motion.div>

      {/* Outcome mix + summary stats */}
      <div className="mt-4 grid grid-cols-4 gap-3">
        <McSummary label="P10 NPV (25yr)" value={`€${(npvSummary.p10 / 1_000_000).toFixed(1)}M`} tone="spark" />
        <McSummary label="P50 NPV (25yr)" value={`€${(npvSummary.p50 / 1_000_000).toFixed(1)}M`} tone="pulse" />
        <McSummary label="P50 MoM Y10" value={`${momSummary.p50.toFixed(2)}×`} tone="agri" />
        <McSummary label="bankable runs" value={`${((runs.filter((r) => r.irrEquityPct >= 8).length / runs.length) * 100).toFixed(0)}%`} sub="IRR ≥ 8% covenant" tone="agri" />
      </div>

      {/* Outcome mix bar */}
      <div className="mt-3 flex h-6 overflow-hidden rounded-md border border-[#1a1d24]">
        <div
          className="flex items-center justify-center bg-spark/40 font-mono text-[9px] uppercase tracking-[0.22em] text-spark"
          style={{ width: `${outcomeMix.cancel * 100}%` }}
        >
          pantheon cancelled · {(outcomeMix.cancel * 100).toFixed(0)}%
        </div>
        <div
          className="flex items-center justify-center bg-sun/30 font-mono text-[9px] uppercase tracking-[0.22em] text-sun"
          style={{ width: `${outcomeMix.partial * 100}%` }}
        >
          partial · {(outcomeMix.partial * 100).toFixed(0)}%
        </div>
        <div
          className="flex items-center justify-center bg-agri/35 font-mono text-[9px] uppercase tracking-[0.22em] text-agri"
          style={{ width: `${outcomeMix.full * 100}%` }}
        >
          full Pantheon · {(outcomeMix.full * 100).toFixed(0)}%
        </div>
      </div>
    </div>
  );
}

function McSummary({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  tone: 'pulse' | 'sun' | 'agri' | 'signal' | 'spark';
}) {
  const t = {
    pulse: 'text-pulse border-pulse/30 bg-pulse/5',
    sun: 'text-sun border-sun/30 bg-sun/5',
    agri: 'text-agri border-agri/30 bg-agri/5',
    signal: 'text-signal border-signal/30 bg-signal/5',
    spark: 'text-spark border-spark/30 bg-spark/5',
  }[tone];
  return (
    <div className={cn('flex flex-col gap-0 rounded-md border bg-[#06070A] p-3', t)}>
      <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">{label}</span>
      <span className={cn('font-display text-xl tracking-tech-tight tabular-nums', t.split(' ')[0])}>
        {value}
      </span>
      {sub && (
        <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">{sub}</span>
      )}
    </div>
  );
}

/* ============================ FOOTER ============================ */

function Footer() {
  return (
    <div className="flex items-center justify-between border-t-2 border-[#1a1d24] bg-[#06070A] px-12 py-6">
      <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
        <Signal className="h-3 w-3 text-agri" strokeWidth={1.8} />
        sources · Jutarnji · Nacional · Tportal · Carić & Dujmović analysis · NOSBiH coupling roadmap · ENTSO-E TYNDP 2024 · public DC pipeline announcements
      </div>
      <Link
        to="/roi"
        className="group inline-flex items-center gap-3 rounded-md border border-border-bright bg-surface px-4 py-2 transition-all hover:border-pulse hover:shadow-glow-pulse"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-secondary group-hover:text-pulse">
          back to finance workbook
        </span>
        <ArrowUpRight className="h-3.5 w-3.5 text-text-secondary group-hover:text-pulse" strokeWidth={1.8} />
      </Link>
    </div>
  );
}
