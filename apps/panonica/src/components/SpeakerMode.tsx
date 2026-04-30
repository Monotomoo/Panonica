import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Eye,
  EyeOff,
  Keyboard,
  Clock,
  MousePointerClick,
  Mic,
  Timer,
  X,
} from 'lucide-react';
import { cn } from '@paladian/ui';
import { noteForPath, keymapEntries } from '@/mock/speakerNotes';

/**
 * Speaker Mode · presenter-only notes overlay for Tomo.
 * Press P to toggle. Hidden from Ivan because it's a compact overlay
 * in the top-right of the viewport — easily ignored on projection,
 * legible on laptop screen.
 *
 * Also handles:
 *   - global 1-9/0 nav shortcuts (press any number to jump routes)
 *   - ? to open the keymap cheatsheet
 *   - panonica:speaker-toggle event (fired from CommandPalette)
 */
export function SpeakerMode() {
  const [open, setOpen] = useState(false);
  const [keymapOpen, setKeymapOpen] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const note = noteForPath(location.pathname);

  const ROUTE_BY_KEY: Record<string, string> = {
    '0': '/',
    '1': '/context',
    '2': '/land',
    '3': '/solar',
    '4': '/grid',
    '5': '/agriculture',
    '6': '/configurator',
    '7': '/roi',
    '8': '/scenarios',
    '9': '/risk',
  };

  // Global keyboard handling
  useEffect(() => {
    const shouldIgnore = (target: EventTarget | null): boolean => {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable;
    };

    const handler = (e: KeyboardEvent) => {
      // Ignore when typing in a field or palette/drawer is focused
      if (shouldIgnore(e.target)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      // P · toggle speaker mode
      if (e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setOpen((o) => !o);
        return;
      }

      // ? or / · toggle keymap
      if (e.key === '?' || e.key === '/') {
        e.preventDefault();
        setKeymapOpen((k) => !k);
        return;
      }

      // Escape · close keymap, then close speaker mode
      if (e.key === 'Escape') {
        if (keymapOpen) setKeymapOpen(false);
        else if (open) setOpen(false);
        return;
      }

      // 0-9 · jump route
      if (/^[0-9]$/.test(e.key) && ROUTE_BY_KEY[e.key]) {
        e.preventDefault();
        navigate(ROUTE_BY_KEY[e.key]);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, keymapOpen, navigate]);

  // External event (from Command Palette)
  useEffect(() => {
    const h = () => setOpen((o) => !o);
    window.addEventListener('panonica:speaker-toggle', h);
    return () => window.removeEventListener('panonica:speaker-toggle', h);
  }, []);

  // Timer for the current screen
  useEffect(() => {
    setElapsedSec(0);
    if (!open) return;
    const id = setInterval(() => setElapsedSec((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [open, location.pathname]);

  const timeBudget = note?.timeBudgetSec ?? 60;
  const overBudget = elapsedSec > timeBudget;
  const nearBudget = elapsedSec > timeBudget * 0.8 && !overBudget;

  return (
    <>
      {/* Persistent indicator bottom-left · only when speaker mode is on */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="fixed bottom-6 left-6 z-[70] inline-flex items-center gap-2 rounded-full border border-agri/40 bg-surface/90 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-agri shadow-glow-pulse backdrop-blur"
            title="Speaker mode active · press P to close"
          >
            <Mic className="h-3 w-3 animate-pulse-dot" strokeWidth={1.8} />
            <span>presenter · P</span>
            <span className={cn('font-mono tabular-nums', overBudget ? 'text-spark' : nearBudget ? 'text-sun' : 'text-agri')}>
              {fmtTime(elapsedSec)}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Speaker Notes panel · top-right · compact */}
      <AnimatePresence>
        {open && note && (
          <motion.div
            initial={{ opacity: 0, y: -8, x: 8 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -8, x: 8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed right-4 top-16 z-[70] w-[380px] overflow-hidden rounded-lg border border-agri/40 bg-surface/95 shadow-[0_20px_60px_-20px_rgba(74,222,128,0.3)] backdrop-blur-xl"
          >
            <div className="flex items-center justify-between border-b border-border bg-canvas/60 px-4 py-2 backdrop-blur">
              <div className="flex items-center gap-2">
                <Eye className="h-3.5 w-3.5 text-agri" strokeWidth={1.8} />
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-agri">
                  speaker · {note.title}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className={cn(
                  'flex items-center gap-1 rounded-sm px-2 py-0.5 font-mono text-[9px] tabular-nums',
                  overBudget ? 'text-spark' : nearBudget ? 'text-sun' : 'text-text-muted',
                )}>
                  <Timer className="h-2.5 w-2.5" strokeWidth={1.8} />
                  {fmtTime(elapsedSec)} / {fmtTime(timeBudget)}
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-sm border border-border bg-surface p-1 text-text-muted transition-colors hover:border-spark hover:text-spark"
                >
                  <X className="h-2.5 w-2.5" strokeWidth={1.8} />
                </button>
              </div>
            </div>

            <div className="flex max-h-[70vh] flex-col gap-3 overflow-y-auto px-4 py-3">
              {note.narrator.length > 0 && (
                <div>
                  <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.22em] text-pulse">
                    <Mic className="mr-1 inline h-2.5 w-2.5" strokeWidth={1.8} />
                    narrator
                  </div>
                  <ul className="flex flex-col gap-1">
                    {note.narrator.map((n, i) => (
                      <li
                        key={i}
                        className={cn(
                          'font-mono text-[11px] leading-relaxed',
                          n.startsWith('(') ? 'italic text-text-muted' : 'text-text-primary',
                        )}
                      >
                        {n}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {note.do.length > 0 && (
                <div>
                  <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.22em] text-agri">
                    <MousePointerClick className="mr-1 inline h-2.5 w-2.5" strokeWidth={1.8} />
                    do
                  </div>
                  <ul className="flex flex-col gap-1">
                    {note.do.map((d, i) => (
                      <li key={i} className="font-mono text-[11px] leading-relaxed text-text-secondary">
                        · {d}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {note.watch.length > 0 && (
                <div>
                  <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.22em] text-sun">
                    <Eye className="mr-1 inline h-2.5 w-2.5" strokeWidth={1.8} />
                    watch for
                  </div>
                  <ul className="flex flex-col gap-1">
                    {note.watch.map((w, i) => (
                      <li key={i} className="font-mono text-[11px] leading-relaxed text-text-secondary">
                        → {w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-2 flex items-center justify-between gap-2 border-t border-border/60 pt-2 font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
                <span>press <kbd className="mx-1 rounded border border-border-bright bg-surface px-1 py-0.5">?</kbd> keymap</span>
                <span>press <kbd className="mx-1 rounded border border-border-bright bg-surface px-1 py-0.5">P</kbd> close</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keymap cheatsheet · center modal */}
      <AnimatePresence>
        {keymapOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setKeymapOpen(false)}
            className="fixed inset-0 z-[95] flex items-center justify-center bg-canvas/70 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-[min(520px,92vw)] overflow-hidden rounded-xl border border-border-bright bg-surface/95 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex items-center gap-2 border-b border-border bg-canvas/60 px-5 py-3">
                <Keyboard className="h-4 w-4 text-pulse" strokeWidth={1.8} />
                <span className="font-display text-sm uppercase tracking-tech-tight text-text-primary">
                  keyboard shortcuts
                </span>
                <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
                  press ? to toggle
                </span>
              </div>
              <div className="grid grid-cols-2 gap-px bg-border">
                {keymapEntries.map((entry) => (
                  <div
                    key={entry.key}
                    className="flex items-center gap-3 bg-surface/80 px-5 py-3"
                  >
                    <kbd className="inline-flex h-7 min-w-[36px] items-center justify-center rounded border border-border-bright bg-canvas px-2 font-mono text-[11px] font-medium text-pulse">
                      {entry.key}
                    </kbd>
                    <span className="font-mono text-[11px] text-text-secondary">
                      {entry.label}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border bg-canvas/60 px-5 py-2 font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
                esc to close · all shortcuts work globally
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function fmtTime(s: number): string {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
}
