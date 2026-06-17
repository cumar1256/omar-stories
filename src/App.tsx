/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { User, Story, Category } from './types';
import { INITIAL_STORIES } from './data';
import { LoginView } from './components/LoginView';
import { RegisterView } from './components/RegisterView';
import { StoryReader } from './components/StoryReader';
import { StoryCard } from './components/StoryCard';
import { CustomStoryWriter } from './components/CustomStoryWriter';
import { LogoView } from './components/LogoView';
import { AdminPanel } from './components/AdminPanel';
import {
  Home,
  Search,
  Heart,
  User as UserIcon,
  PlusCircle,
  Bell,
  Sparkles,
  Bookmark,
  BookOpen,
  ArrowRight,
  LogOut,
  Flame,
  Award,
  History,
  TrendingUp,
  SlidersHorizontal,
  ChevronRight,
  Library,
  Edit3,
  X,
  Save
} from 'lucide-react';

export default function App() {
  // Session authentication state
  const [user, setUser] = useState<User | null>(null);
  const [screen, setScreen] = useState<'splash' | 'login' | 'register' | 'app' | 'admin'>('splash');

  // Verify if current user is the single authorized administrator
  const isAdmin = user?.email === 'omarwhatbest@gmail.com' || user?.username === 'omar_alfarsi' || user?.username === 'admin';
  
  // Dashboard navigation tabs
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'favorites' | 'profile'>('home');
  
  // Stories state - load initial or stored custom ones
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  
  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isWeavingMode, setIsWeavingMode] = useState(false);

  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  const handleStartEditingProfile = () => {
    if (user) {
      setEditFullName(user.fullName);
      setEditUsername(user.username);
      setEditEmail(user.email);
      setProfileError('');
      setProfileSuccess('');
      setIsEditingProfile(true);
    }
  };

  const handleSaveProfile = () => {
    if (!user) return;
    setProfileError('');
    setProfileSuccess('');

    const cleanedFullName = editFullName.trim();
    const cleanedUsername = editUsername.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
    const cleanedEmail = editEmail.trim().toLowerCase();

    if (!cleanedFullName) {
      setProfileError('Full name cannot be empty');
      return;
    }
    if (!cleanedUsername) {
      setProfileError('Username cannot be empty');
      return;
    }
    if (!cleanedEmail) {
      setProfileError('Email cannot be empty');
      return;
    }

    const updatedUser: User = {
      ...user,
      fullName: cleanedFullName,
      username: cleanedUsername,
      email: cleanedEmail
    };

    // Save active session
    setUser(updatedUser);
    localStorage.setItem('omar_stories_user', JSON.stringify(updatedUser));

    // Also update in registered users database to persist correctly
    const storedUsersJSON = localStorage.getItem('omar_stories_registered_users');
    if (storedUsersJSON) {
      try {
        const registeredUsers = JSON.parse(storedUsersJSON);
        const index = registeredUsers.findIndex((u: any) => u.email.toLowerCase() === user.email.toLowerCase() || u.username.toLowerCase() === user.username.toLowerCase());
        if (index !== -1) {
          registeredUsers[index] = {
            ...registeredUsers[index],
            fullName: cleanedFullName,
            username: cleanedUsername,
            email: cleanedEmail
          };
          localStorage.setItem('omar_stories_registered_users', JSON.stringify(registeredUsers));
        }
      } catch (err) {
        console.error('Error updating registered users list:', err);
      }
    }

    setProfileSuccess('Profile updated successfully!');
    setTimeout(() => {
      setIsEditingProfile(false);
      setProfileSuccess('');
    }, 1200);
  };

  // System notification details representation
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);

  // Broadcast messages state
  const [broadcastMessages, setBroadcastMessages] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const fetchBroadcastMessages = async () => {
    try {
      const response = await fetch('/api/messages');
      if (response.ok) {
        const msgs = await response.json();
        setBroadcastMessages(msgs);
        
        // Calculate unread count
        const lastSeenCountStr = localStorage.getItem('omar_stories_last_seen_msg_count');
        const lastSeenCount = lastSeenCountStr ? parseInt(lastSeenCountStr, 10) : 0;
        if (msgs.length > lastSeenCount) {
          setUnreadCount(msgs.length - lastSeenCount);
        } else {
          setUnreadCount(0);
        }
      }
    } catch (err) {
      console.error('Failed to load active broadcast bulletins:', err);
    }
  };

  // App customizable configurations state
  const [appSettings, setAppSettings] = useState({
    appName: 'Omar Stories',
    announcementMsg: 'Welcome to the Sanctuary. A new Premium Story is now active.',
    editorialQuote: 'Every story is a journey into the heart of another, a sanctuary where we find ourselves.'
  });

  // Fetch customizable brand parameters from backend
  const fetchAppSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const settings = await response.json();
        setAppSettings(settings);
      }
    } catch (err) {
      console.error('Failed to pre-fetch customizable app specifications:', err);
    }
  };

  const handleSaveAppSettings = async (newSettings: any): Promise<boolean> => {
    try {
      const response = await fetch('/api/admin/settings/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
      if (response.ok) {
        setAppSettings(newSettings);
        return true;
      }
    } catch (err) {
      console.error('Failed to submit new app settings:', err);
    }
    return false;
  };

  // Helper to fetch shared community stories globally published to root node
  const fetchSharedCommunityStories = async () => {
    try {
      const response = await fetch('/api/stories/shared');
      if (response.ok) {
        const sharedStories: Story[] = await response.json();
        if (Array.isArray(sharedStories)) {
          setStories(sharedStories);
        }
      }
    } catch (error) {
      console.error('Failed to pre-fetch shared community chronicles:', error);
    }
  };

  // Initializing state loads from LocalStorage
  useEffect(() => {
    // Authentications Check
    const storedUser = localStorage.getItem('omar_stories_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Bookmarks Check
    const storedBookmarks = localStorage.getItem('omar_stories_bookmarks');
    if (storedBookmarks) {
      setBookmarks(JSON.parse(storedBookmarks));
    }

    // Load static stories list initially (acts as offline backup)
    setStories(INITIAL_STORIES);

    // Load custom app configurations
    fetchAppSettings();

    // Fetch shared database records of Somali writing community
    fetchSharedCommunityStories();

    // Fetch any administration broadcast messages/notices
    fetchBroadcastMessages();

    // Initial greeting notification trigger after a tiny delay
    setTimeout(() => {
      setNotificationMsg(null); // will load dynamic announcement instead
    }, 4500);
  }, []);

  // Sync bookmarks to localStorage
  const handleToggleBookmark = (storyId: string) => {
    let updated: string[];
    if (bookmarks.includes(storyId)) {
      updated = bookmarks.filter((id) => id !== storyId);
    } else {
      updated = [...bookmarks, storyId];
    }
    setBookmarks(updated);
    localStorage.setItem('omar_stories_bookmarks', JSON.stringify(updated));
  };

  // Auth outcomes
  const handleAuthSuccess = (loggedUser: User) => {
    setUser(loggedUser);
    setScreen('app');
    setActiveTab('home');
    setIsWeavingMode(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('omar_stories_user');
    setUser(null);
    setScreen('login');
    setSelectedStory(null);
    setIsWeavingMode(false);
  };

  // Increment user study dashboard values when reading is recorded
  const handleIncrementUserStats = () => {
    if (!user) return;
    const updatedUser: User = {
      ...user,
      streak: user.streak + 1,
      storiesReadCount: user.storiesReadCount + 1,
      minutesReadCount: user.minutesReadCount + 12, // add standard average length
    };
    setUser(updatedUser);
    localStorage.setItem('omar_stories_user', JSON.stringify(updatedUser));
  };

  // Custom weaving outcome (new story added!)
  const handleStoryWeaveSuccess = (newStory: Story) => {
    // Save to local storage custom stack
    const storedCustomStories = localStorage.getItem('omar_stories_custom');
    const currentCustom: Story[] = storedCustomStories ? JSON.parse(storedCustomStories) : [];
    localStorage.setItem('omar_stories_custom', JSON.stringify([newStory, ...currentCustom]));

    setIsWeavingMode(false);
    setSelectedStory(newStory); // Launch directly in reading mode!

    // Instantly commanded database synchronization
    fetchSharedCommunityStories();
    setNotificationMsg(`"${newStory.title}" completed! Entry finalized in the sanctuary.`);
  };

  // Switch tabs
  const handleTabChange = (tab: 'home' | 'search' | 'favorites' | 'profile') => {
    setActiveTab(tab);
    setIsWeavingMode(false);
  };

  // Filtered stories stack calculated dynamically
  const filteredStoriesHome = stories.filter((story) => {
    if (selectedCategory === 'All') return true;
    if (selectedCategory === 'Somali Chronicles') {
      return story.originalLanguage === 'Somali' || story.category === 'Somali Chronicles';
    }
    return story.category === selectedCategory;
  });

  const filteredStoriesSearch = stories.filter((story) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      story.title.toLowerCase().includes(query) ||
      story.author.toLowerCase().includes(query) ||
      story.category.toLowerCase().includes(query) ||
      story.summary.toLowerCase().includes(query)
    );
  });

  const animatedBookmarksList = stories.filter((story) => bookmarks.includes(story.id));

  // Loading Screens & Auth router
  if (screen === 'splash') {
    return (
      <LogoView
        onEnter={() => {
          const storedUser = localStorage.getItem('omar_stories_user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
            setScreen('app');
          } else {
            setScreen('login');
          }
        }}
      />
    );
  }

  if (screen === 'login') {
    return (
      <LoginView
        onLoginSuccess={handleAuthSuccess}
        onNavigateToRegister={() => setScreen('register')}
        onShowSplash={() => setScreen('splash')}
      />
    );
  }

  if (screen === 'register') {
    return (
      <RegisterView
        onRegisterSuccess={handleAuthSuccess}
        onNavigateToLogin={() => setScreen('login')}
      />
    );
  }

  // Administrative Sanctuary command panel dashboard
  if (screen === 'admin') {
    return (
      <AdminPanel
        stories={stories}
        onBack={() => setScreen('app')}
        onRefreshStories={fetchSharedCommunityStories}
        appSettings={appSettings}
        onSaveSettings={handleSaveAppSettings}
      />
    );
  }

  // Active Story mode takes over full screen viewport
  if (selectedStory) {
    return (
      <StoryReader
        story={selectedStory}
        currentUser={user!}
        isBookmarked={bookmarks.includes(selectedStory.id)}
        onToggleBookmark={() => handleToggleBookmark(selectedStory.id)}
        onBackToSanctuary={() => setSelectedStory(null)}
        onIncrementReads={handleIncrementUserStats}
      />
    );
  }

  // Story Custom Loom mode takes over full screen
  if (isWeavingMode) {
    return (
      <CustomStoryWriter
        currentUser={user!}
        onStoryWeaveSuccess={handleStoryWeaveSuccess}
        onCancel={() => setIsWeavingMode(false)}
      />
    );
  }

  return (
    <div
      id="sanctuary-dashboard-shell"
      className="min-h-screen w-full bg-[#03091c] text-[#e2e8f0] pb-24 font-sans select-none overflow-x-hidden relative"
    >
      {/* Visual Ambient gradient mesh under headers */}
      <div className="absolute top-0 inset-x-0 h-[400px] bg-gradient-to-b from-[#0a1535] via-transparent to-transparent pointer-events-none -z-10" />
      
      {/* Star Field Simulator Particles Background */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff04_1px,transparent_1px)] [background-size:32px_32px] pointer-events-none -z-20" />

      {/* FLOATING GREETINGS NOTIFICATION ACCORDION matches screenshot notification details */}
      {notificationMsg && (
        <div className="fixed top-4 right-4 left-4 md:left-auto md:w-96 z-50 p-4 rounded-xl bg-slate-900/90 hover:bg-slate-900 border border-gold-400/30 text-xs shadow-2xl flex items-start justify-between gap-3 text-[#fdfdfd] animate-bounce-short">
          <div className="flex items-start space-x-2.5">
            <span className="text-base text-gold-400">🔔</span>
            <div>
              <p className="font-bold text-slate-100 font-sans">Sanctuary Chronicle Guard</p>
              <p className="text-slate-400 font-medium mt-0.5">{notificationMsg}</p>
            </div>
          </div>
          <button
            onClick={() => setNotificationMsg(null)}
            className="text-slate-400 hover:text-white font-extrabold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Header Rail matches first Home screen mockup */}
      <header
        id="dashboard-header-container"
        className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between sticky top-0 bg-[#03091c]/75 backdrop-blur-md z-40 border-b border-white/[0.04]"
      >
        {/* Logo and Brand Title on Left */}
        <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => handleTabChange('home')}>
          <div className="w-9 h-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center p-1 shadow-xs">
            {/* Tiny crisp book SVG matches branding */}
            <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
              <path
                d="M50 82C40 76 18 78 12 78V18C20 18 42 21 50 25M50 82C60 76 82 78 88 78V18C80 18 58 21 50 25M50 82V25"
                stroke="#031330"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <text x="50" y="56" dominantBaseline="middle" textAnchor="middle" fill="#b08923" className="font-serif italic font-bold" fontSize="30">
                OS
              </text>
            </svg>
          </div>
          <span className="font-serif font-bold text-lg text-white tracking-tight hover:text-gold-300 transition-colors">
            {appSettings.appName}
          </span>
        </div>

        {/* Global Toolbar Control Packets */}
        <div className="flex items-center space-x-3 text-slate-300">
          {/* Quick search tab trigger */}
          <button
            id="header-shortcut-search"
            onClick={() => handleTabChange('search')}
            className={`p-2 rounded-xl transition-colors hover:bg-white/5 cursor-pointer ${
              activeTab === 'search' ? 'text-gold-400' : ''
            }`}
            title="Search Archives"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Simulated Active Notification Bell */}
          <div className="relative">
            <button
              id="header-notification-bell"
              onClick={() => {
                const goingToOpen = !showNotifications;
                setShowNotifications(goingToOpen);
                if (goingToOpen) {
                  setUnreadCount(0);
                  localStorage.setItem('omar_stories_last_seen_msg_count', String(broadcastMessages.length));
                }
                if (notificationMsg) setNotificationMsg(null);
              }}
              className="relative p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
              title="Alert Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse border border-[#03091c]" />
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2.5 w-80 max-h-96 overflow-y-auto p-4 rounded-2xl border border-slate-500/10 bg-slate-950/95 text-xs shadow-2xl select-none leading-relaxed z-50">
                <div className="flex justify-between items-center pb-2 border-b border-white/5 mb-2.5">
                  <span className="font-bold text-white uppercase tracking-wider text-[10px] font-sans">Broadcast Messages Log</span>
                  <span className="text-[9px] font-mono text-slate-500 font-bold">{broadcastMessages.length} Messages</span>
                </div>
                {broadcastMessages.length === 0 ? (
                  <p className="text-slate-500 text-center py-4">No announcement bulletins active.</p>
                ) : (
                  <div className="space-y-3.5">
                    {broadcastMessages.map((msg: any) => (
                      <div key={msg.id} className="border-b border-white/5 pb-3 last:border-0 last:pb-0">
                        <div className="flex justify-between items-start gap-1 mb-1">
                          <span className="font-bold text-gold-400 text-[11px] font-serif pr-2">{msg.title || 'Broadcast Bulletin'}</span>
                          <span className="text-[9px] text-slate-500 font-mono whitespace-nowrap">{new Date(msg.timestamp).toLocaleDateString()}</span>
                        </div>
                        <p className="text-slate-300 text-[11px] leading-relaxed mb-1.5">{msg.content}</p>
                        <div className="flex items-center space-x-1.5 text-[10px] text-slate-400">
                          <span className="bg-white/5 text-[9px] px-1.5 py-0.2 rounded-sm uppercase tracking-wide font-semibold text-slate-400">{msg.role || 'Admin'}</span>
                          <span className="font-mono text-[9px]">By {msg.sender || 'Omar'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MAIN VIEW CONTROLLER BODY */}
      <main className="max-w-7xl mx-auto px-6 py-6 font-sans">
        
        {/* ==================== TAB: HOME ==================== */}
        {activeTab === 'home' && (
          <div id="home-dashboard-tab" className="space-y-8 animate-fade-in">
            {/* Header branding statement */}
            <div className="select-none py-4">
              <h1 className="font-serif text-3xl md:text-5xl text-white font-bold tracking-tight">
                Sanctuary for Stories
              </h1>
              <p className="text-sm md:text-base text-slate-400 tracking-wide mt-2 max-w-lg">
                Discover the art of narrative in every chapter.
              </p>
            </div>

            {/* horizontal scrollable category chip row matches Home screen mock */}
            <div className="space-y-3">
              <div className="flex items-center justify-between select-none">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Categories</span>
                <span className="text-xs font-bold text-gold-400 hover:text-gold-300 cursor-pointer" onClick={() => handleTabChange('search')}>
                  View All
                </span>
              </div>
              <div className="flex space-x-2.5 overflow-x-auto pb-2 scrollbar-none scroll-smooth">
                {['All', 'Somali Chronicles', 'Romance', 'Adventure', 'Islamic Stories', 'Sci-Fi', 'Wisdom', 'Mystery', 'History'].map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`py-2 px-5 rounded-2xl text-xs font-bold tracking-wide transition-all duration-200 shrink-0 cursor-pointer ${
                      selectedCategory === category
                        ? 'bg-[#0d214c] border border-gold-400 text-white shadow-md'
                        : 'bg-[#06122d]/60 border border-slate-500/10 text-[#a0afc8] hover:text-white hover:border-slate-500/25'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Premium stories row matches Screenshot #3 */}
            <div className="space-y-4">
              <div className="flex justify-between items-center select-none">
                <div className="flex items-center space-x-2 animate-pulse">
                  <span className="text-xs bg-gold-400 text-slate-900 border border-gold-300 font-extrabold px-2 py-0.5 rounded-sm tracking-widest uppercase">
                    ⭐ EXCLUSIVE
                  </span>
                  <h3 className="font-serif text-xl font-bold text-white">Premium Stories</h3>
                </div>
              </div>

              {filteredStoriesHome.length === 0 ? (
                <div className="p-10 text-center rounded-2xl border border-dashed border-slate-800 text-slate-500 select-none">
                  <Library className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                  <p className="text-sm">No chronicles meet this category filter.</p>
                  <button
                    onClick={() => setSelectedCategory('All')}
                    className="mt-3 text-xs font-bold text-gold-400"
                  >
                    Clear Filter
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredStoriesHome.map((story) => (
                    <StoryCard
                      key={story.id}
                      story={story}
                      onReadClick={setSelectedStory}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Large editorial quote card block matches Screenshot 3 */}
            <blockquote className="p-8 md:p-10 rounded-3xl border border-slate-500/10 bg-gradient-to-r from-[#071335] to-[#040e2b] flex flex-col items-center justify-center text-center space-y-4 relative shadow-xl min-h-[180px]">
              {/* Massive stylized quotation mark */}
              <div className="font-serif text-7xl font-bold text-gold-400/20 leading-none h-4 pointer-events-none select-none">
                ”
              </div>
              <p className="font-serif italic text-lg md:text-2xl text-slate-100 max-w-xl leading-relaxed">
                "{appSettings.editorialQuote}"
              </p>
              <footer className="text-xs font-mono font-bold tracking-widest text-gold-400 uppercase select-none opacity-80 pt-2">
                — Editorial Note
              </footer>
            </blockquote>
          </div>
        )}

        {/* ==================== TAB: SEARCH ==================== */}
        {activeTab === 'search' && (
          <div id="search-dashboard-tab" className="space-y-6 animate-fade-in">
            <div className="select-none">
              <h2 className="font-serif text-2xl md:text-3.5xl font-bold text-white">Sanctuary Archives</h2>
              <p className="text-xs md:text-sm text-slate-400 mt-1">Sift through ancient scrolls and woven modern manuscripts.</p>
            </div>

            {/* Custom Input Search box */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 pointer-events-none">
                <Search className="w-5 h-5" />
              </span>
              <input
                id="search-main-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search titles, authors, categories, or keywords..."
                className="w-full bg-[#0a142e] border border-slate-500/15 focus:border-gold-400 rounded-2xl pl-12 pr-4 py-4 text-sm outline-hidden text-[#e2e8f0] focus:ring-1 focus:ring-gold-400/20"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Results display */}
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500 block">
                Found {filteredStoriesSearch.length} results
              </span>

              {filteredStoriesSearch.length === 0 ? (
                <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl select-none text-slate-500">
                  <Library className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                  <p className="text-sm">No archives matched your search criteria.</p>
                  <p className="text-xs text-slate-600 mt-1">Try searching broader keywords like "Andalusia" or "friendship".</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredStoriesSearch.map((story) => (
                    <StoryCard
                      key={story.id}
                      story={story}
                      onReadClick={setSelectedStory}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== TAB: FAVORITES ==================== */}
        {activeTab === 'favorites' && (
          <div id="favorites-dashboard-tab" className="space-y-6 animate-fade-in">
            <div className="select-none">
              <h2 className="font-serif text-2xl md:text-3.5xl font-bold text-white">Your Personal Sanctuary</h2>
              <p className="text-xs md:text-sm text-slate-400 mt-1">Bookmarked scrolls and personal reading list.</p>
            </div>

            {animatedBookmarksList.length === 0 ? (
              <div className="p-16 border border-dashed border-slate-800 rounded-3xl text-center text-slate-500 select-none">
                <Heart className="w-12 h-12 text-slate-700 mx-auto mb-3 animate-pulse" />
                <h4 className="font-serif text-lg font-bold text-slate-400">Sanctuary Shelf is Empty</h4>
                <p className="text-xs text-slate-600 mt-2 max-w-xs mx-auto">
                  Click on the Bookmark ribbon icon inside any Premium Story reader to save chapters onto this shelf for quick reading.
                </p>
                <button
                  onClick={() => handleTabChange('home')}
                  className="mt-4 px-4 py-2 bg-gold-400 text-slate-900 font-bold rounded-xl text-xs hover:scale-103 cursor-pointer transition-transform"
                >
                  DISCOVER STORIES
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {animatedBookmarksList.map((story) => (
                  <StoryCard
                    key={story.id}
                    story={story}
                    onReadClick={setSelectedStory}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB: PROFILE ==================== */}
        {activeTab === 'profile' && (
          <div id="profile-dashboard-tab" className="space-y-6 animate-fade-in max-w-2xl mx-auto">
            <div className="select-none text-center">
              <h2 className="font-serif text-2xl md:text-3.5xl font-bold text-white">Pilgrim Demographics</h2>
              <p className="text-xs md:text-sm text-slate-400">Observe your reading streak and sanctuary memberships logs.</p>
            </div>

            {/* Profile Detail Card */}
            <div className="bg-[#0a122a] border border-slate-500/10 rounded-3xl p-6 space-y-6 relative overflow-hidden">
              {/* Golden banner flare */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold-400/10 rounded-full blur-2xl pointer-events-none" />

              {/* Header row details / Edit Form */}
              {isEditingProfile ? (
                <div className="space-y-4 animate-fade-in bg-slate-950/30 p-4 rounded-2xl border border-white/[0.03]">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-500/10">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gold-400">Edit Pilgrim Settings</h4>
                    <button
                      onClick={() => setIsEditingProfile(false)}
                      className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {profileError && (
                    <div className="p-2.5 bg-red-500/10 text-red-400 text-xs rounded-lg border border-red-500/20 font-medium">
                      {profileError}
                    </div>
                  )}

                  {profileSuccess && (
                     <div className="p-2.5 bg-emerald-500/10 text-emerald-400 text-xs rounded-lg border border-emerald-500/20 font-medium">
                      {profileSuccess}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={editFullName}
                        onChange={(e) => setEditFullName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-gold-400 rounded-xl px-3 py-2 text-xs text-white outline-hidden"
                        placeholder="Omar Al-Farsi"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Username
                      </label>
                      <input
                        type="text"
                        value={editUsername}
                        onChange={(e) => setEditUsername(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-gold-400 rounded-xl px-3 py-2 text-xs text-white outline-hidden font-mono"
                        placeholder="omar_alfarsi"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-gold-400 rounded-xl px-3 py-2 text-xs text-white outline-hidden"
                        placeholder="omarwhatbest@gmail.com"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      onClick={() => setIsEditingProfile(false)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-400 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      className="px-4 py-1.5 bg-gold-400 hover:bg-gold-300 text-slate-950 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-3xl bg-gold-400/10 border border-gold-400/30 flex items-center justify-center text-gold-400 font-bold text-xl uppercase shadow-inner">
                      {user?.fullName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-serif text-xl font-bold text-white">{user?.fullName}</h3>
                        {user?.isPremium && (
                          <span className="bg-gold-400 text-slate-950 text-[9px] font-extrabold px-1.5 py-0.5 rounded-sm tracking-widest uppercase">
                            GOLD ACCESS
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400/80 mt-0.5">@{user?.username} • {user?.email}</p>
                    </div>
                  </div>

                  <button
                    onClick={handleStartEditingProfile}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-850 text-gold-400 hover:text-white border border-gold-400/20 hover:border-gold-400/40 rounded-xl font-bold text-[11px] uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </button>
                </div>
              )}

              {/* Statistics Counters Grid */}
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-500/10">
                <div className="p-3 bg-slate-950/40 rounded-2xl text-center">
                  <Flame className="w-5 h-5 text-amber-500 mx-auto mb-1 animate-pulse" />
                  <span className="text-lg font-bold text-white block leading-none">{user?.streak}</span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Day Streak</span>
                </div>

                <div className="p-3 bg-slate-950/40 rounded-2xl text-center">
                  <BookOpen className="w-5 h-5 text-gold-400 mx-auto mb-1" />
                  <span className="text-lg font-bold text-white block leading-none">{user?.storiesReadCount}</span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Read Log</span>
                </div>

                <div className="p-3 bg-slate-950/40 rounded-2xl text-center">
                  <Bookmark className="w-5 h-5 text-teal-400 mx-auto mb-1" />
                  <span className="text-lg font-bold text-white block leading-none">{bookmarks.length}</span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Favorites</span>
                </div>
              </div>

              {/* Progress Bar slider simulation */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs select-none">
                  <span className="text-slate-400 font-medium">Monthly Reading Accomplishment</span>
                  <span className="text-gold-400 font-bold">{Math.min(100, Math.round(((user?.minutesReadCount || 20) / 120) * 100))}%</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gold-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.round(((user?.minutesReadCount || 20) / 120) * 100))}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-500 text-center block">
                  {user?.minutesReadCount} / 120 minutes recorded this cycle
                </span>
              </div>

              {/* Extra Account Settings Toggle */}
              <div className="pt-4 border-t border-slate-500/10 space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-100 block">Durable Safe Passage Mode</span>
                    <span className="text-slate-500">Automatically backup read chronicles to core cloud.</span>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-gold-400 accent-gold-400 cursor-pointer" />
                </div>

                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-100 block">Member ledger entry date</span>
                    <span className="text-slate-500">First recorded pilgrim entry</span>
                  </div>
                  <span className="font-mono text-slate-300 font-bold">{user?.memberSince}</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-100 block">Show Brand Splash Screen</span>
                    <span className="text-slate-500">Replay the Omar Stories opening animation.</span>
                  </div>
                  <button
                    onClick={() => {
                      setScreen('splash');
                    }}
                    className="py-1.5 px-3 bg-[#0d214c] border border-gold-400/30 text-gold-400 hover:text-white hover:border-gold-400 rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all cursor-pointer"
                  >
                    REPLAY
                  </button>
                </div>

                {/* Admin Management Panel Access Gate - Completely Hidden for Regular Users */}
                {isAdmin && (
                  <div className="pt-4 border-t border-gold-400/20 space-y-3 bg-gradient-to-r from-gold-400/[0.02] to-transparent p-4 rounded-2xl border border-gold-400/10">
                    <div className="flex justify-between items-start text-xs">
                      <div>
                        <div className="flex items-center space-x-1.5 mb-1.5">
                          <span className="text-[9px] bg-gold-400/20 text-gold-400 px-2 py-0.5 rounded-md font-bold uppercase tracking-widest leading-none">
                            Authorized Admin Gate
                          </span>
                          <span className="text-slate-400 font-mono text-[9px]">• Omar Authorized</span>
                        </div>
                        <span className="font-bold text-slate-100 block text-xs">Sanctuary Console Command Center</span>
                        <span className="text-slate-400 text-[10px] leading-relaxed block mt-1">
                          Configure dynamic branding variables, register cover photos, write and publish new stories, or permanently eradicate existing chronicles.
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2.5 pt-1.5">
                      <button
                        onClick={() => {
                          setScreen('admin');
                        }}
                        className="flex-1 py-2 bg-gold-400 hover:bg-gold-300 text-slate-950 rounded-xl font-extrabold uppercase text-[9px] tracking-wider transition-all cursor-pointer flex items-center justify-center space-x-1.5 shadow-md shadow-gold-400/10"
                        id="launch-admin-center-cta"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" strokeWidth={2.5} />
                        <span>Launch Admin Console</span>
                      </button>
                      
                      <button
                        type="button"
                        onClick={async () => {
                          await fetchAppSettings();
                          await fetchSharedCommunityStories();
                          alert("Forced deep synchronization with administrative cloud databases completed!");
                        }}
                        className="py-2 px-3 bg-[#0b132b] hover:bg-slate-900 text-slate-300 hover:text-white rounded-xl font-bold uppercase text-[9px] tracking-wider transition-colors border border-slate-800 cursor-pointer"
                      >
                        Sync Cloud
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Log out CTA */}
              <button
                _id="profile-logout-cta"
                onClick={handleLogout}
                className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold py-3 px-5 rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center space-x-2 border border-red-500/10 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out of Sanctuary</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* STICKY FIXED FOOTER NAVIGATION PANEL matches home tab view bottom icons */}
      <footer
        id="sanctuary-bottom-floating-rail"
        className="fixed bottom-0 inset-x-0 bg-[#03091c]/90 backdrop-blur-md border-t border-white/[0.04] py-3.5 z-40 select-none flex justify-center"
      >
        <div className="w-full max-w-lg px-6 flex items-center justify-between relative">
          
          {/* TAB Trigger: HOME */}
          <button
            onClick={() => handleTabChange('home')}
            className={`flex flex-col items-center justify-center relative cursor-pointer group px-2`}
          >
            <div className={`p-1 rounded-full transition-all duration-200 ${activeTab === 'home' ? 'text-gold-400 scale-105' : 'text-slate-400 hover:text-slate-200'}`}>
              <Home className="w-5.5 h-5.5" />
            </div>
            <span className="text-[10px] font-medium tracking-wide mt-0.5 text-slate-400 group-hover:text-slate-200">Home</span>
            {activeTab === 'home' && (
              <span className="absolute -bottom-2 w-1.5 h-1.5 rounded-full bg-gold-400 shadow-sm" />
            )}
          </button>

          {/* TAB Trigger: SEARCH */}
          <button
            onClick={() => handleTabChange('search')}
            className={`flex flex-col items-center justify-center relative cursor-pointer group px-2`}
          >
            <div className={`p-1 rounded-full transition-all duration-200 ${activeTab === 'search' ? 'text-gold-400 scale-105' : 'text-slate-400 hover:text-slate-200'}`}>
              <Search className="w-5.5 h-5.5" />
            </div>
            <span className="text-[10px] font-medium tracking-wide mt-0.5 text-slate-400 group-hover:text-slate-200">Search</span>
            {activeTab === 'search' && (
              <span className="absolute -bottom-2 w-1.5 h-1.5 rounded-full bg-gold-400 shadow-sm" />
            )}
          </button>

          {/* CENTRAL FLOATING WEAVE LOOM LAUNCHER - Exclusive to Admin */}
          {isAdmin ? (
            <button
              id="floating-weave-launcher"
              onClick={() => setIsWeavingMode(true)}
              className="flex flex-col items-center justify-center cursor-pointer group -mt-8 relative"
              title="Weave Story Loom"
            >
              <div className="w-14 h-14 rounded-full bg-gold-400 hover:bg-gold-500 text-slate-950 flex items-center justify-center shadow-lg shadow-gold-500/20 active:scale-95 transition-transform duration-200 border-4 border-[#03091c]">
                <PlusCircle className="w-7 h-7" />
              </div>
              <span className="text-[9px] font-bold tracking-widest mt-1 text-gold-400 uppercase">WEAVE</span>
            </button>
          ) : (
            <div className="w-8" />
          )}

          {/* TAB Trigger: FAVORITES */}
          <button
            onClick={() => handleTabChange('favorites')}
            className={`flex flex-col items-center justify-center relative cursor-pointer group px-2`}
          >
            <div className={`p-1 rounded-full transition-all duration-200 ${activeTab === 'favorites' ? 'text-gold-400 scale-105' : 'text-slate-400 hover:text-slate-200'}`}>
              <Heart className={`w-5.5 h-5.5 ${activeTab === 'favorites' ? 'fill-current' : ''}`} strokeWidth={activeTab === 'favorites' ? 0 : 2} />
            </div>
            <span className="text-[10px] font-medium tracking-wide mt-0.5 text-slate-400 group-hover:text-slate-200">Favorites</span>
            {activeTab === 'favorites' && (
              <span className="absolute -bottom-2 w-1.5 h-1.5 rounded-full bg-gold-400 shadow-sm" />
            )}
          </button>

          {/* TAB Trigger: PROFILE */}
          <button
            onClick={() => handleTabChange('profile')}
            className={`flex flex-col items-center justify-center relative cursor-pointer group px-2`}
          >
            <div className={`p-1 rounded-full transition-all duration-200 ${activeTab === 'profile' ? 'text-gold-400 scale-105' : 'text-slate-400 hover:text-slate-200'}`}>
              <UserIcon className="w-5.5 h-5.5" />
            </div>
            <span className="text-[10px] font-medium tracking-wide mt-0.5 text-slate-400 group-hover:text-slate-200">Profile</span>
            {activeTab === 'profile' && (
              <span className="absolute -bottom-2 w-1.5 h-1.5 rounded-full bg-gold-400 shadow-sm" />
            )}
          </button>

        </div>
      </footer>
    </div>
  );
}
