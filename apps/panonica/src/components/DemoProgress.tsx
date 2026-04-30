import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Clock, RotateCcw } from 'lucide-react';
import { cn } from '@paladian/ui';
import { DEMO_ROUTES, useProgressStore } from '@/store/progressStore';

/**
 * Compact progress widget rendered in the StatusBar right slot.
 * Clicking opens a detail popover showing each route, time spent, and a
 * click-to-jump nav. Tracks visits via the progressStore effect in App.tsx.
 */
export function DemoProgress() {
  const location = useLocation();
  const navigate = useNavigate();
  const visits = useProgressStore((s) => s.visits);
  const reset = useProgressStore((s) => s.reset);
  const enter = useProgressStore((s) => s.enter);
  const [open, setOpen] = useState(false);

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Wire route changes to the progress store
  useEffect(() => {
    enter(location.pathname);
  }, [location.pathname, enter]);

  const visitedCount = DEMO_ROUTES.filter((r) => visits[r.path]).length;
  const pct = (visitedCount / DEMO_ROUTES.length) * 100;

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative inline-flex items-center gap-1.5 rounded-sm border border-border-bright bg-surface/60 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted transition-colors hover:border-agri hover:text-agri"
        title={`Demo progress · ${visitedCount} of ${DEMO_ROUTES.length} surfaces visited`}
      >
        <span className="tabular-nums">
          {visitedCount}/{DEMO_ROUTES.length}
        </span>
        <span className="inline-flex items-center gap-[2px]">
          {DEMO_ROUTES.map((r) => {
            const v = visits[r.path];
            const active = r.path === location.pathname;
            return (
              <span
                key={r.path}
                className={cn(
                  'h-1.5 w-1 rounded-full transition-colors',
                  active ? 'bg-pulse shadow-[0_0_4px_rgb(124,92,255)]' : v ? 'bg-agri' : 'bg-border-bright',
                )}
              />
            );
          })}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="absolute right-4 top-11 z-[75] w-[320px] overflow-hidden rounded-lg border border-border-bright bg-surface/95 shadow-2xl backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border bg-canvas/60 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-agri" strokeWidth={1.8} />
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-primary">
                  demo progress · {visitedCount}/{DEMO_ROUTES.length}
                </span>
              </div>
              <button
                onClick={reset}
                className="rounded-sm border border-border bg-surface px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted transition-colors hover:border-spark hover:text-spark"
                title="Reset progress tracker"
              >
                <RotateCcw className="inline h-2.5 w-2.5" strokeWidth={1.8} />
              </button>
            </div>

            <div className="h-1 w-full bg-border">
              <motion.div
                className="h-full bg-agri"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6 }}
              />
            </div>

            <div className="flex max-h-[60vh] flex-col gap-1 overflow-y-auto p-2">
              {DEMO_ROUTES.map((r) => {
                const v = visits[r.path];
                const active = r.path === location.pathname;
                const seconds = v ? Math.round(v.totalMs / 1000) : 0;
                return (
                  <button
                    key={r.path}
                    onClick={() => navigate(r.path)}
                    className={cn(
                      'group flex items-center gap-3 rounded-md px-3 py-2 text-left font-mono text-[11px] transition-colors',
                      active ? 'bg-pulse/10 text-pulse' : v ? 'bg-surface/30 hover:bg-surface/50 text-text-primary' : 'text-text-muted hover:bg-surface/30',
                    )}
                  >
                    <span
                      className={cn(
                        'inline-block h-1.5 w-1.5 rounded-full',
                        active ? 'bg-pulse shadow-[0_0_6px_rgb(124,92,255)]' : v ? 'bg-agri' : 'bg-border-bright',
                      )}
                    />
                    <span className="flex-1 uppercase tracking-[0.18em]">{r.label}</span>
                    {v && seconds > 0 && (
                      <span className="flex items-center gap-1 font-mono text-[9px] tabular-nums text-text-muted">
                        <Clock className="h-2.5 w-2.5" strokeWidth={1.8} />
                        {fmt(seconds)}
                      </span>
                    )}
                    {v && v.visits > 1 && (
                      <span className="font-mono text-[9px] tabular-nums text-text-muted">
                        ×{v.visits}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="border-t border-border bg-canvas/60 px-4 py-2 font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
              click a row to jump · {DEMO_ROUTES.length - visitedCount} remaining
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function fmt(s: number): string {
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  return `${m}:${(s % 60).toString().padStart(2, '0')}`;
}
