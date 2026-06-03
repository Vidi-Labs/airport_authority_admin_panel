import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CURVES, DURATION } from '@/lib/animations';
import {
  Settings as SettingsIcon, Bell, Users, Globe, Server, Save, Plus,
  Trash2, Pencil, Check, Info, X, AlertTriangle,
} from 'lucide-react';

const SECTIONS = [
  { id: 'general', label: 'General', icon: SettingsIcon },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'language', label: 'Language', icon: Globe },
  { id: 'system', label: 'System', icon: Server },
];

const LANGUAGES = [
  { code: 'en', label: 'English', region: 'United States' },
  { code: 'ar', label: 'Arabic', region: 'UAE' },
  { code: 'zh', label: 'Chinese', region: 'Simplified' },
  { code: 'fr', label: 'French', region: 'France' },
  { code: 'de', label: 'German', region: 'Germany' },
  { code: 'es', label: 'Spanish', region: 'Spain' },
];

const SYSTEM_INFO = [
  { label: 'Version', value: '3.2.1' },
  { label: 'Last Update', value: '2026-05-18' },
  { label: 'API Status', value: 'Healthy' },
  { label: 'Database', value: 'Connected' },
  { label: 'ML Model', value: 'v2.8.4' },
  { label: 'Uptime', value: '99.97%' },
];

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

function ToggleSwitch({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-10 h-[22px] rounded-full transition-colors ${enabled ? 'bg-blue-500' : 'bg-slate-200'}`}
    >
      <motion.div
        className="absolute top-[2px] left-[2px] w-[18px] h-[18px] rounded-full bg-white shadow-sm"
        animate={{ x: enabled ? 18 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  );
}

function el(index: number) {
  const delay = index * DURATION.stagger;
  return {
    initial: { opacity: 0, y: 20, scale: 0.97 },
    animate: {
      opacity: 1, y: 0, scale: [0.97, 1.03, 0.99, 1],
      transition: {
        delay, duration: DURATION.page, ease: CURVES.easeOutSmooth,
        opacity: { delay, duration: 1.8, ease: 'linear' },
        scale: { delay, duration: DURATION.page, times: [0, 0.45, 0.7, 1], ease: CURVES.easeOutSmooth },
      },
    },
  };
}

export default function Settings() {
  const [activeSection, setActiveSection] = useState('general');
  const [notifications, setNotifications] = useState({
    disruptions: true, emergencies: true, aiAlerts: true,
    systemUpdates: false, emailDigest: true, pushNotifications: true,
  });
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [terminalName, setTerminalName] = useState('Terminal 3');
  const [autoReroute, setAutoReroute] = useState(true);
  const [confidenceThreshold, setConfidenceThreshold] = useState(80);
  const [mapUpdateInterval, setMapUpdateInterval] = useState('5');
  const [saved, setSaved] = useState(false);

  // User management
  const [users, setUsers] = useState<User[]>([
    { id: 1, name: 'Admin User', email: 'admin@airport.io', role: 'admin', status: 'active' },
    { id: 2, name: 'Sarah Chen', email: 'sarah.c@airport.io', role: 'operator', status: 'active' },
    { id: 3, name: 'James Wilson', email: 'james.w@airport.io', role: 'operator', status: 'active' },
    { id: 4, name: 'Maria Lopez', email: 'maria.l@airport.io', role: 'viewer', status: 'inactive' },
    { id: 5, name: 'Tom Baker', email: 'tom.b@airport.io', role: 'operator', status: 'active' },
  ]);
  const [editingUser, setEditingUser] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('');
  const [showAddUser, setShowAddUser] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('operator');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // System actions
  const [cacheCleared, setCacheCleared] = useState(false);
  const [indexRebuilt, setIndexRebuilt] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);

  const roleColors: Record<string, { bg: string; text: string }> = {
    admin: { bg: 'bg-blue-50', text: 'text-blue-600' },
    operator: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
    viewer: { bg: 'bg-slate-50', text: 'text-slate-500' },
  };

  const handleSave = useCallback(() => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, []);

  const handleAddUser = useCallback(() => {
    if (!newName.trim() || !newEmail.trim()) return;
    const newUser: User = {
      id: Date.now(),
      name: newName.trim(),
      email: newEmail.trim(),
      role: newRole,
      status: 'active',
    };
    setUsers(prev => [...prev, newUser]);
    setNewName('');
    setNewEmail('');
    setNewRole('operator');
    setShowAddUser(false);
  }, [newName, newEmail, newRole]);

  const handleDeleteUser = useCallback((id: number) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    setDeleteConfirm(null);
  }, []);

  const handleEditUser = useCallback((user: User) => {
    setEditingUser(user.id);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (editingUser === null) return;
    setUsers(prev => prev.map(u =>
      u.id === editingUser ? { ...u, name: editName, email: editEmail, role: editRole } : u
    ));
    setEditingUser(null);
  }, [editingUser, editName, editEmail, editRole]);

  const handleToggleUserStatus = useCallback((id: number) => {
    setUsers(prev => prev.map(u =>
      u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u
    ));
  }, []);

  const handleClearCache = useCallback(() => {
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 3000);
  }, []);

  const handleRebuildIndex = useCallback(() => {
    setIndexRebuilt(true);
    setTimeout(() => setIndexRebuilt(false), 3000);
  }, []);

  const handleResetAll = useCallback(() => {
    setResetConfirm(false);
    setTerminalName('Terminal 3');
    setAutoReroute(true);
    setConfidenceThreshold(80);
    setSelectedLanguage('en');
    setMapUpdateInterval('5');
    setNotifications({
      disruptions: true, emergencies: true, aiAlerts: true,
      systemUpdates: false, emailDigest: true, pushNotifications: true,
    });
  }, []);

  return (
    <div className="h-full flex flex-col gap-4 p-4">
      {/* Element 0: Header */}
      <motion.div {...el(0)} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
            <SettingsIcon size={18} className="text-blue-500" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-800">Settings</h1>
            <p className="text-xs text-slate-400">System preferences and user management</p>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleSave}
          className={`px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
            saved
              ? 'bg-emerald-500 text-white'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {saved ? <Check size={12} /> : <Save size={12} />}
          {saved ? 'Saved!' : 'Save Changes'}
        </motion.button>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Element 1: Section Nav */}
        <motion.div {...el(1)} className="w-48 flex-shrink-0">
          <div className="h-full rounded-xl border border-slate-100 bg-white p-3 flex flex-col gap-1">
            {SECTIONS.map(section => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <motion.button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  whileTap={{ scale: 0.97 }}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 border border-blue-100'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 border border-transparent'
                  }`}
                >
                  <Icon size={15} />
                  {section.label}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Element 2: Content Area */}
        <motion.div {...el(2)} className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="rounded-xl border border-slate-100 bg-white p-6"
            >
              {/* General */}
              {activeSection === 'general' && (
                <div className="space-y-6">
                  <h2 className="text-base font-semibold text-slate-700">General Settings</h2>
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1.5 block">Terminal Name</label>
                    <input
                      type="text"
                      value={terminalName}
                      onChange={e => setTerminalName(e.target.value)}
                      className="w-full max-w-sm px-3 py-2 rounded-lg bg-slate-50 border border-slate-100 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-colors"
                    />
                  </div>
                  <div className="flex items-center justify-between max-w-sm">
                    <div>
                      <p className="text-sm font-medium text-slate-700">Auto-Rerouting</p>
                      <p className="text-xs text-slate-400">Automatically reroute passengers around blockages</p>
                    </div>
                    <ToggleSwitch enabled={autoReroute} onChange={setAutoReroute} />
                  </div>
                  <div className="max-w-sm">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-slate-500">AI Confidence Threshold</label>
                      <span className="text-xs font-mono text-blue-600">{confidenceThreshold}%</span>
                    </div>
                    <input
                      type="range"
                      min={50}
                      max={99}
                      value={confidenceThreshold}
                      onChange={e => setConfidenceThreshold(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-blue-500"
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-[10px] text-slate-300">50%</span>
                      <span className="text-[10px] text-slate-300">99%</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1.5 block">Map Update Interval</label>
                    <select
                      value={mapUpdateInterval}
                      onChange={e => setMapUpdateInterval(e.target.value)}
                      className="w-full max-w-sm px-3 py-2 rounded-lg bg-slate-50 border border-slate-100 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-colors"
                    >
                      <option value="5">Every 5 seconds</option>
                      <option value="10">Every 10 seconds</option>
                      <option value="30">Every 30 seconds</option>
                      <option value="60">Every minute</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Notifications */}
              {activeSection === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-base font-semibold text-slate-700">Notification Preferences</h2>
                  {[
                    { key: 'disruptions' as const, label: 'Disruption Alerts', desc: 'Get notified when new disruptions are detected' },
                    { key: 'emergencies' as const, label: 'Emergency Alerts', desc: 'Critical emergency notifications (cannot be disabled)' },
                    { key: 'aiAlerts' as const, label: 'AI Intelligence Alerts', desc: 'AI-detected changes and anomalies' },
                    { key: 'systemUpdates' as const, label: 'System Updates', desc: 'Software updates and maintenance windows' },
                    { key: 'emailDigest' as const, label: 'Daily Email Digest', desc: 'Summary of daily operations sent to your email' },
                    { key: 'pushNotifications' as const, label: 'Push Notifications', desc: 'Browser push notifications for real-time alerts' },
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-slate-700">{item.label}</p>
                        <p className="text-xs text-slate-400">{item.desc}</p>
                      </div>
                      <ToggleSwitch
                        enabled={notifications[item.key]}
                        onChange={v => setNotifications(prev => ({ ...prev, [item.key]: v }))}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Users */}
              {activeSection === 'users' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-slate-700">User Management</h2>
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setShowAddUser(true)}
                      className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-medium hover:bg-blue-100 transition-colors flex items-center gap-1.5 border border-blue-100"
                    >
                      <Plus size={12} />
                      Add User
                    </motion.button>
                  </div>

                  {/* Add User Form */}
                  <AnimatePresence>
                    {showAddUser && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 rounded-lg border border-blue-100 bg-blue-50/50 space-y-3 mb-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-slate-700">Add New User</h3>
                            <button onClick={() => setShowAddUser(false)} className="text-slate-400 hover:text-slate-600">
                              <X size={14} />
                            </button>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <input
                              placeholder="Full name"
                              value={newName}
                              onChange={e => setNewName(e.target.value)}
                              className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                            <input
                              placeholder="Email"
                              value={newEmail}
                              onChange={e => setNewEmail(e.target.value)}
                              className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                            <select
                              value={newRole}
                              onChange={e => setNewRole(e.target.value)}
                              className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            >
                              <option value="admin">Admin</option>
                              <option value="operator">Operator</option>
                              <option value="viewer">Viewer</option>
                            </select>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={handleAddUser}
                              disabled={!newName.trim() || !newEmail.trim()}
                              className="px-4 py-2 rounded-lg bg-blue-500 text-white text-xs font-medium hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                              Add User
                            </button>
                            <button
                              onClick={() => setShowAddUser(false)}
                              className="px-4 py-2 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium hover:bg-slate-200 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* User List */}
                  <div className="space-y-2">
                    {users.map((user, i) => {
                      const colors = roleColors[user.role];
                      const isEditing = editingUser === user.id;
                      return (
                        <motion.div
                          key={user.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="p-3 rounded-lg bg-slate-50 border border-slate-100 group hover:border-slate-200 transition-colors"
                        >
                          {isEditing ? (
                            <div className="space-y-3">
                              <div className="grid grid-cols-3 gap-3">
                                <input
                                  value={editName}
                                  onChange={e => setEditName(e.target.value)}
                                  className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                                <input
                                  value={editEmail}
                                  onChange={e => setEditEmail(e.target.value)}
                                  className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                                <select
                                  value={editRole}
                                  onChange={e => setEditRole(e.target.value)}
                                  className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                >
                                  <option value="admin">Admin</option>
                                  <option value="operator">Operator</option>
                                  <option value="viewer">Viewer</option>
                                </select>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={handleSaveEdit}
                                  className="px-3 py-1.5 rounded-lg bg-blue-500 text-white text-xs font-medium hover:bg-blue-600 transition-colors"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingUser(null)}
                                  className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium hover:bg-slate-200 transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-xs font-bold text-blue-600">
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-700">{user.name}</p>
                                <p className="text-xs text-slate-400">{user.email}</p>
                              </div>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${colors.bg} ${colors.text}`}>
                                {user.role}
                              </span>
                              <button
                                onClick={() => handleToggleUserStatus(user.id)}
                                className={`w-1.5 h-1.5 rounded-full cursor-pointer ${user.status === 'active' ? 'bg-emerald-400' : 'bg-slate-300'}`}
                                title={user.status === 'active' ? 'Click to deactivate' : 'Click to activate'}
                              />
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleEditUser(user)}
                                  className="p-1.5 rounded-md hover:bg-white text-slate-400 hover:text-blue-500 transition-colors"
                                >
                                  <Pencil size={12} />
                                </button>
                                {deleteConfirm === user.id ? (
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => handleDeleteUser(user.id)}
                                      className="p-1.5 rounded-md bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                                    >
                                      <Check size={12} />
                                    </button>
                                    <button
                                      onClick={() => setDeleteConfirm(null)}
                                      className="p-1.5 rounded-md bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                                    >
                                      <X size={12} />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setDeleteConfirm(user.id)}
                                    className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Language */}
              {activeSection === 'language' && (
                <div className="space-y-6">
                  <h2 className="text-base font-semibold text-slate-700">Language & Region</h2>
                  <div className="grid grid-cols-2 gap-3 max-w-lg">
                    {LANGUAGES.map(lang => (
                      <motion.button
                        key={lang.code}
                        onClick={() => setSelectedLanguage(lang.code)}
                        whileTap={{ scale: 0.97 }}
                        className={`flex items-center justify-between p-3 rounded-lg text-left transition-all ${
                          selectedLanguage === lang.code
                            ? 'bg-blue-50 border border-blue-100'
                            : 'bg-slate-50 border border-slate-100 hover:border-slate-200'
                        }`}
                      >
                        <div>
                          <p className={`text-sm font-medium ${selectedLanguage === lang.code ? 'text-blue-700' : 'text-slate-700'}`}>
                            {lang.label}
                          </p>
                          <p className="text-[11px] text-slate-400">{lang.region}</p>
                        </div>
                        {selectedLanguage === lang.code && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center"
                          >
                            <Check size={12} className="text-white" />
                          </motion.div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 border border-blue-100 max-w-lg">
                    <Info size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-blue-600">
                      Changing the language will update all user-facing text including navigation instructions, alerts, and the passenger app.
                    </p>
                  </div>
                </div>
              )}

              {/* System */}
              {activeSection === 'system' && (
                <div className="space-y-6">
                  <h2 className="text-base font-semibold text-slate-700">System Information</h2>
                  <div className="grid grid-cols-2 gap-3 max-w-lg">
                    {SYSTEM_INFO.map(info => (
                      <div key={info.label} className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                        <p className="text-[11px] text-slate-400 mb-0.5">{info.label}</p>
                        <p className="text-sm font-semibold text-slate-700">{info.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="max-w-lg">
                    <h3 className="text-sm font-semibold text-slate-600 mb-3">System Health</h3>
                    <div className="space-y-2">
                      {[
                        { label: 'API Server', status: 'healthy', latency: '12ms' },
                        { label: 'Database', status: 'healthy', latency: '3ms' },
                        { label: 'ML Pipeline', status: 'healthy', latency: '45ms' },
                        { label: 'WebSocket', status: 'healthy', latency: '8ms' },
                        { label: 'BLE Beacons', status: 'degraded', latency: '120ms' },
                      ].map(service => (
                        <div key={service.label} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${service.status === 'healthy' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                            <span className="text-xs font-medium text-slate-600">{service.label}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono text-slate-400">{service.latency}</span>
                            <span className={`text-[10px] font-medium ${service.status === 'healthy' ? 'text-emerald-500' : 'text-amber-500'}`}>
                              {service.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="max-w-lg">
                    <h3 className="text-sm font-semibold text-slate-600 mb-3">Actions</h3>
                    <div className="flex gap-2">
                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={handleClearCache}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                          cacheCleared
                            ? 'bg-emerald-50 border border-emerald-200 text-emerald-600'
                            : 'bg-slate-50 border border-slate-100 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {cacheCleared ? <Check size={12} /> : null}
                        {cacheCleared ? 'Cache Cleared!' : 'Clear Cache'}
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={handleRebuildIndex}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                          indexRebuilt
                            ? 'bg-emerald-50 border border-emerald-200 text-emerald-600'
                            : 'bg-slate-50 border border-slate-100 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {indexRebuilt ? <Check size={12} /> : null}
                        {indexRebuilt ? 'Index Rebuilt!' : 'Rebuild Index'}
                      </motion.button>
                      {resetConfirm ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleResetAll}
                            className="px-3 py-2 rounded-lg bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition-colors flex items-center gap-1.5"
                          >
                            <AlertTriangle size={12} />
                            Confirm Reset
                          </button>
                          <button
                            onClick={() => setResetConfirm(false)}
                            className="px-3 py-2 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium hover:bg-slate-200 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <motion.button
                          whileTap={{ scale: 0.96 }}
                          onClick={() => setResetConfirm(true)}
                          className="px-3 py-2 rounded-lg bg-red-50 border border-red-100 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors"
                        >
                          Reset All Data
                        </motion.button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
