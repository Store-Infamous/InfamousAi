import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore, isAdmin } from './store/useStore';
import Sidebar from './components/Sidebar';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import ChatPage from './pages/ChatPage';
import PlansPage from './pages/PlansPage';
import AdminPage from './pages/AdminPage';

export default function App() {
  const { currentUser, activeTab, checkSession } = useStore();

  useEffect(() => {
    checkSession();
  }, []);

  if (!currentUser) return <AuthPage />;

  const canAdmin = isAdmin(currentUser);

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardPage />;
      case 'chat': return <ChatPage />;
      case 'plans': return <PlansPage />;
      case 'admin': return canAdmin ? <AdminPage /> : <DashboardPage />;
      default: return <DashboardPage />;
    }
  };

  return (
    <div className="flex h-screen bg-[#0a0a0f] text-gray-100 overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {renderTab()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
