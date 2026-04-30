import { useMemo } from 'react';
import { cn } from '@paladian/ui';
import type { ConfigState } from '@/store/configStore';
import { configHash } from '@/store/configStore';

/**
 * Deal DNA glyph.
 *
 * A deterministic generative SVG signature unique to each configuration.
 * Same ConfigState in → same glyph out. Meant as an ownable visual
 * fingerprint for Ivan's specific deal — he sees it on the Thesis cover,
 * on Scenarios cards, on the Configurator sidebar. It morphs as he
 * tunes the sliders — a constant, playful visual rewriting.
 *
 * Encodings:
 *   capacityMW       → main disc radius + petal count
 *   tracking         → inner rotor pattern (fixed · 1-axis · 2-axis)
 *   battery          → outer perimeter tick density
 *   underPanel       → hue rotation (sheep=green / soy=sun / herbs=pulse / none=signal)
 *   scenario preset  → base color ramp
 *   panelId          → secondary accent stroke
 *   dcAcRatio        → rotational offset
 *   gcr              → inner mesh density
 *   rowSpacing       → petal separation
 *   fenceHeightM     → outer halo radius
 */

interface DnaGlyphProps {
  config: ConfigState;
  size?: number;
  paper?: boolean; // render dark-on-light for PDF
  showLabel?: boolean;
  className?: string;
}

export function DnaGlyph({ config, size = 160, paper = false, showLabel = false, className }: DnaGlyphProps) {
  const hash = useMemo(() => configHash(config), [config]);
  const viz = useMemo(() => computeGlyph(config, hash), [config, hash]);

  const stroke = paper ? '#0f0f10' : `hsl(${viz.hue}, 70%, 62%)`;
  const strokeMuted = paper ? 'rgba(15, 15, 16, 0.35)' : 'rgba(255, 255, 255, 0.15)';
  const fill = paper ? 'rgba(15, 15, 16, 0.08)' : `hsla(${viz.hue}, 65%, 58%, 0.22)`;
  const accentStroke = paper ? '#7C5CFF' : `hsl(${(viz.hue + 120) % 360}, 75%, 66%)`;

  return (
    <div className={cn('inline-flex flex-col items-center gap-1', className)}>
      <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={`Deal DNA · ${hash}`}>
        {/* Outer halo */}
        <circle cx={50} cy={50} r={viz.haloR} fill="none" stroke={strokeMuted} strokeWidth={0.3} strokeDasharray="0.6 1.2" />

        {/* Battery ticks — outer perimeter */}
        {viz.batteryTicks.map((angle, i) => {
          const x1 = 50 + Math.cos(angle) * (viz.haloR - 3);
          const y1 = 50 + Math.sin(angle) * (viz.haloR - 3);
          const x2 = 50 + Math.cos(angle) * (viz.haloR - 1);
          const y2 = 50 + Math.sin(angle) * (viz.haloR - 1);
          return <line key={`bt-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={accentStroke} strokeWidth={0.4} opacity={0.7} />;
        })}

        {/* Petals — capacity ring */}
        {viz.petals.map((petal, i) => {
          const cx = 50 + Math.cos(petal.angle) * petal.dist;
          const cy = 50 + Math.sin(petal.angle) * petal.dist;
          return (
            <circle
              key={`p-${i}`}
              cx={cx}
              cy={cy}
              r={petal.r}
              fill={i % 3 === 0 ? fill : 'none'}
              stroke={stroke}
              strokeWidth={0.35}
              opacity={0.85}
            />
          );
        })}

        {/* Rotor — tracking pattern */}
        {viz.tracking === 'fixed' && (
          <circle cx={50} cy={50} r={viz.rotorSize} fill="none" stroke={stroke} strokeWidth={0.6} />
        )}
        {viz.tracking === '1-axis' && (
          <g transform={`rotate(${viz.rotorRot} 50 50)`}>
            <rect x={50 - viz.rotorSize} y={49.3} width={viz.rotorSize * 2} height={1.4} fill={stroke} opacity={0.65} rx={0.7} />
            <rect x={50 - viz.rotorSize} y={47.3} width={viz.rotorSize * 2} height={0.4} fill={stroke} opacity={0.35} />
            <rect x={50 - viz.rotorSize} y={52.3} width={viz.rotorSize * 2} height={0.4} fill={stroke} opacity={0.35} />
          </g>
        )}
        {viz.tracking === '2-axis' && (
          <g transform={`rotate(${viz.rotorRot} 50 50)`}>
            <polygon points={`50,${50 - viz.rotorSize} ${50 + viz.rotorSize},50 50,${50 + viz.rotorSize} ${50 - viz.rotorSize},50`} fill={fill} stroke={stroke} strokeWidth={0.5} />
          </g>
        )}

        {/* Inner mesh — GCR density */}
        {viz.mesh.map((line, i) => (
          <line
            key={`m-${i}`}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke={accentStroke}
            strokeWidth={0.18}
            opacity={0.28}
          />
        ))}

        {/* Central pulse */}
        <circle cx={50} cy={50} r={viz.coreR} fill={stroke} opacity={0.9} />
        <circle cx={50} cy={50} r={viz.coreR + 1} fill="none" stroke={accentStroke} strokeWidth={0.3} opacity={0.5} />

        {/* Scenario sigil — top glyph */}
        <g transform="translate(50 12)" opacity={0.85}>
          {viz.scenarioSigil === 'pure' && <polygon points="0,-5 4,4 -4,4" fill={stroke} />}
          {viz.scenarioSigil === 'sheep' && <circle r={3.5} fill="none" stroke={stroke} strokeWidth={0.7} />}
          {viz.scenarioSigil === 'crops' && <rect x={-3.5} y={-3.5} width={7} height={7} fill="none" stroke={stroke} strokeWidth={0.7} transform="rotate(45)" />}
        </g>

        {/* Hash tag — bottom */}
        <text
          x={50}
          y={92}
          textAnchor="middle"
          fontFamily="JetBrains Mono, monospace"
          fontSize={3.4}
          letterSpacing="0.6"
          fill={paper ? '#0f0f10' : 'rgba(255, 255, 255, 0.55)'}
        >
          #{hash.slice(0, 6)}
        </text>
      </svg>

      {showLabel && (
        <span className={cn('font-mono text-[9px] uppercase tracking-[0.22em]', paper ? 'text-black/60' : 'text-text-muted')}>
          deal DNA · {config.capacityMW}MW · {config.tracking}
        </span>
      )}
    </div>
  );
}

/* ------------------------------- glyph math ----------------------------- */

interface GlyphViz {
  hue: number;
  haloR: number;
  coreR: number;
  rotorSize: number;
  rotorRot: number;
  tracking: ConfigState['tracking'];
  scenarioSigil: 'pure' | 'sheep' | 'crops';
  petals: { angle: number; dist: number; r: number }[];
  batteryTicks: number[];
  mesh: { x1: number; y1: number; x2: number; y2: number }[];
}

function computeGlyph(config: ConfigState, hash: string): GlyphViz {
  const seed = parseInt(hash, 16);
  const rng = mulberry32(seed);

  // Hue from under-panel + scenario
  const baseHueByUnder: Record<ConfigState['underPanel'], number> = {
    none: 200, // signal blue
    sheep: 142, // agri green
    soy: 42, // sun gold
    herbs: 270, // pulse purple
  };
  const hue = (baseHueByUnder[config.underPanel] + (config.dcAcRatio - 1.25) * 40) % 360;

  // Capacity → petal count + core radius
  const petalCount = Math.max(6, Math.round(config.capacityMW * 0.6));
  const coreR = Math.max(3, Math.min(8, config.capacityMW * 0.12));
  const rotorSize = 14 + (config.gcr - 0.38) * 20;

  // Fence height → halo radius
  const haloR = 38 + (config.fenceHeightM - 2.4) * 3;

  // Row spacing → petal distance
  const petalDist = 22 + (config.rowSpacing - 8.5) * 0.8;
  const petalRadius = 1.0 + rng() * 0.6 + (config.capacityMW / 60) * 0.8;

  // Petals — ring of seeded jitter
  const petalJitter = config.panelId.charCodeAt(0) % 7;
  const petals = Array.from({ length: petalCount }, (_, i) => {
    const angle = (i / petalCount) * Math.PI * 2 + (petalJitter * 0.1);
    const distJitter = (rng() - 0.5) * 2;
    return {
      angle,
      dist: petalDist + distJitter,
      r: petalRadius + rng() * 0.3,
    };
  });

  // Battery ticks
  const tickCount = Math.max(0, Math.floor(config.battery / 2));
  const batteryTicks = Array.from({ length: tickCount }, (_, i) => (i / tickCount) * Math.PI * 2);

  // Inner mesh — GCR density drives line count
  const meshLines = Math.floor(config.gcr * 24);
  const mesh = Array.from({ length: meshLines }, () => {
    const a1 = rng() * Math.PI * 2;
    const a2 = rng() * Math.PI * 2;
    const r1 = 4 + rng() * 6;
    const r2 = 4 + rng() * 6;
    return {
      x1: 50 + Math.cos(a1) * r1,
      y1: 50 + Math.sin(a1) * r1,
      x2: 50 + Math.cos(a2) * r2,
      y2: 50 + Math.sin(a2) * r2,
    };
  });

  const rotorRot = (config.dcAcRatio - 1.0) * 90 + (config.gcr * 180);

  const scenarioSigil: GlyphViz['scenarioSigil'] =
    config.activeScenario === 'pure-pv' ? 'pure' : config.activeScenario === 'agri-sheep' ? 'sheep' : 'crops';

  return {
    hue,
    haloR,
    coreR,
    rotorSize,
    rotorRot,
    tracking: config.tracking,
    scenarioSigil,
    petals,
    batteryTicks,
    mesh,
  };
}

function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
