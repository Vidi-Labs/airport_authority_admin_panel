import { lazy, Suspense, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Ban,
  AlertTriangle,
  HardHat,
  ArrowRightLeft,
  Send,
  Pencil,
  MapPin,
  Undo2,
  Redo2,
  Save,
  Trash2,
  Plus,
} from 'lucide-react';

import { DURATION, CURVES } from '@/lib/animations';
import MapLoadingShimmer from '@/components/MapLoadingShimmer';

const AirportMapModule = lazy(() => import('@/components/AirportMap/AirportMapModule').then((m) => ({ default: m.AirportMapModule })));

function MapWidgetShimmer() {
  return (
    <MapLoadingShimmer
      label="Loading control center map"
      sublabel="Preparing editable disruptions, routing overlays and terminal controls…"
    />
  );
}

function DeferredAirportMap() {
  const [mountMap, setMountMap] = useState(false);

  useEffect(() => {
    // Do not build the heavy Three.js scene during the route transition.
    // Show the lightweight shimmer immediately, then mount the map after the
    // slow ease-in has visibly completed.
    const delayId = window.setTimeout(() => {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => setMountMap(true), { timeout: 900 });
      } else {
        setMountMap(true);
      }
    }, 720);

    return () => window.clearTimeout(delayId);
  }, []);

  if (!mountMap) return <MapWidgetShimmer />;

  return (
    <Suspense fallback={<MapWidgetShimmer />}>
      <AirportMapModule />
    </Suspense>
  );
}

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

const TOOLS = [
  { id: 'blockage', label: 'Blockage', icon: Ban, color: 'text-red-500', bg: 'bg-red-50' },
  { id: 'restricted', label: 'Restricted Zone', icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50' },
  { id: 'renovation', label: 'Renovation', icon: HardHat, color: 'text-orange-500', bg: 'bg-orange-50' },
  { id: 'gate_change', label: 'Gate Change', icon: ArrowRightLeft, color: 'text-blue-500', bg: 'bg-blue-50' },
];

const EXISTING_ITEMS = [
  { id: 1, type: 'blockage', name: 'Corridor B Junction', status: 'active', affected: 4 },
  { id: 2, type: 'renovation', name: 'Seating Area C', status: 'active', affected: 8 },
  { id: 3, type: 'restricted', name: 'Staff Only Zone D', status: 'active', affected: 0 },
  { id: 4, type: 'gate_change', name: 'Gate B12 -> B15', status: 'pending', affected: 12 },
];

export default function ControlCenter() {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [pushTitle, setPushTitle] = useState('');
  const [pushMessage, setPushMessage] = useState('');
  const [pushTarget, setPushTarget] = useState('all');

  return (
    <div className="h-full flex flex-col gap-4 p-4">
      {/* Element 0: Header */}
      <motion.div {...el(0)} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
            <Shield size={18} className="text-blue-500" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-800">Control Center</h1>
            <p className="text-xs text-slate-400">Manage disruptions, blockages, and push updates</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors flex items-center gap-1.5">
            <Undo2 size={12} />
            Undo
          </button>
          <button className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors flex items-center gap-1.5">
            <Redo2 size={12} />
            Redo
          </button>
          <button className="px-3 py-1.5 rounded-lg bg-blue-500 text-xs font-medium text-white hover:bg-blue-600 transition-colors flex items-center gap-1.5">
            <Save size={12} />
            Save Changes
          </button>
        </div>
      </motion.div>

      {/* Element 1: Toolbar */}
      <motion.div {...el(1)}>
        <div className="rounded-xl border border-slate-100 bg-white p-3 flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 mr-2">Tools:</span>
          {TOOLS.map(tool => {
            const Icon = tool.icon;
            const isActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(isActive ? null : tool.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? `${tool.bg} ${tool.color} border border-current/20`
                    : 'bg-slate-50 text-slate-500 border border-transparent hover:bg-slate-100'
                }`}
              >
                <Icon size={14} />
                {tool.label}
              </button>
            );
          })}
          <div className="flex-1" />
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-50 text-slate-500 border border-transparent hover:bg-slate-100 transition-colors text-xs font-medium">
            <Pencil size={12} />
            Path Editor
          </button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Element 2: Map Area — now with live 3D map */}
        <motion.div {...el(2)} className="flex-[3] min-w-0">
          <div className="h-full rounded-xl border border-slate-100 bg-white overflow-hidden relative">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-50">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-slate-400" />
                <span className="text-xs font-medium text-slate-600">
                  Live Terminal Map {activeTool && `- ${TOOLS.find(t => t.id === activeTool)?.label} Tool Active`}
                </span>
              </div>
              {activeTool && (
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-600 border border-blue-100">
                  Click map to place
                </span>
              )}
            </div>

            {/* 3D Airport Map */}
            <div className="absolute inset-0 top-[45px]">
              <DeferredAirportMap />
            </div>
          </div>
        </motion.div>

        {/* Right Panel */}
        <div className="flex-[1] min-w-[280px] flex flex-col gap-4">
          {/* Element 3: Push Update */}
          <motion.div {...el(3)}>
            <div className="rounded-xl border border-slate-100 bg-white p-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <Send size={14} className="text-blue-500" />
                Push Update to Users
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Title</label>
                  <input
                    type="text"
                    value={pushTitle}
                    onChange={e => setPushTitle(e.target.value)}
                    placeholder="e.g. Corridor B Temporarily Closed"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-100 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Message</label>
                  <textarea
                    value={pushMessage}
                    onChange={e => setPushMessage(e.target.value)}
                    placeholder="Describe the change and affected areas..."
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-100 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-colors resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Target</label>
                  <select
                    value={pushTarget}
                    onChange={e => setPushTarget(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-100 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-colors"
                  >
                    <option value="all">All Active Users</option>
                    <option value="affected">Affected Users Only</option>
                    <option value="concourse_b">Concourse B Users</option>
                    <option value="concourse_c">Concourse C Users</option>
                  </select>
                </div>
                <button className="w-full py-2.5 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
                  <Send size={14} />
                  Push Notification
                </button>
              </div>
            </div>
          </motion.div>

          {/* Element 4: Active Disruptions */}
          <motion.div {...el(4)}>
            <div className="h-full rounded-xl border border-slate-100 bg-white p-4 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-700">Active Disruptions</h3>
                <button className="w-6 h-6 rounded-md bg-blue-50 text-blue-500 flex items-center justify-center hover:bg-blue-100 transition-colors">
                  <Plus size={12} />
                </button>
              </div>
              <div className="flex-1 space-y-2 overflow-auto">
                {EXISTING_ITEMS.map(item => {
                  const tool = TOOLS.find(t => t.id === item.type);
                  if (!tool) return null;
                  const Icon = tool.icon;
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100 group hover:border-slate-200 transition-colors"
                    >
                      <div className={`w-8 h-8 rounded-lg ${tool.bg} flex items-center justify-center`}>
                        <Icon size={14} className={tool.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-700 truncate">{item.name}</p>
                        <p className="text-[10px] text-slate-400">
                          {item.affected} affected &middot; {item.status}
                        </p>
                      </div>
                      <button className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
