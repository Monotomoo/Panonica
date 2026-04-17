import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import { cn } from '../cn';

export interface TextScrambleProps {
  text: string;
  className?: string;
  /** Total duration of the scramble in ms */
  duration?: number;
  /** ms between scramble frames */
  frameInterval?: number;
  /** Trigger only when element enters view */
  triggerOnView?: boolean;
  /** Delay before the scramble starts (ms) */
  delay?: number;
  /** Character pool to sample random glyphs from */
  scrambleChars?: string;
  /** Called once the final text is resolved */
  onResolved?: () => void;
}

const DEFAULT_CHARS = '!<>-_\\/[]{}—=+*^?#________ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

interface Queue {
  from: string;
  to: string;
  start: number;
  end: number;
  char?: string;
}

/**
 * Apple-style character scramble that resolves to the target text.
 * Adapted from the standard "glitch text" pattern — each character
 * cycles through random glyphs on its own timeline, staggered across
 * the word, until all resolve to the final string.
 */
export function TextScramble({
  text,
  className,
  duration = 700,
  frameInterval = 40,
  triggerOnView = true,
  delay = 0,
  scrambleChars = DEFAULT_CHARS,
  onResolved,
}: TextScrambleProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-5% 0px' });
  const [output, setOutput] = useState(text);
  const frameRequest = useRef<number>();
  const frame = useRef(0);
  const intervalRef = useRef<number>();

  useEffect(() => {
    if (triggerOnView && !inView) return;

    const timer = setTimeout(() => {
      const queue: Queue[] = [];
      const maxStart = Math.max(0, (duration - frameInterval * 10) / frameInterval);

      for (let i = 0; i < text.length; i++) {
        const from = ' ';
        const to = text[i];
        const start = Math.floor(Math.random() * maxStart);
        const end = start + 4 + Math.floor(Math.random() * 8);
        queue.push({ from, to, start, end });
      }

      frame.current = 0;
      intervalRef.current = window.setInterval(() => {
        let complete = 0;
        let nextOutput = '';
        for (let i = 0; i < queue.length; i++) {
          const { from, to, start, end } = queue[i];
          let { char } = queue[i];
          if (frame.current >= end) {
            complete++;
            nextOutput += to;
          } else if (frame.current >= start) {
            if (!char || Math.random() < 0.28) {
              char = scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
              queue[i].char = char;
            }
            nextOutput += char;
          } else {
            nextOutput += from;
          }
        }
        setOutput(nextOutput);
        frame.current += 1;

        if (complete === queue.length && intervalRef.current) {
          window.clearInterval(intervalRef.current);
          intervalRef.current = undefined;
          onResolved?.();
        }
      }, frameInterval);
    }, delay);

    return () => {
      clearTimeout(timer);
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      if (frameRequest.current) cancelAnimationFrame(frameRequest.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, inView, triggerOnView]);

  return (
    <span ref={ref} className={cn('font-mono', className)}>
      {output || text}
    </span>
  );
}
