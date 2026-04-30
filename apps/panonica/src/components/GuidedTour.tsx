import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Sparkles,
  Square,
} from 'lucide-react';
import { cn } from '@paladian/ui';

/**
 * Guided Tour Mode · Wave 2 stretch
 *
 * Press `T` anywhere (outside text inputs) to start a scripted 9-step demo
 * walkthrough of Panonica. Each step auto-advances on a timer, with SPACE to
 * pause/resume, ←/→ to manually step, and ESC to end.
 *
 * For the pitch: Tomo presses T at the start, sits back, watches Panonica
 * demo itself with synchronized narration captions + route changes. Ivan
 * sees a polished auto-film rather than someone clicking around.
 */

interface TourStep {
  path: string;
  title: string;
  caption: string;
  durationMs: number;
  tone: 'pulse' | 'sun' | 'agri' | 'signal' | 'spark';
  pointOut?: string;  // sub-line · "watch the…"
  event?: string;     // panonica:* event to dispatch on step enter (to open a tab, etc.)
}

type TourTrack = 'short' | 'long';

const SHORT_TOUR: TourStep[] = [
  {
    path: '/context',
    title: 'The deal · 80.3 ha · Kopanica-Beravci',
    caption: 'Ivan Paladina bought 80.3 hectares of Posavina farmland in 2019 via IGH bond recovery. Sat on it for 7 years. Net metering ended Jan 2026 — the window for this asset just opened.',
    pointOut: 'Watch the macro thesis + Slavonia free-capacity map come up.',
    durationMs: 14000,
    tone: 'pulse',
  },
  {
    path: '/context',
    title: 'Why now',
    caption: 'Net metering ended 2026-01-01. Household rooftop solar IRR collapsed 18% → 8%. Utility-scale agrivoltaic became the ONLY serious Croatian solar segment.',
    pointOut: 'Slavonia map · 1,180 MW free grid capacity.',
    durationMs: 18000,
    tone: 'pulse',
  },
  {
    path: '/corridor',
    title: 'The moat · transport',
    caption: 'Pan-European Corridor X + Vc cross right here. A3 motorway exit 0.3 km. D7 state road on the boundary. Railway 0.7 km. BiH border 11 km. The most CAPEX-light greenfield site we have seen in Slavonia.',
    pointOut: 'On-site HV line + gas pipeline · both already there.',
    durationMs: 22000,
    tone: 'signal',
  },
  {
    path: '/market',
    title: 'Competitive position',
    caption: 'You are #6 of 18 Pannonian solar projects by equity IRR. Top quartile. Strategic radar shows 8 axes of competitive moat vs market average.',
    pointOut: 'Bubble chart · Kopanica-Beravci sits top-right · efficient + profitable.',
    durationMs: 22000,
    tone: 'pulse',
  },
  {
    path: '/build',
    title: 'The Site · engineering',
    caption: 'EPC-grade builder. 16 sections, 120+ fields. The parcel polygon, infrastructure overlay from the PDF, sun path with shadow cone. Every number flows downstream.',
    pointOut: 'Toggle sun path · drag the hour slider · watch shadows sweep.',
    durationMs: 28000,
    tone: 'sun',
  },
  {
    path: '/roi',
    title: 'The model',
    caption: 'Base case 30 MW Phase 1 · €21M CAPEX · 11.4% equity IRR · 1.78× DSCR · €30M exit enterprise value at year 10.',
    pointOut: 'Monte Carlo rain · 1,000 simulations · P10/P50/P90 bands.',
    durationMs: 26000,
    tone: 'agri',
    event: 'panonica:finance-tab:montecarlo',
  },
  {
    path: '/risk',
    title: 'What can go wrong',
    caption: 'RCP 4.5 vs 8.5 climate stress. Insurance coverage. Force majeure list. Political risk score. Grid availability. Every tail risk modeled.',
    pointOut: 'Climate scenario slider · watch IRR recompute.',
    durationMs: 18000,
    tone: 'spark',
  },
  {
    path: '/thesis',
    title: 'The leave-behind',
    caption: 'Four-page PDF thesis. Generate it, download it, copy as markdown, email Ivan, or share the live deal room link with a QR code.',
    pointOut: 'Click "Share · deal room" for the shareable URL.',
    durationMs: 18000,
    tone: 'sun',
  },
  {
    path: '/offtake',
    title: 'One deal · one window',
    caption: 'Kopanica-Beravci is the anchor position. FZOEU deadline July 2026. Grid connection Q3 2027. COD month 17. Pantheon and 5 other buyers waiting on the supply side.',
    pointOut: 'Press T again to replay · ESC to exit tour · ⌘⇧F for Mission Control.',
    durationMs: 14000,
    tone: 'agri',
  },
];

/** LONG (deep-dive) tour · 14 steps · ~13 min · for Ivan-and-his-analyst sessions. */
const LONG_TOUR: TourStep[] = [
  {
    path: '/context',
    title: 'The deal · 80.3 ha at Kopanica-Beravci',
    caption: 'Ivan Paladina acquired 80.3 hectares of Posavina farmland in 2019 through IGH bond recovery. Sat on it for 7 years. Net metering ended January 2026 — utility-scale agrivoltaic became the only serious Croatian solar segment. The window opened.',
    pointOut: 'Macro thesis · Slavonia 1,180 MW free grid capacity · 28-month closing window.',
    durationMs: 16000,
    tone: 'pulse',
  },
  {
    path: '/context',
    title: 'Why now',
    caption: 'Net metering ended 2026-01-01 — Croatian rooftop solar IRR collapsed 18% → 8%. Utility-scale + agrivoltaic became the ONLY serious Croatian solar segment. OIEH estimates 2,500 MW of free grid capacity across Slavonia · Banovina · Istria — a window industry observers expect to close within 28 months.',
    pointOut: 'Slavonia has 1,180 MW of the free pool · 210 already allocated · 18 substations in play.',
    durationMs: 40000,
    tone: 'pulse',
  },
  {
    path: '/corridor',
    title: 'The moat · transport',
    caption: 'Pan-European Corridor X + Vc cross at this exact point. A3 motorway exit 0.3 km from the parcel. D7 state road on the southern boundary. MP13C railway with Kopanica-Beravci station 0.7 km. BiH border 11 km · Sava port 22 km. The most CAPEX-light greenfield position we have seen in Slavonia.',
    pointOut: 'HV transmission line + gas pipeline both already on-site · no MV cable build, no substation build.',
    durationMs: 40000,
    tone: 'signal',
  },
  {
    path: '/land',
    title: 'The parcel · 80.3 ha',
    caption: 'Fluvisol soil class II–III · Sava valley alluvium · flat Posavina plain at 86–91m elevation · <1% mean slope. Drainage imperfect but marginal to the 100-yr flood zone. 51 cadastral parcels · UPU amendment in public consultation on May 20.',
    pointOut: 'Parcel outline + topography + soil + hydrology regulatory gates.',
    durationMs: 30000,
    tone: 'agri',
  },
  {
    path: '/solar',
    title: 'The resource',
    caption: 'GHI 1,382 kWh/m²/yr. Peak sun hours 4.9/day. JinkoSolar Tiger Neo 620 bifacial · 8% rear-side uplift · n-TOPCon cells. Optional 1-axis tracking adds 8% yield at +€80k/MW CAPEX. First-year degradation 1.0%, annual 0.4%. PR 84.3% target.',
    pointOut: 'Tech comparison · HJT vs TOPCon vs IBC · tracker vs fixed ROI delta.',
    durationMs: 32000,
    tone: 'sun',
  },
  {
    path: '/grid',
    title: 'The grid',
    caption: 'HOPS queue position #14 of 62 · TS Slavonski Brod 1 (110/35 kV) · 22.8 km via A3 corridor · 35 kV MV collection. Connection agreement target Q3 2027. Queue velocity 2.1 positions/month · promotes to #8 by October 2026.',
    pointOut: 'IEC 61850 compliant · LVRT/HVRT/PQ envelope verified · SCADA dual-redundant fiber.',
    durationMs: 30000,
    tone: 'signal',
  },
  {
    path: '/agriculture',
    title: 'The under-panel',
    caption: '96 Dalmatian Pramenka sheep grazing under 4.2m-raised panels. 1.2 head/ha stocking. CAP Pillar 2 ecoscheme eligible. EIP-AGRI operational. Annual agri revenue €117k + CAP payments €33k. Biodiversity uplift +25% at year 5.',
    pointOut: 'Fraunhofer ISE benchmarks · agrivoltaic yield premium vs monoculture.',
    durationMs: 28000,
    tone: 'agri',
  },
  {
    path: '/build',
    title: 'The Site · engineering',
    caption: 'EPC-grade builder · 16 sections · 120+ fields. Leaflet map with PDF-verified infrastructure overlay. Sun path with shadow cone + GHI heat ring. Live BoM generation. Health score validator. Every slider flows downstream to the finance model.',
    pointOut: 'Toggle sun path · drag the hour slider · measure distance to A3 exit.',
    durationMs: 44000,
    tone: 'sun',
  },
  {
    path: '/market',
    title: 'Competitive position',
    caption: '18 live Pannonian solar projects in the same HOPS queue + FZOEU pool. You are #6 by equity IRR. Top quartile. 8-axis strategic radar shows your competitive moats: on-site infra +4.5, transport +4.0, agri-PV bonus +4.6, export optionality +4.9 (BiH market 11 km).',
    pointOut: 'Bubble chart · Kopanica-Beravci sits top-right · better CAPEX + competitive IRR.',
    durationMs: 38000,
    tone: 'pulse',
  },
  {
    path: '/roi',
    title: 'The model · Monte Carlo',
    caption: 'Base case 30 MW Phase 1 · €21M CAPEX · €700k/MW. 11.4% equity IRR · 1.78× DSCR Y1 · €30M exit EV at 6.5% cap in Y10. 1,000-simulation Monte Carlo: P10 7.8% · P50 11.4% · P90 15.0%. Sensitivity tornado: price > yield > CAPEX > debt > OPEX.',
    pointOut: 'Watch 1,000 particles rain into IRR buckets · P10/P50/P90 markers emerge.',
    durationMs: 50000,
    tone: 'agri',
    event: 'panonica:finance-tab:montecarlo',
  },
  {
    path: '/subsidies',
    title: 'The funding stack',
    caption: '75% non-dilutive. FZOEU OI-2026-03 €4.2M (deadline Jul 15). NPOO C1.2.R1-I1 €8.4M. HBOR Zeleni kredit €3.2M. All stackable. Expected award probability 35% × FZOEU · separately on NPOO. Upside €5.67M if both hit.',
    pointOut: 'The pool split visualization · your 10% slice of €42M.',
    durationMs: 30000,
    tone: 'sun',
  },
  {
    path: '/risk',
    title: 'What can go wrong',
    caption: 'RCP 4.5 vs 8.5 climate stress · panel derating, hail frequency, flood exposure all modeled. Insurance stack: property all-risk + revenue loss + liability + cyber. Force majeure list. Political risk · regulatory risk · counterparty risk scored.',
    pointOut: 'Drag the climate scenario slider · watch IRR recompute live.',
    durationMs: 32000,
    tone: 'spark',
  },
  {
    path: '/timeline',
    title: 'The 25-year clock',
    caption: 'Scrub Y0 → Y25. Watch: preliminary design → UPU consultation → grid agreement → FZOEU submission → building permit → module procurement → ground-breaking → pile-driving → first MW → inverter commissioning → MV cable → HOPS sync → battery install → COD (month 17) → refi year 8 → exit year 10.',
    pointOut: 'Each milestone animates in sequence · full capital deployment curve.',
    durationMs: 32000,
    tone: 'pulse',
  },
  {
    path: '/thesis',
    title: 'The leave-behind',
    caption: 'Four-page PDF investment thesis — cover + macro thesis + key figures + funding stack + exit DCF. Generate it, download it, copy as Markdown, email Ivan (pre-filled mailto), or share the live Deal Room link (encoded URL + QR code).',
    pointOut: 'Click "Share · deal room" for the QR that works on any phone offline.',
    durationMs: 24000,
    tone: 'sun',
  },
  {
    path: '/offtake',
    title: 'One deal · one window',
    caption: 'Kopanica-Beravci is the anchor position. FZOEU deadline July 2026. Grid connection Q3 2027. COD month 17. Exit year 10 at €30M EV. Ratio to Kupari paper 9.5×. Pantheon and 5 other buyers stalking the supply side. The window closes 2028.',
    pointOut: 'Press T to replay short · Shift+T to replay this deep-dive · ⌘⇧F for Mission Control.',
    durationMs: 20000,
    tone: 'agri',
  },
];

const SHORT_MS = SHORT_TOUR.reduce((s, st) => s + st.durationMs, 0);
const LONG_MS = LONG_TOUR.reduce((s, st) => s + st.durationMs, 0);

export function GuidedTour() {
  const [open, setOpen] = useState(false);
  const [track, setTrack] = useState<TourTrack>('short');
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [elapsed, setElapsed] = useState(0); // ms elapsed within current step
  const navigate = useNavigate();
  const location = useLocation();
  const openRef = useRef(open);
  const playingRef = useRef(playing);
  const stepIdxRef = useRef(stepIdx);
  openRef.current = open;
  playingRef.current = playing;
  stepIdxRef.current = stepIdx;

  const TOUR = track === 'long' ? LONG_TOUR : SHORT_TOUR;
  const TOTAL_MS = track === 'long' ? LONG_MS : SHORT_MS;
  const step = TOUR[stepIdx];

  /* ========================= LIFECYCLE · OPEN ========================= */

  const start = useCallback(
    (t: TourTrack = 'short') => {
      setTrack(t);
      setOpen(true);
      setStepIdx(0);
      setPlaying(true);
      setElapsed(0);
      const tour = t === 'long' ? LONG_TOUR : SHORT_TOUR;
      navigate(tour[0].path);
    },
    [navigate],
  );

  const end = useCallback(() => {
    setOpen(false);
    setPlaying(false);
    setElapsed(0);
  }, []);

  const next = useCallback(() => {
    const tour = track === 'long' ? LONG_TOUR : SHORT_TOUR;
    setStepIdx((i) => {
      const n = Math.min(tour.length - 1, i + 1);
      if (n !== i) {
        navigate(tour[n].path);
        setElapsed(0);
      }
      return n;
    });
  }, [navigate, track]);

  const prev = useCallback(() => {
    const tour = track === 'long' ? LONG_TOUR : SHORT_TOUR;
    setStepIdx((i) => {
      const p = Math.max(0, i - 1);
      if (p !== i) {
        navigate(tour[p].path);
        setElapsed(0);
      }
      return p;
    });
  }, [navigate, track]);

  const switchTrack = useCallback(
    (t: TourTrack) => {
      if (t === track) return;
      setTrack(t);
      setStepIdx(0);
      setElapsed(0);
      setPlaying(true);
      const tour = t === 'long' ? LONG_TOUR : SHORT_TOUR;
      navigate(tour[0].path);
    },
    [navigate, track],
  );

  /* ========================= KEYBOARD ========================= */

  useEffect(() => {
    const isTypingTarget = (t: EventTarget | null): boolean => {
      if (!(t instanceof HTMLElement)) return false;
      const tag = t.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || t.isContentEditable;
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (isTypingTarget(e.target)) return;
      const k = e.key.toLowerCase();
      if (k === 't' && !openRef.current) {
        e.preventDefault();
        // Shift+T → deep-dive · T → short
        start(e.shiftKey ? 'long' : 'short');
        return;
      }
      if (!openRef.current) return;
      if (e.key === 'Escape') {
        end();
      } else if (e.key === ' ') {
        e.preventDefault();
        setPlaying((p) => !p);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        next();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prev();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [start, end, next, prev]);

  /* ========================= AUTO-ADVANCE ========================= */

  useEffect(() => {
    if (!open || !playing) return;
    const tickMs = 120;
    const id = setInterval(() => {
      setElapsed((e) => {
        const nextElapsed = e + tickMs;
        if (nextElapsed >= step.durationMs) {
          if (stepIdxRef.current < TOUR.length - 1) {
            next();
            return 0;
          }
          // Last step done · stop playing but stay open so user can re-navigate
          setPlaying(false);
          return step.durationMs;
        }
        return nextElapsed;
      });
    }, tickMs);
    return () => clearInterval(id);
  }, [open, playing, step.durationMs, next, TOUR.length]);

  /* ========================= EVENT ENTRY ========================= */

  // Fire sub-tab events on step enter
  useEffect(() => {
    if (!open || !step.event) return;
    const parts = step.event.split(':');
    if (parts.length < 2) return;
    const name = parts.slice(0, 2).join(':');
    const detail = parts.length > 2 ? parts.slice(2).join(':') : undefined;
    const tid = setTimeout(() => {
      window.dispatchEvent(new CustomEvent(name, { detail }));
    }, 600);
    return () => clearTimeout(tid);
  }, [open, step.event]);

  /* ========================= EVENTS FOR EXT TRIGGER ========================= */

  useEffect(() => {
    const h = (e: Event) => {
      const detail = (e as CustomEvent).detail as TourTrack | undefined;
      if (openRef.current) {
        end();
      } else {
        start(detail === 'long' ? 'long' : 'short');
      }
    };
    window.addEventListener('panonica:guided-tour-toggle', h);
    return () => window.removeEventListener('panonica:guided-tour-toggle', h);
  }, [start, end]);

  /* ========================= RENDER ========================= */

  if (!open) return null;

  const overallElapsed =
    TOUR.slice(0, stepIdx).reduce((s, st) => s + st.durationMs, 0) + elapsed;
  const overallPct = (overallElapsed / TOTAL_MS) * 100;
  const stepPct = (elapsed / step.durationMs) * 100;

  const toneBg: Record<TourStep['tone'], string> = {
    pulse: 'border-pulse/40 bg-pulse/10',
    sun: 'border-sun/40 bg-sun/10',
    agri: 'border-agri/40 bg-agri/10',
    signal: 'border-signal/40 bg-signal/10',
    spark: 'border-spark/40 bg-spark/10',
  };
  const toneText: Record<TourStep['tone'], string> = {
    pulse: 'text-pulse',
    sun: 'text-sun',
    agri: 'text-agri',
    signal: 'text-signal',
    spark: 'text-spark',
  };
  const toneBar: Record<TourStep['tone'], string> = {
    pulse: 'bg-pulse',
    sun: 'bg-sun',
    agri: 'bg-agri',
    signal: 'bg-signal',
    spark: 'bg-spark',
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Top progress bar · fixed, glows in current tone */}
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none fixed left-0 right-0 top-0 z-[210] flex flex-col"
          >
            <div className="h-[3px] w-full overflow-hidden bg-canvas/80">
              <motion.div
                className={cn('h-full', toneBar[step.tone])}
                animate={{ width: `${overallPct}%` }}
                transition={{ duration: 0.2, ease: 'linear' }}
                style={{ boxShadow: `0 0 12px currentColor` }}
              />
            </div>
          </motion.div>

          {/* Bottom narration drawer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto fixed bottom-4 left-1/2 z-[210] -translate-x-1/2"
            style={{ width: 'min(880px, 94vw)' }}
          >
            <div
              className={cn(
                'flex flex-col gap-3 rounded-xl border bg-canvas/92 px-6 py-4 shadow-2xl backdrop-blur-2xl',
                toneBg[step.tone],
              )}
              style={{
                boxShadow:
                  '0 30px 80px -20px rgba(124,92,255,0.4), 0 4px 12px -4px rgba(0,0,0,0.6)',
              }}
            >
              {/* Top row · step + track switch + progress */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <motion.span
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={cn('inline-block h-1.5 w-1.5 rounded-full', toneBar[step.tone])}
                  />
                  <span className="font-mono text-[9px] uppercase tracking-[0.26em] text-text-muted">
                    guided tour · step {stepIdx + 1} of {TOUR.length}
                  </span>
                  <span className={cn('font-mono text-[9px] uppercase tracking-[0.26em]', toneText[step.tone])}>
                    {step.path === '/' ? 'hero' : step.path.replace('/', '')}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {/* Track selector · short vs deep dive */}
                  <div className="inline-flex items-center gap-0.5 rounded-md border border-border-bright bg-canvas/60 p-0.5 font-mono text-[9px] uppercase tracking-[0.22em]">
                    <button
                      onClick={() => switchTrack('short')}
                      className={cn(
                        'rounded-sm px-2 py-0.5 transition-colors',
                        track === 'short'
                          ? 'bg-pulse/25 text-pulse'
                          : 'text-text-muted hover:text-text-primary',
                      )}
                      title="9-step short tour · ~2:40"
                    >
                      short · {Math.round(SHORT_MS / 60000)}m
                    </button>
                    <button
                      onClick={() => switchTrack('long')}
                      className={cn(
                        'rounded-sm px-2 py-0.5 transition-colors',
                        track === 'long'
                          ? 'bg-pulse/25 text-pulse'
                          : 'text-text-muted hover:text-text-primary',
                      )}
                      title="15-step deep dive · ~9 min"
                    >
                      deep · {Math.round(LONG_MS / 60000)}m
                    </button>
                  </div>
                  <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted tabular-nums">
                    {formatTime(overallElapsed)} / {formatTime(TOTAL_MS)}
                  </span>
                </div>
              </div>

              {/* Caption */}
              <div className="flex flex-col gap-1.5">
                <motion.h2
                  key={step.title}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className={cn(
                    'font-display text-[clamp(1.2rem,2.2vw,1.8rem)] uppercase leading-tight tracking-tech-tight',
                    toneText[step.tone],
                  )}
                >
                  {step.title}
                </motion.h2>
                <motion.p
                  key={step.caption}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.55, delay: 0.1 }}
                  className="font-mono text-[12px] leading-relaxed text-text-secondary"
                >
                  {step.caption}
                </motion.p>
                {step.pointOut && (
                  <motion.p
                    key={step.pointOut}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.55, delay: 0.25 }}
                    className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted"
                  >
                    →  {step.pointOut}
                  </motion.p>
                )}
              </div>

              {/* Step progress bar */}
              <div className="h-[2px] w-full overflow-hidden rounded-full bg-border/60">
                <motion.div
                  className={cn('h-full', toneBar[step.tone])}
                  animate={{ width: `${stepPct}%` }}
                  transition={{ duration: 0.15, ease: 'linear' }}
                />
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TourButton onClick={prev} icon={ChevronLeft} label="prev" disabled={stepIdx === 0} />
                  <TourButton
                    onClick={() => setPlaying((p) => !p)}
                    icon={playing ? Pause : Play}
                    label={playing ? 'pause' : 'play'}
                    tone={step.tone}
                    filled
                  />
                  <TourButton onClick={next} icon={ChevronRight} label="next" disabled={stepIdx === TOUR.length - 1} />
                  <TourButton onClick={end} icon={Square} label="end" />
                </div>
                <div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-border-bright bg-surface px-1 py-0.5">space</kbd>
                    play
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-border-bright bg-surface px-1 py-0.5">←→</kbd>
                    step
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-border-bright bg-surface px-1 py-0.5">esc</kbd>
                    end
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-border-bright bg-surface px-1 py-0.5">T</kbd>
                    short
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-border-bright bg-surface px-1 py-0.5">⇧T</kbd>
                    deep
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ============================ SUB-COMPONENTS ============================ */

function TourButton({
  onClick,
  icon: Icon,
  label,
  disabled,
  tone,
  filled,
}: {
  onClick: () => void;
  icon: any;
  label: string;
  disabled?: boolean;
  tone?: 'pulse' | 'sun' | 'agri' | 'signal' | 'spark';
  filled?: boolean;
}) {
  const baseCls = disabled
    ? 'cursor-not-allowed border-border bg-transparent text-text-muted/50'
    : filled && tone
      ? {
          pulse: 'border-pulse bg-pulse/20 text-pulse hover:bg-pulse/30',
          sun: 'border-sun bg-sun/20 text-sun hover:bg-sun/30',
          agri: 'border-agri bg-agri/20 text-agri hover:bg-agri/30',
          signal: 'border-signal bg-signal/20 text-signal hover:bg-signal/30',
          spark: 'border-spark bg-spark/20 text-spark hover:bg-spark/30',
        }[tone]
      : 'border-border-bright bg-surface/50 text-text-secondary hover:border-pulse hover:text-pulse';

  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] transition-colors',
        baseCls,
      )}
    >
      <Icon className="h-3 w-3" strokeWidth={1.8} />
      {label}
    </button>
  );
}

function formatTime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
}
