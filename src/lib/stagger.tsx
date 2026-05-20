import { type ReactNode, createContext, useContext, useRef } from 'react';
import { motion } from 'framer-motion';
import { CURVES, DURATION } from './animations';

// Auto-incrementing stagger context
const StaggerContext = createContext<{ next: () => number }>({ next: () => 0 });

export function StaggerProvider({ children, baseDelay = 0 }: { children: ReactNode; baseDelay?: number }) {
  const counter = useRef(baseDelay);
  const ctx = useRef({
    next: () => {
      const delay = counter.current;
      counter.current += DURATION.stagger;
      return delay;
    },
  });
  return <StaggerContext.Provider value={ctx.current}>{children}</StaggerContext.Provider>;
}

// Wrap any element to animate in with stagger delay
export function StaggerIn({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const { next } = useContext(StaggerContext);
  const delay = next();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: [0.97, 1.035, 0.99, 1],
      }}
      transition={{
        delay,
        duration: DURATION.page,
        ease: CURVES.easeOutSmooth as any,
        opacity: { delay, duration: DURATION.fadeSlow, ease: 'linear' },
        scale: {
          delay,
          duration: DURATION.page,
          times: [0, 0.45, 0.7, 1],
          ease: CURVES.easeOutSmooth as any,
        },
      }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}
