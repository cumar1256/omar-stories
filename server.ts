/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

// Ensure server binds to host 0.0.0.0 and port 3000
const PORT = 3000;
const app = express();

app.use(express.json());

// Initialize Gemini SDK with telemetry header
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    console.warn('⚡ Warning: GEMINI_API_KEY is not defined. Falling back to offline creative generator.');
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

const ai = getGeminiClient();

// Shared structures and databases for administrative synchronization
const SHARED_STORIES_FILE = path.join(process.cwd(), 'shared_stories.json');
const SHARED_PHOTOS_FILE = path.join(process.cwd(), 'shared_photos.json');
const APP_SETTINGS_FILE = path.join(process.cwd(), 'app_settings.json');
const SHARED_MESSAGES_FILE = path.join(process.cwd(), 'shared_messages.json');

// Master preloaded tales list for initializing the database
const INITIAL_STORIES_SEED = [
  {
    id: "1",
    title: "The Silent Dunes of Andalusia",
    author: "Omar Al-Farsi",
    category: "Romance",
    summary: "A breathtaking journey through forgotten paths where ancient love and echoes of destiny meet among the rolling golden dunes.",
    readTime: "12 min",
    rating: 4.9,
    isGold: true,
    coverUrl: "https://images.unsplash.com/photo-1547234935-80c7145ec969?q=80&w=600",
    coverGradient: "linear-gradient(to bottom, #1e1b4b, #311042)",
    publishedDate: "January 14, 2026",
    reviewsCount: 348,
    chapters: [
      {
        title: "Chapter 1: The Caravan of Whispers",
        content: [
          "The sun was descending beneath the golden lips of the Andalusian wilderness, bathing the rolling plains in hues of burnt sienna and deep violet. Tariq pulled his indigo headscarf tighter against the rising wind—a wind that carried the saline breath of the Mediterranean and the heavy fragrance of wild lavender.",
          "For seven days, the caravan had moved in perfect silence, avoiding the major patrols. They were couriers of safe passage, guiding families seeking sanctuary across the shifting political frontiers. Tariq looked back at the long line of dromedaries. In the middle sat a young woman whose gaze remained fixed on the horizon, as if looking for a memory that had been swept away by the sands.",
          "Her name was Yasmin. Unlike the others seeking mere physical safety, Yasmin carried a small, leather-bound chest of papers—the last remaining poetry of the great Alhambra libraries. \"In Andalusia,\" she whispered as Tariq rode alongside her, \"we leave our structures, but we must never leave our words. If our verses survive, our nation never dies.\""
        ]
      },
      {
        title: "Chapter 2: Star-Crossed in the Sierra Nevada",
        content: [
          "High in the shadows of the Sierra Nevada mountains, they pitched camp under a canopy of stars so bright they seemed to hum. The heat of the day evaporated, replaced by a crystalline chill.",
          "Sitting by a low, smokeless fire, Yasmin opened her chest. Tariq watched the soft firelight trace the delicate lines of her face. \"Why do you risk your life for paper, Yasmin?\" he asked quietly.",
          "She smiled, her eyes reflecting the flame. \"It is not paper, Tariq. It is proof that we once loved, dreamed, and understood the cosmos. Look at this.\" She turned a page of gold-leaf script. \"This is an astrolabe chart coupled with verses by Ibn Zaydun. It says that no matter how far the heart wanders, it is governed by the same astronomy as the stars.\"",
          "That night, as the cold mountain breeze rustled the canvas of their tent, their hands met over the ancient parchment. In that brief touch, the centuries of war and displacement faded. There was only the warmth of a shared sanctuary—a love written in the stars, yet bounded by the fleeting sands."
        ]
      },
      {
        title: "Chapter 3: The Sanctuary Found",
        content: [
          "At dawn, they crossed the ridge to see the sparkling blue of the sea. Below lay the quiet harbor where a ship waited to bear them to the shores of North Africa.",
          "Tariq stood at the shoreline, the salty spray dampening his wool coat. Yasmin stepped onto the wooden gangway, then stood. She turned to Tariq, her hand extended, holding a single rolled parchment tied with a golden thread.",
          "\"Keep this,\" she said. \"When you look at the dunes, read it. Know that out of the silence, a verse will always find its friend. Our story does not end here; it is merely starting another chapter across the water.\"",
          "Tariq watched the vessel hoist its sails, catching the morning breeze. He unrolled the scroll. It was a poem of reunion, promising that love, once etched on the soul, remains as eternal and unmoving as the bedrock beneath the shifting sands."
        ]
      }
    ]
  },
  {
    id: "2",
    title: "Echoes of the Great Library",
    author: "Sarah Jenkins",
    category: "Adventure",
    summary: "Deciphering the lost scrolls of a civilization that transcended time, locked away in the forgotten underwater vault of Alexandria.",
    readTime: "18 min",
    rating: 4.8,
    isGold: true,
    coverUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=600",
    coverGradient: "linear-gradient(to bottom, #0f172a, #115e59)",
    publishedDate: "February 2, 2026",
    reviewsCount: 219,
    chapters: [
      {
        title: "Chapter 1: The Sunken Vault",
        content: [
          "The deep sea pressure groaned against the steel hulls of the submersible. Dr. Sarah Jenkins adjusted her headset, her eyes glued to the exterior floodlights piercing the abyssal blackness of the Alexandrian bay.",
          "For forty years, historians claimed the Royal Library was utterly turned to ash. But Sarah had spent her life chasing a different rumor—that a hidden archive, the Bibliotheca Impervia, was sealed in a watertight obsidian vault seabed before the fires ever reached the harbor.",
          "Suddenly, the sonar chimed—a loud, rhythmic pulse. The light fell on a monolithic stone doorway, untouched by the millennia. An intricate relief of an open book with a burning astrolabe was carved on its face. \"We found it,\" Sarah breathed. \"We found the sanctuary.\""
        ]
      },
      {
        title: "Chapter 2: The Decipherment of Light",
        content: [
          "Inside the pressurized chambers of the ancient vault, the air was dry and smelled of old ozone and salt-leached basalt. Cylindrical bronze canisters lined the shelves, containing scrolls preserved in beeswax wraps.",
          "Sarah carefully unscrewed the first canister. With microfiber gloves, she teased open a papyrus scroll that had not felt human touch since the reign of Cleopatra. What she saw was not Greek or Egyptian script, but mathematical coordinates overlaid with geometric drawings of the heavens.",
          "\"This is not history,\" whispered her assistant, Marcus. \"Look at these equations. They describe gravitational lensing... three thousand years before Einstein!\" They realized the library was not just a collection of stories, but a blueprint of an advanced understanding of the universe, saved for a future mature enough to understand it."
        ]
      }
    ]
  },
  {
    id: "3",
    title: "The Architecture of Friendship",
    author: "David Thorne",
    category: "Islamic Stories",
    summary: "An exploration of the invisible, spiritual threads that hold our most loyal memories together through life’s storms.",
    readTime: "15 min",
    rating: 5.0,
    isGold: true,
    coverUrl: "https://images.unsplash.com/photo-1501555088652-021faa106b9b?q=80&w=600",
    coverGradient: "linear-gradient(to bottom, #0c1c38, #1e3a8a)",
    publishedDate: "March 10, 2026",
    reviewsCount: 512,
    chapters: [
      {
        title: "Chapter 1: The Master Mason of Cordoba",
        content: [
          "Yusuf stared up at the vast arches of the Mosque-Cathedral of Cordoba. Red and white voussoirs spanned the vast forest of columns, catching the amber beams of the midday sun. Beside him stood his childhood companion, Karim.",
          "Yusuf was an architect of stone—practical, measuring life in spans of marble and structural loads. Karim was an artist of light, designing the intricate geometric stained glass that filtered the harsh Spanish sun into pools of spiritual cobalt and ruby.",
          "\"A building is only as stable as its foundations, Karim,\" Yusuf said, checking a plumb line. \"If a column is out by an inch, the vaults will fracture when the winter rains come.\"",
          "Karim smiled, pointing to the ceiling where the wooden ribbing curved gracefully. \"But Yusuf, stone without light is just a tomb. It is the light that breathes life into your pillars. Our friendship is the same—you provide the ground, and I seek the sky.\""
        ]
      },
      {
        title: "Chapter 2: The Fire of Sevilla",
        content: [
          "Years later, during a period of heavy political upheaval, their architectural workshop in Sevilla was devastated by an accidental fire. Yusuf’s life’s work—hundreds of precise blueprints, mathematical models, and architectural drawings—was lost in a single night of ash and smoke.",
          "Yusuf sat on the blackened stone stairs of the ruins, hands buried in his face, completely defeated. \"Everything I built, everything I measured, is gone. It was all fragile, Karim.\"",
          "Karim knelt in the soot, retrieving a piece of glass that had survived the heat, glowing with an intense golden color. \"The physical drawings are gone, Yusuf, but our minds designed them together. The structural secret is in our memory. As long as we stand together, the sanctuary is never destroyed.\""
        ]
      }
    ]
  },
  {
    id: "4",
    title: "The Whisper of the Olive Tree",
    author: "Ismael Qasim",
    category: "Wisdom",
    summary: "Under the heavy shade of an ancient olive tree, three generations of Palestinian farmers share secrets of resilience, faith, and patience.",
    readTime: "10 min",
    rating: 4.7,
    isGold: false,
    coverUrl: "https://images.unsplash.com/photo-1474552226712-ac0f0961a954?q=80&w=600",
    coverGradient: "linear-gradient(to bottom, #111827, #1e293b)",
    publishedDate: "April 20, 2026",
    reviewsCount: 124,
    chapters: [
      {
        title: "Chapter 1: The Ancient Roots",
        content: [
          "In the hills overlooking Nablus stood Al-Khatyar—The Old One. It was an olive tree whose gnarled trunk was split into three thick columns, its silver-green leaves rustling like soft rain in the morning breeze.",
          "Grandfather Ibrahim sat on a stone terrace, his weathered fingers shelling raw almonds. Beside him, his ten-year-old granddaughter, Miriam, watched the branches sway. \"Sido,\" she asked, \"how old is this tree?\"",
          "Ibrahim took her hand, placing it on the rough, deeply ridged bark. \"This tree, Miriam, was planted by our ancestors before the Crusaders ever marched. It has seen droughts, frost, fires, and empires come and go. When you feel afraid or unsettled, put your ear to the bark. Listen to the roots. They hold the deep story of who we are.\""
        ]
      }
    ]
  },
  {
    id: "5",
    title: "The Astrolabe of Cordoba",
    author: "Zayd Mansour",
    category: "Sci-Fi",
    summary: "A young astronomer in medieval Andalusia discovers a mystical astrolabe that maps paths of human destiny and folds of space-time.",
    readTime: "20 min",
    rating: 5.0,
    isGold: true,
    coverUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600",
    coverGradient: "linear-gradient(to bottom, #020617, #1e1b4b)",
    publishedDate: "November 12, 2025",
    reviewsCount: 412,
    chapters: [
      {
        title: "Chapter 1: The Brass Device",
        content: [
          "The workshop of Master El-Zarqali smelled of whale oil, polishing compound, and melted copper. Zayd, his youngest apprentice, worked diligently on a heavy disk of brass, engraving the micro-meridian lines with an iron burin.",
          "But Zayd noticed something odd about this specific astrolabe commission. The plate representing the latitude of Cordoba had four extra concentric rings that did not align with any known stellar path or planetary orbit.",
          "When he rotated the rete—the web of brass pointers representing the stars—past the alignment of the Orion Nebula, the brass disk began to radiate a subtle, localized heat. The shadows in the corner of the room seemed to bend, casting impossible geometries on the plaster walls."
        ]
      },
      {
        title: "Chapter 2: The Portal of Starlight",
        content: [
          "That night, Zayd sneaked back into the workshop. He took the instrument to the flat roof of the madrasa, pointing it toward the apex of the night sky.",
          "Checking the rings, he aligned the brass pointers with the star Vega. He looked through the sighting vane. For a split second, the veil of the night sky split open. He did not see the stars as distant pinpricks of light, but as massive, roaring pinwheels of cosmic fire connected by shining gridlines of energy.",
          "An ancient voice echoed through the metal, sounding like the friction of grinding millstones. \"The astrolabe is not for looking at where the stars are, child. It is for aligning where you should be.\""
        ]
      }
    ]
  },
  {
    id: "6",
    title: "A Caravan's Hope",
    author: "Layla Nour",
    category: "History",
    summary: "An epic tale of a desert caravan navigating trade routes between Damascus and Medina, seeking hope and healing amidst sandy storms.",
    readTime: "14 min",
    rating: 4.6,
    isGold: false,
    coverUrl: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=600",
    coverGradient: "linear-gradient(to bottom, #111827, #451a03)",
    publishedDate: "May 5, 2026",
    reviewsCount: 89,
    chapters: [
      {
        title: "Chapter 1: The Simoom",
        content: [
          "The air grew stifling, baking hot and dead calm. Lead guide Malik raised his closed fist, causing the string of sixty pack camels block-stepping behind him to slow to an synchronized halt.",
          "\"The Simoom is coming,\" Malik shouted to his brother. The sky on the western rim was no longer blue; it had assumed a bruised, rust-colored tone that billowed upwards like dark smoke.",
          "They had only minutes to secure the merchandise—precious sacks of damask silk, frankincense modules, and medicinal oils from the Levant. Families huddled behind the prostrate camels as the wind struck with an absolute fury of flying flint and blistering heat."
        ]
      }
    ]
  }
];

const INITIAL_PHOTOS_SEED = [
  { id: 'p1', url: 'https://images.unsplash.com/photo-1547234935-80c7145ec969?q=80&w=600', title: 'Silent Dunes of Andalusia', category: 'Romance' },
  { id: 'p2', url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=600', title: 'Echoes of the Great Library', category: 'Adventure' },
  { id: 'p3', url: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?q=80&w=600', title: 'Architecture of Cordoba Ruins', category: 'Islamic Stories' },
  { id: 'p4', url: 'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?q=80&w=600', title: 'Ancient Palestinian Olive Tree', category: 'Wisdom' },
  { id: 'p5', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600', title: 'Stellar Navigation & Galaxy', category: 'Sci-Fi' },
  { id: 'p6', url: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=600', title: 'Ancient Caravan Sahara Trails', category: 'History' },
];

const DEFAULT_SETTINGS = {
  appName: "Omar Stories",
  announcementMsg: "Welcome to the Sanctuary. A new Premium Story is now active.",
  editorialQuote: "Every story is a journey into the heart of another, a sanctuary where we find ourselves."
};

const getSharedStories = (): any[] => {
  try {
    if (!fs.existsSync(SHARED_STORIES_FILE)) {
      fs.writeFileSync(SHARED_STORIES_FILE, JSON.stringify(INITIAL_STORIES_SEED, null, 2), 'utf8');
      return INITIAL_STORIES_SEED;
    }
    const data = fs.readFileSync(SHARED_STORIES_FILE, 'utf8');
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) {
      fs.writeFileSync(SHARED_STORIES_FILE, JSON.stringify(INITIAL_STORIES_SEED, null, 2), 'utf8');
      return INITIAL_STORIES_SEED;
    }
    return parsed;
  } catch (err) {
    console.error('Error loading/seeding shared stories database:', err);
    return INITIAL_STORIES_SEED;
  }
};

const saveSharedStories = (stories: any[]) => {
  try {
    fs.writeFileSync(SHARED_STORIES_FILE, JSON.stringify(stories, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing shared stories database:', err);
  }
};

const getSharedPhotos = (): any[] => {
  try {
    if (!fs.existsSync(SHARED_PHOTOS_FILE)) {
      fs.writeFileSync(SHARED_PHOTOS_FILE, JSON.stringify(INITIAL_PHOTOS_SEED, null, 2), 'utf8');
      return INITIAL_PHOTOS_SEED;
    }
    const data = fs.readFileSync(SHARED_PHOTOS_FILE, 'utf8');
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) {
      fs.writeFileSync(SHARED_PHOTOS_FILE, JSON.stringify(INITIAL_PHOTOS_SEED, null, 2), 'utf8');
      return INITIAL_PHOTOS_SEED;
    }
    return parsed;
  } catch (err) {
    console.error('Error loading shared photos database:', err);
    return INITIAL_PHOTOS_SEED;
  }
};

const saveSharedPhotos = (photos: any[]) => {
  try {
    fs.writeFileSync(SHARED_PHOTOS_FILE, JSON.stringify(photos, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing shared photos database:', err);
  }
};

const getAppSettings = (): any => {
  try {
    if (!fs.existsSync(APP_SETTINGS_FILE)) {
      fs.writeFileSync(APP_SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2), 'utf8');
      return DEFAULT_SETTINGS;
    }
    const data = fs.readFileSync(APP_SETTINGS_FILE, 'utf8');
    const parsed = JSON.parse(data);
    if (!parsed || !parsed.appName) {
      fs.writeFileSync(APP_SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2), 'utf8');
      return DEFAULT_SETTINGS;
    }
    return parsed;
  } catch (err) {
    console.error('Error loading app settings database:', err);
    return DEFAULT_SETTINGS;
  }
};

const saveAppSettings = (settings: any) => {
  try {
    fs.writeFileSync(APP_SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing app settings database:', err);
  }
};

const getSharedMessages = (): any[] => {
  try {
    const defaultMessages = [
      {
        id: 'msg-seed-1',
        sender: 'Omar Al-Farsi',
        role: 'Administrator',
        title: 'Welcome to the Sanctuary',
        content: 'I have prepared beautiful new custom options for everyone in Andalusia. If you want custom topics, let me know or weave them instantly with our built-in intelligence writer.',
        timestamp: new Date().toISOString()
      }
    ];

    if (!fs.existsSync(SHARED_MESSAGES_FILE)) {
      fs.writeFileSync(SHARED_MESSAGES_FILE, JSON.stringify(defaultMessages, null, 2), 'utf8');
      return defaultMessages;
    }
    const data = fs.readFileSync(SHARED_MESSAGES_FILE, 'utf8');
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) {
      fs.writeFileSync(SHARED_MESSAGES_FILE, JSON.stringify(defaultMessages, null, 2), 'utf8');
      return defaultMessages;
    }
    return parsed;
  } catch (err) {
    console.error('Error loading/seeding shared messages:', err);
    return [];
  }
};

const saveSharedMessages = (messages: any[]) => {
  try {
    fs.writeFileSync(SHARED_MESSAGES_FILE, JSON.stringify(messages, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing shared messages database:', err);
  }
};

// API endpoint to fetch app-wide settings customization parameters
app.get('/api/admin/settings', (req, res) => {
  res.json(getAppSettings());
});

// API endpoint to record tailored modifications to App settings
app.post('/api/admin/settings/save', (req, res) => {
  const settings = req.body;
  if (!settings || !settings.appName) {
    return res.status(400).json({ error: 'App brand name is required to publish.' });
  }
  saveAppSettings(settings);
  res.json({ success: true, settings });
});

// API endpoint to load master cover illustrations/photos registry
app.get('/api/admin/photos', (req, res) => {
  res.json(getSharedPhotos());
});

// API endpoint to annex a new cover illustration photograph link
app.post('/api/admin/photo/add', (req, res) => {
  const { url, title, category } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'A valid photograph web URL is required.' });
  }
  const photos = getSharedPhotos();
  const newPhoto = {
    id: `photo_${Date.now()}`,
    url,
    title: title || 'Illustration Artwork',
    category: category || 'Miscellaneous'
  };
  photos.push(newPhoto);
  saveSharedPhotos(photos);
  res.json({ success: true, photo: newPhoto });
});

// API endpoint to eradicate a physical cover photo from gallery
app.post('/api/admin/photo/delete', (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: 'Photo ID parameter is required.' });
  }
  let photos = getSharedPhotos();
  photos = photos.filter(p => p.id !== id);
  saveSharedPhotos(photos);
  res.json({ success: true });
});

// API endpoint to insert or fully overwrite a story draft in real time
app.post('/api/admin/story/save', (req, res) => {
  const story = req.body;
  if (!story || !story.title) {
    return res.status(400).json({ error: 'Core Story Title parameter is required.' });
  }
  const stories = getSharedStories();
  const index = stories.findIndex((s) => s.id === story.id);
  
  if (index !== -1) {
    stories[index] = {
      ...stories[index],
      ...story,
    };
  } else {
    // Brand new story registered on the server node!
    const newStory = {
      ...story,
      id: story.id || `story_${Date.now()}`,
      rating: story.rating || 5.0,
      reviewsCount: story.reviewsCount || 0,
      publishedDate: story.publishedDate || new Date().toLocaleDateString('so-SO', { year: 'numeric', month: 'long', day: 'numeric' }),
    };
    stories.unshift(newStory);
  }
  
  saveSharedStories(stories);
  res.json({ success: true, story });
});

// API endpoint to completely dismantle/remove a story
app.post('/api/admin/story/delete', (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: 'A valid Story ID to delete is required.' });
  }
  let stories = getSharedStories();
  stories = stories.filter(s => s.id !== id);
  saveSharedStories(stories);
  res.json({ success: true });
});

// API endpoint to purge all stories from database
app.post('/api/admin/story/delete-all', (req, res) => {
  try {
    console.log('Admin command: Purging all shared stories...');
    saveSharedStories([]);
    res.json({ success: true });
  } catch (err: any) {
    console.error('Fatal: Failed to purge all stories:', err);
    res.status(500).json({ error: err.message || 'Underlying storage write error during purge.' });
  }
});

// API endpoints for broadcast messages
app.get('/api/messages', (req, res) => {
  res.json(getSharedMessages());
});

app.post('/api/admin/messages/send', (req, res) => {
  const { sender, role, title, content } = req.body;
  if (!content) {
    return res.status(400).json({ error: 'Message content field is required.' });
  }
  const newMsg = {
    id: 'msg-' + Date.now(),
    sender: sender || 'Omar Al-Farsi',
    role: role || 'Administrator',
    title: title || 'Admin Broadcast Note',
    content,
    timestamp: new Date().toISOString()
  };
  const currentMessages = getSharedMessages();
  currentMessages.unshift(newMsg);
  saveSharedMessages(currentMessages);
  res.json({ success: true, message: newMsg });
});

app.post('/api/admin/messages/delete', (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: 'Message ID is required.' });
  }
  let currentMessages = getSharedMessages();
  currentMessages = currentMessages.filter(m => m.id !== id);
  saveSharedMessages(currentMessages);
  res.json({ success: true });
});

// API endpoint to fetch shared community stories
app.get('/api/stories/shared', (req, res) => {
  const stories = getSharedStories();
  res.json(stories);
});

// API endpoint to publish a story to everyone who uses the app
app.post('/api/stories/publish', (req, res) => {
  const newStory = req.body;
  if (!newStory || !newStory.title || !newStory.author) {
    return res.status(400).json({ error: 'Invalid story format. Title and Author are required.' });
  }

  const stories = getSharedStories();
  // Ensure the ID is unique or overwrite if it is the same user correcting a story
  const index = stories.findIndex((s) => s.id === newStory.id);
  if (index !== -1) {
    stories[index] = newStory;
  } else {
    // New published story goes to the top!
    stories.unshift(newStory);
  }

  saveSharedStories(stories);
  res.json({ success: true, story: newStory });
});

// API endpoint to generate story
app.post('/api/stories/generate', async (req, res) => {
  const { prompt, category, authorName, language } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Please enter a creative spark prompt.' });
  }

  const selectedCategory = category || 'Adventure';
  const author = authorName || 'Omar AI Co-Writer';
  const isSomali = language === 'Somali';

  // If Gemini API is offline or missing credentials, fallback gracefully with a beautiful offline story!
  if (!ai) {
    console.log('Using beautiful offline draft generator due to missing GEMINI_API_KEY. isSomali =', isSomali);
    // Generate a beautiful thematic offline draft
    setTimeout(() => {
      if (isSomali) {
        res.json({
          title: `Dhawaqa Culaybka ee ${prompt.charAt(0).toUpperCase() + prompt.slice(1, 15)}`,
          author: `${author} & Omar Sanctuary`,
          category: selectedCategory,
          summary: `Sheeko caan ah oo dhiirigelin ka heshay: "${prompt}". Waxaa lagu keydiyay kaydka khadka tooska ah ee sanctuary.`,
          chapters: [
            {
              title: `Cutubka 1: Bilowgii Xusuusta`,
              content: [
                `Waxa jiri jiray xusuus aamusan oo dusha ka sabaynaysay ciidda saxaraha, iyadoo raadinaysa qallbi xusuustay asalkeedii hore. Iyadoo dhiirigelin ka helaysa: "${prompt}", baadi-goobe ayaa baxay aroortii hore.`,
                'Cirku wuxuu lahaa midab madow oo buluug ah, oo ay ku hareeraysan yihiin iftiinka dahabiga ah ee ballanqaad aan weli la fulin. Geela waxay ku socdeen tallaabooyin laxan leh, raad kasta oo ay ka tagaanna waxaa baabi’inayay dabaysha dhacaysa.',
                'Markay habeenkii noqotay, waxay ogaadeen ceel dhagax ah oo qarsoon oo ku yaal meel cidla ah. Markay fariisteen qarkiisa, waxay fureen buug. Gudaha dhexdiisa, boggaggu waxay ahaayeen kuwo madhan, oo sugaya sheeko ka gudbi doonta waqtiga laftiisa.'
              ]
            },
            {
              title: `Cutubka 2: Diiwaanka Sanctuary-ga`,
              content: [
                'Markay si dhow u eegeneen biyaha nadiifka ah ee ceelka, milicsiga xiddigaha fog waxay bilaabeen inay isku habeeyaan khariidad ahaan. Waxay tilmaamaysay dhowr jihooyin oo waayo-aragnimo iyo saaxiibtinimo ah.',
                'Iyadoo neef qoto dheer qaadanaysa, socotadii waxay u hantiday nafteeda tacaburka, iyagoo qoraya ereyadii ugu horreeyay ee warqadda engegan, iyagoo xiraya dhaxal sii jiri doona weligiis.'
              ]
            }
          ]
        });
      } else {
        res.json({
          title: `The Echo of ${prompt.charAt(0).toUpperCase() + prompt.slice(1, 15)}`,
          author: `${author} & Omar Sanctuary`,
          category: selectedCategory,
          summary: `A legendary tale inspired by: "${prompt}". Compiled in the local offline archives of the sanctuary.`,
          chapters: [
            {
              title: `Chapter 1: The Spark of Remembrance`,
              content: [
                `There was once a quiet memory that floated across the desert sands, seeking a heart that remembered its ancient origin. Inspired by the whisper: "${prompt}", an explorer set out at dawn.`,
                'The sky was the shade of a bruised plum, lined with the golden light of a promise yet to be fulfilled. Their camel walked in rhythmic strides, each footprint immediately consumed by the blowing wind.',
                'By nightfall, they discovered a hidden stone well in the middle of nowhere. Sitting on the rim, they opened a book. Inside, the pages were entirely blank, waiting for a story that would transcend time itself.'
              ]
            },
            {
              title: `Chapter 2: The Sanctum Chronicles`,
              content: [
                'As they looked closer into the pristine water of the well, reflections of distant stars began to rearrange themselves into a map. It pointed not to physical directions, but to folds of experience and friendship.',
                'With a deep breath and a smile, the traveler committed their soul to the adventure, writing the very first words on the dry paper in their hands, sealing a legacy that would remain immortal.'
              ]
            }
          ]
        });
      }
    }, 1200);
    return;
  }

  try {
    const promptString = isSomali
      ? `Scribe a beautiful, highly detailed story in Somali language (Af-Soomaali) inside the ${selectedCategory} genre inspired by this creative spark: "${prompt}". The author of this story is "${author}". Provide exactly 2 chapters. Write everything (title, summary, chapters) completely in Somali.`
      : `Write a beautiful, detailed story inside the ${selectedCategory} genre inspired by this creative spark: "${prompt}". The author of this story is "${author}". Provide 2 highly cohesive chapters.`;

    const systemInstruction = isSomali
      ? 'You are an elite, poetic historical and drama novelist for "Omar Stories" (Sheekooyinka Cumar), a sanctuary of elegant narratives. You write everything 100% in grammatically perfect, beautiful and poetic Somali language (Af-Soomaali). Write rich atmospheric prose with high-contrast sensory details (scents, colors, wind, stars).'
      : 'You are an elite, poetic historical and drama novelist for "Omar Stories", a sanctuary of elegant narratives. You write atmospheric, slow-burning prose with high-contrast sensory details (scents, colors, wind, stars). Produce high-fidelity and grammatically pristine outputs.';

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: promptString,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: 'A poetic, elegant title representing the masterpiece.',
            },
            author: {
              type: Type.STRING,
              description: 'The author name. Usually a blend of the user and a pen name.',
            },
            category: {
              type: Type.STRING,
              description: 'The story category.',
            },
            summary: {
              type: Type.STRING,
              description: 'An engaging 1-2 sentence dramatic core summary.',
            },
            chapters: {
              type: Type.ARRAY,
              description: 'Exactly 2 highly detailed chapters.',
              items: {
                type: Type.OBJECT,
                properties: {
                  title: {
                    type: Type.STRING,
                    description: 'Chapter title, e.g. "Chapter 1: The Whispers"',
                  },
                  content: {
                    type: Type.ARRAY,
                    description: 'At least 3 long, rich paragraphs of narrative prose.',
                    items: {
                      type: Type.STRING,
                    },
                  },
                },
                required: ['title', 'content'],
              },
            },
          },
          required: ['title', 'author', 'category', 'summary', 'chapters'],
        },
      },
    });

    const storyText = response.text;
    if (!storyText) {
      throw new Error('No narrative material returned from GenAI.');
    }

    const generatedStory = JSON.parse(storyText);
    res.json(generatedStory);
  } catch (error: any) {
    console.error('Gemini Story Generation Error:', error);
    res.status(500).json({
      error: 'The story-weaving energies are unsettled. Please try phrasing your prompt differently.',
      details: error.message,
    });
  }
});

// Setup Vite Dev server vs Production STATIC Serving
async function bootServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Omar Stories sanctuary is running on http://localhost:${PORT}`);
  });
}

bootServer();
