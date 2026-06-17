/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Story, Review } from './types';

export const CATEGORIES = [
  'Romance',
  'Adventure',
  'Islamic Stories',
  'Sci-Fi',
  'Wisdom',
  'Mystery',
  'History'
] as const;

export const INITIAL_STORIES: Story[] = [
  {
    id: '1',
    title: 'The Silent Dunes of Andalusia',
    author: 'Omar Al-Farsi',
    category: 'Romance',
    summary: 'A breathtaking journey through forgotten paths where ancient love and echoes of destiny meet among the rolling golden dunes.',
    readTime: '12 min',
    rating: 4.9,
    isGold: true,
    coverUrl: 'https://images.unsplash.com/photo-1547234935-80c7145ec969?q=80&w=600',
    coverGradient: 'linear-gradient(to bottom, #1e1b4b, #311042)',
    publishedDate: 'January 14, 2026',
    reviewsCount: 348,
    chapters: [
      {
        title: 'Chapter 1: The Caravan of Whispers',
        content: [
          'The sun was descending beneath the golden lips of the Andalusian wilderness, bathing the rolling plains in hues of burnt sienna and deep violet. Tariq pulled his indigo headscarf tighter against the rising wind—a wind that carried the saline breath of the Mediterranean and the heavy fragrance of wild lavender.',
          'For seven days, the caravan had moved in perfect silence, avoiding the major patrols. They were couriers of safe passage, guiding families seeking sanctuary across the shifting political frontiers. Tariq looked back at the long line of dromedaries. In the middle sat a young woman whose gaze remained fixed on the horizon, as if looking for a memory that had been swept away by the sands.',
          'Her name was Yasmin. Unlike the others seeking mere physical safety, Yasmin carried a small, leather-bound chest of papers—the last remaining poetry of the great Alhambra libraries. "In Andalusia," she whispered as Tariq rode alongside her, "we leave our structures, but we must never leave our words. If our verses survive, our nation never dies."'
        ]
      },
      {
        title: 'Chapter 2: Star-Crossed in the Sierra Nevada',
        content: [
          'High in the shadows of the Sierra Nevada mountains, they pitched camp under a canopy of stars so bright they seemed to hum. The heat of the day evaporated, replaced by a crystalline chill.',
          'Sitting by a low, smokeless fire, Yasmin opened her chest. Tariq watched the soft firelight trace the delicate lines of her face. "Why do you risk your life for paper, Yasmin?" he asked quietly.',
          'She smiled, her eyes reflecting the flame. "It is not paper, Tariq. It is proof that we once loved, dreamed, and understood the cosmos. Look at this." She turned a page of gold-leaf script. "This is an astrolabe chart coupled with verses by Ibn Zaydun. It says that no matter how far the heart wanders, it is governed by the same astronomy as the stars."',
          'That night, as the cold mountain breeze rustled the canvas of their tent, their hands met over the ancient parchment. In that brief touch, the centuries of war and displacement faded. There was only the warmth of a shared sanctuary—a love written in the stars, yet bounded by the fleeting sands.'
        ]
      },
      {
        title: 'Chapter 3: The Sanctuary Found',
        content: [
          'At dawn, they crossed the ridge to see the sparkling blue of the sea. Below lay the quiet harbor where a ship waited to bear them to the shores of North Africa.',
          'Tariq stood at the shoreline, the salty spray dampening his wool coat. Yasmin stepped onto the wooden gangway, then paused. She turned to Tariq, her hand extended, holding a single rolled parchment tied with a golden thread.',
          '"Keep this," she said. "When you look at the dunes, read it. Know that out of the silence, a verse will always find its friend. Our story does not end here; it is merely starting another chapter across the water."',
          'Tariq watched the vessel hoist its sails, catching the morning breeze. He unrolled the scroll. It was a poem of reunion, promising that love, once etched on the soul, remains as eternal and unmoving as the bedrock beneath the shifting sands.'
        ]
      }
    ]
  },
  {
    id: '2',
    title: 'Echoes of the Great Library',
    author: 'Sarah Jenkins',
    category: 'Adventure',
    summary: 'Deciphering the lost scrolls of a civilization that transcended time, locked away in the forgotten underwater vault of Alexandria.',
    readTime: '18 min',
    rating: 4.8,
    isGold: true,
    coverUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=600',
    coverGradient: 'linear-gradient(to bottom, #0f172a, #115e59)',
    publishedDate: 'February 2, 2026',
    reviewsCount: 219,
    chapters: [
      {
        title: 'Chapter 1: The Sunken Vault',
        content: [
          'The deep sea pressure groaned against the steel hulls of the submersible. Dr. Sarah Jenkins adjusted her headset, her eyes glued to the exterior floodlights piercing the abyssal blackness of the Alexandrian bay.',
          'For forty years, historians claimed the Royal Library was utterly turned to ash. But Sarah had spent her life chasing a different rumor—that a hidden archive, the Bibliotheca Impervia, was sealed in a watertight obsidian vault beneath the seabed before the fires ever reached the harbor.',
          'Suddenly, the sonar chimed—a loud, rhythmic pulse. The light fell on a monolithic stone doorway, untouched by the millennia. An intricate relief of an open book with a burning astrolabe was carved on its face. "We found it," Sarah breathed. "We found the sanctuary."'
        ]
      },
      {
        title: 'Chapter 2: The Decipherment of Light',
        content: [
          'Inside the pressurized chambers of the ancient vault, the air was dry and smelled of old ozone and salt-leached basalt. Cylindrical bronze canisters lined the shelves, containing scrolls preserved in beeswax wraps.',
          'Sarah carefully unscrewed the first canister. With microfiber gloves, she teased open a papyrus scroll that had not felt human touch since the reign of Cleopatra. What she saw was not Greek or Egyptian script, but mathematical coordinates overlaid with geometric drawings of the heavens.',
          '"This is not history," whispered her assistant, Marcus. "Look at these equations. They describe gravitational lensing... three thousand years before Einstein!" They realized the library was not just a collection of stories, but a blueprint of an advanced understanding of the universe, saved for a future mature enough to understand it.'
        ]
      }
    ]
  },
  {
    id: '3',
    title: 'The Architecture of Friendship',
    author: 'David Thorne',
    category: 'Islamic Stories',
    summary: 'An exploration of the invisible, spiritual threads that hold our most loyal memories together through life’s storms.',
    readTime: '15 min',
    rating: 5.0,
    isGold: true,
    coverUrl: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?q=80&w=600',
    coverGradient: 'linear-gradient(to bottom, #0c1c38, #1e3a8a)',
    publishedDate: 'March 10, 2026',
    reviewsCount: 512,
    chapters: [
      {
        title: 'Chapter 1: The Master Mason of Cordoba',
        content: [
          'Yusuf stared up at the vast arches of the Mosque-Cathedral of Cordoba. Red and white voussoirs spanned the vast forest of columns, catching the amber beams of the midday sun. Beside him stood his childhood companion, Karim.',
          'Yusuf was a architect of stone—practical, measuring life in spans of marble and structural loads. Karim was an artist of light, designing the intricate geometric stained glass that filtered the harsh Spanish sun into pools of spiritual cobalt and ruby.',
          '"A building is only as stable as its foundations, Karim," Yusuf said, checking a plumb line. "If a column is out by an inch, the vaults will fracture when the winter rains come."',
          'Karim smiled, pointing to the ceiling where the wooden ribbing curved gracefully. "But Yusuf, stone without light is just a tomb. It is the light that breathes life into your pillars. Our friendship is the same—you provide the ground, and I seek the sky."'
        ]
      },
      {
        title: 'Chapter 2: The Fire of Sevilla',
        content: [
          'Years later, during a period of heavy political upheaval, their architectural workshop in Sevilla was devastated by an accidental fire. Yusuf’s life’s work—hundreds of precise blueprints, mathematical models, and architectural drawings—was lost in a single night of ash and smoke.',
          'Yusuf sat on the blackened stone stairs of the ruins, hands buried in his face, completely defeated. "Everything I built, everything I measured, is gone. It was all fragile, Karim."',
          'Karim knelt in the soot, retrieving a piece of glass that had survived the heat, glowing with an intense golden color. "The physical drawings are gone, Yusuf, but our minds designed them together. The structural secret is in our memory. As long as we stand together, the sanctuary is never destroyed."'
        ]
      }
    ]
  },
  {
    id: '4',
    title: 'The Whisper of the Olive Tree',
    author: 'Ismael Qasim',
    category: 'Wisdom',
    summary: 'Under the heavy shade of an ancient olive tree, three generations of Palestinian farmers share secrets of resilience, faith, and patience.',
    readTime: '10 min',
    rating: 4.7,
    isGold: false,
    coverUrl: 'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?q=80&w=600',
    coverGradient: 'linear-gradient(to bottom, #111827, #1e293b)',
    publishedDate: 'April 20, 2026',
    reviewsCount: 124,
    chapters: [
      {
        title: 'Chapter 1: The Ancient Roots',
        content: [
          'In the hills overlooking Nablus stood Al-Khatyar—The Old One. It was an olive tree whose gnarled trunk was split into three thick columns, its silver-green leaves rustling like soft rain in the morning breeze.',
          'Grandfather Ibrahim sat on a stone terrace, his weathered fingers shelling raw almonds. Beside him, his ten-year-old granddaughter, Miriam, watched the branches sway. "Sido," she asked, "how old is this tree?"',
          'Ibrahim took her hand, placing it on the rough, deeply ridged bark. "This tree, Miriam, was planted by our ancestors before the Crusaders ever marched. It has seen droughts, frost, fires, and empires come and go. When you feel afraid or unsettled, put your ear to the bark. Listen to the roots. They hold the deep story of who we are."'
        ]
      }
    ]
  },
  {
    id: '5',
    title: 'The Astrolabe of Cordoba',
    author: 'Zayd Mansour',
    category: 'Sci-Fi',
    summary: 'A young astronomer in medieval Andalusia discovers a mystical astrolabe that maps paths of human destiny and folds of space-time.',
    readTime: '20 min',
    rating: 5.0,
    isGold: true,
    coverUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600',
    coverGradient: 'linear-gradient(to bottom, #020617, #1e1b4b)',
    publishedDate: 'November 12, 2025',
    reviewsCount: 412,
    chapters: [
      {
        title: 'Chapter 1: The Brass Device',
        content: [
          'The workshop of Master El-Zarqali smelled of whale oil, polishing compound, and melted copper. Zayd, his youngest apprentice, worked diligently on a heavy disk of brass, engraving the micro-meridian lines with an iron burin.',
          'But Zayd noticed something odd about this specific astrolabe commission. The plate representing the latitude of Cordoba had four extra concentric rings that did not align with any known stellar path or planetary orbit.',
          'When he rotated the rete—the web of brass pointers representing the stars—past the alignment of the Orion Nebula, the brass disk began to radiate a subtle, localized heat. The shadows in the corner of the room seemed to bend, casting impossible geometries on the plaster walls.'
        ]
      },
      {
        title: 'Chapter 2: The Portal of Starlight',
        content: [
          'That night, Zayd sneaked back into the workshop. He took the instrument to the flat roof of the madrasa, pointing it toward the apex of the night sky.',
          'Checking the rings, he aligned the brass pointers with the star Vega. He looked through the sighting vane. For a split second, the veil of the night sky split open. He did not see the stars as distant pinpricks of light, but as massive, roaring pinwheels of cosmic fire connected by shining gridlines of energy.',
          'An ancient voice echoed through the metal, sounding like the friction of grinding millstones. "The astrolabe is not for looking at where the stars are, child. It is for aligning where you should be."'
        ]
      }
    ]
  },
  {
    id: '6',
    title: 'A Caravan\'s Hope',
    author: 'Layla Nour',
    category: 'History',
    summary: 'An epic tale of a desert caravan navigating trade routes between Damascus and Medina, seeking hope and healing amidst sandy storms.',
    readTime: '14 min',
    rating: 4.6,
    isGold: false,
    coverUrl: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=600',
    coverGradient: 'linear-gradient(to bottom, #111827, #451a03)',
    publishedDate: 'May 5, 2026',
    reviewsCount: 89,
    chapters: [
      {
        title: 'Chapter 1: The Simoom',
        content: [
          'The air grew stifling, baking hot and dead calm. Lead guide Malik raised his closed fist, causing the string of sixty pack camels block-stepping behind him to slow to an synchronized halt.',
          '"The Simoom is coming," Malik shouted to his brother. The sky on the western rim was no longer blue; it had assumed a bruised, rust-colored tone that billowed upwards like dark smoke.',
          'They had only minutes to secure the merchandise—precious sacks of damask silk, frankincense modules, and medicinal oils from the Levant. Families huddled behind the prostrate camels as the wind struck with an absolute fury of flying flint and blistering heat.'
        ]
      }
    ]
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'r1',
    storyId: '1',
    username: 'khaled_reads',
    rating: 5,
    text: 'A profound masterpiece of storytelling! It perfectly captures the hauntingly beautiful spirit of Andalusia. The prose is pure poetry.',
    date: '2 hours ago'
  },
  {
    id: 'r2',
    storyId: '1',
    username: 'bookworm_mary',
    rating: 4,
    text: 'Loved the historical elements and the chemistry between Tariq and Yasmin. The descriptive writing felt very immersive!',
    date: '1 day ago'
  },
  {
    id: 'r3',
    storyId: '2',
    username: 'alex_archaeo',
    rating: 5,
    text: 'As an amateur diver and history geek, this hit all the right notes for me! The detail about the gravity equations was fantastic!',
    date: '3 days ago'
  },
  {
    id: 'r4',
    storyId: '3',
    username: 'fatima_m_98',
    rating: 5,
    text: 'Sublime and spiritually comforting. The friendship between Yusuf and Karim is of the highest, purest order. Highly recommended.',
    date: '1 week ago'
  }
];
