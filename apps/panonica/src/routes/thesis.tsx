import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Download, FileText, Loader2 } from 'lucide-react';
import { NumberTicker, cn } from '@paladian/ui';

type GenState = 'idle' | 'generating' | 'ready';

export function ThesisRoute() {
  const [state, setState] = useState<GenState>('idle');
  const [toast, setToast] = useState<string | null>(null);

  const handleGenerate = () => {
    if (state !== 'idle') return;
    setState('generating');
    setTimeout(() => {
      setState('ready');
      setToast('Thesis generated · preview mode');
      setTimeout(() => setToast(null), 2800);
    }, 2200);
  };

  return (
    <section className="relative flex min-h-full gap-8 px-12 py-10">
      {/* CENTER — document */}
      <div className="flex flex-1 flex-col items-center justify-start gap-6">
        {/* Toolbar */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleGenerate}
            disabled={state !== 'idle'}
            className={cn(
              'inline-flex items-center gap-2.5 rounded-md border px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.22em] transition-all',
              state === 'idle' &&
                'border-pulse/40 bg-pulse/10 text-pulse hover:shadow-glow-pulse',
              state === 'generating' && 'border-border bg-surface text-text-muted',
              state === 'ready' && 'border-agri/40 bg-agri/10 text-agri',
            )}
          >
            {state === 'idle' && (
              <>
                <FileText className="h-3.5 w-3.5" strokeWidth={2} /> generate pdf
              </>
            )}
            {state === 'generating' && (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2} /> compiling thesis
              </>
            )}
            {state === 'ready' && (
              <>
                <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> ready
              </>
            )}
          </button>

          <AnimatePresence>
            {state === 'ready' && (
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                onClick={() => {
                  setToast('Download queued · preview mode');
                  setTimeout(() => setToast(null), 2800);
                }}
                className="inline-flex items-center gap-2 rounded-md border border-border-bright bg-surface px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.22em] text-text-primary transition-all hover:border-pulse hover:shadow-glow-pulse"
              >
                <Download className="h-3.5 w-3.5" strokeWidth={1.8} /> download
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* The document */}
        <div className="relative">
          {/* Compile flash overlay */}
          <AnimatePresence>
            {state === 'generating' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-sm"
              >
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute left-0 right-0 h-[1px] bg-pulse/80"
                    initial={{ y: 0 }}
                    animate={{ y: ['0%', '100%'] }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: 'linear',
                    }}
                    style={{ boxShadow: '0 0 12px rgb(124 92 255 / 0.6)' }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.article
            animate={{
              scale: state === 'generating' ? 0.995 : 1,
              filter: state === 'generating' ? 'brightness(1.05)' : 'none',
            }}
            className="relative w-[680px] min-h-[880px] rounded-sm bg-[#fafaf7] text-[#0f0f10] shadow-2xl"
            style={{
              boxShadow:
                '0 32px 60px -20px rgba(124,92,255,0.15), 0 20px 40px -10px rgba(0,0,0,0.5)',
            }}
          >
            {/* Cover */}
            <div className="flex flex-col gap-6 p-14">
              <div className="flex items-baseline justify-between border-b border-black/10 pb-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-black/60">
                  panonica // investment thesis
                </span>
                <span className="font-mono text-[10px] text-black/60">HR-AGRI-2026-BERAVCI-01</span>
              </div>

              <div className="py-10">
                <h1 className="font-display text-[3.2rem] uppercase leading-[0.95] tracking-tech-tight">
                  Beravci Agrivoltaic Zone
                </h1>
                <p className="mt-2 font-mono text-xs uppercase tracking-[0.2em] text-black/60">
                  80.3 HA · OPĆINA VELIKA KOPANICA
                </p>
                <p className="mt-4 max-w-md font-serif text-base italic leading-snug text-black/80">
                  A first-mover agrivoltaic position in Pannonian Croatia, stacking domestic
                  (FZOEU · NPOO) and EU funding to unlock a 38 MWp + sheep-grazing deployment
                  on land already owned by Paladina Investments.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6 border-t border-black/10 pt-6">
                <FieldDark label="Owner" value="Paladina Investments" />
                <FieldDark label="Date" value="April 2026" />
                <FieldDark label="Proposed" value="Agri-PV + Sheep (38 MWp)" />
                <FieldDark label="Confidence" value="HIGH" tone="pulse" />
              </div>

              <div className="mt-6 flex items-end justify-between border-t border-black/10 pt-6">
                <div>
                  <div className="font-mono text-[9px] uppercase tracking-[0.24em] text-black/50">
                    analyzed by
                  </div>
                  <div className="font-display text-xl tracking-tech-tight">panonica_</div>
                </div>
                <QrBlock />
              </div>
            </div>

            {/* Page 2 preview */}
            <div className="border-t-2 border-dashed border-black/10 px-14 py-10">
              <h2 className="mb-2 font-display text-xl uppercase tracking-tech-tight">
                Key figures
              </h2>
              <div className="grid grid-cols-4 gap-4 border-b border-black/10 pb-6">
                <BigStat label="CAPEX" value="€34.2M" />
                <BigStat label="PAYBACK" value="9.1 yr" />
                <BigStat label="NPV (20)" value="€29.6M" />
                <BigStat label="IRR" value="11.4%" />
              </div>

              <div className="mt-6 grid grid-cols-2 gap-6">
                <div>
                  <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.24em] text-black/50">
                    funding stack
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="font-display text-3xl tracking-tech-tight">€25.5M</div>
                    <div className="pb-1 font-mono text-[10px] uppercase text-black/50">75% of CAPEX</div>
                  </div>
                  <ul className="mt-3 space-y-1 font-serif text-sm text-black/80">
                    <li>• FZOEU — €6.0M (40%)</li>
                    <li>• NPOO C1.3 — €12.0M (60%)</li>
                    <li>• HBOR Zeleni kredit — €7.5M</li>
                  </ul>
                </div>

                <div>
                  <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.24em] text-black/50">
                    risk factors
                  </div>
                  <ul className="space-y-1 font-serif text-sm text-black/80">
                    <li>• UPU amendment pending (Q2 2026)</li>
                    <li>• Grid queue position 14 · 8–14 mo</li>
                    <li>• Post-2026 net-billing modelled</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.article>
        </div>
      </div>

      {/* RIGHT — summary sidebar */}
      <aside className="w-[260px] shrink-0 self-start rounded-lg border border-border bg-surface/50 p-5">
        <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
          summary
        </div>
        <dl className="flex flex-col gap-2.5 font-mono text-[11px]">
          <SummaryKV k="Analyzed by" v="panonica_" />
          <SummaryKV k="Date" v="2026-04-18" />
          <SummaryKV k="Land area" v="80.3 ha" tone="pulse" />
          <SummaryKV k="Proposed" v="Agrivoltaic + sheep" />
          <SummaryKV k="Capacity" v="38 MWp" tone="pulse" />
          <SummaryKV k="CAPEX" v="€34.2M" />
          <SummaryKV k="Payback" v="9.1 years" tone="pulse" />
          <SummaryKV k="Funding stack" v="€25.5M (75%)" tone="sun" />
          <SummaryKV k="Net CAPEX" v="€8.7M" tone="sun" />
          <SummaryKV k="NPV (20 yr)" v="€29.6M" />
          <SummaryKV k="IRR" v="11.4%" />
        </dl>
        <div className="mt-5 border-t border-border pt-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
            confidence
          </div>
          <div className="font-display text-lg tracking-tech-tight text-agri">HIGH</div>
          <ul className="mt-3 flex flex-col gap-1 font-mono text-[10px] leading-relaxed text-text-secondary">
            <li>• UPU amendment pending</li>
            <li>• Grid queue position 14</li>
            <li>• Post-2026 net-billing impact modeled</li>
          </ul>
        </div>
      </aside>

      {/* TOAST */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="pointer-events-none absolute bottom-10 left-1/2 -translate-x-1/2 rounded-md border border-agri/30 bg-agri/15 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.22em] text-agri backdrop-blur"
          >
            <Check className="inline h-3 w-3 mr-2" strokeWidth={2.5} />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/* --------------------------------- sub ------------------------------------ */

function FieldDark({ label, value, tone }: { label: string; value: string; tone?: 'pulse' }) {
  return (
    <div>
      <div className="font-mono text-[9px] uppercase tracking-[0.24em] text-black/50">
        {label}
      </div>
      <div
        className={cn(
          'font-mono text-sm',
          tone === 'pulse' ? 'text-[#7C5CFF]' : 'text-black',
        )}
      >
        {value}
      </div>
    </div>
  );
}

function BigStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[9px] uppercase tracking-[0.24em] text-black/50">
        {label}
      </div>
      <div className="font-display text-2xl tracking-tech-tight">{value}</div>
    </div>
  );
}

function SummaryKV({
  k,
  v,
  tone,
}: {
  k: string;
  v: string;
  tone?: 'pulse' | 'sun';
}) {
  return (
    <div className="flex items-baseline justify-between border-b border-border/60 py-1">
      <dt className="text-[9px] uppercase tracking-[0.2em] text-text-muted">{k}</dt>
      <dd
        className={cn(
          'text-[11px] tabular-nums',
          tone === 'pulse' && 'text-pulse',
          tone === 'sun' && 'text-sun',
          !tone && 'text-text-primary',
        )}
      >
        {v}
      </dd>
    </div>
  );
}

function QrBlock() {
  // Stylized QR — 10×10 grid of random-stable cells
  const cells = Array.from({ length: 100 }, (_, i) => (i * 37) % 7 < 3);
  return (
    <div className="relative">
      <div className="grid grid-cols-10 gap-[1px] rounded-sm bg-black p-1">
        {cells.map((on, i) => (
          <div
            key={i}
            className={cn('h-[4px] w-[4px] rounded-[1px]', on ? 'bg-black' : 'bg-white')}
          />
        ))}
      </div>
      <div className="absolute inset-1 bg-white">
        {/* overlay to make it look like a QR — overlapping with grid below */}
      </div>
      <div className="relative grid grid-cols-10 gap-[1px] bg-white p-1">
        {cells.map((on, i) => (
          <div
            key={`fg-${i}`}
            className={cn('h-[4px] w-[4px]', on ? 'bg-black' : 'bg-white')}
          />
        ))}
      </div>
    </div>
  );
}
