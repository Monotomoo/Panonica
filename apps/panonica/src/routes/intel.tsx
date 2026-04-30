import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowRight,
  Coins,
  Database,
  FileSearch2,
  Info,
  LineChart,
  Map as MapIcon,
  Newspaper,
  Plug,
  Radio,
  Target,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@paladian/ui';
import { ConcessioCrossLink } from '@/components/ConcessioCrossLink';
import { LiveNewsTicker } from '@/components/LiveNewsTicker';
import {
  activityFeed,
  architectureEdges,
  architectureNodes,
  intelMeta,
  intelSources,
  pipelineExplain,
  type IntelSource,
} from '@/mock/intel';

const ICON_MAP: Record<IntelSource['icon'], LucideIcon> = {
  coins: Coins,
  target: Target,
  plug: Plug,
  line: LineChart,
  map: MapIcon,
  newspaper: Newspaper,
};

export function IntelRoute() {
  return (
    <section className="flex min-h-full flex-col">
      <StatusHeader />
      <PlaceholderBanner />
      <div className="px-12 pt-6">
        <LiveNewsTicker />
      </div>
      <SourcesGrid />
      <ActivityFeedSection />
      <ArchitectureDiagram />
      <FooterCta />
    </section>
  );
}

/* ---------------------------- STATUS HEADER ------------------------------ */

function StatusHeader() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 3000);
    return () => clearInterval(id);
  }, []);

  const syncLabel = [intelMeta.lastSyncRelative, `${(2 + tick) % 5}s`, '27s', '1m 14s'][tick % 4];

  return (
    <div className="flex items-baseline justify-between border-b border-border px-12 py-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
          <span className="relative inline-flex h-2 w-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-agri/60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-agri" />
          </span>
          operational · {intelMeta.sourcesMonitored} sources monitored
        </div>
        <h1 className="font-display text-3xl uppercase tracking-tech-tight text-text-primary">
          intel
        </h1>
        <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-text-secondary">
          continuous market + regulatory surveillance · last sync {syncLabel}
        </div>
      </div>

      <div className="hidden grid-cols-3 gap-6 md:grid">
        <HeaderStat label="records · 24h" value={intelMeta.recordsIngestedLast24h.toLocaleString()} tone="pulse" />
        <HeaderStat label="alerts · week" value={intelMeta.alertsThisWeek.toString()} tone="sun" />
        <HeaderStat label="digest → " value="ivan@paladina" tone="agri" truncate />
      </div>
    </div>
  );
}

function HeaderStat({ label, value, tone, truncate }: { label: string; value: string; tone: 'pulse' | 'sun' | 'agri'; truncate?: boolean }) {
  const t = { pulse: 'text-pulse', sun: 'text-sun', agri: 'text-agri' }[tone];
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
        {label}
      </span>
      <span className={cn('font-display text-xl tracking-tech-tight', t, truncate && 'truncate max-w-[180px]')}>
        {value}
      </span>
    </div>
  );
}

/* --------------------------- PLACEHOLDER BANNER --------------------------- */

function PlaceholderBanner() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="mx-12 mt-6 flex items-start gap-3 rounded-lg border border-sun/30 bg-sun/5 px-5 py-4"
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-sun" strokeWidth={1.8} />
      <div className="flex flex-col gap-1.5">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-sun">
          demo · snapshot mode
        </div>
        <p className="font-mono text-[11px] leading-relaxed text-text-secondary">
          This screen shows a captured snapshot from{' '}
          <span className="text-text-primary">2026-04-17 22:14 UTC</span>. In production the pipeline
          polls every 15 min, writes to Supabase, emails a Friday digest to the operator, and fires
          webhooks on critical deadlines. Architecture diagram at the bottom.
        </p>
      </div>
    </motion.div>
  );
}

/* ----------------------------- SOURCES GRID ------------------------------ */

function SourcesGrid() {
  return (
    <div className="px-12 pt-8">
      <div className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
        <Radio className="h-3.5 w-3.5 text-pulse" strokeWidth={1.8} />
        feeds · {intelSources.length} monitored
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {intelSources.map((s, i) => (
          <SourceCard key={s.id} source={s} index={i} />
        ))}
      </div>
    </div>
  );
}

function SourceCard({ source, index }: { source: IntelSource; index: number }) {
  const Icon = ICON_MAP[source.icon];
  const toneClass = {
    pulse: 'text-pulse border-pulse/30',
    sun: 'text-sun border-sun/30',
    signal: 'text-signal border-signal/30',
    agri: 'text-agri border-agri/30',
    spark: 'text-spark border-spark/30',
  }[source.tone];
  const bgClass = {
    pulse: 'bg-pulse/5',
    sun: 'bg-sun/5',
    signal: 'bg-signal/5',
    agri: 'bg-agri/5',
    spark: 'bg-spark/5',
  }[source.tone];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay: 0.05 + index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className={cn('flex flex-col gap-4 rounded-lg border p-5 backdrop-blur', toneClass, bgClass)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <Icon className={cn('h-4 w-4', toneClass.split(' ')[0])} strokeWidth={1.6} />
          <div className="flex flex-col">
            <span className={cn('font-display text-base uppercase tracking-tech-tight', toneClass.split(' ')[0])}>
              {source.label}
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
              {source.provider}
            </span>
          </div>
        </div>
        <StatusPill status={source.status} />
      </div>

      <div className="flex flex-col gap-1.5 border-t border-border/60 pt-3">
        <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
          {source.primaryMetric}
        </span>
        <span className="font-display text-2xl tracking-tech-tight text-text-primary">
          {source.primaryValue}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-secondary">
          {source.subline}
        </span>
      </div>

      {source.nextDeadline && (
        <div className="flex items-baseline justify-between rounded-md border border-border/50 bg-surface/40 p-3">
          <div className="flex flex-col">
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
              next · {source.nextDeadline.label}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-primary">
              {source.nextDeadline.dateIso}
            </span>
          </div>
          <span
            className={cn(
              'font-display text-lg tracking-tech-tight',
              source.nextDeadline.daysAway < 30
                ? 'text-spark'
                : source.nextDeadline.daysAway < 90
                  ? 'text-sun'
                  : 'text-text-secondary',
            )}
          >
            T−{source.nextDeadline.daysAway}d
          </span>
        </div>
      )}

      <div className="flex items-center gap-2">
        <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
          confidence
        </span>
        <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-border">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${source.confidence * 100}%` }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.2, delay: 0.2 + index * 0.05, ease: [0.16, 1, 0.3, 1] }}
            className={cn('h-full', toneClass.split(' ')[0].replace('text-', 'bg-'))}
          />
        </div>
        <span className="font-mono text-[10px] tabular-nums text-text-secondary">
          {(source.confidence * 100).toFixed(0)}%
        </span>
      </div>
    </motion.div>
  );
}

function StatusPill({ status }: { status: 'live' | 'stale' | 'error' }) {
  const map = {
    live: { label: 'LIVE', tone: 'text-agri bg-agri/10 border-agri/30' },
    stale: { label: 'STALE', tone: 'text-sun bg-sun/10 border-sun/30' },
    error: { label: 'ERROR', tone: 'text-spark bg-spark/10 border-spark/30' },
  }[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.22em]',
        map.tone,
      )}
    >
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-current animate-pulse-dot" />
      {map.label}
    </span>
  );
}

/* ---------------------------- ACTIVITY FEED ------------------------------ */

function ActivityFeedSection() {
  const [filter, setFilter] = useState<'all' | 'alert' | 'critical'>('all');
  const filtered = activityFeed.filter((e) => filter === 'all' || e.severity === filter || (filter === 'alert' && e.severity === 'critical'));

  return (
    <div className="mt-10 px-12">
      <div className="mb-4 flex items-baseline justify-between">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
          <Zap className="h-3.5 w-3.5 text-spark" strokeWidth={1.8} />
          activity feed · live-ordered
        </div>
        <div className="flex gap-1 rounded-md border border-border bg-surface p-1">
          {(['all', 'alert', 'critical'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'rounded-sm px-3 py-1 font-mono text-[9px] uppercase tracking-[0.2em] transition-colors',
                filter === f
                  ? 'bg-pulse/15 text-pulse'
                  : 'text-text-muted hover:text-text-secondary',
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface/30 p-4">
        {filtered.map((e, i) => (
          <motion.div
            key={e.iso}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: i * 0.04 }}
            className={cn(
              'group flex items-start gap-3 rounded-md border border-transparent px-3 py-2.5 transition-colors hover:border-border hover:bg-surface/50',
              e.severity === 'critical' && 'bg-spark/5',
            )}
          >
            <span className="mt-0.5 inline-flex w-16 shrink-0 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted tabular-nums">
              {e.relative}
            </span>
            <SeverityBadge severity={e.severity} />
            <SourceTag sourceId={e.sourceId} />
            <span className="flex-1 font-mono text-[11px] leading-relaxed text-text-secondary">
              {e.text}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: 'info' | 'alert' | 'critical' }) {
  const map = {
    info: { icon: Info, color: 'text-text-muted' },
    alert: { icon: AlertTriangle, color: 'text-sun' },
    critical: { icon: AlertTriangle, color: 'text-spark' },
  }[severity];
  const Icon = map.icon;
  return <Icon className={cn('mt-0.5 h-3.5 w-3.5 shrink-0', map.color)} strokeWidth={1.8} />;
}

function SourceTag({ sourceId }: { sourceId: string }) {
  const src = intelSources.find((s) => s.id === sourceId);
  if (!src) return null;
  const toneClass = {
    pulse: 'text-pulse bg-pulse/10',
    sun: 'text-sun bg-sun/10',
    signal: 'text-signal bg-signal/10',
    agri: 'text-agri bg-agri/10',
    spark: 'text-spark bg-spark/10',
  }[src.tone];
  return (
    <span
      className={cn(
        'inline-flex w-24 shrink-0 items-center justify-center rounded-sm px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.22em]',
        toneClass,
      )}
    >
      {src.label}
    </span>
  );
}

/* -------------------------- ARCHITECTURE DIAGRAM -------------------------- */

function ArchitectureDiagram() {
  return (
    <div className="mt-10 px-12">
      <div className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
        <Database className="h-3.5 w-3.5 text-pulse" strokeWidth={1.8} />
        pipeline · sources → scraper → supabase → alerts
      </div>

      <div className="rounded-lg border border-border bg-surface/40 p-8">
        <div className="relative h-[150px] w-full overflow-hidden">
          <svg viewBox="0 0 700 150" className="h-full w-full">
            {/* Edges */}
            {architectureEdges.map((e) => {
              const from = architectureNodes.find((n) => n.id === e.from)!;
              const to = architectureNodes.find((n) => n.id === e.to)!;
              return (
                <g key={`${e.from}-${e.to}`}>
                  <motion.line
                    x1={from.x + 60}
                    y1={from.y + 20}
                    x2={to.x}
                    y2={to.y + 20}
                    stroke="rgb(42 42 48)"
                    strokeWidth={1}
                    initial={{ pathLength: 0, opacity: 0 }}
                    whileInView={{ pathLength: 1, opacity: 1 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 1.2, delay: 0.3 }}
                  />
                  <motion.circle
                    r={2.5}
                    fill="rgb(124 92 255)"
                    initial={{ cx: from.x + 60, cy: from.y + 20, opacity: 0 }}
                    animate={{
                      cx: [from.x + 60, to.x, to.x],
                      cy: [from.y + 20, to.y + 20, to.y + 20],
                      opacity: [0, 1, 0],
                    }}
                    transition={{ duration: 2.4, delay: 1 + Math.random() * 0.8, repeat: Infinity, repeatDelay: 1.6 }}
                    style={{ filter: 'drop-shadow(0 0 2px rgb(124 92 255))' }}
                  />
                </g>
              );
            })}

            {/* Nodes */}
            {architectureNodes.map((n, i) => (
              <motion.g
                key={n.id}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.12 }}
              >
                <rect
                  x={n.x}
                  y={n.y}
                  width={140}
                  height={40}
                  rx={4}
                  fill="rgb(17 17 19)"
                  stroke="rgb(124 92 255)"
                  strokeWidth={1.1}
                  strokeOpacity={0.5}
                />
                <text
                  x={n.x + 70}
                  y={n.y + 24}
                  textAnchor="middle"
                  className="fill-text-secondary font-mono"
                  fontSize={10}
                >
                  {n.label}
                </text>
              </motion.g>
            ))}
          </svg>
        </div>

        <p className="mt-6 max-w-4xl font-mono text-[11px] leading-relaxed text-text-secondary">
          {pipelineExplain}
        </p>

        <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-4">
          <PipelineStat label="languages" value="3" sub="HR / EN / DE" />
          <PipelineStat label="poll cadence" value="15 min" sub="news · market · grid" tone="pulse" />
          <PipelineStat label="storage" value="Supabase" sub="postgres · rls · RPC" tone="signal" />
          <PipelineStat label="delivery" value="email + webhook" sub="fri digest · critical pages" tone="agri" />
        </div>
      </div>

      {/* Sibling product · Concessio cross-link */}
      <div className="mt-8">
        <div className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
          <FileSearch2 className="h-3.5 w-3.5 text-pulse" strokeWidth={1.8} />
          sibling product · paladina\'s other deals
        </div>
        <ConcessioCrossLink />
      </div>
    </div>
  );
}

function PipelineStat({
  label,
  value,
  sub,
  tone = 'default',
}: {
  label: string;
  value: string;
  sub: string;
  tone?: 'default' | 'pulse' | 'signal' | 'agri';
}) {
  const t = {
    default: 'text-text-primary',
    pulse: 'text-pulse',
    signal: 'text-signal',
    agri: 'text-agri',
  }[tone];
  return (
    <div className="flex flex-col gap-1 rounded-md border border-border bg-surface/40 p-4">
      <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
        {label}
      </span>
      <span className={cn('font-display text-xl tracking-tech-tight', t)}>{value}</span>
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
        {sub}
      </span>
    </div>
  );
}

/* -------------------------------- FOOTER --------------------------------- */

function FooterCta() {
  return (
    <div className="mt-10 flex justify-end border-t border-border px-12 py-6">
      <Link
        to="/thesis"
        className="group inline-flex items-center gap-3 rounded-md border border-border-bright bg-surface px-5 py-3 transition-all hover:border-pulse hover:shadow-glow-pulse"
      >
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-text-secondary group-hover:text-pulse">
          compile thesis dossier
        </span>
        <ArrowRight
          className="h-4 w-4 text-text-secondary transition-transform group-hover:translate-x-0.5 group-hover:text-pulse"
          strokeWidth={1.8}
        />
      </Link>
    </div>
  );
}
