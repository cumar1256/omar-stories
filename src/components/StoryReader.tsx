/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Story, Review, UserPreferences, User } from '../types';
import { INITIAL_REVIEWS } from '../data';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Settings,
  Type,
  BookOpen,
  Bookmark,
  Star,
  Play,
  Square,
  MessageSquare,
  User as UserIcon,
  Send,
  Sparkles
} from 'lucide-react';

interface StoryReaderProps {
  story: Story;
  currentUser: User;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onBackToSanctuary: () => void;
  onIncrementReads: () => void;
}

export const StoryReader: React.FC<StoryReaderProps> = ({
  story,
  currentUser,
  isBookmarked,
  onToggleBookmark,
  onBackToSanctuary,
  onIncrementReads,
}) => {
  // Reading preferences
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'navy',
    fontSize: 'lg',
    fontFamily: 'serif',
    autoScrollSpeed: 0,
  });

  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  
  // Review form states
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userRating, setUserRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Auto scroll scrolling logic
  const contentContainerRef = useRef<HTMLDivElement>(null);
  const autoScrollTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load reviews specific to this story
  useEffect(() => {
    const matched = INITIAL_REVIEWS.filter((r) => r.storyId === story.id);
    setReviews(matched);
    setCurrentChapterIndex(0);
    
    // Auto increment read statistics when opening
    onIncrementReads();

    return () => {
      if (autoScrollTimerRef.current) {
        clearInterval(autoScrollTimerRef.current);
      }
    };
  }, [story.id]);

  // Handle auto-scroll timer
  useEffect(() => {
    if (autoScrollTimerRef.current) {
      clearInterval(autoScrollTimerRef.current);
      autoScrollTimerRef.current = null;
    }

    if (preferences.autoScrollSpeed > 0 && contentContainerRef.current) {
      // Set scroll step intervals depending on speed (e.g. 100 - 500 wpm mapped to intervals)
      const intervalMs = Math.max(20, 150 - preferences.autoScrollSpeed);
      autoScrollTimerRef.current = setInterval(() => {
        if (contentContainerRef.current) {
          contentContainerRef.current.scrollTop += 1.2;
        }
      }, intervalMs);
    }

    return () => {
      if (autoScrollTimerRef.current) {
        clearInterval(autoScrollTimerRef.current);
      }
    };
  }, [preferences.autoScrollSpeed]);

  const chapters = story.chapters || [
    {
      title: 'Default Chapter',
      content: story.content || ['No content available for this chapter.'],
    },
  ];

  const currentChapter = chapters[currentChapterIndex];

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    const newReview: Review = {
      id: `custom_r_${Date.now()}`,
      storyId: story.id,
      username: currentUser.username,
      rating: userRating,
      text: reviewText,
      date: 'Just now',
    };

    setReviews([newReview, ...reviews]);
    setReviewText('');
    setSuccessMsg('Thank you! Your editorial review has been added to the sanctuary ledger.');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Maps for custom tailwind styling based on preference states
  const bgThemeMap = {
    light: 'bg-[#fafafa] text-slate-900 border-slate-200',
    paper: 'bg-[#f5ebd6] text-amber-950 border-[#ebdcb9]',
    charcoal: 'bg-[#18181b] text-zinc-100 border-zinc-800',
    navy: 'bg-[#030d22] text-[#e2e8f0] border-[#0a1b3a]',
  };

  const fontTypeMap = {
    sans: 'font-sans leading-relaxed tracking-normal',
    serif: 'font-serif leading-loose tracking-wide',
    mono: 'font-mono leading-relaxed text-sm',
  };

  const fontSizeMap = {
    sm: 'text-sm md:text-base',
    md: 'text-base md:text-lg',
    lg: 'text-lg md:text-xl',
    xl: 'text-xl md:text-2xl',
    '2xl': 'text-2xl md:text-3xl',
  };

  return (
    <div
      id="reader-main-panel"
      className={`min-h-screen w-full flex flex-col transition-colors duration-300 ${bgThemeMap[preferences.theme]}`}
    >
      {/* Immersive Reader Top Bar */}
      <header
        id="reader-top-bar"
        className={`sticky top-0 z-40 px-4 md:px-8 py-4 flex items-center justify-between border-b ${
          preferences.theme === 'light' || preferences.theme === 'paper' ? 'bg-white/80' : 'bg-black/40'
        } backdrop-blur-md`}
      >
        <div className="flex items-center space-x-3">
          <button
            id="reader-back-to-home"
            onClick={onBackToSanctuary}
            className="p-2 rounded-xl bg-slate-500/10 hover:bg-slate-500/20 text-inherit transition-all cursor-pointer"
            title="Return to Sanctuary"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="max-w-[160px] md:max-w-xs">
            <h3 className="font-serif font-bold text-sm md:text-base truncate">{story.title}</h3>
            <p className="text-xs opacity-75 truncate">By {story.author}</p>
          </div>
        </div>

        {/* Top bar control actions */}
        <div className="flex items-center space-x-2">
          {story.isGold && (
            <span className="hidden sm:inline-flex bg-gold-400 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded-sm tracking-widest mr-2 uppercase">
              GOLD
            </span>
          )}

          {/* Settings trigger */}
          <button
            id="reader-preference-toggle"
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-xl transition-all ${
              showSettings ? 'bg-gold-400 text-slate-900' : 'bg-slate-500/10 hover:bg-slate-500/20'
            } cursor-pointer`}
            title="Typography Settings"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* Bookmark trigger */}
          <button
            id="reader-bookmark-toggle"
            onClick={onToggleBookmark}
            className={`p-2 rounded-xl transition-all ${
              isBookmarked ? 'bg-gold-400 text-slate-900 scale-105' : 'bg-slate-500/10 hover:bg-slate-500/20'
            } cursor-pointer`}
            title="Toggle Bookmark"
          >
            <Bookmark className="w-5 h-5 fill-current" strokeWidth={isBookmarked ? 0 : 2} />
          </button>
        </div>
      </header>

      {/* Floating Preferences Overlay Drawer */}
      {showSettings && (
        <div
          id="reader-preferences-drawer"
          className={`mx-4 md:mx-8 my-3 p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl z-30 transition-all ${
            preferences.theme === 'light' || preferences.theme === 'paper'
              ? 'bg-white text-slate-800 border-slate-200'
              : 'bg-slate-900 text-slate-100 border-slate-800'
          }`}
        >
          {/* Theme Palette Choice */}
          <div className="flex-1">
            <span className="text-xs font-bold uppercase tracking-wider block mb-2.5 opacity-75">Reading Canvas Theme</span>
            <div className="flex space-x-3">
              {(['light', 'paper', 'charcoal', 'navy'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setPreferences({ ...preferences, theme: t })}
                  className={`w-9 h-9 rounded-full relative border-2 flex items-center justify-center cursor-pointer transition-transform ${
                    t === 'light' ? 'bg-[#fafafa]' : t === 'paper' ? 'bg-[#f5ebd6]' : t === 'charcoal' ? 'bg-[#18181b]' : 'bg-[#030d22]'
                  } ${preferences.theme === t ? 'border-gold-400 scale-110 shadow-md' : 'border-slate-500/30 hover:scale-105'}`}
                  title={`${t} mode`}
                >
                  {preferences.theme === t && (
                    <span className={`w-2.5 h-2.5 rounded-full ${t === 'light' || t === 'paper' ? 'bg-slate-800' : 'bg-gold-400'}`} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Fonts Styles */}
          <div className="flex-1">
            <span className="text-xs font-bold uppercase tracking-wider block mb-2.5 opacity-75">Typography Vibe</span>
            <div className="flex bg-slate-500/10 p-1 rounded-xl max-w-sm">
              {(['serif', 'sans', 'mono'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setPreferences({ ...preferences, fontFamily: f })}
                  className={`flex-1 text-center py-1.5 px-3 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                    preferences.fontFamily === f
                      ? 'bg-gold-400 text-slate-900 shadow-xs'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Typography Sizes */}
          <div className="flex-1">
            <span className="text-xs font-bold uppercase tracking-wider block mb-2.5 opacity-75">Font scale</span>
            <div className="flex bg-slate-500/10 p-1 rounded-xl max-w-sm">
              {(['sm', 'md', 'lg', 'xl'] as const).map((sz) => (
                <button
                  key={sz}
                  onClick={() => setPreferences({ ...preferences, fontSize: sz as any })}
                  className={`flex-1 text-center py-1.5 px-2 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                    preferences.fontSize === sz
                      ? 'bg-gold-400 text-slate-900 shadow-xs'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Autoscroll Slider */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold uppercase tracking-wider opacity-75">Auto scroll speed</span>
              <span className="text-xs font-mono font-bold text-gold-500">
                {preferences.autoScrollSpeed === 0 ? 'PAUSED' : `${preferences.autoScrollSpeed} WPM`}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setPreferences({ ...preferences, autoScrollSpeed: preferences.autoScrollSpeed === 0 ? 50 : 0 })}
                className="p-1.5 rounded-lg bg-slate-500/20 text-inherit hover:bg-slate-500/30 cursor-pointer"
              >
                {preferences.autoScrollSpeed > 0 ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={preferences.autoScrollSpeed}
                onChange={(e) => setPreferences({ ...preferences, autoScrollSpeed: parseInt(e.target.value) })}
                className="w-full accent-gold-400 h-1 rounded-lg bg-slate-500/20"
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Immersive Paper/Reading Box */}
      <div
        id="reader-scrollable-content-wrapper"
        ref={contentContainerRef}
        className="flex-1 overflow-y-auto px-6 py-10 md:py-16 md:px-12 flex justify-center scroll-smooth min-h-[350px]"
      >
        <article className="w-full max-w-2xl flex flex-col justify-between">
          
          {/* Title row */}
          <div className="text-center mb-10 select-none">
            <span className="text-xs font-mono font-bold text-gold-500 tracking-widest uppercase block mb-3">
              {story.category} • Sanctuary Room
            </span>
            <h1 className="font-serif text-3xl md:text-5xl font-bold tracking-tight mb-4 drop-shadow-xs">
              {currentChapter.title}
            </h1>
            <div className="w-16 h-1 bg-gold-400 mx-auto rounded-full my-4" />
            <p className="text-xs md:text-sm font-medium opacity-60">
              Penmanship of <span className="font-semibold text-gold-500">{story.author}</span> • {story.publishedDate}
            </p>
          </div>

          {/* Main paragraphs */}
          <div
            id="reader-typography-core"
            className={`${fontTypeMap[preferences.fontFamily]} ${fontSizeMap[preferences.fontSize]} hover:subpixel-antialiased transition-all duration-200`}
          >
            {/* If there's a chapter summary, render a nice blockquote */}
            {currentChapterIndex === 0 && (
              <p className="p-4 md:p-6 mb-8 border-l-4 border-gold-400 rounded-r-2xl italic font-serif shadow-xs opacity-85 select-none text-base bg-slate-500/5 leading-relaxed">
                "{story.summary}"
              </p>
            )}

            {currentChapter.content.map((para, idx) => (
              <p
                key={idx}
                className="mb-6 text-justify indent-4 leading-relaxed tracking-wide select-text selection:bg-gold-300 selection:text-slate-900"
              >
                {para}
              </p>
            ))}
          </div>

          {/* Chapter Navigation Buttons */}
          <div id="reader-chapter-controls" className="w-full flex items-center justify-between border-t border-b border-dashed border-slate-500/20 py-8 my-12">
            <button
              id="reader-prev-chapter"
              onClick={() => {
                if (currentChapterIndex > 0) {
                  setCurrentChapterIndex(currentChapterIndex - 1);
                  if (contentContainerRef.current) contentContainerRef.current.scrollTop = 0;
                }
              }}
              disabled={currentChapterIndex === 0}
              className="flex items-center space-x-1.5 py-2.5 px-4 rounded-xl bg-slate-500/10 hover:bg-slate-500/20 disabled:opacity-30 disabled:hover:bg-slate-500/10 transition-colors font-bold text-xs select-none cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>PREVIOUS</span>
            </button>

            <span className="text-xs font-mono font-bold select-none text-gold-500 bg-gold-400/10 px-3 py-1 rounded-full uppercase tracking-wider">
              CHAPTER {currentChapterIndex + 1} OF {chapters.length}
            </span>

            <button
              id="reader-next-chapter"
              onClick={() => {
                if (currentChapterIndex < chapters.length - 1) {
                  setCurrentChapterIndex(currentChapterIndex + 1);
                  if (contentContainerRef.current) contentContainerRef.current.scrollTop = 0;
                } else {
                  onBackToSanctuary();
                }
              }}
              className="flex items-center space-x-1.5 py-2.5 px-5 rounded-xl bg-gold-400 text-slate-800 hover:bg-gold-500 font-bold text-xs select-none hover:scale-103 cursor-pointer transition-transform"
            >
              <span>{currentChapterIndex === chapters.length - 1 ? 'CONCLUDE' : 'NEXT CHAPTER'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Editorial / Reader Reviews Ledger */}
          <div id="reader-editorial-ledger" className="mt-8 border-t border-slate-500/10 pt-10">
            <div className="flex items-center space-x-2.5 mb-6 select-none">
              <MessageSquare className="w-5 h-5 text-gold-500" />
              <h4 className="font-serif text-xl font-bold">Editorial Ledger Reviews</h4>
              <span className="text-xs bg-slate-500/20 font-mono px-2 py-0.5 rounded-full opacity-80 font-bold">
                {reviews.length} total
              </span>
            </div>

            {/* Success message banner */}
            {successMsg && (
              <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold rounded-xl text-center mb-6 animate-pulse">
                {successMsg}
              </div>
            )}

            {/* Leave a review form */}
            <form onSubmit={handleReviewSubmit} className="p-5 rounded-2xl bg-slate-500/5 border border-slate-500/10 mb-8 space-y-4">
              <span className="text-xs tracking-wider font-bold uppercase opacity-85 block select-none">Add Your Voice to the Sanctuary</span>
              
              <div className="flex items-center space-x-2 select-none">
                <span className="text-xs font-medium opacity-75">Your Rating:</span>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setUserRating(star)}
                      className="transition-transform hover:scale-110 cursor-pointer"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= userRating ? 'fill-gold-400 text-gold-400' : 'text-slate-400/40'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Record your thoughts or reflections..."
                  rows={3}
                  className="w-full rounded-xl bg-slate-500/10 border border-slate-500/10 focus:border-gold-400 focus:bg-slate-500/5 outline-hidden p-3.5 text-sm leading-relaxed"
                />
                <button
                  type="submit"
                  className="absolute right-3.5 bottom-4 p-2 rounded-lg bg-gold-400 text-slate-900 font-bold hover:scale-105 active:scale-95 cursor-pointer transition-transform"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Reviews display list */}
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div key={rev.id} className="p-4 rounded-xl border border-slate-500/10 bg-slate-500/5 flex flex-col space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-gold-400/10 border border-gold-400/30 flex items-center justify-center text-gold-500 font-bold">
                        <UserIcon className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-gold-500">@{rev.username}</span>
                    </div>
                    <span className="opacity-50">{rev.date}</span>
                  </div>

                  {/* Rating as stars */}
                  <div className="flex space-x-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < rev.rating ? 'fill-gold-400 text-gold-400' : 'text-slate-400/20'
                        }`}
                      />
                    ))}
                  </div>

                  <p className="text-sm font-sans leading-relaxed opacity-85 text-justify">{rev.text}</p>
                </div>
              ))}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};
