import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { cn } from '@paladian/ui';

interface Toggles {
  netBilling: boolean;
  battery: boolean;
  fzoeu: boolean;
  npoo: boolean;
  agriGrant: boolean;
}

export function RoiRoute() {
  const [toggles, setToggles] = useState<Toggles>({
    netBilling: true,
    battery: true,
    fzoeu: true,
    npoo: false,
    agriGrant: true,
  });

  const series = useMemo(() => buildSeries(toggles), [toggles]);
  const metrics = useMemo(() => buildMetrics(toggles), [toggles]);

  return (
    <section className="flex min-h-full flex-col gap-8 px-12 py-12">
      <div className="flex items-baseline justify-between border-b border-border pb-6">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
            20-year cashflow projection · beravci 38 MWp
          </div>
          <h1 className="mt-1 font-display text-3xl uppercase tracking-tech-tight text-text-primary">
            financial model
          </h1>
        </div>
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
      </div>

      {/* Chart */}
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
                tick={{
                  fill: 'rgb(138 138 148)',
                  fontSize: 10,
                  fontFamily: 'JetBrains Mono Variable',
                }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: 'rgb(138 138 148)',
                  fontSize: 10,
                  fontFamily: 'JetBrains Mono Variable',
                }}
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
                label={{
                  value: 'Pure PV payback',
                  position: 'insideTopRight',
                  fontSize: 10,
                  fill: 'rgb(0 217 255)',
                  fontFamily: 'JetBrains Mono Variable',
                }}
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

      {/* SCENARIO CARDS */}
      <div className="grid grid-cols-2 gap-4">
        <ScenarioCard label="PURE PV" tone="signal" metrics={metrics.purePv} />
        <ScenarioCard label="AGRIVOLTAIC" tone="agri" metrics={metrics.agri} highlighted />
      </div>

      <div className="mt-auto flex justify-end">
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

/* -------------------------------- helpers ---------------------------------- */

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

function buildSeries(t: Toggles) {
  const subsidy = (t.fzoeu ? 0.4 : 0) + (t.npoo ? 0.2 : 0);
  const netMult = t.netBilling ? 0.85 : 1;
  const batteryMult = t.battery ? 1.08 : 1;
  const agriMult = t.agriGrant ? 1.12 : 1;

  const capexPure = 41_500_000 * (1 - subsidy * 0.75);
  const capexAgri = 34_200_000 * (1 - subsidy);
  const revenuePure = 3_200_000 * batteryMult * netMult;
  const revenueAgri = 2_650_000 * batteryMult * netMult + 180_000 * agriMult;

  return Array.from({ length: 21 }, (_, i) => {
    const year = i;
    const purePv = year === 0 ? -capexPure : -capexPure + revenuePure * year * 1.02;
    const agri = year === 0 ? -capexAgri : -capexAgri + revenueAgri * year * 1.03;
    return { year, purePv, agri };
  });
}

function buildMetrics(t: Toggles) {
  const series = buildSeries(t);
  const last = series[series.length - 1];
  const paybackOf = (key: 'purePv' | 'agri') => {
    for (let i = 0; i < series.length; i++) if (series[i][key] >= 0) return series[i].year;
    return 20;
  };
  return {
    purePv: {
      payback: paybackOf('purePv'),
      irr: 7.8 + (t.fzoeu ? 0.8 : 0),
      npv20: last.purePv,
      revenue: 64_000_000,
      landEff: 78,
    },
    agri: {
      payback: paybackOf('agri'),
      irr: 11.4 + (t.fzoeu ? 1.2 : 0) + (t.npoo ? 1.8 : 0),
      npv20: last.agri,
      revenue: 73_000_000,
      landEff: 65,
    },
  };
}

/* --------------------------------- Toggle -------------------------------- */

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
        on
          ? cn('ring-1', onClass)
          : 'bg-surface text-text-muted hover:text-text-secondary',
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

/* ----------------------------- ScenarioCard ------------------------------ */

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
        highlighted
          ? 'border-agri/40 bg-agri/5 shadow-glow-pulse'
          : 'border-border bg-surface/40',
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
        <Row label="Payback" value={`${metrics.payback.toFixed(1)} yr`} tone={toneColor} />
        <Row label="IRR" value={`${metrics.irr.toFixed(1)}%`} tone={toneColor} />
        <Row label="NPV (20 yr)" value={`€${(metrics.npv20 / 1_000_000).toFixed(1)}M`} />
        <Row label="Total revenue" value={`€${(metrics.revenue / 1_000_000).toFixed(0)}M`} />
        <Row
          label="Land efficiency"
          value={
            highlighted ? `${metrics.landEff}% + ag` : `${metrics.landEff}%`
          }
        />
      </div>
    </motion.div>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-border/50 py-1.5">
      <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted">{label}</span>
      <span className={cn('tabular-nums', tone ?? 'text-text-primary')}>{value}</span>
    </div>
  );
}
