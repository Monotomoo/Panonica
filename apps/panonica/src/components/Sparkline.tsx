import { useMemo } from 'react';
import { cn } from '@paladian/ui';

/**
 * Sparkline — lightweight inline SVG trend indicator.
 *
 * Zero dependencies (no Recharts). Sized to fit inside stat cards.
 * Defaults to a monotone smooth line with optional area fill.
 *
 * Usage:
 *   <Sparkline values={[1,3,2,4,6,5,7]} tone="agri" />
 *   <Sparkline values={monthlyYield} tone="sun" height={18} fill />
 */

type Tone = 'pulse' | 'sun' | 'agri' | 'signal' | 'spark' | 'muted';

const TONE_HEX: Record<Tone, string> = {
  pulse: '#7C5CFF',
  sun: '#FFB800',
  agri: '#5BD9A1',
  signal: '#4FA6D9',
  spark: '#FF3D71',
  muted: '#6B7180',
};

interface Props {
  values: number[];
  tone?: Tone;
  width?: number;
  height?: number;
  fill?: boolean;
  showLastDot?: boolean;
  className?: string;
  strokeWidth?: number;
}

export function Sparkline({
  values,
  tone = 'pulse',
  width = 80,
  height = 22,
  fill = true,
  showLastDot = true,
  className,
  strokeWidth = 1.5,
}: Props) {
  const color = TONE_HEX[tone];

  const { pathD, areaD, lastPoint } = useMemo(() => {
    if (values.length < 2) {
      return { pathD: '', areaD: '', lastPoint: null as { x: number; y: number } | null };
    }
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = Math.max(max - min, 0.0001);
    const padY = 2;
    const usableH = height - padY * 2;
    const xStep = width / (values.length - 1);

    const points = values.map((v, i) => {
      const x = i * xStep;
      const y = padY + usableH - ((v - min) / range) * usableH;
      return [x, y] as [number, number];
    });

    // Catmull-Rom → Bezier smoothing
    const smooth = (pts: [number, number][]) => {
      if (pts.length < 2) return '';
      let d = `M ${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[Math.max(i - 1, 0)];
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const p3 = pts[Math.min(i + 2, pts.length - 1)];
        const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
        const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
        const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
        const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
        d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
      }
      return d;
    };

    const pathD = smooth(points);
    const areaD = `${pathD} L ${width} ${height} L 0 ${height} Z`;
    const lastPoint = { x: points[points.length - 1][0], y: points[points.length - 1][1] };

    return { pathD, areaD, lastPoint };
  }, [values, width, height]);

  if (!pathD) return null;

  const gradId = `spark-grad-${tone}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn('inline-block shrink-0', className)}
      aria-hidden
    >
      {fill && (
        <>
          <defs>
            <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <path d={areaD} fill={`url(#${gradId})`} />
        </>
      )}
      <path d={pathD} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      {showLastDot && lastPoint && (
        <circle cx={lastPoint.x} cy={lastPoint.y} r={1.8} fill={color} />
      )}
    </svg>
  );
}
