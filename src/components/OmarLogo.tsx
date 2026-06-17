/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const OmarLogo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
}) => {
  const sizeMap = {
    sm: { box: 'w-10 h-10', icon: 'h-8', text: 'text-sm' },
    md: { box: 'w-24 h-24', icon: 'h-20', text: 'text-2xl' },
    lg: { box: 'w-32 h-32', icon: 'h-28', text: 'text-3xl' },
    xl: { box: 'w-48 h-48', icon: 'h-40', text: 'text-4xl' },
  };

  const selectedSize = sizeMap[size];

  return (
    <div id="omar-logo-container" className={`flex flex-col items-center justify-center select-none ${className}`}>
      {/* Outer container */}
      <div
        id="omar-logo-badge"
        className={`bg-white rounded-2xl flex items-center justify-center p-3 border border-slate-100 shadow-xs ${selectedSize.box}`}
      >
        <svg
          viewBox="0 0 100 100"
          className={`h-full w-full`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main Book Outline in Navy */}
          <path
            d="M50 82C40 76 18 78 12 78V18C20 18 42 21 50 25M50 82C60 76 82 78 88 78V18C80 18 58 21 50 25M50 82V25"
            stroke="#031330"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Inner details for Pages effect */}
          <path
            d="M15 75C22 75 42 77 47 79M15 71C22 71 42 73 47 75"
            stroke="#031330"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M85 75C78 75 58 77 53 79M85 71C78 71 58 73 53 75"
            stroke="#031330"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          
          {/* Cursive Gold OS Initials */}
          <text
            x="50%"
            y="56%"
            dominantBaseline="middle"
            textAnchor="middle"
            fill="url(#gold-gradient)"
            className="font-serif italic font-bold"
            fontSize="32"
            letterSpacing="-1"
          >
            OS
          </text>

          {/* Gold Gradient Definition */}
          <defs>
            <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d6af36" />
              <stop offset="50%" stopColor="#e9c44f" />
              <stop offset="100%" stopColor="#b08923" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      {/* Responsive Brand Text Underneath */}
      {showText && (
        <h1
          id="omar-logo-text"
          className={`font-serif tracking-tight text-[#031330] mt-3 font-semibold ${selectedSize.text}`}
        >
          Omar Stories
        </h1>
      )}
    </div>
  );
};
