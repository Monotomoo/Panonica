/**
 * Shared Tailwind preset for all Paladian prototypes.
 * Palette driven by CSS variables declared in packages/ui/src/fonts.css.
 * Each app extends this preset in its own tailwind.config.ts.
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: 'rgb(var(--canvas) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        'surface-raised': 'rgb(var(--surface-raised) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
        'border-bright': 'rgb(var(--border-bright) / <alpha-value>)',
        'text-primary': 'rgb(var(--text-primary) / <alpha-value>)',
        'text-secondary': 'rgb(var(--text-secondary) / <alpha-value>)',
        'text-muted': 'rgb(var(--text-muted) / <alpha-value>)',
        pulse: 'rgb(var(--pulse) / <alpha-value>)',
        spark: 'rgb(var(--spark) / <alpha-value>)',
        signal: 'rgb(var(--signal) / <alpha-value>)',
        sun: 'rgb(var(--sun) / <alpha-value>)',
        gold: 'rgb(var(--gold) / <alpha-value>)',
        agri: 'rgb(var(--agri) / <alpha-value>)',
      },
      fontFamily: {
        display: ['"Space Grotesk Variable"', '"Space Grotesk"', '"Inter Display"', 'system-ui', 'sans-serif'],
        'display-editorial': ['"Instrument Serif"', '"Fraunces"', 'Georgia', 'serif'],
        mono: ['"Monaspace Krypton Var"', '"JetBrains Mono Variable"', '"JetBrains Mono"', 'ui-monospace', 'monospace'],
        sans: ['"Inter Variable"', '"Inter"', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        tightest: '-0.04em',
        'tech-tight': '-0.025em',
        'display-loose': '0.15em',
      },
      boxShadow: {
        'glow-pulse': '0 0 24px -4px rgb(var(--pulse) / 0.45)',
        'glow-signal': '0 0 24px -4px rgb(var(--signal) / 0.4)',
        'glow-sun': '0 0 24px -4px rgb(var(--sun) / 0.45)',
        'glow-spark': '0 0 24px -4px rgb(var(--spark) / 0.4)',
      },
      keyframes: {
        'pulse-dot': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.35' },
        },
        'cursor-blink': {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        },
        'line-draw': {
          '0%': { strokeDashoffset: '100%' },
          '100%': { strokeDashoffset: '0%' },
        },
      },
      animation: {
        'pulse-dot': 'pulse-dot 2.4s ease-in-out infinite',
        'cursor-blink': 'cursor-blink 1s step-end infinite',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'out-quart': 'cubic-bezier(0.25, 1, 0.5, 1)',
      },
    },
  },
  plugins: [],
};
