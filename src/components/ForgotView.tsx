/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { OmarLogo } from './OmarLogo';
import { Mail, ArrowLeft } from 'lucide-react';

interface ForgotViewProps {
  onNavigateToLogin: () => void;
}

export const ForgotView: React.FC<ForgotViewProps> = ({
  onNavigateToLogin,
}) => {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid sanctuary email address.');
      return;
    }

    setSuccess(true);
  };

  return (
    <div
      id="forgot-password-panel"
      className="min-h-screen w-full flex flex-col items-center justify-between pb-8 pt-12 px-6 bg-radial from-[#fdfaf2] via-white to-white text-slate-700 font-sans"
    >
      <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-amber-50/40 via-amber-50/10 to-transparent pointer-events-none -z-10" />

      <div className="w-full max-w-md flex flex-col items-center">
        {/* Reusable Logo */}
        <OmarLogo size="sm" showText={false} className="mb-4" />
        
        <h2 className="font-serif text-3xl font-bold text-[#031330] tracking-tight text-center">
          Restore Sanctuary Entry
        </h2>
        
        <p className="text-slate-500 text-sm font-medium text-center mt-2 max-w-xs leading-relaxed">
          Record your email address. We will dispatch safe passage credentials immediately.
        </p>

        {success ? (
          <div className="w-full mt-8 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center space-y-4">
            <span className="text-3xl">🕊️</span>
            <h4 className="font-serif text-lg font-bold text-emerald-800">Dispatch Successful</h4>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Credentials dispatched safely to <span className="font-bold text-slate-800">{email}</span>. Click below to return to the sanctuary entrance.
            </p>
            <button
              onClick={onNavigateToLogin}
              className="mt-2 text-xs font-bold text-gold-500 hover:text-gold-600 uppercase tracking-widest"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleResetSubmit} className="w-full mt-8 space-y-5">
            {error && (
              <div className="p-3 text-xs text-red-600 bg-red-50 rounded-xl border border-red-100 flex items-center justify-center font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                Your Sanctuary Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 pointer-events-none">
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 rounded-2xl outline-hidden transition-all duration-200 text-sm font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gold-400 hover:bg-gold-500 text-slate-900 font-bold py-4 rounded-3xl flex items-center justify-center shadow-md cursor-pointer transition-all uppercase tracking-wider text-sm font-semibold active:scale-98"
            >
              <span>Dispatch Credentials</span>
            </button>

            <button
              type="button"
              onClick={onNavigateToLogin}
              className="w-full flex items-center justify-center space-x-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest pt-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>RETURN TO LOGIN</span>
            </button>
          </form>
        )}
      </div>

      <div className="text-sm text-slate-400 font-medium select-none">
        Omar Stories • Sanctuary Guidance
      </div>
    </div>
  );
};
