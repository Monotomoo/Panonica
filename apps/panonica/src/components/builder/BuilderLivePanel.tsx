import { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  History,
  Info,
  Package,
  Sparkles,
} from 'lucide-react';
import { cn } from '@paladian/ui';
import { useProjectStore } from '@/store/projectStore';
import type { ValidationResult } from '@/lib/validationEngine';
import type { BuilderBomResult, BuilderFinanceResult } from '@/lib/builderDerive';
import { DnaGlyph } from '@/components/DnaGlyph';
import { useConfigStore } from '@/store/configStore';

type TabKey = 'health' | 'bom' | 'finance' | 'changelog';

export function BuilderLivePanel({
  validation,
  bom,
  finance,
  collapsed,
  onToggleCollapse,
}: {
  validation: ValidationResult;
  bom: BuilderBomResult;
  finance: BuilderFinanceResult;
  collapsed: boolean;
  onToggleCollapse: () => void;
}) {
  const [tab, setTab] = useState<TabKey>('health');
  const changelog = useProjectStore((s) => s.meta.changelog);
  const configState = useConfigStore();

  if (collapsed) {
    return (
      <div className="flex h-full flex-col items-center border-b border-border py-3">
        <button
          onClick={onToggleCollapse}
          className="rounded-sm border border-border-bright bg-surface p-1 text-text-muted transition-colors hover:border-pulse hover:text-pulse"
        >
          <ChevronLeft className="h-3 w-3" strokeWidth={1.8} />
        </button>
        <div className="mt-4 flex flex-col items-center gap-3 font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
          <span className={cn(validation.errorCount > 0 ? 'text-spark' : validation.warnCount > 0 ? 'text-sun' : 'text-agri')}>
            {validation.healthScore}
          </span>
          <span className="text-sun">€{(bom.capexTotal / 1_000_000).toFixed(1)}M</span>
          <span className="text-agri">{finance.irrPct.toFixed(1)}%</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Collapse control */}
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
          live · recomputes on every edit
        </span>
        <button
          onClick={onToggleCollapse}
          className="rounded-sm border border-border-bright bg-surface p-1 text-text-muted transition-colors hover:border-pulse hover:text-pulse"
        >
          <ChevronRight className="h-3 w-3" strokeWidth={1.8} />
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex gap-0.5 border-b border-border bg-surface/40 p-1">
        <TabBtn active={tab === 'health'} onClick={() => setTab('health')} icon={AlertTriangle} label="Health" badge={validation.violations.length || null} />
        <TabBtn active={tab === 'bom'} onClick={() => setTab('bom')} icon={Package} label="BoM" />
        <TabBtn active={tab === 'finance'} onClick={() => setTab('finance')} icon={DollarSign} label="Finance" />
        <TabBtn active={tab === 'changelog'} onClick={() => setTab('changelog')} icon={History} label="Log" badge={changelog.length || null} />
      </div>

      {/* Tab body */}
      <div className="flex-1 overflow-y-auto">
        {tab === 'health' && <HealthTab validation={validation} />}
        {tab === 'bom' && <BomTab bom={bom} />}
        {tab === 'finance' && <FinanceTab finance={finance} />}
        {tab === 'changelog' && <ChangelogTab />}
      </div>

      {/* DNA glyph pinned at bottom */}
      <div className="border-t border-border bg-canvas/50 p-3">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
              deal DNA · reactive
            </span>
            <span className="font-mono text-[9px] text-text-secondary">
              reshapes as you edit
            </span>
          </div>
          <DnaGlyph config={configState} size={72} />
        </div>
      </div>
    </div>
  );
}

/* ================================ TABS ================================ */

function TabBtn({ active, onClick, icon: Icon, label, badge }: { active: boolean; onClick: () => void; icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; label: string; badge?: number | null }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex flex-1 items-center justify-center gap-1.5 rounded-sm px-2 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors',
        active ? 'bg-pulse/15 text-pulse' : 'text-text-muted hover:bg-surface hover:text-text-secondary',
      )}
    >
      <Icon className="h-3 w-3" strokeWidth={1.8} />
      {label}
      {badge !== null && badge !== undefined && badge > 0 && (
        <span className="inline-flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-current/20 px-1 font-mono text-[8px] tabular-nums">
          {badge}
        </span>
      )}
    </button>
  );
}

function HealthTab({ validation }: { validation: ValidationResult }) {
  const { errorCount, warnCount, infoCount, healthScore, violations } = validation;
  const tone = errorCount > 0 ? 'spark' : warnCount > 2 ? 'sun' : 'agri';
  const toneCls = { spark: 'text-spark bg-spark/5', sun: 'text-sun bg-sun/5', agri: 'text-agri bg-agri/5' }[tone];

  return (
    <div className="flex flex-col gap-3 p-3">
      <div className={cn('rounded-md border border-current/30 p-4', toneCls)}>
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-text-muted">
            design health
          </span>
          <span className="font-mono text-[9px] tabular-nums text-text-muted">
            of {validation.totalRules}
          </span>
        </div>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="font-display text-4xl tracking-tech-tight">
            {healthScore}
          </span>
          <span className="font-mono text-xs uppercase tracking-[0.22em]">/ 100</span>
        </div>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-border">
          <div
            className={cn('h-full transition-all', tone === 'spark' ? 'bg-spark' : tone === 'sun' ? 'bg-sun' : 'bg-agri')}
            style={{ width: `${healthScore}%` }}
          />
        </div>
        <div className="mt-3 flex gap-3 font-mono text-[10px] uppercase tracking-[0.22em]">
          <span className="text-spark">{errorCount} errors</span>
          <span className="text-sun">{warnCount} warnings</span>
          <span className="text-text-muted">{infoCount} info</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {violations.length === 0 && (
          <div className="rounded-md border border-agri/30 bg-agri/5 p-4 font-mono text-[11px] text-agri">
            <CheckCircle2 className="mr-2 inline h-3.5 w-3.5" strokeWidth={1.8} />
            All 40 rules pass · design ready for tender
          </div>
        )}

        {violations.map((v) => {
          const vTone = v.severity === 'error' ? 'text-spark border-spark/30 bg-spark/5'
            : v.severity === 'warn' ? 'text-sun border-sun/30 bg-sun/5'
            : 'text-pulse border-pulse/30 bg-pulse/5';
          const Icon = v.severity === 'error' ? AlertTriangle : v.severity === 'warn' ? AlertTriangle : Info;
          return (
            <div key={v.id} className={cn('flex items-start gap-2 rounded-md border p-3', vTone)}>
              <Icon className={cn('mt-0.5 h-3.5 w-3.5 shrink-0', vTone.split(' ')[0])} strokeWidth={1.8} />
              <div className="flex flex-col gap-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-mono text-[11px] text-text-primary">{v.title}</span>
                  <span className="font-mono text-[8px] uppercase tracking-[0.22em] text-text-muted">
                    {v.section}
                  </span>
                </div>
                <span className="font-mono text-[10px] leading-relaxed text-text-secondary">
                  {v.message}
                </span>
                {v.fix && (
                  <span className="mt-1 rounded-sm border border-border bg-surface/50 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.22em] text-pulse">
                    fix · {v.fix}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BomTab({ bom }: { bom: BuilderBomResult }) {
  return (
    <div className="flex flex-col gap-3 p-3">
      <div className="rounded-md border border-sun/40 bg-sun/5 p-4">
        <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-text-muted">
          total CAPEX
        </span>
        <div className="mt-1 font-display text-3xl tracking-tech-tight text-sun">
          €{(bom.capexTotal / 1_000_000).toFixed(2)}M
        </div>
        <div className="mt-1 flex items-baseline gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
          <span>€{(bom.capexPerKw / 1000).toFixed(0)}k / MW</span>
          <span>·</span>
          <span>{bom.moduleCount.toLocaleString()} modules</span>
          <span>·</span>
          <span>{bom.inverterCount} inverters</span>
        </div>
      </div>

      {/* Category stack */}
      <div className="flex flex-col gap-1.5">
        <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-text-muted">
          by category
        </span>
        {Object.entries(bom.byCategory).map(([cat, eur]) => {
          const pct = (eur / bom.capexTotal) * 100;
          return (
            <div key={cat} className="flex items-center gap-2">
              <span className="w-20 font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
                {cat}
              </span>
              <div className="relative h-3 flex-1 overflow-hidden rounded-sm bg-border">
                <div
                  className="h-full bg-pulse transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-14 text-right font-mono text-[10px] tabular-nums text-text-secondary">
                {pct.toFixed(1)}%
              </span>
              <span className="w-14 text-right font-mono text-[10px] tabular-nums text-sun">
                €{(eur / 1_000_000).toFixed(1)}M
              </span>
            </div>
          );
        })}
      </div>

      {/* Line items */}
      <div className="flex flex-col gap-1.5">
        <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-text-muted">
          line items · {bom.lines.length}
        </span>
        <div className="max-h-[50vh] overflow-y-auto rounded-md border border-border bg-surface/30">
          {bom.lines.map((l, i) => (
            <div key={i} className="flex flex-col gap-0.5 border-b border-border/40 px-3 py-2 last:border-b-0">
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-mono text-[10px] text-text-primary">{l.label}</span>
                <span className="font-mono text-[10px] tabular-nums text-sun">
                  €{(l.totalEur / 1_000_000).toFixed(2)}M
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
                  {l.qty}
                </span>
                {l.note && (
                  <span className="font-mono text-[9px] text-text-muted">{l.note}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FinanceTab({ finance }: { finance: BuilderFinanceResult }) {
  return (
    <div className="flex flex-col gap-3 p-3">
      <div className="grid grid-cols-2 gap-2">
        <Kv label="IRR · equity" value={`${finance.irrPct.toFixed(1)}%`} tone={finance.irrPct >= 10 ? 'agri' : finance.irrPct >= 7 ? 'sun' : 'spark'} big />
        <Kv label="DSCR · Y1" value={`${finance.dscrY1.toFixed(2)}×`} tone={finance.dscrY1 >= 1.3 ? 'agri' : finance.dscrY1 >= 1.15 ? 'sun' : 'spark'} big />
        <Kv label="Payback" value={`${finance.paybackYears} yr`} tone={finance.paybackYears <= 10 ? 'agri' : 'sun'} big />
        <Kv label="Capacity factor" value={`${(finance.capacityFactor * 100).toFixed(1)}%`} tone="signal" big />
      </div>

      <div className="rounded-md border border-border bg-surface/40 p-3 font-mono text-[10px]">
        <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
          Y1 snapshot
        </div>
        <div className="flex flex-col gap-1.5">
          <Row label="Revenue" value={`€${(finance.annualRevenueEur / 1_000_000).toFixed(2)}M`} tone="agri" />
          <Row label="OpEx" value={`−€${(finance.annualOpexEur / 1000).toFixed(0)}k`} tone="spark" />
          <Row label="EBITDA" value={`€${(finance.annualEbitdaEur / 1_000_000).toFixed(2)}M`} tone="pulse" bold />
          <Row label="Debt service" value={`−€${(finance.annualDebtServiceEur / 1_000_000).toFixed(2)}M`} tone="signal" />
          <Row label="Equity cash" value={`€${(finance.y1CashflowEur / 1_000_000).toFixed(2)}M`} tone="agri" bold />
        </div>
      </div>

      <div className="rounded-md border border-border bg-surface/40 p-3 font-mono text-[10px]">
        <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
          25-year view
        </div>
        <div className="flex flex-col gap-1.5">
          <Row label="NPV @ disc rate" value={`€${(finance.npv25Eur / 1_000_000).toFixed(1)}M`} />
          <Row label="Annual yield" value={`${finance.annualYieldGwh.toFixed(1)} GWh`} />
          <Row label="Exit EV · Y10" value={`€${(finance.exitEvEur / 1_000_000).toFixed(1)}M`} tone="sun" />
          <Row label="Equity MoM" value={`${finance.equityMom.toFixed(2)}×`} tone="agri" bold />
        </div>
      </div>

      <div className="rounded-md border border-border bg-surface/40 p-3 font-mono text-[10px]">
        <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
          capital stack
        </div>
        <div className="flex flex-col gap-1.5">
          <Row label="CAPEX" value={`€${(finance.capexEur / 1_000_000).toFixed(2)}M`} />
          <Row label="Equity in" value={`€${(finance.equityInEur / 1_000_000).toFixed(2)}M`} tone="sun" />
        </div>
      </div>
    </div>
  );
}

function ChangelogTab() {
  const changelog = useProjectStore((s) => s.meta.changelog);
  if (changelog.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 p-6 text-center">
        <Clock className="h-6 w-6 text-text-muted" strokeWidth={1.4} />
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
          no edits yet · changes log here
        </span>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-1.5 p-3">
      {changelog.map((c, i) => (
        <div key={i} className="flex flex-col gap-0.5 rounded-md border border-border/60 bg-surface/40 p-2.5">
          <div className="flex items-baseline justify-between font-mono text-[9px] uppercase tracking-[0.22em]">
            <span className="text-pulse">{c.path}</span>
            <span className="text-text-muted">
              {new Date(c.at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
          <div className="flex items-baseline gap-2 font-mono text-[10px]">
            <span className="text-text-muted line-through">{formatValue(c.from)}</span>
            <span className="text-text-muted">→</span>
            <span className="text-text-primary">{formatValue(c.to)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function Kv({ label, value, tone = 'default', big = false }: { label: string; value: string; tone?: 'agri' | 'sun' | 'spark' | 'signal' | 'pulse' | 'default'; big?: boolean }) {
  const toneCls = { agri: 'text-agri', sun: 'text-sun', spark: 'text-spark', signal: 'text-signal', pulse: 'text-pulse', default: 'text-text-primary' }[tone];
  return (
    <div className="rounded-md border border-border bg-surface/40 p-2.5">
      <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">{label}</div>
      <div className={cn('font-display tracking-tech-tight', big ? 'text-2xl' : 'text-lg', toneCls)}>{value}</div>
    </div>
  );
}

function Row({ label, value, tone, bold }: { label: string; value: string; tone?: 'agri' | 'sun' | 'spark' | 'signal' | 'pulse'; bold?: boolean }) {
  const toneCls = tone ? { agri: 'text-agri', sun: 'text-sun', spark: 'text-spark', signal: 'text-signal', pulse: 'text-pulse' }[tone] : 'text-text-primary';
  return (
    <div className={cn('flex items-baseline justify-between', bold && 'border-t border-border/60 pt-1')}>
      <span className="text-[9px] uppercase tracking-[0.22em] text-text-muted">{label}</span>
      <span className={cn('tabular-nums', toneCls, bold && 'font-semibold')}>{value}</span>
    </div>
  );
}

function formatValue(v: unknown): string {
  if (v === null || v === undefined) return '—';
  if (typeof v === 'number') return v.toLocaleString();
  if (typeof v === 'boolean') return v ? 'yes' : 'no';
  if (Array.isArray(v)) return v.join(', ');
  return String(v).slice(0, 40);
}
