import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import { cn } from '../cn';

export interface TypewriterProps {
  text: string;
  /** ms per character */
  speed?: number;
  /** Delay in ms before starting */
  delay?: number;
  triggerOnView?: boolean;
  className?: string;
  cursor?: boolean;
  onComplete?: () => void;
}

export function Typewriter({
  text,
  speed = 45,
  delay = 0,
  triggerOnView = false,
  className,
  cursor = true,
  onComplete,
}: TypewriterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px' });
  const [index, setIndex] = useState(0);
  const [started, setStarted] = useState(!triggerOnView);

  useEffect(() => {
    if (triggerOnView && inView) setStarted(true);
  }, [triggerOnView, inView]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    setIndex(0);
    const startTimer = setTimeout(() => {
      const step = () => {
        i += 1;
        setIndex(i);
        if (i >= text.length) {
          onComplete?.();
          return;
        }
        timer = window.setTimeout(step, speed);
      };
      let timer = window.setTimeout(step, speed);
      return () => window.clearTimeout(timer);
    }, delay);
    return () => clearTimeout(startTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, text]);

  const done = index >= text.length;

  return (
    <span ref={ref} className={cn('inline-flex items-baseline', className)}>
      <span>{text.slice(0, index)}</span>
      {cursor && (
        <span
          aria-hidden
          className={cn(
            'ml-[0.08em] inline-block w-[0.55ch] -translate-y-[0.05em]',
            done ? 'animate-cursor-blink' : '',
          )}
        >
          {done ? '_' : '█'}
        </span>
      )}
    </span>
  );
}
