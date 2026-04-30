import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowRight,
  CloudRain,
  Cloudy,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sprout,
  Thermometer,
  Umbrella,
  Wind,
  Zap,
} from 'lucide-react';
import { cn } from '@paladian/ui';
import {
  climateScenarios,
  combinedIrr,
  forceMajeureEvents,
  politicalRisks,
  type ClimateScenario,
} from '@/mock/risk';
import { useConfigStore } from '@/store/configStore';
import { deriveMetrics } from '@/lib/deriveMetrics';

export function RiskRoute() {
  const config = useConfigStore();
  const metrics = useMemo(() => deriveMetrics(config), [config]);
  const baseIrr = metrics.irrPct;
  const annualRevenue = metrics.revenueEur;

  const [climate, setClimate] = useState<ClimateScenario>(climateScenarios[0]);
  const [politicalProbs, setPoliticalProbs] = useState<Record<string, number>>(
    Object.fromEntries(politicalRisks.map((r) => [r.id, r.defaultProbability])),
  );
  const [fmInsured, setFmInsured] = useState(true);

  const result = useMemo(
    () => combinedIrr(baseIrr, climate, politicalProbs, fmInsured, annualRevenue),
    [baseIrr, climate, politicalProbs, fmInsured, annualRevenue],
  );

  const netDelta = result.irr - baseIrr;

  // Ranked tornado (by absolute impact)
  const sortedBreakdown = useMemo(
    () => [...result.breakdown].sort((a, b) => Math.abs(b.deltaPp) - Math.abs(a.deltaPp)),
    [result],
  );

  const maxImpact = Math.max(0.1, ...sortedBreakdown.map((b) => Math.abs(b.deltaPp)));

  const resetPolitical = () => {
    setPoliticalProbs(Object.fromEntries(politicalRisks.map((r) => [r.id, r.defaultProbability])));
  };

  return (
    <section className="flex min-h-full flex-col">
      {/* HEADER */}
      <div className="flex items-baseline justify-between border-b border-border px-12 py-8">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
            <ShieldAlert className="h-3.5 w-3.5 text-spark" strokeWidth={1.8} />
            risk center · climate · insurance · political · force majeure
          </div>
          <h1 className="font-display text-3xl uppercase tracking-tech-tight text-text-primary">
            stress test
          </h1>
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-text-secondary">
            base IRR · {baseIrr.toFixed(1)}% · move the dials · see the bleed live
          </div>
        </div>
        <IrrDashboard base={baseIrr} current={result.irr} delta={netDelta} />
      </div>

      <div className="grid grid-cols-1 gap-0 lg:grid-cols-[1fr_1fr]">
        {/* CLIMATE */}
        <section className="border-b border-r border-border px-10 py-8">
          <div className="mb-5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
            <CloudRain className="h-3.5 w-3.5 text-signal" strokeWidth={1.8} />
            climate scenario · IPCC RCP
          </div>
          <div className="flex flex-col gap-2">
            {climateScenarios.map((s) => {
              const tone = { agri: 'border-agri text-agri bg-agri/5', sun: 'border-sun text-sun bg-sun/5', pulse: 'border-pulse text-pulse bg-pulse/5', spark: 'border-spark text-spark bg-spark/5' }[s.tone];
              return (
                <button
                  key={s.id}
                  onClick={() => setClimate(s)}
                  className={cn(
                    'group flex flex-col gap-2 rounded-lg border bg-surface/40 p-4 text-left transition-all',
                    climate.id === s.id ? tone : 'border-border hover:border-border-bright',
                  )}
                >
                  <div className="flex items-baseline justify-between">
                    <span className={cn('font-display text-lg uppercase tracking-tech-tight', climate.id === s.id ? tone.split(' ')[1] : 'text-text-primary')}>
                      {s.label}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
                      {s.description}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-3 border-t border-border/60 pt-2 font-mono text-[10px]">
                    <Kv label="Yield 2030" value={`${s.yieldDelta2030Pct > 0 ? '+' : ''}${s.yieldDelta2030Pct.toFixed(1)}%`} tone={s.yieldDelta2030Pct < 0 ? 'spark' : 'agri'} />
                    <Kv label="Panel temp" value={`+${s.panelTempPenaltyPct.toFixed(1)}%`} tone={s.panelTempPenaltyPct > 0 ? 'spark' : 'pulse'} />
                    <Kv label="Hail/yr" value={s.hailFrequencyPerYear.toFixed(1)} tone={s.hailFrequencyPerYear > 1.5 ? 'spark' : 'pulse'} />
                    <Kv label="Drought days" value={String(s.droughtLoadDays)} tone={s.droughtLoadDays > 20 ? 'spark' : 'agri'} />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* FORCE MAJEURE */}
        <section className="border-b border-border px-10 py-8">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
              <Umbrella className="h-3.5 w-3.5 text-pulse" strokeWidth={1.8} />
              force majeure · event register
            </div>
            <button
              onClick={() => setFmInsured((v) => !v)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] transition-all',
                fmInsured
                  ? 'border-agri/40 bg-agri/10 text-agri'
                  : 'border-spark/40 bg-spark/10 text-spark',
              )}
            >
              {fmInsured ? <Shield className="h-3 w-3" strokeWidth={1.8} /> : <ShieldAlert className="h-3 w-3" strokeWidth={1.8} />}
              {fmInsured ? 'insured' : 'uninsured'}
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {forceMajeureEvents.map((e) => {
              const annualExpectedLoss = e.probability * (annualRevenue * (e.revenueLossPct / 100) + e.capitalLossEur);
              const netWithInsurance = fmInsured && e.insurable ? e.premiumPerYearEur + e.probability * e.deductibleEur : annualExpectedLoss;
              const saving = fmInsured && e.insurable ? annualExpectedLoss - netWithInsurance : 0;
              return (
                <div key={e.id} className="flex flex-col gap-1.5 rounded-lg border border-border bg-surface/40 p-3">
                  <div className="flex items-baseline justify-between">
                    <span className="font-mono text-[11px] text-text-primary">{e.label}</span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
                      P {(e.probability * 100).toFixed(1)}%/yr
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between font-mono text-[10px]">
                    <span className="text-text-muted uppercase tracking-[0.2em]">
                      {fmInsured && e.insurable ? 'net · insured' : 'expected loss'}
                    </span>
                    <span className={cn('tabular-nums', fmInsured && e.insurable ? 'text-agri' : 'text-spark')}>
                      €{(netWithInsurance / 1000).toFixed(1)}k / yr
                    </span>
                  </div>
                  {saving > 0 && (
                    <div className="text-right font-mono text-[9px] uppercase tracking-[0.22em] text-agri">
                      insurance saves · €{(saving / 1000).toFixed(1)}k
                    </div>
                  )}
                  {!e.insurable && (
                    <div className="text-right font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
                      uninsurable · exposure only
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* POLITICAL */}
      <section className="border-b border-border bg-surface/20 px-12 py-10">
        <div className="mb-5 flex items-baseline justify-between">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
            <ShieldCheck className="h-3.5 w-3.5 text-agri" strokeWidth={1.8} />
            political · policy · regulatory · 8 risks
          </div>
          <button
            onClick={resetPolitical}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted transition-colors hover:border-pulse hover:text-pulse"
          >
            reset to base
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {politicalRisks.map((r) => {
            const tone = { agri: 'border-agri/30 text-agri', sun: 'border-sun/30 text-sun', pulse: 'border-pulse/30 text-pulse', spark: 'border-spark/30 text-spark', signal: 'border-signal/30 text-signal' }[r.tone];
            const prob = politicalProbs[r.id];
            const contribution = prob * r.irrImpactPp;
            return (
              <div key={r.id} className={cn('flex flex-col gap-3 rounded-lg border bg-surface/40 p-4', tone)}>
                <div className="flex items-baseline justify-between">
                  <div className="flex flex-col gap-0.5">
                    <span className={cn('font-mono text-[11px]', tone.split(' ')[1])}>{r.label}</span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
                      {r.description}
                    </span>
                  </div>
                  <span className={cn('font-display text-lg tracking-tech-tight', contribution < 0 ? 'text-spark' : 'text-agri')}>
                    {contribution > 0 ? '+' : ''}{contribution.toFixed(2)}pp
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted w-8">
                    P
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={Math.round(prob * 100)}
                    onChange={(e) => setPoliticalProbs((p) => ({ ...p, [r.id]: parseInt(e.target.value, 10) / 100 }))}
                    className="slider-native flex-1 cursor-grab"
                    style={{ accentColor: r.tone === 'spark' ? 'rgb(255, 61, 113)' : r.tone === 'sun' ? 'rgb(255, 184, 0)' : 'rgb(124, 92, 255)' }}
                  />
                  <span className="font-mono text-[10px] tabular-nums text-text-primary w-12 text-right">
                    {(prob * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
                  mitigate · {r.mitigation}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* IMPACT TORNADO */}
      <section className="border-b border-border px-12 py-10">
        <div className="mb-5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
          <Zap className="h-3.5 w-3.5 text-sun" strokeWidth={1.8} />
          combined stress · ranked by IRR impact
        </div>

        <div className="rounded-lg border border-border bg-surface/40 p-5">
          <div className="flex flex-col gap-2">
            {sortedBreakdown.map((b) => {
              const pct = (Math.abs(b.deltaPp) / maxImpact) * 100;
              const neg = b.deltaPp < 0;
              return (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-[220px_1fr_72px] items-center gap-3 py-1"
                >
                  <span className="truncate font-mono text-[11px] text-text-primary">{b.label}</span>
                  <div className="relative h-5 rounded-sm bg-border/30">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6 }}
                      className={cn('absolute top-0 h-full rounded-sm', neg ? 'bg-spark/70' : 'bg-agri/70')}
                    />
                  </div>
                  <span className={cn('text-right font-mono text-[11px] tabular-nums', neg ? 'text-spark' : 'text-agri')}>
                    {b.deltaPp > 0 ? '+' : ''}{b.deltaPp.toFixed(2)}pp
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-pulse/30 bg-pulse/5 p-5 font-mono text-[11px] leading-relaxed text-text-secondary">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-pulse">
            <AlertTriangle className="mr-1.5 inline h-3.5 w-3.5" strokeWidth={1.8} />
            risk summary
          </div>
          Under the current stress: stressed IRR is{' '}
          <span className={cn('tabular-nums', result.irr < baseIrr - 2 ? 'text-spark' : result.irr < baseIrr - 1 ? 'text-sun' : 'text-agri')}>
            {result.irr.toFixed(1)}%
          </span>
          {' '}vs baseline {baseIrr.toFixed(1)}%. The three biggest movers are{' '}
          <span className="text-text-primary">
            {sortedBreakdown.slice(0, 3).map((b) => b.label).join(' · ')}
          </span>.
          {fmInsured
            ? ' Force majeure is covered — premium burn ~€116k/yr across 6 policies, deductibles flow through to equity.'
            : ' Force majeure is uninsured — expected-value losses are material. Recommend full-coverage package.'}
        </div>
      </section>

      {/* FOOTER */}
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

/* ============================== HELPERS ============================== */

function IrrDashboard({ base, current, delta }: { base: number; current: number; delta: number }) {
  const severity = delta < -3 ? 'spark' : delta < -1 ? 'sun' : delta < 0 ? 'pulse' : 'agri';
  const label = severity === 'spark' ? 'critical' : severity === 'sun' ? 'caution' : severity === 'pulse' ? 'mild' : 'resilient';
  const tone = { pulse: 'text-pulse bg-pulse/5 border-pulse/40', sun: 'text-sun bg-sun/5 border-sun/40', spark: 'text-spark bg-spark/5 border-spark/40', agri: 'text-agri bg-agri/5 border-agri/40' }[severity];
  return (
    <div className={cn('flex items-center gap-5 rounded-lg border px-5 py-3', tone)}>
      <div className="flex flex-col items-end">
        <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">base</span>
        <span className="font-display text-xl tracking-tech-tight text-text-secondary line-through decoration-1">{base.toFixed(1)}%</span>
      </div>
      <ArrowRight className={cn('h-5 w-5', tone.split(' ')[0])} strokeWidth={1.8} />
      <div className="flex flex-col items-end">
        <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">stressed</span>
        <motion.span
          key={current.toFixed(2)}
          initial={{ opacity: 0.4, y: -3 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn('font-display text-4xl tracking-tech-tight', tone.split(' ')[0])}
        >
          {current.toFixed(1)}%
        </motion.span>
      </div>
      <div className="flex flex-col items-end border-l border-current/20 pl-5">
        <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">delta</span>
        <span className={cn('font-mono text-lg tabular-nums', tone.split(' ')[0])}>
          {delta > 0 ? '+' : ''}{delta.toFixed(1)}pp
        </span>
        <span className={cn('font-mono text-[9px] uppercase tracking-[0.22em]', tone.split(' ')[0])}>
          {label}
        </span>
      </div>
    </div>
  );
}

function Kv({ label, value, tone = 'default' }: { label: string; value: string; tone?: 'default' | 'pulse' | 'sun' | 'agri' | 'spark' }) {
  const t = { default: 'text-text-primary', pulse: 'text-pulse', sun: 'text-sun', agri: 'text-agri', spark: 'text-spark' }[tone];
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-text-muted">{label}</span>
      <span className={cn('tabular-nums', t)}>{value}</span>
    </div>
  );
}
