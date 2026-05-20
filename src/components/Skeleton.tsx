import { motion } from 'framer-motion';
import { CURVES, DURATION } from '@/lib/animations';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle' | 'card';
  width?: string;
  height?: string;
  count?: number;
}

function SkeletonPulse({ className = '', style = {} }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`relative overflow-hidden rounded-lg bg-slate-100 ${className}`}
      style={style}
    >
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(148,163,184,0.12) 40%, rgba(148,163,184,0.18) 50%, rgba(148,163,184,0.12) 60%, transparent 100%)',
        }}
        animate={{ x: ['-100%', '100%'] }}
        transition={{
          duration: 1.8,
          ease: 'easeInOut',
          repeat: Infinity,
          repeatDelay: 0.3,
        }}
      />
    </div>
  );
}

export default function Skeleton({ className = '', variant = 'rect', width, height, count = 1 }: SkeletonProps) {
  const baseStyle: React.CSSProperties = {
    width: width || undefined,
    height: height || undefined,
  };

  if (variant === 'text') {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonPulse
            key={i}
            className="h-3 rounded"
            style={{ ...baseStyle, width: i === count - 1 ? '75%' : '100%' }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'circle') {
    return (
      <SkeletonPulse
        className={`rounded-full ${className}`}
        style={{ ...baseStyle, width: width || '40px', height: height || '40px' }}
      />
    );
  }

  if (variant === 'card') {
    return (
      <div className={`rounded-xl border border-slate-100 bg-white p-4 space-y-3 ${className}`} style={baseStyle}>
        <div className="flex items-center gap-3">
          <SkeletonPulse className="h-9 w-9 rounded-lg" />
          <div className="flex-1 space-y-2">
            <SkeletonPulse className="h-3 w-2/3 rounded" />
            <SkeletonPulse className="h-2.5 w-1/3 rounded" />
          </div>
        </div>
        <SkeletonPulse className="h-8 w-1/2 rounded" />
        <SkeletonPulse className="h-2 w-full rounded" />
      </div>
    );
  }

  return <SkeletonPulse className={className} style={baseStyle} />;
}

export function SkeletonMap() {
  return (
    <div className="w-full h-full rounded-xl border border-slate-100 bg-white relative overflow-hidden">
      <SkeletonPulse className="absolute inset-0" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
            <div className="w-6 h-6 rounded bg-slate-200 animate-pulse" />
          </div>
          <span className="text-xs text-slate-400 font-medium">Loading terminal map...</span>
        </div>
      </div>
    </div>
  );
}

export function SkeletonTelemetryCards() {
  return (
    <div className="w-full flex gap-3 overflow-hidden">
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.4 }}
          className="flex-shrink-0"
          style={{ minWidth: '180px' }}
        >
          <Skeleton variant="card" />
        </motion.div>
      ))}
    </div>
  );
}
