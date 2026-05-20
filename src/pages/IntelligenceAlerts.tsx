import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Check,
  X,
  Pencil,
  Filter,
  ChevronRight,
  TrendingUp,
  Clock,
  Sparkles,
} from 'lucide-react';

import { DURATION, CURVES } from '@/lib/animations';

function el(index: number) {
  const delay = index * DURATION.stagger;
  return {
    initial: { opacity: 0, y: 20, scale: 0.97 },
    animate: {
      opacity: 1,
      y: 0,
      scale: [0.97, 1.03, 0.99, 1],
      transition: {
        delay,
        duration: DURATION.page,
        ease: CURVES.easeOutSmooth as any,
        opacity: { delay, duration: DURATION.fadeSlow, ease: 'linear' },
        scale: { delay, duration: DURATION.page, times: [0, 0.45, 0.7, 1], ease: CURVES.easeOutSmooth as any },
      },
    },
  };
}

interface Alert {
  id: string;
  title: string;
  description: string;
  confidence: number;
  status: 'pending' | 'approved' | 'flagged';
  type: string;
  timestamp: string;
  location: string;
}

const AI_ALERTS: Alert[] = [
  {
    id: 'ALT-001',
    title: 'New Sign Detected at Waypoint 7',
    description: 'AI vision detected a new directional sign reading "Gates A1-A10" that differs from the current map entry "Gates A1-A8".',
    confidence: 94,
    status: 'pending',
    type: 'sign_mismatch',
    timestamp: '2 min ago',
    location: 'Waypoint 7, Concourse A',
  },
  {
    id: 'ALT-002',
    title: 'Corridor Obstruction Identified',
    description: 'Object detection model identified a maintenance cart blocking the main corridor between B12 and B15.',
    confidence: 87,
    status: 'pending',
    type: 'obstruction',
    timestamp: '5 min ago',
    location: 'Concourse B Junction',
  },
  {
    id: 'ALT-003',
    title: 'Gate Number Change Detected',
    description: 'OCR system reads gate as "B15" but map shows "B12". High confidence match suggests gate reassignment occurred.',
    confidence: 91,
    status: 'approved',
    type: 'gate_change',
    timestamp: '12 min ago',
    location: 'Gate B12/B15',
  },
  {
    id: 'ALT-004',
    title: 'New Retail Unit Mapped',
    description: 'Previously unmapped retail space detected near Gate C32. Visual similarity suggests a coffee shop.',
    confidence: 78,
    status: 'pending',
    type: 'new_facility',
    timestamp: '18 min ago',
    location: 'Near Gate C32',
  },
  {
    id: 'ALT-005',
    title: 'Seating Area Layout Change',
    description: 'Floor plan comparison shows rearranged seating in the waiting area. Navigation paths may need updating.',
    confidence: 82,
    status: 'flagged',
    type: 'layout_change',
    timestamp: '25 min ago',
    location: 'Seating Area C',
  },
  {
    id: 'ALT-006',
    title: 'Emergency Exit Sign Updated',
    description: 'New emergency exit sign with updated evacuation route detected at concourse D entrance.',
    confidence: 96,
    status: 'approved',
    type: 'sign_mismatch',
    timestamp: '32 min ago',
    location: 'Concourse D Entrance',
  },
  {
    id: 'ALT-007',
    title: 'Elevator Status Panel Change',
    description: 'Elevator status display now shows "OUT OF SERVICE" for Elevator C-2. Affects accessibility routes.',
    confidence: 89,
    status: 'pending',
    type: 'status_change',
    timestamp: '41 min ago',
    location: 'Elevator C-2',
  },
];

const FILTER_OPTIONS = [
  { id: 'all', label: 'All Alerts', count: AI_ALERTS.length },
  { id: 'pending', label: 'Pending', count: AI_ALERTS.filter(a => a.status === 'pending').length },
  { id: 'approved', label: 'Approved', count: AI_ALERTS.filter(a => a.status === 'approved').length },
  { id: 'flagged', label: 'Flagged', count: AI_ALERTS.filter(a => a.status === 'flagged').length },
];

export default function IntelligenceAlerts() {
  const [filter, setFilter] = useState('all');
  const [alerts, setAlerts] = useState(AI_ALERTS);

  const filtered = filter === 'all' ? alerts : alerts.filter(a => a.status === filter);

  const handleAction = (id: string, action: 'approved' | 'flagged') => {
    setAlerts(prev => prev.map(a => (a.id === id ? { ...a, status: action } : a)));
  };

  const statusColors = {
    pending: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
    approved: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
    flagged: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100' },
  };

  return (
    <div className="h-full flex flex-col gap-4 p-4">
      {/* Element 0: Header */}
      <motion.div {...el(0)} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
            <Brain size={18} className="text-blue-500" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-800">Intelligence Alerts</h1>
            <p className="text-xs text-slate-400">AI-detected changes requiring review</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-100">
            <Sparkles size={12} className="text-amber-500" />
            <span className="text-xs font-medium text-amber-600">
              {alerts.filter(a => a.status === 'pending').length} pending review
            </span>
          </div>
        </div>
      </motion.div>

      {/* Element 1: Filters */}
      <motion.div {...el(1)} className="flex items-center gap-2">
        <Filter size={14} className="text-slate-400" />
        {FILTER_OPTIONS.map(opt => (
          <button
            key={opt.id}
            onClick={() => setFilter(opt.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === opt.id
                ? 'bg-blue-50 text-blue-600 border border-blue-100'
                : 'bg-slate-50 text-slate-500 border border-transparent hover:bg-slate-100'
            }`}
          >
            {opt.label}
            <span className="ml-1.5 text-[10px] opacity-60">{opt.count}</span>
          </button>
        ))}
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Alert List */}
        <div className="flex-1 overflow-auto space-y-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((alert, i) => {
              const colors = statusColors[alert.status];
              return (
                <motion.div
                  key={alert.id}
                  {...el(i + 2)}
                >
                  <div className="rounded-xl border border-slate-100 bg-white p-4 hover:border-slate-200 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-semibold text-slate-700">{alert.title}</h3>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${colors.bg} ${colors.text} ${colors.border} border`}>
                            {alert.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">{alert.description}</p>
                      </div>
                      <div className="ml-4 flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1.5">
                          <TrendingUp size={12} className="text-blue-500" />
                          <span className="text-lg font-bold text-blue-600">{alert.confidence}%</span>
                        </div>
                        <span className="text-[10px] text-slate-400">confidence</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <Clock size={11} />
                          {alert.timestamp}
                        </div>
                        <span className="text-xs text-slate-300">|</span>
                        <span className="text-xs text-slate-400">{alert.location}</span>
                      </div>

                      {alert.status === 'pending' && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleAction(alert.id, 'approved')}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-medium hover:bg-emerald-100 transition-colors border border-emerald-100"
                          >
                            <Check size={12} />
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction(alert.id, 'flagged')}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 transition-colors border border-red-100"
                          >
                            <X size={12} />
                            Reject
                          </button>
                          <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 text-slate-500 text-xs font-medium hover:bg-slate-100 transition-colors border border-slate-100">
                            <Pencil size={12} />
                            Edit
                          </button>
                        </div>
                      )}
                      {alert.status !== 'pending' && (
                        <div className="flex items-center gap-1.5">
                          <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 text-slate-500 text-xs font-medium hover:bg-slate-100 transition-colors border border-slate-100">
                            <ChevronRight size={12} />
                            Details
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Element N+2: 3D Map Difference Viewer */}
        <motion.div {...el(filtered.length + 2)} className="w-[380px] min-w-[320px]">
          <div className="h-full rounded-xl border border-slate-100 bg-white overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-50">
              <span className="text-xs font-medium text-slate-600">3D Map Difference Viewer</span>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-50 text-slate-500">Before</span>
                <span className="text-slate-300">/</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-600">After</span>
              </div>
            </div>

            <div className="flex-1 p-4 space-y-4">
              <div className="flex-1 rounded-lg bg-slate-50 border border-slate-100 p-6 flex flex-col items-center justify-center" style={{ minHeight: '140px' }}>
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-2">Before</p>
                <div className="w-16 h-16 rounded-lg bg-white border border-slate-100 flex items-center justify-center">
                  <span className="text-xs text-slate-300">Map v2.3</span>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
                  <ChevronRight size={14} className="text-blue-500 rotate-90" />
                </div>
              </div>
              <div className="flex-1 rounded-lg bg-blue-50/50 border border-blue-100 p-6 flex flex-col items-center justify-center" style={{ minHeight: '140px' }}>
                <p className="text-[10px] font-medium text-blue-400 uppercase tracking-wider mb-2">After</p>
                <div className="w-16 h-16 rounded-lg bg-white border border-blue-100 flex items-center justify-center">
                  <span className="text-xs text-blue-300">Map v2.4</span>
                </div>
              </div>
            </div>

            <div className="px-4 py-3 border-t border-slate-50">
              <button className="w-full py-2 rounded-lg bg-blue-50 text-blue-600 text-xs font-medium hover:bg-blue-100 transition-colors">
                View Full Comparison
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
