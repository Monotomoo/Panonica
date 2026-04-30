/**
 * Time-of-day atmospheric tone.
 * Computes a subtle color temperature + intensity based on local clock.
 *
 * Returns CSS-ready values for two variables:
 *   --tone-warmth  · 0..1 (cool/night → warm/sunset)
 *   --tone-alpha   · 0..0.12 (overlay opacity)
 *   --tone-hue     · degrees 0..360 (pinned via warmth)
 *
 * The values are applied by App.tsx as a fixed-position overlay gradient.
 * Updates every 3 minutes — smooth enough to notice without burning CPU.
 *
 * Palette crafted for Kopanica-Beravci 45.13°N:
 *   00:00 · night · deep cool blue (210°, alpha 0.10)
 *   06:00 · dawn · cyan-pink hint (195°, alpha 0.08)
 *   09:00 · morning · warm yellow tint (55°, alpha 0.04)
 *   12:00 · midday · ~neutral (30°, alpha 0.015)
 *   15:00 · afternoon · gold ramp (38°, alpha 0.04)
 *   18:00 · sunset · warm orange-pink PEAK (18°, alpha 0.10)
 *   21:00 · dusk · muting warm (30°, alpha 0.07)
 *   23:00 · approaching night · cool blue (210°, alpha 0.09)
 */

export interface ToneState {
  warmth: number; // 0 (cool) → 1 (warm)
  alpha: number;  // 0..0.12 overlay intensity
  hue: number;    // degrees
  label: string;  // human readable
}

const STOPS: { h: number; warmth: number; alpha: number; hue: number; label: string }[] = [
  { h: 0,  warmth: 0.05, alpha: 0.100, hue: 210, label: 'night' },
  { h: 3,  warmth: 0.05, alpha: 0.095, hue: 214, label: 'late night' },
  { h: 5,  warmth: 0.12, alpha: 0.080, hue: 198, label: 'before dawn' },
  { h: 6,  warmth: 0.20, alpha: 0.075, hue: 195, label: 'dawn' },
  { h: 7,  warmth: 0.35, alpha: 0.060, hue: 42,  label: 'early morning' },
  { h: 9,  warmth: 0.55, alpha: 0.040, hue: 55,  label: 'morning' },
  { h: 12, warmth: 0.50, alpha: 0.015, hue: 30,  label: 'midday' },
  { h: 14, warmth: 0.60, alpha: 0.030, hue: 35,  label: 'afternoon' },
  { h: 15, warmth: 0.70, alpha: 0.045, hue: 38,  label: 'afternoon' },
  { h: 17, warmth: 0.85, alpha: 0.075, hue: 22,  label: 'golden hour' },
  { h: 18, warmth: 0.95, alpha: 0.100, hue: 18,  label: 'sunset' },
  { h: 19, warmth: 0.85, alpha: 0.085, hue: 22,  label: 'after sunset' },
  { h: 21, warmth: 0.50, alpha: 0.070, hue: 30,  label: 'dusk' },
  { h: 23, warmth: 0.15, alpha: 0.090, hue: 210, label: 'night' },
  { h: 24, warmth: 0.05, alpha: 0.100, hue: 210, label: 'night' },
];

export function toneForHour(hours: number): ToneState {
  // hours accepts fractional (e.g. 17.5 for 17:30)
  const clamped = Math.max(0, Math.min(24, hours));
  let before = STOPS[0];
  let after = STOPS[STOPS.length - 1];
  for (let i = 0; i < STOPS.length - 1; i++) {
    if (STOPS[i].h <= clamped && STOPS[i + 1].h >= clamped) {
      before = STOPS[i];
      after = STOPS[i + 1];
      break;
    }
  }
  const t = (clamped - before.h) / Math.max(after.h - before.h, 0.001);
  const warmth = before.warmth + (after.warmth - before.warmth) * t;
  const alpha = before.alpha + (after.alpha - before.alpha) * t;
  // Hue interpolation — special-case the 210°↔30° wrap so dawn/dusk don't zigzag through pink
  let hue: number;
  if (Math.abs(after.hue - before.hue) > 180) {
    // Wrap through 0/360 — shorter path
    const a = before.hue < 180 ? before.hue + 360 : before.hue;
    const b = after.hue < 180 ? after.hue + 360 : after.hue;
    hue = (a + (b - a) * t) % 360;
  } else {
    hue = before.hue + (after.hue - before.hue) * t;
  }
  const label = t < 0.5 ? before.label : after.label;
  return { warmth, alpha, hue, label };
}

export function toneNow(date = new Date()): ToneState {
  return toneForHour(date.getHours() + date.getMinutes() / 60);
}
