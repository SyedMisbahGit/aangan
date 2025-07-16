// Script: generate-ghost-whispers.js
// Auto-generates 1–2 AI-like whispers per day per zone

const db = require('../db');
const { v4: uuidv4 } = require('uuid');

const ZONES = [
  'tapri',
  'library',
  'hostel',
  'canteen',
  'auditorium',
  'quad',
];

const EMOTIONS = ['calm', 'joy', 'nostalgia', 'hope', 'anxiety', 'love'];

const whisperTemplates = {
  calm: [
    'The courtyard is quiet, but my heart is softer still.',
    'A gentle hush settles over the morning.',
    'Peace drifts in like sunlight through leaves.',
    'I am learning to breathe with the world.',
    'Stillness is a kind of music.'
  ],
  joy: [
    'Laughter echoes between the walls today.',
    'Sunlight dances on the benches.',
    'A secret smile I carry with me.',
    'Joy is a small rebellion against the ordinary.',
    'Today, even the birds seem to sing for me.'
  ],
  nostalgia: [
    'Old memories linger in the corners.',
    'I walk paths I once knew by heart.',
    'The past feels close enough to touch.',
    'A familiar scent brings me home.',
    'Some days, I miss who I used to be.'
  ],
  hope: [
    'Tomorrow holds possibilities I can’t even imagine yet.',
    'Every challenge is just a stepping stone to something better.',
    'The light at the end of the tunnel is getting brighter.',
    'I believe in the person I’m becoming.',
    'Small victories add up to big changes.'
  ],
  anxiety: [
    'My thoughts race, but the world moves slow.',
    'Uncertainty sits beside me today.',
    'I wonder if anyone else feels this way.',
    'The future is a fog I’m learning to walk through.',
    'Some days, breathing is an act of courage.'
  ],
  love: [
    'The connections we make here last a lifetime.',
    'Love comes in many forms – friendship, passion, self-discovery.',
    'This place has taught me what it means to care deeply.',
    'The heart finds its way, even in the most unexpected places.',
    'Love grows in the spaces between words and glances.'
  ]
};

const zoneModifiers = {
  tapri: 'Over chai and conversation, ',
  library: 'Between the pages and silence, ',
  hostel: 'In the comfort of shared spaces, ',
  canteen: 'Amidst the clatter of plates and laughter, ',
  auditorium: 'Under the weight of dreams and aspirations, ',
  quad: 'In the open air of possibility, '
};

function getTodayDateString() {
  const now = new Date();
  return now.toISOString().slice(0, 10); // YYYY-MM-DD
}

async function ghostWhispersForZone(zone) {
  const today = getTodayDateString();
  // Count AI whispers for this zone today
  const count = await db('whispers')
    .where('zone', zone)
    .andWhere('is_ai_generated', true)
    .andWhereRaw("DATE(created_at) = ?", [today])
    .count('id as count');
  return count[0].count;
}

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function generateGhostWhisper(zone) {
  const emotion = randomFrom(EMOTIONS);
  const templates = whisperTemplates[emotion] || whisperTemplates.calm;
  const baseContent = randomFrom(templates);
  const modifier = zoneModifiers[zone] || '';
  const content = modifier + baseContent.toLowerCase();
  const id = uuidv4();
  await db('whispers').insert({
    id,
    content,
    emotion,
    zone,
    is_ai_generated: true,
    created_at: new Date().toISOString(),
  });
  console.log(`Ghost whisper created for zone ${zone}: ${content}`);
}

async function main() {
  for (const zone of ZONES) {
    const existing = await ghostWhispersForZone(zone);
    const needed = 1 + Math.floor(Math.random() * 2); // 1 or 2
    if (existing >= needed) {
      console.log(`Zone ${zone}: already has ${existing} ghost whispers today.`);
      continue;
    }
    const toCreate = needed - existing;
    for (let i = 0; i < toCreate; i++) {
      // Optionally, stagger creation with a delay
      await generateGhostWhisper(zone);
      await new Promise(res => setTimeout(res, 1000 + Math.random() * 2000));
    }
  }
  process.exit(0);
}

main().catch(err => {
  console.error('Error generating ghost whispers:', err);
  process.exit(1);
}); 