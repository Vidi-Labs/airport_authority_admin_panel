import { useState, useMemo } from 'react';
import { Search, Video, AlertTriangle, CheckCircle2, PauseCircle, Radio } from 'lucide-react';
import type { Passenger } from '@/types/dashboard';

interface LivePassengerMonitorProps {
  passengers: Passenger[];
  selectedPassenger: string | null;
  onSelectPassenger: (id: string | null) => void;
}

export default function LivePassengerMonitor({
  passengers,
  selectedPassenger,
  onSelectPassenger,
}: LivePassengerMonitorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredPassengers = useMemo(() => {
    let result = passengers;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        p =>
          p.id.toLowerCase().includes(q) ||
          p.destination.toLowerCase().includes(q) ||
          p.flightCode.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter(p => p.status === statusFilter);
    }
    return result.sort((a, b) => {
      const statusOrder = { emergency: 0, deviated: 1, idle: 2, active: 3, completed: 4 };
      return statusOrder[a.status] - statusOrder[b.status];
    });
  }, [passengers, searchQuery, statusFilter]);

  const selected = passengers.find(p => p.id === selectedPassenger);

  const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
    active: { label: 'On Track', color: 'text-emerald-400', icon: CheckCircle2 },
    idle: { label: 'Idle', color: 'text-blue-400', icon: PauseCircle },
    deviated: { label: 'Deviated', color: 'text-amber-400', icon: AlertTriangle },
    emergency: { label: 'Emergency', color: 'text-red-400', icon: AlertTriangle },
    completed: { label: 'Arrived', color: 'text-gray-400', icon: CheckCircle2 },
  };

  return (
    <div className="panel-glass h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
        <div className="flex items-center gap-2">
          <Radio size={14} className="text-cyan-400 animate-pulse" />
          <h3 className="text-sm font-semibold text-[#f0f4f8]">Live Passenger Monitor</h3>
          <span className="text-xs font-mono text-[#8a9bb3] ml-1">{passengers.length} active</span>
        </div>
      </div>

      <div className="px-4 py-2 border-b border-white/8">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8a9bb3]" />
            <input
              type="text"
              placeholder="Search passengers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#0f172a] border border-white/8 rounded text-xs text-[#f0f4f8] placeholder-[#8a9bb3]/50 focus:border-cyan-500/40 focus:outline-none transition-colors"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2 py-1.5 bg-[#0f172a] border border-white/8 rounded text-xs text-[#8a9bb3] focus:border-cyan-500/40 focus:outline-none cursor-pointer"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="idle">Idle</option>
            <option value="deviated">Deviated</option>
            <option value="emergency">Emergency</option>
          </select>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Passenger list */}
        <div className="flex-1 overflow-y-auto" style={{ maxHeight: '340px' }}>
          {filteredPassengers.map((p) => {
            const cfg = statusConfig[p.status] || statusConfig.active;
            const isSelected = selectedPassenger === p.id;

            return (
              <button
                key={p.id}
                onClick={() => onSelectPassenger(isSelected ? null : p.id)}
                className={`w-full text-left px-4 py-2.5 border-b border-white/5 transition-all hover:bg-[#101b2e] ${
                  isSelected ? 'bg-[#101b2e] border-l-2 border-l-cyan-400' : 'border-l-2 border-l-transparent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        p.status === 'active'
                          ? 'bg-emerald-400'
                          : p.status === 'deviated'
                          ? 'bg-amber-400'
                          : p.status === 'emergency'
                          ? 'bg-red-400'
                          : p.status === 'idle'
                          ? 'bg-blue-400'
                          : 'bg-gray-400'
                      }`}
                    />
                    <span className="text-xs font-mono text-[#f0f4f8]">{p.id}</span>
                  </div>
                  <span className={`text-[10px] font-mono ${cfg.color}`}>{p.status.toUpperCase()}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[11px] text-[#8a9bb3]">{p.destination}</span>
                  <span className="text-[10px] font-mono text-[#8a9bb3]">{p.confidence.toFixed(0)}%</span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] font-mono text-[#8a9bb3]/60">{p.flightCode}</span>
                  <span className="text-[10px] font-mono text-[#8a9bb3]/60">
                    {new Date(p.lastUpdate).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Detail panel */}
        {selected && (() => {
          const selectedCfg = statusConfig[selected.status] || statusConfig.active;
          const SelectedIcon = selectedCfg.icon;
          return (
          <div className="w-56 border-l border-white/8 bg-[#0a111e] p-3 overflow-y-auto" style={{ maxHeight: '340px' }}>
            <div className="flex items-center gap-2 mb-3">
              <SelectedIcon size={12} className={selectedCfg.color} />
              <span className={`text-xs font-semibold ${selectedCfg.color}`}>{selected.id}</span>
            </div>

            {/* Camera feed placeholder */}
            <div className="relative w-full h-24 rounded bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] border border-white/8 mb-3 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <Video size={20} className="text-[#8a9bb3]/40" />
              </div>
              <div className="absolute top-1.5 left-1.5 flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[8px] font-mono text-red-400">LIVE</span>
              </div>
              <div className="absolute bottom-1.5 right-1.5">
                <span className="text-[8px] font-mono text-[#8a9bb3]/60">{selected.flightCode}</span>
              </div>
              {/* Scan line effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent animate-pulse" style={{ animationDuration: '3s' }} />
            </div>

            <div className="space-y-2">
              <div>
                <div className="text-[10px] text-[#8a9bb3] mb-0.5">Destination</div>
                <div className="text-xs text-[#f0f4f8] font-medium">{selected.destination}</div>
              </div>
              <div>
                <div className="text-[10px] text-[#8a9bb3] mb-0.5">Flight</div>
                <div className="text-xs font-mono text-[#f0f4f8]">{selected.flightCode}</div>
              </div>
              <div>
                <div className="text-[10px] text-[#8a9bb3] mb-0.5">Confidence</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-[#0f172a] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${selected.confidence}%`,
                        backgroundColor: selected.confidence > 85 ? '#10b981' : selected.confidence > 60 ? '#f59e0b' : '#ef4444',
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-[#f0f4f8]">{selected.confidence.toFixed(0)}%</span>
                </div>
              </div>
              <div>
                <div className="text-[10px] text-[#8a9bb3] mb-0.5">Position</div>
                <div className="text-[10px] font-mono text-[#f0f4f8]">
                  X:{selected.x.toFixed(0)} Y:{selected.y.toFixed(0)}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-[#8a9bb3] mb-0.5">Deviation</div>
                <div className={`text-xs font-mono ${selected.deviation > 2 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {selected.deviation.toFixed(1)}m
                </div>
              </div>
              <div>
                <div className="text-[10px] text-[#8a9bb3] mb-0.5">Route Progress</div>
                <div className="flex-1 h-1.5 bg-[#0f172a] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 rounded-full transition-all duration-1000"
                    style={{ width: `${selected.progress * 100}%` }}
                  />
                </div>
                <div className="text-[10px] font-mono text-[#8a9bb3] mt-0.5">{(selected.progress * 100).toFixed(0)}%</div>
              </div>
            </div>
          </div>
        );})()}
      </div>
    </div>
  );
}
