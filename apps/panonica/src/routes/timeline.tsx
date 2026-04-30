import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Calendar,
  Coins,
  Gauge,
  Leaf,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { cn } from '@paladian/ui';
import { TIMELINE_EVENTS, TIMELINE_TOTAL_MONTHS, KIND_COLORS, type TimelineEvent } from '@/mock/timelineEvents';
import { DnaGlyph } from '@/components/DnaGlyph';
import { useConfigStore } from '@/store/configStore';
import { useProjectStore } from '@/store/projectStore';
import { deriveBuilderBom, deriveBuilderFinance } from '@/lib/builderDerive';

/**
 * TIME MACHINE · drag Year 0 → 25 and watch the deal breathe.
 *
 * Revenue accumulates · panels degrade · sheep cycle · battery augments ·
 * refi and exit windows glow · DNA glyph morphs.
 *
 * This is the "single screen that contains the next 25 years of Ivan's life."
 */

export function TimelineRoute() {
  const [month, setMonth] = useState(17); // start at COD by default
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<1 | 2 | 5 | 10>(2); // months per tick
  const playRef = useRef<NodeJS.Timeout | null>(null);

  const project = useProjectStore();
  const configState = useConfigStore();
  const bom = useMemo(() => deriveBuilderBom(project), [project]);
  const finance = useMemo(() => deriveBuilderFinance(project, bom), [project, bom]);

  // Auto-play
  useEffect(() => {
    if (!playing) {
      if (playRef.current) clearInterval(playRef.current);
      return;
    }
    playRef.current = setInterval(() => {
      setMonth((m) => {
        const next = m + speed;
        if (next >= TIMELINE_TOTAL_MONTHS) {
          setPlaying(false);
          return TIMELINE_TOTAL_MONTHS;
        }
        return next;
      });
    }, 140);
    return () => {
      if (playRef.current) clearInterval(playRef.current);
    };
  }, [playing, speed]);

  const year = month / 12;
  const yearsCompleted = Math.max(0, year - 17 / 12); // years of operation post-COD
  const phase =
    month < 17 ? 'construction' :
    month < 60 ? 'early-operations' :
    month < 120 ? 'stable' :
    month < 180 ? 'mid-life' :
    month < 260 ? 'late-life' : 'end-of-life';

  // Cumulative revenue (degradation-adjusted)
  const cumulativeRevenue = useMemo(() => {
    if (month < 17) return 0;
    let total = 0;
    for (let y = 0; y < yearsCompleted; y++) {
      const degr = Math.pow(1 - (project.generation.moduleAnnualDegradationPct / 100), y);
      const infl = Math.pow(1 + (project.finance.inflationRatePct / 100), y);
      total += finance.annualRevenueEur * degr * infl;
    }
    return total;
  }, [month, yearsCompleted, finance.annualRevenueEur, project]);

  const cumulativeYieldGwh = (finance.annualYieldGwh * Math.max(0, yearsCompleted));
  const cumulativeCo2 = (project.esgExit.crcfCarbonCreditAnnualTco2 * Math.max(0, yearsCompleted));
  const capacityRemainingPct = 100 - Math.max(0, year - 17 / 12) * project.generation.moduleAnnualDegradationPct;
  const currentYearIdx = Math.floor(year);

  // Active event (one currently happening · closest before or equal to month)
  const recentEvent = useMemo(() => {
    const past = TIMELINE_EVENTS.filter((e) => e.month <= month);
    return past[past.length - 1];
  }, [month]);

  // Upcoming events
  const upcoming = useMemo(() => TIMELINE_EVENTS.filter((e) => e.month > month).slice(0, 4), [month]);

  // Milestones in the bar
  const milestones = useMemo(() => TIMELINE_EVENTS.filter((e) => e.milestone), []);

  const progress = month / TIMELINE_TOTAL_MONTHS;

  const reset = () => {
    setMonth(0);
    setPlaying(false);
  };

  const scrubToEvent = (eventMonth: number) => {
    setMonth(eventMonth);
    setPlaying(false);
  };

  return (
    <section className="relative flex h-[calc(100vh-2.75rem)] flex-col overflow-hidden bg-canvas">
      {/* Ambient background · shifts by phase */}
      <AmbientBackground phase={phase} progress={progress} />

      {/* TOP · hero numbers + DNA */}
      <div className="relative z-10 grid grid-cols-[1fr_auto] gap-6 border-b border-border px-12 py-8">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.26em] text-text-muted">
            <Calendar className="h-3.5 w-3.5 text-pulse animate-pulse-dot" strokeWidth={1.8} />
            time machine · phase {phase} · {cumulativeRevenue > 0 ? `€${(cumulativeRevenue / 1_000_000).toFixed(1)}M cumulative` : 'pre-COD'}
          </div>

          <div className="flex items-baseline gap-5">
            <motion.span
              key={currentYearIdx}
              initial={{ opacity: 0.4, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="font-display text-[8rem] leading-none tracking-tech-tight text-text-primary"
            >
              {year < 1 ? `M${month}` : `Y${Math.floor(year)}`}
            </motion.span>
            <div className="flex flex-col gap-1 font-mono text-[11px] uppercase tracking-[0.22em] text-text-muted">
              <span>month {month} / {TIMELINE_TOTAL_MONTHS}</span>
              <span className="text-pulse">{yearsFromNow(year)}</span>
              <span>{phaseNarration(phase)}</span>
            </div>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-3 md:grid-cols-4">
            <MetricCell label="Cumulative revenue" value={`€${(cumulativeRevenue / 1_000_000).toFixed(1)}M`} icon={Coins} tone="sun" />
            <MetricCell label="Cumulative yield" value={`${cumulativeYieldGwh.toFixed(0)} GWh`} icon={Zap} tone="agri" />
            <MetricCell label="CO₂ avoided" value={`${(cumulativeCo2 / 1000).toFixed(1)}k t`} icon={Leaf} tone="agri" />
            <MetricCell label="Capacity remaining" value={`${capacityRemainingPct.toFixed(1)}%`} icon={Gauge} tone={capacityRemainingPct > 85 ? 'pulse' : capacityRemainingPct > 70 ? 'sun' : 'spark'} />
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-3">
          <DnaGlyph config={configState} size={140} />
          <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
            deal DNA · at Y{Math.floor(year)}
          </span>
        </div>
      </div>

      {/* MIDDLE · event highlight + upcoming */}
      <div className="relative z-10 grid flex-1 grid-cols-[2fr_1fr] gap-0 overflow-hidden border-b border-border">
        {/* Main active event */}
        <div className="flex flex-col justify-center gap-5 border-r border-border px-12 py-8">
          <AnimatePresence mode="wait">
            {recentEvent && (
              <motion.div
                key={recentEvent.month + '-' + recentEvent.label}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col gap-3"
              >
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.26em] text-text-muted">
                  <span className={cn(
                    'inline-block h-2 w-2 rounded-full animate-pulse-dot',
                    `bg-${KIND_COLORS[recentEvent.kind]}`,
                  )} />
                  {recentEvent.kind} · month {recentEvent.month} · Y{(recentEvent.month / 12).toFixed(1)}
                </div>
                <h2 className={cn(
                  'font-display text-[clamp(2.2rem,4.8vw,4.2rem)] font-light uppercase leading-[1] tracking-tech-tight',
                  `text-${KIND_COLORS[recentEvent.kind]}`,
                )}>
                  {recentEvent.label}
                </h2>
                <p className="max-w-3xl font-mono text-[13px] leading-relaxed text-text-secondary">
                  {recentEvent.detail}
                </p>
                {recentEvent.milestone && (
                  <span className="inline-flex w-fit items-center gap-2 rounded-md border border-pulse/40 bg-pulse/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-pulse">
                    <Sparkles className="h-3 w-3" strokeWidth={1.8} />
                    milestone
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Upcoming feed */}
        <div className="flex flex-col gap-2 overflow-y-auto px-6 py-8 bg-surface/20">
          <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
            <ArrowRight className="h-3.5 w-3.5 text-pulse" strokeWidth={1.8} />
            upcoming · next 4
          </div>
          {upcoming.length === 0 ? (
            <div className="rounded-md border border-border/60 bg-surface/30 p-4 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
              end of modeled life · Y25
            </div>
          ) : (
            upcoming.map((e, i) => (
              <motion.button
                key={e.month + '-' + i}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: 0.04 * i }}
                onClick={() => scrubToEvent(e.month)}
                className="flex flex-col gap-1 rounded-md border border-border/60 bg-surface/40 p-3 text-left transition-all hover:border-pulse hover:bg-pulse/5"
              >
                <div className="flex items-baseline justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.22em]">
                  <span className={`text-${KIND_COLORS[e.kind]}`}>{e.label}</span>
                  <span className="text-text-muted tabular-nums">
                    +{Math.max(0, e.month - month)}m
                  </span>
                </div>
                <span className="font-mono text-[10px] leading-snug text-text-secondary">
                  {e.detail.slice(0, 90)}{e.detail.length > 90 && '…'}
                </span>
              </motion.button>
            ))
          )}
        </div>
      </div>

      {/* BOTTOM · the scrubber */}
      <div className="relative z-10 flex flex-col gap-4 border-t border-border bg-surface/40 px-12 py-6 backdrop-blur">
        {/* Play controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setPlaying((p) => !p)}
            className={cn(
              'inline-flex items-center gap-2 rounded-md border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.22em] transition-all',
              playing
                ? 'border-spark/40 bg-spark/10 text-spark'
                : 'border-agri/40 bg-agri/10 text-agri hover:shadow-glow-pulse',
            )}
          >
            {playing ? <Pause className="h-3 w-3" strokeWidth={2} /> : <Play className="h-3 w-3" strokeWidth={2} />}
            {playing ? 'pause' : 'play'}
          </button>

          <div className="flex items-center gap-1 rounded-md border border-border bg-canvas p-1">
            {([1, 2, 5, 10] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={cn(
                  'rounded-sm px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors',
                  speed === s
                    ? 'bg-pulse/15 text-pulse'
                    : 'text-text-muted hover:text-text-secondary',
                )}
              >
                {s}×
              </button>
            ))}
          </div>

          <button
            onClick={reset}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted transition-colors hover:border-pulse hover:text-pulse"
          >
            <RotateCcw className="h-3 w-3" strokeWidth={1.8} />
            reset
          </button>

          <div className="ml-auto flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
            <button onClick={() => scrubToEvent(0)} className="hover:text-pulse">M0 · start</button>
            <span>·</span>
            <button onClick={() => scrubToEvent(17)} className="hover:text-agri">Y1 · COD</button>
            <span>·</span>
            <button onClick={() => scrubToEvent(120)} className="hover:text-sun">Y10 · exit</button>
            <span>·</span>
            <button onClick={() => scrubToEvent(300)} className="hover:text-pulse">Y25 · EOL</button>
          </div>
        </div>

        {/* The scrubber bar */}
        <div className="relative h-14">
          {/* Phase bands */}
          <div className="absolute inset-0 flex rounded-md overflow-hidden border border-border/60">
            <div className="h-full bg-pulse/10" style={{ width: `${(17 / TIMELINE_TOTAL_MONTHS) * 100}%` }} title="Construction" />
            <div className="h-full bg-agri/10" style={{ width: `${(43 / TIMELINE_TOTAL_MONTHS) * 100}%` }} title="Early ops" />
            <div className="h-full bg-agri/5" style={{ width: `${(60 / TIMELINE_TOTAL_MONTHS) * 100}%` }} title="Stable" />
            <div className="h-full bg-sun/10" style={{ width: `${(60 / TIMELINE_TOTAL_MONTHS) * 100}%` }} title="Mid-life · exit window" />
            <div className="h-full bg-pulse/5" style={{ width: `${(80 / TIMELINE_TOTAL_MONTHS) * 100}%` }} title="Late-life" />
            <div className="h-full bg-spark/10 flex-1" title="End-of-life" />
          </div>

          {/* Milestone markers */}
          {milestones.map((e, i) => {
            const left = (e.month / TIMELINE_TOTAL_MONTHS) * 100;
            return (
              <button
                key={i}
                onClick={() => scrubToEvent(e.month)}
                className={cn(
                  'absolute top-0 h-full flex w-1 -translate-x-1/2 items-center justify-center',
                  `bg-${KIND_COLORS[e.kind]}`,
                )}
                style={{ left: `${left}%` }}
                title={e.label}
              >
                <span className={cn(
                  'absolute -top-1 h-3 w-3 rounded-full ring-2 ring-canvas',
                  `bg-${KIND_COLORS[e.kind]}`,
                )} />
              </button>
            );
          })}

          {/* Current-month indicator */}
          <motion.div
            className="absolute top-0 bottom-0 w-0.5 bg-pulse shadow-[0_0_8px_rgb(124_92_255)]"
            style={{ left: `${progress * 100}%` }}
            animate={{ opacity: playing ? [0.6, 1, 0.6] : 1 }}
            transition={{ duration: 1, repeat: playing ? Infinity : 0 }}
          >
            <div className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full bg-pulse shadow-glow-pulse" />
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-sm bg-pulse px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.22em] text-canvas">
              M{month} · Y{year.toFixed(1)}
            </div>
          </motion.div>

          {/* Range slider (invisible but clickable over the whole bar) */}
          <input
            type="range"
            min={0}
            max={TIMELINE_TOTAL_MONTHS}
            value={month}
            step={1}
            onChange={(e) => { setMonth(parseInt(e.target.value, 10)); setPlaying(false); }}
            className="absolute inset-0 h-full w-full cursor-grab appearance-none bg-transparent opacity-0"
          />
        </div>

        {/* Phase labels */}
        <div className="grid grid-cols-6 gap-0 font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
          <span className="text-pulse">construction</span>
          <span className="text-agri">early ops</span>
          <span>stable</span>
          <span className="text-sun">exit window</span>
          <span>late-life</span>
          <span className="text-spark">EOL</span>
        </div>
      </div>
    </section>
  );
}

/* ============================== HELPERS =============================== */

function MetricCell({ label, value, icon: Icon, tone }: { label: string; value: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; tone: 'pulse' | 'sun' | 'agri' | 'signal' | 'spark' }) {
  const toneCls = { pulse: 'text-pulse border-pulse/30 bg-pulse/5', sun: 'text-sun border-sun/30 bg-sun/5', agri: 'text-agri border-agri/30 bg-agri/5', signal: 'text-signal border-signal/30 bg-signal/5', spark: 'text-spark border-spark/30 bg-spark/5' }[tone];
  return (
    <div className={cn('flex items-center gap-3 rounded-md border p-3', toneCls)}>
      <Icon className={cn('h-4 w-4 shrink-0', toneCls.split(' ')[0])} strokeWidth={1.6} />
      <div className="flex flex-col gap-0.5">
        <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
          {label}
        </span>
        <motion.span
          key={value}
          initial={{ opacity: 0.5, y: -2 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className={cn('font-display text-xl tracking-tech-tight', toneCls.split(' ')[0])}
        >
          {value}
        </motion.span>
      </div>
    </div>
  );
}

function AmbientBackground({ phase, progress }: { phase: string; progress: number }) {
  // Radial bloom that shifts hue as the deal ages
  const hue =
    phase === 'construction' ? 210 :
    phase === 'early-operations' ? 142 :
    phase === 'stable' ? 142 :
    phase === 'mid-life' ? 38 :
    phase === 'late-life' ? 270 : 350;
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <motion.div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          background: `radial-gradient(ellipse 100% 60% at ${50 + progress * 30}% 30%, hsla(${hue}, 75%, 55%, 1), transparent 70%)`,
        }}
        animate={{ opacity: [0.06, 0.12, 0.06] }}
        transition={{ duration: 6, repeat: Infinity }}
      />
    </div>
  );
}

function yearsFromNow(year: number): string {
  const now = new Date();
  const future = new Date(now);
  future.setMonth(now.getMonth() + Math.floor(year * 12));
  return future.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
}

function phaseNarration(phase: string): string {
  switch (phase) {
    case 'construction': return 'building · pre-COD';
    case 'early-operations': return 'ramp · first cashflows';
    case 'stable': return 'mature · base case';
    case 'mid-life': return 'exit window open';
    case 'late-life': return 'debt-free · refresh cycle';
    default: return 'end of life · repower decision';
  }
}
