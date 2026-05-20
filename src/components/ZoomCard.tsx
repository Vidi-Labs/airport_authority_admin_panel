import { useState, useRef, useEffect, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { CURVES, DURATION } from '@/lib/animations';

interface ZoomCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  delay?: number;
  onClick?: () => void;
}

export default function ZoomCard({
  children,
  className = '',
  glowColor = '#3b82f6',
  delay = 1000,
  onClick,
}: ZoomCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, []);

  return (
    <div
      style={{
        overflow: 'visible',
        position: 'relative',
        willChange: 'transform',
        zIndex: isHovered ? 9999 : 1,
      }}
      className={className}
      onMouseEnter={() => {
        hoverTimerRef.current = setTimeout(() => setIsHovered(true), delay);
      }}
      onMouseLeave={() => {
        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
        setIsHovered(false);
      }}
      onClick={onClick}
    >
      <motion.div
        animate={{
          scale: isHovered ? 1.08 : 1,
          boxShadow: isHovered
            ? `0 12px 40px ${glowColor}30, 0 0 0 1px ${glowColor}20, 0 4px 20px rgba(0,0,0,0.06)`
            : '0 1px 3px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.03)',
        }}
        transition={{
          scale: { duration: 1.2, ease: CURVES.easeOutSmooth as any },
          boxShadow: { duration: 1.0, ease: CURVES.easeOutSmooth as any },
        }}
        whileTap={{
          scale: 0.96,
          transition: { duration: DURATION.fast, ease: CURVES.liquid as any },
        }}
        style={{
          transformOrigin: 'center center',
          willChange: 'transform',
          position: 'relative',
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
