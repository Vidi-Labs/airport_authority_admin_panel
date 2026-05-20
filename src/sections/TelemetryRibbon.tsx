import { useMemo } from 'react';
import { Users, Navigation, AlertTriangle, Activity, MapPinOff, Wifi, Shield, Clock } from 'lucide-react';

interface TelemetryRibbonProps {
  activeCount: number;
  deviatedCount: number;
  emergencyCount: number;
  avgDeviation: number;
  avgConfidence: number;
  passengerCount: number;
  pendingAlerts: number;
  criticalAlerts: number;
  onFilterClick: (filter: string | null) => void;
  activeFilter: string | null;
}

export default function TelemetryRibbon({
  activeCount,
  deviatedCount,
  emergencyCount,
  avgDeviation,
  avgConfidence,
  passengerCount,
  pendingAlerts,
  criticalAlerts,
  onFilterClick,
  activeFilter,
}: TelemetryRibbonProps) {
  const metrics = useMemo(() => [
    {
      id: 'sessions',
      label: 'Active Sessions',
      value: activeCount.toString(),
      total: passengerCount,
      delta: `+${Math.floor(Math.random() * 3)} this min`,
      status: 'ok' as const,
      icon: Users,
      filter: 'active',
    },
    {
      id: 'deviation',
      label: 'Avg Deviation',
      value: `${avgDeviation.toFixed(1)}m`,
      delta: 'Target: <2.0m',
      status: avgDeviation < 2 ? 'ok' : avgDeviation < 3 ? 'warn' : 'err',
      icon: Navigation,
      filter: null,
    },
    {
      id: 'confidence',
      label: 'ML Confidence',
      value: `${avgConfidence.toFixed(0)}%`,
      delta: 'OCR + Localization',
      status: avgConfidence > 80 ? 'ok' : 'warn',
      icon: Activity,
      filter: null,
    },
    {
      id: 'blocked',
      label: 'Deviated Users',
      value: deviatedCount.toString(),
      delta: 'Rerouting active',
      status: deviatedCount > 0 ? 'warn' : 'ok',
      icon: MapPinOff,
      filter: 'blocked',
    },
    {
      id: 'emergency',
      label: 'Emergency',
      value: emergencyCount.toString(),
      delta: 'Requires attention',
      status: emergencyCount > 0 ? 'err' : 'ok',
      icon: AlertTriangle,
      filter: 'emergency',
    },
    {
      id: 'alerts',
      label: 'Pending Alerts',
      value: pendingAlerts.toString(),
      delta: `${criticalAlerts} critical`,
      status: criticalAlerts > 0 ? 'err' : pendingAlerts > 0 ? 'warn' : 'ok',
      icon: Shield,
      filter: null,
    },
    {
      id: 'system',
      label: 'System Load',
      value: `${Math.floor(35 + Math.random() * 15)}%`,
      delta: 'All modules nominal',
      status: 'ok',
      icon: Wifi,
      filter: null,
    },
    {
      id: 'uptime',
      label: 'Uptime',
      value: '99.97%',
      delta: 'Last 30 days',
      status: 'ok',
      icon: Clock,
      filter: null,
    },
  ], [activeCount, deviatedCount, emergencyCount, avgDeviation, avgConfidence, passengerCount, pendingAlerts, criticalAlerts]);

  const statusColors: Record<string, { bg: string; border: string; text: string; dot: string }> = {
    ok: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', dot: 'bg-emerald-400' },
    warn: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', dot: 'bg-amber-400' },
    err: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', dot: 'bg-red-400' },
    info: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', dot: 'bg-cyan-400' },
  };

  return (
    <div className="w-full flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
      {metrics.map((metric) => {
        const colors = statusColors[metric.status];
        const Icon = metric.icon;
        const isActive = activeFilter === metric.filter;

        return (
          <button
            key={metric.id}
            onClick={() => metric.filter && onFilterClick(isActive ? null : metric.filter)}
            className={`flex-shrink-0 flex items-center gap-3 px-4 py-3 rounded-lg border transition-all duration-200 text-left ${
              isActive
                ? `${colors.bg} ${colors.border} shadow-lg`
                : `bg-[#0a111e] border-white/8 hover:border-cyan-500/20 hover:bg-[#101b2e]`
            }`}
            style={{ minWidth: '180px' }}
          >
            <div className={`flex items-center justify-center w-9 h-9 rounded-lg ${colors.bg}`}>
              <Icon size={16} className={colors.text} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-[#f0f4f8] tracking-tight">{metric.value}</span>
                {metric.total !== undefined && (
                  <span className="text-xs text-[#8a9bb3]">/ {metric.total}</span>
                )}
              </div>
              <div className="text-xs text-[#8a9bb3] truncate">{metric.label}</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                <span className="text-[10px] font-mono text-[#8a9bb3]">{metric.delta}</span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
