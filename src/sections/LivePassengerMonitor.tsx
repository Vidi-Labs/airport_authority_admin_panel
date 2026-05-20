import { useState, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Video, AlertTriangle, CheckCircle2, PauseCircle, Radio } from 'lucide-react';
import type { Passenger } from '@/types/dashboard';

interface LivePassengerMonitorProps {
  passengers: Passenger[];
  selectedPassenger: string | null;
  onSelectPassenger: (id: string | null) => void;
}

const LivePassengerMonitor = memo(function LivePassengerMonitor({
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
    active: { label: 'On Track', color: 'text-emerald-600', icon: CheckCircle2 },
    idle: { label: 'Idle', color: 'text-blue-500', icon: PauseCircle },
    deviated: { label: 'Deviated', color: 'text-amber-600', icon: AlertTriangle },
    emergency: { label: 'Emergency', color: 'text-red-500', icon: AlertTriangle },
    completed: { label: 'Arrived', color: 'text-slate-400', icon: CheckCircle2 },
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-md h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Radio size={14} className="text-blue-500 animate-pulse" />
          <h3 className="text-sm font-semibold text-slate-800">Live Passenger Monitor</h3>
          <span className="text-xs font-mono text-slate-500 ml-1">{passengers.length} active</span>
        </div>
      </div>

      <div className="px-4 py-2 border-b border-slate-200">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search passengers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-800 placeholder-slate-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-200 focus:outline-none transition-colors"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-600 focus:border-blue-400 focus:outline-none cursor-pointer"
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
          {filteredPassengers.map((p, index) => {
            const cfg = statusConfig[p.status] || statusConfig.active;
            const isSelected = selectedPassenger === p.id;

            return (
              <motion.button
                key={p.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => onSelectPassenger(isSelected ? null : p.id)}
                className={`w-full text-left px-4 py-2.5 border-b border-slate-100 transition-all hover:bg-blue-50 ${
                  isSelected ? 'bg-blue-50 border-l-2 border-l-blue-500' : 'border-l-2 border-l-transparent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        p.status === 'active'
                          ? 'bg-emerald-500'
                          : p.status === 'deviated'
                          ? 'bg-amber-500'
                          : p.status === 'emergency'
                          ? 'bg-red-500'
                          : p.status === 'idle'
                          ? 'bg-blue-500'
                          : 'bg-slate-400'
                      }`}
                    />
                    <span className="text-xs font-mono text-slate-800">{p.id}</span>
                  </div>
                  <span className={`text-[10px] font-mono ${cfg.color}`}>{p.status.toUpperCase()}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[11px] text-slate-500">{p.destination}</span>
                  <span className="text-[10px] font-mono text-slate-500">{p.confidence.toFixed(0)}%</span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] font-mono text-slate-400">{p.flightCode}</span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {new Date(p.lastUpdate).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Detail panel */}
        <AnimatePresence mode="wait">
          {selected && (() => {
            const selectedCfg = statusConfig[selected.status] || statusConfig.active;
            const SelectedIcon = selectedCfg.icon;
            return (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="w-56 border-l border-slate-200 bg-white p-3 overflow-y-auto"
              style={{ maxHeight: '340px' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <SelectedIcon size={12} className={selectedCfg.color} />
                <span className={`text-xs font-semibold ${selectedCfg.color}`}>{selected.id}</span>
              </div>

              {/* Camera feed placeholder */}
              <div className="relative w-full h-24 rounded bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 border border-slate-200 mb-3 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Video size={20} className="text-slate-300" />
                </div>
                <div className="absolute top-1.5 left-1.5 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[8px] font-mono text-red-500">LIVE</span>
                </div>
                <div className="absolute bottom-1.5 right-1.5">
                  <span className="text-[8px] font-mono text-slate-400">{selected.flightCode}</span>
                </div>
                {/* Scan line effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent animate-pulse" style={{ animationDuration: '3s' }} />
              </div>

              <div className="space-y-2">
                <div>
                  <div className="text-[10px] text-slate-500 mb-0.5">Destination</div>
                  <div className="text-xs text-slate-800 font-medium">{selected.destination}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 mb-0.5">Flight</div>
                  <div className="text-xs font-mono text-slate-800">{selected.flightCode}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 mb-0.5">Confidence</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${selected.confidence}%`,
                          backgroundColor: selected.confidence > 85 ? '#10b981' : selected.confidence > 60 ? '#f59e0b' : '#ef4444',
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-slate-800">{selected.confidence.toFixed(0)}%</span>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 mb-0.5">Position</div>
                  <div className="text-[10px] font-mono text-slate-800">
                    X:{selected.x.toFixed(0)} Y:{selected.y.toFixed(0)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 mb-0.5">Deviation</div>
                  <div className={`text-xs font-mono ${selected.deviation > 2 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {selected.deviation.toFixed(1)}m
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 mb-0.5">Route Progress</div>
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                      style={{ width: `${selected.progress * 100}%` }}
                    />
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 mt-0.5">{(selected.progress * 100).toFixed(0)}%</div>
                </div>
              </div>
            </motion.div>
          );})()}
        </AnimatePresence>
      </div>
    </div>
  );
});

export default LivePassengerMonitor;
