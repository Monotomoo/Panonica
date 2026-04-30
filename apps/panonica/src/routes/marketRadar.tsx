import { useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  ArrowUpRight,
  Award,
  Coins,
  Crosshair,
  Globe,
  Plug,
  Radar,
  Target,
  Trophy,
  Zap,
} from 'lucide-react';
import { cn } from '@paladian/ui';
import { Sparkline } from '@/components/Sparkline';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ReferenceArea,
  ReferenceLine,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar as RechartsRadar,
} from 'recharts';
import {
  allPannonianProjects,
  fzoeuPool,
  strategicRadar,
  type Comparable,
} from '@/mock/finance';

/**
 * Market Radar — Wave 2 · competitive intel screen.
 *
 * The question this answers for Ivan: "Where does my deal stand vs the 17 other
 * Pannonian solar projects competing for the same grid capacity + subsidy pool
 * right now?" Everything is visualized relative to Kopanica-Beravci.
 *
 * Sections:
 *   1. Header hero · "you are #X of 18"
 *   2. Animated bubble chart · €/MW vs IRR · sized by MW · highlighted
 *   3. Strategic radar · 8 axes · you vs market avg
 *   4. FZOEU pool splitter · €42M pie with Kopanica-Beravci slice
 *   5. Head-to-head · 3 nearest rivals with diff arrows
 *   6. Footer · macro context + link to configurator
 */

export function MarketRadarRoute() {
  return (
    <section className="flex min-h-full flex-col">
      <Hero />
      <BubbleSection />
      <StrategicRadarSection />
      <FzoeuPoolSection />
      <HeadToHead />
      <Footer />
    </section>
  );
}

/* =============================== HERO =============================== */

function Hero() {
  const deal = allPannonianProjects.find((p) => p.isBeravci)!;
  const rankByIrr = useMemo(
    () =>
      [...allPannonianProjects]
        .sort((a, b) => b.irrEquity - a.irrEquity)
        .findIndex((p) => p.isBeravci) + 1,
    [],
  );
  const rankByCapex = useMemo(
    () =>
      [...allPannonianProjects]
        .sort((a, b) => a.capexPerMW - b.capexPerMW)
        .findIndex((p) => p.isBeravci) + 1,
    [],
  );

  return (
    <div className="relative flex flex-col overflow-hidden border-b border-border bg-gradient-to-br from-pulse/5 via-canvas to-canvas px-12 py-14">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute right-[10%] top-[15%] h-[360px] w-[360px] rounded-full bg-pulse/10 blur-[140px]" />
        <div className="absolute left-[6%] bottom-[15%] h-[280px] w-[280px] rounded-full bg-agri/10 blur-[120px]" />
      </div>

      <div className="relative z-10 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-text-muted">
        <Radar className="h-3.5 w-3.5 text-pulse animate-pulse-dot" strokeWidth={1.8} />
        <span>market radar · 18 pannonian solar projects · live competitive intel</span>
      </div>

      <div className="relative z-10 mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[1.3fr_1fr]">
        <div className="flex flex-col gap-4">
          <h1 className="font-display text-[clamp(2rem,4.6vw,4rem)] font-light uppercase leading-[0.96] tracking-tech-tight text-text-primary">
            You are <span className="text-pulse">#{rankByIrr}</span> of{' '}
            <span className="text-text-secondary">{allPannonianProjects.length}</span>
            <br />
            <span className="text-text-muted">by equity IRR · Q3 2026 snapshot</span>
          </h1>
          <p className="max-w-3xl font-mono text-[12px] uppercase tracking-[0.22em] text-text-secondary">
            Other Slavonian bidders in the HOPS queue + FZOEU pool right now.
            Kopanica-Beravci lands in the top quartile by IRR,{' '}
            <span className="text-agri">top {rankByCapex} by CAPEX efficiency</span>.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <HeroStat label="your IRR" value={`${deal.irrEquity.toFixed(1)}%`} tone="agri" sub="equity · unlevered" />
          <HeroStat label="IRR percentile" value={`top ${Math.round((rankByIrr / allPannonianProjects.length) * 100)}%`} tone="pulse" sub="of 18 peers" />
          <HeroStat label="your CAPEX" value={`€${(deal.capexPerMW / 1000).toFixed(0)}k/MW`} tone="sun" sub={`rank #${rankByCapex}`} />
          <HeroStat label="FZOEU ask" value={`€${(fzoeuPool.kopanicaBeravciBidEur / 1_000_000).toFixed(1)}M`} tone="signal" sub="of €42M pool" />
        </div>
      </div>
    </div>
  );
}

// Deterministic pseudo-random sparkline values, seeded by label (so every HeroStat
// keeps the same trend across rerenders without real historical data).
function sparkSeed(label: string, tone: 'pulse' | 'sun' | 'agri' | 'signal'): number[] {
  let seed = 0;
  for (let i = 0; i < label.length; i++) seed = (seed * 31 + label.charCodeAt(i)) >>> 0;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const uptrend = tone === 'agri' || tone === 'pulse';
  const n = 14;
  const base = 0.5 + rand() * 0.2;
  return Array.from({ length: n }, (_, i) => {
    const drift = uptrend ? i / n : -i / (n * 2);
    const noise = (rand() - 0.5) * 0.22;
    return base + drift + noise;
  });
}

function HeroStat({
  label,
  value,
  tone,
  sub,
}: {
  label: string;
  value: string;
  tone: 'pulse' | 'sun' | 'agri' | 'signal';
  sub: string;
}) {
  const t = {
    pulse: 'text-pulse border-pulse/30 bg-pulse/5',
    sun: 'text-sun border-sun/30 bg-sun/5',
    agri: 'text-agri border-agri/30 bg-agri/5',
    signal: 'text-signal border-signal/30 bg-signal/5',
  }[tone];
  const trend = sparkSeed(label, tone);
  return (
    <div className={cn('flex flex-col gap-1 rounded-lg border p-4 backdrop-blur', t)}>
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">{label}</span>
        <Sparkline values={trend} tone={tone} width={54} height={18} />
      </div>
      <span className={cn('font-display text-2xl tracking-tech-tight', t.split(' ')[0])}>{value}</span>
      <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">{sub}</span>
    </div>
  );
}

/* ============================ BUBBLE CHART ============================ */

function BubbleSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.15, once: true });

  // Transform data for scatter: x=€/MW, y=IRR, z=MW (sized by MW)
  const data = allPannonianProjects.map((p) => ({
    ...p,
    capexK: Math.round(p.capexPerMW / 1000),
  }));

  const statusColor = (status: Comparable['status']) =>
    ({
      operational: '#5BD9A1',
      construction: '#7C5CFF',
      permit: '#FFB800',
      queue: '#4FA6D9',
    }[status]);

  return (
    <div ref={ref} className="border-b border-border px-12 py-14">
      <div className="mb-6 flex items-start justify-between gap-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
            <Crosshair className="h-3.5 w-3.5 text-pulse" strokeWidth={1.8} />
            IRR × CAPEX efficiency · bubble size = MW · color = status
          </div>
          <h2 className="font-display text-2xl uppercase tracking-tech-tight text-text-primary">
            The competitive bubble chart
          </h2>
          <p className="max-w-3xl font-mono text-[11px] text-text-secondary">
            Every live Pannonian solar project plotted by CAPEX efficiency (lower is right)
            and equity IRR. Kopanica-Beravci lands{' '}
            <span className="text-pulse">top-right</span> — better CAPEX than average,
            competitive IRR, larger scale than median.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 font-mono text-[9px] uppercase tracking-[0.22em]">
          <StatusChip color={statusColor('operational')} label="operational" />
          <StatusChip color={statusColor('construction')} label="construction" />
          <StatusChip color={statusColor('permit')} label="permit" />
          <StatusChip color={statusColor('queue')} label="queue" />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
        className="rounded-lg border border-border bg-surface/30 p-6"
        style={{ height: 460 }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 40, bottom: 40, left: 40 }}>
            <ReferenceArea
              x1={680}
              x2={730}
              y1={11}
              y2={13}
              fill="#7C5CFF"
              fillOpacity={0.04}
              stroke="#7C5CFF"
              strokeOpacity={0.2}
              strokeDasharray="3 4"
              ifOverflow="visible"
            />
            <XAxis
              type="number"
              dataKey="capexK"
              name="CAPEX"
              unit="k€/MW"
              domain={[670, 830]}
              reversed
              stroke="#6B7180"
              tick={{ fill: '#8B93A3', fontFamily: 'monospace', fontSize: 10 }}
              label={{
                value: '← more efficient · €/MW',
                position: 'insideBottom',
                offset: -12,
                fill: '#6B7180',
                fontFamily: 'monospace',
                fontSize: 10,
              }}
            />
            <YAxis
              type="number"
              dataKey="irrEquity"
              name="IRR"
              unit="%"
              domain={[8, 13]}
              stroke="#6B7180"
              tick={{ fill: '#8B93A3', fontFamily: 'monospace', fontSize: 10 }}
              label={{
                value: 'equity IRR %',
                angle: -90,
                position: 'insideLeft',
                offset: 0,
                fill: '#6B7180',
                fontFamily: 'monospace',
                fontSize: 10,
              }}
            />
            <ZAxis dataKey="capacityMW" range={[80, 900]} />
            <ReferenceLine x={725} stroke="#6B7180" strokeDasharray="2 4" label={{ value: 'market median', fill: '#6B7180', fontSize: 9, position: 'top' }} />
            <ReferenceLine y={11} stroke="#6B7180" strokeDasharray="2 4" />
            <Tooltip
              cursor={false}
              contentStyle={{
                background: 'rgba(14, 15, 18, 0.95)',
                border: '1px solid #3A3E4A',
                borderRadius: 6,
                fontFamily: 'monospace',
                fontSize: 11,
              }}
              content={({ active, payload }: any) => {
                if (!active || !payload?.length) return null;
                const p = payload[0].payload as Comparable & { capexK: number };
                return (
                  <div className="rounded-md border border-border-bright bg-canvas/95 p-3 font-mono text-[10px] backdrop-blur">
                    <div className={cn('mb-1 uppercase tracking-[0.22em]', p.isBeravci ? 'text-pulse' : 'text-text-primary')}>
                      {p.name}
                    </div>
                    <div className="text-text-muted">{p.operator} · {p.region}</div>
                    <div className="mt-1 grid grid-cols-2 gap-x-3 text-text-secondary tabular-nums">
                      <span>MW</span><span className="text-right">{p.capacityMW}</span>
                      <span>IRR</span><span className="text-right">{p.irrEquity.toFixed(1)}%</span>
                      <span>CAPEX</span><span className="text-right">€{p.capexK}k/MW</span>
                      <span>status</span><span className="text-right uppercase">{p.status}</span>
                    </div>
                  </div>
                );
              }}
            />
            <Scatter name="projects" data={data} isAnimationActive={true} animationDuration={900}>
              {data.map((p, i) => {
                const color = p.isBeravci ? '#7C5CFF' : statusColor(p.status);
                const strokeColor = p.isBeravci ? '#FAFAFA' : color;
                const strokeWidth = p.isBeravci ? 2.4 : 0.8;
                return (
                  <Cell
                    key={i}
                    fill={color}
                    fillOpacity={p.isBeravci ? 0.85 : 0.5}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                  />
                );
              })}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="mt-3 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
        <Target className="h-3 w-3 text-pulse" strokeWidth={1.8} />
        <span className="text-pulse">kopanica-beravci</span>
        <span>·</span>
        <span>highlighted in purple with white ring</span>
        <span className="ml-auto">
          top-right quadrant · the "efficient + profitable" zone
        </span>
      </div>
    </div>
  );
}

function StatusChip({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-text-muted">
      <span
        className="inline-block h-2 w-2 rounded-full"
        style={{ background: color, boxShadow: `0 0 6px ${color}` }}
      />
      {label}
    </span>
  );
}

/* ========================== STRATEGIC RADAR ========================== */

function StrategicRadarSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.2, once: true });

  const topDifferentiators = [...strategicRadar]
    .map((s) => ({ ...s, delta: s.kopanicaBeravci - s.marketAvg }))
    .sort((a, b) => b.delta - a.delta)
    .slice(0, 4);

  return (
    <div ref={ref} className="border-b border-border bg-surface/20 px-12 py-14">
      <div className="mb-6 flex flex-col gap-2">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
          <Award className="h-3.5 w-3.5 text-agri" strokeWidth={1.8} />
          strategic axes · you vs market avg
        </div>
        <h2 className="font-display text-2xl uppercase tracking-tech-tight text-text-primary">
          where kopanica-beravci{' '}
          <span className="text-agri">wins</span>
        </h2>
        <p className="max-w-3xl font-mono text-[11px] text-text-secondary">
          Eight deal-quality axes scored 0–10. The outer purple wave is Kopanica-Beravci.
          The inner muted line is the average of all 18 Pannonian projects. Bigger gap = bigger competitive moat.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8 }}
          className="rounded-lg border border-border bg-canvas/40 p-4"
          style={{ height: 440 }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={strategicRadar}>
              <PolarGrid stroke="#2A2E38" />
              <PolarAngleAxis
                dataKey="axis"
                tick={{ fill: '#B89CFF', fontFamily: 'monospace', fontSize: 10 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 10]}
                stroke="#3A3E4A"
                tick={{ fill: '#6B7180', fontFamily: 'monospace', fontSize: 9 }}
              />
              <RechartsRadar
                name="market avg"
                dataKey="marketAvg"
                stroke="#6B7180"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                fill="#6B7180"
                fillOpacity={0.1}
                isAnimationActive={inView}
                animationDuration={1100}
              />
              <RechartsRadar
                name="kopanica-beravci"
                dataKey="kopanicaBeravci"
                stroke="#7C5CFF"
                strokeWidth={2.4}
                fill="#7C5CFF"
                fillOpacity={0.28}
                isAnimationActive={inView}
                animationDuration={1200}
                animationBegin={300}
              />
              <Tooltip
                cursor={false}
                content={({ active, payload, label }: any) => {
                  if (!active || !payload?.length) return null;
                  const pr = strategicRadar.find((s) => s.axis === label);
                  if (!pr) return null;
                  return (
                    <div className="rounded-md border border-border-bright bg-canvas/95 p-3 font-mono text-[10px] backdrop-blur">
                      <div className="mb-1 uppercase tracking-[0.22em] text-pulse">{pr.axis}</div>
                      <div className="grid grid-cols-2 gap-x-3 text-text-secondary tabular-nums">
                        <span>you</span>
                        <span className="text-right text-pulse">{pr.kopanicaBeravci.toFixed(1)}</span>
                        <span>avg</span>
                        <span className="text-right text-text-muted">{pr.marketAvg.toFixed(1)}</span>
                        <span>delta</span>
                        <span className={cn('text-right', pr.kopanicaBeravci > pr.marketAvg ? 'text-agri' : 'text-spark')}>
                          {pr.kopanicaBeravci > pr.marketAvg ? '+' : ''}
                          {(pr.kopanicaBeravci - pr.marketAvg).toFixed(1)}
                        </span>
                      </div>
                      <div className="mt-2 max-w-[240px] text-text-muted">{pr.note}</div>
                    </div>
                  );
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        <div className="flex flex-col gap-3">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-agri">
            top 4 competitive moats
          </div>
          {topDifferentiators.map((d, i) => (
            <motion.div
              key={d.axis}
              initial={{ opacity: 0, x: 6 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.12 * i }}
              className="flex flex-col gap-1 rounded-lg border border-agri/25 bg-agri/5 p-4"
            >
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-agri">
                  {d.axis}
                </span>
                <span className="font-display text-2xl tracking-tech-tight text-agri tabular-nums">
                  +{d.delta.toFixed(1)}
                </span>
              </div>
              <div className="flex items-baseline justify-between font-mono text-[10px] text-text-secondary">
                <span>
                  you <span className="text-agri tabular-nums">{d.kopanicaBeravci.toFixed(1)}</span>
                </span>
                <span>
                  avg <span className="text-text-muted tabular-nums">{d.marketAvg.toFixed(1)}</span>
                </span>
              </div>
              <div className="mt-1 font-mono text-[10px] leading-relaxed text-text-muted">
                {d.note}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================ FZOEU POOL ============================ */

function FzoeuPoolSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.2, once: true });

  const poolLeft = fzoeuPool.totalEur - fzoeuPool.kopanicaBeravciBidEur;
  const yourSharePct = (fzoeuPool.kopanicaBeravciBidEur / fzoeuPool.totalEur) * 100;
  const avgBidEur = poolLeft / (fzoeuPool.applicants - 1);

  return (
    <div ref={ref} className="border-b border-border px-12 py-14">
      <div className="mb-6 flex flex-col gap-2">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
          <Coins className="h-3.5 w-3.5 text-sun" strokeWidth={1.8} />
          FZOEU pool OI-2026-03 · deadline {fzoeuPool.deadline}
        </div>
        <h2 className="font-display text-2xl uppercase tracking-tech-tight text-text-primary">
          €{(fzoeuPool.totalEur / 1_000_000).toFixed(0)}M pool · {fzoeuPool.applicants} applicants
        </h2>
        <p className="max-w-3xl font-mono text-[11px] text-text-secondary">
          Kopanica-Beravci asks €{(fzoeuPool.kopanicaBeravciBidEur / 1_000_000).toFixed(1)}M{' '}
          — 10% of the pool. Capped at 20% of CAPEX per project. 85% eligibility match.
          Expected award probability {(fzoeuPool.expectedAwardRatio * 100).toFixed(0)}%.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-[2fr_1fr]">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="flex flex-col gap-3 rounded-lg border border-sun/30 bg-sun/5 p-6"
        >
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-sun">
              your slice
            </span>
            <span className="font-display text-sm uppercase tracking-tech-tight text-text-muted">
              live
            </span>
          </div>

          <div className="relative h-6 overflow-hidden rounded-full border border-border bg-canvas">
            <motion.div
              initial={{ width: 0 }}
              animate={inView ? { width: `${yourSharePct}%` } : {}}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-sun to-agri"
            />
            <div className="absolute inset-0 flex items-center justify-between px-3 font-mono text-[10px] uppercase tracking-[0.22em] text-text-primary">
              <span className="text-canvas">
                €{(fzoeuPool.kopanicaBeravciBidEur / 1_000_000).toFixed(1)}M · {yourSharePct.toFixed(1)}%
              </span>
              <span className="text-text-muted">
                remaining €{(poolLeft / 1_000_000).toFixed(1)}M for {fzoeuPool.applicants - 1} others
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-text-secondary">
            <PoolStat label="your ask" value={`€${(fzoeuPool.kopanicaBeravciBidEur / 1_000_000).toFixed(1)}M`} tone="agri" />
            <PoolStat label="avg rival ask" value={`€${(avgBidEur / 1_000_000).toFixed(1)}M`} tone="text-muted" />
            <PoolStat label="cap / project" value={`€${(fzoeuPool.maxPerApplicantEur / 1_000_000).toFixed(1)}M`} tone="text-muted" />
          </div>

          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
            <Zap className="h-3 w-3 text-agri" strokeWidth={1.8} />
            <span>
              85% of eligibility criteria met · expected award{' '}
              <span className="text-agri">
                {(fzoeuPool.expectedAwardRatio * 100).toFixed(0)}%
              </span>
            </span>
          </div>
        </motion.div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 rounded-lg border border-pulse/30 bg-pulse/5 p-4">
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-pulse">
              expected award
            </span>
            <span className="font-display text-3xl tracking-tech-tight text-pulse">
              €{((fzoeuPool.kopanicaBeravciBidEur * fzoeuPool.expectedAwardRatio) / 1_000_000).toFixed(1)}M
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
              probability-weighted · 10yr IRR lift +1.7pp
            </span>
          </div>

          <div className="flex flex-col gap-2 rounded-lg border border-signal/30 bg-signal/5 p-4">
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-signal">
              stacked with NPOO
            </span>
            <span className="font-display text-3xl tracking-tech-tight text-signal">
              €{(fzoeuPool.kopanicaBeravciBidEur * 1.35 / 1_000_000).toFixed(1)}M
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
              if both grants hit · 35% upside vs FZOEU alone
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PoolStat({ label, value, tone }: { label: string; value: string; tone: string }) {
  const toneCls =
    tone === 'agri' ? 'text-agri' :
    tone === 'pulse' ? 'text-pulse' :
    tone === 'sun' ? 'text-sun' :
    'text-text-muted';
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">{label}</span>
      <span className={cn('font-display text-lg tracking-tech-tight tabular-nums', toneCls)}>{value}</span>
    </div>
  );
}

/* ============================ HEAD-TO-HEAD =========================== */

function HeadToHead() {
  // 3 nearest rivals by IRR to Kopanica-Beravci
  const deal = allPannonianProjects.find((p) => p.isBeravci)!;
  const rivals = useMemo(
    () =>
      allPannonianProjects
        .filter((p) => !p.isBeravci)
        .sort((a, b) => Math.abs(a.irrEquity - deal.irrEquity) - Math.abs(b.irrEquity - deal.irrEquity))
        .slice(0, 3),
    [deal.irrEquity],
  );

  return (
    <div className="border-b border-border bg-surface/30 px-12 py-14">
      <div className="mb-6 flex flex-col gap-2">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
          <Trophy className="h-3.5 w-3.5 text-pulse" strokeWidth={1.8} />
          head-to-head · 3 nearest rivals by IRR
        </div>
        <h2 className="font-display text-2xl uppercase tracking-tech-tight text-text-primary">
          direct matchups
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {rivals.map((r, i) => (
          <motion.div
            key={r.name}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.12 * i }}
            className="flex flex-col gap-3 rounded-lg border border-border bg-canvas/30 p-5"
          >
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-secondary">
                {r.name}
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
                {r.status}
              </span>
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
              {r.operator} · {r.region}
            </div>
            <div className="mt-1 grid grid-cols-3 gap-2 text-text-primary">
              <DiffStat
                label="IRR"
                you={deal.irrEquity}
                them={r.irrEquity}
                unit="%"
                higher="good"
              />
              <DiffStat
                label="€/MW"
                you={deal.capexPerMW / 1000}
                them={r.capexPerMW / 1000}
                unit="k"
                higher="bad"
              />
              <DiffStat
                label="MW"
                you={deal.capacityMW}
                them={r.capacityMW}
                unit=""
                higher="good"
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function DiffStat({
  label,
  you,
  them,
  unit,
  higher,
}: {
  label: string;
  you: number;
  them: number;
  unit: string;
  higher: 'good' | 'bad';
}) {
  const youBetter = higher === 'good' ? you > them : you < them;
  const delta = you - them;
  return (
    <div className="flex flex-col gap-0.5 border-l border-border/40 pl-3 first:border-0 first:pl-0">
      <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">{label}</span>
      <span className="font-display text-lg tracking-tech-tight text-text-primary tabular-nums">
        {them.toFixed(label === '€/MW' ? 0 : 1)}
        {unit}
      </span>
      <span
        className={cn(
          'font-mono text-[9px] uppercase tracking-[0.22em] tabular-nums',
          youBetter ? 'text-agri' : 'text-spark',
        )}
      >
        {youBetter ? '▲' : '▼'} {delta > 0 ? '+' : ''}
        {delta.toFixed(label === '€/MW' ? 0 : 1)}
        {unit}
      </span>
    </div>
  );
}

/* =============================== FOOTER ============================== */

function Footer() {
  return (
    <div className="flex items-center justify-between border-t border-border px-12 py-6">
      <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
        <Globe className="h-3 w-3 text-pulse" strokeWidth={1.8} />
        sources · HOPS queue Q3 2026 · FZOEU call OI-2026-03 · operator SEC filings + HROTE · modeled IRRs
      </div>
      <Link
        to="/roi"
        className="group inline-flex items-center gap-3 rounded-md border border-border-bright bg-surface px-4 py-2.5 transition-all hover:border-pulse hover:shadow-glow-pulse"
      >
        <Plug className="h-3.5 w-3.5 text-text-secondary group-hover:text-pulse" strokeWidth={1.8} />
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-text-secondary group-hover:text-pulse">
          deep-dive the finance workbook
        </span>
        <ArrowUpRight className="h-3.5 w-3.5 text-text-secondary group-hover:text-pulse" strokeWidth={1.8} />
      </Link>
    </div>
  );
}
