/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { OmarLogo } from './OmarLogo';
import { Sparkles, BookOpen } from 'lucide-react';

interface LogoViewProps {
  onEnter?: () => void;
  showButton?: boolean;
}

export const LogoView: React.FC<LogoViewProps> = ({
  onEnter,
  showButton = false,
}) => {
  const [progress, setProgress] = useState(40);
  const [faded, setFaded] = useState(false);

  useEffect(() => {
    // Animate search loader progress
    const timer = setInterval(() => {
      setProgress((old) => {
        if (old >= 100) {
          clearInterval(timer);
          // Auto-trigger entrance once progress completes
          if (onEnter) {
            setTimeout(onEnter, 200);
          }
          return 100;
        }
        return old + 2.5;
      });
    }, 25);

    // Fade in text elements
    const fadeTimer = setTimeout(() => {
      setFaded(true);
    }, 150);

    return () => {
      clearInterval(timer);
      clearTimeout(fadeTimer);
    };
  }, [onEnter]);

  return (
    <div
      id="branding-logo-splash"
      onClick={onEnter}
      className="min-h-screen w-full flex flex-col items-center justify-between pb-12 pt-20 px-6 bg-[#fdfbf7] text-[#031330] font-sans relative overflow-hidden cursor-pointer select-none"
    >
      {/* Background radial soft golden parchment tint blobs */}
      <div className="absolute inset-x-0 top-0 h-[500px] bg-gradient-to-b from-amber-50/60 via-amber-200/5 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#d6af3610_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none" />

      {/* Decorative Astrolabe Celestial Orbit Lines */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full border border-gold-400/10 pointer-events-none animate-spin-slow" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full border border-dashed border-gold-400/5 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full border border-gold-400/5 pointer-events-none" />

      {/* Centered Master Logo Layout */}
      <div className="w-full flex-1 flex flex-col items-center justify-center relative z-10">
        {/* Animated logo zoom entering */}
        <div className={`transition-all duration-1000 transform scale-95 ${faded ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
          <OmarLogo size="xl" showText={false} className="filter drop-shadow-[0_15px_30px_rgba(214,175,54,0.22)] border-0" />
        </div>

        {/* Elegant typography details */}
        <div className={`text-center space-y-3 mt-8 transition-all duration-1000 delay-300 transform ${faded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h1 className="font-serif font-extrabold text-[#031330] text-4xl md:text-5xl tracking-tight select-none">
            Omar Stories
          </h1>
          <div className="flex items-center justify-center space-x-2">
            <span className="h-px w-6 bg-gold-400/40" />
            <p className="text-[10px] md:text-xs font-mono font-bold tracking-[0.25em] text-[#b08923] uppercase">
              A Sanctuary of Narrative Art
            </p>
            <span className="h-px w-6 bg-gold-400/40" />
          </div>
          <p className="text-xs text-slate-500/80 font-serif italic max-w-xs mx-auto pt-1">
            "Where thoughts unfold upon permanent parchment leaf, and starlight inspires chapters."
          </p>
        </div>

        {/* Progress Load percentage bar representation */}
        {!showButton && (
          <div className={`w-48 mt-12 bg-slate-100 border border-slate-500/5 h-1.5 rounded-full overflow-hidden transition-all duration-700 delay-500 relative ${faded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <div
              className="bg-gradient-to-r from-gold-400 to-gold-500 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Manual Enter Screen option, if configured as diagnostic tool view */}
        {showButton && onEnter && (
          <button
            id="splash-enter-manually-cta"
            onClick={onEnter}
            className="mt-12 bg-gold-400 hover:bg-gold-500 text-slate-900 font-extrabold px-8 py-3.5 rounded-3xl text-xs uppercase tracking-widest flex items-center space-x-2 shadow-lg shadow-gold-500/10 cursor-pointer active:scale-95 transition-all duration-200"
          >
            <BookOpen className="w-4 h-4" />
            <span>Enter the Sanctuary</span>
          </button>
        )}
      </div>

      {/* Footer Branding Trademark Logs */}
      <div className={`text-center transition-all duration-1000 delay-700 relative z-10 ${faded ? 'opacity-50' : 'opacity-0'}`}>
        <p className="text-[10px] font-mono tracking-widest text-slate-400">
          SECURE CREDENTIAL PASSAGE • V.1.0.3
        </p>
      </div>
    </div>
  );
};
