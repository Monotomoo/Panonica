import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Binary,
  Grid3x3,
  LineChart as LineIcon,
  Scale,
  Sparkles,
  Tornado,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { cn } from '@paladian/ui';
import { MonteCarloRain } from '@/components/MonteCarloRain';
import { BulletChart } from '@/components/BulletChart';
import {
  capexBreakdown,
  capexTotal,
  comparables,
  debtParams,
  exitAssumptions,
  equityMom,
  exitEv,
  maxDebtSize,
  monteCarloSeed,
  opexLines,
  opexTotal,
  revenueStack,
  revenueTotal,
  sensitivityAxes,
  sensitivityIrr,
  sensitivityOperating,
} from '@/mock/finance';

type TabKey =
  | 'overview'
  | 'model'
  | 'sensitivity'
  | 'tornado'
  | 'montecarlo'
  | 'debt'
  | 'comparables'
  | 'exit';

const TABS: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }> }[] = [
  { key: 'overview', label: 'Overview', icon: Activity },
  { key: 'model', label: 'Model', icon: LineIcon },
  { key: 'sensitivity', label: 'Sensitivity', icon: Grid3x3 },
  { key: 'tornado', label: 'Tornado', icon: Tornado },
  { key: 'montecarlo', label: 'Monte Carlo', icon: Binary },
  { key: 'debt', label: 'Debt', icon: Scale },
  { key: 'comparables', label: 'Comparables', icon: TrendingUp },
  { key: 'exit', label: 'Exit', icon: Wallet },
];

export function RoiRoute() {
  const [tab, setTab] = useState<TabKey>('overview');

  // Listen for command-palette tab-switch events
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<TabKey>).detail;
      if (detail && (TABS.some((t) => t.key === detail))) {
        setTab(detail);
      }
    };
    window.addEventListener('panonica:finance-tab', handler as EventListener);
    return () => window.removeEventListener('panonica:finance-tab', handler as EventListener);
  }, []);

  return (
    <section className="flex min-h-full flex-col">
      {/* HEADER */}
      <div className="flex items-baseline justify-between border-b border-border px-12 py-8">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
            <Sparkles className="h-3.5 w-3.5 text-pulse" strokeWidth={1.8} />
            financial workbook · kopanica-beravci 30 MW
          </div>
          <h1 className="font-display text-3xl uppercase tracking-tech-tight text-text-primary">
            finance
          </h1>
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-text-secondary">
            €{(capexTotal / 1_000_000).toFixed(1)}M capex · €{(revenueTotal / 1_000_000).toFixed(2)}M
            y1 revenue · €{(opexTotal / 1000).toFixed(0)}k opex
          </div>
        </div>
        <div className="hidden items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted md:flex">
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-agri animate-pulse-dot" />
          model reconciled to ribić breg
        </div>
      </div>

      {/* TAB BAR */}
      <div className="sticky top-0 z-10 flex gap-1 overflow-x-auto border-b border-border bg-canvas/90 px-12 py-3 backdrop-blur">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'inline-flex items-center gap-2 rounded-sm px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors',
                active
                  ? 'bg-pulse/15 text-pulse ring-1 ring-pulse/30'
                  : 'text-text-muted hover:bg-surface hover:text-text-secondary',
              )}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* BODY */}
      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="flex-1 px-12 py-10"
      >
        {tab === 'overview' && <OverviewTab />}
        {tab === 'model' && <ModelTab />}
        {tab === 'sensitivity' && <SensitivityTab />}
        {tab === 'montecarlo' && <MonteCarloTab />}
        {tab === 'debt' && <DebtTab />}
        {tab === 'comparables' && <ComparablesTab />}
        {tab === 'tornado' && <TornadoTab />}
        {tab === 'exit' && <ExitTab />}
      </motion.div>

      {/* FOOTER CTA */}
      <div className="flex justify-end border-t border-border px-12 py-6">
        <Link
          to="/subsidies"
          className="group inline-flex items-center gap-3 rounded-md border border-border-bright bg-surface px-5 py-3 transition-all hover:border-pulse hover:shadow-glow-pulse"
        >
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-text-secondary group-hover:text-pulse">
            review subsidies
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

/* ================================ OVERVIEW =============================== */

interface Toggles {
  netBilling: boolean;
  battery: boolean;
  fzoeu: boolean;
  npoo: boolean;
  agriGrant: boolean;
}

function OverviewTab() {
  const [toggles, setToggles] = useState<Toggles>({
    netBilling: true,
    battery: true,
    fzoeu: true,
    npoo: false,
    agriGrant: true,
  });

  const series = useMemo(() => buildCashflowSeries(toggles), [toggles]);
  const metrics = useMemo(() => buildCashflowMetrics(series), [series]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        {(Object.keys(toggles) as (keyof Toggles)[]).map((k) => (
          <Toggle
            key={k}
            label={toggleLabels[k]}
            on={toggles[k]}
            onToggle={() => setToggles((t) => ({ ...t, [k]: !t[k] }))}
            tone={toggleTones[k]}
          />
        ))}
      </div>

      <div className="rounded-lg border border-border bg-surface/40 p-6">
        <div className="h-[360px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
              <defs>
                <linearGradient id="fillPure" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(0 217 255)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="rgb(0 217 255)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="fillAgri" x1="0" y1="0" x2="0" y2="1">
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
                tickFormatter={(v) => `€${(v / 1_000_000).toFixed(0)}M`}
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
                formatter={(v: number) => [`€${(v / 1_000_000).toFixed(2)}M`]}
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
              <ReferenceLine y={0} stroke="rgb(82 82 91)" strokeDasharray="3 3" />
              <ReferenceLine
                x={Math.round(metrics.purePv.payback)}
                stroke="rgb(0 217 255)"
                strokeDasharray="3 3"
              />
              <ReferenceLine
                x={Math.round(metrics.agri.payback)}
                stroke="rgb(74 222 128)"
                strokeDasharray="3 3"
              />
              <Area
                type="monotone"
                dataKey="purePv"
                name="Pure PV"
                stroke="rgb(0 217 255)"
                strokeWidth={1.5}
                fill="url(#fillPure)"
              />
              <Area
                type="monotone"
                dataKey="agri"
                name="Agrivoltaic"
                stroke="rgb(74 222 128)"
                strokeWidth={2}
                fill="url(#fillAgri)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ScenarioCard label="PURE PV" tone="signal" metrics={metrics.purePv} />
        <ScenarioCard label="AGRIVOLTAIC" tone="agri" metrics={metrics.agri} highlighted />
      </div>

      {/* KPI vs target · bullet charts */}
      <BulletChart
        title="KPI tracker · actual vs target"
        description="Six bankable metrics · green band = good, sun = ok, spark = below bank covenant. Target marker = the number HBOR / Raiffeisen typically need to see."
        rows={[
          { label: 'Equity IRR', actual: 11.4, target: 11.0, max: 15, format: (v) => `${v.toFixed(1)}%`, bands: { poor: 0.5, ok: 0.7, good: 1.0 }, sub: 'equity · unlevered · base case 30 MW' },
          { label: 'DSCR · Year 1', actual: 1.78, target: 1.30, max: 2.4, format: (v) => `${v.toFixed(2)}×`, bands: { poor: 0.5, ok: 0.65, good: 1.0 }, sub: 'HBOR Zeleni covenant · 1.30× floor' },
          { label: 'Payback', actual: 7.4, target: 10, max: 15, direction: 'down', format: (v) => `${v.toFixed(1)} yr`, bands: { poor: 0.3, ok: 0.55, good: 1.0 }, sub: 'lower is better · 25-yr PPA tenor' },
          { label: 'Performance ratio', actual: 84.3, target: 82, max: 92, format: (v) => `${v.toFixed(1)}%`, bands: { poor: 0.75, ok: 0.85, good: 1.0 }, sub: 'O&M guarantee · Solida 5-yr contract' },
          { label: 'CAPEX / MW', actual: 700, target: 750, max: 900, direction: 'down', format: (v) => `€${v}k`, bands: { poor: 0.35, ok: 0.6, good: 1.0 }, sub: 'lower is better · Pannonian median €720k/MW' },
          { label: 'LCOE', actual: 42, target: 48, max: 70, direction: 'down', format: (v) => `€${v}/MWh`, bands: { poor: 0.3, ok: 0.55, good: 1.0 }, sub: 'lower is better · HROTE 2026 avg €94/MWh' },
        ]}
      />
    </div>
  );
}

/* ================================ MODEL ================================ */

function ModelTab() {
  const ebitda = revenueTotal - opexTotal;

  return (
    <div className="flex flex-col gap-8">
      {/* Waterfall — revenue → opex → ebitda → debt → tax → equity */}
      <div className="rounded-lg border border-border bg-surface/40 p-6">
        <div className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
          <Activity className="h-3.5 w-3.5 text-pulse" strokeWidth={1.8} />
          y1 cashflow waterfall · levered equity
        </div>
        <Waterfall
          steps={[
            { label: 'Revenue', value: revenueTotal, tone: 'agri' },
            { label: '− OpEx', value: -opexTotal, tone: 'spark' },
            { label: 'EBITDA', value: ebitda, tone: 'sun', running: true },
            { label: '− Debt service', value: -1_490_000, tone: 'signal' },
            { label: '− Tax (12% SME)', value: -(ebitda - 1_490_000) * 0.12, tone: 'spark' },
            {
              label: 'Equity FCF',
              value: (ebitda - 1_490_000) * 0.88,
              tone: 'pulse',
              running: true,
              emphasis: true,
            },
          ]}
        />
      </div>

      {/* Revenue stack */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface/40 p-6">
          <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
            revenue stack · annual
          </div>
          <div className="flex flex-col gap-3">
            {revenueStack.map((r) => (
              <StackRow
                key={r.label}
                label={r.label}
                value={r.annualEur}
                total={revenueTotal}
                tone={r.tone}
                note={r.note}
              />
            ))}
            <div className="mt-2 flex items-baseline justify-between border-t border-border-bright pt-3 font-mono text-sm">
              <span className="uppercase tracking-[0.22em] text-text-muted">total</span>
              <span className="tabular-nums text-agri">
                €{(revenueTotal / 1_000_000).toFixed(2)}M
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-surface/40 p-6">
          <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
            opex breakdown · annual
          </div>
          <div className="flex flex-col gap-3">
            {opexLines.map((l) => (
              <StackRow
                key={l.label}
                label={l.label}
                value={l.annualEur}
                total={opexTotal}
                tone="spark"
                note={`${l.pctOfRevenue.toFixed(1)}% of revenue · ${l.note}`}
              />
            ))}
            <div className="mt-2 flex items-baseline justify-between border-t border-border-bright pt-3 font-mono text-sm">
              <span className="uppercase tracking-[0.22em] text-text-muted">total</span>
              <span className="tabular-nums text-spark">
                €{(opexTotal / 1000).toFixed(0)}k
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Capex breakdown */}
      <div className="rounded-lg border border-border bg-surface/40 p-6">
        <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
          capex breakdown · upfront
        </div>
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-md border border-border bg-border md:grid-cols-3">
          {capexBreakdown.map((c) => (
            <div key={c.label} className="flex flex-col gap-1.5 bg-surface/60 p-4">
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
                  {c.label}
                </span>
                <span className="font-mono text-[10px] tabular-nums text-text-muted">
                  {c.pct.toFixed(1)}%
                </span>
              </div>
              <span className="font-display text-xl tracking-tech-tight text-text-primary">
                €{(c.eur / 1_000_000).toFixed(2)}M
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
                {c.note}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-baseline justify-between border-t border-border pt-3 font-mono text-sm">
          <span className="uppercase tracking-[0.22em] text-text-muted">total capex</span>
          <span className="tabular-nums text-sun">€{(capexTotal / 1_000_000).toFixed(2)}M</span>
        </div>
      </div>

      {/* P&L snapshot */}
      <div className="rounded-lg border border-border bg-surface/40 p-6">
        <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
          P&amp;L snapshot · y1 · y5 · y10 · y25
        </div>
        <table className="w-full font-mono text-[11px]">
          <thead>
            <tr className="border-b border-border-bright text-text-muted">
              <th className="py-2 text-left uppercase tracking-[0.22em]">line</th>
              <th className="py-2 text-right uppercase tracking-[0.22em]">y1</th>
              <th className="py-2 text-right uppercase tracking-[0.22em]">y5</th>
              <th className="py-2 text-right uppercase tracking-[0.22em]">y10</th>
              <th className="py-2 text-right uppercase tracking-[0.22em]">y25</th>
            </tr>
          </thead>
          <tbody>
            {plRows().map((row) => (
              <tr key={row.label} className="border-b border-border/50">
                <td className={cn('py-2', row.emphasis && 'text-text-primary')}>{row.label}</td>
                {row.values.map((v, i) => (
                  <td
                    key={i}
                    className={cn(
                      'py-2 text-right tabular-nums',
                      row.emphasis ? 'text-text-primary' : 'text-text-secondary',
                      row.tone === 'agri' && 'text-agri',
                      row.tone === 'spark' && 'text-spark',
                      row.tone === 'pulse' && 'text-pulse',
                    )}
                  >
                    {v < 0 ? `−€${(Math.abs(v) / 1000).toFixed(0)}k` : `€${(v / 1_000_000).toFixed(2)}M`}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============================== SENSITIVITY ============================== */

function SensitivityTab() {
  const prices = sensitivityAxes.pricePerMWh;
  const yields = sensitivityAxes.yieldKwhPerKwp;

  const grid = yields.map((y) =>
    prices.map((p) => ({ p, y, irr: sensitivityIrr(p, y) })),
  );

  const allIrr = grid.flat().map((c) => c.irr);
  const minIrr = Math.min(...allIrr);
  const maxIrr = Math.max(...allIrr);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
          2-axis sensitivity · equity IRR
        </div>
        <p className="max-w-2xl font-mono text-[11px] uppercase tracking-[0.22em] text-text-secondary">
          electricity price (x) × solar yield (y) → equity irr. operating point marked.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-surface/40 p-6 overflow-x-auto">
        <table className="border-separate border-spacing-[2px]">
          <thead>
            <tr>
              <th className="px-3 py-2 text-right font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
                yield ↓ · price →
              </th>
              {prices.map((p) => (
                <th
                  key={p}
                  className="px-3 py-2 text-right font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted"
                >
                  €{p}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grid.map((row, ri) => (
              <tr key={ri}>
                <td className="px-3 py-2 text-right font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
                  {yields[ri]}
                </td>
                {row.map((cell) => {
                  const norm = (cell.irr - minIrr) / (maxIrr - minIrr);
                  const isOp =
                    Math.abs(cell.p - sensitivityOperating.price) < 3 &&
                    Math.abs(cell.y - sensitivityOperating.yield) < 40;
                  return (
                    <td
                      key={cell.p}
                      className={cn(
                        'relative min-w-[58px] px-3 py-3 text-center font-mono text-[11px] tabular-nums transition-colors',
                        isOp && 'ring-2 ring-pulse',
                      )}
                      style={{
                        background: `rgb(74 222 128 / ${0.05 + norm * 0.55})`,
                        color: norm > 0.5 ? 'rgb(10 10 11)' : 'rgb(250 250 250)',
                      }}
                      title={`€${cell.p}/MWh · ${cell.y} kWh/kWp → ${cell.irr.toFixed(1)}% IRR`}
                    >
                      {cell.irr.toFixed(1)}
                      {isOp && (
                        <motion.span
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute -right-1.5 -top-1.5 inline-flex h-2 w-2 rounded-full bg-pulse shadow-glow-pulse"
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Stat label="operating IRR" value={`${sensitivityOperating.irr.toFixed(1)}%`} tone="pulse" />
        <Stat label="best case" value={`${maxIrr.toFixed(1)}%`} sub="€140/MWh · 1,500 kWh" tone="agri" />
        <Stat label="worst case" value={`${minIrr.toFixed(1)}%`} sub="€60/MWh · 1,200 kWh" tone="spark" />
      </div>
    </div>
  );
}

/* ============================== MONTE CARLO ============================== */

function MonteCarloTab() {
  const [seed, setSeed] = useState(0);
  const [runs, setRuns] = useState<ReturnType<typeof runMonteCarlo>>([]);

  useEffect(() => {
    setRuns(runMonteCarlo(monteCarloSeed.runs, seed));
  }, [seed]);

  const bands = useMemo(() => buildPercentileBands(runs), [runs]);
  const irrDistribution = useMemo(() => buildIrrHistogram(runs), [runs]);
  const npvDistribution = useMemo(() => buildNpvHistogram(runs), [runs]);

  const sortedIrr = runs.length
    ? runs.map((r) => r.finalIrr).sort((a, b) => a - b)
    : [0];
  const p10Irr = sortedIrr[Math.floor(sortedIrr.length * 0.1)] ?? 0;
  const medianIrr = sortedIrr[Math.floor(sortedIrr.length * 0.5)] ?? 0;
  const p90Irr = sortedIrr[Math.floor(sortedIrr.length * 0.9)] ?? 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Monte Carlo RAIN · cinematic particle simulation */}
      <div className="rounded-lg border border-border bg-surface/40 p-6">
        <MonteCarloRain baseIrrPct={11.4} stdDev={2.8} runs={1000} />
      </div>

      <div className="flex items-baseline justify-between">
        <div className="flex flex-col gap-2">
          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
            classical view · {monteCarloSeed.runs} runs · cumulative FCF fan
          </div>
          <p className="max-w-2xl font-mono text-[11px] uppercase tracking-[0.22em] text-text-secondary">
            sampling price · yield · capex · opex · degradation.
          </p>
        </div>
        <button
          onClick={() => setSeed((s) => s + 1)}
          className="inline-flex items-center gap-2 rounded-md border border-pulse/40 bg-pulse/10 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.22em] text-pulse transition-all hover:bg-pulse/20 hover:shadow-glow-pulse"
        >
          <Binary className="h-3.5 w-3.5" strokeWidth={1.8} />
          rerun simulation
        </button>
      </div>

      {/* Fan chart */}
      <div className="rounded-lg border border-border bg-surface/40 p-6">
        <div className="h-[340px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={bands} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
              <defs>
                <linearGradient id="p90Fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(124 92 255)" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="rgb(124 92 255)" stopOpacity={0.02} />
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
                tickFormatter={(v) => `€${(v / 1_000_000).toFixed(0)}M`}
              />
              <Tooltip
                contentStyle={{
                  background: 'rgb(17 17 19)',
                  border: '1px solid rgb(42 42 48)',
                  borderRadius: 6,
                  fontFamily: 'JetBrains Mono Variable, monospace',
                  fontSize: 11,
                }}
                formatter={(v: number) => [`€${(v / 1_000_000).toFixed(1)}M`]}
                labelStyle={{ color: 'rgb(138 138 148)' }}
              />
              <ReferenceLine y={0} stroke="rgb(82 82 91)" strokeDasharray="3 3" />
              <Area
                type="monotone"
                dataKey="p90"
                name="p90 best"
                stroke="rgb(124 92 255)"
                fill="url(#p90Fill)"
                strokeWidth={0.8}
                fillOpacity={1}
              />
              <Area
                type="monotone"
                dataKey="p10"
                name="p10 worst"
                stroke="rgb(124 92 255)"
                fill="rgb(10 10 11)"
                strokeWidth={0.8}
                fillOpacity={1}
              />
              <Line
                type="monotone"
                dataKey="p50"
                name="median"
                stroke="rgb(74 222 128)"
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Stat label="p10 · IRR" value={`${p10Irr.toFixed(1)}%`} sub="pessimistic tail" tone="spark" />
        <Stat label="median · IRR" value={`${medianIrr.toFixed(1)}%`} tone="pulse" />
        <Stat label="p90 · IRR" value={`${p90Irr.toFixed(1)}%`} sub="optimistic tail" tone="agri" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* IRR histogram */}
        <div className="rounded-lg border border-border bg-surface/40 p-6">
          <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
            IRR distribution
          </div>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={irrDistribution}>
                <XAxis
                  dataKey="bucket"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'rgb(138 138 148)', fontSize: 9, fontFamily: 'JetBrains Mono Variable' }}
                />
                <YAxis hide />
                <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                  {irrDistribution.map((d, i) => (
                    <Cell key={i} fill={d.bucket < 9 ? 'rgb(255 61 113)' : d.bucket > 13 ? 'rgb(74 222 128)' : 'rgb(124 92 255)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* NPV histogram */}
        <div className="rounded-lg border border-border bg-surface/40 p-6">
          <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
            NPV @ 8% discount · €M
          </div>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={npvDistribution}>
                <XAxis
                  dataKey="bucket"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'rgb(138 138 148)', fontSize: 9, fontFamily: 'JetBrains Mono Variable' }}
                />
                <YAxis hide />
                <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                  {npvDistribution.map((d, i) => (
                    <Cell key={i} fill={d.bucket < 10 ? 'rgb(255 61 113)' : d.bucket > 18 ? 'rgb(74 222 128)' : 'rgb(124 92 255)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================= DEBT ================================== */

function DebtTab() {
  const [dscr, setDscr] = useState(debtParams.dscrDefault);
  const [tenor, setTenor] = useState<number>(debtParams.tenorDefault);

  const ebitda = revenueTotal - opexTotal;
  const sizing = useMemo(() => maxDebtSize(ebitda, dscr, tenor), [dscr, tenor, ebitda]);

  const leveredIrr = useMemo(() => 11.4 + (sizing.gearing - 0.5) * 14, [sizing.gearing]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
          project-finance debt sizing · green loan
        </div>
        <p className="max-w-3xl font-mono text-[11px] uppercase tracking-[0.22em] text-text-secondary">
          dscr target drives max debt. tenor sets amortization. rate fixed at{' '}
          {(debtParams.ratePerAnnum * 100).toFixed(2)}% (SOFR + 200bps · green project finance).
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.2fr]">
        {/* controls */}
        <div className="flex flex-col gap-6 rounded-lg border border-border bg-surface/40 p-6">
          <RangeSlider
            label="DSCR target"
            unit="×"
            min={debtParams.dscrMin}
            max={debtParams.dscrMax}
            step={0.05}
            value={dscr}
            onChange={setDscr}
            tone="pulse"
            decimals={2}
          />
          <div className="flex flex-col gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
              tenor
            </span>
            <div className="flex gap-1 rounded-md border border-border bg-surface p-1">
              {debtParams.tenorOptions.map((t) => (
                <button
                  key={t}
                  onClick={() => setTenor(t)}
                  className={cn(
                    'flex-1 rounded-sm px-3 py-2 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors',
                    tenor === t
                      ? 'bg-pulse/15 text-pulse shadow-glow-pulse'
                      : 'text-text-secondary hover:bg-surface-raised hover:text-text-primary',
                  )}
                >
                  {t} yr
                </button>
              ))}
            </div>
          </div>

          <div className="mt-2 flex flex-col gap-3">
            <DebtRow label="y1 EBITDA" value={`€${(ebitda / 1_000_000).toFixed(2)}M`} />
            <DebtRow
              label="max annual debt service"
              value={`€${(sizing.debtService / 1_000_000).toFixed(2)}M`}
            />
            <DebtRow
              label="max debt size"
              value={`€${(sizing.maxDebt / 1_000_000).toFixed(1)}M`}
              tone="pulse"
              emphasis
            />
            <DebtRow
              label="equity required"
              value={`€${(sizing.equityIn / 1_000_000).toFixed(1)}M`}
              tone="sun"
            />
            <DebtRow
              label="gearing"
              value={`${(sizing.gearing * 100).toFixed(0)}%`}
            />
            <DebtRow
              label="unlevered IRR"
              value="11.4%"
            />
            <DebtRow
              label="levered IRR (equity)"
              value={`${leveredIrr.toFixed(1)}%`}
              tone="agri"
              emphasis
            />
          </div>
        </div>

        {/* capital stack bar */}
        <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface/40 p-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
            capital stack · €{(capexTotal / 1_000_000).toFixed(1)}M total
          </div>

          <div className="relative h-10 w-full overflow-hidden rounded-md bg-border">
            <motion.div
              className="absolute inset-y-0 left-0 bg-pulse"
              animate={{ width: `${sizing.gearing * 100}%` }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            />
            <motion.div
              className="absolute inset-y-0 bg-sun"
              animate={{
                left: `${sizing.gearing * 100}%`,
                width: `${(1 - sizing.gearing) * 100}%`,
              }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            />
            <div className="absolute inset-0 flex items-center justify-between px-3 font-mono text-[10px] uppercase tracking-[0.22em] text-canvas">
              <span className="font-semibold">
                debt · {(sizing.gearing * 100).toFixed(0)}%
              </span>
              <span className="font-semibold">
                equity · {((1 - sizing.gearing) * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-md border border-pulse/30 bg-pulse/5 p-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-pulse">
                senior debt
              </div>
              <div className="mt-1 font-display text-3xl tracking-tech-tight text-pulse">
                €{(sizing.maxDebt / 1_000_000).toFixed(1)}M
              </div>
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
                {tenor}-year · {(debtParams.ratePerAnnum * 100).toFixed(2)}% · DSCR {dscr.toFixed(2)}×
              </div>
            </div>
            <div className="rounded-md border border-sun/30 bg-sun/5 p-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-sun">
                sponsor equity
              </div>
              <div className="mt-1 font-display text-3xl tracking-tech-tight text-sun">
                €{(sizing.equityIn / 1_000_000).toFixed(1)}M
              </div>
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
                paladina investments · min 25%
              </div>
            </div>
          </div>

          <div className="mt-2 rounded-md border border-agri/30 bg-agri/5 p-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-agri">
              leverage effect on equity IRR
            </div>
            <div className="mt-1 flex items-baseline gap-3">
              <span className="font-display text-2xl tracking-tech-tight text-text-muted">11.4%</span>
              <ArrowRight className="h-4 w-4 text-agri" strokeWidth={2} />
              <span className="font-display text-3xl tracking-tech-tight text-agri">
                {leveredIrr.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================== COMPARABLES ============================== */

function ComparablesTab() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
          croatian utility-scale + agrivoltaic comparables
        </div>
        <p className="max-w-3xl font-mono text-[11px] uppercase tracking-[0.22em] text-text-secondary">
          operational or permitted projects. kopanica-beravci benchmarks against median €700k/MW, 11% IRR.
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-surface/40">
        <table className="w-full font-mono text-[11px]">
          <thead>
            <tr className="border-b border-border-bright bg-surface text-text-muted">
              <th className="px-4 py-3 text-left uppercase tracking-[0.22em]">project</th>
              <th className="px-4 py-3 text-left uppercase tracking-[0.22em]">operator</th>
              <th className="px-4 py-3 text-right uppercase tracking-[0.22em]">MW</th>
              <th className="px-4 py-3 text-right uppercase tracking-[0.22em]">ha</th>
              <th className="px-4 py-3 text-right uppercase tracking-[0.22em]">€/MW</th>
              <th className="px-4 py-3 text-right uppercase tracking-[0.22em]">yield</th>
              <th className="px-4 py-3 text-right uppercase tracking-[0.22em]">IRR</th>
              <th className="px-4 py-3 text-left uppercase tracking-[0.22em]">status</th>
              <th className="px-4 py-3 text-right uppercase tracking-[0.22em]">km to site</th>
            </tr>
          </thead>
          <tbody>
            {comparables.map((c) => (
              <tr
                key={c.name}
                className={cn(
                  'border-b border-border/40',
                  c.isBeravci && 'bg-agri/5 text-agri',
                )}
              >
                <td className="px-4 py-3 font-semibold">{c.name}</td>
                <td className="px-4 py-3 text-text-secondary">{c.operator}</td>
                <td className="px-4 py-3 text-right tabular-nums">{c.capacityMW}</td>
                <td className="px-4 py-3 text-right tabular-nums">{c.areaHa}</td>
                <td className="px-4 py-3 text-right tabular-nums">€{(c.capexPerMW / 1000).toFixed(0)}k</td>
                <td className="px-4 py-3 text-right tabular-nums">{c.yieldKwhPerKwp}</td>
                <td className="px-4 py-3 text-right tabular-nums">{c.irrEquity.toFixed(1)}%</td>
                <td className="px-4 py-3">
                  <StatusBadge status={c.status} />
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{c.distanceKm}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Stat label="median €/MW" value="€720k" sub="n = 6 comps" />
        <Stat label="median yield" value="1,370" sub="kWh/kWp" />
        <Stat label="median IRR" value="11.1%" sub="equity · unlevered" />
        <Stat label="kopanica-beravci vs median" value="−€20k / MW" sub="better capex" tone="agri" />
      </div>
    </div>
  );
}

/* ================================= EXIT ================================== */

function ExitTab() {
  const [capRate, setCapRate] = useState(exitAssumptions.capRateDefault);
  const ev = exitEv(capRate);
  const mom = equityMom(capRate);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
          exit scenario · year {exitAssumptions.yearOfExit}
        </div>
        <p className="max-w-3xl font-mono text-[11px] uppercase tracking-[0.22em] text-text-secondary">
          DCF exit at year {exitAssumptions.yearOfExit}. cap rate slider stresses EV / EBITDA.
          buyer type typically: infrastructure fund, utility strategic, or energy IPP roll-up.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.9fr_1fr]">
        <div className="flex flex-col gap-6 rounded-lg border border-border bg-surface/40 p-6">
          <RangeSlider
            label="exit cap rate"
            unit="%"
            min={exitAssumptions.capRateMin * 100}
            max={exitAssumptions.capRateMax * 100}
            step={0.1}
            value={capRate * 100}
            onChange={(v) => setCapRate(v / 100)}
            tone="sun"
            decimals={1}
          />

          <div className="flex flex-col gap-3">
            <DebtRow
              label="y10 stabilized EBITDA"
              value={`€${(exitAssumptions.year10Ebitda / 1_000_000).toFixed(2)}M`}
            />
            <DebtRow
              label="cap rate applied"
              value={`${(capRate * 100).toFixed(1)}%`}
              tone="sun"
            />
            <DebtRow
              label="enterprise value"
              value={`€${(ev / 1_000_000).toFixed(1)}M`}
              tone="sun"
              emphasis
            />
            <DebtRow
              label="residual debt y10"
              value="€6.8M"
            />
            <DebtRow
              label="equity at exit"
              value={`€${((ev - 6_800_000) / 1_000_000).toFixed(1)}M`}
            />
            <DebtRow
              label="equity invested"
              value={`€${(exitAssumptions.equityInvested / 1_000_000).toFixed(2)}M`}
            />
            <DebtRow
              label="cumulative distributions y1-y10"
              value={`€${(exitAssumptions.cumulativeDistributionsY1to10 / 1_000_000).toFixed(1)}M`}
            />
            <DebtRow
              label="equity multiple · MoM"
              value={`${mom.toFixed(2)}×`}
              tone="agri"
              emphasis
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 rounded-lg border border-sun/30 bg-sun/5 p-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-sun">
              exit EV · kopanica-beravci
            </div>
            <motion.div
              key={`ev-${ev.toFixed(0)}`}
              initial={{ opacity: 0.4, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="font-display text-5xl tracking-tech-tight text-sun"
            >
              €{(ev / 1_000_000).toFixed(1)}M
            </motion.div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
              {(capRate * 100).toFixed(1)}% cap · {(ev / exitAssumptions.year10Ebitda).toFixed(1)}× EBITDA
            </div>
          </div>

          <div className="flex flex-col gap-2 rounded-lg border border-agri/30 bg-agri/5 p-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-agri">
              equity multiple · money on money
            </div>
            <motion.div
              key={`mom-${mom.toFixed(2)}`}
              initial={{ opacity: 0.4, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="font-display text-5xl tracking-tech-tight text-agri"
            >
              {mom.toFixed(2)}×
            </motion.div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
              €{(exitAssumptions.equityInvested / 1_000_000).toFixed(1)}M equity in · €{((ev - 6_800_000 + exitAssumptions.cumulativeDistributionsY1to10) / 1_000_000).toFixed(1)}M total return
            </div>
          </div>

          <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface/40 p-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
              benchmark · vs kupari 10% paper
            </div>
            <div className="flex items-baseline gap-4">
              <div className="flex flex-col">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
                  kopanica-beravci exit
                </span>
                <span className="font-display text-2xl tracking-tech-tight text-agri">
                  €{(ev / 1_000_000).toFixed(1)}M
                </span>
              </div>
              <ArrowRight className="h-5 w-5 text-text-muted" strokeWidth={2} />
              <div className="flex flex-col">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
                  kupari 10% paper
                </span>
                <span className="font-display text-2xl tracking-tech-tight text-text-muted line-through decoration-text-muted/60">
                  €{(exitAssumptions.kupariStakePaper / 1_000_000).toFixed(1)}M
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
                  ratio
                </span>
                <span className="font-display text-2xl tracking-tech-tight text-pulse">
                  {(ev / exitAssumptions.kupariStakePaper).toFixed(1)}×
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================ HELPERS =============================== */

const toggleLabels: Record<keyof Toggles, string> = {
  netBilling: 'Net-billing (post-2026)',
  battery: 'Battery storage',
  fzoeu: 'FZOEU subsidy · 40%',
  npoo: 'NPOO subsidy · 60%',
  agriGrant: 'Agricultural grant',
};

const toggleTones: Record<keyof Toggles, 'pulse' | 'signal' | 'sun' | 'agri' | 'spark'> = {
  netBilling: 'signal',
  battery: 'pulse',
  fzoeu: 'sun',
  npoo: 'sun',
  agriGrant: 'agri',
};

function buildCashflowSeries(t: Toggles) {
  const subsidy = (t.fzoeu ? 0.4 : 0) + (t.npoo ? 0.2 : 0);
  const netMult = t.netBilling ? 0.9 : 1;
  const batteryMult = t.battery ? 1.08 : 1;
  const agriMult = t.agriGrant ? 1.12 : 1;

  const capexPure = 28_000_000 * (1 - subsidy * 0.75);
  const capexAgri = 21_000_000 * (1 - subsidy);
  const revenuePure = 3_600_000 * batteryMult * netMult;
  const revenueAgri = 4_200_000 * batteryMult * netMult * agriMult;

  return Array.from({ length: 26 }, (_, i) => {
    const year = i;
    const purePv = year === 0 ? -capexPure : -capexPure + revenuePure * year * 1.02;
    const agri = year === 0 ? -capexAgri : -capexAgri + revenueAgri * year * 1.03;
    return { year, purePv, agri };
  });
}

function buildCashflowMetrics(series: ReturnType<typeof buildCashflowSeries>) {
  const last = series[series.length - 1];
  const paybackOf = (key: 'purePv' | 'agri') => {
    for (let i = 0; i < series.length; i++) if (series[i][key] >= 0) return series[i].year;
    return 25;
  };
  return {
    purePv: { payback: paybackOf('purePv'), irr: 9.2, npv20: last.purePv, revenue: 72_000_000, landEff: 78 },
    agri: { payback: paybackOf('agri'), irr: 11.4, npv20: last.agri, revenue: 84_000_000, landEff: 65 },
  };
}

function plRows(): { label: string; values: number[]; emphasis?: boolean; tone?: 'agri' | 'spark' | 'pulse' }[] {
  const revY1 = revenueTotal;
  const opexY1 = opexTotal;
  const yIdx = (y: number, infl = 0.02) => Math.pow(1 + infl, y - 1);
  const degradation = (y: number) => Math.pow(1 - 0.005, y - 1);
  const rev = (y: number) => revY1 * yIdx(y) * degradation(y);
  const opex = (y: number) => opexY1 * yIdx(y);
  const ebitda = (y: number) => rev(y) - opex(y);
  const debt = (y: number) => (y <= 15 ? 1_490_000 : 0);
  const tax = (y: number) => Math.max(0, (ebitda(y) - debt(y)) * 0.12);
  const equity = (y: number) => ebitda(y) - debt(y) - tax(y);

  return [
    { label: 'Revenue', values: [rev(1), rev(5), rev(10), rev(25)], tone: 'agri' },
    { label: 'OpEx', values: [-opex(1), -opex(5), -opex(10), -opex(25)], tone: 'spark' },
    { label: 'EBITDA', values: [ebitda(1), ebitda(5), ebitda(10), ebitda(25)], emphasis: true, tone: 'pulse' },
    { label: 'Debt service', values: [-debt(1), -debt(5), -debt(10), -debt(25)] },
    { label: 'Tax (12%)', values: [-tax(1), -tax(5), -tax(10), -tax(25)], tone: 'spark' },
    { label: 'Equity FCF', values: [equity(1), equity(5), equity(10), equity(25)], emphasis: true, tone: 'agri' },
  ];
}

/* ----------------------------- Monte Carlo --------------------------------- */

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function normal(rng: () => number, mean: number, std: number) {
  // Box-Muller
  const u1 = Math.max(rng(), 1e-9);
  const u2 = rng();
  return mean + std * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

function runMonteCarlo(n: number, seed: number) {
  const rng = mulberry32(seed * 1337 + 42);
  const runs: { cumulative: number[]; finalIrr: number; finalNpv: number }[] = [];
  const capex = capexTotal;

  for (let r = 0; r < n; r++) {
    const price = Math.max(30, normal(rng, monteCarloSeed.priceMean, monteCarloSeed.priceStd));
    const yieldKwh = Math.max(800, normal(rng, monteCarloSeed.yieldMean, monteCarloSeed.yieldStd));
    const capexDelta = 1 + normal(rng, 0, monteCarloSeed.capexDeltaStd);
    const opexDelta = 1 + normal(rng, 0, monteCarloSeed.opexDeltaStd);
    const degradation = Math.max(0.001, normal(rng, monteCarloSeed.degradationYearlyMean, monteCarloSeed.degradationYearlyStd));

    const cap = capex * capexDelta;
    const revY1 = 30 * 1000 * yieldKwh * (price / 1000);
    const opY1 = opexTotal * opexDelta;

    const cumulative: number[] = [-cap];
    let npv = -cap;
    let running = -cap;
    for (let y = 1; y <= 25; y++) {
      const degr = Math.pow(1 - degradation, y - 1);
      const rev = revY1 * degr * Math.pow(1.02, y - 1);
      const op = opY1 * Math.pow(1.02, y - 1);
      const cf = rev - op;
      running += cf;
      cumulative.push(running);
      npv += cf / Math.pow(1.08, y);
    }
    // IRR via bisection
    const finalIrr = solveIrr(revY1, opY1, cap, degradation);
    runs.push({ cumulative, finalIrr, finalNpv: npv });
  }
  return runs;
}

function solveIrr(revY1: number, opY1: number, cap: number, degr: number) {
  // Simplified IRR via bisection on NPV = 0 over 25 years
  let lo = 0;
  let hi = 0.35;
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2;
    let npv = -cap;
    for (let y = 1; y <= 25; y++) {
      const cf = revY1 * Math.pow(1 - degr, y - 1) * Math.pow(1.02, y - 1) - opY1 * Math.pow(1.02, y - 1);
      npv += cf / Math.pow(1 + mid, y);
    }
    if (npv > 0) lo = mid;
    else hi = mid;
  }
  return ((lo + hi) / 2) * 100;
}

function buildPercentileBands(runs: ReturnType<typeof runMonteCarlo>) {
  if (!runs.length) return [];
  const years = runs[0].cumulative.length;
  const bands: { year: number; p10: number; p50: number; p90: number }[] = [];
  for (let y = 0; y < years; y++) {
    const vals = runs.map((r) => r.cumulative[y]).sort((a, b) => a - b);
    bands.push({
      year: y,
      p10: vals[Math.floor(vals.length * 0.1)],
      p50: vals[Math.floor(vals.length * 0.5)],
      p90: vals[Math.floor(vals.length * 0.9)],
    });
  }
  return bands;
}

function buildIrrHistogram(runs: ReturnType<typeof runMonteCarlo>) {
  const buckets: Record<number, number> = {};
  runs.forEach((r) => {
    const b = Math.round(r.finalIrr);
    buckets[b] = (buckets[b] || 0) + 1;
  });
  return Object.entries(buckets)
    .map(([bucket, count]) => ({ bucket: Number(bucket), count }))
    .sort((a, b) => a.bucket - b.bucket);
}

function buildNpvHistogram(runs: ReturnType<typeof runMonteCarlo>) {
  const buckets: Record<number, number> = {};
  runs.forEach((r) => {
    const b = Math.round(r.finalNpv / 1_000_000);
    buckets[b] = (buckets[b] || 0) + 1;
  });
  return Object.entries(buckets)
    .map(([bucket, count]) => ({ bucket: Number(bucket), count }))
    .sort((a, b) => a.bucket - b.bucket);
}

/* ================================ UI BITS ================================ */

function Toggle({
  label,
  on,
  onToggle,
  tone,
}: {
  label: string;
  on: boolean;
  onToggle: () => void;
  tone: 'pulse' | 'signal' | 'sun' | 'agri' | 'spark';
}) {
  const onClass = {
    pulse: 'bg-pulse/15 text-pulse ring-pulse/40',
    signal: 'bg-signal/15 text-signal ring-signal/40',
    sun: 'bg-sun/15 text-sun ring-sun/40',
    agri: 'bg-agri/15 text-agri ring-agri/40',
    spark: 'bg-spark/15 text-spark ring-spark/40',
  }[tone];
  return (
    <button
      onClick={onToggle}
      className={cn(
        'inline-flex items-center gap-2 rounded-sm border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] transition-all',
        on ? cn('ring-1', onClass) : 'bg-surface text-text-muted hover:text-text-secondary',
      )}
    >
      <span
        className={cn(
          'inline-block h-2 w-2 rounded-full transition-colors',
          on ? 'bg-current' : 'bg-border-bright',
        )}
      />
      {label}
    </button>
  );
}

function ScenarioCard({
  label,
  tone,
  metrics,
  highlighted,
}: {
  label: string;
  tone: 'signal' | 'agri';
  metrics: { payback: number; irr: number; npv20: number; revenue: number; landEff: number };
  highlighted?: boolean;
}) {
  const toneColor = tone === 'agri' ? 'text-agri' : 'text-signal';
  return (
    <motion.div
      layout
      className={cn(
        'flex flex-col gap-4 rounded-lg border p-6 transition-all',
        highlighted ? 'border-agri/40 bg-agri/5 shadow-glow-pulse' : 'border-border bg-surface/40',
      )}
    >
      <div className="flex items-baseline justify-between">
        <span className={cn('font-mono text-sm tracking-[0.22em]', toneColor)}>{label}</span>
        {highlighted && (
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-agri">
            recommended
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 font-mono text-xs">
        <MetricRow label="Payback" value={`${metrics.payback.toFixed(1)} yr`} tone={toneColor} />
        <MetricRow label="IRR" value={`${metrics.irr.toFixed(1)}%`} tone={toneColor} />
        <MetricRow label="NPV (25 yr)" value={`€${(metrics.npv20 / 1_000_000).toFixed(1)}M`} />
        <MetricRow label="Total revenue" value={`€${(metrics.revenue / 1_000_000).toFixed(0)}M`} />
        <MetricRow label="Land efficiency" value={highlighted ? `${metrics.landEff}% + ag` : `${metrics.landEff}%`} />
      </div>
    </motion.div>
  );
}

function MetricRow({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-border/50 py-1.5">
      <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted">{label}</span>
      <span className={cn('tabular-nums', tone ?? 'text-text-primary')}>{value}</span>
    </div>
  );
}

function Waterfall({ steps }: { steps: { label: string; value: number; tone: string; running?: boolean; emphasis?: boolean }[] }) {
  let running = 0;
  const max = Math.max(...steps.map((s) => (s.running ? Math.abs(s.value) : Math.abs(s.value + running))));
  const maxVisual = Math.max(max, 1);

  return (
    <div className="flex h-48 items-end gap-3">
      {steps.map((s, i) => {
        const isRunning = s.running;
        const value = isRunning ? s.value : s.value;
        if (!isRunning) running += s.value;
        else running = s.value;

        const heightPct = (Math.abs(value) / maxVisual) * 85;
        const isNegative = value < 0;
        const toneClass = {
          agri: 'bg-agri',
          spark: 'bg-spark',
          sun: 'bg-sun',
          signal: 'bg-signal',
          pulse: 'bg-pulse',
        }[s.tone] || 'bg-text-muted';

        return (
          <div key={i} className="flex flex-1 flex-col items-center gap-2">
            <span className="font-mono text-[10px] tabular-nums text-text-secondary">
              {value < 0 ? '−' : ''}€{Math.abs(value / 1_000_000).toFixed(2)}M
            </span>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${heightPct}%` }}
              transition={{ duration: 0.6, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                'w-full rounded-sm',
                toneClass,
                s.emphasis && 'shadow-glow-pulse',
                isNegative && 'opacity-70',
              )}
            />
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted text-center">
              {s.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function StackRow({
  label,
  value,
  total,
  tone,
  note,
}: {
  label: string;
  value: number;
  total: number;
  tone: 'pulse' | 'agri' | 'sun' | 'signal' | 'spark';
  note?: string;
}) {
  const pct = (value / total) * 100;
  const toneBg = {
    pulse: 'bg-pulse',
    agri: 'bg-agri',
    sun: 'bg-sun',
    signal: 'bg-signal',
    spark: 'bg-spark',
  }[tone];
  const toneText = {
    pulse: 'text-pulse',
    agri: 'text-agri',
    sun: 'text-sun',
    signal: 'text-signal',
    spark: 'text-spark',
  }[tone];
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-text-secondary">
          {label}
        </span>
        <span className={cn('font-mono text-sm tabular-nums', toneText)}>
          €{(value / 1000).toFixed(0)}k
        </span>
      </div>
      <div className="relative h-1.5 overflow-hidden rounded-full bg-border">
        <motion.div
          className={cn('h-full', toneBg)}
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      {note && (
        <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
          {note}
        </span>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: 'pulse' | 'sun' | 'agri' | 'spark';
}) {
  const toneClass = {
    pulse: 'text-pulse',
    sun: 'text-sun',
    agri: 'text-agri',
    spark: 'text-spark',
  }[tone ?? 'pulse'];
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-surface/40 p-5">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
        {label}
      </span>
      <span className={cn('font-display text-3xl tracking-tech-tight', tone ? toneClass : 'text-text-primary')}>
        {value}
      </span>
      {sub && (
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
          {sub}
        </span>
      )}
    </div>
  );
}

function RangeSlider({
  label,
  unit,
  min,
  max,
  step,
  value,
  onChange,
  tone,
  decimals = 0,
}: {
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  tone: 'pulse' | 'sun' | 'agri';
  decimals?: number;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  const toneColor = {
    pulse: 'rgb(124, 92, 255)',
    sun: 'rgb(255, 184, 0)',
    agri: 'rgb(74, 222, 128)',
  }[tone];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
          {label}
        </span>
        <span className="font-mono text-sm tabular-nums" style={{ color: toneColor }}>
          {value.toFixed(decimals)} {unit}
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="slider-native absolute inset-0 w-full cursor-grab appearance-none bg-transparent outline-none"
          style={{ accentColor: toneColor }}
        />
        <div className="pointer-events-none h-1.5 w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full transition-[width] duration-150"
            style={{ width: `${pct}%`, background: toneColor }}
          />
        </div>
      </div>
    </div>
  );
}

function DebtRow({
  label,
  value,
  tone,
  emphasis,
}: {
  label: string;
  value: string;
  tone?: 'pulse' | 'sun' | 'agri' | 'spark';
  emphasis?: boolean;
}) {
  const toneClass = {
    pulse: 'text-pulse',
    sun: 'text-sun',
    agri: 'text-agri',
    spark: 'text-spark',
  }[tone ?? 'pulse'];
  return (
    <div
      className={cn(
        'flex items-baseline justify-between border-b border-border/50 pb-2',
        emphasis && 'pt-1',
      )}
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
        {label}
      </span>
      <motion.span
        key={value}
        initial={{ opacity: 0.5, y: -2 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className={cn(
          'font-mono tabular-nums',
          emphasis ? 'text-lg' : 'text-sm',
          tone ? toneClass : 'text-text-primary',
        )}
      >
        {value}
      </motion.span>
    </div>
  );
}

function StatusBadge({ status }: { status: 'operational' | 'construction' | 'permit' | 'queue' }) {
  const map = {
    operational: { text: 'OPERATIONAL', tone: 'text-agri bg-agri/10 border-agri/30' },
    construction: { text: 'CONSTRUCTION', tone: 'text-sun bg-sun/10 border-sun/30' },
    permit: { text: 'PERMIT', tone: 'text-pulse bg-pulse/10 border-pulse/30' },
    queue: { text: 'QUEUE', tone: 'text-text-muted bg-surface border-border' },
  }[status];
  return (
    <span
      className={cn(
        'inline-flex rounded-sm border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.22em]',
        map.tone,
      )}
    >
      {map.text}
    </span>
  );
}

/* =============================== TORNADO ================================ */

interface TornadoVar {
  id: string;
  label: string;
  group: 'market' | 'operations' | 'finance' | 'policy' | 'config';
  low: { label: string; irrDelta: number };
  high: { label: string; irrDelta: number };
  baseNote: string;
}

const tornadoVars: TornadoVar[] = [
  {
    id: 'price',
    label: 'Electricity price',
    group: 'market',
    low: { label: '−20% (€76/MWh)', irrDelta: -4.5 },
    high: { label: '+20% (€114/MWh)', irrDelta: +4.5 },
    baseNote: 'HROTE 25-yr PPA @ €95/MWh base',
  },
  {
    id: 'capex',
    label: 'CAPEX overrun',
    group: 'finance',
    low: { label: '−15% (EPC under-bid)', irrDelta: +3.3 },
    high: { label: '+15% (supply shock)', irrDelta: -3.3 },
    baseNote: '€700k/MW base · Chinese modules',
  },
  {
    id: 'npoo',
    label: 'NPOO grant',
    group: 'policy',
    low: { label: 'Denied', irrDelta: -3.1 },
    high: { label: 'Awarded €8.4M', irrDelta: +3.1 },
    baseNote: 'C1.2.R1-I1 application pending',
  },
  {
    id: 'debt-rate',
    label: 'Debt rate',
    group: 'finance',
    low: { label: '−150 bps', irrDelta: +2.8 },
    high: { label: '+150 bps (ECB hike)', irrDelta: -2.8 },
    baseNote: 'SOFR+200bps · 4.75% base · 15-yr tenor',
  },
  {
    id: 'fzoeu',
    label: 'FZOEU grant',
    group: 'policy',
    low: { label: 'Denied', irrDelta: -2.2 },
    high: { label: 'Awarded €4.2M', irrDelta: +2.2 },
    baseNote: 'OI-2026-03 deadline 2026-07-15',
  },
  {
    id: 'yield',
    label: 'Solar yield',
    group: 'operations',
    low: { label: '−10% (cloudy decade)', irrDelta: -2.1 },
    high: { label: '+10% (clear decade)', irrDelta: +2.1 },
    baseNote: '1,380 kWh/kWp base · PVGIS TMY',
  },
  {
    id: 'dscr',
    label: 'DSCR requirement',
    group: 'finance',
    low: { label: '1.2× (softer)', irrDelta: +1.6 },
    high: { label: '1.5× (stricter)', irrDelta: -1.6 },
    baseNote: 'Bank covenant · 1.3× base',
  },
  {
    id: 'tracking',
    label: 'Tracking type',
    group: 'config',
    low: { label: 'Fixed (−6% yield)', irrDelta: -1.4 },
    high: { label: '1-axis (+6% yield)', irrDelta: +1.4 },
    baseNote: 'Base: fixed · adds €250k/MW for tracker',
  },
  {
    id: 'opex',
    label: 'OPEX level',
    group: 'operations',
    low: { label: '−20% (optimized O&M)', irrDelta: +1.2 },
    high: { label: '+20% (unexpected issues)', irrDelta: -1.2 },
    baseNote: '€9.2k/MW/yr base · 25-yr average',
  },
  {
    id: 'curtailment',
    label: 'Grid curtailment',
    group: 'policy',
    low: { label: '0% (perfect)', irrDelta: +0.9 },
    high: { label: '3% (peak-hour)', irrDelta: -0.9 },
    baseNote: 'Zone forecast 1.0% in 2026 → 2.8% in 2030',
  },
  {
    id: 'battery',
    label: 'Battery size',
    group: 'config',
    low: { label: '0 MWh (no storage)', irrDelta: -0.8 },
    high: { label: '24 MWh', irrDelta: +0.8 },
    baseNote: 'Base: 12 MWh LFP · €280/kWh',
  },
  {
    id: 'agri',
    label: 'Under-panel agri income',
    group: 'operations',
    low: { label: '−50% (bad year)', irrDelta: -0.6 },
    high: { label: '+50% (premium wool)', irrDelta: +0.6 },
    baseNote: '€2,240/ha/yr sheep · 52 ha · CAP stacked',
  },
];

function TornadoTab() {
  // Sort by absolute impact (average of low/high magnitudes)
  const sorted = useMemo(
    () => [...tornadoVars].sort((a, b) => Math.max(Math.abs(b.low.irrDelta), Math.abs(b.high.irrDelta)) - Math.max(Math.abs(a.low.irrDelta), Math.abs(a.high.irrDelta))),
    [],
  );

  const baseIrr = 11.4;
  const maxAbs = Math.max(...sorted.flatMap((v) => [Math.abs(v.low.irrDelta), Math.abs(v.high.irrDelta)]));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-baseline justify-between">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
            tornado · IRR sensitivity to every input · sorted by magnitude
          </span>
          <p className="max-w-3xl font-mono text-[11px] text-text-secondary">
            Each variable is swung to its low and high case. Bar length = equity IRR delta from
            {' '}<span className="tabular-nums text-pulse">{baseIrr.toFixed(1)}%</span> base.
            Blue = downside, agri = upside.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <KpiBadge label="max downside" value={`${(baseIrr - maxAbs).toFixed(1)}%`} tone="spark" />
          <KpiBadge label="base IRR" value={`${baseIrr.toFixed(1)}%`} tone="pulse" />
          <KpiBadge label="max upside" value={`${(baseIrr + maxAbs).toFixed(1)}%`} tone="agri" />
        </div>
      </div>

      {/* Tornado */}
      <div className="rounded-lg border border-border bg-surface/40 p-6">
        <div className="relative">
          {/* Center axis */}
          <div
            className="absolute top-0 bottom-0 z-10 border-l border-dashed border-border-bright"
            style={{ left: '50%' }}
          />

          <div className="relative flex flex-col gap-1.5">
            {sorted.map((v, i) => {
              const lowPct = (v.low.irrDelta / maxAbs) * 48; // 48% each side
              const highPct = (v.high.irrDelta / maxAbs) * 48;
              return (
                <motion.div
                  key={v.id}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ duration: 0.4, delay: 0.04 * i }}
                  className="group relative grid grid-cols-[180px_1fr_80px] items-center gap-3 py-1"
                >
                  {/* Label + group tag */}
                  <div className="flex flex-col items-end">
                    <span className="font-mono text-[11px] text-text-primary">
                      {v.label}
                    </span>
                    <span className={cn(
                      'font-mono text-[8px] uppercase tracking-[0.22em]',
                      v.group === 'market' && 'text-sun',
                      v.group === 'operations' && 'text-pulse',
                      v.group === 'finance' && 'text-signal',
                      v.group === 'policy' && 'text-agri',
                      v.group === 'config' && 'text-text-muted',
                    )}>
                      {v.group}
                    </span>
                  </div>

                  {/* Bar zone */}
                  <div className="relative h-6">
                    {/* Low (left) bar */}
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${Math.abs(lowPct)}%` }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ duration: 0.9, delay: 0.1 + 0.04 * i, ease: [0.16, 1, 0.3, 1] }}
                      className={cn(
                        'absolute top-0 h-full rounded-l-sm',
                        v.low.irrDelta < 0 ? 'bg-spark/75' : 'bg-agri/75',
                      )}
                      style={{
                        right: '50%',
                      }}
                      title={v.low.label}
                    >
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[9px] tabular-nums text-canvas">
                        {v.low.irrDelta > 0 ? '+' : ''}{v.low.irrDelta.toFixed(1)}
                      </span>
                    </motion.div>

                    {/* High (right) bar */}
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${Math.abs(highPct)}%` }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ duration: 0.9, delay: 0.1 + 0.04 * i, ease: [0.16, 1, 0.3, 1] }}
                      className={cn(
                        'absolute top-0 h-full rounded-r-sm',
                        v.high.irrDelta > 0 ? 'bg-agri/75' : 'bg-spark/75',
                      )}
                      style={{
                        left: '50%',
                      }}
                      title={v.high.label}
                    >
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 font-mono text-[9px] tabular-nums text-canvas">
                        {v.high.irrDelta > 0 ? '+' : ''}{v.high.irrDelta.toFixed(1)}
                      </span>
                    </motion.div>
                  </div>

                  {/* Range */}
                  <span className="text-right font-mono text-[10px] tabular-nums text-text-muted">
                    ±{Math.max(Math.abs(v.low.irrDelta), Math.abs(v.high.irrDelta)).toFixed(1)} pp
                  </span>

                  {/* Hover note row */}
                  <div className="col-span-3 hidden gap-2 overflow-hidden px-2 pt-1 text-[9px] font-mono text-text-muted group-hover:flex">
                    <span className="inline-flex items-center gap-1 text-spark"><ArrowDown className="h-2.5 w-2.5" />{v.low.label}</span>
                    <span className="inline-flex items-center gap-1 text-agri"><ArrowUp className="h-2.5 w-2.5" />{v.high.label}</span>
                    <span className="ml-auto text-text-muted">{v.baseNote}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Axis labels */}
          <div className="mt-3 grid grid-cols-[180px_1fr_80px] items-center gap-3">
            <div />
            <div className="flex justify-between font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
              <span>{(baseIrr - maxAbs).toFixed(1)}%</span>
              <span className="-ml-2">{(baseIrr - maxAbs / 2).toFixed(1)}%</span>
              <span className="text-pulse">
                ← base {baseIrr.toFixed(1)}% →
              </span>
              <span>{(baseIrr + maxAbs / 2).toFixed(1)}%</span>
              <span>{(baseIrr + maxAbs).toFixed(1)}%</span>
            </div>
            <div />
          </div>
        </div>
      </div>

      {/* Group legend */}
      <div className="flex flex-wrap items-center gap-4 font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-sm bg-sun" /> market
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-sm bg-pulse" /> operations
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-sm bg-signal" /> finance
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-sm bg-agri" /> policy
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-sm bg-text-muted" /> config
        </span>
        <span className="ml-auto">hover a row to see low/high cases</span>
      </div>

      {/* Insight */}
      <div className="rounded-lg border border-pulse/30 bg-pulse/5 p-5">
        <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-pulse">
          <Sparkles className="h-3.5 w-3.5" strokeWidth={1.8} />
          what this tells an investor
        </div>
        <p className="font-mono text-[11px] leading-relaxed text-text-secondary">
          <span className="text-text-primary">Top 3 drivers of IRR are electricity price · CAPEX overrun · NPOO grant.</span>
          {' '}The downside tail is dominated by policy (grants denied) and market (price crash) — both hedgeable via a
          take-or-pay PPA and stacking domestic + EU subsidies. CAPEX overrun is the pure execution risk the operator
          owns. Everything below the top 5 moves IRR by less than {' '}
          <span className="text-pulse">2 percentage points</span> — second-order noise.
        </p>
      </div>
    </div>
  );
}

function KpiBadge({ label, value, tone }: { label: string; value: string; tone: 'pulse' | 'agri' | 'spark' }) {
  const t = { pulse: 'text-pulse border-pulse/30 bg-pulse/5', agri: 'text-agri border-agri/30 bg-agri/5', spark: 'text-spark border-spark/30 bg-spark/5' }[tone];
  return (
    <div className={cn('rounded-md border px-3 py-1.5', t)}>
      <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
        {label}
      </div>
      <div className={cn('font-display text-lg tracking-tech-tight', t.split(' ')[0])}>
        {value}
      </div>
    </div>
  );
}
