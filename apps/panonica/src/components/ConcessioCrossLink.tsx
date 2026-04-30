import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowUpRight,
  ExternalLink,
  FileSearch2,
  Loader2,
  Maximize2,
  Minimize2,
  X,
} from 'lucide-react';
import { cn } from '@paladian/ui';

interface Props {
  variant?: 'card' | 'inline';
  className?: string;
  initialDeal?: string;
}

/**
 * Inline card/button that opens a modal with an <iframe> to Concessio.
 * Positions Panonica as part of a broader product family — the same
 * team building solar investment tooling also built a public-asset
 * intelligence platform used to surface deal history.
 *
 * Requires Concessio dev server on :3001 (auto-started via preview_start).
 */
export function ConcessioCrossLink({ variant = 'card', className, initialDeal = 'deal/kupari' }: Props) {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const src = `http://localhost:3001/${initialDeal}`;

  const trigger =
    variant === 'inline' ? (
      <button
        onClick={() => setOpen(true)}
        className={cn(
          'group inline-flex items-center gap-2 rounded-md border border-border-bright bg-surface px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-text-secondary transition-all hover:border-pulse hover:text-pulse hover:shadow-glow-pulse',
          className,
        )}
      >
        <FileSearch2 className="h-3 w-3" strokeWidth={1.8} />
        see in concessio
        <ArrowUpRight className="h-3 w-3" strokeWidth={1.8} />
      </button>
    ) : (
      <button
        onClick={() => setOpen(true)}
        className={cn(
          'group flex items-start gap-4 rounded-lg border border-border bg-surface/40 p-5 text-left transition-all hover:border-pulse hover:bg-pulse/5 hover:shadow-glow-pulse',
          className,
        )}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-pulse/15 text-pulse">
          <FileSearch2 className="h-4 w-4" strokeWidth={1.8} />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <div className="flex items-baseline justify-between">
            <span className="font-display text-base uppercase tracking-tech-tight text-text-primary group-hover:text-pulse">
              Paladina · other deals
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
              companion platform
            </span>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
            Concessio · public-asset intelligence · live dossier
          </span>
          <span className="mt-1 font-mono text-[11px] leading-relaxed text-text-secondary">
            Open the Kupari concession file · 22-event timeline · entity graph · 10 source citations.
            This is the same operator surface running alongside Panonica.
          </span>
        </div>
        <ExternalLink className="h-4 w-4 shrink-0 text-text-muted transition-colors group-hover:text-pulse" strokeWidth={1.8} />
      </button>
    );

  return (
    <>
      {trigger}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[95] flex items-center justify-center"
            style={{ background: 'rgba(10, 10, 11, 0.78)', backdropFilter: 'blur(8px)' }}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                'relative overflow-hidden rounded-xl border border-border-bright bg-surface shadow-2xl transition-all duration-300',
                fullscreen ? 'h-[94vh] w-[98vw]' : 'h-[80vh] w-[min(1180px,94vw)]',
              )}
              style={{ boxShadow: '0 40px 100px -30px rgba(124, 92, 255, 0.35)' }}
            >
              {/* Window chrome */}
              <div className="flex items-center gap-3 border-b border-border bg-canvas/80 px-4 py-2 backdrop-blur">
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setOpen(false)}
                    className="h-3 w-3 rounded-full bg-spark transition-opacity hover:opacity-70"
                    aria-label="Close"
                  />
                  <span className="h-3 w-3 rounded-full bg-sun" />
                  <button
                    onClick={() => setFullscreen((f) => !f)}
                    className="h-3 w-3 rounded-full bg-agri transition-opacity hover:opacity-70"
                    aria-label="Fullscreen"
                  />
                </div>
                <div className="flex flex-1 items-center justify-center gap-2">
                  <FileSearch2 className="h-3 w-3 text-pulse" strokeWidth={1.8} />
                  <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-text-secondary">
                    concessio · public-asset intelligence
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
                    / {initialDeal}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setFullscreen((f) => !f)}
                    className="rounded-md border border-border-bright bg-surface p-1.5 text-text-muted transition-colors hover:border-pulse hover:text-pulse"
                    title={fullscreen ? 'Restore' : 'Fullscreen'}
                  >
                    {fullscreen ? <Minimize2 className="h-3 w-3" strokeWidth={1.8} /> : <Maximize2 className="h-3 w-3" strokeWidth={1.8} />}
                  </button>
                  <a
                    href={src}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-md border border-border-bright bg-surface p-1.5 text-text-muted transition-colors hover:border-pulse hover:text-pulse"
                    title="Open in new tab"
                  >
                    <ExternalLink className="h-3 w-3" strokeWidth={1.8} />
                  </a>
                  <button
                    onClick={() => setOpen(false)}
                    className="rounded-md border border-border-bright bg-surface p-1.5 text-text-muted transition-colors hover:border-spark hover:text-spark"
                    title="Close (esc)"
                  >
                    <X className="h-3 w-3" strokeWidth={1.8} />
                  </button>
                </div>
              </div>

              {/* Iframe */}
              <div className="relative h-[calc(100%-40px)] bg-canvas">
                {!loaded && (
                  <div className="absolute inset-0 flex items-center justify-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-text-muted">
                    <Loader2 className="h-4 w-4 animate-spin text-pulse" strokeWidth={1.8} />
                    loading concessio · localhost:3001 …
                  </div>
                )}
                <iframe
                  ref={iframeRef}
                  src={src}
                  title="Concessio · Kupari deal"
                  className={cn('h-full w-full border-0 transition-opacity', loaded ? 'opacity-100' : 'opacity-0')}
                  onLoad={() => setLoaded(true)}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
