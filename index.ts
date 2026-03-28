export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface User {
  username: string;
  email: string;
  password: string; // base64 encoded
  plan: string;
  chats: Record<string, Chat>;
  createdAt: number;
  msgLog: Record<string, number>;
  lastLogin: number;
}

export interface LogEntry {
  type: 'signup' | 'login' | 'message' | 'plan';
  user: string;
  detail: string;
  time: number;
}

export interface Plan {
  id: string;
  name: string;
  icon: string;
  msgs: number;
  inr: number;
  usd: number;
  features: string[];
  popular: boolean;
}

export type TabId = 'dashboard' | 'chat' | 'plans' | 'admin';
export type AdminSubTab = 'users' | 'chats' | 'logs';
export type AuthMode = 'login' | 'signup';
