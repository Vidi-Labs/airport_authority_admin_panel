import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { CURVES, DURATION } from '@/lib/animations';

interface ZoomCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  delay?: number;
  onClick?: () => void;
}

// Simple card wrapper with bouncy entrance only (no zoom-out hover)
export default function ZoomCard({
  children,
  className = '',
  onClick,
}: ZoomCardProps) {
  return (
    <motion.div
      whileTap={{
        scale: 0.96,
        transition: { duration: DURATION.fast, ease: CURVES.liquid as any },
      }}
      onClick={onClick}
      className={className}
    >
      {children}
    </motion.div>
  );
}
