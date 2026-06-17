/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Chapter {
  title: string;
  content: string[];
}

export interface Story {
  id: string;
  title: string;
  author: string;
  category: string;
  summary: string;
  content?: string[]; // fallback default single-chapter content
  chapters?: Chapter[];
  readTime: string;
  rating: number;
  isGold: boolean;
  coverUrl?: string;
  coverGradient?: string;
  publishedDate: string;
  reviewsCount: number;
  originalLanguage?: string;
}

export interface User {
  username: string;
  email: string;
  fullName: string;
  isPremium: boolean;
  memberSince: string;
  streak: number;
  storiesReadCount: number;
  minutesReadCount: number;
}

export interface Review {
  id: string;
  storyId: string;
  username: string;
  rating: number;
  text: string;
  date: string;
}

export type Category = 'Romance' | 'Adventure' | 'Islamic Stories' | 'Sci-Fi' | 'Wisdom' | 'Mystery' | 'History';

export interface UserPreferences {
  theme: 'paper' | 'charcoal' | 'navy' | 'light';
  fontSize: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  fontFamily: 'serif' | 'sans' | 'mono';
  autoScrollSpeed: number; // 0 = off, else words per minute
}
