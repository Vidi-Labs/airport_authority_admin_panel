import type { Variants } from 'framer-motion';

// --- Core Curves (Nakhlah Motion System) ---
export const CURVES = {
  easeOutSmooth: [0.16, 1, 0.3, 1] as const,
  easeInOut: [0.77, 0, 0.175, 1] as const,
  liquid: [0.18, 1.42, 0.22, 1] as const,       // overshoot spring (bouncy)
  playful: [0.16, 1.36, 0.24, 1] as const,       // overshoot spring (bouncy)
  macosSpring: [0.16, 1.28, 0.24, 1] as const,   // macOS-style spring
};

// --- Duration Tokens (slower, cinematic) ---
export const DURATION = {
  fast: 0.22,
  normal: 0.7,
  page: 1.4,
  stagger: 0.45,
  fadeSlow: 1.8,
};

// --- Page Entrance (Signature "Pop-In" from bouncy-animation skill) ---
// Fade + Slide + Scale overshoot (3 simultaneous animations)
export const pageEnter: Variants = {
  initial: { opacity: 0, y: '4%', scale: 0.97 },
  animate: {
    opacity: 1,
    y: 0,
    scale: [0.97, 1.045, 0.985, 1],  // overshoot → settle → rest
    transition: {
      duration: DURATION.page,
      ease: CURVES.easeOutSmooth,
      opacity: { duration: DURATION.fadeSlow, ease: 'linear' },
      y: { duration: DURATION.page, ease: CURVES.easeOutSmooth },
      scale: {
        duration: DURATION.page,
        times: [0, 0.5, 0.75, 1],
        ease: CURVES.easeOutSmooth,
      },
    },
  },
  exit: {
    opacity: 0,
    scale: 0.975,
    transition: { duration: DURATION.normal * 0.6, ease: CURVES.easeOutSmooth },
  },
};

// --- Stagger Container ---
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: DURATION.stagger,
      delayChildren: 0.15,
    },
  },
};

// --- Stagger Item (bouncy entrance per item) ---
export const staggerItem: Variants = {
  initial: { opacity: 0, y: 24, scale: 0.97 },
  animate: {
    opacity: 1,
    y: 0,
    scale: [0.97, 1.035, 0.99, 1],  // subtle overshoot
    transition: {
      duration: DURATION.page,
      ease: CURVES.easeOutSmooth,
      opacity: { duration: DURATION.fadeSlow, ease: 'linear' },
      scale: {
        duration: DURATION.page,
        times: [0, 0.45, 0.7, 1],
        ease: CURVES.easeOutSmooth,
      },
    },
  },
};

// --- Pressable (tap feedback with liquid bouncy curve) ---
export const pressable = {
  whileTap: {
    scale: 0.96,
    transition: { duration: DURATION.fast, ease: CURVES.liquid },
  },
};

// --- Card Hover glow ---
export const cardHoverGlow = (color: string) => ({
  boxShadow: `0 10px 40px ${color}33, 0 0 0 1px ${color}22`,
});

// --- Ambient Float (decorative, one per element max) ---
export const ambientFloat: Variants = {
  animate: {
    y: [-7, 7, -7],
    transition: {
      duration: 3.2,
      ease: 'easeInOut',
      repeat: Infinity,
    },
  },
};

// --- Ambient Pulse (decorative) ---
export const ambientPulse: Variants = {
  animate: {
    scale: [0.96, 1.04, 0.96],
    transition: {
      duration: 1.8,
      ease: 'easeInOut',
      repeat: Infinity,
    },
  },
};

// --- Route / Page Transitions (bouncy-animation §5) ---
// Incoming: slide from right + scale overshoot + fade
// Outgoing: scale down + fade
export const routeTransition: Variants = {
  initial: { opacity: 0, x: '3.5%', y: '1.2%', scale: 0.97 },
  animate: {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.28,
      ease: CURVES.easeOutSmooth,
      opacity: { duration: 0.18, ease: 'linear' },
    },
  },
  exit: {
    opacity: 0,
    scale: 0.99,
    transition: { duration: 0.12, ease: CURVES.easeOutSmooth },
  },
};

// --- Sidebar animation ---
export const sidebarExpand: Variants = {
  collapsed: { width: 72 },
  expanded: {
    width: 260,
    transition: { duration: DURATION.normal, ease: CURVES.easeOutSmooth },
  },
};

export const sidebarItemHover = {
  whileHover: {
    x: 4,
    transition: { duration: DURATION.fast, ease: CURVES.easeOutSmooth },
  },
  whileTap: {
    scale: 0.96,
    transition: { duration: DURATION.fast, ease: CURVES.liquid },
  },
};

// --- Reduced motion support ---
export const reducedMotion = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.01 } },
  exit: { opacity: 0, transition: { duration: 0.01 } },
};
