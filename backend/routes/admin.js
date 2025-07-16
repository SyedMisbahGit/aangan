import express from "express";
import { db } from "../db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

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

export default router; 