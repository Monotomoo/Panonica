import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Check, AlertCircle, Clock } from 'lucide-react';
import { NumberTicker, cn } from '@paladian/ui';
import { subsidies, fundingStackBaselineCapex, type SubsidyProgram } from '@/mock/subsidies';

export function SubsidiesRoute() {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(['FZOEU', 'NPOO', 'HBOR']),
  );

  const toggle = (program: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(program) ? next.delete(program) : next.add(program);
      return next;
    });

  const totalMax = useMemo(
    () => subsidies.reduce((sum, s) => sum + s.maxAmount, 0),
    [],
  );

  const covered = useMemo(() => {
    // Stack only selected, cap at CAPEX
    const raw = subsidies
      .filter((s) => selected.has(s.program))
      .reduce((sum, s) => sum + Math.min(s.maxAmount, fundingStackBaselineCapex * (s.coveragePercent / 100)), 0);
    return Math.min(raw, fundingStackBaselineCapex);
  }, [selected]);

  const netCapex = fundingStackBaselineCapex - covered;

  return (
    <section className="flex min-h-full flex-col gap-8 px-12 py-12">
      {/* TOP SUMMARY */}
      <div className="grid grid-cols-3 gap-6 border-b border-border pb-8">
        <SummaryTile
          label="max funding available"
          value={`€${(totalMax / 1_000_000).toFixed(2)} M`}
          tone="sun"
        />
        <SummaryTile
          label="your estimated CAPEX"
          value={`€${(fundingStackBaselineCapex / 1_000_000).toFixed(2)} M`}
          tone="default"
        />
        <SummaryTile
          label="coverage"
          value={`${Math.round((totalMax / fundingStackBaselineCapex) * 100)}%`}
          sub="(stackable down to eligible mix)"
          tone="pulse"
        />
      </div>

      {/* PROGRAMS GRID */}
      <div>
        <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
          funding programs · toggle to stack
        </div>
        <div className="grid grid-cols-3 gap-4">
          {subsidies.map((s, i) => (
            <ProgramCard
              key={s.program}
              program={s}
              index={i}
              selected={selected.has(s.program)}
              onToggle={() => toggle(s.program)}
            />
          ))}
        </div>
      </div>

      {/* STACKING CALCULATOR */}
      <div className="rounded-lg border border-border bg-surface/40 p-8">
        <div className="mb-4 flex items-baseline justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
              funding stack · live
            </div>
            <div className="mt-1 font-display text-2xl uppercase tracking-tech-tight text-text-primary">
              €{(covered / 1_000_000).toFixed(1)}M covered of €{(fundingStackBaselineCapex / 1_000_000).toFixed(1)}M CAPEX
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
              net CAPEX
            </div>
            <div className="font-display text-3xl tracking-tech-tight text-sun">
              €
              <NumberTicker value={netCapex / 1_000_000} decimals={1} triggerOnView={false} />M
            </div>
          </div>
        </div>

        <div className="relative h-5 w-full overflow-hidden rounded-full bg-border">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-agri via-pulse to-sun shadow-glow-pulse"
            animate={{ width: `${Math.min(100, (covered / fundingStackBaselineCapex) * 100)}%` }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
          <span>€0</span>
          <span>
            {selected.size} programs stacked · {Math.round((covered / fundingStackBaselineCapex) * 100)}% of CAPEX
          </span>
          <span>€{(fundingStackBaselineCapex / 1_000_000).toFixed(1)}M</span>
        </div>
      </div>

      <div className="mt-auto flex justify-end">
        <Link
          to="/thesis"
          className="group inline-flex items-center gap-3 rounded-md border border-pulse/40 bg-pulse/10 px-5 py-3 transition-all hover:bg-pulse/20 hover:shadow-glow-pulse"
        >
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-pulse">
            generate investment thesis
          </span>
          <ArrowRight className="h-4 w-4 text-pulse transition-transform group-hover:translate-x-0.5" strokeWidth={1.8} />
        </Link>
      </div>
    </section>
  );
}

/* -------------------------------- tiles ---------------------------------- */

function SummaryTile({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  tone: 'default' | 'pulse' | 'sun';
}) {
  const toneClass =
    tone === 'pulse' ? 'text-pulse' : tone === 'sun' ? 'text-sun' : 'text-text-primary';
  return (
    <div className="flex flex-col gap-2">
      <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
        {label}
      </span>
      <span className={cn('font-display text-3xl tracking-tech-tight', toneClass)}>{value}</span>
      {sub && (
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
          {sub}
        </span>
      )}
    </div>
  );
}

function ProgramCard({
  program,
  index,
  selected,
  onToggle,
}: {
  program: SubsidyProgram;
  index: number;
  selected: boolean;
  onToggle: () => void;
}) {
  const accentClass = {
    pulse: 'text-pulse ring-pulse/40',
    signal: 'text-signal ring-signal/40',
    sun: 'text-sun ring-sun/40',
    agri: 'text-agri ring-agri/40',
    spark: 'text-spark ring-spark/40',
  }[program.accent];

  const statusIcon =
    program.status === 'open' ? (
      <span className="inline-flex items-center gap-1.5 text-agri">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-agri animate-pulse-dot" />
        open
      </span>
    ) : program.status === 'closing-soon' ? (
      <span className="inline-flex items-center gap-1.5 text-sun">
        <Clock className="h-3 w-3" /> closing soon
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 text-spark">
        <AlertCircle className="h-3 w-3" /> closed
      </span>
    );

  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 + index * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      onClick={onToggle}
      className={cn(
        'flex flex-col gap-3 rounded-lg border bg-surface p-5 text-left transition-all',
        selected
          ? 'border-pulse/40 ring-1 ring-pulse/30 shadow-glow-pulse'
          : 'border-border hover:border-border-bright',
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className={cn('font-display text-lg uppercase tracking-tech-tight', accentClass.split(' ')[0])}>
            {program.program}
          </div>
          <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
            {program.fullName}
          </div>
        </div>
        <div
          className={cn(
            'flex h-5 w-5 items-center justify-center rounded-sm border transition-colors',
            selected ? 'border-pulse bg-pulse/20 text-pulse' : 'border-border text-transparent',
          )}
        >
          <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="font-display text-2xl tracking-tech-tight text-text-primary">
          €{(program.maxAmount / 1_000_000).toFixed(program.maxAmount >= 1_000_000 ? 1 : 2)}M
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
          {program.coveragePercent}% coverage
        </span>
      </div>

      <div className="h-1 w-full overflow-hidden rounded-full bg-border">
        <div
          className={cn(
            'h-full rounded-full',
            program.accent === 'pulse' && 'bg-pulse',
            program.accent === 'signal' && 'bg-signal',
            program.accent === 'sun' && 'bg-sun',
            program.accent === 'agri' && 'bg-agri',
            program.accent === 'spark' && 'bg-spark',
          )}
          style={{ width: `${program.coveragePercent}%` }}
        />
      </div>

      <p className="font-mono text-[11px] leading-relaxed text-text-secondary">
        {program.description}
      </p>

      <div className="mt-2 flex items-center justify-between border-t border-border/60 pt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
        <span>deadline · {program.deadline}</span>
        <span>{statusIcon}</span>
      </div>

      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em]">
        {program.eligibility === 'eligible' ? (
          <span className="text-agri">eligible</span>
        ) : program.eligibility === 'eligible-docs-pending' ? (
          <span className="text-sun">eligible · docs pending</span>
        ) : (
          <span className="text-spark">not eligible</span>
        )}
        <span className="text-text-muted">{program.call}</span>
      </div>
    </motion.button>
  );
}
