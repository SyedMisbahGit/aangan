// Usage: node scripts/seed-ai-whispers.js
// Requires SUPABASE_URL and SUPABASE_SERVICE_KEY in environment variables

import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_KEY in your environment.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const EMOTIONS = ['joy', 'nostalgia', 'calm', 'anxiety', 'hope', 'love'];
const ZONES = [
  'Central Campus',
  'Academic',
  'Spiritual',
  'Research',
  'Quad',
  'Library',
  'Tapri',
  'DDE Building',
  'Baba Surgal Dev Mandir',
  'ISRO Area'
];

const AI_PERSONAS = [
  {
    name: 'Aarav',
    arc: 'hope',
    lines: [
      "I hope you're okay by then.",
      "The campus feels different at dawn.",
      "Sometimes hope is a quiet thing.",
      "This summer, I'm learning to wait."
    ]
  },
  {
    name: 'Meher',
    arc: 'self-reflection',
    lines: [
      "Did anything finally bloom?",
      "I keep writing to my future self.",
      "Please don't judge me too harshly for this summer.",
      "I'm not sure what I'm becoming."
    ]
  },
  {
    name: 'Kabir',
    arc: 'anxiety',
    lines: [
      "The night is loud inside my head.",
      "I wonder if anyone else feels this way.",
      "I left a whisper in the quad at 2am.",
      "#summer25 is heavier than I thought."
    ]
  },
  {
    name: 'Riya',
    arc: 'joy',
    lines: [
      "I danced alone in the rain today.",
      "Joy is a rebellion.",
      "I hope you find a reason to smile.",
      "The library is my happy place."
    ]
  },
  {
    name: 'Dev',
    arc: 'despair',
    lines: [
      "Some days are just gray.",
      "I'm still here, even if it's quiet.",
      "Maybe tomorrow will be lighter.",
      "I wrote this so I wouldn't forget."
    ]
  }
];

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomTimestamp() {
  // Simulate late-night or early-morning (between 11pm and 7am)
  const now = new Date();
  const dayOffset = Math.floor(Math.random() * 7); // up to 7 days ago
  const hour = Math.random() < 0.5 ? 23 + Math.floor(Math.random() * 2) : Math.floor(Math.random() * 7); // 23, 0, 1, 2, 3, 4, 5, 6
  const minute = Math.floor(Math.random() * 60);
  const ts = new Date(now);
  ts.setDate(now.getDate() - dayOffset);
  ts.setHours(hour, minute, 0, 0);
  return ts.toISOString();
}

async function seed() {
  for (const persona of AI_PERSONAS) {
    // Seed whispers
    const whisperCount = 3 + Math.floor(Math.random() * 3); // 3-5 whispers
    for (let i = 0; i < whisperCount; i++) {
      const content = randomFrom(persona.lines);
      const emotion = persona.arc;
      const zone = randomFrom(ZONES);
      const created_at = randomTimestamp();
      const whisper = {
        id: uuidv4(),
        content,
        emotion,
        zone,
        created_at,
        updated_at: created_at
      };
      const { error } = await supabase.from('whispers').insert([whisper]);
      if (error) {
        console.error(`Failed to insert whisper for ${persona.name}:`, error.message);
      } else {
        console.log(`Inserted whisper for ${persona.name} (${emotion}, ${zone})`);
      }
    }

    // Seed diary entries (1-2 per persona)
    const diaryCount = 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < diaryCount; i++) {
      const content = randomFrom(persona.lines) + ' #summer25';
      const tags = '#summer25';
      const created_at = randomTimestamp();
      const diary = {
        id: uuidv4(),
        content,
        tags,
        created_at,
        updated_at: created_at
      };
      const { error } = await supabase.from('diary_entries').insert([diary]);
      if (error) {
        console.error(`Failed to insert diary entry for ${persona.name}:`, error.message);
      } else {
        console.log(`Inserted diary entry for ${persona.name}`);
      }
    }

    // Seed capsule (1 per persona)
    const capsulePrompt = 'Write a whisper to your future self on July 14.';
    const capsuleContent = randomFrom([
      "I hope you're okay by then.",
      "Please don't judge me too harshly for this summer.",
      "Did anything finally bloom?",
      randomFrom(persona.lines)
    ]);
    const open_date = new Date('2024-07-14T00:00:00.000Z').toISOString();
    const capsule = {
      id: uuidv4(),
      content: capsuleContent,
      prompt: capsulePrompt,
      open_date,
      created_at: randomTimestamp(),
      updated_at: randomTimestamp()
    };
    const { error: capsuleError } = await supabase.from('capsules').insert([capsule]);
    if (capsuleError) {
      console.error(`Failed to insert capsule for ${persona.name}:`, capsuleError.message);
    } else {
      console.log(`Inserted capsule for ${persona.name}`);
    }

    // Seed mirror mode entry (1 per persona)
    const mirrorContent = `Mirror mode: ${randomFrom(persona.lines)}`;
    const mirror = {
      id: uuidv4(),
      content: mirrorContent,
      emotion: persona.arc,
      created_at: randomTimestamp(),
      updated_at: randomTimestamp()
    };
    const { error: mirrorError } = await supabase.from('mirror_mode_entries').insert([mirror]);
    if (mirrorError) {
      console.error(`Failed to insert mirror mode entry for ${persona.name}:`, mirrorError.message);
    } else {
      console.log(`Inserted mirror mode entry for ${persona.name}`);
    }
  }
  console.log('AI seeding complete!');
  process.exit(0);
}

seed(); 