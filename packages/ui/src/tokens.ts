/**
 * Canonical design tokens for the Paladian prototype family.
 * The values here are the single source of truth — fonts.css mirrors them
 * as CSS variables, and tailwind.preset.cjs references those variables.
 */

export const colors = {
  canvas: '#0A0A0B',
  surface: '#111113',
  surfaceRaised: '#17171A',
  border: '#1F1F23',
  borderBright: '#2A2A30',
  textPrimary: '#FAFAFA',
  textSecondary: '#8A8A94',
  textMuted: '#52525B',

  pulse: '#7C5CFF',
  spark: '#FF3D71',
  signal: '#00D9FF',
  sun: '#FFB800',
  gold: '#FFB800',
  agri: '#4ADE80',
} as const;

export type ColorToken = keyof typeof colors;

export const fonts = {
  displayTech: '"Space Grotesk Variable", "Space Grotesk", "Inter Display", system-ui',
  displayEditorial: '"Instrument Serif", "Fraunces", Georgia, serif',
  mono: '"Monaspace Krypton Var", "JetBrains Mono Variable", "JetBrains Mono", ui-monospace',
  sans: '"Inter Variable", Inter, system-ui',
} as const;

export const easing = {
  outExpo: [0.16, 1, 0.3, 1] as [number, number, number, number],
  outQuart: [0.25, 1, 0.5, 1] as [number, number, number, number],
  inOutSine: [0.37, 0, 0.63, 1] as [number, number, number, number],
} as const;

export const duration = {
  fast: 0.2,
  base: 0.4,
  slow: 0.8,
  deliberate: 1.5,
  cinematic: 2.0,
} as const;

export const stagger = {
  tight: 0.04,
  default: 0.06,
  loose: 0.12,
} as const;
