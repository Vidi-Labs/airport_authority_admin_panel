import { CheckCircle2, Flag, Eye, MapPin, AlertTriangle, ShieldAlert, Construction, Signpost, Hammer, Siren } from 'lucide-react';
import type { Disruption } from '@/types/dashboard';

interface DisruptionControlProps {
  disruptions: Disruption[];
  onApprove: (id: string) => void;
  onFlag: (id: string) => void;
  onResolve: (id: string) => void;
}

const typeConfig: Record<string, { icon: typeof Construction; color: string; bg: string }> = {
  blocked: { icon: Construction, color: 'text-amber-400', bg: 'bg-amber-400/10' },
  gate_change: { icon: Signpost, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
  new_facility: { icon: Hammer, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  sign_mismatch: { icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-400/10' },
  renovation: { icon: Construction, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  emergency: { icon: Siren, color: 'text-red-400', bg: 'bg-red-400/10' },
};

const severityConfig: Record<string, string> = {
  low: 'text-emerald-400 border-emerald-400/30',
  medium: 'text-amber-400 border-amber-400/30',
  high: 'text-orange-400 border-orange-400/30',
  critical: 'text-red-400 border-red-400/30 animate-pulse',
};

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'PENDING', color: 'text-amber-400 bg-amber-400/10' },
  approved: { label: 'APPROVED', color: 'text-emerald-400 bg-emerald-400/10' },
  flagged: { label: 'FLAGGED', color: 'text-red-400 bg-red-400/10' },
  resolved: { label: 'RESOLVED', color: 'text-gray-400 bg-gray-400/10' },
};

export default function DisruptionControl({
  disruptions,
  onApprove,
  onFlag,
  onResolve,
}: DisruptionControlProps) {
  const pendingDisruptions = disruptions.filter(d => d.status === 'pending');

  return (
    <div className="panel-glass h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
        <div className="flex items-center gap-2">
          <ShieldAlert size={14} className="text-amber-400" />
          <h3 className="text-sm font-semibold text-[#f0f4f8]">Disruption Control</h3>
          <span className="text-xs font-mono text-[#8a9bb3] ml-1">{pendingDisruptions.length} pending</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2" style={{ maxHeight: '340px' }}>
        {disruptions.slice(0, 12).map((d) => {
          const tcfg = typeConfig[d.type] || typeConfig.blocked;
          const scfg = severityConfig[d.severity];
          const stcfg = statusConfig[d.status];
          const Icon = tcfg.icon;

          return (
            <div
              key={d.id}
              className={`p-3 rounded-lg border transition-all hover:border-white/15 ${
                d.status === 'pending' ? 'border-amber-400/20 bg-amber-400/5' : 'border-white/5 bg-[#0a111e]/50'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`flex items-center justify-center w-7 h-7 rounded ${tcfg.bg}`}>
                    <Icon size={13} className={tcfg.color} />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-[#f0f4f8]">{d.title}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${scfg}`}>{d.severity.toUpperCase()}</span>
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${stcfg.color}`}>{stcfg.label}</span>
                    </div>
                  </div>
                </div>
                <span className="text-[9px] font-mono text-[#8a9bb3]/60">
                  {new Date(d.timestamp).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <p className="text-[11px] text-[#8a9bb3] mb-2 line-clamp-2">{d.description}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <MapPin size={9} className="text-[#8a9bb3]/60" />
                    <span className="text-[9px] font-mono text-[#8a9bb3]">{d.location}</span>
                  </div>
                  {d.affectedPassengers > 0 && (
                    <div className="flex items-center gap-1">
                      <Eye size={9} className="text-[#8a9bb3]/60" />
                      <span className="text-[9px] font-mono text-[#8a9bb3]">{d.affectedPassengers} affected</span>
                    </div>
                  )}
                </div>

                {d.status === 'pending' && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onApprove(d.id)}
                      className="flex items-center gap-1 px-2 py-1 rounded text-[9px] font-mono text-emerald-400 hover:bg-emerald-400/10 transition-colors border border-emerald-400/20"
                    >
                      <CheckCircle2 size={10} />
                      Approve
                    </button>
                    <button
                      onClick={() => onFlag(d.id)}
                      className="flex items-center gap-1 px-2 py-1 rounded text-[9px] font-mono text-red-400 hover:bg-red-400/10 transition-colors border border-red-400/20"
                    >
                      <Flag size={10} />
                      Flag
                    </button>
                  </div>
                )}

                {d.status === 'flagged' && (
                  <button
                    onClick={() => onResolve(d.id)}
                    className="flex items-center gap-1 px-2 py-1 rounded text-[9px] font-mono text-cyan-400 hover:bg-cyan-400/10 transition-colors border border-cyan-400/20"
                  >
                    <CheckCircle2 size={10} />
                    Resolve
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
