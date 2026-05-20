import { useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { Users, Navigation, AlertTriangle, Activity, MapPinOff, Wifi, Shield, Clock } from 'lucide-react';
import { CURVES, DURATION } from '@/lib/animations';

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

const TelemetryRibbon = memo(function TelemetryRibbon({
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
    ok: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600', dot: 'bg-emerald-500' },
    warn: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600', dot: 'bg-amber-500' },
    err: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-500', dot: 'bg-red-500' },
    info: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-500', dot: 'bg-blue-500' },
  };

  return (
    <motion.div
      className="w-full flex gap-3 overflow-x-auto pb-1"
      style={{ scrollbarWidth: 'none' }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: DURATION.stagger } },
      }}
      initial="hidden"
      animate="visible"
    >
      {metrics.map((metric) => {
        const colors = statusColors[metric.status];
        const Icon = metric.icon;
        const isActive = activeFilter === metric.filter;

        return (
          <motion.div
            key={metric.id}
            className="flex-1 min-w-0"
            style={{ minWidth: 0 }}
            variants={{
              hidden: { opacity: 0, y: 16 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: DURATION.page, ease: CURVES.easeOutSmooth as any },
              },
            }}
            whileTap={{
              scale: 0.96,
              transition: { duration: DURATION.fast, ease: CURVES.liquid as any },
            }}
          >
            <button
              onClick={() => metric.filter && onFilterClick(isActive ? null : metric.filter)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-all text-left ${
                isActive
                  ? `${colors.bg} ${colors.border} shadow-md`
                  : `bg-white border-slate-200 hover:border-blue-200 hover:bg-blue-50/50`
              }`}
            >
              <div className={`flex items-center justify-center w-9 h-9 rounded-lg ${colors.bg} flex-shrink-0`}>
                <Icon size={16} className={colors.text} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-slate-800 tracking-tight">{metric.value}</span>
                  {metric.total !== undefined && (
                    <span className="text-xs text-slate-500">/ {metric.total}</span>
                  )}
                </div>
                <div className="text-xs text-slate-500 truncate">{metric.label}</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                  <span className="text-[10px] font-mono text-slate-500">{metric.delta}</span>
                </div>
              </div>
            </button>
          </motion.div>
        );
      })}
    </motion.div>
  );
});

export default TelemetryRibbon;
