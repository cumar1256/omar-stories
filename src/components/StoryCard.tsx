/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Story } from '../types';
import { Star, Clock } from 'lucide-react';

interface StoryCardProps {
  story: Story;
  onReadClick: (story: Story) => void;
}

export const StoryCard: React.FC<StoryCardProps> = ({
  story,
  onReadClick,
}) => {
  return (
    <div
      id={`story-card-${story.id}`}
      onClick={() => onReadClick(story)}
      className="w-full flex bg-[#0d162f] hover:bg-[#111e3f] border border-slate-500/10 hover:border-gold-400/30 rounded-2xl p-4 cursor-pointer transition-all duration-300 transform hover:scale-[1.01] hover:shadow-lg shadow-gold-500/5 group text-slate-100"
    >
      {/* Left Column: Virtual Cover Mockup */}
      <div className="relative w-28 h-40 md:w-32 md:h-44 flex-shrink-0 bg-slate-950 rounded-xl overflow-hidden shadow-md mr-4 group-hover:shadow-gold-500/5">
        <img
          src={story.coverUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=600'}
          alt={story.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
          referrerPolicy="no-referrer"
        />
        {/* Shadow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Book spine line overlay simulation */}
        <div className="absolute left-0 inset-y-0 w-1.5 bg-black/30 backdrop-blur-xs border-r border-[#ffffff0a]" />

        {/* GOLD badge on cover bottom right */}
        {story.isGold && (
          <div className="absolute bottom-2.5 right-2 bg-gold-400 text-slate-900 text-[9px] font-extrabold px-1.5 py-0.5 rounded-sm tracking-widest uppercase shadow-sm">
            GOLD
          </div>
        )}
      </div>

      {/* Right Column: Descriptions & Details */}
      <div className="flex-1 flex flex-col justify-between py-1">
        <div>
          {/* Category micro indicator & Somali badge */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#a1b8d2] uppercase">
              {story.category}
            </span>
            {story.originalLanguage === 'Somali' && (
              <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-[9px] font-bold font-mono uppercase rounded-md border border-emerald-500/15">
                <span>🇸🇴 Af-Soomaali</span>
              </span>
            )}
            {(story.id.startsWith('uploaded_') || story.id.startsWith('man_') || story.id.startsWith('ai_') || story.id.startsWith('draft_')) && (
              <span className="inline-flex items-center px-1.5 py-0.5 bg-sky-500/15 text-sky-400 text-[9px] font-bold font-mono uppercase rounded-md">
                <span>👥 Community</span>
              </span>
            )}
          </div>
          
          {/* Main Title of Book */}
          <h4 className="font-serif font-bold text-base md:text-lg text-white group-hover:text-gold-300 transition-colors line-clamp-1 mt-0.5">
            {story.title}
          </h4>

          {/* Author in Gold Penmanship */}
          <p className="text-xs font-semibold text-gold-400 mt-0.5">
            By {story.author}
          </p>

          {/* Core Snippet Statement */}
          <p className="text-xs text-slate-400/95 font-sans leading-relaxed line-clamp-2 mt-2">
            {story.summary}
          </p>
        </div>

        {/* Footer Statistics Indicators matches mockup */}
        <div className="flex items-center space-x-4 mt-3 pt-2 text-slate-400 text-[11px] font-mono border-t border-[#ffffff0a]">
          <div className="flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{story.readTime} read</span>
          </div>

          <div className="flex items-center space-x-1 font-bold text-white">
            <Star className="w-3.5 h-3.5 fill-gold-400 text-gold-400" />
            <span>{story.rating.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
