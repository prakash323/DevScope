/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shield, Sparkles, Code, FileText, ArrowRight, Sun, Moon } from 'lucide-react';
import { User } from '../types';

interface AuthScreenProps {
  onLogin: (user: User) => void;
  onGoogleSignIn?: () => Promise<void>;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export default function AuthScreen({ onLogin, onGoogleSignIn, theme, onToggleTheme }: AuthScreenProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const simulatedUser: User = {
      id: Math.random().toString(36).substring(2, 11),
      email,
      fullName: fullName || email.split('@')[0].toUpperCase(),
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150`,
      joinedAt: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    };

    onLogin(simulatedUser);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col justify-between" id="auth-container">
      {/* Upper Navigation Row */}
      <header className="px-6 py-5 flex justify-between items-center border-b border-[#E5E7EB] bg-white">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-1.5 rounded text-white flex items-center justify-center">
            <Code className="w-5 h-5" id="logo-icon" />
          </div>
          <span className="font-sans font-semibold tracking-tight text-xl text-gray-900" id="brand-name">
            DevScope
          </span>
          <span className="text-xs bg-[#EEF2F6] text-[#4F46E5] px-2 py-0.5 rounded font-mono font-medium">
            AI Placement Intelligence
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500 font-sans hidden sm:block">
            Placement Cell Cohort 2026
          </div>
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              aria-label="Toggle Theme"
              className="p-1.5 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer flex items-center justify-center border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-500" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </header>

      {/* Main Form Hero */}
      <main className="flex-1 flex items-center justify-center p-6 my-10">
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-3 bg-indigo-50 text-indigo-600 rounded-full mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="font-sans text-2xl font-semibold tracking-tight text-gray-900" id="form-heading">
              {isRegistering ? 'Create Placement Profile' : 'Student Portal Sign In'}
            </h1>
            <p className="text-sm text-gray-500 mt-2 font-sans">
              {isRegistering 
                ? 'Join DevScope to unify your code analytics and resume.' 
                : 'Enter credentials or placement ID to view your dashboard.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegistering && (
              <div>
                <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rachel Green"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 focus:bg-white"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider mb-1.5">
                Placement Email
              </label>
              <input
                type="email"
                required
                placeholder="prakash.23bce9564@vitapstudent.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-sans font-medium text-sm flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <span>{isRegistering ? 'Register Profile' : 'Enter Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Social Sign-in simulator */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-gray-400 font-sans tracking-wide">
                Or secure connection
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                setEmail('prakash.student@placement.edu');
                setFullName('Prakash Kumar');
                setIsRegistering(false);
                onLogin({
                  id: 'git-oauth-user',
                  email: 'prakash.student@placement.edu',
                  fullName: 'Prakash Kumar',
                  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
                  joinedAt: 'July 2026'
                });
              }}
              className="flex items-center justify-center gap-2 py-2 px-3 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition bg-white"
            >
              <Code className="w-4 h-4 text-gray-700" />
              <span className="text-gray-700 font-sans text-xs">GitHub Auth</span>
            </button>

             <button
              onClick={() => {
                if (onGoogleSignIn) {
                  onGoogleSignIn();
                } else {
                  setEmail('vitap.student@university.edu');
                  setFullName('VIT-AP Student');
                  setIsRegistering(false);
                  onLogin({
                    id: 'google-oauth-user',
                    email: 'vitap.student@university.edu',
                    fullName: 'VIT-AP Placement Candidate',
                    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
                    joinedAt: 'July 2026'
                  });
                }
              }}
              className="flex items-center justify-center gap-2 py-2 px-3 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition bg-white"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-gray-700 font-sans text-xs">Google OAuth</span>
            </button>
          </div>

          {/* Toggle Screen */}
          <div className="text-center mt-6 text-xs text-gray-500">
            {isRegistering ? 'Already have a profile?' : 'First time preparing here?'}
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-indigo-600 hover:underline ml-1.5 font-sans font-medium focus:outline-none"
            >
              {isRegistering ? 'Log In' : 'Create an Account'}
            </button>
          </div>
        </div>
      </main>

      {/* Trust Badging */}
      <footer className="py-6 border-t border-gray-200 text-center text-xs text-gray-400 bg-white space-y-1">
        <div>DevScope placement intelligence uses deterministic validation rules backed by Gemini LLMs.</div>
        <div className="font-mono text-[10px]">VER_BUILD: 2026.07.15.SHA_LATEST</div>
      </footer>
    </div>
  );
}
