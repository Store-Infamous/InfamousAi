import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Mail, Lock, User } from 'lucide-react';

export default function AuthPage() {
  const { authMode, setAuthMode, handleAuth, checkSession } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    // Small delay for UX
    await new Promise(r => setTimeout(r, 300));
    const err = handleAuth(email, password, username);
    if (err) setError(err);
    else { localStorage.setItem('iai_session', email.trim().toLowerCase()); }
    setLoading(false);
  };

  React.useEffect(() => {
    if (checkSession()) localStorage.setItem('iai_session', useStore.getState().currentUser!.email);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a1a] via-[#0d0d1f] to-[#0a0a0f]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="auth-card rounded-2xl p-8 md:p-10 backdrop-blur-xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-emerald-400 mb-4 shadow-lg shadow-purple-500/25"
            >
              <Zap className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
              Infamous AI
            </h1>
            <p className="text-sm text-gray-500 mt-2">Built for developers who move fast</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-white/5 rounded-xl p-1 mb-6">
            {(['login', 'signup'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => { setAuthMode(mode); setError(''); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  authMode === mode
                    ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-600/25'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
              >
                {mode === 'login' ? 'Login' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-4">
            <AnimatePresence>
              {authMode === 'signup' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Username</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      placeholder="Choose a username"
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/25 transition-all"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/25 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={4}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/25 transition-all"
                />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-red-400 text-xs text-center min-h-[18px]"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-purple-600 via-violet-600 to-purple-700 hover:from-purple-500 hover:via-violet-500 hover:to-purple-600 shadow-lg shadow-purple-600/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Processing...
                </span>
              ) : authMode === 'login' ? 'Login' : 'Create Account'}
            </motion.button>
          </form>

          {/* About card */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-emerald-500/5 border border-white/5"
          >
            <p className="text-xs font-bold text-purple-400 text-center mb-1">⚡ About Infamous AI</p>
            <p className="text-[11px] text-gray-500 text-center leading-relaxed">
              Created & coded by <span className="text-emerald-400 font-semibold">Mikey</span>, founder of{' '}
              <span className="text-purple-400 font-semibold">Infamous SMP</span> &{' '}
              <span className="text-purple-400 font-semibold">Infamous Studio</span>.<br />
              Making AI easy for people who want to learn coding & programming.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
