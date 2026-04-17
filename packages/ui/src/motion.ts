import type { Transition, Variants } from 'framer-motion';
import { duration, easing, stagger } from './tokens';

/* Re-export the raw tokens for callers that need the primitives */
export { duration, easing, stagger };

/* --- Standard transitions ------------------------------------------------ */

export const transitionFast: Transition = {
  duration: duration.fast,
  ease: easing.outQuart,
};

export const transitionBase: Transition = {
  duration: duration.base,
  ease: easing.outExpo,
};

export const transitionDeliberate: Transition = {
  duration: duration.deliberate,
  ease: easing.outExpo,
};

export const transitionCinematic: Transition = {
  duration: duration.cinematic,
  ease: easing.outExpo,
};

/* --- Variant presets ----------------------------------------------------- */

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: transitionBase },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transitionBase },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0, transition: transitionBase },
};

export const staggerContainer = (
  staggerChildren: number = stagger.default,
  delayChildren: number = 0,
): Variants => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren,
      delayChildren,
    },
  },
});

/* --- Page transition (used in AnimatePresence) --------------------------- */

export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: transitionBase },
  exit: { opacity: 0, y: -8, transition: transitionFast },
};
