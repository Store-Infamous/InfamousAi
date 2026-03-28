import React from 'react';
import { useStore, PLANS, isAdmin } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, MessageSquare, Gem, Shield,
  Plus, LogOut, Zap, ChevronLeft, ChevronRight, Menu
} from 'lucide-react';
import type { TabId } from '../types';

const navItems: { id: TabId; icon: React.ReactNode; label: string; adminOnly?: boolean }[] = [
  { id: 'dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { id: 'chat', icon: <MessageSquare size={18} />, label: 'Chat' },
  { id: 'plans', icon: <Gem size={18} />, label: 'Plans' },
  { id: 'admin', icon: <Shield size={18} />, label: 'Admin', adminOnly: true },
];

export default function Sidebar() {
  const {
    currentUser, activeTab, setActiveTab, sidebarCollapsed, toggleSidebar,
    mobileSidebarOpen, closeMobileSidebar, openMobileSidebar, startNewChat, logout,
    getMsgRemaining,
  } = useStore();

  if (!currentUser) return null;
  const plan = PLANS.find(p => p.id === currentUser.plan) || PLANS[0];
  const canAdmin = isAdmin(currentUser);
  const remaining = getMsgRemaining();

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMobileSidebar}
            className="fixed inset-0 bg-black/60 z-[199] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile top bar */}
      <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-[#0d0d1a]/90 backdrop-blur-md border-b border-white/5 z-[100]">
        <button onClick={openMobileSidebar} className="p-2 rounded-lg bg-white/5 text-gray-300 hover:bg-white/10 transition-colors">
          <Menu size={20} />
        </button>
        <span className="font-bold text-lg bg-gradient-to-r from-purple-400 to-emerald-400 bg-clip-text text-transparent">
          ⚡ Infamous AI
        </span>
      </div>

      {/* Sidebar */}
      <motion.aside
        className={`fixed lg:relative z-[200] h-screen bg-[#0d0d1a]/95 backdrop-blur-xl border-r border-white/5 flex flex-col transition-transform duration-300 lg:transition-none ${
          sidebarCollapsed ? 'lg:w-[72px]' : 'lg:w-[260px]'
        } ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Header */}
        <div className="p-5 flex items-center gap-3 border-b border-white/5 min-h-[64px]">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-emerald-400 flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-white" />
          </div>
          {!sidebarCollapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-bold text-lg bg-gradient-to-r from-purple-400 to-emerald-400 bg-clip-text text-transparent whitespace-nowrap"
            >
              Infamous AI
            </motion.span>
          )}
        </div>

        {/* Desktop toggle */}
        <button
          onClick={toggleSidebar}
          className="hidden lg:flex absolute top-[18px] -right-[14px] w-7 h-7 rounded-full bg-[#1a1a2e] border border-white/10 text-gray-400 items-center justify-center hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-all z-[201] text-xs"
        >
          {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
          {!sidebarCollapsed && (
            <p className="px-3 mb-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Main</p>
          )}
          {navItems.map(item => {
            if (item.adminOnly && !canAdmin) return null;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  sidebarCollapsed ? 'justify-center' : ''
                } ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-500/15 to-violet-500/5 text-purple-300 border border-purple-500/20'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent'
                }`}
              >
                <span className={`flex-shrink-0 transition-colors ${isActive ? 'text-purple-400' : 'text-gray-500 group-hover:text-gray-300'}`}>
                  {item.icon}
                </span>
                {!sidebarCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}

          <div className="mt-auto pt-4 border-t border-white/5">
            {!sidebarCollapsed && (
              <p className="px-3 mb-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Quick Actions</p>
            )}
            <button
              onClick={() => { startNewChat(); closeMobileSidebar(); }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-emerald-400 hover:bg-emerald-500/10 transition-all ${
                sidebarCollapsed ? 'justify-center' : ''
              }`}
            >
              <Plus size={18} className="text-emerald-500" />
              {!sidebarCollapsed && <span>New Chat</span>}
            </button>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-white/5">
          <div className={`flex items-center gap-3 p-2.5 rounded-xl bg-white/5 ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-emerald-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {currentUser.username.charAt(0).toUpperCase()}
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-200 truncate">{currentUser.username}</p>
                <p className="text-[10px] text-gray-500 truncate">{currentUser.email}</p>
                <p className="text-[10px] text-emerald-400 font-semibold">
                  {plan.icon} {plan.name} • {remaining} left
                </p>
              </div>
            )}
          </div>
          <button
            onClick={logout}
            className={`flex items-center gap-2 w-full mt-2 py-2 rounded-xl bg-red-500/10 text-red-400 text-xs font-semibold hover:bg-red-500 hover:text-white transition-all ${
              sidebarCollapsed ? 'justify-center' : 'justify-center'
            }`}
          >
            <LogOut size={14} />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </motion.aside>
    </>
  );
}
