import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Bookmark,
  Layers,
  RotateCcw,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { cn } from '@paladian/ui';
import { configs } from '@/mock/configs';
import { panelCatalog, storageChemistries } from '@/mock/configDeep';
import { useConfigStore, type ConfigState } from '@/store/configStore';
import { DnaGlyph } from '@/components/DnaGlyph';
import { ScenarioShareControls } from '@/components/ScenarioShareControls';
import {
  useScenariosStore,
  type ScenarioEntry,
  type ScenarioSlot,
} from '@/store/scenariosStore';
import {
  deriveMetrics,
  metricLabels,
  type DerivedMetrics,
} from '@/lib/deriveMetrics';

const ROW_ORDER: (keyof DerivedMetrics)[] = [
  'capexEur',
  'revenueEur',
  'opexEur',
  'ebitdaEur',
  'yieldGWh',
  'lcoeEurPerMWh',
  'irrPct',
  'paybackYears',
  'npv25Eur',
  'exitEvEur',
  'equityMom',
  'gearingPct',
  'co2Tons',
  'households',
  'agriIncomeEur',
  'agriMaintainedPct',
  'performanceRatioPct',
  'moduleCount',
  'inverterCount',
];

const TONE_BG: Record<ScenarioSlot, string> = {
  A: 'border-pulse/40 bg-pulse/5 text-pulse',
  B: 'border-signal/40 bg-signal/5 text-signal',
  C: 'border-agri/40 bg-agri/5 text-agri',
};

const TONE_ACCENT: Record<ScenarioSlot, string> = {
  A: 'text-pulse bg-pulse',
  B: 'text-signal bg-signal',
  C: 'text-agri bg-agri',
};

export function ScenariosRoute() {
  const scenarios = useScenariosStore((s) => s.scenarios);
  const saveScenario = useScenariosStore((s) => s.save);
  const removeScenario = useScenariosStore((s) => s.remove);
  const clearAll = useScenariosStore((s) => s.clearAll);
  const snapshot = useConfigStore((s) => s.snapshot);
  const hydrate = useConfigStore((s) => s.hydrate);
  const liveState = useConfigStore((s) => ({
    activeScenario: s.activeScenario,
    capacityMW: s.capacityMW,
    battery: s.battery,
    tracking: s.tracking,
    underPanel: s.underPanel,
  }));

  const filledCount = (['A', 'B', 'C'] as ScenarioSlot[]).filter(
    (slot) => scenarios[slot] !== null,
  ).length;

  // Compute metrics for each filled scenario
  const derived = useMemo(() => {
    const out: Partial<Record<ScenarioSlot, DerivedMetrics>> = {};
    (['A', 'B', 'C'] as ScenarioSlot[]).forEach((slot) => {
      const e = scenarios[slot];
      if (e) out[slot] = deriveMetrics(e.config);
    });
    return out;
  }, [scenarios]);

  const handleSaveFromLive = (slot: ScenarioSlot) => {
    const current = snapshot();
    const defaultName = `${configs[current.activeScenario].name} · ${current.capacityMW}MW${current.battery ? ` · ${current.battery}MWh` : ''}`;
    saveScenario(slot, defaultName, current);
  };

  const handleLoad = (config: ConfigState) => {
    hydrate(config);
  };

  return (
    <section className="flex min-h-full flex-col">
      {/* HEADER */}
      <div className="flex items-baseline justify-between border-b border-border px-12 py-8">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
            <Layers className="h-3.5 w-3.5 text-pulse" strokeWidth={1.8} />
            scenarios lab · a / b / c · {filledCount} of 3 saved
          </div>
          <h1 className="font-display text-3xl uppercase tracking-tech-tight text-text-primary">
            side-by-side compare
          </h1>
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-text-secondary">
            lock three configurations · every metric · green = better · red = worse · vs scenario a
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
            live config · {configs[liveState.activeScenario].name} · {liveState.capacityMW} MW
          </span>
          <ScenarioShareControls />
          {filledCount > 0 && (
            <button
              onClick={clearAll}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted transition-colors hover:border-spark hover:text-spark"
            >
              <RotateCcw className="h-3 w-3" strokeWidth={1.8} />
              clear all
            </button>
          )}
        </div>
      </div>

      {/* EMPTY STATE */}
      {filledCount === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 py-24">
          <Layers className="h-16 w-16 text-pulse/50 animate-pulse-dot" strokeWidth={1.2} />
          <div className="flex max-w-xl flex-col items-center gap-3 text-center">
            <h2 className="font-display text-2xl uppercase tracking-tech-tight text-text-primary">
              no scenarios yet
            </h2>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-text-secondary">
              open the configurator · tune the sliders · press ⌘K to save as A, B, or C. <br />
              the lab auto-compares every metric the moment a second scenario lands.
            </p>
            <Link
              to="/configurator"
              className="mt-4 inline-flex items-center gap-3 rounded-md border border-pulse/40 bg-pulse/5 px-5 py-3 transition-all hover:border-pulse hover:shadow-glow-pulse"
            >
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-pulse">
                open configurator
              </span>
              <ArrowRight className="h-4 w-4 text-pulse" strokeWidth={1.8} />
            </Link>
          </div>
        </div>
      )}

      {filledCount > 0 && (
        <>
          {/* SCENARIO CARDS */}
          <div className="grid grid-cols-1 gap-4 border-b border-border px-12 py-10 lg:grid-cols-3">
            {(['A', 'B', 'C'] as ScenarioSlot[]).map((slot) => {
              const entry = scenarios[slot];
              return (
                <ScenarioCard
                  key={slot}
                  slot={slot}
                  entry={entry}
                  onSave={() => handleSaveFromLive(slot)}
                  onRemove={() => removeScenario(slot)}
                  onLoad={() => entry && handleLoad(entry.config)}
                  metrics={entry ? derived[slot] : undefined}
                />
              );
            })}
          </div>

          {/* METRIC TABLE */}
          <div className="border-b border-border px-12 py-10">
            <div className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
              metric comparison · delta shown vs scenario a
            </div>
            <div className="overflow-x-auto rounded-lg border border-border bg-surface/40">
              <table className="w-full font-mono text-[11px]">
                <thead>
                  <tr className="border-b border-border-bright bg-surface text-text-muted">
                    <th className="px-4 py-3 text-left uppercase tracking-[0.22em]">metric</th>
                    {(['A', 'B', 'C'] as ScenarioSlot[]).map((slot) => {
                      const entry = scenarios[slot];
                      return (
                        <th
                          key={slot}
                          className={cn(
                            'px-4 py-3 text-right uppercase tracking-[0.22em]',
                            entry ? TONE_BG[slot].split(' ')[2] : 'text-text-muted',
                          )}
                        >
                          {slot} · {entry?.name.slice(0, 28) ?? '—'}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {ROW_ORDER.map((key) => (
                    <MetricRow
                      key={key}
                      metricKey={key}
                      scenarios={scenarios}
                      derived={derived}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* BAR CHART — IRR · PAYBACK · CAPEX */}
          <div className="border-b border-border bg-surface/20 px-12 py-10">
            <div className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
              key metrics · visual compare
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <ChartBlock title="IRR · equity %" keyMetric="irrPct" scenarios={scenarios} derived={derived} higherIsBetter />
              <ChartBlock title="Payback · years" keyMetric="paybackYears" scenarios={scenarios} derived={derived} higherIsBetter={false} />
              <ChartBlock title="CAPEX · €M" keyMetric="capexEur" scenarios={scenarios} derived={derived} higherIsBetter={false} divide={1_000_000} unit="M" />
            </div>
          </div>
        </>
      )}

      {/* FOOTER CTA */}
      <div className="flex justify-end border-t border-border px-12 py-6">
        <Link
          to="/thesis"
          className="group inline-flex items-center gap-3 rounded-md border border-border-bright bg-surface px-5 py-3 transition-all hover:border-pulse hover:shadow-glow-pulse"
        >
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-text-secondary group-hover:text-pulse">
            compile dossier
          </span>
          <ArrowRight className="h-4 w-4 text-text-secondary transition-transform group-hover:translate-x-0.5 group-hover:text-pulse" strokeWidth={1.8} />
        </Link>
      </div>
    </section>
  );
}

/* ============================== ScenarioCard ============================== */

function ScenarioCard({
  slot,
  entry,
  onSave,
  onRemove,
  onLoad,
  metrics,
}: {
  slot: ScenarioSlot;
  entry: ScenarioEntry | null;
  onSave: () => void;
  onRemove: () => void;
  onLoad: () => void;
  metrics?: DerivedMetrics;
}) {
  if (!entry) {
    return (
      <div className={cn('flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-surface/30 p-6', 'border-border')}>
        <Bookmark className="h-6 w-6 text-text-muted" strokeWidth={1.5} />
        <span className="font-display text-3xl tracking-tech-tight text-text-muted">{slot}</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
          slot empty
        </span>
        <button
          onClick={onSave}
          className="mt-3 inline-flex items-center gap-2 rounded-md border border-border-bright bg-surface px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-text-secondary transition-colors hover:border-pulse hover:text-pulse"
        >
          save current config → {slot}
        </button>
      </div>
    );
  }

  const panel = panelCatalog.find((p) => p.id === entry.config.panelId);
  const chem = storageChemistries.find((c) => c.id === entry.config.batteryChem);
  const savedAt = new Date(entry.createdAt).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn('flex flex-col gap-3 rounded-lg border bg-surface/40 p-5 shadow-glow-pulse', TONE_BG[slot])}
    >
      <div className="flex items-baseline justify-between">
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-0.5">
            <span className={cn('font-display text-4xl tracking-tech-tight', TONE_BG[slot].split(' ')[2])}>
              {slot}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
              saved {savedAt}
            </span>
          </div>
          <DnaGlyph config={entry.config} size={72} />
        </div>
        <div className="flex gap-1">
          <button
            onClick={onLoad}
            className="rounded-md border border-border-bright bg-surface p-1.5 text-text-muted transition-colors hover:border-pulse hover:text-pulse"
            title="Load this scenario into the configurator"
          >
            <Upload className="h-3 w-3" strokeWidth={1.8} />
          </button>
          <button
            onClick={onSave}
            className="rounded-md border border-border-bright bg-surface p-1.5 text-text-muted transition-colors hover:border-agri hover:text-agri"
            title="Overwrite with current config"
          >
            <RotateCcw className="h-3 w-3" strokeWidth={1.8} />
          </button>
          <button
            onClick={onRemove}
            className="rounded-md border border-border-bright bg-surface p-1.5 text-text-muted transition-colors hover:border-spark hover:text-spark"
            title="Delete this scenario"
          >
            <Trash2 className="h-3 w-3" strokeWidth={1.8} />
          </button>
        </div>
      </div>

      <span className="font-mono text-[11px] text-text-primary">{entry.name}</span>

      <div className="mt-2 flex flex-col gap-1 border-t border-border/60 pt-2 font-mono text-[10px] text-text-secondary">
        <div className="flex items-baseline justify-between">
          <span className="uppercase tracking-[0.22em] text-text-muted">scenario</span>
          <span>{configs[entry.config.activeScenario].name}</span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="uppercase tracking-[0.22em] text-text-muted">capacity</span>
          <span className="tabular-nums">{entry.config.capacityMW} MWp</span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="uppercase tracking-[0.22em] text-text-muted">tracking</span>
          <span>{entry.config.tracking}</span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="uppercase tracking-[0.22em] text-text-muted">battery</span>
          <span className="tabular-nums">{entry.config.battery} MWh {entry.config.batteryChem.toUpperCase()}</span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="uppercase tracking-[0.22em] text-text-muted">under-panel</span>
          <span>{entry.config.underPanel}</span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="uppercase tracking-[0.22em] text-text-muted">panel</span>
          <span className="text-right">{panel?.manufacturer} · {panel?.wpPerModule}Wp</span>
        </div>
      </div>

      {metrics && (
        <div className="mt-2 grid grid-cols-2 gap-2 border-t border-border/60 pt-3 font-mono text-[11px]">
          <Kpi label="CAPEX" value={`€${(metrics.capexEur / 1_000_000).toFixed(1)}M`} />
          <Kpi label="IRR" value={`${metrics.irrPct.toFixed(1)}%`} tone={TONE_BG[slot].split(' ')[2]} />
          <Kpi label="Payback" value={`${metrics.paybackYears.toFixed(1)} yr`} />
          <Kpi label="Exit · y10" value={`€${(metrics.exitEvEur / 1_000_000).toFixed(0)}M`} tone={TONE_BG[slot].split(' ')[2]} />
        </div>
      )}
    </motion.div>
  );
}

function Kpi({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[9px] uppercase tracking-[0.22em] text-text-muted">{label}</span>
      <span className={cn('font-display text-lg tracking-tech-tight', tone ?? 'text-text-primary')}>{value}</span>
    </div>
  );
}

/* ============================== MetricRow ============================== */

function MetricRow({
  metricKey,
  scenarios,
  derived,
}: {
  metricKey: keyof DerivedMetrics;
  scenarios: Record<ScenarioSlot, ScenarioEntry | null>;
  derived: Partial<Record<ScenarioSlot, DerivedMetrics>>;
}) {
  const meta = metricLabels[metricKey];
  const valueA = derived.A?.[metricKey];

  return (
    <tr className="border-b border-border/40">
      <td className="px-4 py-3 text-text-primary">{meta.label}</td>
      {(['A', 'B', 'C'] as ScenarioSlot[]).map((slot) => {
        const v = derived[slot]?.[metricKey];
        if (v === undefined || scenarios[slot] === null) {
          return <td key={slot} className="px-4 py-3 text-right text-text-muted tabular-nums">—</td>;
        }
        const delta = slot !== 'A' && valueA !== undefined ? (v - valueA) / Math.max(Math.abs(valueA), 0.01) : null;
        const deltaColor =
          delta === null || meta.betterHigher === null
            ? 'text-text-muted'
            : (meta.betterHigher && delta > 0) || (!meta.betterHigher && delta < 0)
              ? 'text-agri'
              : Math.abs(delta) < 0.005
                ? 'text-text-muted'
                : 'text-spark';
        const deltaSign = delta === null || Math.abs(delta) < 0.005 ? '' : delta > 0 ? '+' : '';
        return (
          <td key={slot} className="px-4 py-3 text-right tabular-nums">
            <div className="flex items-baseline justify-end gap-2">
              <span className="text-text-primary">{meta.format(v)}</span>
              {delta !== null && Math.abs(delta) >= 0.005 && (
                <span className={cn('font-mono text-[9px]', deltaColor)}>
                  {deltaSign}{(delta * 100).toFixed(1)}%
                </span>
              )}
            </div>
          </td>
        );
      })}
    </tr>
  );
}

/* ============================== ChartBlock ============================== */

function ChartBlock({
  title,
  keyMetric,
  scenarios,
  derived,
  higherIsBetter,
  divide = 1,
  unit = '',
}: {
  title: string;
  keyMetric: keyof DerivedMetrics;
  scenarios: Record<ScenarioSlot, ScenarioEntry | null>;
  derived: Partial<Record<ScenarioSlot, DerivedMetrics>>;
  higherIsBetter: boolean;
  divide?: number;
  unit?: string;
}) {
  const data = (['A', 'B', 'C'] as ScenarioSlot[])
    .filter((slot) => derived[slot] !== undefined)
    .map((slot) => ({
      slot,
      value: (derived[slot]![keyMetric] as number) / divide,
    }));

  if (!data.length) return null;

  const best = higherIsBetter
    ? Math.max(...data.map((d) => d.value))
    : Math.min(...data.map((d) => d.value));

  return (
    <div className="rounded-lg border border-border bg-surface/40 p-5">
      <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
        {title}
      </div>
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="rgb(31 31 35)" strokeDasharray="2 4" vertical={false} />
            <XAxis
              dataKey="slot"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgb(138 138 148)', fontSize: 11, fontFamily: 'JetBrains Mono Variable' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgb(138 138 148)', fontSize: 9, fontFamily: 'JetBrains Mono Variable' }}
              tickFormatter={(v) => `${v.toFixed(1)}${unit}`}
            />
            <Tooltip
              contentStyle={{
                background: 'rgb(17 17 19)',
                border: '1px solid rgb(42 42 48)',
                borderRadius: 6,
                fontFamily: 'JetBrains Mono Variable, monospace',
                fontSize: 11,
              }}
              formatter={(v: number) => [`${v.toFixed(2)}${unit}`]}
            />
            <Bar dataKey="value" radius={[3, 3, 0, 0]}>
              {data.map((d) => (
                <Cell
                  key={d.slot}
                  fill={
                    d.value === best
                      ? 'rgb(74 222 128)'
                      : d.slot === 'A'
                        ? 'rgb(124 92 255)'
                        : d.slot === 'B'
                          ? 'rgb(0 217 255)'
                          : 'rgb(74 222 128)'
                  }
                  fillOpacity={d.value === best ? 1 : 0.55}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex justify-end gap-3 font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-1.5 w-3 rounded-sm bg-agri" /> best
        </span>
      </div>
    </div>
  );
}
