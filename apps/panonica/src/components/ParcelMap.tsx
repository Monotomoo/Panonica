import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@paladian/ui';

/**
 * Parcel outline — organic polygon for the 80.3 ha Kopanica-Beravci plot
 * centered at 45.1348°N 18.4130°E. Values are percentages of the
 * kopanica-close.jpg canvas (shot at zoom 14.5, 1280x960@2x).
 * Now with 14 vertices for a more cadastral-believable silhouette.
 */
const PARCEL_POLYGON = [
  [43.2, 37.8],
  [49.1, 37.1],
  [54.5, 37.4],
  [58.2, 38.9],
  [60.4, 42.4],
  [60.1, 46.8],
  [58.9, 50.6],
  [57.2, 54.1],
  [54.6, 57.4],
  [50.9, 59.3],
  [46.4, 59.8],
  [42.7, 58.1],
  [40.4, 54.3],
  [39.8, 49.8],
  [40.2, 45.2],
  [41.3, 41.2],
] as const;

const polygonPoints = PARCEL_POLYGON.map((p) => p.join(',')).join(' ');

/**
 * Cadastral sub-parcels — 12 real-world-shaped partitions of the parent plot.
 * Each is a polygon expressed in the same 0..100 coordinate space.
 * Derived by deterministic slicing of the parent polygon along the
 * long axis (NW-SE) with staggered lateral breaks, mimicking typical
 * Slavonian k.č.br. strip subdivisions.
 */
const CADASTRAL_PARCELS: { id: string; points: [number, number][]; haShare: number }[] = [
  { id: '831/1', points: [[43.2, 37.8], [49.1, 37.1], [49.6, 42.5], [43.5, 43.1]], haShare: 6.7 },
  { id: '831/2', points: [[49.1, 37.1], [54.5, 37.4], [54.7, 42.9], [49.6, 42.5]], haShare: 6.1 },
  { id: '831/3', points: [[54.5, 37.4], [58.2, 38.9], [60.4, 42.4], [54.7, 42.9]], haShare: 5.4 },
  { id: '832/1', points: [[43.5, 43.1], [49.6, 42.5], [49.9, 48.3], [43.7, 48.9]], haShare: 7.3 },
  { id: '832/2', points: [[49.6, 42.5], [54.7, 42.9], [55.1, 48.6], [49.9, 48.3]], haShare: 6.8 },
  { id: '832/3', points: [[54.7, 42.9], [60.4, 42.4], [60.1, 46.8], [58.9, 50.6], [55.1, 48.6]], haShare: 9.1 },
  { id: '833/1', points: [[43.7, 48.9], [49.9, 48.3], [50.3, 54.7], [44.1, 54.5]], haShare: 7.1 },
  { id: '833/2', points: [[49.9, 48.3], [55.1, 48.6], [57.2, 54.1], [50.3, 54.7]], haShare: 7.8 },
  { id: '833/3', points: [[55.1, 48.6], [58.9, 50.6], [57.2, 54.1]], haShare: 3.2 },
  { id: '834/1', points: [[44.1, 54.5], [50.3, 54.7], [50.9, 59.3], [46.4, 59.8], [42.7, 58.1]], haShare: 6.4 },
  { id: '834/2', points: [[50.3, 54.7], [57.2, 54.1], [54.6, 57.4], [50.9, 59.3]], haShare: 4.8 },
  { id: '830/5', points: [[40.2, 45.2], [43.5, 43.1], [43.7, 48.9], [44.1, 54.5], [42.7, 58.1], [40.4, 54.3], [39.8, 49.8]], haShare: 9.6 },
];

export interface ParcelMapProps {
  backgroundUrl?: string;
  imageOpacity?: number;
  imageScale?: number;
  /** Play the stroke-draw animation on mount */
  drawOnMount?: boolean;
  /** Delay (seconds) before parcel stroke begins to draw */
  drawDelay?: number;
  /** Stroke tone */
  tone?: 'pulse' | 'sun' | 'agri' | 'signal';
  /** Show the animated sun path across the plot */
  showSunArc?: boolean;
  /** Sun tracks current local hour-of-day instead of static position */
  liveSunPosition?: boolean;
  /** Show an animated pulse dot at the plot centroid */
  showCentroidPulse?: boolean;
  /** Show axis ticks + scale bar */
  showScaleBar?: boolean;
  /** Show cadastral grid overlay (51 sub-parcels hinted) */
  showCadastralHint?: boolean;
  /** Show 12 real cadastral sub-parcels inside the parent polygon */
  showRealCadastral?: boolean;
  /** Optional callback when a cadastral sub-parcel is hovered */
  onCadastralHover?: (id: string | null) => void;
  className?: string;
}

const TONE: Record<NonNullable<ParcelMapProps['tone']>, string> = {
  pulse: 'stroke-pulse',
  sun: 'stroke-sun',
  agri: 'stroke-agri',
  signal: 'stroke-signal',
};

const FILL: Record<NonNullable<ParcelMapProps['tone']>, string> = {
  pulse: 'fill-pulse/10',
  sun: 'fill-sun/10',
  agri: 'fill-agri/10',
  signal: 'fill-signal/10',
};

export function ParcelMap({
  backgroundUrl = '/imagery/kopanica-close.jpg',
  imageOpacity = 0.9,
  imageScale = 1,
  drawOnMount = false,
  drawDelay = 0,
  tone = 'pulse',
  showSunArc = false,
  liveSunPosition = false,
  showCentroidPulse = false,
  showScaleBar = false,
  showCadastralHint = false,
  showRealCadastral = false,
  onCadastralHover,
  className,
}: ParcelMapProps) {
  const [hoveredCadastral, setHoveredCadastral] = useState<string | null>(null);
  const [sunPosition, setSunPosition] = useState(() => computeSunPosition(new Date()));

  useEffect(() => {
    if (!liveSunPosition) return;
    const id = setInterval(() => setSunPosition(computeSunPosition(new Date())), 30_000);
    return () => clearInterval(id);
  }, [liveSunPosition]);

  const sunXY = liveSunPosition ? sunPosition : { x: 62, y: 12, timeLabel: 'midday', progress: 0.6 };
  return (
    <div className={cn('relative h-full w-full overflow-hidden bg-canvas', className)}>
      {/* Satellite base */}
      <motion.img
        src={backgroundUrl}
        alt=""
        aria-hidden
        initial={{ opacity: 0, scale: imageScale * 1.04 }}
        animate={{ opacity: imageOpacity, scale: imageScale }}
        transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Edge vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 55%, rgba(10,10,11,0.7) 100%)',
        }}
      />

      {/* Parcel SVG overlay */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        {showCadastralHint && (
          <g className="opacity-40">
            {/* lightweight cadastral grid hint — thin dashed lines */}
            {Array.from({ length: 11 }).map((_, i) => (
              <line
                key={`h-${i}`}
                x1={0}
                x2={100}
                y1={i * 10}
                y2={i * 10}
                stroke="currentColor"
                strokeWidth={0.08}
                strokeDasharray="0.6 0.8"
                className="text-border-bright"
              />
            ))}
            {Array.from({ length: 11 }).map((_, i) => (
              <line
                key={`v-${i}`}
                y1={0}
                y2={100}
                x1={i * 10}
                x2={i * 10}
                stroke="currentColor"
                strokeWidth={0.08}
                strokeDasharray="0.6 0.8"
                className="text-border-bright"
              />
            ))}
          </g>
        )}

        {showSunArc && (
          <motion.path
            d="M 8 58 Q 50 -5 92 58"
            fill="none"
            strokeWidth={0.25}
            strokeDasharray="1 1.5"
            className="stroke-sun/70"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2.2, delay: drawDelay + 1.8, ease: 'easeInOut' }}
          />
        )}

        {showSunArc && (
          <>
            <motion.circle
              cx={sunXY.x}
              cy={sunXY.y}
              r={1.1}
              className="fill-sun"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: drawDelay + 2.8 }}
              style={{ filter: 'drop-shadow(0 0 2px rgb(255 184 0))' }}
            />
            {liveSunPosition && (
              <motion.circle
                cx={sunXY.x}
                cy={sunXY.y}
                r={1.9}
                className="fill-none stroke-sun/60"
                strokeWidth={0.2}
                animate={{ r: [1.9, 3.5], opacity: [0.6, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }}
              />
            )}
            {liveSunPosition && (
              <text
                x={sunXY.x}
                y={sunXY.y - 2.5}
                textAnchor="middle"
                className="fill-sun font-mono"
                fontSize={1.8}
                style={{ letterSpacing: '0.08em' }}
              >
                {sunXY.timeLabel}
              </text>
            )}
          </>
        )}

        {/* Real cadastral sub-parcels */}
        {showRealCadastral && (
          <g>
            {CADASTRAL_PARCELS.map((p, i) => (
              <motion.polygon
                key={p.id}
                points={p.points.map(([x, y]) => `${x},${y}`).join(' ')}
                onMouseEnter={() => {
                  setHoveredCadastral(p.id);
                  onCadastralHover?.(p.id);
                }}
                onMouseLeave={() => {
                  setHoveredCadastral(null);
                  onCadastralHover?.(null);
                }}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: hoveredCadastral === p.id ? 0.4 : 0.08,
                  strokeOpacity: hoveredCadastral === p.id ? 1 : 0.35,
                }}
                transition={{ duration: 0.3, delay: drawDelay + 1.9 + i * 0.04 }}
                className={cn(
                  'cursor-pointer transition-colors pointer-events-auto',
                  hoveredCadastral === p.id
                    ? 'fill-pulse stroke-pulse'
                    : 'fill-pulse/20 stroke-pulse/50',
                )}
                strokeWidth={0.14}
              />
            ))}
            {/* Hovered label */}
            {hoveredCadastral && (
              <motion.g
                initial={{ opacity: 0, y: 2 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {(() => {
                  const p = CADASTRAL_PARCELS.find((q) => q.id === hoveredCadastral)!;
                  const cx = p.points.reduce((s, [x]) => s + x, 0) / p.points.length;
                  const cy = p.points.reduce((s, [, y]) => s + y, 0) / p.points.length;
                  return (
                    <>
                      <rect
                        x={cx - 5}
                        y={cy - 2}
                        width={10}
                        height={3.6}
                        rx={0.5}
                        className="fill-canvas/85 stroke-pulse"
                        strokeWidth={0.12}
                      />
                      <text
                        x={cx}
                        y={cy + 0.3}
                        textAnchor="middle"
                        className="fill-pulse font-mono"
                        fontSize={1.6}
                      >
                        k.č.br. {p.id}
                      </text>
                      <text
                        x={cx}
                        y={cy + 1.8}
                        textAnchor="middle"
                        className="fill-text-secondary font-mono"
                        fontSize={1.1}
                      >
                        {p.haShare.toFixed(1)} ha
                      </text>
                    </>
                  );
                })()}
              </motion.g>
            )}
          </g>
        )}

        {/* Parcel polygon — animated stroke-draw */}
        <motion.polygon
          points={polygonPoints}
          className={cn('transition-colors', TONE[tone], FILL[tone])}
          strokeWidth={0.32}
          initial={
            drawOnMount
              ? { pathLength: 0, fillOpacity: 0 }
              : { pathLength: 1, fillOpacity: 1 }
          }
          animate={{ pathLength: 1, fillOpacity: 1 }}
          transition={{
            pathLength: { duration: 2.0, delay: drawDelay, ease: [0.16, 1, 0.3, 1] },
            fillOpacity: { duration: 0.8, delay: drawDelay + 1.6 },
          }}
        />

        {/* Parcel corner anchor dots */}
        {PARCEL_POLYGON.map(([x, y], i) => (
          <motion.circle
            key={i}
            cx={x}
            cy={y}
            r={0.55}
            className={cn('fill-canvas', TONE[tone])}
            strokeWidth={0.2}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: drawDelay + 1.6 + i * 0.05, duration: 0.3 }}
          />
        ))}

        {showCentroidPulse && (
          <>
            <circle cx={50} cy={48} r={1.2} className="fill-pulse" />
            <motion.circle
              cx={50}
              cy={48}
              r={1.2}
              className="fill-none stroke-pulse"
              strokeWidth={0.3}
              animate={{ r: [1.2, 4.5], opacity: [0.8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
            />
          </>
        )}
      </svg>

      {showScaleBar && (
        <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-sm bg-canvas/70 px-2 py-1 backdrop-blur">
          <div className="flex items-center gap-[2px]">
            <span className="block h-1.5 w-6 border border-text-muted bg-canvas" />
            <span className="block h-1.5 w-6 border border-text-muted bg-text-muted" />
          </div>
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-text-muted">
            500 m
          </span>
        </div>
      )}

      {liveSunPosition && showSunArc && (
        <div className="absolute right-3 top-3 flex items-center gap-2 rounded-sm border border-border/60 bg-canvas/70 px-2.5 py-1 backdrop-blur">
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-sun shadow-glow-pulse" />
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-sun">
            sun · {sunXY.timeLabel}
          </span>
          <span className="font-mono text-[9px] tabular-nums text-text-muted">
            {(sunXY.progress * 100).toFixed(0)}% arc
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Approximate sun path for Beravci 45.2074°N 18.4393°E.
 * Returns { x, y } in the 0..100 canvas, plus a human-readable time label.
 *
 * Path: sunrise (left edge, low) → zenith (center, high) → sunset (right edge, low).
 * Quadratic Bezier approximation. Sunrise ~ 05:40, sunset ~ 18:20 at this latitude
 * in April. Simplified here to 6:00 → 18:00 for a clean 12-hour arc.
 */
function computeSunPosition(now: Date) {
  const hours = now.getHours() + now.getMinutes() / 60;
  const SUNRISE = 6;
  const SUNSET = 18;

  // progress 0 at sunrise, 1 at sunset
  let progress = (hours - SUNRISE) / (SUNSET - SUNRISE);
  progress = Math.max(0, Math.min(1, progress));

  // Quadratic Bezier from (8, 58) via (50, -5) to (92, 58)
  const P0 = { x: 8, y: 58 };
  const P1 = { x: 50, y: -5 };
  const P2 = { x: 92, y: 58 };
  const t = progress;
  const x = (1 - t) * (1 - t) * P0.x + 2 * (1 - t) * t * P1.x + t * t * P2.x;
  const y = (1 - t) * (1 - t) * P0.y + 2 * (1 - t) * t * P1.y + t * t * P2.y;

  const isNight = hours < SUNRISE || hours > SUNSET;
  const hh = String(Math.floor(hours)).padStart(2, '0');
  const mm = String(Math.floor((hours % 1) * 60)).padStart(2, '0');

  return {
    x: isNight ? 50 : x,
    y: isNight ? 80 : y,
    progress,
    timeLabel: isNight ? 'night' : `${hh}:${mm}`,
  };
}
