import { useEffect, useState, type ReactNode } from 'react';
import { cn } from '../cn';

export interface StatusBarProps {
  /** App wordmark, lowercase with trailing underscore cursor */
  wordmark: string;
  /** Breadcrumb area, pre-formatted (mono, muted) */
  breadcrumb?: ReactNode;
  /** Coordinates or right-side metadata — mono */
  coordinates?: string;
  /** Right-aligned extra slot (e.g. portfolio delta) */
  rightSlot?: ReactNode;
  /** Whether to show a live clock */
  clock?: boolean;
  className?: string;
}

function useClock(enabled: boolean) {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    if (!enabled) return;
    const id = window.setInterval(() => setTime(new Date()), 1000);
    return () => window.clearInterval(id);
  }, [enabled]);
  return time;
}

const pad = (n: number) => n.toString().padStart(2, '0');

export function StatusBar({
  wordmark,
  breadcrumb,
  coordinates,
  rightSlot,
  clock = true,
  className,
}: StatusBarProps) {
  const time = useClock(clock);
  const t = `${pad(time.getHours())}:${pad(time.getMinutes())}:${pad(time.getSeconds())}`;

  return (
    <header
      className={cn(
        'relative z-30 flex h-11 items-center border-b border-border bg-canvas/90 backdrop-blur',
        'px-5',
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <span className="font-display text-sm tracking-tech-tight text-text-primary">
          {wordmark}
          <span className="text-pulse underscore-cursor" aria-hidden />
        </span>
      </div>

      <div className="mx-6 flex-1 truncate text-center font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
        {breadcrumb}
      </div>

      <div className="flex items-center gap-5 font-mono text-[11px] text-text-secondary">
        {clock && <span className="tabular-nums">{t}</span>}
        {coordinates && <span className="tabular-nums text-text-secondary">{coordinates}</span>}
        {rightSlot}
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-agri animate-pulse-dot" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted">live</span>
        </span>
      </div>
    </header>
  );
}
