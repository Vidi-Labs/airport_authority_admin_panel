import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Flag, Eye, MapPin, AlertTriangle, ShieldAlert, Construction, Signpost, Hammer, Siren } from 'lucide-react';
import type { Disruption } from '@/types/dashboard';

interface DisruptionControlProps {
  disruptions: Disruption[];
  onApprove: (id: string) => void;
  onFlag: (id: string) => void;
  onResolve: (id: string) => void;
}

const typeConfig: Record<string, { icon: typeof Construction; color: string; bg: string }> = {
  blocked: { icon: Construction, color: 'text-amber-600', bg: 'bg-amber-50' },
  gate_change: { icon: Signpost, color: 'text-blue-500', bg: 'bg-blue-50' },
  new_facility: { icon: Hammer, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  sign_mismatch: { icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-50' },
  renovation: { icon: Construction, color: 'text-purple-500', bg: 'bg-purple-50' },
  emergency: { icon: Siren, color: 'text-red-500', bg: 'bg-red-50' },
};

const severityConfig: Record<string, string> = {
  low: 'text-emerald-600 border-emerald-200',
  medium: 'text-amber-600 border-amber-200',
  high: 'text-orange-500 border-orange-200',
  critical: 'text-red-500 border-red-200 animate-pulse',
};

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'PENDING', color: 'text-amber-600 bg-amber-50' },
  approved: { label: 'APPROVED', color: 'text-emerald-600 bg-emerald-50' },
  flagged: { label: 'FLAGGED', color: 'text-red-500 bg-red-50' },
  resolved: { label: 'RESOLVED', color: 'text-slate-500 bg-slate-50' },
};

const DisruptionControl = memo(function DisruptionControl({
  disruptions,
  onApprove,
  onFlag,
  onResolve,
}: DisruptionControlProps) {
  const pendingDisruptions = disruptions.filter(d => d.status === 'pending');

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-md h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <ShieldAlert size={14} className="text-amber-500" />
          <h3 className="text-sm font-semibold text-slate-800">Disruption Control</h3>
          <span className="text-xs font-mono text-slate-500 ml-1">{pendingDisruptions.length} pending</span>
        </div>
      </div>

      <motion.div
        className="flex-1 overflow-y-auto p-2 space-y-2"
        style={{ maxHeight: '340px' }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.04 } },
        }}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence mode="popLayout">
          {disruptions.slice(0, 12).map((d) => {
            const tcfg = typeConfig[d.type] || typeConfig.blocked;
            const scfg = severityConfig[d.severity];
            const stcfg = statusConfig[d.status];
            const Icon = tcfg.icon;

            return (
              <motion.div
                key={d.id}
                layout
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
                }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.4 } }}
                className={`p-3 rounded-lg border transition-all hover:bg-blue-50 ${
                  d.status === 'pending' ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center justify-center w-7 h-7 rounded ${tcfg.bg}`}>
                      <Icon size={13} className={tcfg.color} />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-slate-800">{d.title}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${scfg}`}>{d.severity.toUpperCase()}</span>
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${stcfg.color}`}>{stcfg.label}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono text-slate-400">
                    {new Date(d.timestamp).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 mb-2 line-clamp-2">{d.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <MapPin size={9} className="text-slate-400" />
                      <span className="text-[9px] font-mono text-slate-500">{d.location}</span>
                    </div>
                    {d.affectedPassengers > 0 && (
                      <div className="flex items-center gap-1">
                        <Eye size={9} className="text-slate-400" />
                        <span className="text-[9px] font-mono text-slate-500">{d.affectedPassengers} affected</span>
                      </div>
                    )}
                  </div>

                  <AnimatePresence mode="wait">
                    {d.status === 'pending' && (
                      <motion.div
                        key="pending-actions"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-1"
                      >
                        <button
                          onClick={() => onApprove(d.id)}
                          className="flex items-center gap-1 px-2 py-1 rounded text-[9px] font-mono text-emerald-600 hover:bg-emerald-50 transition-colors border border-emerald-200"
                        >
                          <CheckCircle2 size={10} />
                          Approve
                        </button>
                        <button
                          onClick={() => onFlag(d.id)}
                          className="flex items-center gap-1 px-2 py-1 rounded text-[9px] font-mono text-red-500 hover:bg-red-50 transition-colors border border-red-200"
                        >
                          <Flag size={10} />
                          Flag
                        </button>
                      </motion.div>
                    )}

                    {d.status === 'flagged' && (
                      <motion.button
                        key="resolve-action"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => onResolve(d.id)}
                        className="flex items-center gap-1 px-2 py-1 rounded text-[9px] font-mono text-blue-500 hover:bg-blue-50 transition-colors border border-blue-200"
                      >
                        <CheckCircle2 size={10} />
                        Resolve
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
});

export default DisruptionControl;
