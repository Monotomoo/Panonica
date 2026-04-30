import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BookmarkCheck, ExternalLink } from 'lucide-react';
import { cn } from '@paladian/ui';
import { getSource } from '@/mock/sources';

interface Props {
  sourceId: string;
  children: React.ReactNode;
  className?: string;
  placement?: 'top' | 'bottom';
  variant?: 'dotted' | 'none';
}

/**
 * Wraps a number or phrase with a hoverable citation. Shows a small
 * popover with source name + authority + date + link. Dotted underline
 * is the "clickable/cited" hint — visible but unobtrusive.
 */
export function Sourced({ sourceId, children, className, placement = 'bottom', variant = 'dotted' }: Props) {
  const [open, setOpen] = useState(false);
  const source = getSource(sourceId);
  if (!source) return <>{children}</>;

  return (
    <span
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      className={cn(
        'relative inline-flex cursor-help items-baseline',
        variant === 'dotted' && 'underline decoration-dotted decoration-1 underline-offset-[3px] decoration-text-muted/60 hover:decoration-pulse',
        className,
      )}
      tabIndex={0}
    >
      {children}
      <AnimatePresence>
        {open && (
          <motion.span
            initial={{ opacity: 0, y: placement === 'bottom' ? -4 : 4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: placement === 'bottom' ? -4 : 4, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'pointer-events-none absolute z-[85] w-[280px] rounded-lg border border-border-bright bg-surface/95 p-3 text-left shadow-2xl backdrop-blur',
              placement === 'bottom' ? 'left-0 top-[calc(100%+6px)]' : 'left-0 bottom-[calc(100%+6px)]',
            )}
            role="tooltip"
            style={{ boxShadow: '0 16px 40px -10px rgba(124, 92, 255, 0.35)' }}
          >
            <span className="mb-1 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.22em] text-pulse">
              <BookmarkCheck className="h-2.5 w-2.5" strokeWidth={1.8} />
              source
            </span>
            <span className="block font-mono text-[11px] text-text-primary leading-snug">
              {source.name}
            </span>
            <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.22em] text-text-secondary">
              {source.authority}
            </span>
            {source.note && (
              <span className="mt-1.5 block font-mono text-[10px] leading-relaxed text-text-muted">
                {source.note}
              </span>
            )}
            <span className="mt-2 flex items-baseline justify-between border-t border-border/60 pt-2 font-mono text-[9px] uppercase tracking-[0.22em]">
              <span className="text-text-muted tabular-nums">{source.date}</span>
              {source.url && (
                <span className="inline-flex items-center gap-1 text-pulse">
                  <ExternalLink className="h-2 w-2" strokeWidth={1.8} />
                  {new URL(source.url).hostname}
                </span>
              )}
            </span>
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
