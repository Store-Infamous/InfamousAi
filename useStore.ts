import { create } from 'zustand';
import type { User, LogEntry, Plan, Chat, TabId, AdminSubTab, AuthMode } from '../types';

export const PLANS: Plan[] = [
  { id: 'dirt', name: 'Dirt', icon: '🟫', msgs: 25, inr: 69, usd: 0.82, features: ['25 messages/day', 'Basic AI responses', '1 chat at a time', 'Community support'], popular: false },
  { id: 'stone', name: 'Stone', icon: '🪨', msgs: 50, inr: 149, usd: 1.77, features: ['50 messages/day', 'Faster responses', '5 chats', 'Code highlighting', 'Priority queue'], popular: true },
  { id: 'obsidian', name: 'Obsidian', icon: '🖤', msgs: 80, inr: 229, usd: 2.72, features: ['80 messages/day', 'Advanced code gen', '15 chats', 'Export chats', 'Priority support'], popular: false },
  { id: 'bedrock', name: 'Bedrock', icon: '💎', msgs: 150, inr: 299, usd: 3.56, features: ['150 messages/day', 'Unlimited chats', 'GPT-level answers', 'API access', '24/7 support', 'Early features'], popular: false },
];

const ADMIN_EMAIL = 'aryan11222567@gmail.com';
const ADMIN_PASS_B64 = btoa('infamousmikey');

const CHAT_URL = 'https://pwmvfujxrfzzvsvnkkax.supabase.co/functions/v1/chat';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3bXZmdWp4cmZ6enZzdm5ra2F4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MjcwMTMsImV4cCI6MjA5MDEwMzAxM30.PCBsHT-D0MTREOf3zdw2ICxQoHnLa6Ax4rZfvIEVlcA';

function getUsers(): Record<string, User> {
  try { return JSON.parse(localStorage.getItem('iai_users') || '{}'); } catch { return {}; }
}
function saveUsers(u: Record<string, User>) { localStorage.setItem('iai_users', JSON.stringify(u)); }
function getLogsArr(): LogEntry[] { try { return JSON.parse(localStorage.getItem('iai_logs') || '[]'); } catch { return []; } }
function saveLogsArr(l: LogEntry[]) { localStorage.setItem('iai_logs', JSON.stringify(l)); }
function getQRLink(): string { return localStorage.getItem('iai_qr_link') || ''; }
function saveQRLink(link: string) { localStorage.setItem('iai_qr_link', link); }

function todayKey(): string { return new Date().toISOString().slice(0, 10); }

export function isAdmin(user: User): boolean {
  return user.email === ADMIN_EMAIL && user.password === ADMIN_PASS_B64;
}

function saveCurrentUser(user: User) {
  const users = getUsers();
  users[user.email] = user;
  saveUsers(users);
}

function addLog(type: LogEntry['type'], user: string, detail: string) {
  const logs = getLogsArr();
  logs.unshift({ type, user, detail, time: Date.now() });
  if (logs.length > 500) logs.length = 500;
  saveLogsArr(logs);
}

interface AppState {
  currentUser: User | null;
  currentChatId: string | null;
  activeTab: TabId;
  adminSubTab: AdminSubTab;
  authMode: AuthMode;
  isSending: boolean;
  qrLink: string;
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  qrModalPlanId: string | null;
  setAuthMode: (mode: AuthMode) => void;
  handleAuth: (email: string, password: string, username: string) => string | null;
  logout: () => void;
  checkSession: () => boolean;
  setActiveTab: (tab: TabId) => void;
  setAdminSubTab: (tab: AdminSubTab) => void;
  startNewChat: () => string;
  openChat: (id: string) => void;
  deleteChat: (id: string) => void;
  sendMessage: (text: string) => Promise<void>;
  getUserPlan: () => Plan;
  getMsgsToday: () => number;
  getMsgRemaining: () => number;
  getTotalChats: () => number;
  getTotalMsgs: () => number;
  adminChangePlan: (email: string, planId: string) => void;
  setQRLink: (link: string) => void;
  setQrModalPlanId: (planId: string | null) => void;
  toggleSidebar: () => void;
  openMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  getLogs: () => LogEntry[];
  getAllUsers: () => User[];
}

export const useStore = create<AppState>((set, get) => ({
  currentUser: null,
  currentChatId: null,
  activeTab: 'dashboard',
  adminSubTab: 'users',
  authMode: 'login',
  isSending: false,
  qrLink: getQRLink(),
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  qrModalPlanId: null,

  setAuthMode: (mode) => set({ authMode: mode }),

  handleAuth: (email, password, username) => {
    const em = email.trim().toLowerCase();
    const users = getUsers();
    const state = get();

    if (state.authMode === 'signup') {
      if (!username.trim()) return 'Username required';
      if (users[em]) return 'Email already registered';
      users[em] = {
        username: username.trim(),
        email: em,
        password: btoa(password),
        plan: 'dirt',
        chats: {},
        createdAt: Date.now(),
        msgLog: {},
        lastLogin: Date.now(),
      };
      saveUsers(users);
      addLog('signup', username.trim(), 'Signed up with ' + em);
      set({ currentUser: users[em] });
      return null;
    } else {
      if (!users[em]) return 'No account found';
      if (atob(users[em].password) !== password) return 'Wrong password';
      users[em].lastLogin = Date.now();
      saveUsers(users);
      addLog('login', users[em].username, 'Logged in');
      set({ currentUser: users[em] });
      return null;
    }
  },

  logout: () => {
    localStorage.removeItem('iai_session');
    set({ currentUser: null, currentChatId: null, activeTab: 'dashboard', mobileSidebarOpen: false });
  },

  checkSession: () => {
    const s = localStorage.getItem('iai_session');
    if (s) {
      const users = getUsers();
      if (users[s]) { set({ currentUser: users[s] }); return true; }
    }
    return false;
  },

  setActiveTab: (tab) => {
    const state = get();
    if (tab === 'chat' && !state.currentChatId) {
      state.startNewChat();
    }
    set({ activeTab: tab, mobileSidebarOpen: false });
  },

  setAdminSubTab: (tab) => set({ adminSubTab: tab }),

  startNewChat: () => {
    const user = get().currentUser;
    if (!user) return '';
    const id = 'chat_' + Date.now();
    const chat: Chat = { id, title: 'New Chat', messages: [], createdAt: Date.now(), updatedAt: Date.now() };
    user.chats = user.chats || {};
    user.chats[id] = chat;
    saveCurrentUser(user);
    set({ currentChatId: id, activeTab: 'chat' });
    return id;
  },

  openChat: (id) => {
    set({ currentChatId: id, activeTab: 'chat' });
  },

  deleteChat: (id) => {
    const { currentUser, currentChatId } = get();
    if (!currentUser) return;
    delete currentUser.chats[id];
    if (currentChatId === id) set({ currentChatId: null });
    saveCurrentUser(currentUser);
    set({ currentUser: { ...currentUser } });
  },

  sendMessage: async (text: string) => {
    const state = get();
    const currentUser = state.currentUser;
    const currentChatId = state.currentChatId;
    if (!currentUser || !currentChatId) return;
    if (state.getMsgRemaining() <= 0) { alert('Daily message limit reached! Upgrade your plan.'); return; }

    const chat = currentUser.chats[currentChatId];
    chat.messages.push({ role: 'user', content: text });
    if (chat.messages.length === 1) chat.title = text.slice(0, 50) + (text.length > 50 ? '...' : '');
    chat.updatedAt = Date.now();
    currentUser.msgLog = currentUser.msgLog || {};
    currentUser.msgLog[todayKey()] = (currentUser.msgLog[todayKey()] || 0) + 1;
    saveCurrentUser(currentUser);
    addLog('message', currentUser.username, 'Sent: ' + text.slice(0, 80));

    set({ isSending: true, currentUser: { ...currentUser } });

    try {
      const res = await fetch(CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + ANON_KEY },
        body: JSON.stringify({ messages: chat.messages.map(function (m) { return { role: m.role, content: m.content }; }) }),
      });
      if (!res.ok) throw new Error('API error');
      const reader = res.body!.getReader();
      const dec = new TextDecoder();
      let assistant = '';
      chat.messages.push({ role: 'assistant', content: '' });

      while (true) {
        const result = await reader.read();
        const done = result.done;
        const value = result.value;
        if (done) break;
        const chunk = dec.decode(value);
        const lines = chunk.split('\n');
        for (let li = 0; li < lines.length; li++) {
          const line = lines[li];
          if (!line.startsWith('data: ')) continue;
          const d = line.slice(6).trim();
          if (d === '[DONE]') continue;
          try {
            const j = JSON.parse(d);
            const delta = j.choices && j.choices[0] && j.choices[0].delta && j.choices[0].delta.content;
            if (delta) assistant += delta;
          } catch (_e) { /* skip parse errors */ }
        }
        chat.messages[chat.messages.length - 1].content = assistant;
        chat.updatedAt = Date.now();
        const updated = get().currentUser;
        if (updated) {
          updated.chats[currentChatId] = chat;
          set({ currentUser: { ...updated } });
        }
      }
    } catch (_e) {
      chat.messages.push({ role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' });
    }

    const finalUser = get().currentUser;
    if (finalUser) {
      finalUser.chats[currentChatId] = chat;
      saveCurrentUser(finalUser);
      set({ currentUser: { ...finalUser } });
    }
    set({ isSending: false });
  },

  getUserPlan: () => {
    const user = get().currentUser;
    if (!user) return PLANS[0];
    return PLANS.find(function (p) { return p.id === user.plan; }) || PLANS[0];
  },

  getMsgsToday: () => {
    const user = get().currentUser;
    if (!user) return 0;
    return (user.msgLog && user.msgLog[todayKey()]) || 0;
  },

  getMsgRemaining: () => {
    const plan = get().getUserPlan();
    const used = get().getMsgsToday();
    return Math.max(0, plan.msgs - used);
  },

  getTotalChats: () => {
    const user = get().currentUser;
    if (!user) return 0;
    return Object.keys(user.chats || {}).length;
  },

  getTotalMsgs: () => {
    const user = get().currentUser;
    if (!user) return 0;
    let c = 0;
    const chats = user.chats || {};
    const keys = Object.keys(chats);
    for (let i = 0; i < keys.length; i++) { c += chats[keys[i]].messages.length; }
    return c;
  },

  adminChangePlan: (email, planId) => {
    const currentUser = get().currentUser;
    if (!currentUser || !isAdmin(currentUser)) return;
    const users = getUsers();
    if (!users[email]) return;
    const oldPlan = users[email].plan;
    users[email].plan = planId;
    saveUsers(users);
    const planName = PLANS.find(function (p) { return p.id === planId; });
    const oldName = PLANS.find(function (p) { return p.id === oldPlan; });
    addLog('plan', users[email].username, 'Plan: ' + (oldName ? oldName.name : oldPlan) + ' \u2192 ' + (planName ? planName.name : planId) + ' (by admin)');
    if (currentUser.email === email) set({ currentUser: { ...users[email] } });
  },

  setQRLink: (link) => {
    saveQRLink(link);
    set({ qrLink: link });
  },

  setQrModalPlanId: (planId) => set({ qrModalPlanId: planId }),
  toggleSidebar: () => set(function (s) { return { sidebarCollapsed: !s.sidebarCollapsed }; }),
  openMobileSidebar: () => set({ mobileSidebarOpen: true }),
  closeMobileSidebar: () => set({ mobileSidebarOpen: false }),
  getLogs: () => getLogsArr(),
  getAllUsers: () => Object.values(getUsers()),
}));
