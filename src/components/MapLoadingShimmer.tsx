import { MapPin, Radio, Route, Users } from 'lucide-react';

type MapLoadingShimmerProps = {
  label?: string;
  sublabel?: string;
  compact?: boolean;
};

function SkeletonBlock({ className = '' }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-xl bg-slate-200 ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.05s_infinite] bg-gradient-to-r from-transparent via-white/90 to-transparent" />
    </div>
  );
}

export default function MapLoadingShimmer({
  label = 'Rendering live airport map',
  sublabel = 'Preparing terminal layers, passengers, beacons and overlays…',
  compact = false,
}: MapLoadingShimmerProps) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100">
      {/* soft professional map-grid background */}
      <div
        className="absolute inset-0 opacity-[0.48]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(148,163,184,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.18) 1px, transparent 1px)',
          backgroundSize: '34px 34px',
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_28%,rgba(226,232,240,0.85),transparent_34%),radial-gradient(circle_at_74%_68%,rgba(203,213,225,0.45),transparent_31%)]" />

      {/* subtle diagonal shine */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.25s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />

      {/* top control bar */}
      <div className="absolute inset-x-5 top-5 flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white/88 px-4 py-3 shadow-[0_10px_30px_rgba(15,23,42,0.07)] backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 ring-1 ring-slate-200">
            <MapPin size={16} />
          </div>
          <div>
            <SkeletonBlock className="h-3.5 w-40 bg-slate-200" />
            <SkeletonBlock className="mt-2 h-2.5 w-28 bg-slate-100" />
          </div>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <SkeletonBlock className="h-7 w-20 bg-slate-100" />
          <SkeletonBlock className="h-7 w-24 bg-slate-100" />
          <SkeletonBlock className="h-7 w-16 bg-slate-100" />
        </div>
      </div>

      {/* left telemetry panel */}
      {!compact && (
        <div className="absolute left-5 top-24 w-56 rounded-2xl border border-slate-200/80 bg-white/86 p-4 shadow-[0_12px_35px_rgba(15,23,42,0.06)] backdrop-blur-md">
          <div className="mb-4 flex items-center gap-2 text-slate-500">
            <Radio size={14} className="animate-pulse" />
            <span className="text-[11px] font-semibold uppercase tracking-wide">Live layers</span>
          </div>
          <div className="space-y-3">
            <SkeletonBlock className="h-3 w-full bg-slate-200" />
            <SkeletonBlock className="h-3 w-4/5 bg-slate-100" />
            <SkeletonBlock className="h-3 w-11/12 bg-slate-200" />
            <div className="grid grid-cols-3 gap-2 pt-2">
              <SkeletonBlock className="h-12 bg-slate-100" />
              <SkeletonBlock className="h-12 bg-slate-200/80" />
              <SkeletonBlock className="h-12 bg-slate-100" />
            </div>
          </div>
        </div>
      )}

      {/* stylized terminal plan */}
      <div className="absolute left-1/2 top-1/2 h-[46%] w-[64%] min-w-[320px] -translate-x-1/2 -translate-y-1/2">
        <div className="absolute left-1/2 top-0 h-[72%] w-[62%] -translate-x-1/2 overflow-hidden rounded-[2rem] border border-slate-300/80 bg-slate-100/85 shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.1s_infinite] bg-gradient-to-r from-transparent via-white/90 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-1/2 h-[34%] w-[86%] -translate-x-1/2 overflow-hidden rounded-2xl border border-slate-300/80 bg-white/82 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.2s_infinite] bg-gradient-to-r from-transparent via-slate-100/90 to-transparent" />
        </div>
        <div className="absolute left-0 top-[44%] h-[18%] w-[28%] overflow-hidden rounded-2xl border border-slate-300/80 bg-slate-100/80">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.25s_infinite] bg-gradient-to-r from-transparent via-white/85 to-transparent" />
        </div>
        <div className="absolute right-0 top-[44%] h-[18%] w-[28%] overflow-hidden rounded-2xl border border-slate-300/80 bg-slate-100/80">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.25s_infinite] bg-gradient-to-r from-transparent via-white/85 to-transparent" />
        </div>
        <div className="absolute left-1/2 -top-[20%] h-[36%] w-10 -translate-x-1/2 overflow-hidden rounded-xl border border-slate-300/80 bg-white/85">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.2s_infinite] bg-gradient-to-r from-transparent via-slate-100/90 to-transparent" />
        </div>

        {/* moving route line */}
        <div className="absolute left-[18%] top-[52%] h-1 w-[64%] overflow-hidden rounded-full bg-slate-200">
          <div className="h-full w-1/3 animate-[shimmer_0.95s_infinite] rounded-full bg-gradient-to-r from-slate-300 via-white to-slate-400" />
        </div>

        {/* beacon dots */}
        {[16, 28, 40, 52, 64, 76].map((x, i) => (
          <div
            key={x}
            className="absolute h-2.5 w-2.5 rounded-full bg-slate-400 shadow-[0_0_0_4px_rgba(148,163,184,0.16)]"
            style={{ left: `${x}%`, top: `${i % 2 ? 62 : 43}%`, animation: `pulse 1.4s ${i * 0.12}s infinite` }}
          />
        ))}
      </div>

      {/* bottom loading status */}
      <div className="absolute bottom-5 left-5 right-5 flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-white/90 p-4 shadow-[0_14px_40px_rgba(15,23,42,0.08)] backdrop-blur-md sm:left-auto sm:w-[420px]">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 ring-1 ring-slate-200">
            <Route size={17} />
            <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-slate-400 shadow-[0_0_0_4px_rgba(148,163,184,0.18)]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-800">{label}</p>
            <p className="mt-0.5 truncate text-[11px] text-slate-500">{sublabel}</p>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-500">
            <Users size={11} />
            LIVE
          </div>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full w-1/2 animate-[shimmer_0.9s_infinite] rounded-full bg-gradient-to-r from-slate-300 via-white to-slate-400" />
        </div>
      </div>
    </div>
  );
}
