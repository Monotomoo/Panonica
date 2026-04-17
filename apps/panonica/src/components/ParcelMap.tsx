import { motion } from 'framer-motion';
import { cn } from '@paladian/ui';

/**
 * Parcel outline — approximate polygon for the 80.3 ha Beravci plot
 * centered at 45.2074°N 18.4393°E. Values are percentages of the
 * beravci-close.png canvas (shot at zoom 14.5, 1280x960@2x).
 * The polygon is deliberately irregular to suggest cadastral reality.
 */
const PARCEL_POLYGON = [
  [44, 38],
  [57, 37],
  [60, 44],
  [59, 52],
  [55, 58],
  [47, 60],
  [42, 56],
  [40, 48],
] as const;

const polygonPoints = PARCEL_POLYGON.map((p) => p.join(',')).join(' ');

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
  /** Show an animated pulse dot at the plot centroid */
  showCentroidPulse?: boolean;
  /** Show axis ticks + scale bar */
  showScaleBar?: boolean;
  /** Show cadastral grid overlay (51 sub-parcels hinted) */
  showCadastralHint?: boolean;
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
  backgroundUrl = '/imagery/beravci-close.png',
  imageOpacity = 0.9,
  imageScale = 1,
  drawOnMount = false,
  drawDelay = 0,
  tone = 'pulse',
  showSunArc = false,
  showCentroidPulse = false,
  showScaleBar = false,
  showCadastralHint = false,
  className,
}: ParcelMapProps) {
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
          <motion.circle
            cx={62}
            cy={12}
            r={0.9}
            className="fill-sun"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.6, 1] }}
            transition={{ duration: 3, delay: drawDelay + 3, times: [0, 0.3, 0.6, 1] }}
            style={{ filter: 'drop-shadow(0 0 1.5px rgb(255 184 0))' }}
          />
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
    </div>
  );
}
