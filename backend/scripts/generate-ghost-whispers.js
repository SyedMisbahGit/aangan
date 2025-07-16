// Script: generate-ghost-whispers.js
// Improved: Distributes ghosts across the day, avoids overlap, uses structured prompts, enhanced logging

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

// Structured prompt definitions
const promptTemplates = [
  { zone: 'tapri', emotion: 'calm', promptTemplate: 'Over chai and conversation, the courtyard is quiet, but my heart is softer still.' },
  { zone: 'tapri', emotion: 'joy', promptTemplate: 'Over chai and conversation, laughter echoes between the walls today.' },
  { zone: 'tapri', emotion: 'nostalgia', promptTemplate: 'Over chai and conversation, old memories linger in the corners.' },
  { zone: 'tapri', emotion: 'hope', promptTemplate: 'Over chai and conversation, tomorrow holds possibilities I can’t even imagine yet.' },
  { zone: 'tapri', emotion: 'anxiety', promptTemplate: 'Over chai and conversation, my thoughts race, but the world moves slow.' },
  { zone: 'tapri', emotion: 'love', promptTemplate: 'Over chai and conversation, the connections we make here last a lifetime.' },
  // ...repeat for each zone/emotion combo, or use a function to generate
];

// Fallback: if no specific template, use this
function getPrompt(zone, emotion) {
  const found = promptTemplates.find(t => t.zone === zone && t.emotion === emotion);
  if (found) return found.promptTemplate;
  // Fallback to generic
  const generic = {
    calm: 'You feel a gentle calm in the air.',
    joy: 'Joy bubbles up in unexpected places.',
    nostalgia: 'Memories drift by like clouds.',
    hope: 'Hope glimmers quietly today.',
    anxiety: 'A nervous energy lingers.',
    love: 'Love is present, even if unspoken.'
  };
  return (zone ? `${zone}: ` : '') + (generic[emotion] || generic.calm);
}

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

function randomTimeToday() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 0, 0); // 6am
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 0, 0); // 11pm
  const rand = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  return new Date(rand);
}

async function hasRealWhisperNearby(zone, targetTime) {
  // Check for any real (non-AI) whisper in this zone within ±30 min of targetTime
  const before = new Date(targetTime.getTime() - 30 * 60 * 1000).toISOString();
  const after = new Date(targetTime.getTime() + 30 * 60 * 1000).toISOString();
  const found = await db('whispers')
    .where('zone', zone)
    .andWhere('is_ai_generated', false)
    .andWhere('created_at', '>=', before)
    .andWhere('created_at', '<=', after)
    .first();
  return !!found;
}

async function generateGhostWhisper(zone) {
  const emotion = randomFrom(EMOTIONS);
  const content = getPrompt(zone, emotion);
  const id = uuidv4();
  const language = 'en';
  const scheduledTime = randomTimeToday();
  // Check for overlap with real whispers
  const overlap = await hasRealWhisperNearby(zone, scheduledTime);
  if (overlap) {
    console.log(`[SKIP] Zone ${zone} at ${scheduledTime.toISOString()}: real whisper exists nearby.`);
    return false;
  }
  await db('whispers').insert({
    id,
    content,
    emotion,
    zone,
    is_ai_generated: true,
    created_at: scheduledTime.toISOString(),
    language,
  });
  console.log(`[GHOST] Zone: ${zone}, Emotion: ${emotion}, Time: ${scheduledTime.toISOString()}, Content: "${content}"`);
  return true;
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
    let created = 0;
    let attempts = 0;
    while (created < toCreate && attempts < 5) {
      const ok = await generateGhostWhisper(zone);
      if (ok) created++;
      attempts++;
      await new Promise(res => setTimeout(res, 500 + Math.random() * 1000));
    }
    if (created < toCreate) {
      console.log(`Zone ${zone}: only created ${created} ghost whispers (target ${toCreate}) due to overlap.`);
    }
  }
  process.exit(0);
}

main().catch(err => {
  console.error('Error generating ghost whispers:', err);
  process.exit(1);
}); 