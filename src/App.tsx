import { useState, useCallback, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Radio, Shield, Bell, Settings, BarChart3,
  AlertTriangle, Users, Map, MapPin, ChevronLeft, ChevronRight,
  Search, Plane, Menu,
} from 'lucide-react';
import { usePassengers } from '@/hooks/usePassengers';
import { useDisruptions } from '@/hooks/useDisruptions';
import { useSystemLogs } from '@/hooks/useSystemLogs';
import { CURVES, DURATION } from '@/lib/animations';
import Overview from '@/pages/Overview';
import LiveMonitoring from '@/pages/LiveMonitoring';
import ControlCenter from '@/pages/ControlCenter';
import IntelligenceAlerts from '@/pages/IntelligenceAlerts';
import AnalyticsReports from '@/pages/AnalyticsReports';
import PassengerFlow from '@/pages/PassengerFlow';
import MapManagement from '@/pages/MapManagement';
import SettingsPage from '@/pages/Settings';

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, path: '/' },
  { id: 'monitor', label: 'Live Monitoring', icon: Radio, path: '/monitoring' },
  { id: 'control', label: 'Control Center', icon: Shield, path: '/control' },
  { id: 'alerts', label: 'Intelligence Alerts', icon: AlertTriangle, path: '/alerts' },
  { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3, path: '/analytics' },
  { id: 'flow', label: 'Passenger Flow', icon: Users, path: '/flow' },
  { id: 'map', label: 'Map Management', icon: Map, path: '/map' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
];

export default function App() {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [highlightedFilter, setHighlightedFilter] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const {
    passengers,
    selectedPassenger,
    setSelectedPassenger,
    activeCount,
    deviatedCount,
    emergencyCount,
    avgDeviation,
    avgConfidence,
  } = usePassengers(24);

  const {
    disruptions,
    pendingCount,
    criticalCount,
    approveDisruption,
    flagDisruption,
    resolveDisruption,
  } = useDisruptions();

  const logs = useSystemLogs();

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleFilterChange = useCallback((filter: string | null) => {
    setHighlightedFilter(filter);
  }, []);

  const activeNav = NAV_ITEMS.find(item => item.path === location.pathname)?.id || 'overview';

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans flex">
      {/* ===== FLOATING GLASS SIDEBAR ===== */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarExpanded ? 240 : 72 }}
        transition={{ duration: DURATION.normal, ease: CURVES.easeOutSmooth as any }}
        className="fixed left-3 top-3 bottom-3 z-40 flex flex-col rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          border: '1px solid rgba(0, 0, 0, 0.06)',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04), 0 1px 4px rgba(0, 0, 0, 0.02)',
        }}
      >
        {/* Logo Area */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-500/20">
            <Plane size={18} className="text-white" />
          </div>
          <AnimatePresence>
            {sidebarExpanded && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col min-w-0"
              >
                <span className="text-sm font-bold text-slate-800 truncate">WAYPOINT</span>
                <span className="text-[10px] text-slate-400 font-medium">Command Center</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation — Capsule Rail */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto overflow-x-hidden" style={{ scrollbarWidth: 'none' }}>
          <div className="space-y-1">
            {NAV_ITEMS.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <motion.button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3, ease: CURVES.easeOutSmooth as any }}
                  whileHover={{ x: 3, transition: { duration: 0.15 } }}
                  whileTap={{ scale: 0.97, transition: { duration: 0.1, ease: CURVES.liquid as any } }}
                  className={`relative w-full flex items-center gap-3 rounded-xl transition-colors duration-200 group ${
                    sidebarExpanded ? 'px-3 py-2.5' : 'px-0 py-2.5 justify-center'
                  } ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {/* Active pill indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavPill"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-full bg-blue-500"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}

                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 ${
                    isActive ? 'bg-blue-100' : 'group-hover:bg-slate-100'
                  } transition-colors`}>
                    <Icon size={16} className={isActive ? 'text-blue-600' : ''} />
                  </div>

                  <AnimatePresence>
                    {sidebarExpanded && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`text-[13px] font-medium whitespace-nowrap overflow-hidden ${
                          isActive ? 'text-blue-600' : ''
                        }`}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Badge for alerts/control */}
                  {item.id === 'alerts' && criticalCount > 0 && (
                    <span className={`absolute ${sidebarExpanded ? 'right-3' : '-top-0.5 -right-0.5'} w-5 h-5 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center`}>
                      {criticalCount}
                    </span>
                  )}
                  {item.id === 'control' && pendingCount > 0 && (
                    <span className={`absolute ${sidebarExpanded ? 'right-3' : '-top-0.5 -right-0.5'} w-5 h-5 rounded-full bg-amber-500 text-[9px] font-bold text-white flex items-center justify-center`}>
                      {pendingCount}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="px-3 py-4 border-t border-slate-100">
          {/* Collapse toggle */}
          <button
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors mb-3"
          >
            {sidebarExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            <AnimatePresence>
              {sidebarExpanded && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="text-xs font-medium overflow-hidden whitespace-nowrap"
                >
                  Collapse
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* Operator profile */}
          <div className={`flex items-center gap-3 ${sidebarExpanded ? 'px-2' : 'justify-center'}`}>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-[11px] font-bold text-white">OP</span>
            </div>
            <AnimatePresence>
              {sidebarExpanded && (
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className="flex flex-col min-w-0"
                >
                  <span className="text-xs font-semibold text-slate-700 truncate">Operator</span>
                  <span className="text-[10px] text-slate-400">Terminal 3</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>

      {/* ===== MAIN CONTENT ===== */}
      <main
        className="flex-1 flex flex-col min-h-screen"
        style={{
          marginLeft: sidebarExpanded ? 256 : 88,
          transition: `margin-left ${DURATION.normal}s cubic-bezier(0.16, 1, 0.3, 1)`,
          position: 'relative',
          zIndex: 100,
        }}
      >
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-14 flex items-center justify-between px-6 bg-white/80 backdrop-blur-xl border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono font-semibold text-emerald-600">LIVE</span>
            </div>
            <div className="h-4 w-px bg-slate-200" />
            <span className="text-xs font-mono text-slate-400 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-100">
              TERMINAL 3
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setSearchOpen(!searchOpen)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Search size={16} />
            </motion.button>

            {/* Notifications */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="relative w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Bell size={16} />
              {criticalCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-[8px] font-bold text-white flex items-center justify-center">
                  {criticalCount}
                </span>
              )}
            </motion.button>

            <div className="h-4 w-px bg-slate-200" />

            {/* Clock */}
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono text-slate-400">
                {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
              <span className="text-[13px] font-mono font-semibold text-slate-700">
                {currentTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content with Route Transitions */}
        <div className="flex-1 overflow-y-auto" style={{ scrollBehavior: 'smooth' }}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route
                path="/"
                element={
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Overview
                      highlightedFilter={highlightedFilter}
                      onFilterChange={handleFilterChange}
                      passengers={passengers}
                      selectedPassenger={selectedPassenger}
                      setSelectedPassenger={setSelectedPassenger}
                      activeCount={activeCount}
                      deviatedCount={deviatedCount}
                      emergencyCount={emergencyCount}
                      avgDeviation={avgDeviation}
                      avgConfidence={avgConfidence}
                      passengerCount={passengers.length}
                      disruptions={disruptions}
                      pendingCount={pendingCount}
                      criticalCount={criticalCount}
                      approveDisruption={approveDisruption}
                      flagDisruption={flagDisruption}
                      resolveDisruption={resolveDisruption}
                      logs={logs}
                    />
                  </motion.div>
                }
              />
              <Route
                path="/monitoring"
                element={
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <LiveMonitoring />
                  </motion.div>
                }
              />
              <Route
                path="/control"
                element={
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <ControlCenter />
                  </motion.div>
                }
              />
              <Route
                path="/alerts"
                element={
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <IntelligenceAlerts />
                  </motion.div>
                }
              />
              <Route
                path="/analytics"
                element={
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <AnalyticsReports />
                  </motion.div>
                }
              />
              <Route
                path="/flow"
                element={
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <PassengerFlow />
                  </motion.div>
                }
              />
              <Route
                path="/map"
                element={
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <MapManagement />
                  </motion.div>
                }
              />
              <Route
                path="/settings"
                element={
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <SettingsPage />
                  </motion.div>
                }
              />
            </Routes>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
