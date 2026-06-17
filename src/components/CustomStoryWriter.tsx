/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Story, User, Category, Chapter } from '../types';
import { CATEGORIES } from '../data';
import { 
  Sparkles, 
  PenTool, 
  BookOpen, 
  AlertCircle, 
  Heart, 
  Flame, 
  UploadCloud, 
  Globe, 
  Languages, 
  Plus, 
  Trash2, 
  Save, 
  FileText, 
  CheckCircle,
  FolderOpen
} from 'lucide-react';

interface CustomStoryWriterProps {
  currentUser: User;
  onStoryWeaveSuccess: (newStory: Story) => void;
  onCancel: () => void;
}

export const CustomStoryWriter: React.FC<CustomStoryWriterProps> = ({
  currentUser,
  onStoryWeaveSuccess,
  onCancel,
}) => {
  // Creator Workspace Modes
  const [isAiMode, setIsAiMode] = useState(true);
  const [language, setLanguage] = useState<'English' | 'Somali'>('Somali'); // Defaults to Somali
  
  // AI Generation Fields
  const [prompt, setPrompt] = useState('');
  const [category, setCategory] = useState<Category>('History');
  
  // Manual / Upload Editor Sandbox State
  const [sandboxStory, setSandboxStory] = useState<Story | null>(null);
  
  // Legacy single textarea fallback
  const [manualTitle, setManualTitle] = useState('');
  const [manualContent, setManualContent] = useState('');

  // UI Status State
  const [weaving, setWeaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loadingStep, setLoadingStep] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // File Reader Reference
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse Uploaded Manuscript Files
  const processUploadedManuscript = (file: File) => {
    setError('');
    setSuccessMsg('');
    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) {
        setError('Orod! the document appears empty.');
        return;
      }

      if (file.name.endsWith('.json')) {
        try {
          const parsed = JSON.parse(text);
          if (parsed.title && (parsed.chapters || parsed.content)) {
            // Load complete story schema into Interactive Sandbox
            const chapters: Chapter[] = parsed.chapters || [
              {
                title: 'Cutubka 1: Bilowgii Manuscript-ga',
                content: Array.isArray(parsed.content) ? parsed.content : [parsed.content || '']
              }
            ];

            setSandboxStory({
              id: parsed.id || `uploaded_so_${Date.now()}`,
              title: parsed.title,
              author: parsed.author || currentUser.fullName,
              category: parsed.category || 'History',
              summary: parsed.summary || (chapters[0]?.content[0]?.slice(0, 110) + '...' || 'Manually compiled manuscript.'),
              chapters,
              readTime: parsed.readTime || `${Math.max(2, Math.ceil(text.split(/\s+/).length / 150))} min`,
              rating: 5.0,
              isGold: true,
              publishedDate: 'Manuscript Draft',
              reviewsCount: 0,
              originalLanguage: parsed.originalLanguage || 'Somali'
            });

            setSuccessMsg('JSON manuscript document loaded into the Sandbox Editor stage!');
          } else {
            setError('The JSON file requires at least a "title" and a "chapters" array or "content" block.');
          }
        } catch (err) {
          setError('Failed parsing JSON format files. Verify integrity syntax.');
        }
      } else {
        // Parse raw text formats (Plain TXT, Markdown)
        const lines = text.split('\n');
        let extractedTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
        let extractedSummary = '';
        const paragraphs: string[] = [];

        // Simple heuristic line identification
        lines.forEach((line) => {
          const cleanLine = line.trim();
          if (!cleanLine) return;

          if (cleanLine.toLowerCase().startsWith('title:')) {
            extractedTitle = cleanLine.substring(6).trim();
          } else if (cleanLine.toLowerCase().startsWith('summary:')) {
            extractedSummary = cleanLine.substring(8).trim();
          } else if (cleanLine.toLowerCase().startsWith('shaxaad:') || cleanLine.toLowerCase().startsWith('soomaali:')) {
            // Ignore custom metadata prefixes
          } else {
            paragraphs.push(cleanLine);
          }
        });

        const activeParagraphs = paragraphs.length > 0 ? paragraphs : ['Ka bilow halkan si aad u qorto sheeko qurux badan...'];
        if (!extractedSummary) {
          extractedSummary = activeParagraphs[0]?.slice(0, 120) + '...' || 'Somali manuscript draft.';
        }

        setSandboxStory({
          id: `draft_so_${Date.now()}`,
          title: extractedTitle,
          author: currentUser.fullName,
          category: 'History',
          summary: extractedSummary,
          chapters: [
            {
              title: 'Cutubka 1: Qoraalka La Soo Sifayay',
              content: activeParagraphs
            }
          ],
          readTime: `${Math.max(2, Math.ceil(text.split(/\s+/).length / 150))} min`,
          rating: 5.0,
          isGold: false,
          publishedDate: 'Draft parsed',
          reviewsCount: 0,
          originalLanguage: 'Somali'
        });

        setSuccessMsg('Written Somali text manuscript imported. You can now make changes below!');
      }
    };

    reader.readAsText(file);
  };

  // Drag and Drop Drag handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedManuscript(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processUploadedManuscript(e.target.files[0]);
    }
  };

  // AI Generation Weavometer
  const handleWeaveTale = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!isAiMode) {
      // Manual typing check (if not loading file)
      if (!manualTitle.trim() || !manualContent.trim()) {
        setError('Please enter a title & story paragraphs or use the uploader to import file documents!');
        return;
      }

      const rawStory: Story = {
        id: `man_story_${Date.now()}`,
        title: manualTitle.trim(),
        author: currentUser.fullName,
        category,
        summary: manualContent.slice(0, 110) + '...',
        readTime: `${Math.max(2, Math.ceil(manualContent.split(/\s+/).length / 150))} min`,
        rating: 5.0,
        isGold: false,
        publishedDate: 'Draft',
        reviewsCount: 0,
        originalLanguage: language,
        chapters: [
          {
            title: language === 'Somali' ? 'Cutubka 1: Bilowga Sheekada' : 'Chapter 1: The New Horizon',
            content: manualContent.split('\n\n').map(p => p.trim()).filter(Boolean)
          }
        ]
      };

      setSandboxStory(rawStory);
      setSuccessMsg(`Compiled story draft successfully! Modify or edit chapters below:`);
      return;
    }

    // AI Generation Stage
    if (!prompt.trim()) {
      setError('Please provide a creative prompt or description for the Somali AI Writer.');
      return;
    }

    setWeaving(true);
    setLoadingStep(language === 'Somali' ? 'U yeerida ruuxda xigmada...' : 'Consulting the cosmic alignment...');
    
    // Smooth loading indicators
    const loadingTimers = [
      setTimeout(() => setLoadingStep(language === 'Somali' ? 'Diyaarinta bogga dahabiga ah...' : 'Incubating narrative arches...'), 2000),
      setTimeout(() => setLoadingStep(language === 'Somali' ? 'Qorista cutubyada Af-Soomaaliga...' : 'Engraving beautiful sensory prose elements...'), 4000),
      setTimeout(() => setLoadingStep(language === 'Somali' ? 'Xaqiijinta naxwaha iyo tuducyada...' : 'Sealing gold leaf bindings on chapters...'), 6050),
    ];

    try {
      const response = await fetch('/api/stories/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          category,
          authorName: currentUser.fullName,
          language: language,
        }),
      });

      if (!response.ok) {
        throw new Error('Our story servers are momentarily processing other documents. Please retry.');
      }

      const wovenStory = await response.json();
      
      const fullyConstructed: Story = {
        id: `ai_story_${Date.now()}`,
        title: wovenStory.title || 'Mawduuca Cajiibka ah',
        author: wovenStory.author || currentUser.fullName,
        category: wovenStory.category || category,
        summary: wovenStory.summary || 'Sheeko qoto dheer oo laga soo minguuriyay dhiirigelintaada.',
        readTime: `${wovenStory.chapters ? Math.max(3, wovenStory.chapters.length * 4) : 8} min`,
        rating: 5.0,
        isGold: true,
        publishedDate: 'Woven with Gemini',
        reviewsCount: 0,
        originalLanguage: language,
        chapters: wovenStory.chapters || []
      };

      loadingTimers.forEach(clearTimeout);
      setWeaving(false);
      setSandboxStory(fullyConstructed);
      setSuccessMsg(language === 'Somali' ? 'Sheekadii waa la soo saaray! Ku samee isbeddel kasta oo aad rabto hoos:' : 'AI Story woven successfully! Make any adjustments in our editor sandbox below:');
    } catch (err: any) {
      loadingTimers.forEach(clearTimeout);
      setWeaving(false);
      setError(err?.message || 'Failed connecting with the generation servers. Restarting offline fallback...');
    }
  };

  // Publish stage callback (Sends to app feed)
  const handlePublishGlobally = async () => {
    if (!sandboxStory) return;
    setError('');
    setSuccessMsg('');

    try {
      const publishedVersion = {
        ...sandboxStory,
        publishedDate: new Date().toLocaleDateString('so-SO', { year: 'numeric', month: 'long', day: 'numeric' }),
        rating: 5.0,
        isGold: true,
        reviewsCount: 0
      };

      const response = await fetch('/api/stories/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(publishedVersion)
      });

      if (!response.ok) {
        throw new Error('Failed to send published file. Server refused document parameters.');
      }

      const resData = await response.json();
      if (resData.success) {
        // Trigger complete lifecycle
        onStoryWeaveSuccess(resData.story);
      } else {
        throw new Error('Publish action was denied by standard API filters.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit story to shared node network. Check link.');
    }
  };

  const handleSaveLocallyOnly = () => {
    if (!sandboxStory) return;
    // Just trigger standard local callback
    onStoryWeaveSuccess(sandboxStory);
  };

  // Chapter content changes
  const handleChapterTitleChange = (chapterIdx: number, newTitle: string) => {
    if (!sandboxStory) return;
    const updatedChaps = [...(sandboxStory.chapters || [])];
    updatedChaps[chapterIdx] = {
      ...updatedChaps[chapterIdx],
      title: newTitle
    };
    setSandboxStory({
      ...sandboxStory,
      chapters: updatedChaps
    });
  };

  const handleChapterParagraphChange = (chapterIdx: number, paragraphIdx: number, text: string) => {
    if (!sandboxStory) return;
    const updatedChaps = [...(sandboxStory.chapters || [])];
    const updatedContent = [...updatedChaps[chapterIdx].content];
    updatedContent[paragraphIdx] = text;
    updatedChaps[chapterIdx] = {
      ...updatedChaps[chapterIdx],
      content: updatedContent
    };
    setSandboxStory({
      ...sandboxStory,
      chapters: updatedChaps
    });
  };

  const appendParagraphToChapter = (chapterIdx: number) => {
    if (!sandboxStory) return;
    const updatedChaps = [...(sandboxStory.chapters || [])];
    updatedChaps[chapterIdx] = {
      ...updatedChaps[chapterIdx],
      content: [...updatedChaps[chapterIdx].content, 'Tuduc cusub...']
    };
    setSandboxStory({
      ...sandboxStory,
      chapters: updatedChaps
    });
  };

  const deleteParagraphFromChapter = (chapterIdx: number, paragraphIdx: number) => {
    if (!sandboxStory) return;
    const updatedChaps = [...(sandboxStory.chapters || [])];
    if (updatedChaps[chapterIdx].content.length <= 1) return; // keep at least one
    const updatedContent = updatedChaps[chapterIdx].content.filter((_, idx) => idx !== paragraphIdx);
    updatedChaps[chapterIdx] = {
      ...updatedChaps[chapterIdx],
      content: updatedContent
    };
    setSandboxStory({
      ...sandboxStory,
      chapters: updatedChaps
    });
  };

  return (
    <div
      id="custom-story-writer-panel"
      className="min-h-screen w-full bg-[#03091c] text-slate-100 font-sans px-4 py-8 md:p-12 flex flex-col items-center relative"
    >
      {/* Background Star Simulation */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none -z-10" />

      {/* Main Form container width */}
      <div className="w-full max-w-3xl flex flex-col">
        
        {/* Header Title displaying Somali theme components */}
        <div className="text-center mb-8 select-none">
          <span className="inline-flex items-center space-x-1 px-3.5 py-1.5 bg-gold-400/10 text-gold-400 text-xs font-mono font-bold uppercase rounded-full tracking-wider border border-gold-400/20 mb-3">
            <Sparkles className="w-3.5 h-3.5 animate-spin-slow text-gold-500" />
            <span>SHEEKOOYINKA SOOMAALIDA</span>
          </span>
          <h2 className="font-serif text-3.5xl md:text-5xl font-extrabold tracking-tight text-white">
            Pinnacle Writing Sanctum
          </h2>
          <p className="text-sm text-slate-400 mt-2 max-w-xl mx-auto font-medium">
            Draft, import story manuscripts in Somali, modify chapters, and publish them so only people who use the app can read.
          </p>
        </div>

        {/* Global feedbacks */}
        {error && (
          <div className="p-4 mb-6 text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center space-x-2 font-medium">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-4 mb-6 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center space-x-2 font-medium">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* LOADING ANIMATED HUD */}
        {weaving ? (
          <div className="bg-[#0b142d] border border-gold-400/20 rounded-3xl p-10 flex flex-col items-center justify-center space-y-6 text-center shadow-2xl min-h-[350px]">
            <div className="relative flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border-4 border-solid border-slate-500/10 border-t-gold-400 animate-spin" />
              <Sparkles className="w-6 h-6 text-gold-400 absolute animate-pulse" />
            </div>

            <div className="space-y-2">
              <h4 className="font-serif text-xl font-bold text-white animate-pulse">
                Inkaasida qoraalka Af-Soomaaliga...
              </h4>
              <p className="text-xs font-mono text-gold-400 uppercase tracking-widest animate-pulse">
                {loadingStep}
              </p>
            </div>

            <p className="text-xs text-slate-400 max-w-sm">
              Our server-side Gemini intelligence is weaving custom Somali paragraphs with traditional allegorical rhythm. Please wait...
            </p>
          </div>
        ) : (
          <>
            {/* STAGE A: CHOOSE GENERATE / DRAFT OR DROP FILES */}
            {!sandboxStory && (
              <div className="space-y-6">
                
                {/* Mode Selectors */}
                <div className="flex flex-col sm:flex-row items-center justify-between bg-slate-900/60 p-2 rounded-2xl border border-slate-500/10 gap-3">
                  <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-500/10 text-xs font-bold leading-none gap-1">
                    <button
                      type="button"
                      onClick={() => setIsAiMode(true)}
                      className={`py-2 px-3.5 rounded-lg flex items-center space-x-1.5 transition-all cursor-pointer ${
                        isAiMode ? 'bg-gold-400 text-slate-950 shadow-sm' : 'opacity-75 hover:opacity-100'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Somali Gemini Writer</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAiMode(false)}
                      className={`py-2 px-3.5 rounded-lg flex items-center space-x-1.5 transition-all cursor-pointer ${
                        !isAiMode ? 'bg-gold-400 text-slate-950 shadow-sm' : 'opacity-75 hover:opacity-100'
                      }`}
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      <span>Write Manually</span>
                    </button>
                  </div>

                  {/* Language Selector */}
                  <div className="flex items-center space-x-2 text-xs font-bold font-mono">
                    <span className="text-slate-400 px-1 font-sans">Story Language:</span>
                    <button
                      type="button"
                      onClick={() => setLanguage('Somali')}
                      className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                        language === 'Somali' 
                          ? 'border-gold-500 bg-gold-400/10 text-gold-400' 
                          : 'border-slate-700 bg-slate-950 text-slate-400'
                      }`}
                    >
                      🇸🇴 Somali
                    </button>
                    <button
                      type="button"
                      onClick={() => setLanguage('English')}
                      className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                        language === 'English' 
                          ? 'border-gold-500 bg-gold-400/10 text-gold-400' 
                          : 'border-slate-700 bg-slate-950 text-slate-400'
                      }`}
                    >
                      🇬🇧 English
                    </button>
                  </div>
                </div>

                {/* FILE MANUSCRIPT UPLOAD DRAGZONE */}
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    dragActive 
                      ? 'border-gold-400 bg-gold-400/5 shadow-lg shadow-gold-500/5' 
                      : 'border-slate-700 hover:border-gold-500 bg-slate-950/40 hover:bg-slate-950/80'
                  }`}
                  id="story-upload-dragzone"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,.txt,.md"
                    onChange={handleFileSelectChange}
                    className="hidden"
                    id="story-file-uploader-field"
                  />
                  <UploadCloud className="w-12 h-12 text-gold-400/70 mb-3 animate-bounce" />
                  <h4 className="text-base font-serif font-bold text-white">
                    Upload Your Somali Story Draft
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm">
                    Drag and drop your manuscript (.txt, .md, or .json template files) here or browse local folders.
                  </p>
                  <span className="inline-block mt-3 px-2.5 py-1 bg-slate-900 border border-slate-700 text-[10px] font-mono text-slate-400 rounded-md">
                    Supports Somali and English texts
                  </span>
                </div>

                {/* Creation inputs */}
                <form onSubmit={handleWeaveTale} className="bg-[#0a1126] border border-slate-500/10 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
                  {/* Title (for manual writing) */}
                  {!isAiMode && (
                    <div>
                      <label className="block text-xs font-bold text-gold-400 uppercase tracking-wider mb-2">
                        Draft Story Title
                      </label>
                      <input
                        type="text"
                        value={manualTitle}
                        onChange={(e) => setManualTitle(e.target.value)}
                        placeholder={language === 'Somali' ? "e.g. Geesigii Gobolka Sanaag" : "e.g. The Alchemist of Berbera"}
                        className="w-full bg-slate-950 border border-slate-500/15 focus:border-gold-400 rounded-xl px-4 py-3 outline-hidden text-sm"
                      />
                    </div>
                  )}

                  {/* Theme Category selection */}
                  <div>
                    <label className="block text-xs font-bold text-gold-400 uppercase tracking-wider mb-2">
                      Story Category / Genre
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as Category)}
                      className="w-full bg-slate-950 border border-slate-500/15 focus:border-gold-400 rounded-xl px-4 py-3 outline-hidden text-sm cursor-pointer"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Body choice/prompt */}
                  {isAiMode ? (
                    <div>
                      <label className="block text-xs font-bold text-gold-400 uppercase tracking-wider mb-2">
                        Describe What Happens (Prompt in Somali or English)
                      </label>
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={language === 'Somali' 
                          ? "Tusaale: Sheeko ku saabsan gabar Soomaaliyeed oo ku nool miyiga gobolka Bari oo heshay buug duug ah oo ay ku qoran yihiin gabayo qadiimi ah..." 
                          : "e.g. A young astrolabe maker in ancient Mogadishu who discovers a navigation device mapping stars..."
                        }
                        rows={4}
                        className="w-full bg-slate-950 border border-slate-500/15 focus:border-gold-400 rounded-xl p-4 outline-hidden text-sm leading-relaxed"
                      />
                      <span className="text-[10px] text-slate-500 block mt-2.5">
                        Pro-tip: Describe the landscape, protagonist name, and central conflict to get a highly atmospheric custom story output from Gemini.
                      </span>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-bold text-gold-400 uppercase tracking-wider mb-2">
                        Draft Content (separate paragraphs by pressing return twice)
                      </label>
                      <textarea
                        value={manualContent}
                        onChange={(e) => setManualContent(e.target.value)}
                        placeholder={language === 'Somali'
                          ? "Ku qor cutubyadaada quruxda badan halkan..."
                          : "Type your beautifully constructed narrative paragraphs here..."
                        }
                        rows={8}
                        className="w-full bg-slate-950 border border-slate-500/15 focus:border-gold-400 rounded-xl p-4 outline-hidden text-sm leading-relaxed font-serif"
                      />
                    </div>
                  )}

                  {/* Actions buttons */}
                  <div className="flex items-center justify-between pt-4 gap-4">
                    <button
                      type="button"
                      onClick={onCancel}
                      className="py-3 px-6 border border-slate-500/15 text-slate-400 hover:text-white rounded-xl text-xs font-bold uppercase transition-colors cursor-pointer"
                    >
                      DISCARD
                    </button>

                    <button
                      type="submit"
                      className="flex-1 bg-gold-400 hover:bg-gold-500 text-slate-950 py-3.5 px-4 rounded-xl text-xs font-extrabold uppercase tracking-widest flex items-center justify-center space-x-2 cursor-pointer shadow-md shadow-gold-500/15"
                    >
                      {isAiMode ? <Sparkles className="w-4 h-4" /> : <PenTool className="w-4 h-4" />}
                      <span>{isAiMode ? 'WEAVE COLLABORATIVE TALE' : 'ENTER CO-WRITER SANDBOX'}</span>
                    </button>
                  </div>

                </form>
              </div>
            )}

            {/* STAGE B: INTERACTIVE STORY REVIEW & EDITING WORKSPACE (MAKE CHANGES) */}
            {sandboxStory && (
              <div className="space-y-6 animate-fade-in">
                
                {/* SANDBOX HEADER SEALS */}
                <div className="p-5 bg-slate-900/80 border border-gold-400/15 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center space-x-3 text-center md:text-left">
                    <div className="w-12 h-12 rounded-2xl bg-gold-400 flex items-center justify-center text-slate-950">
                      <FolderOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-white">Sandbox Assembly Editor</h3>
                      <p className="text-xs text-slate-400">Review your imported/woven draft and perform manual alterations freely.</p>
                    </div>
                  </div>
                  
                  {/* Global Publication Scope warning */}
                  <div className="px-3.5 py-1.5 bg-sky-500/10 text-sky-400 rounded-full text-xs font-mono font-bold border border-sky-500/15 flex items-center space-x-1.5">
                    <Globe className="w-3.5 h-3.5 animate-pulse text-sky-400" />
                    <span>App-Only Publish Ready</span>
                  </div>
                </div>

                {/* EDITABLE FIELDS PANEL */}
                <div className="bg-[#0a1126] border border-slate-500/10 rounded-3xl p-6 md:p-8 space-y-6">
                  
                  {/* Edit Title, Category & Lang */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-gold-400 uppercase tracking-wider mb-2">
                        Story Title
                      </label>
                      <input
                        type="text"
                        value={sandboxStory.title}
                        onChange={(e) => setSandboxStory({ ...sandboxStory, title: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-500/15 focus:border-gold-400 rounded-xl px-4 py-3 outline-hidden text-sm font-bold text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gold-400 uppercase tracking-wider mb-2">
                        Scribbler Pen / Author
                      </label>
                      <input
                        type="text"
                        value={sandboxStory.author}
                        onChange={(e) => setSandboxStory({ ...sandboxStory, author: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-500/15 focus:border-gold-400 rounded-xl px-4 py-3 outline-hidden text-sm text-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gold-400 uppercase tracking-wider mb-2">
                        Genre Node
                      </label>
                      <select
                        value={sandboxStory.category}
                        onChange={(e) => setSandboxStory({ ...sandboxStory, category: e.target.value as Category })}
                        className="w-full bg-slate-950 border border-slate-500/15 focus:border-gold-400 rounded-xl px-4 py-3 outline-hidden text-sm text-slate-300"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Summary Core Block */}
                  <div>
                    <label className="block text-xs font-bold text-gold-400 uppercase tracking-wider mb-2">
                      Short Core Summary / Intrigue
                    </label>
                    <textarea
                      value={sandboxStory.summary}
                      onChange={(e) => setSandboxStory({ ...sandboxStory, summary: e.target.value })}
                      rows={2}
                      className="w-full bg-slate-950 border border-slate-500/15 focus:border-gold-400 rounded-xl p-3.5 outline-hidden text-xs leading-normal text-slate-300"
                    />
                  </div>

                  {/* ACTIVE CHAPTERS EDITING SPACE */}
                  <div className="space-y-8 pt-4 border-t border-slate-500/10">
                    <h4 className="font-serif text-lg font-bold text-white flex items-center space-x-2">
                      <BookOpen className="w-5 h-5 text-gold-400" />
                      <span>Chapters and Paragraphs Editor</span>
                    </h4>

                    {(sandboxStory.chapters || []).map((chapter, chapIdx) => (
                      <div key={chapIdx} className="p-5 bg-slate-950/60 rounded-2xl border border-slate-500/10 space-y-4">
                        
                        {/* Chapter title Input */}
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                            Chapter {chapIdx + 1} Heading Title
                          </label>
                          <input
                            type="text"
                            value={chapter.title}
                            onChange={(e) => handleChapterTitleChange(chapIdx, e.target.value)}
                            className="w-full bg-slate-900 border border-slate-500/10 focus:border-gold-400 rounded-lg px-3 py-2 text-sm font-serif font-bold text-gold-400"
                          />
                        </div>

                        {/* Chapter paragraphs array items */}
                        <div className="space-y-3">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Paragraph Blocks
                          </label>
                          
                          {chapter.content.map((pText, parIdx) => (
                            <div key={parIdx} className="flex items-start gap-2.5">
                              <span className="w-6 h-6 mt-2 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-mono font-bold flex items-center justify-center text-slate-500 shrink-0 select-none">
                                {parIdx + 1}
                              </span>
                              
                              <textarea
                                value={pText}
                                onChange={(e) => handleChapterParagraphChange(chapIdx, parIdx, e.target.value)}
                                rows={2.5}
                                className="flex-1 bg-slate-900 border border-slate-500/5 focus:border-gold-400 rounded-xl p-3 text-xs leading-relaxed font-serif text-slate-300 outline-hidden"
                              />

                              <button
                                type="button"
                                title="Delete Paragraph Content"
                                onClick={() => deleteParagraphFromChapter(chapIdx, parIdx)}
                                disabled={chapter.content.length <= 1}
                                className="p-2 mt-2 bg-rose-500/5 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Add Paragraph button */}
                        <button
                          type="button"
                          onClick={() => appendParagraphToChapter(chapIdx)}
                          className="mt-2 inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-[10px] font-bold text-gold-400 border border-slate-500/10 rounded-lg uppercase transition-all cursor-pointer"
                        >
                          <Plus className="w-3 h-3 text-gold-400" />
                          <span>Add Paragraph</span>
                        </button>

                      </div>
                    ))}
                  </div>

                  {/* Bottom Controls / Publication triggers */}
                  <div className="pt-6 border-t border-slate-500/15 flex flex-col sm:flex-row items-center justify-between gap-4">
                    
                    {/* Discard Workspace */}
                    <button
                      type="button"
                      onClick={() => {
                        setSandboxStory(null);
                        setSuccessMsg('');
                      }}
                      className="w-full sm:w-auto py-3 px-6 bg-slate-950 border border-slate-500/15 hover:border-rose-500/35 text-slate-400 hover:text-rose-400 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer"
                    >
                      Clear Assembly
                    </button>

                    <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-3">
                      
                      {/* Local draft save */}
                      <button
                        type="button"
                        onClick={handleSaveLocallyOnly}
                        className="w-full sm:w-auto py-3 px-5 border border-gold-400/15 text-gold-400 hover:bg-gold-400/5 rounded-xl text-xs font-bold uppercase tracking-wide transition-colors cursor-pointer"
                      >
                        Save Draft Locally
                      </button>

                      {/* Global publisher trigger */}
                      <button
                        type="button"
                        onClick={handlePublishGlobally}
                        className="w-full sm:w-auto bg-gradient-to-r from-gold-400 to-amber-500 hover:from-gold-500 hover:to-amber-600 text-slate-950 py-3.5 px-6 rounded-xl text-xs font-extrabold uppercase tracking-widest flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-gold-500/10 hover:shadow-gold-500/20 transition-all font-sans"
                      >
                        <Globe className="w-4 h-4 text-slate-950 animate-spin-slow" />
                        <span>Publish globally to app</span>
                      </button>

                    </div>

                  </div>

                </div>

              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
};
