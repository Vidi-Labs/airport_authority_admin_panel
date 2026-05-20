import type { Variants, Transition } from 'framer-motion';

// --- Core Curves (from bouncy-animation skill) ---
export const CURVES = {
  easeOutSmooth: [0.16, 1, 0.3, 1] as const,
  easeInOut: [0.77, 0, 0.175, 1] as const,
  liquid: [0.18, 1.42, 0.22, 1] as const,
  playful: [0.16, 1.36, 0.24, 1] as const,
  macosSpring: [0.16, 1.28, 0.24, 1] as const,
};

// --- Duration Tokens ---
export const DURATION = {
  fast: 0.15,
  normal: 0.46,
  page: 0.82,
  stagger: 0.155,
};

// --- Page Entrance (fade + slide + scale overshoot) ---
export const pageEnter: Variants = {
  initial: { opacity: 0, y: '3%', scale: 0.97 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: DURATION.page,
      ease: CURVES.easeOutSmooth,
      opacity: { duration: DURATION.page * 0.96, ease: 'linear' },
    },
  },
  exit: {
    opacity: 0,
    scale: 0.975,
    transition: { duration: DURATION.normal, ease: CURVES.easeOutSmooth },
  },
};

// --- Stagger Container ---
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: DURATION.stagger,
      delayChildren: 0.1,
    },
  },
};

// --- Stagger Item (for lists, cards) ---
export const staggerItem: Variants = {
  initial: { opacity: 0, y: 20, scale: 0.97 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: DURATION.page,
      ease: CURVES.easeOutSmooth,
    },
  },
};

// --- Pressable (tap feedback with liquid curve) ---
export const pressable = {
  whileTap: {
    scale: 0.96,
    transition: { duration: DURATION.fast, ease: CURVES.liquid },
  },
};

// --- Card Hover (zoom-out with 1s delay - handled by ZoomCard component) ---
export const cardHoverGlow = (color: string) => ({
  boxShadow: `0 10px 40px ${color}33, 0 0 0 1px ${color}22`,
});

// --- Ambient Float ---
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

// --- Ambient Pulse ---
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

// --- Slide transitions ---
export const slideFromRight: Variants = {
  initial: { opacity: 0, x: '3.5%', y: '1.2%', scale: 0.97 },
  animate: {
    opacity: 1,
    x: 0,
    y: 0,
    scale: [0.97, 1.006, 1],
    transition: { duration: DURATION.normal, ease: CURVES.easeOutSmooth },
  },
  exit: {
    opacity: 0,
    scale: 0.975,
    transition: { duration: DURATION.fast, ease: CURVES.easeOutSmooth },
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
