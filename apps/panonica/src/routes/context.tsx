import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Calendar,
  Compass,
  Megaphone,
  TrendingDown,
  Zap,
} from 'lucide-react';
import { NumberTicker, cn } from '@paladian/ui';
import { Sourced } from '@/components/Sourced';
import {
  beravciExtrapolation,
  corridors,
  gridWindow,
  irrCollapse,
  oihPosition,
  paladinaPositioning,
  punchline,
  regulatoryAnchor,
  ribicBregComp,
  subsidyWindowCalendar,
} from '@/mock/context';

export function ContextRoute() {
  return (
    <section className="flex min-h-full flex-col">
      <AnchorSection />
      <CollapseSection />
      <CorridorSection />
      <OihSection />
      <RibicBregSection />
      <ExtrapolationSection />
      <PositioningSection />
      <PunchlineSection />
    </section>
  );
}

/* --------------------------- 1 · REGULATORY ANCHOR ------------------------- */

function AnchorSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const yBg = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);

  return (
    <div
      ref={ref}
      className="relative flex min-h-[94vh] flex-col justify-between overflow-hidden border-b border-border bg-canvas px-12 py-20"
    >
      <motion.div
        style={{ y: yBg }}
        className="pointer-events-none absolute inset-0"
        aria-hidden
      >
        <div className="grid-bg absolute inset-0 opacity-60" />
        <div className="absolute left-[18%] top-[22%] h-[420px] w-[420px] rounded-full bg-spark/10 blur-[120px]" />
        <div className="absolute right-[14%] bottom-[12%] h-[320px] w-[320px] rounded-full bg-pulse/10 blur-[100px]" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em] text-text-muted"
      >
        <span className="inline-flex h-1.5 w-1.5 rounded-full bg-spark animate-pulse-dot" />
        <span>context · why now, why here</span>
      </motion.div>

      <div className="relative z-10 flex flex-col gap-8">
        <motion.div
          initial={{ opacity: 0, letterSpacing: '0.4em' }}
          animate={{ opacity: 1, letterSpacing: '0.02em' }}
          transition={{ duration: 1.4, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="font-mono text-sm uppercase tracking-[0.02em] text-spark"
        >
          <Sourced sourceId="net-billing-law">
            {regulatoryAnchor.timestamp}
          </Sourced>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-[clamp(2.5rem,6.2vw,5.6rem)] font-light uppercase leading-[0.94] tracking-tech-tight text-text-primary"
        >
          Croatian rooftop solar
          <br />
          economics <span className="text-spark">ended here.</span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          className="grid max-w-4xl grid-cols-1 gap-5 md:grid-cols-3"
        >
          <AnchorStat label="before · net metering" value="18% IRR" tone="muted" strikethrough />
          <AnchorStat label="after · net billing" value="8% IRR" tone="spark" />
          <AnchorStat label="collapse" value="−20–30%" tone="spark" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.3 }}
          className="max-w-3xl font-mono text-[12px] uppercase tracking-[0.22em] text-text-secondary"
        >
          {regulatoryAnchor.replacement}
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.5 }}
          className="max-w-3xl font-mono text-[11px] uppercase tracking-[0.22em] text-text-muted"
        >
          source · {regulatoryAnchor.source}
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.8 }}
        className="relative z-10 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-text-muted"
      >
        <span>scroll</span>
        <span className="h-px w-16 bg-border-bright" />
        <span className="text-text-secondary">what replaces it</span>
      </motion.div>
    </div>
  );
}

function AnchorStat({
  label,
  value,
  tone,
  strikethrough,
}: {
  label: string;
  value: string;
  tone: 'spark' | 'muted' | 'agri';
  strikethrough?: boolean;
}) {
  const toneClass = {
    spark: 'text-spark border-spark/40',
    muted: 'text-text-muted border-border',
    agri: 'text-agri border-agri/40',
  }[tone];

  return (
    <div className={cn('flex flex-col gap-2 rounded-lg border bg-surface/50 p-5 backdrop-blur', toneClass)}>
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
        {label}
      </span>
      <span
        className={cn(
          'font-display text-3xl tracking-tech-tight',
          strikethrough && 'line-through decoration-text-muted/60',
        )}
      >
        {value}
      </span>
    </div>
  );
}

/* ------------------------------- 2 · COLLAPSE ------------------------------ */

function CollapseSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3, once: true });

  return (
    <div
      ref={ref}
      className="flex min-h-[94vh] flex-col justify-center gap-10 border-b border-border px-12 py-20"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col gap-3"
      >
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
          <TrendingDown className="h-3.5 w-3.5 text-spark" strokeWidth={1.8} />
          the collapse · the vacuum
        </div>
        <h2 className="font-display text-[clamp(1.8rem,3.6vw,3.2rem)] font-light uppercase leading-[1] tracking-tech-tight text-text-primary">
          Two lines <span className="text-text-muted">crossing</span>.
        </h2>
        <p className="max-w-2xl font-mono text-[12px] uppercase tracking-[0.22em] text-text-secondary">
          household rooftop IRR in red. utility-scale + agrivoltaic IRR in green.
          <br />
          they crossed in 2026.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1.0, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-lg border border-border bg-surface/40 p-6"
      >
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={irrCollapse} margin={{ top: 10, right: 40, left: 0, bottom: 10 }}>
              <defs>
                <linearGradient id="rooftopFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(255 61 113)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="rgb(255 61 113)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="agvFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(74 222 128)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="rgb(74 222 128)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgb(31 31 35)" strokeDasharray="2 4" vertical={false} />
              <XAxis
                dataKey="year"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgb(138 138 148)', fontSize: 10, fontFamily: 'JetBrains Mono Variable' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgb(138 138 148)', fontSize: 10, fontFamily: 'JetBrains Mono Variable' }}
                tickFormatter={(v) => `${v}%`}
                domain={[0, 22]}
              />
              <Tooltip
                cursor={{ stroke: 'rgb(124 92 255)', strokeWidth: 0.5 }}
                contentStyle={{
                  background: 'rgb(17 17 19)',
                  border: '1px solid rgb(42 42 48)',
                  borderRadius: 6,
                  fontFamily: 'JetBrains Mono Variable, monospace',
                  fontSize: 11,
                }}
                formatter={(v: number, name) => [`${v.toFixed(1)}% IRR`, name]}
                labelStyle={{ color: 'rgb(138 138 148)' }}
              />
              <Legend
                wrapperStyle={{
                  fontFamily: 'JetBrains Mono Variable, monospace',
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: '0.18em',
                  color: 'rgb(138 138 148)',
                }}
              />
              <ReferenceLine
                x={2026}
                stroke="rgb(255 61 113)"
                strokeDasharray="4 4"
                label={{
                  value: 'Net-billing · 2026-01-01',
                  position: 'insideTopRight',
                  fontSize: 10,
                  fill: 'rgb(255 61 113)',
                  fontFamily: 'JetBrains Mono Variable',
                }}
              />
              <ReferenceDot x={2026} y={8.2} r={5} fill="rgb(255 61 113)" stroke="none" />
              <ReferenceDot x={2026} y={11.4} r={5} fill="rgb(74 222 128)" stroke="none" />
              <Area
                type="monotone"
                dataKey="rooftop"
                name="Household rooftop"
                stroke="rgb(255 61 113)"
                strokeWidth={2}
                fill="url(#rooftopFill)"
              />
              <Area
                type="monotone"
                dataKey="utilityAgv"
                name="Utility-scale + AGV"
                stroke="rgb(74 222 128)"
                strokeWidth={2}
                fill="url(#agvFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="grid grid-cols-1 gap-4 md:grid-cols-2"
      >
        <div className="flex flex-col gap-3 rounded-lg border border-spark/30 bg-surface/50 p-6">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-spark">
            <ArrowDownRight className="h-3.5 w-3.5" strokeWidth={1.8} />
            retail rooftop
          </div>
          <p className="font-display text-lg uppercase tracking-tech-tight text-text-primary">
            exports priced at HROTE spot.
            <br />
            imports at retail tariff.
          </p>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-text-muted">
            margin compression: 20–30% IRR haircut. battery economics now marginal at
            residential scale.
          </p>
        </div>
        <div className="flex flex-col gap-3 rounded-lg border border-agri/30 bg-agri/5 p-6">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-agri">
            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.8} />
            utility-scale + agrivoltaic
          </div>
          <p className="font-display text-lg uppercase tracking-tech-tight text-text-primary">
            PPA contracts. subsidy stack intact.
            <br />
            grid queue is the bottleneck, not economics.
          </p>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-text-muted">
            FZOEU + NPOO + EU MFF still flowing. agricultural classification preserved under
            dual-use. IRR trajectory: up.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

/* ------------------------------- 3 · CORRIDOR ------------------------------ */

function CorridorSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.25, once: true });

  return (
    <div
      ref={ref}
      className="flex min-h-[94vh] flex-col justify-center gap-10 border-b border-border px-12 py-20"
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="flex flex-col gap-3"
      >
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
          <Compass className="h-3.5 w-3.5 text-pulse" strokeWidth={1.8} />
          the corridor · eastern croatia
        </div>
        <h2 className="font-display text-[clamp(1.8rem,3.6vw,3.2rem)] font-light uppercase leading-[1] tracking-tech-tight text-text-primary">
          <Sourced sourceId="oieh-slavonia">
            <NumberTicker value={gridWindow.totalFreeMW} duration={1.4} className="text-pulse" /> MW
          </Sourced>
          <span className="text-text-muted"> of free grid capacity</span>
        </h2>
        <p className="max-w-3xl font-mono text-[12px] uppercase tracking-[0.22em] text-text-secondary">
          across {gridWindow.totalSubstations} substations in slavonia, banovina, istria.
          <br />
          {gridWindow.totalAllocatedMW} MW already allocated. {gridWindow.queuePositionsTotal}{' '}
          applications in queue nationwide.
          <br />
          industry estimate: window closes in ~{gridWindow.closingEstimateMonths} months.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 1.0, delay: 0.2 }}
        className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_1fr]"
      >
        {/* Simplified Croatia SVG map */}
        <div className="relative aspect-[4/3] rounded-lg border border-border bg-surface/30 p-4">
          <svg viewBox="0 0 400 300" className="h-full w-full">
            {/* Croatia outline — stylized simplification */}
            <motion.path
              initial={{ pathLength: 0, opacity: 0 }}
              animate={inView ? { pathLength: 1, opacity: 1 } : {}}
              transition={{ duration: 2.0, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              d="M 80 100 L 120 80 L 180 70 L 240 75 L 300 85 L 350 110 L 360 150 L 340 185 L 300 210 L 270 240 L 230 260 L 180 270 L 140 255 L 100 230 L 75 200 L 70 165 L 78 135 Z"
              fill="rgb(17 17 19)"
              stroke="rgb(42 42 48)"
              strokeWidth={1.5}
            />

            {/* Istria — west */}
            <motion.g
              initial={{ opacity: 0, scale: 0.85 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.8, delay: 1.2 }}
              style={{ transformOrigin: '95px 170px' }}
            >
              <ellipse
                cx={95}
                cy={170}
                rx={28}
                ry={20}
                fill="rgb(0 217 255)"
                fillOpacity={0.16}
                stroke="rgb(0 217 255)"
                strokeWidth={1.2}
              />
              <text x={95} y={175} textAnchor="middle" className="fill-signal font-mono" fontSize={10}>
                ISTRIA
              </text>
              <text
                x={95}
                y={195}
                textAnchor="middle"
                className="fill-text-muted font-mono"
                fontSize={8.5}
              >
                520 MW
              </text>
            </motion.g>

            {/* Banovina — central */}
            <motion.g
              initial={{ opacity: 0, scale: 0.85 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.8, delay: 1.4 }}
              style={{ transformOrigin: '175px 145px' }}
            >
              <ellipse
                cx={175}
                cy={145}
                rx={36}
                ry={26}
                fill="rgb(124 92 255)"
                fillOpacity={0.16}
                stroke="rgb(124 92 255)"
                strokeWidth={1.2}
              />
              <text x={175} y={148} textAnchor="middle" className="fill-pulse font-mono" fontSize={10}>
                BANOVINA
              </text>
              <text
                x={175}
                y={165}
                textAnchor="middle"
                className="fill-text-muted font-mono"
                fontSize={8.5}
              >
                820 MW
              </text>
            </motion.g>

            {/* Slavonia — east (Kopanica-Beravci here) */}
            <motion.g
              initial={{ opacity: 0, scale: 0.85 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.8, delay: 1.6 }}
              style={{ transformOrigin: '285px 135px' }}
            >
              <ellipse
                cx={285}
                cy={135}
                rx={55}
                ry={30}
                fill="rgb(74 222 128)"
                fillOpacity={0.22}
                stroke="rgb(74 222 128)"
                strokeWidth={1.4}
              />
              <text x={285} y={132} textAnchor="middle" className="fill-agri font-mono" fontSize={10}>
                SLAVONIA
              </text>
              <text x={285} y={149} textAnchor="middle" className="fill-agri font-mono" fontSize={11}>
                1,180 MW
              </text>

              {/* Kopanica-Beravci pulse */}
              <motion.circle
                cx={305}
                cy={142}
                r={4}
                fill="rgb(124 92 255)"
                animate={{ r: [4, 8, 4], opacity: [1, 0.5, 1] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                style={{ filter: 'drop-shadow(0 0 4px rgb(124 92 255))' }}
              />
              <text
                x={305}
                y={168}
                textAnchor="middle"
                className="fill-pulse font-mono"
                fontSize={9}
              >
                KOPANICA-BERAVCI · 80.3 ha
              </text>
            </motion.g>
          </svg>

          <div className="absolute right-3 top-3 font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
            HEP grid capacity · Q2 2026
          </div>
        </div>

        {/* Capacity breakdown */}
        <div className="flex flex-col gap-4">
          {corridors.map((c, i) => (
            <motion.div
              key={c.name}
              initial={{ opacity: 0, x: 20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 1.1 + i * 0.18 }}
              className={cn(
                'flex flex-col gap-3 rounded-lg border p-5',
                c.beravciHere
                  ? 'border-agri/40 bg-agri/5 shadow-glow-pulse'
                  : 'border-border bg-surface/40',
              )}
            >
              <div className="flex items-baseline justify-between">
                <span
                  className={cn(
                    'font-display text-xl uppercase tracking-tech-tight',
                    c.beravciHere ? 'text-agri' : 'text-text-primary',
                  )}
                >
                  {c.name}
                  {c.beravciHere && (
                    <span className="ml-2 font-mono text-[10px] tracking-[0.22em] text-agri/80">
                      ← kopanica-beravci
                    </span>
                  )}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
                  {c.substations} substations
                </span>
              </div>

              <div className="relative h-1.5 overflow-hidden rounded-full bg-border">
                <motion.div
                  initial={{ width: 0 }}
                  animate={inView ? { width: `${(c.freeCapacityMW / 1400) * 100}%` } : {}}
                  transition={{ duration: 1.6, delay: 1.3 + i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className={cn('h-full', c.beravciHere ? 'bg-agri' : 'bg-pulse')}
                />
              </div>

              <div className="flex items-baseline justify-between font-mono text-[11px]">
                <span className="tabular-nums text-text-primary">
                  {c.freeCapacityMW.toLocaleString()} MW free
                </span>
                <span className="tabular-nums text-text-muted">
                  {c.allocatedMW} MW allocated
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Subsidy calendar teaser */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 1.8 }}
        className="flex flex-col gap-3 rounded-lg border border-border bg-surface/30 p-5"
      >
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
          <Calendar className="h-3.5 w-3.5 text-sun" strokeWidth={1.8} />
          subsidy + grid calendar · next 18 months
        </div>
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-md border border-border bg-border md:grid-cols-3">
          {subsidyWindowCalendar.map((e) => (
            <div
              key={e.month}
              className="flex flex-col gap-1.5 bg-surface/60 p-4"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-sun">
                {e.month}
              </span>
              <span className="font-mono text-[11px] text-text-secondary">{e.event}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

/* --------------------------------- 4 · OIEH -------------------------------- */

function OihSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4, once: true });

  return (
    <div
      ref={ref}
      className="flex min-h-[80vh] flex-col justify-center gap-10 border-b border-border bg-surface/20 px-12 py-20"
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="flex flex-col gap-3"
      >
        <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
          oieh position · continental math
        </div>
        <blockquote className="max-w-5xl font-display text-[clamp(1.6rem,3.2vw,2.8rem)] font-light uppercase leading-[1.1] tracking-tech-tight text-text-primary">
          <Sourced sourceId="oieh-slavonia" placement="bottom">
            &ldquo;{oihPosition.framingLine}&rdquo;
          </Sourced>
        </blockquote>
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
          — {oihPosition.source}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-4"
      >
        <OihStat
          label="EU arable land"
          value={`${(oihPosition.euArableHectares / 1_000_000).toFixed(0)}M ha`}
          sub="total"
          tone="default"
        />
        <OihStat
          label="1% of arable"
          value={`${(oihPosition.onePercentOfArableHa / 1_000_000).toFixed(2)}M ha`}
          sub="agrivoltaic target"
          tone="pulse"
        />
        <OihStat
          label="theoretical capacity"
          value={`${oihPosition.projectedGW} GW`}
          sub={`${oihPosition.multiplier}× current EU PV`}
          tone="sun"
        />
        <OihStat
          label="current EU PV"
          value={`${oihPosition.currentEuPvGW} GW`}
          sub="installed, all segments"
          tone="muted"
        />
      </motion.div>
    </div>
  );
}

function OihStat({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  tone: 'default' | 'pulse' | 'sun' | 'muted';
}) {
  const toneClass = {
    default: 'text-text-primary',
    pulse: 'text-pulse',
    sun: 'text-sun',
    muted: 'text-text-muted',
  }[tone];
  return (
    <div className="flex flex-col gap-2 bg-surface/50 p-6">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
        {label}
      </span>
      <span className={cn('font-display text-3xl tracking-tech-tight', toneClass)}>{value}</span>
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
        {sub}
      </span>
    </div>
  );
}

/* ----------------------------- 5 · RIBIC BREG ----------------------------- */

function RibicBregSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3, once: true });

  return (
    <div
      ref={ref}
      className="flex min-h-[94vh] flex-col justify-center gap-10 border-b border-border px-12 py-20"
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="flex flex-col gap-3"
      >
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
          <Zap className="h-3.5 w-3.5 text-sun" strokeWidth={1.8} />
          precedent · <Sourced sourceId="solida-ribic-breg">ribić breg</Sourced>
        </div>
        <h2 className="font-display text-[clamp(1.8rem,3.6vw,3.2rem)] font-light uppercase leading-[1] tracking-tech-tight text-text-primary">
          The comp already exists.
        </h2>
        <p className="max-w-3xl font-mono text-[12px] uppercase tracking-[0.22em] text-text-secondary">
          <Sourced sourceId="solida-ribic-breg">solida d.o.o. · 60 ha · 30 MW · operational q3 2024</Sourced> · sheep grazing under panels.
          <br />
          apply the density ratio to 80.3 ha.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.9, delay: 0.2 }}
        className="rounded-lg border border-sun/30 bg-gradient-to-br from-sun/5 via-surface/40 to-surface/40 p-8"
      >
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[0.9fr_1fr]">
          {/* Visual placeholder — stylized panel array */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-md border border-border bg-surface">
            <svg viewBox="0 0 400 300" className="h-full w-full">
              {/* sky gradient */}
              <defs>
                <linearGradient id="ribicSky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(255 184 0)" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="rgb(10 10 11)" stopOpacity={1} />
                </linearGradient>
              </defs>
              <rect x={0} y={0} width={400} height={180} fill="url(#ribicSky)" />
              <rect x={0} y={180} width={400} height={120} fill="rgb(17 17 19)" />

              {/* sun */}
              <circle cx={70} cy={70} r={18} fill="rgb(255 184 0)" fillOpacity={0.5} />
              <circle cx={70} cy={70} r={10} fill="rgb(255 184 0)" />

              {/* panel rows (isometric-ish) */}
              {[0, 1, 2, 3].map((row) => (
                <g key={row} transform={`translate(0, ${200 + row * 18})`}>
                  {Array.from({ length: 12 }).map((_, i) => (
                    <motion.rect
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={inView ? { opacity: 1, y: 0 } : {}}
                      transition={{ delay: 0.4 + row * 0.12 + i * 0.03, duration: 0.4 }}
                      x={20 + i * 30}
                      y={0}
                      width={22}
                      height={10}
                      fill="rgb(0 217 255)"
                      fillOpacity={0.6 - row * 0.1}
                      stroke="rgb(0 217 255)"
                      strokeOpacity={0.8 - row * 0.15}
                      strokeWidth={0.4}
                      rx={0.5}
                      transform={`skewX(-18)`}
                    />
                  ))}
                </g>
              ))}

              {/* sheep dots */}
              {[
                [90, 220],
                [180, 240],
                [260, 228],
                [320, 252],
                [140, 265],
                [220, 272],
              ].map(([cx, cy], i) => (
                <motion.circle
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={inView ? { opacity: 1 } : {}}
                  transition={{ delay: 1.4 + i * 0.1, duration: 0.5 }}
                  cx={cx}
                  cy={cy}
                  r={3}
                  fill="rgb(250 250 250)"
                  fillOpacity={0.85}
                />
              ))}

              <text x={200} y={30} textAnchor="middle" className="fill-sun font-mono" fontSize={11}>
                RIBIĆ BREG · OPERATIONAL
              </text>
              <text
                x={200}
                y={45}
                textAnchor="middle"
                className="fill-text-muted font-mono"
                fontSize={9}
              >
                30 MW · 60 HA · Q3 2024
              </text>
            </svg>
          </div>

          {/* stats */}
          <div className="flex flex-col gap-4">
            <CompRow label="operator" value={ribicBregComp.operator} />
            <CompRow label="region" value={ribicBregComp.region} />
            <CompRow
              label="density"
              value={`${ribicBregComp.densityMWperHa.toFixed(2)} MW / ha`}
              tone="pulse"
            />
            <CompRow
              label="capex"
              value={`€${(ribicBregComp.capexTotal / 1_000_000).toFixed(0)}M`}
              sub={`€${(ribicBregComp.capexPerMW / 1000).toFixed(0)}k / MW`}
              tone="sun"
            />
            <CompRow
              label="PPA"
              value={`€${ribicBregComp.ppaPrice} / MWh`}
              sub={`${ribicBregComp.ppaTenor}-year tenor`}
            />
            <CompRow
              label="EBITDA"
              value={`€${(ribicBregComp.expectedEbitdaPerYear / 1_000_000).toFixed(1)}M / yr`}
              tone="agri"
            />
            <CompRow
              label="asset value"
              value={`€${(ribicBregComp.estimatedAssetValue / 1_000_000).toFixed(0)}M`}
              sub="completion"
              tone="sun"
              emphasis
            />
            <CompRow
              label="under-panel"
              value={ribicBregComp.underPanelUse}
              tone="agri"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function CompRow({
  label,
  value,
  sub,
  tone,
  emphasis,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: 'pulse' | 'sun' | 'agri';
  emphasis?: boolean;
}) {
  const toneClass = {
    pulse: 'text-pulse',
    sun: 'text-sun',
    agri: 'text-agri',
  }[tone ?? 'pulse'];
  return (
    <div className="flex items-baseline justify-between border-b border-border/60 pb-2">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
        {label}
      </span>
      <div className="flex flex-col items-end">
        <span
          className={cn(
            'font-mono tabular-nums',
            emphasis ? 'text-xl' : 'text-sm',
            tone ? toneClass : 'text-text-primary',
          )}
        >
          {value}
        </span>
        {sub && (
          <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
            {sub}
          </span>
        )}
      </div>
    </div>
  );
}

/* -------------------------- 6 · BERAVCI EXTRAPOLATION --------------------- */

function ExtrapolationSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3, once: true });

  return (
    <div
      ref={ref}
      className="flex min-h-[94vh] flex-col justify-center gap-10 border-b border-border bg-surface/20 px-12 py-20"
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="flex flex-col gap-3"
      >
        <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
          applied math · kopanica-beravci · phase 1 / phase 2
        </div>
        <h2 className="font-display text-[clamp(1.8rem,3.6vw,3.2rem)] font-light uppercase leading-[1] tracking-tech-tight text-text-primary">
          <span className="text-text-muted">80.3 ha × </span>
          {ribicBregComp.densityMWperHa} MW/ha<span className="text-text-muted"> = </span>
          <NumberTicker
            value={beravciExtrapolation.realisticCapacityMW}
            duration={1.4}
            className="text-pulse"
          />
          <span className="text-text-muted"> MW queue-approved</span>
        </h2>
        <p className="max-w-3xl font-mono text-[11px] leading-relaxed text-text-secondary">
          <Sourced sourceId="paladina-2023-deck">
            Paladina's 2023 plan targeted 70 MW on 73 ha
          </Sourced>. HOPS allocates 30 MW at TS Slavonski Brod 1 — phase 2 unlocks the remaining
          40 MW when the substation upgrades or a second connection lands. We model phase 1 as
          bankable · phase 2 as upside.
        </p>
      </motion.div>

      {/* Waterfall: ha → MW → capex → EBITDA → exit EV */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.9, delay: 0.2 }}
        className="grid grid-cols-1 gap-3 md:grid-cols-5"
      >
        <Step
          index={1}
          label="land bank"
          value="80.3 ha"
          sub="paladina investments"
          tone="text-text-primary"
          delay={0.3}
        />
        <Step
          index={2}
          label="build capacity"
          value={`${beravciExtrapolation.realisticCapacityMW} MW`}
          sub={`max ${beravciExtrapolation.maxCapacityMW} MW · queue-capped`}
          tone="text-pulse"
          delay={0.5}
        />
        <Step
          index={3}
          label="capex"
          value={`€${(beravciExtrapolation.capexTotal / 1_000_000).toFixed(0)}M`}
          sub={`€${(beravciExtrapolation.capexPerMW / 1000).toFixed(0)}k / MW`}
          tone="text-sun"
          delay={0.7}
        />
        <Step
          index={4}
          label="25yr PPA revenue"
          value={`€${((beravciExtrapolation.realisticCapacityMW * 1380 * beravciExtrapolation.ppaPrice * 25) / 1_000_000).toFixed(0)}M`}
          sub={`€${beravciExtrapolation.ppaPrice}/MWh · 1,380 kWh/kWp`}
          tone="text-agri"
          delay={0.9}
        />
        <Step
          index={5}
          label="exit EV · y10"
          value={`€${(beravciExtrapolation.exitEv / 1_000_000).toFixed(1)}M`}
          sub={`${(beravciExtrapolation.exitCapRate * 100).toFixed(1)}% cap · ${beravciExtrapolation.exitMoM}× MoM`}
          tone="text-sun"
          delay={1.1}
          emphasis
        />
      </motion.div>

      {/* Comparison: Kopanica-Beravci vs Kupari 10% */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.9, delay: 1.4 }}
        className="grid grid-cols-1 gap-4 md:grid-cols-2"
      >
        <div className="flex flex-col gap-3 rounded-lg border border-agri/40 bg-agri/5 p-6 shadow-glow-pulse">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-agri">
            kopanica-beravci · projected
          </span>
          <span className="font-display text-5xl tracking-tech-tight text-agri">
            €{(beravciExtrapolation.exitEv / 1_000_000).toFixed(1)}M
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-text-muted">
            year-10 enterprise value · 30 MW agrivoltaic · 25-year PPA
          </span>
        </div>
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface/40 p-6">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
            kupari · 10% stake · contested
          </span>
          <span className="font-display text-5xl tracking-tech-tight text-text-muted">
            €{(beravciExtrapolation.kupariStakeNominalValue / 1_000_000).toFixed(1)}M
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-text-muted">
            paper value · legal overhang · operator-dependent
          </span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 1.8 }}
        className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-text-secondary"
      >
        <span className="inline-block h-px w-12 bg-agri" />
        <span>kopanica-beravci exit is </span>
        <span className="text-agri">
          {beravciExtrapolation.ratioToKupari}× the nominal kupari paper
        </span>
        <span className="text-text-muted">· with none of the litigation overhang</span>
      </motion.div>
    </div>
  );
}

function Step({
  index,
  label,
  value,
  sub,
  tone,
  delay,
  emphasis,
}: {
  index: number;
  label: string;
  value: string;
  sub: string;
  tone: string;
  delay: number;
  emphasis?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'flex flex-col gap-2 rounded-lg border p-5',
        emphasis ? 'border-sun/40 bg-sun/5 shadow-glow-pulse' : 'border-border bg-surface/40',
      )}
    >
      <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
        step {index.toString().padStart(2, '0')}
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-secondary">
        {label}
      </span>
      <span className={cn('font-display text-2xl tracking-tech-tight', tone)}>{value}</span>
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
        {sub}
      </span>
    </motion.div>
  );
}

/* ----------------------------- 7 · POSITIONING ---------------------------- */

function PositioningSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3, once: true });

  return (
    <div
      ref={ref}
      className="flex min-h-[70vh] flex-col justify-center gap-8 border-b border-border px-12 py-16"
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="flex flex-col gap-3"
      >
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
          <Megaphone className="h-3.5 w-3.5 text-pulse" strokeWidth={1.8} />
          paladina · positioning
        </div>
        <p className="max-w-5xl font-editorial font-display text-[clamp(1.25rem,2.4vw,2rem)] font-light uppercase leading-[1.2] tracking-tech-tight text-text-primary">
          &ldquo;{paladinaPositioning.thesis}&rdquo;
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {paladinaPositioning.appearances.map((a, i) => (
          <motion.div
            key={a.event}
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3 + i * 0.15 }}
            className="flex flex-col gap-2 rounded-lg border border-border bg-surface/40 p-5"
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-pulse">
              {a.role}
            </span>
            <span className="font-display text-lg uppercase tracking-tech-tight text-text-primary">
              {a.event}
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-text-muted">
              {a.topic}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------- 8 · PUNCHLINE ---------------------------- */

function PunchlineSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4, once: true });

  return (
    <div
      ref={ref}
      className="relative flex min-h-[90vh] flex-col items-center justify-center gap-10 overflow-hidden px-12 py-24 text-center"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="grid-bg absolute inset-0 opacity-40" />
        <div className="absolute left-1/2 top-1/2 h-[720px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-pulse/10 blur-[140px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col items-center gap-8"
      >
        <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-text-muted">
          the punchline
        </div>
        <h2 className="max-w-5xl font-display text-[clamp(2.2rem,5.6vw,5rem)] font-light uppercase leading-[0.96] tracking-tech-tight text-text-primary">
          {punchline.headline}
        </h2>
        <p className="max-w-4xl font-editorial text-[clamp(1rem,1.6vw,1.4rem)] font-light leading-[1.35] text-text-secondary">
          {punchline.subhead}
        </p>
        <Link
          to="/land"
          className="group mt-4 inline-flex items-center gap-3 rounded-md border border-border-bright bg-surface/80 px-6 py-3 backdrop-blur transition-all hover:border-pulse hover:shadow-glow-pulse"
        >
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-text-secondary group-hover:text-pulse">
            {punchline.cta}
          </span>
          <ArrowRight
            className="h-3.5 w-3.5 text-text-secondary transition-transform group-hover:translate-x-0.5 group-hover:text-pulse"
            strokeWidth={1.8}
          />
        </Link>
      </motion.div>
    </div>
  );
}
