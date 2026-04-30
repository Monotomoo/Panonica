import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ActivitySquare,
  AlertTriangle,
  ArrowRight,
  Cable,
  CheckCircle2,
  ListOrdered,
  Plug,
  Radio,
  ShieldCheck,
  Sigma,
  Waves,
  Zap,
} from 'lucide-react';
import { NumberTicker, cn } from '@paladian/ui';
import { Sourced } from '@/components/Sourced';
import { gridInfo } from '@/mock/grid';
import {
  curtailmentDrivers,
  curtailmentForecast,
  curtailmentHistory,
  curtailmentMitigations,
  gridCodeMatrix,
  gridQueue,
  pqEnvelope,
  queueStats,
  singleLineNodes,
  type GridCodeCheck,
} from '@/mock/gridDeep';

export function GridRoute() {
  return (
    <section className="flex min-h-full flex-col gap-10 px-12 py-12">
      {/* HERO — dual stat */}
      <div className="grid grid-cols-2 gap-10 border-b border-border pb-10">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
            <Plug className="h-3 w-3 text-pulse" strokeWidth={1.8} /> regional capacity
          </div>
          <div className="flex items-end gap-3">
            <div className="font-display text-[6rem] leading-none tracking-tech-tight text-pulse">
              <Sourced sourceId="oieh-slavonia">
                <NumberTicker value={2500} duration={1.6} triggerOnView={false} />
              </Sourced>
            </div>
            <div className="flex flex-col font-mono text-xs uppercase tracking-[0.22em] text-text-muted">
              <span>MW free</span>
              <span>pannonian croatia</span>
            </div>
          </div>
          <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
            source: {gridInfo.capacitySource}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
            connection queue · TS SLAVONSKI BROD 1
          </div>
          <div className="flex items-end gap-3">
            <div className="font-display text-[6rem] leading-none tracking-tech-tight text-signal">
              <Sourced sourceId="hep-queue-q1-2026">
                #
                <NumberTicker value={gridInfo.queuePosition} duration={1.4} triggerOnView={false} />
              </Sourced>
            </div>
            <div className="flex flex-col font-mono text-xs uppercase tracking-[0.22em] text-text-muted">
              <span>queue position</span>
              <span>est. 8–14 months</span>
            </div>
          </div>
          <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
            voltage level · 110/35 kV
          </div>
        </div>
      </div>

      {/* GRID DIAGRAM */}
      <div className="relative flex min-h-[280px] flex-col gap-3 rounded-lg border border-border bg-surface/30 p-8">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
          infrastructure link · kopanica-beravci → TS slavonski brod 1
        </div>
        <svg viewBox="0 0 1000 220" className="h-[220px] w-full">
          {/* Ground line */}
          <line
            x1={40}
            x2={960}
            y1={180}
            y2={180}
            className="stroke-border-bright"
            strokeWidth={0.6}
            strokeDasharray="4 4"
          />

          {/* Parcel marker (right side) */}
          <g transform="translate(880, 130)">
            <motion.rect
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              width={60}
              height={40}
              rx={3}
              className="fill-pulse/15 stroke-pulse"
              strokeWidth={1.2}
            />
            <text
              x={30}
              y={25}
              textAnchor="middle"
              className="fill-pulse font-mono"
              fontSize={10}
            >
              BERAVCI
            </text>
            <text
              x={30}
              y={64}
              textAnchor="middle"
              className="fill-text-muted font-mono"
              fontSize={9}
            >
              80.3 ha · 30 MWp
            </text>
          </g>

          {/* Substation marker (left side) */}
          <g transform="translate(40, 120)">
            <motion.g
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <polygon
                points="30,0 60,30 30,60 0,30"
                className="fill-signal/15 stroke-signal"
                strokeWidth={1.2}
              />
              <line x1={30} y1={10} x2={30} y2={50} className="stroke-signal" strokeWidth={0.8} />
              <line x1={10} y1={30} x2={50} y2={30} className="stroke-signal" strokeWidth={0.8} />
            </motion.g>
            <text
              x={30}
              y={80}
              textAnchor="middle"
              className="fill-signal font-mono"
              fontSize={10}
            >
              TS SLAVONSKI BROD 1
            </text>
            <text
              x={30}
              y={95}
              textAnchor="middle"
              className="fill-text-muted font-mono"
              fontSize={9}
            >
              110/35 kV
            </text>
          </g>

          {/* Cable run */}
          <motion.line
            x1={100}
            x2={880}
            y1={150}
            y2={150}
            className="stroke-signal"
            strokeWidth={1.2}
            strokeDasharray="6 4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
          />
          <text x={500} y={140} textAnchor="middle" className="fill-text-secondary font-mono" fontSize={10}>
            18.4 km · est. €620,000
          </text>

          {/* Pulse travelling along line */}
          <motion.circle
            r={3.5}
            className="fill-signal"
            initial={{ cx: 100, cy: 150, opacity: 0 }}
            animate={{ cx: [100, 880, 880], opacity: [0, 1, 0] }}
            transition={{ duration: 2.6, delay: 2.4, repeat: Infinity, repeatDelay: 1 }}
            style={{ filter: 'drop-shadow(0 0 3px rgb(0 217 255))' }}
          />
        </svg>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-4 gap-px overflow-hidden rounded-lg border border-border bg-border">
        {[
          { label: 'distance to ts', value: `${gridInfo.distanceKm} km`, tone: 'default' },
          { label: 'voltage level', value: gridInfo.voltage, tone: 'signal' },
          {
            label: 'est. cable cost',
            value: '€620,000',
            tone: 'default',
          },
          {
            label: 'conn. fee estimate',
            value: '€1.1M / MW',
            tone: 'default',
          },
          {
            label: 'regional capacity',
            value: `${gridInfo.regionalFreeCapacityMW.toLocaleString()} MW free`,
            tone: 'pulse',
          },
          { label: 'your max install', value: `${gridInfo.maxInstallMWp} MWp`, tone: 'sun' },
          {
            label: 'utilization',
            value: `${(gridInfo.regionalUtilization * 100).toFixed(0)}% · low`,
            tone: 'agri',
          },
          {
            label: 'processing time',
            value: `${gridInfo.estProcessingMonths[0]}–${gridInfo.estProcessingMonths[1]} months`,
            tone: 'default',
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.04, duration: 0.5 }}
            className="flex flex-col gap-2 bg-surface/60 p-6"
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
              {stat.label}
            </span>
            <span
              className={cn(
                'font-mono text-lg tabular-nums',
                stat.tone === 'pulse' && 'text-pulse',
                stat.tone === 'signal' && 'text-signal',
                stat.tone === 'sun' && 'text-sun',
                stat.tone === 'agri' && 'text-agri',
                stat.tone === 'default' && 'text-text-primary',
              )}
            >
              {stat.value}
            </span>
          </motion.div>
        ))}
      </div>

      {/* DEEP TABS */}
      <GridTabs />

      <div className="mt-4 flex justify-end">
        <Link
          to="/configurator"
          className="group inline-flex items-center gap-3 rounded-md border border-border-bright bg-surface px-5 py-3 transition-all hover:border-pulse hover:shadow-glow-pulse"
        >
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-text-secondary group-hover:text-pulse">
            configure your system
          </span>
          <ArrowRight
            className="h-4 w-4 text-text-secondary transition-transform group-hover:translate-x-0.5 group-hover:text-pulse"
            strokeWidth={1.8}
          />
        </Link>
      </div>
    </section>
  );
}

/* =============================== GRID TABS ============================== */

type GridTab = 'connection' | 'code' | 'curtailment' | 'queue';

function GridTabs() {
  const [tab, setTab] = useState<GridTab>('connection');

  const TABS: { key: GridTab; label: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }> }[] = [
    { key: 'connection', label: 'Connection', icon: Cable },
    { key: 'code', label: 'Grid code', icon: ShieldCheck },
    { key: 'curtailment', label: 'Curtailment', icon: Waves },
    { key: 'queue', label: 'Queue', icon: ListOrdered },
  ];

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface/30 p-6">
      <div className="flex items-center gap-1 border-b border-border pb-3">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'inline-flex items-center gap-2 rounded-sm px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors',
                active ? 'bg-pulse/15 text-pulse ring-1 ring-pulse/30' : 'text-text-muted hover:bg-surface hover:text-text-secondary',
              )}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
              {t.label}
            </button>
          );
        })}
      </div>

      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex-1"
      >
        {tab === 'connection' && <ConnectionTab />}
        {tab === 'code' && <GridCodeTab />}
        {tab === 'curtailment' && <CurtailmentTab />}
        {tab === 'queue' && <QueueTab />}
      </motion.div>
    </div>
  );
}

/* ============================ CONNECTION TAB ============================ */

function ConnectionTab() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
          single-line diagram · PV array → TS Slavonski Brod 1
        </span>
      </div>

      {/* Single-line SVG */}
      <div className="rounded-lg border border-border bg-surface/50 p-4 overflow-x-auto">
        <svg viewBox="0 0 1200 220" className="min-w-[900px] w-full h-[220px]">
          {/* Horizontal bus line */}
          <motion.line
            x1={60}
            y1={100}
            x2={1140}
            y2={100}
            stroke="rgb(42 42 48)"
            strokeWidth={1.2}
            strokeDasharray="3 3"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5 }}
          />

          {singleLineNodes.map((n, i) => {
            const toneColor = {
              pulse: 'rgb(124 92 255)',
              sun: 'rgb(255 184 0)',
              signal: 'rgb(0 217 255)',
              agri: 'rgb(74 222 128)',
              spark: 'rgb(255 61 113)',
            }[n.tone];
            return (
              <motion.g
                key={n.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.08 * i }}
              >
                {n.kind === 'source' && (
                  <g>
                    <rect x={n.x - 25} y={n.y - 20} width={50} height={40} rx={3} fill={toneColor} fillOpacity={0.15} stroke={toneColor} strokeWidth={1.3} />
                    <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize={10} className="font-mono" fill={toneColor}>PV</text>
                  </g>
                )}
                {n.kind === 'switch' && (
                  <g>
                    <rect x={n.x - 22} y={n.y - 15} width={44} height={30} rx={2} fill={toneColor} fillOpacity={0.12} stroke={toneColor} strokeWidth={1.2} />
                    <line x1={n.x - 10} y1={n.y} x2={n.x + 10} y2={n.y - 6} stroke={toneColor} strokeWidth={1.4} />
                  </g>
                )}
                {n.kind === 'trafo' && (
                  <g>
                    <circle cx={n.x - 8} cy={n.y} r={12} fill="none" stroke={toneColor} strokeWidth={1.3} />
                    <circle cx={n.x + 8} cy={n.y} r={12} fill="none" stroke={toneColor} strokeWidth={1.3} />
                  </g>
                )}
                {n.kind === 'protection' && (
                  <g>
                    <circle cx={n.x} cy={n.y} r={14} fill={toneColor} fillOpacity={0.12} stroke={toneColor} strokeWidth={1.3} />
                    <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize={9} className="font-mono" fill={toneColor}>87</text>
                  </g>
                )}
                {n.kind === 'meter' && (
                  <g>
                    <rect x={n.x - 18} y={n.y - 18} width={36} height={36} fill="none" stroke={toneColor} strokeWidth={1.3} />
                    <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize={9} className="font-mono" fill={toneColor}>kWh</text>
                  </g>
                )}
                {n.kind === 'grid' && (
                  <g>
                    <polygon points={`${n.x - 18},${n.y + 14} ${n.x + 18},${n.y + 14} ${n.x},${n.y - 18}`} fill={toneColor} fillOpacity={0.14} stroke={toneColor} strokeWidth={1.3} />
                  </g>
                )}

                {/* Labels */}
                <text x={n.x} y={n.y - 32} textAnchor="middle" fontSize={9} className="font-mono" fill={toneColor}>
                  {n.label}
                </text>
                <text x={n.x} y={n.y + 42} textAnchor="middle" fontSize={8} className="font-mono" fill="rgb(138 138 148)">
                  {n.subLabel}
                </text>
              </motion.g>
            );
          })}

          {/* Flow dot */}
          <motion.circle
            r={3.5}
            fill="rgb(0 217 255)"
            initial={{ cx: 60, cy: 100, opacity: 0 }}
            animate={{ cx: [60, 1140, 1140], opacity: [0, 1, 0] }}
            transition={{ duration: 4.2, delay: 1.5, repeat: Infinity, repeatDelay: 0.6 }}
            style={{ filter: 'drop-shadow(0 0 3px rgb(0 217 255))' }}
          />
        </svg>
      </div>

      {/* PQ envelope */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface/40 p-5">
          <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
            P-Q capability envelope at PCC
          </div>
          <div className="relative mx-auto h-[240px] w-full max-w-[360px]">
            <svg viewBox="-120 -120 240 240" className="h-full w-full">
              {/* axes */}
              <line x1={-100} y1={0} x2={100} y2={0} stroke="rgb(42 42 48)" strokeWidth={0.6} />
              <line x1={0} y1={-120} x2={0} y2={120} stroke="rgb(42 42 48)" strokeWidth={0.6} />
              <text x={95} y={-5} fontSize={7} className="fill-text-muted font-mono">+Q lag</text>
              <text x={-50} y={-105} fontSize={7} className="fill-text-muted font-mono">P (pu)</text>
              <text x={95} y={12} fontSize={7} className="fill-text-muted font-mono">−Q lead</text>

              {/* envelope polygon */}
              <motion.polygon
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                points={[
                  ...pqEnvelope.map((p) => `${p.qLag * 200},${-p.p * 100}`),
                  ...pqEnvelope.slice().reverse().map((p) => `${p.qLead * 200},${-p.p * 100}`),
                ].join(' ')}
                fill="rgb(74 222 128)"
                fillOpacity={0.12}
                stroke="rgb(74 222 128)"
                strokeWidth={1}
              />

              {/* operating point */}
              <motion.circle cx={12} cy={-92} r={3.5} fill="rgb(124 92 255)" initial={{ opacity: 0 }} animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} style={{ filter: 'drop-shadow(0 0 3px rgb(124 92 255))' }} />
              <text x={20} y={-90} fontSize={8} className="fill-pulse font-mono">op · 0.92 pu</text>
            </svg>
          </div>
          <div className="mt-2 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
            cos φ 0.93 leading/lagging at full P · green zone = compliant
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface/40 p-5">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
            design summary · PCC side
          </div>
          {[
            ['Point of Connection', 'TS Slavonski Brod 1 · 110/35 kV'],
            ['Export voltage', '35 kV · ring configuration'],
            ['Cable route', '18.4 km · Al 3×240 mm²'],
            ['Voltage rise (no load)', '2.2%'],
            ['Short-circuit level', 'Icc 12 kA · Icc peak 30 kA'],
            ['Reactive compensation', '6 MVAr · MV harmonic filter + Q bank'],
            ['Earthing', 'solidly grounded neutral via zig-zag'],
            ['Metering', 'class 0.2S · 4-quadrant · HOPS-read'],
          ].map(([k, v]) => (
            <div key={k} className="flex items-baseline justify-between border-b border-border/60 py-1.5 font-mono text-[11px]">
              <span className="text-[10px] uppercase tracking-[0.22em] text-text-muted">{k}</span>
              <span className="tabular-nums text-text-primary">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================ GRID CODE TAB ============================ */

function GridCodeTab() {
  const byCategory = {
    voltage: gridCodeMatrix.filter((r) => r.category === 'voltage'),
    frequency: gridCodeMatrix.filter((r) => r.category === 'frequency'),
    quality: gridCodeMatrix.filter((r) => r.category === 'quality'),
    comms: gridCodeMatrix.filter((r) => r.category === 'comms'),
    protection: gridCodeMatrix.filter((r) => r.category === 'protection'),
  };

  const passAll = gridCodeMatrix.every((r) => r.pass);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
          HOPS grid code 2024 rev.3 · IEC 61400-27 · IEC 61850-7-420
        </span>
        <span className={cn('font-mono text-[10px] uppercase tracking-[0.22em]', passAll ? 'text-agri' : 'text-spark')}>
          {passAll ? `✓ all ${gridCodeMatrix.length} checks pass` : `${gridCodeMatrix.filter((r) => r.pass).length}/${gridCodeMatrix.length} pass`}
        </span>
      </div>

      {(['voltage', 'frequency', 'quality', 'comms', 'protection'] as const).map((cat) => (
        <div key={cat}>
          <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.24em] text-pulse">
            {cat}
          </div>
          <div className="grid grid-cols-1 gap-2">
            {byCategory[cat].map((r) => (
              <GridCodeRow key={r.id} r={r} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function GridCodeRow({ r }: { r: GridCodeCheck }) {
  const tone = r.pass ? 'text-agri border-agri/30 bg-agri/5' : 'text-spark border-spark/30 bg-spark/5';
  const Icon = r.pass ? CheckCircle2 : AlertTriangle;
  return (
    <div className={cn('grid grid-cols-[24px_1.2fr_1.2fr_1.4fr_2fr] items-start gap-3 rounded-lg border p-3', tone)}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.6} />
      <div className="flex flex-col gap-0.5">
        <span className="font-mono text-[11px] text-text-primary">{r.rule}</span>
      </div>
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">{r.threshold}</span>
      <span className="font-mono text-[10px] text-text-primary">{r.beravciValue}</span>
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-secondary">{r.note}</span>
    </div>
  );
}

/* ============================ CURTAILMENT TAB =========================== */

function CurtailmentTab() {
  const chart = [...curtailmentHistory, ...curtailmentForecast];
  const max = Math.max(...chart.map((c) => c.ratePct));

  return (
    <div className="flex flex-col gap-6">
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
        curtailment history + forecast · Slavonia zone · TS Slavonski Brod 1
      </div>

      {/* Historical + Forecast bar chart */}
      <div className="rounded-lg border border-border bg-surface/40 p-5">
        <div className="flex items-end justify-between gap-1 h-36">
          {chart.map((c, i) => {
            const historical = (c as any).reason !== undefined;
            return (
              <div key={c.year} className="flex flex-1 flex-col items-center gap-1">
                <span className="font-mono text-[9px] tabular-nums text-text-muted">
                  {c.ratePct.toFixed(1)}%
                </span>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(c.ratePct / max) * 90}%` }}
                  transition={{ duration: 1, delay: 0.05 * i }}
                  className={cn('w-full rounded-t-sm', historical ? 'bg-signal' : 'bg-spark/80')}
                  style={{ minHeight: '4px' }}
                />
                <span className={cn('font-mono text-[9px] uppercase tracking-[0.2em]', historical ? 'text-signal' : 'text-spark')}>
                  {c.year}
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex items-center gap-4 font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-sm bg-signal" /> historical · observed
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-sm bg-spark" /> forecast · modeled
          </span>
          <span className="ml-auto">trend · +0.25pp/yr avg</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Drivers */}
        <div className="rounded-lg border border-border bg-surface/40 p-5">
          <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
            curtailment drivers · 2025 baseline
          </div>
          {curtailmentDrivers.map((d) => {
            const tone = { sun: 'bg-sun text-sun', pulse: 'bg-pulse text-pulse', signal: 'bg-signal text-signal', agri: 'bg-agri text-agri', spark: 'bg-spark text-spark' }[d.tone];
            return (
              <div key={d.label} className="flex items-center gap-3 py-2">
                <div className="flex-1">
                  <div className="flex items-baseline justify-between font-mono text-[11px]">
                    <span className="text-text-primary">{d.label}</span>
                    <span className={cn('tabular-nums', tone.split(' ')[1])}>{d.sharePct}%</span>
                  </div>
                  <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-border">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${d.sharePct}%` }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ duration: 1 }}
                      className={cn('h-full', tone.split(' ')[0])}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mitigations */}
        <div className="rounded-lg border border-border bg-surface/40 p-5">
          <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
            mitigation options · net savings vs baseline
          </div>
          {curtailmentMitigations.map((m) => {
            const tone = { pulse: 'text-pulse border-pulse/30 bg-pulse/5', agri: 'text-agri border-agri/30 bg-agri/5', signal: 'text-signal border-signal/30 bg-signal/5', sun: 'text-sun border-sun/30 bg-sun/5' }[m.tone];
            return (
              <div key={m.label} className={cn('flex items-baseline justify-between rounded-md border px-3 py-2 my-1.5', tone)}>
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono text-[11px] text-text-primary">{m.label}</span>
                  <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">capex · {m.capex}</span>
                </div>
                <span className={cn('font-display text-xl tracking-tech-tight', tone.split(' ')[0])}>
                  −{m.savingsPct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ============================== QUEUE TAB ============================== */

function QueueTab() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <QueueStat label="total projects" value={queueStats.totalProjects} />
        <QueueStat label="total capacity" value={`${(queueStats.totalCapacityMW / 1000).toFixed(2)} GW`} tone="pulse" />
        <QueueStat label="beravci rank" value={`#${queueStats.beravciPosition}`} tone="agri" />
        <QueueStat label="est. to connection" value={`${queueStats.estMonthsToConnection} mo`} tone="sun" />
      </div>

      <div className="rounded-lg border border-border bg-surface/40 p-5">
        <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
          HEP grid queue · top 16 of {queueStats.totalProjects} · TS Slavonski Brod 1
        </div>
        <div className="flex flex-col gap-1.5">
          {gridQueue.map((q, i) => (
            <motion.div
              key={q.position}
              initial={{ opacity: 0, x: -6 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.05 }}
              transition={{ duration: 0.3, delay: 0.03 * i }}
              className={cn(
                'grid grid-cols-[40px_1fr_120px_80px_100px] items-center gap-4 rounded-md border px-3 py-2.5',
                q.isBeravci ? 'border-pulse bg-pulse/10 shadow-glow-pulse' : 'border-border bg-surface/30',
              )}
            >
              <span
                className={cn(
                  'font-display text-lg tabular-nums',
                  q.isBeravci ? 'text-pulse' : 'text-text-muted',
                )}
              >
                #{q.position}
              </span>
              <div className="flex flex-col gap-0.5">
                <span
                  className={cn(
                    'font-mono text-[11px]',
                    q.isBeravci ? 'text-pulse font-semibold' : 'text-text-primary',
                  )}
                >
                  {q.project}
                </span>
                <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
                  {q.operator}
                </span>
              </div>
              <span className={cn('font-mono text-sm tabular-nums', q.isBeravci ? 'text-pulse' : 'text-text-secondary')}>
                {q.capacityMW} MW
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
                {q.submissionDate}
              </span>
              <span className={cn('font-mono text-[10px] uppercase tracking-[0.22em]', q.isBeravci ? 'text-agri' : 'text-text-secondary')}>
                {q.expectedConnection}
              </span>
            </motion.div>
          ))}
          <div className="pt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted text-center">
            · · · 46 more · last review 2026-04-15 · next review 2026-05-15
          </div>
        </div>
      </div>

      <div className="flex items-baseline gap-4 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
        <span>queue velocity</span>
        <span className="text-pulse">{queueStats.monthlyVelocity} positions/month</span>
        <span>review batch · {queueStats.reviewBatchMonthly} projects</span>
        <span className="ml-auto text-agri">Kopanica-Beravci est. promotion to #8 by Oct 2026</span>
      </div>
    </div>
  );
}

function QueueStat({ label, value, tone }: { label: string; value: string | number; tone?: 'pulse' | 'agri' | 'sun' }) {
  const t = tone ? { pulse: 'text-pulse', agri: 'text-agri', sun: 'text-sun' }[tone] : 'text-text-primary';
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border bg-surface/40 p-4">
      <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">{label}</span>
      <span className={cn('font-display text-2xl tracking-tech-tight', t)}>{value}</span>
    </div>
  );
}
