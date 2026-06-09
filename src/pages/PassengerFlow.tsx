
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CURVES, DURATION } from '@/lib/animations';
import {
  Search, Plus, Trash2, Mail, Shield, CheckCircle2, XCircle,
  Users, UserCheck, Crown, Clock, Activity, MapPin,
  BarChart3, TrendingUp, Eye, Pencil, X, Check
} from 'lucide-react';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Operator' | 'Viewer' | 'Manager';
  status: 'Active' | 'Inactive';
  lastLogin: string;
  department: string;
  avatar: string;
};

const INITIAL_USERS: User[] = [
  { id: '1', name: 'Alice Smith', email: 'alice.smith@airport.com', role: 'Admin', status: 'Active', lastLogin: '2026-06-05 08:24', department: 'Operations', avatar: 'AS' },
  { id: '2', name: 'Bob Johnson', email: 'bob.j@airport.com', role: 'Operator', status: 'Active', lastLogin: '2026-06-05 09:12', department: 'Gate Control', avatar: 'BJ' },
  { id: '3', name: 'Charlie Davis', email: 'cdavis@airport.com', role: 'Viewer', status: 'Inactive', lastLogin: '2026-06-01 14:33', department: 'Security', avatar: 'CD' },
  { id: '4', name: 'Diana Prince', email: 'diana.p@airport.com', role: 'Manager', status: 'Active', lastLogin: '2026-06-04 11:45', department: 'Terminal Mgmt', avatar: 'DP' },
  { id: '5', name: 'Eva Martinez', email: 'eva.m@airport.com', role: 'Operator', status: 'Active', lastLogin: '2026-06-05 07:58', department: 'Passenger Services', avatar: 'EM' },
  { id: '6', name: 'Frank Chen', email: 'frank.c@airport.com', role: 'Admin', status: 'Active', lastLogin: '2026-06-05 06:30', department: 'IT Infrastructure', avatar: 'FC' },
  { id: '7', name: 'Grace Kim', email: 'grace.k@airport.com', role: 'Viewer', status: 'Active', lastLogin: '2026-06-04 16:20', department: 'Analytics', avatar: 'GK' },
  { id: '8', name: 'Henry Wilson', email: 'henry.w@airport.com', role: 'Operator', status: 'Inactive', lastLogin: '2026-05-28 09:15', department: 'Maintenance', avatar: 'HW' },
];

const ROLE_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  Admin:    { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  Operator: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  Viewer:   { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
  Manager:  { bg: 'bg-violet-50', text: 'text-violet-700', dot: 'bg-violet-500' },
};

const ACTIVITY_LOG = [
  { id: 1, user: 'Alice Smith', action: 'Updated gate G5 capacity', time: '2 min ago', icon: 'gate' },
  { id: 2, user: 'Bob Johnson', action: 'Acknowledged disruption #D-42', time: '8 min ago', icon: 'alert' },
  { id: 3, user: 'Frank Chen', action: 'Deployed beacon firmware v3.1', time: '15 min ago', icon: 'system' },
  { id: 4, user: 'Eva Martinez', action: 'Added passenger P-73 to VIP list', time: '22 min ago', icon: 'user' },
  { id: 5, user: 'Diana Prince', action: 'Generated daily analytics report', time: '35 min ago', icon: 'report' },
  { id: 6, user: 'Grace Kim', action: 'Viewed terminal heatmap', time: '41 min ago', icon: 'view' },
  { id: 7, user: 'Alice Smith', action: 'Modified security protocol S-12', time: '1 hr ago', icon: 'security' },
  { id: 8, user: 'Bob Johnson', action: 'Opened gate G3 for boarding', time: '1 hr ago', icon: 'gate' },
];

function el(index: number) {
  const delay = index * DURATION.stagger;
  return {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: DURATION.normal, ease: CURVES.easeOutSmooth as [number, number, number, number] },
  };
}

function MiniAirportMap() {
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl overflow-hidden border border-slate-200/60">
      <svg viewBox="0 0 500 350" className="w-full h-full" style={{ minWidth: 200 }}>
        {/* Background */}
        <rect width="500" height="350" fill="#f1f5f9" />

        {/* Tarmac */}
        <rect x="20" y="280" width="460" height="60" rx="4" fill="#d1d5db" opacity="0.5" />

        {/* Main terminal pentagon */}
        <polygon
          points="100,230 400,230 380,140 250,55 120,140"
          fill="#e0d5f0" stroke="#8274a8" strokeWidth="1.5" opacity="0.85"
        />

        {/* Gate zone */}
        <rect x="100" y="230" width="300" height="50" rx="3" fill="#c8e6c0" stroke="#5f8a53" strokeWidth="1" opacity="0.8" />

        {/* Gates row 1 */}
        {[0,1,2,3,4].map(i => (
          <rect key={`g1-${i}`} x={110 + i * 58} y={234} width={48} height={18} rx="2" fill="#e8e4d8" stroke="#7e9070" strokeWidth="0.8" />
        ))}
        {/* Gates row 2 */}
        {[0,1,2,3,4].map(i => (
          <rect key={`g2-${i}`} x={110 + i * 58} y={256} width={48} height={18} rx="2" fill="#e8e4d8" stroke="#7e9070" strokeWidth="0.8" />
        ))}

        {/* Left wing */}
        <rect x="10" y="195" width="100" height="35" rx="3" fill="#d4cec1" stroke="#8b8173" strokeWidth="1" opacity="0.8" />

        {/* Right wing */}
        <rect x="390" y="195" width="100" height="35" rx="3" fill="#d4cec1" stroke="#8b8173" strokeWidth="1" opacity="0.8" />

        {/* Jetbridge spine — long vertical pipe */}
        <rect x="242" y="5" width="16" height="120" rx="2" fill="#cfd8dc" stroke="#6f8794" strokeWidth="0.8" opacity="0.8" />

        {/* Horizontal connector */}
        <rect x="258" y="48" width="110" height="14" rx="2" fill="#cfe5ee" stroke="#668797" strokeWidth="0.8" opacity="0.8" />

        {/* Remote gate building */}
        <rect x="368" y="28" width="55" height="55" rx="3" fill="#e2ddd2" stroke="#83786b" strokeWidth="0.8" opacity="0.8" />

        {/* BLE beacons */}
        {[
          [245, 30], [255, 30], [245, 50], [255, 50],
          [310, 31], [350, 31],
          [390, 25], [440, 25],
          [200, 140], [250, 100], [300, 140],
          [180, 200], [250, 180], [320, 200],
          [130, 245], [250, 245], [370, 245],
          [60, 212], [140, 212],
          [420, 212], [460, 212],
        ].map(([x, y], i) => (
          <circle key={`b-${i}`} cx={x} cy={y} r="3" fill="#2a2880" opacity="0.7" />
        ))}

        {/* Gate labels */}
        <text x="250" y="148" textAnchor="middle" fontSize="8" fill="#3a3860" fontWeight="600">Main Terminal</text>
        <text x="250" y="248" textAnchor="middle" fontSize="7" fill="#5f8a53" fontWeight="500">GATES</text>
      </svg>

      {/* Overlay label */}
      <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg px-2.5 py-1 border border-slate-200/60 shadow-sm">
        <div className="flex items-center gap-1.5">
          <MapPin size={10} className="text-blue-500" />
          <span className="text-[10px] font-semibold text-slate-600">Terminal Overview</span>
        </div>
      </div>
    </div>
  );
}

export default function UserManagement() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'Admin' | 'Operator' | 'Viewer'>('Operator');
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<'Admin' | 'Operator' | 'Viewer'>('Operator');

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase()) ||
    user.department.toLowerCase().includes(search.toLowerCase())
  );

  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter(u => u.status === 'Active').length,
    admins: users.filter(u => u.role === 'Admin').length,
    recentLogins: users.filter(u => {
      const d = new Date(u.lastLogin);
      const now = new Date('2026-06-05T12:00:00');
      return (now.getTime() - d.getTime()) < 86400000;
    }).length,
  }), [users]);

  const roleDistribution = useMemo(() => {
    const dist: Record<string, number> = {};
    users.forEach(u => { dist[u.role] = (dist[u.role] || 0) + 1; });
    return dist;
  }, [users]);

  const handleAddUser = () => {
    if (!newName.trim() || !newEmail.trim()) return;
    const newUser: User = {
      id: String(Date.now()),
      name: newName,
      email: newEmail,
      role: newRole,
      status: 'Active',
      lastLogin: 'Never',
      department: 'Unassigned',
      avatar: newName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
    };
    setUsers([...users, newUser]);
    setNewName(''); setNewEmail(''); setNewRole('Operator');
    setShowAddForm(false);
  };

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
    setDeleteConfirm(null);
  };

  const handleToggleStatus = (id: string) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u));
  };

  const startEdit = (user: User) => {
    setEditingId(user.id);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role as 'Admin' | 'Operator' | 'Viewer');
  };

  const saveEdit = () => {
    if (!editingId) return;
    setUsers(users.map(u => u.id === editingId ? { ...u, name: editName, email: editEmail, role: editRole } : u));
    setEditingId(null);
  };

  return (
    <div className="w-full flex flex-col p-4 max-w-[1400px] mx-auto gap-4 pb-20">
      {/* Header */}
      <motion.div {...el(0)} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">User Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage platform access, roles, and permissions</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/20"
        >
          <Plus size={15} />
          Add User
        </motion.button>
      </motion.div>

      {/* Add User Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 rounded-xl border border-blue-100 bg-blue-50/50 flex items-end gap-3">
              <div className="flex-1 grid grid-cols-4 gap-2">
                <input
                  placeholder="Full name"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                />
                <input
                  placeholder="Email"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                />
                <select
                  value={newRole}
                  onChange={e => setNewRole(e.target.value as 'Admin' | 'Operator' | 'Viewer')}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="Admin">Admin</option>
                  <option value="Operator">Operator</option>
                  <option value="Viewer">Viewer</option>
                </select>
                <div className="flex gap-1.5">
                  <button
                    onClick={handleAddUser}
                    disabled={!newName.trim() || !newEmail.trim()}
                    className="px-3 py-1.5 rounded-lg bg-blue-500 text-white text-xs font-medium hover:bg-blue-600 disabled:opacity-40 transition-colors flex items-center gap-1"
                  >
                    <Check size={12} /> Add
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Cards Row */}
      <motion.div {...el(1)} className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Users', value: stats.total, icon: Users, color: 'blue', trend: '+2 this month' },
          { label: 'Active Now', value: stats.active, icon: UserCheck, color: 'emerald', trend: `${Math.round(stats.active / stats.total * 100)}% of total` },
          { label: 'Admins', value: stats.admins, icon: Crown, color: 'violet', trend: 'Full access' },
          { label: 'Recent Logins', value: stats.recentLogins, icon: Clock, color: 'amber', trend: 'Last 24h' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.06, duration: 0.5, ease: CURVES.easeOutSmooth as [number, number, number, number] }}
            className="bg-white rounded-xl border border-slate-100 p-3.5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`w-8 h-8 rounded-lg bg-${stat.color}-50 flex items-center justify-center`}>
                <stat.icon size={16} className={`text-${stat.color}-600`} />
              </div>
              <span className="text-[10px] text-slate-400 font-medium">{stat.trend}</span>
            </div>
            <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Grid: Table + Sidebar */}
      <div className="grid grid-cols-[1fr_280px] gap-4">
        {/* Left: User Table */}
        <motion.div {...el(2)} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center gap-3 p-3 border-b border-slate-100">
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <BarChart3 size={12} />
              <span>{filteredUsers.length} users</span>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/60 border-b border-slate-100">
                  <th className="py-2 px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">User</th>
                  <th className="py-2 px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                  <th className="py-2 px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Department</th>
                  <th className="py-2 px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="py-2 px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Last Login</th>
                  <th className="py-2 px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredUsers.map((user) => {
                  const colors = ROLE_COLORS[user.role];
                  const isEditing = editingId === user.id;
                  return (
                    <tr key={user.id} className="hover:bg-slate-50/40 transition-colors group">
                      <td className="py-2 px-3">
                        {isEditing ? (
                          <input
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            className="w-full px-2 py-1 rounded border border-blue-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                          />
                        ) : (
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 flex items-center justify-center font-bold text-[10px] shrink-0">
                              {user.avatar}
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-slate-800 truncate">{user.name}</div>
                              <div className="text-[10px] text-slate-400 flex items-center gap-1 truncate">
                                <Mail size={9} /> {user.email}
                              </div>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        {isEditing ? (
                          <select
                            value={editRole}
                            onChange={e => setEditRole(e.target.value as 'Admin' | 'Operator' | 'Viewer')}
                            className="px-2 py-1 rounded border border-blue-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                          >
                            <option value="Admin">Admin</option>
                            <option value="Operator">Operator</option>
                            <option value="Viewer">Viewer</option>
                          </select>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                            <span className={`text-xs font-medium ${colors.text}`}>{user.role}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-2 px-3 text-xs text-slate-500">{user.department}</td>
                      <td className="py-2 px-3">
                        <button
                          onClick={() => handleToggleStatus(user.id)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors ${
                            user.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          {user.status === 'Active' ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                          {user.status}
                        </button>
                      </td>
                      <td className="py-2 px-3 text-[11px] text-slate-400 font-mono">{user.lastLogin}</td>
                      <td className="py-2 px-3">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {isEditing ? (
                            <>
                              <button onClick={saveEdit} className="p-1 text-emerald-500 hover:bg-emerald-50 rounded transition-colors" title="Save">
                                <Check size={13} />
                              </button>
                              <button onClick={() => setEditingId(null)} className="p-1 text-slate-400 hover:bg-slate-100 rounded transition-colors" title="Cancel">
                                <X size={13} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => startEdit(user)} className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Edit">
                                <Pencil size={13} />
                              </button>
                              {deleteConfirm === user.id ? (
                                <div className="flex items-center gap-0.5">
                                  <button onClick={() => handleDeleteUser(user.id)} className="p-1 text-red-500 bg-red-50 rounded transition-colors">
                                    <Check size={13} />
                                  </button>
                                  <button onClick={() => setDeleteConfirm(null)} className="p-1 text-slate-400 bg-slate-100 rounded transition-colors">
                                    <X size={13} />
                                  </button>
                                </div>
                              ) : (
                                <button onClick={() => setDeleteConfirm(user.id)} className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete">
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400 text-sm">
                      No users found matching "{search}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Right Sidebar: Role Distribution + Activity + Mini Map */}
        <motion.div {...el(3)} className="flex flex-col gap-3">
          {/* Role Distribution */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-3.5">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 size={14} className="text-slate-500" />
              <h3 className="text-xs font-semibold text-slate-700">Role Distribution</h3>
            </div>
            <div className="space-y-2.5">
              {Object.entries(roleDistribution).map(([role, count]) => {
                const colors = ROLE_COLORS[role];
                const pct = Math.round((count / users.length) * 100);
                return (
                  <div key={role}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
                        <span className="text-[11px] font-medium text-slate-600">{role}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{count} ({pct}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.5, duration: 0.8, ease: CURVES.easeOutSmooth as [number, number, number, number] }}
                        className={`h-full rounded-full ${colors.dot}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-3.5 flex-1 min-h-0">
            <div className="flex items-center gap-2 mb-3">
              <Activity size={14} className="text-slate-500" />
              <h3 className="text-xs font-semibold text-slate-700">Recent Activity</h3>
            </div>
            <div className="space-y-2 overflow-y-auto max-h-[200px]">
              {ACTIVITY_LOG.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.04, duration: 0.4 }}
                  className="flex items-start gap-2 py-1.5 border-b border-slate-50 last:border-0"
                >
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                    item.icon === 'gate' ? 'bg-blue-50 text-blue-500' :
                    item.icon === 'alert' ? 'bg-amber-50 text-amber-500' :
                    item.icon === 'system' ? 'bg-violet-50 text-violet-500' :
                    item.icon === 'user' ? 'bg-emerald-50 text-emerald-500' :
                    item.icon === 'report' ? 'bg-cyan-50 text-cyan-500' :
                    item.icon === 'view' ? 'bg-slate-100 text-slate-500' :
                    'bg-rose-50 text-rose-500'
                  }`}>
                    {item.icon === 'gate' ? <MapPin size={10} /> :
                     item.icon === 'alert' ? <XCircle size={10} /> :
                     item.icon === 'system' ? <TrendingUp size={10} /> :
                     item.icon === 'user' ? <UserCheck size={10} /> :
                     item.icon === 'report' ? <BarChart3 size={10} /> :
                     item.icon === 'view' ? <Eye size={10} /> :
                     <Shield size={10} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-slate-700 leading-tight">
                      <span className="font-medium">{item.user}</span>{' '}
                      <span className="text-slate-500">{item.action}</span>
                    </p>
                    <p className="text-[9px] text-slate-400 mt-0.5">{item.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Mini Airport Map */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-2 h-[180px]">
            <MiniAirportMap />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
