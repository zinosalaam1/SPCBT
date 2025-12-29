import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Login } from './components/Login';
import { AdminDashboard } from './components/AdminDashboard';
import { StudentDashboard } from './components/StudentDashboard';
import { Toaster } from './components/ui/sonner';
import { initializeStorage, getCurrentUser, logout } from './utils/storage';
import { User } from './types';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize storage with demo data
    initializeStorage();
    
    // Check if user is already logged in
    const user = getCurrentUser();
    setCurrentUser(user);
    setIsLoading(false);
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-white text-2xl font-bold"
        >
          Loading Sp-Tech...
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {!currentUser ? (
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Login onLogin={handleLogin} />
          </motion.div>
        ) : currentUser.role === 'admin' ? (
          <motion.div
            key="admin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <AdminDashboard user={currentUser} onLogout={handleLogout} />
          </motion.div>
        ) : (
          <motion.div
            key="student"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <StudentDashboard user={currentUser} onLogout={handleLogout} />
          </motion.div>
        )}
      </AnimatePresence>
      <Toaster />
    </>
  );
}
