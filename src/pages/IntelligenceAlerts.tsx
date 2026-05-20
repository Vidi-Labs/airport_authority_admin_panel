import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Check, X, Pencil, Filter, ChevronRight, TrendingUp,
  Clock, Sparkles, MapPin, Zap, Shield, Eye, BarChart3,
  ArrowUpRight, Activity,
} from 'lucide-react';
import { DURATION, CURVES } from '@/lib/animations';

function el(index: number) {
  const delay = index * DURATION.stagger;
  return {
    initial: { opacity: 0, y: 20, scale: 0.97 },
    animate: {
      opacity: 1, y: 0, scale: [0.97, 1.03, 0.99, 1],
      transition: {
        delay, duration: DURATION.page, ease: CURVES.easeOutSmooth as any,
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
  { id: 'ALT-001', title: 'New Sign Detected at Waypoint 7', description: 'AI vision detected a new directional sign reading "Gates A1-A10" that differs from the current map entry "Gates A1-A8".', confidence: 94, status: 'pending', type: 'sign_mismatch', timestamp: '2 min ago', location: 'Waypoint 7, Concourse A' },
  { id: 'ALT-002', title: 'Corridor Obstruction Identified', description: 'Object detection model identified a maintenance cart blocking the main corridor between B12 and B15.', confidence: 87, status: 'pending', type: 'obstruction', timestamp: '5 min ago', location: 'Concourse B Junction' },
  { id: 'ALT-003', title: 'Gate Number Change Detected', description: 'OCR system reads gate as "B15" but map shows "B12". High confidence match suggests gate reassignment occurred.', confidence: 91, status: 'approved', type: 'gate_change', timestamp: '12 min ago', location: 'Gate B12/B15' },
  { id: 'ALT-004', title: 'New Retail Unit Mapped', description: 'Previously unmapped retail space detected near Gate C32. Visual similarity suggests a coffee shop.', confidence: 78, status: 'pending', type: 'new_facility', timestamp: '18 min ago', location: 'Near Gate C32' },
  { id: 'ALT-005', title: 'Seating Area Layout Change', description: 'Floor plan comparison shows rearranged seating in the waiting area. Navigation paths may need updating.', confidence: 82, status: 'flagged', type: 'layout_change', timestamp: '25 min ago', location: 'Seating Area C' },
  { id: 'ALT-006', title: 'Emergency Exit Sign Updated', description: 'New emergency exit sign with updated evacuation route detected at concourse D entrance.', confidence: 96, status: 'approved', type: 'sign_mismatch', timestamp: '32 min ago', location: 'Concourse D Entrance' },
  { id: 'ALT-007', title: 'Elevator Status Panel Change', description: 'Elevator status display now shows "OUT OF SERVICE" for Elevator C-2. Affects accessibility routes.', confidence: 89, status: 'pending', type: 'status_change', timestamp: '41 min ago', location: 'Elevator C-2' },
];

const FILTER_OPTIONS = [
  { id: 'all', label: 'All Alerts', count: AI_ALERTS.length },
  { id: 'pending', label: 'Pending', count: AI_ALERTS.filter(a => a.status === 'pending').length },
  { id: 'approved', label: 'Approved', count: AI_ALERTS.filter(a => a.status === 'approved').length },
  { id: 'flagged', label: 'Flagged', count: AI_ALERTS.filter(a => a.status === 'flagged').length },
];

const ALERT_TYPES = [
  { type: 'sign_mismatch', label: 'Sign Changes', color: '#3b82f6', count: 2 },
  { type: 'obstruction', label: 'Obstructions', color: '#f59e0b', count: 1 },
  { type: 'gate_change', label: 'Gate Changes', color: '#8b5cf6', count: 1 },
  { type: 'new_facility', label: 'New Facilities', color: '#10b981', count: 1 },
  { type: 'layout_change', label: 'Layout Changes', color: '#ef4444', count: 1 },
  { type: 'status_change', label: 'Status Changes', color: '#6366f1', count: 1 },
];

const LIVE_ACTIVITIES = [
  { text: 'Scanning Concourse A cameras...', time: 'Just now', icon: Eye },
  { text: 'OCR processing Gate B15 sign', time: '12s ago', icon: Activity },
  { text: 'Object detection running on Zone C', time: '28s ago', icon: Zap },
  { text: 'Map diff computed for Section 3', time: '45s ago', icon: MapPin },
  { text: 'Confidence model updated to v2.8.4', time: '1m ago', icon: Shield },
  { text: 'New alert queued for review', time: '2m ago', icon: Sparkles },
];

// Animated confidence ring
function ConfidenceRing({ value, size = 64 }: { value: number; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const color = value >= 90 ? '#10b981' : value >= 80 ? '#3b82f6' : '#f59e0b';

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f1f5f9" strokeWidth="4" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-sm font-bold text-slate-700"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          {value}%
        </motion.span>
      </div>
    </div>
  );
}

// Animated bar
function AnimatedBar({ value, color, delay = 0 }: { value: number; color: string; delay?: number }) {
  return (
    <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1.2, ease: 'easeOut', delay }}
      />
    </div>
  );
}

export default function IntelligenceAlerts() {
  const [filter, setFilter] = useState('all');
  const [alerts, setAlerts] = useState(AI_ALERTS);
  const [liveIndex, setLiveIndex] = useState(0);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editStatus, setEditStatus] = useState<'pending' | 'approved' | 'flagged'>('pending');

  const filtered = filter === 'all' ? alerts : alerts.filter(a => a.status === filter);

  // Cycle through live activities
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveIndex(prev => (prev + 1) % LIVE_ACTIVITIES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = (id: string, action: 'approved' | 'flagged') => {
    setAlerts(prev => prev.map(a => (a.id === id ? { ...a, status: action } : a)));
  };

  const openEdit = (alert: Alert) => {
    setSelectedAlert(alert);
    setEditMode(true);
    setEditTitle(alert.title);
    setEditDescription(alert.description);
    setEditLocation(alert.location);
    setEditStatus(alert.status);
  };

  const saveEdit = () => {
    if (!selectedAlert) return;
    setAlerts(prev => prev.map(a =>
      a.id === selectedAlert.id
        ? { ...a, title: editTitle, description: editDescription, location: editLocation, status: editStatus }
        : a
    ));
    setEditMode(false);
    setSelectedAlert(null);
  };

  const statusColors = {
    pending: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
    approved: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
    flagged: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100' },
  };

  const avgConfidence = Math.round(alerts.reduce((sum, a) => sum + a.confidence, 0) / alerts.length);
  const pendingCount = alerts.filter(a => a.status === 'pending').length;
  const approvedCount = alerts.filter(a => a.status === 'approved').length;
  const flaggedCount = alerts.filter(a => a.status === 'flagged').length;

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
            <span className="text-xs font-medium text-amber-600">{pendingCount} pending review</span>
          </div>
        </div>
      </motion.div>

      {/* Element 1: Filters */}
      <motion.div {...el(1)} className="flex items-center gap-2">
        <Filter size={14} className="text-slate-400" />
        {FILTER_OPTIONS.map(opt => (
          <button key={opt.id} onClick={() => setFilter(opt.id)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === opt.id ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-slate-50 text-slate-500 border border-transparent hover:bg-slate-100'}`}>
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
                <motion.div key={alert.id} {...el(i + 2)}>
                  <div
                    className="rounded-xl border border-slate-100 bg-white p-4 hover:border-slate-200 transition-colors cursor-pointer"
                    onClick={() => setSelectedAlert(alert)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-semibold text-slate-700">{alert.title}</h3>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${colors.bg} ${colors.text} ${colors.border} border`}>{alert.status}</span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">{alert.description}</p>
                      </div>
                      <div className="ml-4 flex flex-col items-end gap-1">
                        <span className="text-lg font-bold text-blue-600">{alert.confidence}%</span>
                        <span className="text-[10px] text-slate-400">confidence</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-xs text-slate-400"><Clock size={11} />{alert.timestamp}</div>
                        <span className="text-xs text-slate-300">|</span>
                        <span className="text-xs text-slate-400">{alert.location}</span>
                      </div>
                      {alert.status === 'pending' && (
                        <div className="flex items-center gap-1.5">
                          <button onClick={e => { e.stopPropagation(); handleAction(alert.id, 'approved'); }} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-medium hover:bg-emerald-100 transition-colors border border-emerald-100"><Check size={12} />Approve</button>
                          <button onClick={e => { e.stopPropagation(); handleAction(alert.id, 'flagged'); }} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 transition-colors border border-red-100"><X size={12} />Reject</button>
                          <button onClick={e => { e.stopPropagation(); openEdit(alert); }} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 text-slate-500 text-xs font-medium hover:bg-slate-100 transition-colors border border-slate-100"><Pencil size={12} />Edit</button>
                        </div>
                      )}
                      {alert.status !== 'pending' && (
                        <button onClick={e => { e.stopPropagation(); setSelectedAlert(alert); }} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 text-slate-500 text-xs font-medium hover:bg-slate-100 transition-colors border border-slate-100"><ChevronRight size={12} />Details</button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Right Panel — Live Intelligence Dashboard */}
        <motion.div {...el(filtered.length + 2)} className="w-[360px] min-w-[300px] flex flex-col gap-3 overflow-auto">
          {/* Overall Confidence */}
          <div className="rounded-xl border border-slate-100 bg-white p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-600">Overall Confidence</span>
              <span className="text-[10px] text-slate-400">Last 24h</span>
            </div>
            <div className="flex items-center gap-4">
              <ConfidenceRing value={avgConfidence} size={72} />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">High (&gt;90%)</span>
                  <span className="text-[10px] font-medium text-emerald-600">{alerts.filter(a => a.confidence > 90).length}</span>
                </div>
                <AnimatedBar value={75} color="#10b981" delay={0.3} />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">Medium (80-90%)</span>
                  <span className="text-[10px] font-medium text-blue-600">{alerts.filter(a => a.confidence >= 80 && a.confidence <= 90).length}</span>
                </div>
                <AnimatedBar value={50} color="#3b82f6" delay={0.5} />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">Low (&lt;80%)</span>
                  <span className="text-[10px] font-medium text-amber-600">{alerts.filter(a => a.confidence < 80).length}</span>
                </div>
                <AnimatedBar value={25} color="#f59e0b" delay={0.7} />
              </div>
            </div>
          </div>

          {/* Alert Type Distribution */}
          <div className="rounded-xl border border-slate-100 bg-white p-4">
            <span className="text-xs font-semibold text-slate-600 block mb-3">Alert Types</span>
            <div className="space-y-2.5">
              {ALERT_TYPES.map((t, i) => (
                <div key={t.type} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: t.color }} />
                  <span className="text-[11px] text-slate-600 flex-1 truncate">{t.label}</span>
                  <span className="text-[11px] font-medium text-slate-700 w-5 text-right">{t.count}</span>
                  <div className="w-20">
                    <AnimatedBar value={(t.count / alerts.length) * 100} color={t.color} delay={0.3 + i * 0.1} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status Summary */}
          <div className="rounded-xl border border-slate-100 bg-white p-4">
            <span className="text-xs font-semibold text-slate-600 block mb-3">Status Summary</span>
            <div className="grid grid-cols-3 gap-2">
              <motion.div className="rounded-lg bg-amber-50 border border-amber-100 p-3 text-center" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.8 }}>
                <motion.p className="text-xl font-bold text-amber-600" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>{pendingCount}</motion.p>
                <p className="text-[10px] text-amber-500">Pending</p>
              </motion.div>
              <motion.div className="rounded-lg bg-emerald-50 border border-emerald-100 p-3 text-center" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.9 }}>
                <motion.p className="text-xl font-bold text-emerald-600" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}>{approvedCount}</motion.p>
                <p className="text-[10px] text-emerald-500">Approved</p>
              </motion.div>
              <motion.div className="rounded-lg bg-red-50 border border-red-100 p-3 text-center" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1 }}>
                <motion.p className="text-xl font-bold text-red-500" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>{flaggedCount}</motion.p>
                <p className="text-[10px] text-red-400">Flagged</p>
              </motion.div>
            </div>
          </div>

          {/* Live Activity Feed */}
          <div className="rounded-xl border border-slate-100 bg-white p-4 flex-1">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-600">Live Activity</span>
              <div className="flex items-center gap-1.5">
                <motion.div className="w-1.5 h-1.5 rounded-full bg-emerald-400" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
                <span className="text-[10px] text-emerald-500">Streaming</span>
              </div>
            </div>
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {LIVE_ACTIVITIES.map((activity, i) => {
                  const Icon = activity.icon;
                  return (
                    <motion.div
                      key={activity.text}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: i * 0.1, duration: 0.4 }}
                      className="flex items-center gap-2.5 py-1.5"
                    >
                      <div className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <Icon size={11} className="text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-slate-600 truncate">{activity.text}</p>
                      </div>
                      <span className="text-[9px] text-slate-400 flex-shrink-0">{activity.time}</span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedAlert && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
              onClick={() => setSelectedAlert(null)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Modal */}
            <motion.div
              className="relative w-full max-w-lg mx-4 rounded-2xl bg-white border border-slate-100 shadow-2xl overflow-hidden"
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Header */}
              <div className="flex items-start justify-between p-6 pb-4">
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${statusColors[editMode ? editStatus : selectedAlert.status].bg} ${statusColors[editMode ? editStatus : selectedAlert.status].text} ${statusColors[editMode ? editStatus : selectedAlert.status].border} border`}>
                      {editMode ? editStatus : selectedAlert.status}
                    </span>
                    <span className="text-[10px] text-slate-400">{selectedAlert.id}</span>
                  </div>
                  {editMode ? (
                    <input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full text-lg font-semibold text-slate-800 border-b border-blue-200 focus:outline-none focus:border-blue-400 pb-1" />
                  ) : (
                    <h2 className="text-lg font-semibold text-slate-800">{selectedAlert.title}</h2>
                  )}
                </div>
                <button onClick={() => { setSelectedAlert(null); setEditMode(false); }} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors flex-shrink-0">
                  <X size={16} />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 space-y-4">
                {/* Description */}
                <div>
                  {editMode ? (
                    <textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} rows={3} className="w-full text-sm text-slate-600 leading-relaxed border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300" />
                  ) : (
                    <p className="text-sm text-slate-600 leading-relaxed">{selectedAlert.description}</p>
                  )}
                </div>

                {/* Meta Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
                    <p className="text-[10px] text-slate-400 mb-1">Confidence Score</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-blue-600">{selectedAlert.confidence}%</span>
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div className="h-full rounded-full" style={{ background: selectedAlert.confidence >= 90 ? '#10b981' : selectedAlert.confidence >= 80 ? '#3b82f6' : '#f59e0b' }} initial={{ width: 0 }} animate={{ width: `${selectedAlert.confidence}%` }} transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }} />
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
                    <p className="text-[10px] text-slate-400 mb-1">Detection Time</p>
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-slate-500" />
                      <span className="text-sm font-medium text-slate-700">{selectedAlert.timestamp}</span>
                    </div>
                  </div>
                  <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
                    <p className="text-[10px] text-slate-400 mb-1">Location</p>
                    {editMode ? (
                      <input value={editLocation} onChange={e => setEditLocation(e.target.value)} className="w-full text-sm font-medium text-slate-700 border-b border-blue-200 focus:outline-none focus:border-blue-400 pb-0.5" />
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-slate-500" />
                        <span className="text-sm font-medium text-slate-700">{selectedAlert.location}</span>
                      </div>
                    )}
                  </div>
                  <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
                    <p className="text-[10px] text-slate-400 mb-1">Status</p>
                    {editMode ? (
                      <select value={editStatus} onChange={e => setEditStatus(e.target.value as any)} className="w-full text-sm font-medium text-slate-700 bg-transparent border-b border-blue-200 focus:outline-none focus:border-blue-400">
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="flagged">Flagged</option>
                      </select>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <Zap size={14} className="text-slate-500" />
                        <span className="text-sm font-medium text-slate-700 capitalize">{selectedAlert.type.replace(/_/g, ' ')}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* AI Analysis */}
                <div className="rounded-lg bg-blue-50/50 border border-blue-100 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain size={14} className="text-blue-500" />
                    <span className="text-xs font-semibold text-blue-700">AI Analysis</span>
                  </div>
                  <p className="text-xs text-blue-600 leading-relaxed">
                    {selectedAlert.type === 'sign_mismatch' && 'Optical character recognition detected text inconsistency between camera feed and stored map data. The new sign text has been verified across multiple camera angles with high confidence.'}
                    {selectedAlert.type === 'obstruction' && 'Object detection model identified a temporary obstruction in the pedestrian path. The system recommends rerouting affected passengers and monitoring for clearance.'}
                    {selectedAlert.type === 'gate_change' && 'OCR comparison detected a gate number discrepancy. Cross-referencing with flight information system suggests a recent gate reassignment.'}
                    {selectedAlert.type === 'new_facility' && 'Visual similarity model detected an unmapped commercial space. Classification suggests a food & beverage establishment based on signage and layout patterns.'}
                    {selectedAlert.type === 'layout_change' && 'Floor plan comparison algorithm detected spatial changes in the seating arrangement. Navigation corridors may require recalculation.'}
                    {selectedAlert.type === 'status_change' && 'Real-time status monitoring detected an equipment state change. Accessibility route recommendations have been automatically updated.'}
                  </p>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-6 pt-4 flex items-center justify-between">
                {editMode ? (
                  <div className="flex items-center gap-2">
                    <button onClick={saveEdit} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors">
                      <Check size={14} /> Save Changes
                    </button>
                    <button onClick={() => setEditMode(false)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-50 text-slate-600 text-sm font-medium hover:bg-slate-100 transition-colors border border-slate-100">
                      Cancel
                    </button>
                  </div>
                ) : selectedAlert.status === 'pending' ? (
                  <div className="flex items-center gap-2">
                    <button onClick={() => { handleAction(selectedAlert.id, 'approved'); setSelectedAlert(null); }} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-colors">
                      <Check size={14} /> Approve
                    </button>
                    <button onClick={() => { handleAction(selectedAlert.id, 'flagged'); setSelectedAlert(null); }} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition-colors border border-red-100">
                      <X size={14} /> Reject
                    </button>
                    <button onClick={() => openEdit(selectedAlert)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-50 text-slate-600 text-sm font-medium hover:bg-slate-100 transition-colors border border-slate-100">
                      <Pencil size={14} /> Edit
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-medium ${statusColors[selectedAlert.status].bg} ${statusColors[selectedAlert.status].text}`}>
                      {selectedAlert.status === 'approved' ? 'Approved' : 'Flagged'}
                    </span>
                    <button onClick={() => openEdit(selectedAlert)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-50 text-slate-600 text-sm font-medium hover:bg-slate-100 transition-colors border border-slate-100">
                      <Pencil size={14} /> Edit
                    </button>
                  </div>
                )}
                <button
                  onClick={() => { setSelectedAlert(null); setEditMode(false); }}
                  className="px-4 py-2 rounded-lg text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
