/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User } from '../types';
import { User as UserIcon, Mail, AtSign, Lock, Eye, EyeOff } from 'lucide-react';

interface RegisterViewProps {
  onRegisterSuccess: (user: User) => void;
  onNavigateToLogin: () => void;
}

export const RegisterView: React.FC<RegisterViewProps> = ({
  onRegisterSuccess,
  onNavigateToLogin,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim() || !email.trim() || !username.trim() || !password) {
      setError('Please fill in all the sanctuary parameters.');
      return;
    }
    if (!email.includes('@')) {
      setError('Please provide a valid email structure.');
      return;
    }
    if (password.length < 5) {
      setError('Sanctuary password must be at least 5 characters deep.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const newUser: User = {
        username: username.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
        email: email.trim(),
        fullName: fullName.trim(),
        isPremium: true, // Gift gold/premium access by default!
        memberSince: 'June 2026',
        streak: 1,
        storiesReadCount: 0,
        minutesReadCount: 0,
      };

      // Add user to the persistent registered_users list for database checking
      const storedUsersJSON = localStorage.getItem('omar_stories_registered_users');
      const registeredUsers = storedUsersJSON ? JSON.parse(storedUsersJSON) : [];
      
      const exists = registeredUsers.some(
        (u: any) => u.email.toLowerCase() === email.toLowerCase().trim() || u.username.toLowerCase() === username.toLowerCase().trim()
      );

      if (!exists) {
        registeredUsers.push({
          username: newUser.username,
          email: newUser.email.toLowerCase(),
          password: password, // Store password for verification
          fullName: newUser.fullName,
          isPremium: true,
          memberSince: newUser.memberSince,
          streak: newUser.streak,
          storiesReadCount: newUser.storiesReadCount,
          minutesReadCount: newUser.minutesReadCount,
        });
        localStorage.setItem('omar_stories_registered_users', JSON.stringify(registeredUsers));
      }

      // Persist active session locally
      localStorage.setItem('omar_stories_user', JSON.stringify(newUser));
      onRegisterSuccess(newUser);
    }, 800);
  };

  return (
    <div
      id="register-view-container"
      className="min-h-screen w-full flex flex-col items-center bg-white text-slate-700 font-sans pb-12 overflow-y-auto"
    >
      {/* Top Leather-bound Book Illustration Row */}
      <div className="relative w-full h-[240px] md:h-[280px] bg-slate-900 overflow-hidden flex flex-col justify-end items-center px-4 pb-6">
        <img
          id="register-cover-image"
          src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800"
          alt="Leather Book Sanctuary"
          className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity brightness-75 scale-105"
          referrerPolicy="no-referrer"
        />
        {/* Soft elegant vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/30" />
        
        {/* Floating Headers */}
        <div className="relative z-10 text-center">
          <h1
            id="register-cover-title"
            className="font-serif text-4xl md:text-5xl text-slate-900 font-bold tracking-tight drop-shadow-sm select-none"
          >
            Omar Stories
          </h1>
          <p
            id="register-cover-subtitle"
            className="text-slate-600 text-xs md:text-sm tracking-wider uppercase font-bold mt-2 select-none opacity-80"
          >
            Create your sanctuary for stories
          </p>
        </div>
      </div>

      {/* Main Registration Box */}
      <div className="w-full max-w-md px-6 mt-6 flex flex-col">
        {/* Error reporting */}
        {error && (
          <div
            id="register-error-banner"
            className="p-3 text-xs text-red-600 bg-red-50 rounded-xl border border-red-100 flex items-center justify-center font-medium mb-4"
          >
            {error}
          </div>
        )}

        {/* Inputs */}
        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          
          {/* Full Name Field */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 pointer-events-none">
                <UserIcon className="w-5 h-5" />
              </span>
              <input
                id="register-fullname"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Johnathan Doe"
                className="w-full pl-11 pr-4 py-3 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 rounded-2xl outline-hidden transition-all duration-200 text-sm font-medium"
              />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
              Email
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 pointer-events-none">
                <Mail className="w-5 h-5" />
              </span>
              <input
                id="register-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full pl-11 pr-4 py-3 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 rounded-2xl outline-hidden transition-all duration-200 text-sm font-medium"
              />
            </div>
          </div>

          {/* Username Field */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
              Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 pointer-events-none">
                <AtSign className="w-5 h-5" />
              </span>
              <input
                id="register-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="johndoe_stories"
                className="w-full pl-11 pr-4 py-3 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 rounded-2xl outline-hidden transition-all duration-200 text-sm font-medium"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 pointer-events-none">
                <Lock className="w-5 h-5" />
              </span>
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-11 py-3 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 rounded-2xl outline-hidden transition-all duration-200 text-sm tracking-widest"
              />
              <button
                id="register-toggle-password"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Large Gold SAVE button */}
          <button
            id="register-save-button"
            type="submit"
            disabled={loading}
            className="w-full bg-gold-400 hover:bg-gold-500 disabled:opacity-50 text-slate-900 font-bold py-4 rounded-3xl mt-6 cursor-pointer flex items-center justify-center space-x-2 shadow-md active:scale-98 transition-all duration-200 text-sm uppercase tracking-wider font-semibold"
          >
            <span>{loading ? 'Creating Sanctuary...' : 'SAVE'}</span>
          </button>
        </form>

        {/* Existing account redirect */}
        <div className="text-center mt-4">
          <p className="text-sm text-slate-500 font-medium">
            Already have an account?{' '}
            <button
              id="register-navigate-login"
              onClick={onNavigateToLogin}
              className="text-gold-500 font-bold hover:text-gold-600 transition-colors cursor-pointer ml-1"
            >
              Login
            </button>
          </p>
        </div>

        {/* Alternative connection */}
        <div className="w-full flex items-center my-6">
          <div className="flex-1 border-t border-slate-200" />
          <span className="px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">or join with</span>
          <div className="flex-1 border-t border-slate-200" />
        </div>

        {/* Apple & Google Side-by-Side buttons */}
        <div className="w-full grid grid-cols-2 gap-4">
          <button
            id="register-google-oauth"
            onClick={onNavigateToLogin}
            className="flex items-center justify-center space-x-2 py-3 border border-slate-200 hover:bg-slate-50 rounded-2xl transition-all font-medium text-slate-700 text-sm cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Google</span>
          </button>
          
          <button
            id="register-apple-oauth"
            onClick={onNavigateToLogin}
            className="flex items-center justify-center space-x-2 py-3 border border-slate-200 hover:bg-slate-50 rounded-2xl transition-all font-medium text-slate-700 text-sm cursor-pointer"
          >
            <svg className="w-5 h-5 fill-slate-800" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.5-.64.74-1.2 1.88-1.05 3 .12-.04 2.34-.63 3-.14" />
            </svg>
            <span>Apple</span>
          </button>
        </div>
      </div>
    </div>
  );
};
