import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Flame,
  Layers,
  Clock,
  ChevronLeft,
  ChevronRight,
  Info,
  MapPin,
} from 'lucide-react';

const ZONES = [
  { id: 'concourse_a', name: 'Concourse A', density: 42, trend: 'stable' },
  { id: 'concourse_b', name: 'Concourse B', density: 78, trend: 'up' },
  { id: 'concourse_c', name: 'Concourse C', density: 35, trend: 'down' },
  { id: 'main_hall', name: 'Main Hall', density: 65, trend: 'stable' },
  { id: 'security', name: 'Security', density: 91, trend: 'up' },
  { id: 'baggage', name: 'Baggage Claim', density: 28, trend: 'down' },
  { id: 'immigration', name: 'Immigration', density: 55, trend: 'stable' },
  { id: 'check_in', name: 'Check-in', density: 48, trend: 'up' },
];

const HEATMAP_GRID = Array.from({ length: 8 }, (_, row) =>
  Array.from({ length: 12 }, (_, col) => {
    const baseIntensity = Math.sin((row + col) * 0.5) * 0.3 + 0.5;
    const noise = (Math.sin(row * 3.7 + col * 2.3) + 1) * 0.15;
    return Math.min(1, Math.max(0, baseIntensity + noise));
  })
);

const TIME_LABELS = ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];

function getDensityColor(value: number): string {
  if (value < 0.25) return '#dbeafe';
  if (value < 0.5) return '#93c5fd';
  if (value < 0.75) return '#3b82f6';
  return '#1d4ed8';
}

function getDensityLabel(value: number): string {
  if (value < 0.25) return 'Low';
  if (value < 0.5) return 'Moderate';
  if (value < 0.75) return 'High';
  return 'Critical';
}

function el(index: number) {
  const delay = index * 0.45;
  return {
    initial: { opacity: 0, y: 20, scale: 0.97 },
    animate: {
      opacity: 1,
      y: 0,
      scale: [0.97, 1.03, 0.99, 1],
      transition: {
        delay,
        duration: 1.4,
        ease: [0.16, 1, 0.3, 1],
        opacity: { delay, duration: 1.8, ease: 'linear' },
        scale: { delay, duration: 1.4, times: [0, 0.45, 0.7, 1], ease: [0.16, 1, 0.3, 1] },
      },
    },
  };
}

export default function PassengerFlow() {
  const [timeIndex, setTimeIndex] = useState(4);

  return (
    <div className="h-full flex flex-col gap-4 p-4">
      {/* Element 0: Header */}
      <motion.div {...el(0)} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
            <Flame size={18} className="text-blue-500" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-800">Passenger Flow</h1>
            <p className="text-xs text-slate-400">Real-time congestion heatmap and zone density</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100">
            <Layers size={12} className="text-blue-500" />
            <span className="text-xs font-medium text-blue-600">Live View</span>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Element 1: Heatmap Area */}
        <motion.div {...el(1)} className="flex-[3] min-w-0">
          <div className="h-full rounded-xl border border-slate-100 bg-white overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-50">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-slate-400" />
                <span className="text-xs font-medium text-slate-600">Terminal Heatmap</span>
              </div>
              <div className="flex items-center gap-2">
                <Info size={12} className="text-slate-300" />
                <span className="text-[10px] text-slate-400">Updated 12s ago</span>
              </div>
            </div>

            {/* Heatmap Grid */}
            <div className="flex-1 p-6 flex items-center justify-center">
              <div className="w-full max-w-3xl">
                <div className="relative rounded-2xl border-2 border-dashed border-slate-200 p-4">
                  <div className="grid grid-cols-12 gap-1">
                    {HEATMAP_GRID.flat().map((value, i) => (
                      <motion.div
                        key={i}
                        className="aspect-square rounded-sm"
                        style={{ backgroundColor: getDensityColor(value) }}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.01, duration: 0.3 }}
                        title={`Density: ${Math.round(value * 100)}%`}
                      />
                    ))}
                  </div>
                  <div className="absolute -top-3 left-4 px-2 bg-white text-[10px] font-medium text-slate-400">
                    Concourse A
                  </div>
                  <div className="absolute -top-3 right-4 px-2 bg-white text-[10px] font-medium text-slate-400">
                    Concourse C
                  </div>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-2 bg-white text-[10px] font-medium text-slate-400">
                    Main Hall
                  </div>
                </div>
              </div>
            </div>

            {/* Time Slider */}
            <div className="px-6 pb-4">
              <div className="flex items-center gap-3">
                <Clock size={12} className="text-slate-400" />
                <button
                  onClick={() => setTimeIndex(Math.max(0, timeIndex - 1))}
                  className="w-6 h-6 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  <ChevronLeft size={12} />
                </button>
                <div className="flex-1">
                  <input
                    type="range"
                    min={0}
                    max={TIME_LABELS.length - 1}
                    value={timeIndex}
                    onChange={e => setTimeIndex(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-blue-500"
                  />
                  <div className="flex justify-between mt-1">
                    {TIME_LABELS.map((label, i) => (
                      <span
                        key={label}
                        className={`text-[9px] ${i === timeIndex ? 'text-blue-600 font-bold' : 'text-slate-300'}`}
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => setTimeIndex(Math.min(TIME_LABELS.length - 1, timeIndex + 1))}
                  className="w-6 h-6 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  <ChevronRight size={12} />
                </button>
                <span className="text-xs font-mono text-blue-600 font-medium w-12 text-center">
                  {TIME_LABELS[timeIndex]}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Panel */}
        <div className="flex-[1] min-w-[260px] flex flex-col gap-4">
          {/* Element 2: Legend */}
          <motion.div {...el(2)}>
            <div className="rounded-xl border border-slate-100 bg-white p-4">
              <h3 className="text-xs font-semibold text-slate-600 mb-3">Density Legend</h3>
              <div className="space-y-2">
                {[
                  { label: 'Low (<25%)', color: '#dbeafe' },
                  { label: 'Moderate (25-50%)', color: '#93c5fd' },
                  { label: 'High (50-75%)', color: '#3b82f6' },
                  { label: 'Critical (>75%)', color: '#1d4ed8' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs text-slate-500">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Element 3: Zone Density Bars */}
          <motion.div {...el(3)}>
            <div className="h-full rounded-xl border border-slate-100 bg-white p-4 flex flex-col">
              <h3 className="text-xs font-semibold text-slate-600 mb-3">Zone Density</h3>
              <div className="flex-1 space-y-3 overflow-auto">
                {ZONES.sort((a, b) => b.density - a.density).map((zone, i) => (
                  <motion.div
                    key={zone.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 3 * 0.22 + i * 0.05 }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-slate-600">{zone.name}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-700">{zone.density}%</span>
                        <span
                          className={`text-[10px] ${
                            zone.trend === 'up'
                              ? 'text-red-500'
                              : zone.trend === 'down'
                              ? 'text-emerald-500'
                              : 'text-slate-400'
                          }`}
                        >
                          {zone.trend === 'up' ? '↑' : zone.trend === 'down' ? '↓' : '→'}
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          background:
                            zone.density > 80
                              ? '#ef4444'
                              : zone.density > 60
                              ? '#f59e0b'
                              : '#3b82f6',
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${zone.density}%` }}
                        transition={{ duration: 0.8, delay: 3 * 0.22 + i * 0.05 }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {getDensityLabel(zone.density / 100)} congestion
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
