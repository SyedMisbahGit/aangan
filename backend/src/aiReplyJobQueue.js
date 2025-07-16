// AI Reply Job Queue and Worker for College Whisper
// Handles background-safe scheduling and processing of AI reply jobs

import { db } from './db.js';
import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';

const JOB_TABLE = 'ai_reply_jobs';
const POLL_INTERVAL_MS = 30 * 1000; // Poll every 30s

// Ensure job table exists (idempotent)
async function ensureJobTable() {
  const exists = await db.schema.hasTable(JOB_TABLE);
  if (!exists) {
    await db.schema.createTable(JOB_TABLE, tbl => {
      tbl.increments('id').primary();
      tbl.string('whisper_id', 64).notNullable();
      tbl.string('zone', 64).notNullable();
      tbl.string('emotion', 32).notNullable();
      tbl.bigInteger('run_at').notNullable(); // ms since epoch
      tbl.string('status', 16).defaultTo('pending'); // pending, running, done, error
      tbl.text('error');
      tbl.timestamp('created_at').defaultTo(db.fn.now());
      tbl.timestamp('updated_at').defaultTo(db.fn.now());
    });
    console.log(`[AIJobQueue] Created table ${JOB_TABLE}`);
  }
}

// Helper to log AI job events
async function logAIJob(whisper_id, job_type, status, error = null) {
  await db('whisper_ai_logs').insert({
    whisper_id,
    job_type,
    status,
    error,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
}

// Enqueue a new AI reply job
async function enqueueJob({ whisperId, zone, emotion, delayMs }) {
  const runAt = Date.now() + delayMs;
  await ensureJobTable();
  // Fetch original whisper for content, tone, type
  const whisper = await db('whispers').where({ id: whisperId }).first();
  // Set ai_reply_status to 'queued'
  await db('whispers').where({ id: whisperId }).update({ ai_reply_status: 'queued' });
  await db(JOB_TABLE).insert({
    whisper_id: whisperId,
    zone,
    emotion,
    run_at: runAt,
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    content: whisper?.content,
    emotional_tone: whisper?.emotional_tone,
    whisper_type: whisper?.whisper_type
  });
  await logAIJob(whisperId, 'reply', 'queued');
  console.log(`[AIJobQueue] Enqueued job for whisper ${whisperId} in zone ${zone} (delay ${Math.round(delayMs/1000)}s)`);
}

// Poll and process due jobs
async function processDueJobs() {
  await ensureJobTable();
  const now = Date.now();
  const jobs = await db(JOB_TABLE)
    .where('status', 'pending')
    .andWhere('run_at', '<=', now)
    .limit(5);
  for (const job of jobs) {
    try {
      await db(JOB_TABLE).where({ id: job.id }).update({ status: 'running', updated_at: new Date().toISOString() });
      await db('whispers').where({ id: job.whisper_id }).update({ ai_reply_status: 'processing' });
      await logAIJob(job.whisper_id, 'reply', 'processing');
      console.log(`[AIJobQueue] Job ${job.id} running: whisperId=${job.whisper_id}, zone=${job.zone}, emotion=${job.emotion}, delay=${Math.round((now-job.run_at)/1000)}s, retry_count=${job.retry_count}`);
      // Call AI whisper generation endpoint
      const reqBody = { zone: job.zone, emotion: job.emotion, context: 'reply', guest_id: null, content: job.content, emotional_tone: job.emotional_tone, whisper_type: job.whisper_type };
      console.log(`[AIJobQueue] Request body:`, JSON.stringify(reqBody));
      const aiRes = await fetch(`${process.env.API_BASE_URL || 'http://localhost:3001'}/api/ai/generate-whisper`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reqBody)
      });
      if (aiRes.ok) {
        const aiWhisper = await aiRes.json();
        await db(JOB_TABLE).where({ id: job.id }).update({ status: 'done', updated_at: new Date().toISOString() });
        await db('whispers').where({ id: job.whisper_id }).update({ ai_reply_status: 'done' });
        await logAIJob(job.whisper_id, 'reply', 'done');
        console.log(`[AIJobQueue] AI reply generated for whisper ${job.whisper_id} in zone ${job.zone}. Output:`, aiWhisper.content || aiWhisper);
      } else {
        const errText = await aiRes.text();
        const newRetry = (job.retry_count || 0) + 1;
        if (newRetry < 3) {
          // Requeue with a delay (e.g., 1 min)
          const nextRun = Date.now() + 60 * 1000;
          await db(JOB_TABLE).where({ id: job.id }).update({
            status: 'pending',
            run_at: nextRun,
            retry_count: newRetry,
            error: errText,
            updated_at: new Date().toISOString()
          });
          console.warn(`[AIJobQueue] Retry ${newRetry} for job ${job.id} (whisperId=${job.whisper_id}): ${errText}`);
        } else {
          await db(JOB_TABLE).where({ id: job.id }).update({ status: 'error', error: errText, updated_at: new Date().toISOString(), retry_count: newRetry });
          await db('whispers').where({ id: job.whisper_id }).update({ ai_reply_status: 'failed' });
          await logAIJob(job.whisper_id, 'reply', 'failed', errText);
          console.error(`[AIJobQueue] Failed to generate AI reply for whisper ${job.whisper_id} after 3 retries: ${errText}`);
        }
      }
    } catch (err) {
      const newRetry = (job.retry_count || 0) + 1;
      if (newRetry < 3) {
        // Requeue with a delay (e.g., 1 min)
        const nextRun = Date.now() + 60 * 1000;
        await db(JOB_TABLE).where({ id: job.id }).update({
          status: 'pending',
          run_at: nextRun,
          retry_count: newRetry,
          error: err.message,
          updated_at: new Date().toISOString()
        });
        console.warn(`[AIJobQueue] Retry ${newRetry} for job ${job.id} (whisperId=${job.whisper_id}):`, err);
      } else {
        await db(JOB_TABLE).where({ id: job.id }).update({ status: 'error', error: err.message, updated_at: new Date().toISOString(), retry_count: newRetry });
        await db('whispers').where({ id: job.whisper_id }).update({ ai_reply_status: 'failed' });
        await logAIJob(job.whisper_id, 'reply', 'failed', err.message);
        console.error(`[AIJobQueue] Error processing job for whisper ${job.whisper_id} after 3 retries:`, err);
      }
    }
  }
}

// Start the worker loop
function startWorker() {
  setInterval(processDueJobs, POLL_INTERVAL_MS);
  console.log('[AIJobQueue] Worker started');
}

export default {
  enqueueJob,
  processDueJobs,
  startWorker,
}; 