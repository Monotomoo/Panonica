import type { ReactNode } from 'react';
import { cn } from '../cn';

export interface DataRow {
  label: string;
  value: ReactNode;
  hint?: string;
  /** Tone tints only the value */
  tone?: 'default' | 'pulse' | 'signal' | 'sun' | 'spark' | 'agri' | 'muted';
}

export interface DataPanelProps {
  rows: DataRow[];
  title?: string;
  className?: string;
  /** Align label left / value right (default) or stacked */
  layout?: 'row' | 'stack';
  divider?: boolean;
}

const toneClass = {
  default: 'text-text-primary',
  pulse: 'text-pulse',
  signal: 'text-signal',
  sun: 'text-sun',
  spark: 'text-spark',
  agri: 'text-agri',
  muted: 'text-text-muted',
} as const;

export function DataPanel({
  rows,
  title,
  className,
  layout = 'row',
  divider = true,
}: DataPanelProps) {
  return (
    <div className={cn('w-full', className)}>
      {title && (
        <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
          {title}
        </div>
      )}
      <div className={cn(divider && 'divide-y divide-border/60')}>
        {rows.map((row, i) => (
          <div
            key={`${row.label}-${i}`}
            className={cn(
              layout === 'row'
                ? 'flex items-baseline justify-between gap-6 py-2.5'
                : 'flex flex-col gap-1 py-2.5',
            )}
          >
            <div
              className={cn(
                'font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted',
                layout === 'row' && 'shrink-0',
              )}
            >
              {row.label}
            </div>
            <div
              className={cn(
                'font-mono text-sm tabular-nums',
                layout === 'row' && 'text-right',
                toneClass[row.tone ?? 'default'],
              )}
            >
              {row.value}
              {row.hint && (
                <span className="ml-2 text-[10px] text-text-muted">{row.hint}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
