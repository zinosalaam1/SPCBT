import React, { useState } from 'react';
import { motion } from 'motion/react';
import { GraduationCap, Lock, User, LogIn, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { User as UserType } from '../types';
import { loginRequest, saveAuth } from '../services/auth';

interface LoginProps {
  onLogin: (user: UserType) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data = await loginRequest(username, password);

      // ✅ Save JWT + user
      saveAuth(data.token, data.user);

      // ✅ Update app state
      onLogin(data.user);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = (role: 'admin' | 'student') => {
    if (role === 'admin') {
      setUsername('admin');
      setPassword('admin123');
    } else {
      setUsername('student');
      setPassword('student123');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white/10 rounded-full"
            style={{
              width: Math.random() * 300 + 50,
              height: Math.random() * 300 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, Math.random() * 100 - 50],
              x: [0, Math.random() * 100 - 50],
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo and Title */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.8, delay: 0.2 }}
          className="text-center mb-8"
        >
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-2xl mb-4"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <GraduationCap className="w-12 h-12 text-indigo-600" />
          </motion.div>
          <h1 className="text-5xl font-bold text-white mb-2 tracking-tight">
            Sp-Tech
          </h1>
          <p className="text-white/90 text-lg flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5" />
            Advanced CBT System
            <Sparkles className="w-5 h-5" />
          </p>
        </motion.div>

        {/* Login Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="p-8 backdrop-blur-xl bg-white/95 shadow-2xl border-0">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>

              {error && (
                <motion.div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </motion.div>
              )}

              <Button type="submit" className="w-full h-12" disabled={isLoading}>
                {isLoading ? <LogIn className="animate-spin" /> : 'Sign In'}
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button type="button" variant="outline" onClick={() => quickLogin('admin')}>
                  👨‍💼 Admin
                </Button>
                <Button type="button" variant="outline" onClick={() => quickLogin('student')}>
                  👨‍🎓 Student
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
