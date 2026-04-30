import { motion } from 'framer-motion';
import { cn } from '@paladian/ui';

/**
 * BulletChart — classic KPI-vs-target horizontal bar.
 *
 * Anatomy · from back to front:
 *   · Qualitative "bad / OK / good" background bands
 *   · Actual value bar (thicker)
 *   · Target vertical marker (thin line)
 *
 * Every input is a number in the metric's native unit · caller provides a
 * format() function for display.
 */

export type BulletTone = 'pulse' | 'agri' | 'sun' | 'signal' | 'spark';

export interface BulletRow {
  label: string;
  actual: number;
  target: number;
  min?: number;        // defaults to 0
  max?: number;        // defaults to max(actual, target) * 1.25
  /** x-axis direction: higher is better ('up') or lower is better ('down') */
  direction?: 'up' | 'down';
  /** qualitative band cutoffs · ranges 0..1 of the scale */
  bands?: { poor: number; ok: number; good: number };
  format?: (v: number) => string;
  tone?: BulletTone;
  sub?: string;
}

const TONE_TEXT: Record<BulletTone, string> = {
  pulse: 'text-pulse',
  agri: 'text-agri',
  sun: 'text-sun',
  signal: 'text-signal',
  spark: 'text-spark',
};
const TONE_BAR: Record<BulletTone, string> = {
  pulse: 'bg-pulse',
  agri: 'bg-agri',
  sun: 'bg-sun',
  signal: 'bg-signal',
  spark: 'bg-spark',
};

export function BulletRow({ row }: { row: BulletRow }) {
  const min = row.min ?? 0;
  const max = row.max ?? Math.max(row.actual, row.target) * 1.25;
  const range = Math.max(max - min, 0.0001);
  const actualPct = ((row.actual - min) / range) * 100;
  const targetPct = ((row.target - min) / range) * 100;
  const fmt = row.format ?? ((v) => v.toString());
  const bands = row.bands ?? { poor: 0.35, ok: 0.7, good: 1 };
  const dir = row.direction ?? 'up';
  // Status: for up-direction, actual ≥ target = hit
  const hit = dir === 'up' ? row.actual >= row.target : row.actual <= row.target;
  const tone = row.tone ?? (hit ? 'agri' : 'spark');

  return (
    <div className="flex flex-col gap-1.5">
      {/* Top row: label + current + target */}
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
          {row.label}
        </span>
        <div className="flex items-baseline gap-2 font-mono">
          <motion.span
            key={row.actual}
            initial={{ y: -2, opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.25 }}
            className={cn('font-display text-lg tabular-nums tracking-tech-tight', TONE_TEXT[tone])}
          >
            {fmt(row.actual)}
          </motion.span>
          <span className="text-[9px] uppercase tracking-[0.22em] text-text-muted">
            target {fmt(row.target)}
          </span>
          {hit ? (
            <span className="rounded-sm bg-agri/20 px-1.5 py-0.5 text-[8.5px] uppercase tracking-[0.22em] text-agri">
              hit
            </span>
          ) : (
            <span className="rounded-sm bg-spark/20 px-1.5 py-0.5 text-[8.5px] uppercase tracking-[0.22em] text-spark">
              {dir === 'up' ? 'below' : 'over'}
            </span>
          )}
        </div>
      </div>

      {/* The bullet itself */}
      <div className="relative h-5 overflow-hidden rounded-sm border border-border bg-canvas/40">
        {/* Qualitative bands */}
        {dir === 'up' ? (
          <>
            <div
              className="absolute left-0 top-0 h-full bg-spark/12"
              style={{ width: `${bands.poor * 100}%` }}
            />
            <div
              className="absolute top-0 h-full bg-sun/12"
              style={{ left: `${bands.poor * 100}%`, width: `${(bands.ok - bands.poor) * 100}%` }}
            />
            <div
              className="absolute top-0 h-full bg-agri/15"
              style={{ left: `${bands.ok * 100}%`, width: `${(bands.good - bands.ok) * 100}%` }}
            />
          </>
        ) : (
          <>
            <div
              className="absolute left-0 top-0 h-full bg-agri/15"
              style={{ width: `${(1 - bands.ok) * 100}%` }}
            />
            <div
              className="absolute top-0 h-full bg-sun/12"
              style={{ left: `${(1 - bands.ok) * 100}%`, width: `${(bands.ok - bands.poor) * 100}%` }}
            />
            <div
              className="absolute top-0 h-full bg-spark/12"
              style={{ left: `${(1 - bands.poor) * 100}%`, right: 0 }}
            />
          </>
        )}

        {/* Actual value bar · animated */}
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${actualPct}%` }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            'absolute left-0 top-1/2 h-[10px] -translate-y-1/2 rounded-sm',
            TONE_BAR[tone],
          )}
          style={{
            boxShadow: `0 0 10px var(--tw-shadow-color)`,
          }}
        />

        {/* Target marker · thin vertical line */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="absolute top-[3px] h-[14px] w-[2px] bg-text-primary"
          style={{ left: `calc(${targetPct}% - 1px)`, boxShadow: '0 0 8px rgba(250,250,250,0.8)' }}
        />
      </div>

      {row.sub && (
        <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
          {row.sub}
        </span>
      )}
    </div>
  );
}

export function BulletChart({
  title,
  rows,
  description,
}: {
  title: string;
  rows: BulletRow[];
  description?: string;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface/30 p-6">
      <div className="flex flex-col gap-1">
        <h3 className="font-display text-xl uppercase tracking-tech-tight text-text-primary">
          {title}
        </h3>
        {description && (
          <p className="font-mono text-[11px] leading-relaxed text-text-secondary">
            {description}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-4">
        {rows.map((row) => (
          <BulletRow key={row.label} row={row} />
        ))}
      </div>

      {/* Legend */}
      <div className="mt-2 flex items-center gap-4 border-t border-border pt-2 font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-[10px] w-3 rounded-sm bg-agri" />
          actual
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-[2px] bg-text-primary" />
          target
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-[10px] w-3 bg-spark/15" />
          <span className="inline-block h-[10px] w-3 bg-sun/15" />
          <span className="inline-block h-[10px] w-3 bg-agri/20" />
          bands · poor / ok / good
        </span>
      </div>
    </div>
  );
}
