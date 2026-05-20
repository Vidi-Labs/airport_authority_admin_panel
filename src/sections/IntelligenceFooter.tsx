import { useEffect, useRef, memo } from 'react';
import type { SystemLog } from '@/types/dashboard';

interface IntelligenceFooterProps {
  logs: SystemLog[];
}

const IntelligenceFooter = memo(function IntelligenceFooter({ logs }: IntelligenceFooterProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [logs]);

  const levelColors: Record<string, string> = {
    info: 'text-blue-600',
    warn: 'text-amber-600',
    error: 'text-red-500',
    debug: 'text-slate-500',
  };

  const levelBg: Record<string, string> = {
    info: 'bg-blue-50',
    warn: 'bg-amber-50',
    error: 'bg-red-50',
    debug: 'bg-slate-50',
  };

  // Duplicate logs for seamless marquee
  const marqueeLogs = [...logs, ...logs, ...logs];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-12 bg-white border-t border-slate-200 shadow-md z-50 flex items-center overflow-hidden">
      <div className="flex items-center gap-2 px-4 border-r border-slate-200 h-full">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[10px] font-mono text-emerald-600 uppercase tracking-wider">System Online</span>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 flex items-center gap-6 overflow-hidden px-4"
      >
        <div className="flex items-center gap-6 animate-marquee whitespace-nowrap">
          {marqueeLogs.map((log, i) => (
            <span key={`${log.id}-${i}`} className="flex items-center gap-2">
              <span className="text-[9px] font-mono text-slate-400">
                {new Date(log.timestamp).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              <span className={`text-[9px] font-mono px-1 py-0.5 rounded ${levelBg[log.level]} ${levelColors[log.level]}`}>
                {log.module}
              </span>
              <span className={`text-[10px] font-mono ${levelColors[log.level]} opacity-80`}>
                {log.message}
              </span>
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 px-4 border-l border-slate-200 h-full">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span className="text-[9px] font-mono text-slate-500">ML</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-[9px] font-mono text-slate-500">OCR</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-[9px] font-mono text-slate-500">LOC</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span className="text-[9px] font-mono text-slate-500">NAV</span>
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-marquee {
          animation: marquee 60s linear infinite;
        }
      `}</style>
    </div>
  );
});

export default IntelligenceFooter;
