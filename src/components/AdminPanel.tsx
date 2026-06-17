/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Story, Chapter } from '../types';
import { 
  ArrowLeft, Settings, BookOpen, Image, Save, Plus, Trash2, Edit3, 
  Check, AlertCircle, FileText, Sparkles, LogOut, CheckSquare, MessageSquare, Send
} from 'lucide-react';

interface PhotoAsset {
  id: string;
  url: string;
  title: string;
  category: string;
}

interface AdminPanelProps {
  stories: Story[];
  onBack: () => void;
  onRefreshStories: () => Promise<void>;
  appSettings: {
    appName: string;
    announcementMsg: string;
    editorialQuote: string;
  };
  onSaveSettings: (settings: any) => Promise<boolean>;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  stories: initialStories,
  onBack,
  onRefreshStories,
  appSettings,
  onSaveSettings
}) => {
  const [activeSubSection, setActiveSubSection] = useState<'stories' | 'photos' | 'settings' | 'messages'>('stories');
  
  // App Settings forms state
  const [appName, setAppName] = useState(appSettings.appName);
  const [announcementMsg, setAnnouncementMsg] = useState(appSettings.announcementMsg);
  const [editorialQuote, setEditorialQuote] = useState(appSettings.editorialQuote);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Broadcast messages state
  const [broadcastMessages, setBroadcastMessages] = useState<any[]>([]);
  const [newMsgTitle, setNewMsgTitle] = useState('');
  const [newMsgContent, setNewMsgContent] = useState('');
  const [newMsgSender, setNewMsgSender] = useState('Omar Al-Farsi');
  const [newMsgRole, setNewMsgRole] = useState('Administrator');
  const [sendingMessage, setSendingMessage] = useState(false);

  // Photos state
  const [photos, setPhotos] = useState<PhotoAsset[]>([]);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoTitle, setNewPhotoTitle] = useState('');
  const [newPhotoCategory, setNewPhotoCategory] = useState('Adventure');
  const [addingPhoto, setAddingPhoto] = useState(false);

  // Stories management state
  const [currentStories, setCurrentStories] = useState<Story[]>(initialStories);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<Partial<Story> | null>(null);
  
  // Temporary editable chapter states
  const [chapterInputs, setChapterInputs] = useState<{ title: string; contentText: string }[]>([
    { title: 'Chapter 1: The Gathering Storm', contentText: '' }
  ]);

  const [savingStory, setSavingStory] = useState(false);
  const [storyError, setStoryError] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Load photos, messages, and sync stories on mount
  useEffect(() => {
    fetchPhotos();
    fetchMessages();
    setCurrentStories(initialStories);
  }, [initialStories]);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchPhotos = async () => {
    try {
      const response = await fetch('/api/admin/photos');
      if (response.ok) {
        const data = await response.json();
        setPhotos(data);
      }
    } catch (err) {
      console.error('Failed to pre-fetch photo illustrations archive:', err);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/messages');
      if (response.ok) {
        const data = await response.json();
        setBroadcastMessages(data);
      }
    } catch (err) {
      console.error('Failed to fetch broadcast messages:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsgContent.trim()) {
      showNotification('Message content cannot be blank.', 'error');
      return;
    }

    setSendingMessage(true);
    try {
      const response = await fetch('/api/admin/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: newMsgSender.trim() || 'Omar Al-Farsi',
          role: newMsgRole.trim() || 'Administrator',
          title: newMsgTitle.trim() || 'Administrator Announcement',
          content: newMsgContent.trim()
        })
      });

      if (response.ok) {
        showNotification('Broadcast message published to all users successfully!');
        setNewMsgTitle('');
        setNewMsgContent('');
        await fetchMessages();
      } else {
        showNotification('Failed to send broadcast.', 'error');
      }
    } catch (err) {
      showNotification('Network exception during broadcast.', 'error');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    try {
      const response = await fetch('/api/admin/messages/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      if (response.ok) {
        showNotification('Message deleted.');
        await fetchMessages();
      } else {
        showNotification('Failed to delete message.', 'error');
      }
    } catch (err) {
      showNotification('Network error, could not delete.', 'error');
    }
  };

  // Settings Actions
  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSuccess(false);

    try {
      const success = await onSaveSettings({
        appName,
        announcementMsg,
        editorialQuote
      });
      if (success) {
        setSettingsSuccess(true);
        showNotification('App specifications saved and broadcasted successfully!');
        setTimeout(() => setSettingsSuccess(false), 3000);
      } else {
        showNotification('Failed to preserve system preferences.', 'error');
      }
    } catch (err) {
      showNotification('Error updating parameters.', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  // Photo actions
  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoUrl.trim()) return;

    setAddingPhoto(true);
    try {
      const response = await fetch('/api/admin/photo/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: newPhotoUrl.trim(),
          title: newPhotoTitle.trim() || 'Aesthetic Rendering',
          category: newPhotoCategory
        })
      });

      if (response.ok) {
        setNewPhotoUrl('');
        setNewPhotoTitle('');
        showNotification('Fine-art photograph registered in system gallery!');
        await fetchPhotos();
      } else {
        showNotification('Failed to register image URL.', 'error');
      }
    } catch (err) {
      showNotification('Server communication failure during asset load.', 'error');
    } finally {
      setAddingPhoto(false);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    try {
      const response = await fetch('/api/admin/photo/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: photoId })
      });

      if (response.ok) {
        showNotification('Image asset successfully purged.');
        await fetchPhotos();
      } else {
        showNotification('Failed to dismantle the target visual asset.', 'error');
      }
    } catch (err) {
      showNotification('Server communication failure during deletion.', 'error');
    }
  };

  // Story CRUD actions
  const handleOpenNewStoryEditor = () => {
    setEditingStory({
      id: `story_${Date.now()}`,
      title: '',
      author: 'Omar Al-Farsi',
      category: 'Somali Chronicles',
      summary: '',
      readTime: '12 min',
      rating: 5.0,
      isGold: false,
      coverUrl: photos[0]?.url || 'https://images.unsplash.com/photo-1547234935-80c7145ec969?q=80&w=600',
      coverGradient: 'linear-gradient(to bottom, #03091c, #111827)',
      publishedDate: new Date().toLocaleDateString('so-SO', { year: 'numeric', month: 'long', day: 'numeric' }),
      reviewsCount: 1,
      originalLanguage: 'Somali'
    });
    setChapterInputs([
      { title: 'Chapter 1: Magaca Cutubka', contentText: 'Ku qor cutubkaan halkan prose ballaaran oo Somali ah...' }
    ]);
    setStoryError('');
    setEditorOpen(true);
  };

  const handleOpenExistingStoryEditor = (story: Story) => {
    setEditingStory(story);
    if (story.chapters && story.chapters.length > 0) {
      setChapterInputs(
        story.chapters.map(ch => ({
          title: ch.title,
          contentText: ch.content.join('\n\n')
        }))
      );
    } else if (story.content && story.content.length > 0) {
      setChapterInputs([
        { title: 'Chapter 1: Overview', contentText: story.content.join('\n\n') }
      ]);
    } else {
      setChapterInputs([
        { title: 'Chapter 1: Overview', contentText: '' }
      ]);
    }
    setStoryError('');
    setEditorOpen(true);
  };

  const handleAddChapterSlot = () => {
    setChapterInputs([
      ...chapterInputs,
      { title: `Chapter ${chapterInputs.length + 1}: `, contentText: '' }
    ]);
  };

  const handleRemoveChapterSlot = (idx: number) => {
    if (chapterInputs.length <= 1) return;
    setChapterInputs(chapterInputs.filter((_, i) => i !== idx));
  };

  const handleUpdateChapterSlot = (idx: number, field: 'title' | 'contentText', value: string) => {
    const next = [...chapterInputs];
    next[idx][field] = value;
    setChapterInputs(next);
  };

  const handleSaveStorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStory || !editingStory.title || !editingStory.author) {
      setStoryError('Title and Author fields are required to draft.');
      return;
    }

    setSavingStory(true);
    setStoryError('');

    // Format fields & map chapter paragraph separation
    const formattedChapters: Chapter[] = chapterInputs.map(ch => ({
      title: ch.title.trim() || 'Untitled Chapter',
      content: ch.contentText
        .split('\n\n')
        .map(p => p.trim())
        .filter(p => p.length > 0)
    }));

    const finalStoryPayload: Story = {
      ...editingStory as Story,
      chapters: formattedChapters,
      // If we only have 1 chapter with content, replicate to backward-compatibility arrays
      content: formattedChapters[0]?.content || []
    };

    try {
      const response = await fetch('/api/admin/story/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalStoryPayload)
      });

      if (response.ok) {
        showNotification(`Chronicle "${finalStoryPayload.title}" written to cloud registry!`);
        setEditorOpen(false);
        setEditingStory(null);
        await onRefreshStories();
      } else {
        const errorData = await response.json();
        setStoryError(errorData.error || 'Failed to submit modifications.');
      }
    } catch (err) {
      setStoryError('Network timed out or server refused transaction.');
    } finally {
      setSavingStory(false);
    }
  };

  const handleDeleteStory = async (storyId: string) => {
    try {
      const response = await fetch('/api/admin/story/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: storyId })
      });

      if (response.ok) {
        showNotification('The chosen chronicle has been purged.');
        setCurrentStories(prev => prev.filter(s => s.id !== storyId));
        await onRefreshStories();
      } else {
        showNotification('Failed to remove chronicle.', 'error');
      }
    } catch (err) {
      showNotification('Network transaction failure.', 'error');
    }
  };

  const handleDeleteAllStories = async () => {
    try {
      const response = await fetch('/api/admin/story/delete-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        showNotification('All narrative chronicles have been permanently purged.');
        setCurrentStories([]);
        await onRefreshStories();
      } else {
        showNotification('Failed to purge all chronicles.', 'error');
      }
    } catch (err) {
      showNotification('Network transaction failure during purge.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#03091c] text-slate-100 flex flex-col font-sans pb-24 z-50">
      
      {/* HEADER COMMAND CAP */}
      <header className="sticky top-0 bg-[#03091c]/90 backdrop-blur-md border-b border-white/[0.04] py-4 px-6 z-40 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-900/50 hover:bg-slate-900 text-slate-400 hover:text-white border border-slate-800 transition-all cursor-pointer"
            id="admin-command-back-cta"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] bg-gold-400/20 text-gold-400 px-2 py-0.5 rounded-full font-bold tracking-widest uppercase">
                Console Active
              </span>
              <span className="text-[10px] font-mono text-slate-400">Omar Al-Farsi authorized</span>
            </div>
            <h1 className="text-xl font-serif font-bold text-slate-100 tracking-tight">
              Administrative Sanctuary
            </h1>
          </div>
        </div>

        <div className="flex space-x-2">
          {/* Diagnostic status line hidden from user visual block but useful for clear interface feedback */}
          <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2.5 py-1.5 rounded-xl flex items-center space-x-1 border border-emerald-500/10">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block mr-1.5" />
            Core Synced
          </span>
        </div>
      </header>

      {/* FLOAT NOTIFICATION BANNER */}
      {notification && (
        <div className={`fixed top-20 right-6 left-6 md:left-auto md:w-96 p-4 rounded-2xl border flex items-start space-x-3 z-55 shadow-2xl animate-fade-in ${
          notification.type === 'success' 
            ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-200' 
            : 'bg-red-950/90 border-red-500/30 text-red-200'
        }`}>
          <div className="p-1 rounded-full bg-black/10 mt-0.5">
            <Check className="w-4 h-4" />
          </div>
          <p className="text-xs font-semibold">{notification.text}</p>
        </div>
      )}

      <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-6 space-y-6">
        
        {/* VIEW SEGMENTATION TABS */}
        <div className="flex flex-wrap md:flex-nowrap bg-[#0b132b] rounded-2xl p-1 border border-white/[0.04] gap-1">
          <button
            onClick={() => { setActiveSubSection('stories'); setEditorOpen(false); }}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-2 rounded-xl font-medium text-xs uppercase tracking-wider transition-all cursor-pointer ${
              activeSubSection === 'stories' 
                ? 'bg-gold-400 text-slate-950 shadow-md font-bold' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Manage Stories</span>
          </button>
          
          <button
            onClick={() => { setActiveSubSection('photos'); setEditorOpen(false); }}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-2 rounded-xl font-medium text-xs uppercase tracking-wider transition-all cursor-pointer ${
              activeSubSection === 'photos' 
                ? 'bg-gold-400 text-slate-950 shadow-md font-bold' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
            }`}
          >
            <Image className="w-4 h-4" />
            <span>Photos & Covers</span>
          </button>

          <button
            onClick={() => { setActiveSubSection('messages'); setEditorOpen(false); }}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-2 rounded-xl font-medium text-xs uppercase tracking-wider transition-all cursor-pointer ${
              activeSubSection === 'messages' 
                ? 'bg-gold-400 text-slate-950 shadow-md font-bold' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Broadcast Message</span>
          </button>
          
          <button
            onClick={() => { setActiveSubSection('settings'); setEditorOpen(false); }}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-2 rounded-xl font-medium text-xs uppercase tracking-wider transition-all cursor-pointer ${
              activeSubSection === 'settings' 
                ? 'bg-gold-400 text-slate-950 shadow-md font-bold' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>App Settings</span>
          </button>
        </div>

        {/* 1. STORIES MANAGEMENT SECTION */}
        {activeSubSection === 'stories' && !editorOpen && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-[#071126] p-5 rounded-2xl border border-white/[0.04] gap-4">
              <div>
                <h2 className="text-base font-serif font-bold text-slate-100">Chronicles Index</h2>
                <p className="text-xs text-slate-400">Inspect, edit, and wipe preloaded or user-contributed stories from the Cloud storage.</p>
              </div>
              <div className="flex items-center gap-3">
                {currentStories.length > 0 && (
                  <button 
                    onClick={handleDeleteAllStories}
                    className="bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 hover:border-red-500/50 font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center space-x-1.5 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Remove All Stories</span>
                  </button>
                )}
                <button 
                  onClick={handleOpenNewStoryEditor}
                  className="bg-gold-400 hover:bg-gold-300 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center space-x-1.5 transition-all shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Story</span>
                </button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {currentStories.map(story => (
                <div 
                  key={story.id}
                  className="bg-[#0b132b] rounded-2xl border border-white/[0.02] hover:border-gold-400/20 p-4 transition-all flex space-x-4 relative group"
                >
                  <div className="w-20 h-24 rounded-lg overflow-hidden bg-slate-950 flex-shrink-0 relative">
                    {story.coverUrl ? (
                      <img src={story.coverUrl} alt={story.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500 font-mono text-[10px]" style={{ background: story.coverGradient }}>
                        GRAD
                      </div>
                    )}
                    {story.isGold && (
                      <span className="absolute top-1 right-1 bg-gold-400 text-slate-950 text-[8px] font-bold px-1 rounded">GOLD</span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center space-x-1.5 mb-1 flex-wrap gap-y-1">
                        <span className="text-[9px] bg-gold-400/10 text-gold-400 border border-gold-400/25 px-1.5 py-0.5 rounded-full font-bold">
                          {story.category}
                        </span>
                        {story.originalLanguage === 'Somali' && (
                          <span className="text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/25 px-1.5 py-0.5 rounded-full font-bold">
                            Somali
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold font-serif text-slate-100 line-clamp-1">{story.title}</h3>
                      <p className="text-[11px] text-slate-400 leading-tight line-clamp-2 mt-0.5">{story.summary}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 mt-1 border-t border-white/[0.04]">
                      <span className="text-[10px] font-mono text-slate-500">By {story.author}</span>
                      
                      <div className="flex space-x-1.5">
                        <button
                          onClick={() => handleOpenExistingStoryEditor(story)}
                          className="p-1 px-2.5 bg-slate-900 hover:bg-slate-800 text-gold-400 hover:text-white rounded-lg border border-gold-400/15 transition-all text-[10px] uppercase font-bold flex items-center space-x-1 cursor-pointer"
                          title="Modify variables"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteStory(story.id)}
                          className="p-1 px-2.5 bg-red-950/20 hover:bg-red-900/40 text-red-400 hover:text-red-200 rounded-lg border border-red-500/15 transition-all text-[10px] uppercase font-bold flex items-center space-x-1 cursor-pointer"
                          title="Wipe story"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RICH CHAPTERS STORY EDITOR (INLINE SHEET) */}
        {activeSubSection === 'stories' && editorOpen && editingStory && (
          <form onSubmit={handleSaveStorySubmit} className="bg-[#0b132b] border border-white/[0.04] rounded-3xl p-6 space-y-6 animate-fade-in">
            <div className="flex justify-between items-center pb-4 border-b border-white/[0.04]">
              <div>
                <h2 className="text-lg font-serif font-bold text-slate-100">
                  {editingStory.id?.startsWith('story_') ? 'Forge New Chronicle' : `Polish Chronicle: ${editingStory.title}`}
                </h2>
                <p className="text-xs text-slate-400">Form and details for local indexing and reader simulation.</p>
              </div>
              <button
                type="button"
                onClick={() => setEditorOpen(false)}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-800 text-xs uppercase font-bold tracking-wider cursor-pointer"
              >
                Cancel
              </button>
            </div>

            {storyError && (
              <div className="p-4 bg-red-950/50 border border-red-500/20 rounded-2xl flex items-center space-x-2 text-red-200 text-xs">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{storyError}</span>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Chronicle Title</label>
                <input 
                  type="text" 
                  value={editingStory.title || ''} 
                  onChange={e => setEditingStory({...editingStory, title: e.target.value})}
                  className="w-full bg-[#03091c] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-400 transition-colors"
                  placeholder="e.g. Dhulalkii Shisheeye ee Somali"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Author Pen Name</label>
                <input 
                  type="text" 
                  value={editingStory.author || ''} 
                  onChange={e => setEditingStory({...editingStory, author: e.target.value})}
                  className="w-full bg-[#03091c] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-400 transition-colors"
                  placeholder="e.g. Omar Al-Farsi"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Category Genre</label>
                <select 
                  value={editingStory.category || 'Romance'} 
                  onChange={e => setEditingStory({...editingStory, category: e.target.value})}
                  className="w-full bg-[#03091c] text-white border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold-400"
                >
                  <option value="Somali Chronicles">Somali Chronicles</option>
                  <option value="Romance">Romance</option>
                  <option value="Adventure">Adventure</option>
                  <option value="Islamic Stories">Islamic Stories</option>
                  <option value="Sci-Fi">Sci-Fi</option>
                  <option value="Wisdom">Wisdom</option>
                  <option value="Mystery">Mystery</option>
                  <option value="History">History</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Language Flag</label>
                <select 
                  value={editingStory.originalLanguage || 'English'} 
                  onChange={e => setEditingStory({...editingStory, originalLanguage: e.target.value})}
                  className="w-full bg-[#03091c] text-white border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold-400"
                >
                  <option value="English">English</option>
                  <option value="Somali">Somali (Af-Soomaali)</option>
                  <option value="Arabic">Arabic (العربية)</option>
                </select>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Short Plot Summary</label>
                <textarea 
                  value={editingStory.summary || ''} 
                  onChange={e => setEditingStory({...editingStory, summary: e.target.value})}
                  className="w-full bg-[#03091c] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-400 transition-colors h-16 resize-none"
                  placeholder="Provide a brief engaging 1-2 sentence dramatic summary..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Cover Photo URL</label>
                <div className="flex space-x-2">
                  <input 
                    type="text" 
                    value={editingStory.coverUrl || ''} 
                    onChange={e => setEditingStory({...editingStory, coverUrl: e.target.value})}
                    className="flex-1 bg-[#03091c] border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-gold-400 transition-colors"
                    placeholder="Enter any premium Unsplash or static image link..."
                  />
                  {photos.length > 0 && (
                    <button 
                      type="button"
                      onClick={() => {
                        // Pick random photo URL from pool
                        const randomPhoto = photos[Math.floor(Math.random() * photos.length)];
                        if (randomPhoto) setEditingStory({...editingStory, coverUrl: randomPhoto.url});
                      }}
                      className="bg-[#071126] hover:bg-slate-800 text-gold-400 border border-gold-400/20 px-3 rounded-xl text-xs font-bold tracking-tight cursor-pointer"
                    >
                      Pick Gallery
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Study Access Threshold</label>
                <div className="flex items-center space-x-4 pt-3.5">
                  <label className="inline-flex items-center cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={editingStory.isGold || false}
                      onChange={e => setEditingStory({...editingStory, isGold: e.target.checked})}
                      className="w-5 h-5 text-gold-400 accent-gold-400 rounded focus:ring-0 mr-2 cursor-pointer" 
                    />
                    <span className="text-xs font-bold uppercase tracking-wider text-gold-400">Premium Gold Tier Entry</span>
                  </label>
                  <span className="text-[10px] text-slate-500">Requires membership credentials.</span>
                </div>
              </div>
            </div>

            {/* Rich chapter paragraphs block */}
            <div className="space-y-4 pt-4 border-t border-white/[0.04]">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Chapters, Chronicles & Narrative Prose</h4>
                  <p className="text-[10px] text-slate-500">Add sequential chapters. Separate paragraphs with double-returns (Enter-Enter).</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddChapterSlot}
                  className="bg-slate-900 border border-slate-700 text-gold-400 hover:text-white px-3 py-1.5 rounded-xl text-[10px] uppercase font-bold flex items-center space-x-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Annex Chapter</span>
                </button>
              </div>

              <div className="space-y-4">
                {chapterInputs.map((ch, idx) => (
                  <div key={idx} className="bg-[#03091c] rounded-2xl p-4 border border-slate-900 space-y-3 relative group">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-gold-400">Chapter {idx + 1}</span>
                      {chapterInputs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveChapterSlot(idx)}
                          className="text-red-400 hover:text-red-200 text-[10px] font-bold uppercase tracking-wide flex items-center space-x-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <input 
                        type="text"
                        value={ch.title}
                        onChange={e => handleUpdateChapterSlot(idx, 'title', e.target.value)}
                        placeholder="Chapter Title e.g. Chapter 1: The Gathering Sandstorms"
                        className="w-full bg-[#0b132b] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-400"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <textarea
                        value={ch.contentText}
                        onChange={e => handleUpdateChapterSlot(idx, 'contentText', e.target.value)}
                        placeholder="Type Somali narratives or other prose here... Separate paragraphs with a blank line."
                        className="w-full bg-[#0b132b] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-gold-400 h-32"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-white/[0.04]">
              <button
                type="button"
                onClick={() => setEditorOpen(false)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-800 text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Dismiss
              </button>
              <button
                type="submit"
                disabled={savingStory}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center space-x-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                {savingStory ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-solid border-slate-950 border-t-transparent animate-spin inline-block" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Chronicle</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* 2. PHOTOS & ILLUSTRATION MANAGER */}
        {activeSubSection === 'photos' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-[#071126] p-5 rounded-2xl border border-white/[0.04]">
              <h2 className="text-base font-serif font-bold text-slate-100">Cover Photo Library</h2>
              <p className="text-xs text-slate-400">Settle cover photos, illustrations, and thematic vectors across chapters.</p>
              
              {/* Add Photo url register form */}
              <form onSubmit={handleAddPhoto} className="mt-4 flex flex-col md:flex-row gap-3">
                <input 
                  type="text" 
                  value={newPhotoUrl}
                  onChange={e => setNewPhotoUrl(e.target.value)}
                  placeholder="Paste Unsplash photograph web link..."
                  className="flex-1 bg-[#03091c] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-gold-400"
                />
                <input 
                  type="text" 
                  value={newPhotoTitle}
                  onChange={e => setNewPhotoTitle(e.target.value)}
                  placeholder="Photo Title Tag"
                  className="bg-[#03091c] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-gold-400 h-10 w-full md:w-36"
                />
                <button
                  type="submit"
                  disabled={addingPhoto}
                  className="bg-gold-400 hover:bg-gold-300 text-slate-950 font-bold px-5 h-10 rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register Photo</span>
                </button>
              </form>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {photos.map(photo => (
                <div key={photo.id} className="bg-[#0b132b] border border-white/[0.02] rounded-2xl overflow-hidden group relative">
                  <div className="aspect-video w-full bg-slate-950 overflow-hidden relative">
                    <img src={photo.url} alt={photo.title} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
                      <span className="text-[9px] text-slate-400 font-mono line-clamp-1">{photo.url}</span>
                    </div>
                  </div>
                  
                  <div className="p-3 flex justify-between items-center bg-[#071126]/60">
                    <div>
                      <h4 className="text-xs font-bold text-slate-100 line-clamp-1">{photo.title}</h4>
                      <span className="text-[9px] text-gold-400 uppercase font-mono font-bold">{photo.category}</span>
                    </div>
                    
                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="p-1.5 bg-red-950/20 hover:bg-red-500/20 hover:text-white text-red-400 rounded-lg transition-colors border border-red-500/10 cursor-pointer"
                      title="Wipe photo asset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. APPLICATION SYSTEM SETTINGS */}
        {/* 3. BROADCAST MESSAGES TAB */}
        {activeSubSection === 'messages' && (
          <div className="space-y-6 animate-fade-in">
            {/* Form to compose new broadcast message */}
            <form onSubmit={handleSendMessage} className="bg-[#0b132b] border border-white/[0.04] rounded-3xl p-6 space-y-4">
              <div>
                <h2 className="text-base font-serif font-bold text-slate-100 flex items-center space-x-2">
                  <Send className="w-5 h-5 text-gold-400" />
                  <span>Transmit Broadcast Notice</span>
                </h2>
                <p className="text-xs text-slate-400">Compose and project real-time system notifications or letters to the general sanctuary readers.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Announcement Header Title</label>
                  <input 
                    type="text" 
                    value={newMsgTitle}
                    onChange={e => setNewMsgTitle(e.target.value)}
                    className="w-full bg-[#03091c] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-gold-400"
                    placeholder="e.g. Golden Sanctuary Revamp"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sender Alias</label>
                    <input 
                      type="text" 
                      value={newMsgSender}
                      onChange={e => setNewMsgSender(e.target.value)}
                      className="w-full bg-[#03091c] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-gold-400"
                      placeholder="Omar Al-Farsi"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sender Role</label>
                    <input 
                      type="text" 
                      value={newMsgRole}
                      onChange={e => setNewMsgRole(e.target.value)}
                      className="w-full bg-[#03091c] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-gold-400"
                      placeholder="Administrator"
                    />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Chronicle Content (Required)</label>
                  <textarea 
                    value={newMsgContent}
                    onChange={e => setNewMsgContent(e.target.value)}
                    className="w-full bg-[#03091c] border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-gold-400 h-28 resize-none"
                    placeholder="Provide description of instructions, warnings, greetings or notes..."
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-white/[0.04]">
                <button
                  type="submit"
                  disabled={sendingMessage}
                  className="bg-gold-500 hover:bg-gold-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center space-x-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{sendingMessage ? 'Transmitting...' : 'Send to All Users'}</span>
                </button>
              </div>
            </form>

            {/* List of Sent Messages */}
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-[#071126] p-4 rounded-2xl border border-white/[0.04]">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-100">Broadcast Archive</h3>
                  <p className="text-[11px] text-slate-400">Inspect or withdraw active notifications sent to sanctuary pilgrims.</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 text-[10px] font-mono text-gold-400 px-2.5 py-1 rounded-full">
                  {broadcastMessages.length} Messages Total
                </div>
              </div>

              {broadcastMessages.length === 0 ? (
                <div className="text-center py-10 bg-[#071126]/30 rounded-2xl border border-dashed border-slate-800">
                  <MessageSquare className="w-8 h-8 text-slate-600 mx-auto mb-2.5" />
                  <p className="text-xs font-semibold text-slate-400">No active broadcast bulletins sent.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {broadcastMessages.map((msg: any) => (
                    <div 
                      key={msg.id}
                      className="bg-[#0b132b] border border-white/[0.04] p-5 rounded-2xl flex justify-between items-start space-x-4 hover:border-gold-400/20 transition-all group"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center space-x-2 flex-wrap">
                          <span className="bg-gold-400/10 text-gold-400 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {msg.role || 'Admin'}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400 font-mono">
                            By {msg.sender || 'Omar'}
                          </span>
                          <span className="text-[9px] text-slate-500 font-mono">
                            • {new Date(msg.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <h4 className="text-sm font-serif font-black text-slate-100">{msg.title || 'Broadcast Bulletin'}</h4>
                        <p className="text-xs text-slate-300 leading-relaxed font-sans">{msg.content}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="p-2 sm:opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/20 cursor-pointer"
                        title="Withdraw Bulletin"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeSubSection === 'settings' && (
          <form onSubmit={handleSettingsSubmit} className="bg-[#0b132b] border border-white/[0.04] rounded-3xl p-6 space-y-6 animate-fade-in">
            <div>
              <h2 className="text-base font-serif font-bold text-slate-100">Application Configuration</h2>
              <p className="text-xs text-slate-400">Rebrand the app banner logo, change global alerts, and amend front-page quotes dynamically.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">App Brand Name</label>
                <input 
                  type="text" 
                  value={appName}
                  onChange={e => setAppName(e.target.value)}
                  className="w-full bg-[#03091c] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-400"
                  placeholder="e.g. Omar Stories"
                />
                <span className="text-[10px] text-slate-500 block">Renames the title header, welcome widgets, and email notifications.</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Homepage Global Header Announcement</label>
                <input 
                  type="text" 
                  value={announcementMsg}
                  onChange={e => setAnnouncementMsg(e.target.value)}
                  className="w-full bg-[#03091c] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-400"
                  placeholder="Welcome messages..."
                />
                <span className="text-[10px] text-slate-500 block">Displays at the top of the Home tab when starting.</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Editorial Quote of the Day</label>
                <textarea 
                  value={editorialQuote}
                  onChange={e => setEditorialQuote(e.target.value)}
                  className="w-full bg-[#03091c] border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-gold-400 h-24 resize-none"
                  placeholder="Quote text..."
                />
                <span className="text-[10px] text-slate-500 block">Custom citation quotes displayed in the home editorial scroll panel.</span>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-white/[0.04]">
              <button
                type="submit"
                disabled={savingSettings}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center space-x-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                {savingSettings ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-solid border-slate-950 border-t-transparent animate-spin inline-block" />
                    <span>Publishing...</span>
                  </>
                ) : settingsSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Saved Succesfully!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Authorize Settings Change</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

      </main>
    </div>
  );
};
