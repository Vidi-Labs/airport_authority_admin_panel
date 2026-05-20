import { motion } from 'framer-motion';
import {
  BarChart3, Users, Clock, ArrowUpRight, ArrowDownRight, Activity, Target,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

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

const PASSENGER_FLOW = [
  { hour: '00:00', flow: 120 }, { hour: '02:00', flow: 85 },
  { hour: '04:00', flow: 45 }, { hour: '06:00', flow: 210 },
  { hour: '08:00', flow: 480 }, { hour: '10:00', flow: 620 },
  { hour: '12:00', flow: 540 }, { hour: '14:00', flow: 490 },
  { hour: '16:00', flow: 580 }, { hour: '18:00', flow: 710 },
  { hour: '20:00', flow: 430 }, { hour: '22:00', flow: 260 },
];

const PEAK_HOURS = [
  { hour: '6AM', passengers: 210, capacity: 300 },
  { hour: '8AM', passengers: 480, capacity: 500 },
  { hour: '10AM', passengers: 620, capacity: 650 },
  { hour: '12PM', passengers: 540, capacity: 650 },
  { hour: '2PM', passengers: 490, capacity: 650 },
  { hour: '4PM', passengers: 580, capacity: 650 },
  { hour: '6PM', passengers: 710, capacity: 700 },
  { hour: '8PM', passengers: 430, capacity: 650 },
];

const CONGESTION_TRENDS = [
  { zone: 'Concourse A', current: 65, previous: 58 },
  { zone: 'Concourse B', current: 82, previous: 71 },
  { zone: 'Concourse C', current: 45, previous: 52 },
  { zone: 'Main Hall', current: 73, previous: 68 },
  { zone: 'Security', current: 91, previous: 85 },
  { zone: 'Baggage', current: 38, previous: 42 },
];

const SUCCESS_RATES = [
  { day: 'Mon', rate: 94 }, { day: 'Tue', rate: 96 },
  { day: 'Wed', rate: 92 }, { day: 'Thu', rate: 97 },
  { day: 'Fri', rate: 89 }, { day: 'Sat', rate: 95 },
  { day: 'Sun', rate: 93 },
];

const SUMMARY_STATS = [
  { label: 'Total Passengers Today', value: '4,275', change: '+12%', up: true, icon: Users },
  { label: 'Avg Navigation Time', value: '6m 42s', change: '-8%', up: false, icon: Clock },
  { label: 'Route Success Rate', value: '94.2%', change: '+2.1%', up: true, icon: Target },
  { label: 'Active Sessions', value: '186', change: '+5%', up: true, icon: Activity },
];

export default function AnalyticsReports() {
  return (
    <div className="h-full flex flex-col gap-4 p-4 overflow-auto">
      {/* Element 0: Header */}
      <motion.div {...el(0)} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
            <BarChart3 size={18} className="text-blue-500" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-800">Analytics & Reports</h1>
            <p className="text-xs text-slate-400">Passenger flow analytics and performance metrics</p>
          </div>
        </div>
        <select className="px-3 py-1.5 rounded-lg bg-white border border-slate-100 text-xs font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
          <option>This Month</option>
        </select>
      </motion.div>

      {/* Element 1: Summary Stats */}
      <motion.div {...el(1)} className="grid grid-cols-4 gap-3">
        {SUMMARY_STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-xl border border-slate-100 bg-white p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Icon size={14} className="text-blue-500" />
                </div>
                <div className={`flex items-center gap-0.5 text-xs font-medium ${stat.up ? 'text-emerald-600' : 'text-blue-600'}`}>
                  {stat.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {stat.change}
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-800 tracking-tight">{stat.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{stat.label}</p>
            </div>
          );
        })}
      </motion.div>

      {/* Element 2-5: Charts */}
      <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
        <motion.div {...el(2)}>
          <div className="rounded-xl border border-slate-100 bg-white p-4 h-full flex flex-col">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Passenger Flow (24h)</h3>
            <div className="flex-1 min-h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={PASSENGER_FLOW}>
                  <defs>
                    <linearGradient id="flowGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={{ stroke: '#e2e8f0' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={{ stroke: '#e2e8f0' }} />
                  <Tooltip contentStyle={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="flow" stroke="#3b82f6" strokeWidth={2} fill="url(#flowGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        <motion.div {...el(3)}>
          <div className="rounded-xl border border-slate-100 bg-white p-4 h-full flex flex-col">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Peak Hours vs Capacity</h3>
            <div className="flex-1 min-h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={PEAK_HOURS}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={{ stroke: '#e2e8f0' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={{ stroke: '#e2e8f0' }} />
                  <Tooltip contentStyle={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }} />
                  <Bar dataKey="capacity" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="passengers" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        <motion.div {...el(4)}>
          <div className="rounded-xl border border-slate-100 bg-white p-4 h-full flex flex-col">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Congestion by Zone</h3>
            <div className="flex-1 min-h-[240px] space-y-3">
              {CONGESTION_TRENDS.map(zone => (
                <div key={zone.zone} className="flex items-center gap-3">
                  <span className="text-xs font-medium text-slate-600 w-24 truncate">{zone.zone}</span>
                  <div className="flex-1 h-6 bg-slate-50 rounded-full overflow-hidden relative">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: zone.current > 80 ? '#ef4444' : zone.current > 60 ? '#f59e0b' : '#3b82f6' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${zone.current}%` }}
                      transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-500">{zone.current}%</span>
                  </div>
                  <div className="flex items-center gap-1 w-16 justify-end">
                    {zone.current > zone.previous ? <ArrowUpRight size={10} className="text-red-400" /> : <ArrowDownRight size={10} className="text-emerald-400" />}
                    <span className="text-[10px] text-slate-400">{Math.abs(zone.current - zone.previous)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div {...el(5)}>
          <div className="rounded-xl border border-slate-100 bg-white p-4 h-full flex flex-col">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Navigation Success Rate</h3>
            <div className="flex-1 min-h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={SUCCESS_RATES}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={{ stroke: '#e2e8f0' }} />
                  <YAxis domain={[80, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={{ stroke: '#e2e8f0' }} />
                  <Tooltip contentStyle={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }} formatter={(value: number) => [`${value}%`, 'Success Rate']} />
                  <Line type="monotone" dataKey="rate" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: '#3b82f6', strokeWidth: 0, r: 4 }} activeDot={{ fill: '#3b82f6', strokeWidth: 2, stroke: 'white', r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
