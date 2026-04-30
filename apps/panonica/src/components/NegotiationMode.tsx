import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Check,
  Handshake,
  Scale,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react';
import { cn } from '@paladian/ui';
import { Sparkline } from '@/components/Sparkline';

/**
 * Negotiation Mode · Wave 2 stretch
 *
 * Overlay triggered by `N` key or the command palette. Three big sliders let
 * you model a live deal discussion:
 *   1. Purchase price for the Kopanica-Beravci SPV (€M)
 *   2. Equity stake offered in return (%)
 *   3. Co-investment commitment for development CAPEX (€M)
 *
 * Outputs recompute instantly:
 *   · €/ha and €/MW implied valuations
 *   · investor-side IRR (simplified)
 *   · Paladina retained stake value
 *   · deal fairness score vs Pannonian solar transaction comps
 *   · verdict chip (excellent / fair / thin / aggressive)
 *
 * Accept/Counter/Decline buttons · pure demo interaction, no persistence.
 */

const AREA_HA = 80.3;
const MW = 30;
const EXIT_EV_M = 30.4;
const COMP_EUR_PER_HA = 13_000;   // comparable raw-land transactions in Slavonia (low-bound)
const COMP_EUR_PER_MW_DEVRIGHTS = 100_000; // €/MW for queue-approved grid rights

export function NegotiationMode() {
  const [open, setOpen] = useState(false);
  const [priceM, setPriceM] = useState(6.5);        // €M total purchase price
  const [equityPct, setEquityPct] = useState(51);   // %
  const [coInvestM, setCoInvestM] = useState(5.25); // €M

  // Keyboard trigger · N
  useEffect(() => {
    const isTypingTarget = (t: EventTarget | null): boolean => {
      if (!(t instanceof HTMLElement)) return false;
      const tag = t.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || t.isContentEditable;
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (isTypingTarget(e.target)) return;
      if (e.key.toLowerCase() === 'n' && !open) {
        e.preventDefault();
        setOpen(true);
      } else if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // External event trigger
  useEffect(() => {
    const h = () => setOpen((o) => !o);
    window.addEventListener('panonica:negotiation-toggle', h);
    return () => window.removeEventListener('panonica:negotiation-toggle', h);
  }, []);

  /* =========================== LIVE MATH =========================== */

  const derived = useMemo(() => {
    const priceEur = priceM * 1_000_000;
    const coInvestEur = coInvestM * 1_000_000;

    const eurPerHa = priceEur / AREA_HA;
    const eurPerMw = priceEur / MW;
    const rawLandValueEur = AREA_HA * COMP_EUR_PER_HA;
    const devRightsValueEur = MW * COMP_EUR_PER_MW_DEVRIGHTS;
    const compFairPriceEur = rawLandValueEur + devRightsValueEur;

    // Investor-side simplified IRR:
    // Total investor outlay = price*equity% + coInvest
    // Total investor return by Y10 = EXIT_EV × equity% + distributions
    const investorIn = priceEur * (equityPct / 100) + coInvestEur;
    const investorExitY10 = EXIT_EV_M * 1_000_000 * (equityPct / 100) + coInvestEur * 0.6; // co-invest partially returned via ops
    const totalMultiple = investorIn > 0 ? investorExitY10 / investorIn : 0;
    // Simplified IRR over 10 years: (MoM)^(1/10) - 1
    const investorIrrPct = investorIn > 0 ? (Math.pow(Math.max(totalMultiple, 0.01), 0.1) - 1) * 100 : 0;

    // Paladina retained stake value at exit
    const retainedPct = 100 - equityPct;
    const paladinaRetainedEur = EXIT_EV_M * 1_000_000 * (retainedPct / 100);
    const paladinaCashOutEur = priceEur; // cash today from sale

    // Fairness: how does price compare to comp-based fair range?
    const fairnessRatio = priceEur / compFairPriceEur;
    let verdict: 'excellent' | 'fair' | 'thin' | 'aggressive';
    if (fairnessRatio < 0.75) verdict = 'excellent';
    else if (fairnessRatio < 1.15) verdict = 'fair';
    else if (fairnessRatio < 1.6) verdict = 'thin';
    else verdict = 'aggressive';

    return {
      priceEur,
      coInvestEur,
      investorIn,
      investorExitY10,
      totalMultiple,
      investorIrrPct,
      eurPerHa,
      eurPerMw,
      rawLandValueEur,
      devRightsValueEur,
      compFairPriceEur,
      paladinaRetainedEur,
      paladinaCashOutEur,
      fairnessRatio,
      verdict,
    };
  }, [priceM, equityPct, coInvestM]);

  /* =========================== RENDER =========================== */

  if (!open) return null;

  const verdictColor: Record<typeof derived.verdict, string> = {
    excellent: 'text-agri border-agri/50 bg-agri/10',
    fair: 'text-pulse border-pulse/50 bg-pulse/10',
    thin: 'text-sun border-sun/50 bg-sun/10',
    aggressive: 'text-spark border-spark/50 bg-spark/10',
  };
  const verdictLabel: Record<typeof derived.verdict, string> = {
    excellent: 'excellent · investor steal',
    fair: 'fair · market-consistent',
    thin: 'thin margin · above comps',
    aggressive: 'aggressive · premium pricing',
  };

  // Sparkline synthesizing IRR history across hypothetical prior offers
  const irrTrend = generateOfferTrend(priceM, equityPct, coInvestM);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={() => setOpen(false)}
        className="fixed inset-0 z-[195] flex items-center justify-center"
        style={{ background: 'rgba(10, 10, 11, 0.78)', backdropFilter: 'blur(14px)' }}
      >
        <motion.div
          initial={{ scale: 0.96, y: 8, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.98, y: 4, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-[min(1020px,94vw)] max-h-[92vh] overflow-hidden overflow-y-auto rounded-2xl border border-pulse/30 bg-surface/96 shadow-2xl backdrop-blur-2xl"
          style={{
            boxShadow:
              '0 40px 120px -20px rgba(124,92,255,0.45), 0 10px 30px -10px rgba(0,0,0,0.85)',
          }}
        >
          {/* HEADER */}
          <div className="flex items-center justify-between border-b border-border bg-canvas/60 px-6 py-4">
            <div className="flex items-center gap-3">
              <Handshake className="h-5 w-5 text-pulse" strokeWidth={1.6} />
              <div className="flex flex-col">
                <span className="font-display text-lg uppercase tracking-tech-tight text-text-primary">
                  negotiation mode · live
                </span>
                <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-text-muted">
                  3 sliders · 8 recomputes · real-time · kopanica-beravci SPV
                </span>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-md border border-border-bright bg-surface p-1.5 text-text-muted transition-colors hover:border-spark hover:text-spark"
            >
              <X className="h-3.5 w-3.5" strokeWidth={1.8} />
            </button>
          </div>

          {/* BODY */}
          <div className="grid grid-cols-[1.1fr_1fr] gap-0">
            {/* LEFT · sliders */}
            <div className="flex flex-col gap-6 border-r border-border px-6 py-5">
              <SliderBlock
                label="purchase price · SPV acquisition"
                tone="pulse"
                value={priceM}
                onChange={setPriceM}
                min={2}
                max={15}
                step={0.1}
                format={(v) => `€${v.toFixed(1)}M`}
                sub={`${formatEurPerHa(derived.eurPerHa)} €/ha · ${formatEur(derived.eurPerMw)} €/MW`}
              />
              <SliderBlock
                label="equity stake offered to investor"
                tone="agri"
                value={equityPct}
                onChange={setEquityPct}
                min={10}
                max={100}
                step={1}
                format={(v) => `${v.toFixed(0)}%`}
                sub={`paladina keeps ${(100 - equityPct).toFixed(0)}% · pro-rata upside`}
              />
              <SliderBlock
                label="co-investment · development CAPEX"
                tone="sun"
                value={coInvestM}
                onChange={setCoInvestM}
                min={0}
                max={10}
                step={0.25}
                format={(v) => `€${v.toFixed(2)}M`}
                sub={`${coInvestM > 5.25 ? 'over ' : coInvestM < 5.25 ? 'under ' : 'exact '}${formatPct((coInvestM / 21) * 100)}% of €21M CAPEX`}
              />

              {/* Verdict */}
              <div className={cn('rounded-lg border p-4', verdictColor[derived.verdict])}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em]">
                    <Scale className="h-3.5 w-3.5" strokeWidth={1.8} />
                    deal fairness
                  </div>
                  <div className="font-display text-sm uppercase tracking-tech-tight">
                    {verdictLabel[derived.verdict]}
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex-1">
                    <div className="relative h-2 overflow-hidden rounded-full border border-border bg-canvas/60">
                      {/* fair band · ±15% of comp fair price */}
                      <div className="absolute left-[35%] right-[35%] top-0 h-full bg-pulse/30" />
                      <motion.div
                        animate={{
                          left: `${Math.min(Math.max(derived.fairnessRatio * 40, 3), 96)}%`,
                        }}
                        transition={{ duration: 0.25 }}
                        className="absolute top-1/2 h-3.5 w-[3px] -translate-y-1/2 rounded-full bg-text-primary shadow-glow-pulse"
                      />
                    </div>
                    <div className="mt-1 flex justify-between font-mono text-[8px] uppercase tracking-[0.22em] text-text-muted">
                      <span>below comp</span>
                      <span>fair band</span>
                      <span>above comp</span>
                    </div>
                  </div>
                  <div className="font-mono text-[10px] tabular-nums text-text-muted">
                    {(derived.fairnessRatio * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT · outcomes */}
            <div className="flex flex-col gap-4 bg-canvas/50 px-6 py-5">
              {/* Investor outcome */}
              <div className="flex flex-col gap-3 rounded-lg border border-agri/30 bg-agri/5 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-agri">
                      investor · outcome
                    </span>
                    <span className="font-display text-[11px] uppercase tracking-tech-tight text-text-muted">
                      {formatEur(derived.investorIn)} in · Y10 exit
                    </span>
                  </div>
                  <Sparkline values={irrTrend} tone="agri" width={72} height={22} />
                </div>
                <div className="grid grid-cols-3 gap-3 text-text-secondary">
                  <OutcomeStat
                    label="investor IRR"
                    value={`${derived.investorIrrPct.toFixed(1)}%`}
                    tone={derived.investorIrrPct >= 14 ? 'agri' : derived.investorIrrPct >= 10 ? 'pulse' : 'spark'}
                    big
                  />
                  <OutcomeStat
                    label="MoM multiple"
                    value={`${derived.totalMultiple.toFixed(2)}×`}
                    tone={derived.totalMultiple >= 2.5 ? 'agri' : derived.totalMultiple >= 1.8 ? 'pulse' : 'spark'}
                  />
                  <OutcomeStat
                    label="Y10 return"
                    value={formatEur(derived.investorExitY10)}
                    tone="pulse"
                  />
                </div>
              </div>

              {/* Paladina outcome */}
              <div className="flex flex-col gap-3 rounded-lg border border-pulse/30 bg-pulse/5 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-pulse">
                    paladina · outcome
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
                    cash today + retained upside
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-text-secondary">
                  <OutcomeStat
                    label="cash out · today"
                    value={formatEur(derived.paladinaCashOutEur)}
                    tone="pulse"
                  />
                  <OutcomeStat
                    label="retained stake"
                    value={`${(100 - equityPct).toFixed(0)}%`}
                    tone="pulse"
                  />
                  <OutcomeStat
                    label="Y10 retained value"
                    value={formatEur(derived.paladinaRetainedEur)}
                    tone="pulse"
                    big
                  />
                </div>
              </div>

              {/* Fair-value decomposition */}
              <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface/30 p-4">
                <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-text-muted">
                  comp-based fair price · decomposition
                </span>
                <div className="grid grid-cols-2 gap-2 font-mono text-[10px] text-text-secondary">
                  <span>raw land · 80.3 ha × €13k/ha</span>
                  <span className="text-right tabular-nums">{formatEur(derived.rawLandValueEur)}</span>
                  <span>dev rights · 30 MW × €100k/MW</span>
                  <span className="text-right tabular-nums">{formatEur(derived.devRightsValueEur)}</span>
                  <span className="border-t border-border pt-1 text-text-primary">total fair</span>
                  <span className="border-t border-border pt-1 text-right text-text-primary tabular-nums">
                    {formatEur(derived.compFairPriceEur)}
                  </span>
                </div>
              </div>

              {/* Accept / Counter / Decline */}
              <div className="mt-auto grid grid-cols-3 gap-2">
                <ActionBtn
                  onClick={() => setOpen(false)}
                  icon={Check}
                  label="accept"
                  tone="agri"
                />
                <ActionBtn
                  onClick={() => {
                    // Demo: counter by bumping price 15% + retaining 5% more equity
                    setPriceM((p) => Math.min(15, p * 1.15));
                    setEquityPct((e) => Math.max(10, e - 5));
                  }}
                  icon={ArrowRight}
                  label="counter"
                  tone="sun"
                />
                <ActionBtn
                  onClick={() => setOpen(false)}
                  icon={X}
                  label="decline"
                  tone="spark"
                />
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex items-center justify-between border-t border-border bg-canvas/60 px-6 py-2.5 font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-border-bright bg-surface px-1 py-0.5">N</kbd>
                toggle
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-border-bright bg-surface px-1 py-0.5">esc</kbd>
                close
              </span>
              <span className="text-pulse">
                simplified · investor IRR does not model debt tranches · see /roi for full workbook
              </span>
            </div>
            <span>kopanica-beravci · SPV acquisition</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ======================== SUB-COMPONENTS ======================== */

function SliderBlock({
  label,
  tone,
  value,
  onChange,
  min,
  max,
  step,
  format,
  sub,
}: {
  label: string;
  tone: 'pulse' | 'agri' | 'sun' | 'signal' | 'spark';
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  sub: string;
}) {
  const toneText = { pulse: 'text-pulse', agri: 'text-agri', sun: 'text-sun', signal: 'text-signal', spark: 'text-spark' }[tone];
  const toneAccent = { pulse: 'accent-pulse', agri: 'accent-agri', sun: 'accent-sun', signal: 'accent-signal', spark: 'accent-spark' }[tone];
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">{label}</span>
        <motion.span
          key={value.toFixed(2)}
          initial={{ y: -3, opacity: 0.5 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className={cn('font-display text-3xl tracking-tech-tight tabular-nums', toneText)}
        >
          {format(value)}
        </motion.span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className={cn('w-full cursor-pointer', toneAccent)}
      />
      <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
        <span>{format(min)}</span>
        <span className={toneText}>{sub}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  );
}

function OutcomeStat({
  label,
  value,
  tone,
  big,
}: {
  label: string;
  value: string;
  tone: 'pulse' | 'agri' | 'sun' | 'signal' | 'spark';
  big?: boolean;
}) {
  const toneText = { pulse: 'text-pulse', agri: 'text-agri', sun: 'text-sun', signal: 'text-signal', spark: 'text-spark' }[tone];
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">{label}</span>
      <motion.span
        key={value}
        initial={{ y: -2, opacity: 0.6 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.22 }}
        className={cn(
          'font-display tracking-tech-tight tabular-nums',
          toneText,
          big ? 'text-2xl' : 'text-lg',
        )}
      >
        {value}
      </motion.span>
    </div>
  );
}

function ActionBtn({
  onClick,
  icon: Icon,
  label,
  tone,
}: {
  onClick: () => void;
  icon: any;
  label: string;
  tone: 'agri' | 'sun' | 'spark';
}) {
  const cls = {
    agri: 'border-agri/50 bg-agri/15 text-agri hover:bg-agri/25',
    sun: 'border-sun/50 bg-sun/15 text-sun hover:bg-sun/25',
    spark: 'border-spark/50 bg-spark/15 text-spark hover:bg-spark/25',
  }[tone];
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md border px-3 py-2.5 font-mono text-[11px] uppercase tracking-[0.22em] transition-colors',
        cls,
      )}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
      {label}
    </button>
  );
}

/* ============================ HELPERS ============================ */

function formatEur(eur: number): string {
  if (Math.abs(eur) >= 1_000_000) return `€${(eur / 1_000_000).toFixed(1)}M`;
  if (Math.abs(eur) >= 1_000) return `€${(eur / 1_000).toFixed(0)}k`;
  return `€${eur.toFixed(0)}`;
}
function formatEurPerHa(eur: number): string {
  return `€${(eur / 1000).toFixed(0)}k`;
}
function formatPct(p: number): string {
  return p.toFixed(0);
}

function generateOfferTrend(price: number, equity: number, coInv: number): number[] {
  // Synthetic trend simulating last 12 offer iterations approaching the current state.
  // Purely cosmetic — shows motion on every slider move.
  const seed = (price * 7 + equity * 11 + coInv * 13) | 0;
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const base = 8 + rand() * 6;
  return Array.from({ length: 12 }, (_, i) => base + (rand() - 0.5) * 2 + i * 0.35);
}
