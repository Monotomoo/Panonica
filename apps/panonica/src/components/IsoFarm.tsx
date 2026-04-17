import { motion } from 'framer-motion';
import { cn } from '@paladian/ui';

export interface IsoFarmProps {
  /** Rows of solar panels (dynamic from capacity + spacing) */
  rows: number;
  /** Columns of solar panels per row */
  cols: number;
  /** Panel tilt angle 0–45 (visual only) */
  tracking: 'fixed' | '1-axis' | '2-axis';
  /** What's under the panels */
  underPanel: 'none' | 'sheep' | 'soy' | 'herbs';
  /** Panel row spacing in meters — controls vertical gap */
  rowSpacing: number;
  /** Panel height — visual only */
  panelHeight: number;
  className?: string;
}

/**
 * Isometric farm visualisation. Not photoreal — a clean, diagrammatic
 * rendering that responds to the configurator sliders.
 */
export function IsoFarm({
  rows,
  cols,
  tracking,
  underPanel,
  rowSpacing,
  panelHeight,
  className,
}: IsoFarmProps) {
  // Clamp to keep SVG coordinates inside a reasonable frame
  const R = Math.min(Math.max(rows, 3), 7);
  const C = Math.min(Math.max(cols, 4), 10);

  // Base geometry (isometric projection)
  const tileW = 68;
  const tileH = 34;
  const originX = 360;
  const originY = 70;

  const tilt = tracking === '2-axis' ? 28 : tracking === '1-axis' ? 20 : 14;
  const heightScale = Math.min(Math.max(panelHeight / 3, 0.7), 1.4);
  const spacingScale = Math.min(Math.max(rowSpacing / 8, 0.8), 1.2);

  const panelW = 44;
  const panelHFactor = 14 * heightScale;
  const rowSpan = tileH * spacingScale;

  const panels: { x: number; y: number; r: number; c: number }[] = [];
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      const baseX = originX + (c - r) * (tileW / 2);
      const baseY = originY + (c + r) * (rowSpan / 2);
      panels.push({ x: baseX, y: baseY, r, c });
    }
  }

  return (
    <svg
      viewBox="0 0 720 420"
      className={cn('w-full h-full', className)}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Ground plane */}
      <defs>
        <linearGradient id="groundGradient" x1="0" y1="0" x2="0" y2="1">
          <stop
            offset="0%"
            stopColor={underPanel === 'soy' || underPanel === 'herbs' ? '#2a3a1a' : '#1a1f18'}
          />
          <stop offset="100%" stopColor="#0f1212" />
        </linearGradient>
        <pattern
          id="grassHatch"
          patternUnits="userSpaceOnUse"
          width="10"
          height="10"
          patternTransform="rotate(30)"
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="10"
            stroke="rgb(74 222 128 / 0.18)"
            strokeWidth="1"
          />
        </pattern>
      </defs>

      <polygon
        points={`
          ${originX - tileW * 0.3},${originY - tileH * 0.4}
          ${originX + (C - 0.5) * (tileW / 2) + tileW * 0.3},${originY + (C + 0.2) * (rowSpan / 2)}
          ${originX + (C - R + 0.3) * (tileW / 2)},${originY + (C + R - 0.3) * (rowSpan / 2) + tileH * 0.5}
          ${originX - (R + 0.3) * (tileW / 2)},${originY + (R + 0.2) * (rowSpan / 2)}
        `}
        fill="url(#groundGradient)"
        stroke="rgb(42 42 48)"
        strokeWidth={0.6}
      />

      {/* Ground hatch (hints at crop use) */}
      {(underPanel === 'soy' || underPanel === 'herbs') && (
        <polygon
          points={`
            ${originX - tileW * 0.3},${originY - tileH * 0.4}
            ${originX + (C - 0.5) * (tileW / 2) + tileW * 0.3},${originY + (C + 0.2) * (rowSpan / 2)}
            ${originX + (C - R + 0.3) * (tileW / 2)},${originY + (C + R - 0.3) * (rowSpan / 2) + tileH * 0.5}
            ${originX - (R + 0.3) * (tileW / 2)},${originY + (R + 0.2) * (rowSpan / 2)}
          `}
          fill="url(#grassHatch)"
        />
      )}

      {/* Sun angle indicator */}
      <motion.g
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        <circle cx={90} cy={60} r={10} className="fill-sun" />
        <circle
          cx={90}
          cy={60}
          r={18}
          className="fill-none stroke-sun/40"
          strokeWidth={0.8}
          strokeDasharray="3 3"
        />
        <line
          x1={90}
          y1={60}
          x2={200}
          y2={150}
          className="stroke-sun/50"
          strokeWidth={0.6}
          strokeDasharray="4 4"
        />
      </motion.g>

      {/* Panels */}
      {panels.map((p, i) => {
        const key = `${p.r}-${p.c}`;
        return (
          <motion.g
            key={key}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.35,
              delay: i * 0.008,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {/* Pole */}
            <line
              x1={p.x}
              y1={p.y + panelHFactor}
              x2={p.x}
              y2={p.y + panelHFactor + 18 * heightScale}
              className="stroke-text-muted"
              strokeWidth={1.2}
            />
            {/* Panel top plane (tilted) */}
            <polygon
              points={`
                ${p.x - panelW / 2},${p.y + panelHFactor - tilt * 0.5}
                ${p.x + panelW / 2},${p.y + panelHFactor + tilt * 0.4}
                ${p.x + panelW / 2 - 6},${p.y + panelHFactor + tilt * 0.4 + 6}
                ${p.x - panelW / 2 - 6},${p.y + panelHFactor - tilt * 0.5 + 6}
              `}
              fill="rgb(35 42 90)"
              stroke="rgb(124 92 255)"
              strokeWidth={0.7}
            />
            {/* Panel face glow */}
            <polygon
              points={`
                ${p.x - panelW / 2 + 3},${p.y + panelHFactor - tilt * 0.5 + 2}
                ${p.x + panelW / 2 - 3},${p.y + panelHFactor + tilt * 0.4 + 1}
                ${p.x + panelW / 2 - 3},${p.y + panelHFactor + tilt * 0.4 + 2}
                ${p.x - panelW / 2 + 3},${p.y + panelHFactor - tilt * 0.5 + 3}
              `}
              fill="rgb(0 217 255 / 0.35)"
            />
          </motion.g>
        );
      })}

      {/* Under-panel icons */}
      {underPanel === 'sheep' &&
        Array.from({ length: 4 }).map((_, i) => {
          const cx = originX - 30 + i * 70;
          const cy = originY + 170 + (i % 2) * 30;
          return (
            <g key={`sheep-${i}`}>
              <ellipse cx={cx} cy={cy} rx={9} ry={6} className="fill-text-primary" />
              <circle cx={cx + 7} cy={cy - 2} r={3.5} className="fill-text-primary" />
              <line
                x1={cx - 5}
                y1={cy + 5}
                x2={cx - 5}
                y2={cy + 10}
                className="stroke-text-primary"
                strokeWidth={1}
              />
              <line
                x1={cx + 5}
                y1={cy + 5}
                x2={cx + 5}
                y2={cy + 10}
                className="stroke-text-primary"
                strokeWidth={1}
              />
            </g>
          );
        })}

      {(underPanel === 'soy' || underPanel === 'herbs') &&
        Array.from({ length: 20 }).map((_, i) => {
          const cx = originX - 120 + (i % 10) * 30;
          const cy = originY + 160 + Math.floor(i / 10) * 40;
          return (
            <g key={`crop-${i}`}>
              <path
                d={`M ${cx} ${cy} L ${cx - 3} ${cy - 5} M ${cx} ${cy} L ${cx + 3} ${cy - 5} M ${cx} ${cy} L ${cx} ${cy - 6}`}
                className="stroke-agri"
                strokeWidth={1}
                strokeLinecap="round"
              />
            </g>
          );
        })}

      {/* Footer labels */}
      <text x={360} y={395} textAnchor="middle" className="fill-text-muted font-mono" fontSize={9}>
        {R} ROWS × {C} COLS · {panels.length} PANELS · SPACING {rowSpacing.toFixed(1)}m · H{' '}
        {panelHeight.toFixed(1)}m · {tracking.toUpperCase()}
      </text>
    </svg>
  );
}
