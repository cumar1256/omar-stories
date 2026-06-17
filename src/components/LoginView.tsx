/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User } from '../types';
import { OmarLogo } from './OmarLogo';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, Compass, UserCheck } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
  onNavigateToRegister?: () => void;
  onNavigateToForgot?: () => void;
  onShowSplash?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  onNavigateToRegister,
  onShowSplash,
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [error, setError] = useState('');

  // The single, pre-defined exclusive administrator identity
  const ADMIN_EMAIL = 'omarwhatbest@gmail.com';
  const ADMIN_USERNAME = 'omar_alfarsi';
  const ADMIN_PASSWORD = 'admin';

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const inputCleaned = identifier.trim().toLowerCase();
    const passCleaned = password.trim();

    if (!inputCleaned) {
      setError('Please enter your username or email address');
      return;
    }
    if (!passCleaned) {
      setError('Please enter your password');
      return;
    }

    // 1. Direct check: Is it the single preloaded Administrator (Omar)?
    const isMatchingAdminInfo = (inputCleaned === ADMIN_EMAIL || inputCleaned === 'admin' || inputCleaned === ADMIN_USERNAME);
    const isMatchingAdminPass = (passCleaned.toLowerCase() === ADMIN_PASSWORD);

    if (isMatchingAdminInfo && isMatchingAdminPass) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        const adminUser: User = {
          username: ADMIN_USERNAME,
          email: ADMIN_EMAIL,
          fullName: 'Omar Al-Farsi',
          isPremium: true,
          memberSince: 'May 2025',
          streak: 18,
          storiesReadCount: 30,
          minutesReadCount: 420,
        };

        localStorage.setItem('omar_stories_user', JSON.stringify(adminUser));
        onLoginSuccess(adminUser);
      }, 850);
      return;
    }

    // 2. Checking Registered Users list in localStorage
    const storedUsersJSON = localStorage.getItem('omar_stories_registered_users');
    const registeredUsers = storedUsersJSON ? JSON.parse(storedUsersJSON) : [];

    const matchedUser = registeredUsers.find(
      (u: any) => (u.email.toLowerCase() === inputCleaned || u.username.toLowerCase() === inputCleaned) && u.password === passCleaned
    );

    if (matchedUser) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        const loggedUser: User = {
          username: matchedUser.username,
          email: matchedUser.email,
          fullName: matchedUser.fullName,
          isPremium: matchedUser.isPremium ?? true,
          memberSince: matchedUser.memberSince ?? 'June 2026',
          streak: matchedUser.streak ?? 1,
          storiesReadCount: matchedUser.storiesReadCount ?? 0,
          minutesReadCount: matchedUser.minutesReadCount ?? 0,
        };

        localStorage.setItem('omar_stories_user', JSON.stringify(loggedUser));
        onLoginSuccess(loggedUser);
      }, 750);
      return;
    }

    setError('Access Denied: Invalid credentials. Check your email/username and password, or create a new account.');
  };

  const handleGuestAccess = () => {
    setError('');
    setGuestLoading(true);

    setTimeout(() => {
      const guestReader: User = {
        username: 'guest_reader',
        email: 'guest@omarstories.com',
        fullName: 'Guest Pilgrim',
        isPremium: true, // Gift premium reading privileges to general guests
        memberSince: 'June 2026',
        streak: 1,
        storiesReadCount: 1,
        minutesReadCount: 15,
      };

      localStorage.setItem('omar_stories_user', JSON.stringify(guestReader));
      setGuestLoading(false);
      onLoginSuccess(guestReader);
    }, 600);
  };

  const handleGoogleLogin = () => {
    setError('');
    setGoogleLoading(true);
    
    // Simulate connection
    setTimeout(() => {
      const googleUser: User = {
        username: 'google_pilgrim',
        email: 'pilgrim.google@example.com',
        fullName: 'Google Pilgrim',
        isPremium: true,
        memberSince: 'June 2026',
        streak: 1,
        storiesReadCount: 3,
        minutesReadCount: 45,
      };
      
      localStorage.setItem('omar_stories_user', JSON.stringify(googleUser));
      setGoogleLoading(false);
      onLoginSuccess(googleUser);
    }, 1200);
  };

  const handleAppleLogin = () => {
    setError('');
    setAppleLoading(true);
    
    // Simulate Apple ID verification
    setTimeout(() => {
      const appleUser: User = {
        username: 'apple_pilgrim',
        email: 'pilgrim.apple@example.com',
        fullName: 'Apple Pilgrim',
        isPremium: true,
        memberSince: 'June 2026',
        streak: 1,
        storiesReadCount: 2,
        minutesReadCount: 30,
      };
      
      localStorage.setItem('omar_stories_user', JSON.stringify(appleUser));
      setAppleLoading(false);
      onLoginSuccess(appleUser);
    }, 1200);
  };

  return (
    <div
      id="login-view-container"
      className="min-h-screen w-full flex flex-col items-center justify-between pb-8 pt-12 px-6 bg-radial from-[#fdfaf2] via-white to-white text-slate-700 font-sans relative"
    >
      {/* HANDSHAKE LOADING OVERLAYS */}
      {(googleLoading || appleLoading || guestLoading) && (
        <div className="fixed inset-0 bg-[#03091c]/95 z-55 flex flex-col items-center justify-center p-8 text-center animate-fade-in pointer-events-auto">
          <div className="relative flex items-center justify-center mb-8">
            <div className="w-16 h-16 rounded-full border-4 border-solid border-slate-500/10 border-t-gold-400 animate-spin" />
            <span className="absolute text-2xl">
              {guestLoading ? "📖" : "🛡️"}
            </span>
          </div>
          
          <div className="space-y-3 max-w-sm">
            <h3 className="font-serif text-2xl font-bold text-white">
              {guestLoading 
                ? "Entering Sanctuary" 
                : googleLoading 
                ? "Connecting with Google" 
                : "Connecting with Apple"
              }
            </h3>
            <p className="text-xs font-mono text-gold-400 uppercase tracking-widest animate-pulse">
              Opening scrolls...
            </p>
          </div>
        </div>
      )}

      {/* Background ambient radial glow */}
      <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-amber-50/40 via-amber-50/10 to-transparent pointer-events-none -z-10" />

      {/* Main Login Frame */}
      <div className="w-full max-w-md flex flex-col items-center">
        {/* Brand Logo and Title */}
        <div
          onClick={onShowSplash}
          className={`${onShowSplash ? 'cursor-pointer hover:scale-105 active:scale-95 transition-transform' : ''}`}
          title={onShowSplash ? "View Brand Splash Screen" : undefined}
        >
          <OmarLogo size="md" showText={false} className="mb-4" />
        </div>
        
        <div className="flex items-center space-x-1 bg-amber-500/10 text-amber-800 border border-amber-500/20 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest select-none mb-1">
          <ShieldCheck className="w-3.5 h-3.5 mr-1" />
          <span>Sanctuary Entrance</span>
        </div>

        <h2
          id="login-header-title"
          className="font-serif text-3xl text-[#031330] font-bold text-center mt-2 tracking-tight"
        >
          Sanctuary Portal
        </h2>
        
        <p
          id="login-header-subtitle"
          className="text-slate-500 text-center text-xs md:text-sm mt-2 max-w-xs font-medium"
        >
          Step inside a magnificent treasury of tailored stories and infinite narratives.
        </p>

        {/* login Form */}
        <form onSubmit={handleLoginSubmit} className="w-full mt-6 space-y-4">
          {error && (
            <div
              id="login-error-alert"
              className="p-3 text-xs text-red-600 bg-red-50 rounded-xl border border-red-100 flex items-center justify-center font-medium"
            >
              {error}
            </div>
          )}

          {/* Username Field */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
              Username or Email
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 pointer-events-none">
                <Mail className="w-5 h-5" />
              </span>
              <input
                id="login-username-input"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Name or Email"
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 rounded-2xl outline-hidden transition-all duration-200 text-sm placeholder-slate-400/50 font-medium text-slate-800"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 pointer-events-none">
                <Lock className="w-5 h-5" />
              </span>
              <input
                id="login-password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••"
                className="w-full pl-11 pr-11 py-3.5 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 rounded-2xl outline-hidden transition-all duration-200 text-sm placeholder-slate-400 tracking-widest text-[#031330]"
              />
              <button
                id="login-toggle-password-visibility"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Submit Credentials */}
          <button
            id="login-submit-button"
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-[#03091c] text-gold-400 font-extrabold py-4 rounded-3xl flex items-center justify-center space-x-2 shadow-lg shadow-black/10 cursor-pointer active:scale-98 transition-all duration-200 text-sm uppercase tracking-wider border border-gold-400/20 mt-2"
          >
            <span>{loading ? 'Entering Portal...' : 'Sign In'}</span>
            {!loading && <UserCheck className="w-4 h-4 ml-1" />}
          </button>
        </form>

        {/* Register Account Navigation Link */}
        {onNavigateToRegister && (
          <div className="text-center mt-5">
            <p className="text-sm text-slate-500 font-medium">
              Want to join the sanctuary?{' '}
              <button
                id="login-navigate-to-register-btn"
                type="button"
                onClick={onNavigateToRegister}
                className="text-gold-500 font-bold hover:text-gold-600 transition-colors cursor-pointer ml-1 underline decoration-gold-400/30 underline-offset-4"
              >
                Register / Add User
              </button>
            </p>
          </div>
        )}

        {/* Divider */}
        <div className="w-full flex items-center my-6">
          <div className="flex-1 border-t border-slate-200" />
          <span className="px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Or authenticate with</span>
          <div className="flex-1 border-t border-slate-200" />
        </div>

        {/* Google / Apple Sign In options */}
        <div className="w-full grid grid-cols-2 gap-4">
          <button
            id="login-google-oauth-trigger"
            type="button"
            onClick={handleGoogleLogin}
            className="flex items-center justify-center space-x-2.5 py-3 border border-slate-200 hover:bg-slate-50 rounded-2xl transition-all font-medium text-slate-700 text-sm cursor-pointer hover:border-gold-300"
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
            <span>Google SSO</span>
          </button>
          
          <button
            id="login-apple-oauth-trigger"
            type="button"
            onClick={handleAppleLogin}
            className="flex items-center justify-center space-x-2.5 py-3 border border-slate-200 hover:bg-slate-50 rounded-2xl transition-all font-medium text-slate-700 text-sm cursor-pointer hover:border-gold-300"
          >
            <svg className="w-5 h-5 fill-slate-800" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.5-.64.74-1.2 1.88-1.05 3 .12-.04 2.34-.63 3-.14" />
            </svg>
            <span>Apple ID</span>
          </button>
        </div>
      </div>

      {/* Guest bypass options to enter the reader platform safely */}
      <div className="w-full text-center mt-8 flex flex-col items-center space-y-4">
        <div className="w-full max-w-sm border-t border-slate-200/50 pt-6" />
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest">
          Generic Visitor / Reader Access
        </p>
        <button
          id="guest-read-only-access-cta"
          type="button"
          onClick={handleGuestAccess}
          className="px-6 py-3 bg-gold-400 hover:bg-gold-500 text-slate-900 font-extrabold rounded-2xl text-xs uppercase tracking-wider flex items-center space-x-2 transition-transform hover:scale-103 duration-200 shadow-md cursor-pointer"
        >
          <Compass className="w-4 h-4" />
          <span>Browse as Guest Reader (Read-Only)</span>
        </button>
      </div>
    </div>
  );
};
