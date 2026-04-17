import { useEffect, useRef, useState } from 'react';
import { animate, useInView } from 'framer-motion';
import { cn } from '../cn';

type FormatLike = (value: number) => string;

export interface NumberTickerProps {
  value: number;
  /** Duration of the count-up in seconds */
  duration?: number;
  /** Locale for default formatting */
  locale?: string;
  /** Custom formatter — takes precedence over locale */
  format?: FormatLike;
  /** Decimal places when using default formatting */
  decimals?: number;
  /** Trigger count-up only once the element scrolls into view */
  triggerOnView?: boolean;
  /** Wait this many seconds before counting */
  delay?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  /** Starting value (defaults to 0 for counting up) */
  from?: number;
  /** Force-disable the animation — render the target value immediately */
  instant?: boolean;
}

/**
 * Count-up number with optional scroll-into-view trigger.
 *
 * Every magic moment in the brief asks for numbers that ticker in on first
 * reveal — this component is the shared surface for that behaviour.
 */
export function NumberTicker({
  value,
  duration = 1.2,
  locale = 'en-US',
  format,
  decimals = 0,
  triggerOnView = true,
  delay = 0,
  className,
  prefix,
  suffix,
  from = 0,
  instant = false,
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });
  const [display, setDisplay] = useState<number>(instant ? value : from);

  useEffect(() => {
    if (instant) {
      setDisplay(value);
      return;
    }
    if (triggerOnView && !inView) return;

    const controls = animate(from, value, {
      duration,
      delay,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setDisplay(latest),
    });

    return () => controls.stop();
  }, [value, from, duration, delay, inView, triggerOnView, instant]);

  const formatted = format
    ? format(display)
    : display.toLocaleString(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });

  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

/* --- Reusable formatters ------------------------------------------------- */

export const formatEUR: FormatLike = (v) =>
  `€${v.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

export const formatEURCompact: FormatLike = (v) => {
  if (Math.abs(v) >= 1_000_000) return `€${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `€${(v / 1_000).toFixed(1)}K`;
  return `€${v.toFixed(0)}`;
};

export const formatPercent: FormatLike = (v) => `${v.toFixed(1)}%`;

export const formatHectares: FormatLike = (v) => `${v.toFixed(1)} ha`;
