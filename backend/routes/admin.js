import express from "express";
import { db } from "../src/db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import aiReplyJobQueue from '../src/aiReplyJobQueue.js';

const router = express.Router();

// --- RBAC Middleware ---
function requireRole(role) {
  return (req, res, next) => {
    const user = req.user;
    if (!user || !user.role) return res.status(401).json({ error: "Not authenticated" });
    const roles = ["moderator", "admin", "super_admin"];
    const userRoleIdx = roles.indexOf(user.role);
    const requiredRoleIdx = roles.indexOf(role);
    if (userRoleIdx === -1 || userRoleIdx < requiredRoleIdx) {
      return res.status(403).json({ error: "Insufficient role" });
    }
    next();
  };
}

// --- Logging Helper ---
async function logModerationAction(adminId, action, targetId, reason) {
  await db("moderation_logs").insert({
    admin_id: adminId,
    action,
    target_id: targetId,
    reason,
  });
}

// --- Admin Endpoints ---

// GET /admin/reports?status=open&zone=...&user=...&type=...
router.get("/reports", requireRole("moderator"), async (req, res) => {
  try {
    const { status, zone, user, type } = req.query;
    let query = db("whisper_reports").select("*")
      .leftJoin("whispers", "whisper_reports.whisper_id", "whispers.id");
    if (zone) query = query.where("whispers.zone", zone);
    if (user) query = query.where("whisper_reports.guest_id", user);
    // Add more filters as needed
    query = query.orderBy("whisper_reports.created_at", "desc");
    const reports = await query;
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

// PATCH /admin/reports/:id/resolve
router.patch("/reports/:id/resolve", requireRole("moderator"), async (req, res) => {
  try {
    const { id } = req.params;
    const { resolution, note } = req.body;
    await db("whisper_reports").where({ id }).update({ resolved: true, resolution, note });
    await logModerationAction(req.user.id, "resolve_report", id, note || resolution);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to resolve report" });
  }
});

// POST /admin/ban-user
router.post("/ban-user", requireRole("moderator"), async (req, res) => {
  try {
    const { guest_id, reason } = req.body;
    if (!guest_id) return res.status(400).json({ error: "guest_id required" });
    await db("banned_users").insert({ guest_id, reason });
    await db("ban_history").insert({ guest_id, action: "ban", admin_id: req.user.id, reason });
    await logModerationAction(req.user.id, "ban_user", guest_id, reason);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to ban user" });
  }
});

// POST /admin/unban-user
router.post("/unban-user", requireRole("moderator"), async (req, res) => {
  try {
    const { guest_id, reason } = req.body;
    if (!guest_id) return res.status(400).json({ error: "guest_id required" });
    await db("banned_users").where({ guest_id }).del();
    await db("ban_history").insert({ guest_id, action: "unban", admin_id: req.user.id, reason });
    await logModerationAction(req.user.id, "unban_user", guest_id, reason);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to unban user" });
  }
});

// GET /admin/users/:guestId/history
router.get("/users/:guestId/history", requireRole("moderator"), async (req, res) => {
  try {
    const { guestId } = req.params;
    const whispers = await db("whispers").where({ guest_id: guestId }).orderBy("created_at", "desc");
    const reports = await db("whisper_reports").where({ guest_id: guestId }).orderBy("created_at", "desc");
    const bans = await db("ban_history").where({ guest_id: guestId }).orderBy("created_at", "desc");
    res.json({ whispers, reports, bans });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user history" });
  }
});

// POST /admin/roles/assign
router.post("/roles/assign", requireRole("super_admin"), async (req, res) => {
  try {
    const { admin_id, role } = req.body;
    if (!admin_id || !role) return res.status(400).json({ error: "admin_id and role required" });
    await db("admin_users").where({ id: admin_id }).update({ role });
    await logModerationAction(req.user.id, "assign_role", admin_id, role);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to assign role" });
  }
});

// POST /admin/roles/revoke
router.post("/roles/revoke", requireRole("super_admin"), async (req, res) => {
  try {
    const { admin_id } = req.body;
    if (!admin_id) return res.status(400).json({ error: "admin_id required" });
    await db("admin_users").where({ id: admin_id }).update({ role: "moderator" });
    await logModerationAction(req.user.id, "revoke_role", admin_id, "moderator");
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to revoke role" });
  }
});

// GET /admin/moderation-logs
router.get("/moderation-logs", requireRole("admin"), async (req, res) => {
  try {
    const logs = await db("moderation_logs").orderBy("created_at", "desc").limit(200);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});

// GET /admins - List all admin users
router.get("/admins", requireRole("admin"), async (req, res) => {
  try {
    const admins = await db("admin_users").select("id", "username", "role", "email");
    res.json(admins);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch admins" });
  }
});

// --- AI Reply Job Admin Endpoints ---

// List all AI reply jobs
router.get('/ai-jobs', requireRole('super_admin'), async (req, res) => {
  try {
    const jobs = await db('ai_reply_jobs').orderBy('created_at', 'desc').limit(100);
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch AI jobs' });
  }
});

// List failed AI reply jobs
router.get('/ai-jobs/failed', requireRole('super_admin'), async (req, res) => {
  try {
    const jobs = await db('ai_reply_jobs').where('status', 'error').orderBy('created_at', 'desc').limit(100);
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch failed AI jobs' });
  }
});

// Retry a failed AI reply job
router.post('/ai-jobs/:id/retry', requireRole('super_admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const job = await db('ai_reply_jobs').where({ id }).first();
    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (job.status !== 'error') return res.status(400).json({ error: 'Job is not failed' });
    // Re-enqueue the job with a short delay
    await aiReplyJobQueue.enqueueJob({
      whisperId: job.whisper_id,
      zone: job.zone,
      emotion: job.emotion,
      delayMs: 10000 // 10 seconds
    });
    res.json({ success: true, message: 'Job re-enqueued' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retry AI job' });
  }
});

// 1. Fetch all logs for a specific whisper/job (with filters)
router.get('/ai-logs', requireRole('super_admin'), async (req, res) => {
  try {
    const { whisper_id, job_type, status, from, to } = req.query;
    let query = db('whisper_ai_logs');
    if (whisper_id) query = query.where('whisper_id', whisper_id);
    if (job_type) query = query.where('job_type', job_type);
    if (status) query = query.where('status', status);
    if (from) query = query.where('created_at', '>=', from);
    if (to) query = query.where('created_at', '<=', to);
    const logs = await query.orderBy('created_at', 'desc').limit(200);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch AI logs' });
  }
});

// 2. Return summary stats for AI jobs
router.get('/ai-jobs/stats', requireRole('super_admin'), async (req, res) => {
  try {
    const total = await db('ai_reply_jobs').count('id as c');
    const byStatus = await db('ai_reply_jobs').select('status').count('id as c').groupBy('status');
    const doneJobs = await db('ai_reply_jobs').where('status', 'done').orderBy('created_at', 'desc').limit(100);
    let avgTime = null, medianTime = null, failRate = null;
    if (doneJobs.length > 0) {
      const times = doneJobs.map(j => (j.updated_at - j.created_at) || 0).filter(t => t > 0);
      if (times.length) {
        avgTime = times.reduce((a, b) => a + b, 0) / times.length;
        const sorted = times.slice().sort((a, b) => a - b);
        medianTime = sorted[Math.floor(sorted.length / 2)];
      }
    }
    const failed = byStatus.find(s => s.status === 'error')?.c || 0;
    failRate = total[0]?.c ? (failed / total[0].c) : 0;
    res.json({ total: total[0]?.c, byStatus, avgTime, medianTime, failRate });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch AI job stats' });
  }
});

// 3. Search/filter jobs by whisper_id, zone, emotion, date range
router.get('/ai-jobs/search', requireRole('super_admin'), async (req, res) => {
  try {
    const { whisper_id, zone, emotion, from, to } = req.query;
    let query = db('ai_reply_jobs');
    if (whisper_id) query = query.where('whisper_id', whisper_id);
    if (zone) query = query.where('zone', zone);
    if (emotion) query = query.where('emotion', emotion);
    if (from) query = query.where('created_at', '>=', from);
    if (to) query = query.where('created_at', '<=', to);
    const jobs = await query.orderBy('created_at', 'desc').limit(200);
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search AI jobs' });
  }
});

// 4. Cancel a pending/running job
router.post('/ai-jobs/:id/cancel', requireRole('super_admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const job = await db('ai_reply_jobs').where({ id }).first();
    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (job.status !== 'pending' && job.status !== 'running') return res.status(400).json({ error: 'Job is not pending or running' });
    await db('ai_reply_jobs').where({ id }).update({ status: 'cancelled', updated_at: new Date().toISOString() });
    await db('whispers').where({ id: job.whisper_id }).update({ ai_reply_status: 'cancelled' });
    res.json({ success: true, message: 'Job cancelled' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel AI job' });
  }
});

// 5. Fetch all AI job attempts/logs for a given whisper_id
router.get('/ai-jobs/whisper/:whisper_id', requireRole('super_admin'), async (req, res) => {
  try {
    const { whisper_id } = req.params;
    const jobs = await db('ai_reply_jobs').where({ whisper_id }).orderBy('created_at', 'desc');
    const logs = await db('whisper_ai_logs').where({ whisper_id }).orderBy('created_at', 'desc');
    res.json({ jobs, logs });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch job history for whisper' });
  }
});

export default router; 