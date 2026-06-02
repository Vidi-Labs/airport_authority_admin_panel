import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Map,
  Pencil,
  Square,
  Circle,
  Type,
  Move,
  Trash2,
  Plus,
  Save,
  GitBranch,
  FileText,
  RotateCcw,
} from 'lucide-react';
import { AirportMapModule } from '@/components/AirportMap/AirportMapModule';

const EDITOR_TOOLS = [
  { id: 'select', label: 'Select', icon: Move },
  { id: 'node', label: 'Add Node', icon: Circle },
  { id: 'path', label: 'Draw Path', icon: Pencil },
  { id: 'zone', label: 'Zone', icon: Square },
  { id: 'label', label: 'Label', icon: Type },
  { id: 'delete', label: 'Delete', icon: Trash2 },
];

const VERSION_HISTORY = [
  { id: 'v3.2', version: 'v3.2', time: '10 min ago', author: 'AI System', changes: 'Auto-detected sign change at WP7', status: 'current' },
  { id: 'v3.1', version: 'v3.1', time: '2 hours ago', author: 'Admin', changes: 'Added temporary blockage at Concourse B', status: 'applied' },
  { id: 'v3.0', version: 'v3.0', time: '5 hours ago', author: 'AI System', changes: 'Gate B12 reassignment integrated', status: 'applied' },
  { id: 'v2.9', version: 'v2.9', time: '1 day ago', author: 'Admin', changes: 'Renovation zone marked at Seating C', status: 'applied' },
  { id: 'v2.8', version: 'v2.8', time: '2 days ago', author: 'AI System', changes: 'New retail unit mapped near C32', status: 'applied' },
  { id: 'v2.7', version: 'v2.7', time: '3 days ago', author: 'Admin', changes: 'Emergency exit route updated', status: 'applied' },
];

const UPDATE_LOGS = [
  { id: 1, time: '11:42:15', action: 'Node added', detail: 'WP-28 at (820, 410)', type: 'create' },
  { id: 2, time: '11:40:03', action: 'Path modified', detail: 'WP-12 to WP-15 rerouted', type: 'edit' },
  { id: 3, time: '11:38:22', action: 'Zone created', detail: 'Restricted area near Gate C45', type: 'create' },
  { id: 4, time: '11:35:10', action: 'Label updated', detail: 'Waypoint 7 sign text corrected', type: 'edit' },
  { id: 5, time: '11:32:45', action: 'Node removed', detail: 'Temporary marker WP-26 deleted', type: 'delete' },
];

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

export default function MapManagement() {
  const [activeTool, setActiveTool] = useState('select');
  const [selectedVersion, setSelectedVersion] = useState('v3.2');

  return (
    <div className="h-full flex flex-col gap-4 p-4">
      {/* Element 0: Header */}
      <motion.div {...el(0)} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
            <Map size={18} className="text-blue-500" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-800">Map Management</h1>
            <p className="text-xs text-slate-400">3D map editor and infrastructure version control</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors flex items-center gap-1.5">
            <RotateCcw size={12} />
            Revert
          </button>
          <button className="px-3 py-1.5 rounded-lg bg-blue-500 text-xs font-medium text-white hover:bg-blue-600 transition-colors flex items-center gap-1.5">
            <Save size={12} />
            Publish
          </button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Element 1: Tools Sidebar */}
        <motion.div {...el(1)} className="w-14 flex flex-col items-center gap-1.5 pt-2">
          {EDITOR_TOOLS.map(tool => {
            const Icon = tool.icon;
            const isActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                title={tool.label}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 border border-blue-100'
                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                }`}
              >
                <Icon size={16} />
              </button>
            );
          })}
          <div className="w-8 h-px bg-slate-100 my-1" />
          <button
            title="Add new element"
            className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
          >
            <Plus size={16} />
          </button>
        </motion.div>

        {/* Element 2: Map Editor */}
        <motion.div {...el(2)} className="flex-[3] min-w-0">
          <div className="h-full rounded-xl border border-slate-100 bg-white overflow-hidden relative">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-50">
              <div className="flex items-center gap-2">
                <Pencil size={14} className="text-slate-400" />
                <span className="text-xs font-medium text-slate-600">
                  Map Editor - {EDITOR_TOOLS.find(t => t.id === activeTool)?.label} Tool
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-400">Zoom: 100%</span>
                <span className="text-[10px] font-mono text-slate-400">|</span>
                <span className="text-[10px] font-mono text-slate-400">Nodes: 48</span>
                <span className="text-[10px] font-mono text-slate-400">|</span>
                <span className="text-[10px] font-mono text-slate-400">Paths: 32</span>
              </div>
            </div>

            {/* 3D Airport Map */}
            <div className="absolute inset-0 top-[45px]">
              <AirportMapModule />
            </div>
          </div>
        </motion.div>

        {/* Element 3: Right Panel */}
        <motion.div {...el(3)} className="flex-[1] min-w-[280px] flex flex-col gap-4">
          {/* Version History */}
          <div className="h-full rounded-xl border border-slate-100 bg-white p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <GitBranch size={14} className="text-blue-500" />
                Version History
              </h3>
            </div>
            <div className="flex-1 space-y-2 overflow-auto">
              {VERSION_HISTORY.map((v, i) => (
                <motion.div
                  key={v.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 3 * 0.22 + i * 0.05 }}
                >
                  <button
                    onClick={() => setSelectedVersion(v.id)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      selectedVersion === v.id
                        ? 'bg-blue-50 border border-blue-100'
                        : 'bg-slate-50 border border-transparent hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-700">{v.version}</span>
                        {v.status === 'current' && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-emerald-50 text-emerald-600 border border-emerald-100">
                            current
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">{v.time}</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-0.5">{v.changes}</p>
                    <p className="text-[10px] text-slate-400">by {v.author}</p>
                  </button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Update Logs */}
          <div className="rounded-xl border border-slate-100 bg-white p-4">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-3">
              <FileText size={14} className="text-slate-400" />
              Update Logs
            </h3>
            <div className="space-y-2 max-h-[200px] overflow-auto">
              {UPDATE_LOGS.map((log, i) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 3 * 0.22 + 0.3 + i * 0.05 }}
                  className="flex items-start gap-2 py-1.5"
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                      log.type === 'create'
                        ? 'bg-emerald-400'
                        : log.type === 'edit'
                        ? 'bg-blue-400'
                        : 'bg-red-400'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-400">{log.time}</span>
                      <span className="text-xs font-medium text-slate-600">{log.action}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">{log.detail}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
