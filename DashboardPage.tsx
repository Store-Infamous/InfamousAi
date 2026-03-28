import React from 'react';
import { useStore, PLANS } from '../store/useStore';
import { motion } from 'framer-motion';
import { Plus, Crown, MessageSquare, TrendingUp, Zap } from 'lucide-react';

export default function DashboardPage() {
  const {
    currentUser, startNewChat, openChat, deleteChat, setActiveTab,
    getMsgsToday, getMsgRemaining, getTotalChats, getTotalMsgs,
  } = useStore();

  if (!currentUser) return null;
  const plan = PLANS.find(p => p.id === currentUser.plan) || PLANS[0];
  const used = getMsgsToday();
  const rem = getMsgRemaining();
  const pct = plan.msgs ? Math.round((used / plan.msgs) * 100) : 0;
  const totalChats = getTotalChats();
  const totalMsgs = getTotalMsgs();

  const chats = currentUser.chats || {};
  const chatIds = Object.keys(chats).sort((a, b) => chats[b].updatedAt - chats[a].updatedAt);

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1);
  const yestStr = yesterday.toISOString().slice(0, 10);

  const groups: { label: string; ids: string[] }[] = [
    { label: 'Today', ids: [] },
    { label: 'Yesterday', ids: [] },
    { label: 'Previous', ids: [] },
  ];
  chatIds.forEach(id => {
    const d = new Date(chats[id].updatedAt).toISOString().slice(0, 10);
    if (d === todayStr) groups[0].ids.push(id);
    else if (d === yestStr) groups[1].ids.push(id);
    else groups[2].ids.push(id);
  });

  const stats = [
    { label: 'Messages Today', value: used, sub: `of ${plan.msgs} limit`, color: 'from-purple-500 to-violet-500', pct, barColor: pct > 80 ? 'bg-red-400' : pct > 50 ? 'bg-amber-400' : 'bg-emerald-400' },
    { label: 'Remaining', value: rem, sub: 'messages left', color: 'from-emerald-500 to-teal-500' },
    { label: 'Total Chats', value: totalChats, sub: 'conversations', color: 'from-blue-500 to-cyan-500' },
    { label: 'Current Plan', value: `${plan.icon} ${plan.name}`, sub: `₹${plan.inr}/mo • $${plan.usd}/mo`, color: 'from-amber-500 to-orange-500', isText: true },
  ];

  return (
    <div className="p-6 md:p-8 max-w-[1100px] mx-auto">
      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl p-6 mb-8 bg-gradient-to-br from-purple-500/10 via-violet-500/5 to-emerald-500/5 border border-white/5"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <span className="inline-block px-3 py-1 rounded-full bg-purple-500/15 text-purple-400 text-[10px] font-bold uppercase tracking-wider mb-3">
          About Infamous AI
        </span>
        <h2 className="text-xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-emerald-400 bg-clip-text text-transparent">
          ⚡ Intelligent Assistant for Developers
        </h2>
        <p className="text-sm text-gray-400 leading-relaxed mb-1">
          Infamous AI is a fast, intelligent assistant that helps with coding (Java, Python, Minecraft plugins, web dev) and handles all topics: science, math, writing, creative work, and everyday questions.
        </p>
        <p className="text-sm text-gray-400 leading-relaxed mb-3">
          Purpose: To make AI easy and accessible for people who want to learn coding and programming.
        </p>
        <p className="text-xs text-gray-500 italic">
          Created & coded by Mikey — Founder of Infamous SMP & Infamous Studio
        </p>
      </motion.div>

      {/* Greeting */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mb-6">
        <h1 className="text-2xl font-bold text-white">Welcome back, {currentUser.username}!</h1>
        <p className="text-sm text-gray-500 mt-1">Here's your activity overview</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.08 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="rounded-2xl p-5 bg-white/[0.03] border border-white/5 hover:border-purple-500/30 transition-all duration-300 group cursor-default"
          >
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">{stat.label}</p>
            {!stat.isText ? (
              <p className="text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` }}>
                <span className="bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">{stat.value}</span>
              </p>
            ) : (
              <p className="text-xl font-bold text-amber-400">{stat.value}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">{stat.sub}</p>
            {stat.pct !== undefined && (
              <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stat.pct}%` }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className={`h-full rounded-full ${stat.barColor}`}
                />
              </div>
            )}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3 mb-8 flex-wrap">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => startNewChat()}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white text-sm font-semibold shadow-lg shadow-purple-600/20 hover:shadow-purple-600/30 transition-shadow"
        >
          <Plus size={16} /> Start New Chat
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab('plans')}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm font-semibold hover:border-purple-500/30 hover:text-white transition-all"
        >
          <Crown size={16} /> Upgrade Plan
        </motion.button>
      </div>

      {/* Recent Chats */}
      <h3 className="text-base font-semibold text-gray-200 mb-4 flex items-center gap-2">
        <MessageSquare size={16} className="text-purple-400" /> Recent Chats
      </h3>
      <div className="flex flex-col gap-2">
        {groups.map(group => {
          if (!group.ids.length) return null;
          return (
            <React.Fragment key={group.label}>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-4 mb-2">{group.label}</p>
              {group.ids.map((id, idx) => {
                const chat = chats[id];
                return (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => openChat(id)}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-purple-500/30 hover:bg-white/5 cursor-pointer transition-all duration-200 group"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-200">{chat.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{chat.messages.length} messages</p>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); deleteChat(id); }}
                      className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs font-semibold opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all"
                    >
                      Delete
                    </button>
                  </motion.div>
                );
              })}
            </React.Fragment>
          );
        })}
        {chatIds.length === 0 && (
          <p className="text-sm text-gray-500 py-4">No chats yet. Start one!</p>
        )}
      </div>
    </div>
  );
}
