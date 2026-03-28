import React, { useState } from 'react';
import { useStore, PLANS, isAdmin } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, MessageSquare, FileText, Shield, Search, ChevronDown, ChevronUp, Edit3, Check, Crown } from 'lucide-react';
import type { AdminSubTab, User } from '../types';

function UserPlanBadge({ planId }: { planId: string }) {
  const plan = PLANS.find(p => p.id === planId) || PLANS[0];
  const colors: Record<string, string> = {
    dirt: 'bg-amber-900/30 text-amber-400 border-amber-500/20',
    stone: 'bg-gray-700/30 text-gray-300 border-gray-500/20',
    obsidian: 'bg-purple-900/30 text-purple-400 border-purple-500/20',
    bedrock: 'bg-cyan-900/30 text-cyan-400 border-cyan-500/20',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${colors[planId] || colors.dirt}`}>
      {plan.icon} {plan.name}
    </span>
  );
}

function PlanChanger({ user, onChange }: { user: User; onChange: (email: string, plan: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState(user.plan);
  const plan = PLANS.find(p => p.id === user.plan) || PLANS[0];

  if (!editing) {
    return (
      <button
        onClick={() => { setSelected(user.plan); setEditing(true); }}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300 hover:border-purple-500/40 hover:bg-purple-500/10 transition-all"
      >
        {plan.icon} {plan.name} <Edit3 size={10} className="text-gray-500" />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <select
        value={selected}
        onChange={e => setSelected(e.target.value)}
        className="px-2 py-1.5 rounded-lg bg-white/10 border border-purple-500/40 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
      >
        {PLANS.map(p => (
          <option key={p.id} value={p.id} className="bg-[#1a1a2e] text-white">{p.icon} {p.name}</option>
        ))}
      </select>
      <button
        onClick={() => { onChange(user.email, selected); setEditing(false); }}
        className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all"
      >
        <Check size={12} />
      </button>
      <button
        onClick={() => setEditing(false)}
        className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 transition-all"
      >
        ✕
      </button>
    </div>
  );
}

function ChatConsole() {
  const { getAllUsers, adminChangePlan } = useStore();
  const allUsers = getAllUsers();
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [expandedChat, setExpandedChat] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Collect all users with chats
  const usersWithChats = allUsers.filter(u => {
    const chats = u.chats || {};
    return Object.values(chats).some(c => c.messages.length > 0);
  });

  const filteredUsers = searchQuery
    ? usersWithChats.filter(u =>
        u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : usersWithChats;

  // Collect all individual messages across all users for a "live feed"
  const allMessages: { username: string; email: string; plan: string; chatTitle: string; role: string; content: string; time: number }[] = [];
  filteredUsers.forEach(u => {
    const plan = PLANS.find(p => p.id === u.plan) || PLANS[0];
    const chats = u.chats || {};
    Object.values(chats).forEach(chat => {
      chat.messages.forEach(m => {
        allMessages.push({
          username: u.username,
          email: u.email,
          plan: plan.name,
          chatTitle: chat.title,
          role: m.role,
          content: m.content,
          time: chat.updatedAt,
        });
      });
    });
  });

  return (
    <div>
      {/* Live Message Feed */}
      <h3 className="text-sm font-semibold text-gray-200 mb-3 flex items-center gap-2">
        <MessageSquare size={14} className="text-purple-400" />
        Live Message Feed
        <span className="text-[10px] text-gray-500 font-normal">— All user conversations in real-time</span>
      </h3>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search by username or email..."
          className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-all"
        />
      </div>

      {/* Summary bar */}
      <div className="flex items-center gap-3 mb-4 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5">
        <span className="text-xs text-gray-400">{filteredUsers.length} users with chats</span>
        <span className="text-xs text-gray-600">|</span>
        <span className="text-xs text-gray-400">{allMessages.length} total messages</span>
      </div>

      {/* Per-user chat panels */}
      <div className="space-y-4">
        {filteredUsers.length === 0 && (
          <p className="text-sm text-gray-500 py-8 text-center">No chats found.</p>
        )}
        {filteredUsers.map(user => {
          const isExpanded = expandedUser === user.email;
          const plan = PLANS.find(p => p.id === user.plan) || PLANS[0];
          const userChats = user.chats || {};
          const chatIds = Object.keys(userChats).filter(id => userChats[id].messages.length > 0);
          const totalMsgs = chatIds.reduce((s, id) => s + userChats[id].messages.length, 0);
          const lastChat = chatIds.sort((a, b) => userChats[b].updatedAt - userChats[a].updatedAt)[0];

          return (
            <motion.div
              key={user.email}
              layout
              className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden"
            >
              {/* User header */}
              <button
                onClick={() => setExpandedUser(isExpanded ? null : user.email)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/[0.03] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500/20 to-emerald-500/20 border border-white/10 flex items-center justify-center text-sm font-bold text-purple-300">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-200">{user.username}</span>
                      <UserPlanBadge planId={user.plan} />
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-gray-500">{user.email}</span>
                      <span className="text-gray-600">•</span>
                      <span className="text-[11px] text-gray-500">{chatIds.length} chats • {totalMsgs} msgs</span>
                      {lastChat && (
                        <>
                          <span className="text-gray-600">•</span>
                          <span className="text-[11px] text-gray-500">Last: &quot;{userChats[lastChat].title}&quot;</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <PlanChanger user={user} onChange={adminChangePlan} />
                  {isExpanded ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
                </div>
              </button>

              {/* Expanded chat view */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-3">
                      {chatIds.sort((a, b) => userChats[b].updatedAt - userChats[a].updatedAt).map(cid => {
                        const chat = userChats[cid];
                        const isChatExpanded = expandedChat === cid;
                        return (
                          <div key={cid} className="rounded-xl bg-white/[0.02] border border-white/5 overflow-hidden">
                            <button
                              onClick={() => setExpandedChat(isChatExpanded ? null : cid)}
                              className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.03] transition-colors"
                            >
                              <div className="text-left">
                                <p className="text-xs font-semibold text-gray-300">&quot;{chat.title}&quot;</p>
                                <p className="text-[10px] text-gray-500 mt-0.5">{chat.messages.length} messages • {new Date(chat.updatedAt).toLocaleString()}</p>
                              </div>
                              {isChatExpanded ? <ChevronUp size={14} className="text-gray-500" /> : <ChevronDown size={14} className="text-gray-500" />}
                            </button>

                            <AnimatePresence>
                              {isChatExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-4 pb-3 space-y-2 max-h-[400px] overflow-y-auto">
                                    {chat.messages.map((m, mi) => (
                                      <div
                                        key={mi}
                                        className={`px-3 py-2.5 rounded-lg text-xs leading-relaxed ${
                                          m.role === 'user'
                                            ? 'bg-purple-500/10 border-l-[3px] border-purple-500 text-gray-300'
                                            : 'bg-emerald-500/5 border-l-[3px] border-emerald-500 text-gray-400'
                                        }`}
                                      >
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className={`text-[10px] font-bold ${m.role === 'user' ? 'text-purple-400' : 'text-emerald-400'}`}>
                                            {m.role === 'user' ? user.username : '⚡ AI'}
                                          </span>
                                          <UserPlanBadge planId={user.plan} />
                                        </div>
                                        <div className="whitespace-pre-wrap break-words">{m.content}</div>
                                      </div>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const {
    currentUser, adminSubTab, setAdminSubTab, adminChangePlan, getLogs, getAllUsers,
  } = useStore();

  if (!currentUser || !isAdmin(currentUser)) return null;

  const allUsers = getAllUsers();
  const logs = getLogs();

  const todayKey = new Date().toISOString().slice(0, 10);
  const totalMsgsToday = allUsers.reduce((s, u) => s + (u.msgLog?.[todayKey] || 0), 0);
  const totalChatsAll = allUsers.reduce((s, u) => s + Object.keys(u.chats || {}).length, 0);
  const totalMsgsAll = allUsers.reduce((s, u) => {
    let c = 0; Object.values(u.chats || {}).forEach(ch => c += ch.messages.length); return s + c;
  }, 0);

  const adminTabs: { id: AdminSubTab; icon: React.ReactNode; label: string }[] = [
    { id: 'users', icon: <Users size={14} />, label: 'Users' },
    { id: 'chats', icon: <MessageSquare size={14} />, label: 'Chat Console' },
    { id: 'logs', icon: <FileText size={14} />, label: 'Activity Logs' },
  ];

  const typeColors: Record<string, string> = {
    signup: 'bg-emerald-500/15 text-emerald-400',
    login: 'bg-purple-500/15 text-purple-400',
    message: 'bg-amber-500/15 text-amber-400',
    plan: 'bg-red-500/15 text-red-400',
  };

  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-red-400 via-amber-400 to-orange-400 bg-clip-text text-transparent flex items-center gap-2">
          <Shield size={20} /> Admin Control Panel
        </h1>
        <p className="text-xs text-gray-500 mb-6">Manage users, monitor chats, and control plans</p>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Total Users', value: allUsers.length, gradient: 'from-purple-500 to-violet-500' },
            { label: 'Msgs Today', value: totalMsgsToday, gradient: 'from-amber-500 to-orange-500' },
            { label: 'Total Chats', value: totalChatsAll, gradient: 'from-blue-500 to-cyan-500' },
            { label: 'Total Messages', value: totalMsgsAll, gradient: 'from-emerald-500 to-teal-500' },
            ...PLANS.map(p => ({
              label: `${p.icon} ${p.name}`,
              value: allUsers.filter(u => u.plan === p.id).length,
              gradient: 'from-gray-500 to-gray-600',
            })),
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -2 }}
              className="rounded-2xl p-4 bg-gradient-to-br from-white/[0.04] to-white/[0.02] border border-white/5 text-center hover:border-white/10 transition-all cursor-default"
            >
              <p className={`text-2xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>{stat.value}</p>
              <p className="text-[11px] text-gray-500 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/5 rounded-xl p-1 mb-6">
          {adminTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setAdminSubTab(tab.id)}
              className={`flex items-center justify-center gap-2 flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                adminSubTab === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-600/20'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Users Tab */}
        {adminSubTab === 'users' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h3 className="text-sm font-semibold text-gray-200 mb-4 flex items-center gap-2">
              <Users size={14} className="text-purple-400" />
              All Users — Manage Plans & View Details
            </h3>
            <div className="overflow-x-auto rounded-xl border border-white/5">
              <table className="w-full bg-white/[0.02]">
                <thead>
                  <tr className="bg-white/5">
                    {['Username', 'Email', 'Password', 'Plan', 'Change Plan', 'Msgs Today', 'Chats', 'Total Msgs', 'Joined'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map(user => {
                    const plan = PLANS.find(p => p.id === user.plan) || PLANS[0];
                    let totalMsgs = 0;
                    Object.values(user.chats || {}).forEach(c => totalMsgs += c.messages.length);
                    return (
                      <tr key={user.email} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 text-sm font-semibold text-gray-200 whitespace-nowrap">{user.username}</td>
                        <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{user.email}</td>
                        <td className="px-4 py-3 text-[11px] text-gray-500 font-mono whitespace-nowrap">{atob(user.password)}</td>
                        <td className="px-4 py-3 whitespace-nowrap"><UserPlanBadge planId={user.plan} /></td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <PlanChanger user={user} onChange={adminChangePlan} />
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400">{user.msgLog?.[todayKey] || 0}/{plan.msgs}</td>
                        <td className="px-4 py-3 text-xs text-gray-400">{Object.keys(user.chats || {}).length}</td>
                        <td className="px-4 py-3 text-xs text-gray-400">{totalMsgs}</td>
                        <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {allUsers.length === 0 && <p className="text-sm text-gray-500 py-8 text-center">No users registered yet.</p>}
          </motion.div>
        )}

        {/* Chat Console Tab */}
        {adminSubTab === 'chats' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <ChatConsole />
          </motion.div>
        )}

        {/* Logs Tab */}
        {adminSubTab === 'logs' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h3 className="text-sm font-semibold text-gray-200 mb-4 flex items-center gap-2">
              <FileText size={14} className="text-purple-400" />
              Activity Logs — Signups, Logins, Messages, Plan Changes
            </h3>
            <div className="space-y-2">
              {logs.slice(0, 100).map((log, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="flex flex-wrap items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs"
                >
                  <span className="text-gray-500 font-mono text-[11px] min-w-[140px]">
                    {new Date(log.time).toLocaleString()}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase min-w-[60px] text-center ${typeColors[log.type] || ''}`}>
                    {log.type}
                  </span>
                  <span className="text-gray-400">
                    <strong className="text-gray-300">{log.user}</strong> — {log.detail}
                  </span>
                </motion.div>
              ))}
              {!logs.length && <p className="text-sm text-gray-500 py-8 text-center">No activity yet.</p>}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
