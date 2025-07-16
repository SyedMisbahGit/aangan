import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { readFileSync } from "fs";
import { createServer } from "http";
import { Server } from "socket.io";
import fetch from "node-fetch";
import { db } from "./db.js";
import dayjs from "dayjs";
import adminRoutes from "../routes/admin.js";
import aiReplyJobQueue from "./aiReplyJobQueue.js";

// Load environment variables
dotenv.config();

// Railway deployment - fresh start - timestamp: 2025-01-05T12:50:00Z

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Trust proxy for rate limiting with X-Forwarded-For headers
app.set('trust proxy', 1);
console.log('✅ Express trust proxy is set to 1 (for X-Forwarded-For headers)');

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      process.env.FRONTEND_URL || "http://localhost:5173",
      "http://localhost:8080",
      "http://localhost:8081",
      "http://localhost:8082",
      "http://localhost:8083",
      "http://localhost:8084",
      "http://localhost:8085",
      "http://localhost:8086",
      "http://localhost:8087",
      "http://localhost:8088",
    ],
    credentials: true,
  },
});

// Socket.IO authentication middleware (must come after io is defined)
io.use((socket, next) => {
  const key = socket.handshake.auth?.clientKey;
  if (key !== process.env.SOCKET_SHARED_KEY) {
    return next(new Error("unauthorized"));
  }
  return next();
});

// Per-IP rate limiting for socket messages
const msgBuckets = new Map(); // ip -> { count, ts }

const PORT = process.env.PORT || 3001;

// Debug: Log the actual PORT value
console.log(`🔧 PORT environment variable: ${process.env.PORT || 'not set'}`);
console.log(`🔧 Using port: ${PORT}`);

// Database setup
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || "changeme";

// Real-time connection tracking with improved stability
const activeConnections = new Map();
const zoneActivity = new Map();
const emotionPulse = new Map();
const connectionStats = {
  totalConnections: 0,
  activeConnections: 0,
  totalDisconnections: 0,
  lastCleanup: new Date(),
  memoryUsage: 0
};

// Memory leak prevention - cleanup old data
const cleanupOldData = () => {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  
  // Clean up old emotion pulses (older than 1 hour)
  for (const [emotion, pulse] of emotionPulse.entries()) {
    if (new Date(pulse.lastPulse) < oneHourAgo) {
      emotionPulse.delete(emotion);
    }
  }
  
  // Clean up old zone activity (older than 30 minutes)
  for (const [zone, activity] of zoneActivity.entries()) {
    if (new Date(activity.lastActivity) < new Date(now.getTime() - 30 * 60 * 1000)) {
      zoneActivity.delete(zone);
    }
  }
  
  connectionStats.lastCleanup = now;
  connectionStats.memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024; // MB
  
  console.log(`🧹 Cleanup completed. Memory usage: ${connectionStats.memoryUsage.toFixed(2)} MB`);
};

// Run cleanup every 15 minutes
setInterval(cleanupOldData, 15 * 60 * 1000);

// Cleanup expired whispers every 12 hours
setInterval(async () => {
  try {
    const result = await db.run("DELETE FROM whispers WHERE expires_at IS NOT NULL AND expires_at <= datetime('now')");
    if (result.changes > 0) {
      console.log(`🧹 Cleaned up ${result.changes} expired whispers`);
    }
  } catch (error) {
    console.error('Error cleaning up expired whispers:', error);
  }
}, 12 * 60 * 60 * 1000); // 12 hours

// Ambient Whisper System
let lastWhisperTime = new Date();
let ambientWhisperInterval = null;
let isAmbientSystemActive = false;

const startAmbientWhisperSystem = () => {
  if (isAmbientSystemActive) return;
  
  isAmbientSystemActive = true;
  console.log("🤖 Ambient whisper system activated");
  
  ambientWhisperInterval = setInterval(async () => {
    try {
      const now = new Date();
      const timeSinceLastWhisper = now.getTime() - lastWhisperTime.getTime();
      const fiveMinutes = 5 * 60 * 1000; // 5 minutes
      
      // Check if feed has been silent for 5+ minutes
      if (timeSinceLastWhisper >= fiveMinutes) {
        console.log("🔇 Feed silent for 5+ minutes, generating ambient whisper...");
        
        // Get current zone activity to determine which zones are active
        const activeZones = Array.from(zoneActivity.entries())
          .filter(([zone, activity]) => activity.users > 0)
          .map(([zone]) => zone);
        
        if (activeZones.length === 0) {
          // If no specific zones are active, use a default zone
          activeZones.push('tapri');
        }
        
        // Generate 1-2 ambient whispers
        const whisperCount = Math.random() < 0.5 ? 1 : 2;
        
        for (let i = 0; i < whisperCount; i++) {
          const zone = activeZones[Math.floor(Math.random() * activeZones.length)];
          const emotions = ['calm', 'nostalgia', 'hope', 'joy'];
          const emotion = emotions[Math.floor(Math.random() * emotions.length)];
          
          // Call the AI generation endpoint
          const response = await fetch(`${process.env.API_BASE_URL || 'http://localhost:3001'}/api/ai/generate-whisper`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              zone,
              emotion,
              context: 'ambient'
            })
          });
          
          if (response.ok) {
            const whisper = await response.json();
            console.log(`🤖 Ambient whisper generated: ${whisper.id} in ${zone}`);
            
            // Add a small delay between whispers
            if (i < whisperCount - 1) {
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
          }
        }
        
        // Update last whisper time to prevent immediate regeneration
        lastWhisperTime = new Date();
      }
    } catch (error) {
      console.error("❌ Error in ambient whisper system:", error);
    }
  }, 3 * 60 * 1000); // Check every 3 minutes
};

const stopAmbientWhisperSystem = () => {
  if (ambientWhisperInterval) {
    clearInterval(ambientWhisperInterval);
    ambientWhisperInterval = null;
  }
  isAmbientSystemActive = false;
  console.log("🤖 Ambient whisper system deactivated");
};

// Middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://aangan-production.up.railway.app"],
        fontSrc: ["'self'", "data:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    noSniff: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    frameguard: { action: 'deny' }, // X-Frame-Options: DENY
    crossOriginOpenerPolicy: { policy: 'same-origin' }, // COOP
  }),
);

app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:5173",
      "http://localhost:8080",
      "http://localhost:8081",
      "http://localhost:8082",
      "http://localhost:8083",
      "http://localhost:8084",
      "http://localhost:8085",
      "http://localhost:8086",
      "http://localhost:8087",
      "http://localhost:8088",
    ],
    credentials: true,
  }),
);

app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Input validation middleware
const validateInput = (req, res, next) => {
  // Sanitize string inputs
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str.trim().replace(/[<>]/g, ''); // Basic XSS prevention
  };

  // Sanitize request body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeString(req.body[key]);
      }
    });
  }

  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeString(req.query[key]);
      }
    });
  }

  next();
};

app.use(validateInput);

// Rate limiting with proper IP detection
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress || 'unknown';
  },
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/api/health' || req.path === '/api/health/heartbeat';
  }
});
app.use("/api/", limiter);

// Adjust whisper rate-limit: 5 per 10 min per IP
const whisperLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // limit each IP to 5 whispers per 10 min
  message: "Too many whispers, please wait a while.",
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress || 'unknown';
  }
});

// Comment rate-limit: 10 per minute per IP
const commentLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 comments per minute
  message: "Too many comments, please wait a while.",
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress || 'unknown';
  }
});

const reportLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // limit each IP to 5 reports per 10 min
  message: "Too many reports, please wait a while.",
  keyGenerator: (req) => req.ip || req.connection.remoteAddress || 'unknown',
});

// Helper: get admin user and last password change
async function getAdminUser(username) {
  return await db.get(
    "SELECT * FROM admin_users WHERE username = ?",
    [username]
  );
}

// Helper: get last password change timestamp for admin
async function getLastPasswordChange(username) {
  const user = await getAdminUser(username);
  return user && user.last_password_change ? new Date(user.last_password_change) : null;
}

// Authentication middleware (admin only) with complete mediation
const authenticateAdminJWT = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    // Check for token revocation (last password change)
    const lastPasswordChange = await getLastPasswordChange(payload.username);
    if (lastPasswordChange && payload.iat * 1000 < lastPasswordChange.getTime()) {
      return res.status(403).json({ error: "Token revoked due to password change" });
    }
    req.user = payload;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

// Routes

// Health check
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development"
  });
});

// Admin login route
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }
    // Get admin user from database
    const adminUser = await getAdminUser(username);
    if (!adminUser) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    // Compare password with stored hash
    const isValid = await bcrypt.compare(password, adminUser.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    // Generate short-lived JWT token (15m)
    const token = jwt.sign(
      {
        username: adminUser.username,
        role: "admin",
        id: adminUser.id,
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "15m" }
    );
    res.json({ token, user: { username: adminUser.username, role: "admin" } });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// Refresh endpoint
app.post("/api/auth/refresh", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: "Token required" });
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key", { ignoreExpiration: true });
    } catch (err) {
      return res.status(403).json({ error: "Invalid token" });
    }
    // Check for token revocation
    const lastPasswordChange = await getLastPasswordChange(payload.username);
    if (lastPasswordChange && payload.iat * 1000 < lastPasswordChange.getTime()) {
      return res.status(403).json({ error: "Token revoked due to password change" });
    }
    // Issue new short-lived JWT
    const newToken = jwt.sign(
      {
        username: payload.username,
        role: payload.role,
        id: payload.id,
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "15m" }
    );
    res.json({ token: newToken });
  } catch (error) {
    res.status(500).json({ error: "Failed to refresh token" });
  }
});

// Password change endpoint (for demonstration, not exposed in UI)
app.post("/api/admin/change-password", authenticateAdminJWT, async (req, res) => {
  try {
    const { username } = req.user;
    const { newPassword } = req.body;
    if (!newPassword) return res.status(400).json({ error: "New password required" });
    const hash = await bcrypt.hash(newPassword, 10);
    await db.run("UPDATE admin_users SET password_hash = ?, last_password_change = ? WHERE username = ?", [hash, new Date().toISOString(), username]);
    res.json({ success: true, message: "Password changed and all tokens revoked." });
  } catch (error) {
    res.status(500).json({ error: "Failed to change password" });
  }
});

// Heartbeat endpoint
app.post("/api/health/heartbeat", async (req, res) => {
  try {
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "Heartbeat failed" });
  }
});

// Whisper routes
app.get("/api/whispers", async (req, res) => {
  try {
    const { zone, emotion, guestId, limit = 50, offset = 0 } = req.query;
    let query = db("whispers").where(function() {
      this.whereNull("expires_at").orWhere("expires_at", ">", db.fn.now());
    });
    if (zone) query = query.andWhere("zone", zone);
    if (emotion) query = query.andWhere("emotion", emotion);
    if (guestId) query = query.andWhere("guest_id", guestId);
    const whispers = await query.orderBy("created_at", "desc").limit(limit).offset(offset);
    const formattedWhispers = whispers.map((whisper) => ({
      ...whisper,
      timestamp: formatTimestamp(whisper.created_at),
    }));
    res.json(formattedWhispers);
  } catch (error) {
    console.error("Error fetching whispers:", error);
    res.status(500).json({ error: "Failed to fetch whispers" });
  }
});

// --- Whisper Classifier Helper ---
function classifyWhisper(content) {
  // Emotional tone keywords
  const toneMap = [
    { tone: 'sadness', keywords: ['miss', 'alone', 'cry', 'waiting', 'empty', 'lost', 'silence', 'never comes', 'lonely'] },
    { tone: 'gratitude', keywords: ['thank', 'grateful', 'appreciate', 'gratitude'] },
    { tone: 'anxiety', keywords: ['worry', 'anxious', 'nervous', 'scared', 'afraid', 'panic'] },
    { tone: 'hope', keywords: ['hope', 'wish', 'someday', 'maybe', 'dream'] },
    { tone: 'joy', keywords: ['happy', 'joy', 'smile', 'laugh', 'excited', 'delight'] },
    { tone: 'love', keywords: ['love', 'heart', 'dear', 'beloved', 'crush'] },
    { tone: 'nostalgia', keywords: ['remember', 'memory', 'nostalgia', 'past', 'old days', 'used to'] },
    { tone: 'calm', keywords: ['calm', 'peace', 'quiet', 'serene', 'still', 'gentle'] },
  ];
  let emotional_tone = 'neutral';
  const lc = content.toLowerCase();
  for (const { tone, keywords } of toneMap) {
    if (keywords.some(k => lc.includes(k))) {
      emotional_tone = tone;
      break;
    }
  }
  // Whisper type
  let whisper_type = 'other';
  if (lc.endsWith('?') || lc.startsWith('why') || lc.startsWith('how') || lc.startsWith('what') || lc.startsWith('when')) {
    whisper_type = 'question';
  } else if (lc.includes('thank') || lc.includes('grateful') || lc.includes('appreciate')) {
    whisper_type = 'gratitude';
  } else if (lc.includes('vent') || lc.includes('frustrated') || lc.includes('angry') || lc.includes('upset')) {
    whisper_type = 'vent';
  } else if (lc.split(' ').length > 10 && (lc.match(/[.,;:!?]/g) || []).length > 2) {
    whisper_type = 'poetic';
  }
  return { emotional_tone, whisper_type };
}

// --- TEMPORARY: Whisper Classifier Test Endpoint ---
app.post("/api/classify-whisper", (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: "Content is required" });
  const result = classifyWhisper(content);
  res.json(result);
});

app.post("/api/whispers", whisperLimiter, async (req, res) => {
  try {
    const { content, emotion, zone, expiresAt, embedding, guest_id, is_ai_generated } = req.body;
    if (!content || !emotion || !zone) {
      return res.status(400).json({ error: "Content, emotion, and zone are required" });
    }
    // Content moderation
    const BAD_WORDS = ["chutiya", "bc", "mc", "madarchod", "bhosadike", "bhenchod"];
    const hasBadWord = BAD_WORDS.some(bad => content.toLowerCase().includes(bad.toLowerCase()));
    if (hasBadWord) return res.status(400).json({ error: "content-flagged" });
    const id = uuidv4();
    let expiryValue = null;
    if (expiresAt) {
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 24);
      expiryValue = expiryDate.toISOString();
    }
    // --- Classify whisper ---
    const { emotional_tone, whisper_type } = classifyWhisper(content);
    await db("whispers").insert({ id, content, emotion, zone, expires_at: expiryValue, guest_id, emotional_tone, whisper_type });
    // --- Soft Title Generator ---
    if (guest_id) {
      const count = await db("whispers").where({ guest_id }).count("id as c");
      const n = count[0]?.c || 0;
      if (n >= 3 && n % 3 === 0) {
        const recent = await db("whispers").where({ guest_id }).orderBy("created_at", "desc").limit(3);
        // Simple ruleset for demo
        const tones = recent.map(w => w.emotional_tone);
        let soft_title = null;
        if (tones.filter(t => t === 'sadness').length >= 2) soft_title = "Night Owl";
        else if (tones.filter(t => t === 'gratitude').length >= 2) soft_title = "Kind Mirror";
        else if (recent.some(w => w.whisper_type === 'question')) soft_title = "Quiet Seeker";
        else if (recent.some(w => w.zone === 'courtyard')) soft_title = "Garden Dweller";
        else if (recent.some(w => w.zone === 'corridor')) soft_title = "Corridor Thinker";
        else soft_title = "Gentle Soul";
        await db("whispers").where({ id }).update({ soft_title });
      }
    }
    // Embedding table (skip for SQLite)
    if (db.client.config.client === "pg" && process.env.OPENAI_KEY) {
      try {
        const openaiRes = await fetch("https://api.openai.com/v1/embeddings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENAI_KEY}`,
          },
          body: JSON.stringify({
            input: content,
            model: "text-embedding-ada-002"
          })
        });
        const openaiData = await openaiRes.json();
        if (openaiData.data && openaiData.data[0] && openaiData.data[0].embedding) {
          const embedding = openaiData.data[0].embedding;
          await db("whisper_embeddings").insert({ whisper_id: id, embedding });
          console.log("Embedding saved:", embedding.slice(0, 5), "...");
        } else {
          console.error("OpenAI embedding error:", openaiData);
        }
      } catch (err) {
        console.error("Failed to generate embedding:", err);
      }
    }
    const [whisper] = await db("whispers").where({ id });
    whisper.timestamp = formatTimestamp(whisper.created_at);
    io.emit('new-whisper', { ...whisper, timestamp: whisper.timestamp, realTime: true });
    io.to(`zone-${zone}`).emit('zone-whisper', { ...whisper, timestamp: whisper.timestamp, realTime: true });
    // Update emotion pulse
    const currentPulse = emotionPulse.get(emotion) || { count: 0, lastPulse: new Date() };
    currentPulse.count += 1;
    currentPulse.lastPulse = new Date();
    emotionPulse.set(emotion, currentPulse);
    io.emit('emotion-pulse-update', { emotion, pulse: currentPulse, totalPulses: Array.from(emotionPulse.values()).reduce((sum, pulse) => sum + pulse.count, 0) });
    lastWhisperTime = new Date();
    if (!isAmbientSystemActive) startAmbientWhisperSystem();

    // --- AI Reply Scheduling Logic (refactored to job queue) ---
    if (!is_ai_generated) {
      if (Math.random() < 0.5) {
        // Shorter delay for long or emotional whispers
        const emotionalEmotions = ['anxiety', 'love', 'nostalgia'];
        const isLong = content.length > 120;
        const isEmotional = emotionalEmotions.includes(emotion);
        let delayMs;
        if (isLong || isEmotional) {
          // 30–90 seconds
          delayMs = (30 + Math.random() * 60) * 1000;
        } else {
          // 2–15 minutes
          delayMs = (2 + Math.random() * 13) * 60 * 1000;
        }
        // Enqueue AI reply job instead of setTimeout
        const EMOTIONS = ['calm', 'joy', 'nostalgia', 'hope', 'anxiety', 'love'];
        const aiEmotion = EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)];
        aiReplyJobQueue.enqueueJob({
          whisperId: id,
          zone,
          emotion: aiEmotion,
          delayMs
        });
        console.log(`[AIReply] Enqueued AI reply job for whisper ${id} in zone ${zone} (delay ${Math.round(delayMs/1000)}s)`);
      }
    }
    // --- End AI Reply Scheduling ---

    res.status(201).json(whisper);
  } catch (error) {
    console.error("Error creating whisper:", error);
    res.status(500).json({ error: "Failed to create whisper" });
  }
});

app.post("/api/whispers/:id/report", reportLimiter, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, guest_id } = req.body;
    if (!reason || typeof reason !== 'string' || reason.length < 3) {
      return res.status(400).json({ error: "A valid reason is required." });
    }
    // Check whisper exists
    const whisper = await db("whispers").where({ id }).first();
    if (!whisper) return res.status(404).json({ error: "Whisper not found" });
    await db("whisper_reports").insert({ whisper_id: id, reason, guest_id });
    // Emit real-time report event for admin inbox
    io.emit('new-report', {
      whisper_id: id,
      reason,
      guest_id,
      created_at: new Date().toISOString()
    });
    res.json({ success: true, message: "Whisper reported." });
  } catch (error) {
    console.error("Error reporting whisper:", error);
    res.status(500).json({ error: "Failed to report whisper" });
  }
});

// --- AI Prompt Templates (shared) ---
const promptTemplates = [
  { zone: 'tapri', emotion: 'calm', promptTemplate: 'Over chai and conversation, the courtyard is quiet, but my heart is softer still.' },
  { zone: 'tapri', emotion: 'joy', promptTemplate: 'Over chai and conversation, laughter echoes between the walls today.' },
  { zone: 'tapri', emotion: 'nostalgia', promptTemplate: 'Over chai and conversation, old memories linger in the corners.' },
  { zone: 'tapri', emotion: 'hope', promptTemplate: 'Over chai and conversation, tomorrow holds possibilities I can\'t even imagine yet.' },
  { zone: 'tapri', emotion: 'anxiety', promptTemplate: 'Over chai and conversation, my thoughts race, but the world moves slow.' },
  { zone: 'tapri', emotion: 'love', promptTemplate: 'Over chai and conversation, the connections we make here last a lifetime.' },
  // ...repeat for each zone/emotion combo, or use a function to generate
];
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

// AI Whisper Generation Endpoint
app.post("/api/ai/generate-whisper", async (req, res) => {
  try {
    const { zone, emotion, context, guest_id, content, emotional_tone, whisper_type } = req.body;
    // Validate inputs
    if (!zone || !emotion) {
      return res.status(400).json({ error: "Zone and emotion are required" });
    }
    // Use new prompt structure
    let aiReply = `In this quiet moment, your feelings are heard.`;
    if (content) {
      aiReply = `Given this anonymous post from a user in a quiet emotional space, generate a gentle, poetic response that matches its tone. Avoid advice. Just emotionally sit with the whisper.\n\nWhisper: "${content}"\n\nRespond in under 30 words.`;
      // For demo, just echo a poetic line based on tone/type
      if (whisper_type === 'question') aiReply = "Sometimes, the night holds more questions than answers, but you are not alone in the wondering.";
      else if (emotional_tone === 'sadness') aiReply = "Your longing is felt in the hush of the night.";
      else if (emotional_tone === 'gratitude') aiReply = "Gratitude glimmers softly, even in silence.";
      else if (emotional_tone === 'anxiety') aiReply = "May gentle breaths find you in the quiet.";
      else if (emotional_tone === 'hope') aiReply = "Hope lingers, quietly, just beyond the silence.";
      else if (emotional_tone === 'joy') aiReply = "A small joy stirs, waiting to be noticed.";
      else if (emotional_tone === 'love') aiReply = "Love echoes softly, even when unspoken.";
      else if (emotional_tone === 'nostalgia') aiReply = "Memories drift gently, never truly gone.";
      else if (emotional_tone === 'calm') aiReply = "There is peace in simply being here.";
    }
    // Simulate AI reply (replace with real model call in production)
    const id = uuidv4();
    await db.run(
      "INSERT INTO whispers (id, content, emotion, zone, is_ai_generated, guest_id) VALUES (?, ?, ?, ?, ?, ?)",
      [id, aiReply, emotion, zone, 1, guest_id],
    );
    const whisper = await db.get("SELECT * FROM whispers WHERE id = ?", [id]);
    whisper.timestamp = formatTimestamp(whisper.created_at);
    io.emit('new-whisper', {
      ...whisper,
      timestamp: formatTimestamp(whisper.created_at),
      realTime: true,
      isAIGenerated: true,
      echoLabel: "echo from the courtyard"
    });
    io.to(`zone-${zone}`).emit('zone-whisper', {
      ...whisper,
      timestamp: formatTimestamp(whisper.created_at),
      realTime: true,
      isAIGenerated: true,
      echoLabel: "echo from the courtyard"
    });
    console.log(`🤖 AI whisper generated: ${id} in zone ${zone} with emotion ${emotion}`);
    res.status(201).json({
      ...whisper,
      isAIGenerated: true,
      echoLabel: "echo from the courtyard"
    });
  } catch (error) {
    console.error("Error generating AI whisper:", error);
    res.status(500).json({ error: "Failed to generate AI whisper" });
  }
});

// Whisper Reaction Endpoint
app.post("/api/reactions", async (req, res) => {
  try {
    const { id, reactionType, guestId } = req.body;
    if (!reactionType || !guestId) return res.status(400).json({ error: "Reaction type and guest ID are required" });
    const validReactions = ['❤️', '😢', '😮', '🙌'];
    if (!validReactions.includes(reactionType)) return res.status(400).json({ error: "Invalid reaction type" });
    const whisper = await db("whispers").where({ id }).first();
    if (!whisper) return res.status(404).json({ error: "Whisper not found" });
    const existingReaction = await db("whisper_reactions").where({ whisper_id: id, guest_id: guestId, reaction_type: reactionType }).first();
    if (existingReaction) {
      await db("whisper_reactions").where({ whisper_id: id, guest_id: guestId, reaction_type: reactionType }).del();
    } else {
      await db("whisper_reactions").insert({ whisper_id: id, guest_id: guestId, reaction_type: reactionType });
    }
    const reactions = await db("whisper_reactions").where({ whisper_id: id }).select("reaction_type").count("reaction_type as count").groupBy("reaction_type");
    const reactionCounts = { '❤️': 0, '😢': 0, '😮': 0, '🙌': 0 };
    reactions.forEach(reaction => { reactionCounts[reaction.reaction_type] = reaction.count; });
    io.emit('whisper-reaction-update', { whisperId: id, reactions: reactionCounts, guestId, reactionType, action: existingReaction ? 'removed' : 'added' });
    res.json({ whisperId: id, reactions: reactionCounts, guestId, reactionType, action: existingReaction ? 'removed' : 'added' });
  } catch (error) {
    console.error("Error handling whisper reaction:", error);
    res.status(500).json({ error: "Failed to handle reaction" });
  }
});

// Get whisper reactions
app.get("/api/whispers/:id/reactions", async (req, res) => {
  try {
    const { id } = req.params;
    const reactions = await db("whisper_reactions").where({ whisper_id: id }).select("reaction_type").count("reaction_type as count").groupBy("reaction_type");
    const reactionCounts = { '❤️': 0, '😢': 0, '😮': 0, '🙌': 0 };
    reactions.forEach(reaction => { reactionCounts[reaction.reaction_type] = reaction.count; });
    res.json({ whisperId: id, reactions: reactionCounts });
  } catch (error) {
    console.error("Error fetching whisper reactions:", error);
    res.status(500).json({ error: "Failed to fetch reactions" });
  }
});

// Comment endpoint with rate limiting
app.post("/api/comments", commentLimiter, async (req, res) => {
  try {
    const { whisperId, content, guestId } = req.body;
    if (!whisperId || !content || !guestId) return res.status(400).json({ error: "Whisper ID, content, and guest ID are required" });
    const whisper = await db("whispers").where({ id: whisperId }).first();
    if (!whisper) return res.status(404).json({ error: "Whisper not found" });
    const BAD_WORDS = ["chutiya", "bc", "mc", "madarchod", "bhosadike", "bhenchod"];
    const hasBadWord = BAD_WORDS.some(bad => content.toLowerCase().includes(bad.toLowerCase()));
    if (hasBadWord) return res.status(400).json({ error: "content-flagged" });
    const id = uuidv4();
    await db("whisper_comments").insert({ id, whisper_id: whisperId, content, guest_id: guestId });
    const [comment] = await db("whisper_comments").where({ id });
    comment.timestamp = formatTimestamp(comment.created_at);
    io.emit('new-comment', { ...comment, timestamp: comment.timestamp, realTime: true });
    res.status(201).json(comment);
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ error: "Failed to create comment" });
  }
});

// Stub endpoint for analytics page view (dev only)
app.post('/api/analytics/page-view', (req, res) => {
  res.status(200).json({ ok: true });
});

// Stub endpoint for FCM token registration (dev only)
app.post('/api/fcm-token', (req, res) => {
  res.status(200).json({ ok: true });
});

// Admin and Analytics Routes (Protected by Authentication)
// GET /api/analytics/whispers - Get whisper analytics
app.get('/api/analytics/whispers', authenticateAdminJWT, async (req, res) => {
  try {
    const whispers = await db("whispers").select('*').orderBy('created_at', 'desc').limit(100);
    const analytics = {
      total: whispers.length,
      byEmotion: {},
      byZone: {},
      recentActivity: whispers.slice(0, 10).map(w => ({
        id: w.id,
        content: w.content.substring(0, 50) + '...',
        emotion: w.emotion,
        zone: w.zone,
        created_at: w.created_at
      }))
    };
    
    whispers.forEach(whisper => {
      analytics.byEmotion[whisper.emotion] = (analytics.byEmotion[whisper.emotion] || 0) + 1;
      analytics.byZone[whisper.zone] = (analytics.byZone[whisper.zone] || 0) + 1;
    });
    
    res.json(analytics);
  } catch (error) {
    console.error("Error fetching whisper analytics:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

// GET /api/analytics/zones - Get zone analytics
app.get('/api/analytics/zones', authenticateAdminJWT, async (req, res) => {
  try {
    const zones = await db("whispers")
      .select('zone')
      .count('* as whisper_count')
      .groupBy('zone')
      .orderBy('whisper_count', 'desc');
    
    const zoneAnalytics = zones.map(zone => ({
      zone: zone.zone,
      whisper_count: zone.whisper_count,
      activity_level: zone.whisper_count > 50 ? 'high' : zone.whisper_count > 20 ? 'medium' : 'low'
    }));
    
    res.json(zoneAnalytics);
  } catch (error) {
    console.error("Error fetching zone analytics:", error);
    res.status(500).json({ error: "Failed to fetch zone analytics" });
  }
});

// POST /api/admin/broadcast - Send broadcast notification
app.post('/api/admin/broadcast', authenticateAdminJWT, async (req, res) => {
  try {
    const { title, body, url } = req.body;
    
    if (!title || !body) {
      return res.status(400).json({ error: "Title and body are required" });
    }
    
    // Log the broadcast attempt
    console.log(`📢 Admin broadcast: ${title} - ${body}`);
    
    // In a real implementation, this would send push notifications
    // For now, just acknowledge the request
    res.json({ 
      success: true, 
      message: "Broadcast queued for delivery",
      broadcast: { title, body, url, timestamp: new Date().toISOString() }
    });
  } catch (error) {
    console.error("Error sending broadcast:", error);
    res.status(500).json({ error: "Failed to send broadcast" });
  }
});

// GET /api/admin/fcm-tokens - Get registered FCM tokens
app.get('/api/admin/fcm-tokens', authenticateAdminJWT, async (req, res) => {
  try {
    // In a real implementation, this would fetch from database
    // For now, return mock data
    res.json({ 
      tokens: [],
      total: 0,
      message: "FCM tokens would be fetched from database"
    });
  } catch (error) {
    console.error("Error fetching FCM tokens:", error);
    res.status(500).json({ error: "Failed to fetch FCM tokens" });
  }
});

// GET /api/auth/verify - Verify admin token
app.get('/api/auth/verify', authenticateAdminJWT, (req, res) => {
  try {
    // Token is already verified by middleware
    res.json({ 
      valid: true, 
      user: { role: "admin" },
      message: "Token is valid"
    });
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// GET /api/features/toggles - Get feature toggles (public read)
app.get('/api/features/toggles', (req, res) => {
  try {
    // Return current feature toggles
    res.json({
      features: {
        aiWhisperGeneration: true,
        realtimeNotifications: true,
        emotionPulse: true,
        zoneActivity: true,
        ambientWhispers: true
      },
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch feature toggles" });
  }
});

// POST /api/features/toggles - Update feature toggles (admin only)
app.post('/api/features/toggles', authenticateAdminJWT, (req, res) => {
  try {
    const { feature, enabled } = req.body;
    
    if (!feature || typeof enabled !== 'boolean') {
      return res.status(400).json({ error: "Feature name and enabled status required" });
    }
    
    // In a real implementation, this would update database
    console.log(`🔧 Feature toggle updated: ${feature} = ${enabled}`);
    
    res.json({ 
      success: true, 
      feature, 
      enabled, 
      message: "Feature toggle updated",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error updating feature toggle:", error);
    res.status(500).json({ error: "Failed to update feature toggle" });
  }
});

// POST /api/auth/login - Admin login (already exists, but ensure it's secure)
// This route should remain public as it's the entry point for authentication

// Search related whispers endpoint
app.post("/api/search/related", async (req, res) => {
  try {
    const { id, text, topK = 5 } = req.body;
    let embedding;

    // 1. Get embedding for the query
    if (id) {
      // Fetch embedding from DB
      const row = await db("whisper_embeddings").where({ whisper_id: id }).first();
      if (!row) return res.status(404).json({ error: "Whisper embedding not found" });
      embedding = row.embedding;
    } else if (text && process.env.OPENAI_KEY) {
      // Generate embedding from text
      const openaiRes = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_KEY}`,
        },
        body: JSON.stringify({
          input: text,
          model: "text-embedding-ada-002"
        })
      });
      const openaiData = await openaiRes.json();
      if (openaiData.data && openaiData.data[0] && openaiData.data[0].embedding) {
        embedding = openaiData.data[0].embedding;
      } else {
        return res.status(500).json({ error: "Failed to generate embedding" });
      }
    } else {
      return res.status(400).json({ error: "Provide either id or text" });
    }

    // 2. Query Chroma for similar vectors
    // const results = await (await whispersCollection).query({
    //   queryEmbeddings: [embedding],
    //   nResults: topK,
    // });

    // 3. Fetch full whisper data for the results
    // const ids = results.ids[0];
    // const whispers = await db("whispers").whereIn("id", ids);

    // res.json({ matches: whispers });
    res.status(501).json({ error: "ChromaDB integration not implemented yet" }); // Placeholder
  } catch (err) {
    console.error("Error in /api/search/related:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Manual AI reply pull endpoint
app.post("/api/whispers/:id/check-ai-reply", async (req, res) => {
  try {
    const { id } = req.params;
    // Check if an AI reply already exists for this whisper (same zone, is_ai_generated, created after original)
    const original = await db("whispers").where({ id }).first();
    if (!original) return res.status(404).json({ error: "Whisper not found" });
    const aiReply = await db("whispers")
      .where({ zone: original.zone, is_ai_generated: true })
      .andWhere("created_at", ">", original.created_at)
      .orderBy("created_at", "asc")
      .first();
    // If AI reply exists and is within 1 hour, return it
    if (aiReply && new Date(aiReply.created_at) - new Date(original.created_at) < 60 * 60 * 1000) {
      return res.json({ aiReply });
    }
    // If not, check if a job is already queued for this whisper
    const job = await db('ai_reply_jobs').where({ whisper_id: id }).andWhere(function() {
      this.where('status', 'pending').orWhere('status', 'running');
    }).first();
    if (!job) {
      // Enqueue a job with a short delay (30s)
      const EMOTIONS = ['calm', 'joy', 'nostalgia', 'hope', 'anxiety', 'love'];
      const aiEmotion = EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)];
      await aiReplyJobQueue.enqueueJob({
        whisperId: id,
        zone: original.zone,
        emotion: aiEmotion,
        delayMs: 30 * 1000
      });
      console.log(`[AIReply] Manual pull: enqueued AI reply job for whisper ${id} in zone ${original.zone}`);
    } else {
      console.log(`[AIReply] Manual pull: job already queued for whisper ${id}`);
    }
    return res.json({ status: 'pending' });
  } catch (err) {
    console.error('Error in manual AI reply pull:', err);
    res.status(500).json({ error: 'Failed to check or trigger AI reply' });
  }
});

// --- Whisper Back (Replies) Endpoints ---

// Create a reply to a whisper
app.post("/api/whispers/:id/replies", async (req, res) => {
  try {
    const { id } = req.params;
    const { content, guest_id } = req.body;
    if (!content || !guest_id) {
      return res.status(400).json({ error: "Content and guest_id are required" });
    }
    // Check whisper exists
    const whisper = await db("whispers").where({ id }).first();
    if (!whisper) return res.status(404).json({ error: "Whisper not found" });
    // Insert reply
    const [replyId] = await db("whisper_replies").insert({ whisper_id: id, content, guest_id });
    const reply = await db("whisper_replies").where({ id: replyId }).first();
    res.status(201).json(reply);
  } catch (error) {
    console.error("Error creating whisper reply:", error);
    res.status(500).json({ error: "Failed to create reply" });
  }
});

// Fetch replies for a whisper (only for the original author)
app.get("/api/whispers/:id/replies", async (req, res) => {
  try {
    const { id } = req.params;
    const { guest_id } = req.query;
    if (!guest_id) return res.status(400).json({ error: "guest_id required" });
    // Check whisper exists and guest_id matches
    const whisper = await db("whispers").where({ id }).first();
    if (!whisper) return res.status(404).json({ error: "Whisper not found" });
    if (whisper.guest_id !== guest_id) {
      return res.status(403).json({ error: "Not authorized to view replies" });
    }
    const replies = await db("whisper_replies").where({ whisper_id: id }).orderBy("created_at", "asc");
    res.json(replies);
  } catch (error) {
    console.error("Error fetching whisper replies:", error);
    res.status(500).json({ error: "Failed to fetch replies" });
  }
});

// Utility function to format timestamps
function formatTimestamp(timestamp) {
  const now = new Date();
  const created = new Date(timestamp);
  const diffMs = now - created;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return created.toLocaleDateString();
}

// Start server
async function startServer() {
  try {
    console.log("🚀 Starting Aangan Backend...");
    console.log(`🔧 PORT: ${PORT}`);
    console.log(`🔧 NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔧 DB_PATH: ${process.env.DB_PATH || 'default'}`);
    
    console.log("📊 Database ready via Knex and migrations.");

    // Add a small delay to ensure everything is ready
    console.log("⏳ Waiting for system to stabilize...");
    await new Promise(resolve => setTimeout(resolve, 2000));

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Aangan Backend running on port ${PORT}`);
      console.log(`📊 Health check: http://0.0.0.0:${PORT}/api/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔌 WebSocket server ready for real-time connections`);
      console.log(`🏡 Aangan courtyard is open for whispers...`);
    });

    // Handle server errors
    server.on('error', (error) => {
      console.error('❌ Server error:', error);
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
      }
      process.exit(1);
    });

  } catch (error) {
    console.error("❌ Failed to start server:", error);
    console.error("❌ Error details:", error.message);
    console.error("❌ Error stack:", error.stack);
    process.exit(1);
  }
}

// WebSocket event handlers with improved stability
io.on('connection', (socket) => {
  console.log(`🔌 New client connected: ${socket.id}`);
  
  // Update connection stats
  connectionStats.totalConnections++;
  connectionStats.activeConnections++;
  
  // Track active connection with timeout
  const connectionTimeout = setTimeout(() => {
    if (activeConnections.has(socket.id)) {
      console.log(`⏰ Connection timeout for ${socket.id}`);
      socket.disconnect();
    }
  }, 5 * 60 * 1000); // 5 minute timeout
  
  // Track active connection
  activeConnections.set(socket.id, {
    id: socket.id,
    connectedAt: new Date(),
    currentZone: null,
    currentEmotion: null,
    lastActivity: new Date(),
    messageCount: 0
  });

  // Handle zone join with validation
  socket.on('join-zone', (zone) => {
    try {
      const connection = activeConnections.get(socket.id);
      if (!connection) {
        console.warn(`⚠️  Connection not found for ${socket.id}`);
        return;
      }
      
      // Validate zone
      const validZones = ['tapri', 'library', 'hostel', 'canteen', 'auditorium', 'quad'];
      if (!validZones.includes(zone)) {
        console.warn(`⚠️  Invalid zone: ${zone} from ${socket.id}`);
        return;
      }
      
      // Leave previous zone if any
      if (connection.currentZone) {
        const previousActivity = zoneActivity.get(connection.currentZone);
        if (previousActivity && previousActivity.users > 0) {
          previousActivity.users -= 1;
          zoneActivity.set(connection.currentZone, previousActivity);
        }
        socket.leave(`zone-${connection.currentZone}`);
      }
      
      connection.currentZone = zone;
      connection.lastActivity = new Date();
      socket.join(`zone-${zone}`);
      
      // Update zone activity
      const currentActivity = zoneActivity.get(zone) || { users: 0, lastActivity: new Date() };
      currentActivity.users += 1;
      currentActivity.lastActivity = new Date();
      zoneActivity.set(zone, currentActivity);
      
      // Broadcast zone activity update
      io.emit('zone-activity-update', {
        zone,
        activity: currentActivity,
        totalActive: Array.from(zoneActivity.values()).reduce((sum, act) => sum + act.users, 0)
      });
      
      console.log(`📍 User ${socket.id} joined zone: ${zone}`);
    } catch (error) {
      console.error(`❌ Error in join-zone: ${error.message}`);
    }
  });

  // Handle emotion pulse with rate limiting
  socket.on('emotion-pulse', (emotion) => {
    try {
      const connection = activeConnections.get(socket.id);
      if (!connection) return;
      
      // Rate limiting: max 1 emotion pulse per 10 seconds per user
      const now = new Date();
      const timeSinceLastPulse = now.getTime() - connection.lastActivity.getTime();
      if (timeSinceLastPulse < 10000) {
        console.warn(`⚠️  Rate limit exceeded for ${socket.id}`);
        return;
      }
      
      connection.currentEmotion = emotion;
      connection.lastActivity = now;
      connection.messageCount++;
      
      // Update emotion pulse
      const currentPulse = emotionPulse.get(emotion) || { count: 0, lastPulse: new Date() };
      currentPulse.count += 1;
      currentPulse.lastPulse = new Date();
      emotionPulse.set(emotion, currentPulse);
      
      // Broadcast emotion pulse
      io.emit('emotion-pulse-update', {
        emotion,
        pulse: currentPulse,
        totalPulses: Array.from(emotionPulse.values()).reduce((sum, pulse) => sum + pulse.count, 0)
      });
      
      console.log(`💓 Emotion pulse: ${emotion} from ${socket.id}`);
    } catch (error) {
      console.error(`❌ Error in emotion-pulse: ${error.message}`);
    }
  });

  // Handle whisper creation (real-time) with validation
  socket.on('whisper-created', (whisper) => {
    try {
      // Per-IP rate limiting
      const ip = socket.handshake.address;
      const bucket = msgBuckets.get(ip) ?? { count: 0, ts: Date.now() };
      if (Date.now() - bucket.ts > 60_000) bucket.count = 0; // reset each min
      if (++bucket.count > 20) {
        console.warn(`⚠️  Rate limit exceeded for IP: ${ip}`);
        return; // drop if >20/min
      }
      msgBuckets.set(ip, bucket);

      // Validate whisper data
      if (!whisper || !whisper.content || !whisper.emotion || !whisper.zone) {
        console.warn(`⚠️  Invalid whisper data from ${socket.id}`);
        return;
      }
      
      // Rate limiting: max 5 whispers per minute per user
      const connection = activeConnections.get(socket.id);
      if (connection) {
        const now = new Date();
        const timeSinceLastWhisper = now.getTime() - connection.lastActivity.getTime();
        if (timeSinceLastWhisper < 12000) { // 12 seconds between whispers
          console.warn(`⚠️  Whisper rate limit exceeded for ${socket.id}`);
          return;
        }
        connection.lastActivity = now;
        connection.messageCount++;
      }
      
      // Broadcast new whisper to all connected clients
      io.emit('new-whisper', {
        ...whisper,
        timestamp: formatTimestamp(whisper.created_at),
        realTime: true
      });
      
      // Also broadcast to specific zone if applicable
      if (whisper.zone) {
        socket.to(`zone-${whisper.zone}`).emit('zone-whisper', {
          ...whisper,
          timestamp: formatTimestamp(whisper.created_at),
          realTime: true
        });
      }
      
      console.log(`📝 Real-time whisper broadcast: ${whisper.id}`);
    } catch (error) {
      console.error(`❌ Error in whisper-created: ${error.message}`);
    }
  });

  // Handle disconnect with cleanup
  socket.on('disconnect', (reason) => {
    try {
      const connection = activeConnections.get(socket.id);
      if (connection) {
        // Update zone activity
        if (connection.currentZone) {
          const currentActivity = zoneActivity.get(connection.currentZone);
          if (currentActivity && currentActivity.users > 0) {
            currentActivity.users -= 1;
            zoneActivity.set(connection.currentZone, currentActivity);
            
            io.emit('zone-activity-update', {
              zone: connection.currentZone,
              activity: currentActivity,
              totalActive: Array.from(zoneActivity.values()).reduce((sum, act) => sum + act.users, 0)
            });
          }
        }
        
        activeConnections.delete(socket.id);
        connectionStats.activeConnections--;
        connectionStats.totalDisconnections++;
        
        clearTimeout(connectionTimeout);
      }
      
      console.log(`🔌 Client disconnected: ${socket.id} (${reason})`);
    } catch (error) {
      console.error(`❌ Error in disconnect: ${error.message}`);
    }
  });

  // Handle errors
  socket.on('error', (error) => {
    console.error(`❌ Socket error for ${socket.id}:`, error);
  });

  // WebSocket: Periodic re-authentication
  const reauthInterval = setInterval(() => {
    socket.emit('reauthenticate');
  }, 10 * 60 * 1000); // every 10 minutes
  socket.on('auth', async ({ token }) => {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
      // Optionally check for revocation here as well
      const lastPasswordChange = await getLastPasswordChange(payload.username);
      if (lastPasswordChange && payload.iat * 1000 < lastPasswordChange.getTime()) {
        socket.disconnect(true);
        return;
      }
      // If valid, keep connection
    } catch (err) {
      socket.disconnect(true);
    }
  });
  socket.on('disconnect', () => {
    clearInterval(reauthInterval);
  });
});

// Real-time analytics endpoints
app.get('/api/realtime/activity', (req, res) => {
  try {
    res.json({
      activeConnections: activeConnections.size,
      zoneActivity: Object.fromEntries(zoneActivity),
      emotionPulse: Object.fromEntries(emotionPulse),
      totalActive: Array.from(zoneActivity.values()).reduce((sum, act) => sum + act.users, 0),
      stats: connectionStats,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in /api/realtime/activity:', error);
    res.status(500).json({ error: 'Failed to get activity data' });
  }
});

app.get('/api/realtime/zones', (req, res) => {
  try {
    res.json({
      zones: Array.from(zoneActivity.entries()).map(([zone, activity]) => ({
        zone,
        activeUsers: activity.users,
        lastActivity: activity.lastActivity,
        activityLevel: getActivityLevel(activity.users)
      })),
      totalActive: Array.from(zoneActivity.values()).reduce((sum, act) => sum + act.users, 0),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in /api/realtime/zones:', error);
    res.status(500).json({ error: 'Failed to get zone data' });
  }
});

app.get('/api/realtime/health', (req, res) => {
  try {
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: uptime,
      memory: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
        external: Math.round(memoryUsage.external / 1024 / 1024), // MB
        rss: Math.round(memoryUsage.rss / 1024 / 1024) // MB
      },
      connections: {
        active: activeConnections.size,
        total: connectionStats.totalConnections,
        disconnections: connectionStats.totalDisconnections,
        zones: zoneActivity.size,
        emotions: emotionPulse.size
      },
      performance: {
        memoryUsagePercent: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100),
        lastCleanup: connectionStats.lastCleanup,
        isStable: uptime > 300 && memoryUsage.heapUsed < 100 * 1024 * 1024 // 100MB threshold
      }
    };
    
    // Check for potential issues
    if (memoryUsage.heapUsed > 150 * 1024 * 1024) { // 150MB
      healthStatus.status = 'warning';
      healthStatus.warnings = ['High memory usage detected'];
    }
    
    if (uptime < 60) { // Less than 1 minute
      healthStatus.status = 'starting';
    }
    
    res.json(healthStatus);
  } catch (error) {
    console.error('Error in /api/realtime/health:', error);
    res.status(500).json({ 
      status: 'error',
      error: 'Failed to get health data',
      timestamp: new Date().toISOString()
    });
  }
});

// Helper function for activity levels
function getActivityLevel(users) {
  if (users === 0) return 'quiet';
  if (users <= 2) return 'whispering';
  if (users <= 5) return 'buzzing';
  if (users <= 10) return 'lively';
  return 'vibrant';
}

// --- JWT Auth Middleware for Admin API ---
function extractUserFromJWT(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Access token required" });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    req.user = payload;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
}

// Mount modular admin routes
app.use("/api/admin", extractUserFromJWT, adminRoutes);

// --- Admin Moderation Endpoints ---

// Middleware: require admin JWT
function requireAdminJWT(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Missing admin token' });
  // TODO: Add real JWT verification if not present
  // For now, just check token exists
  next();
}

// List all whisper reports
app.get("/api/whisper_reports", requireAdminJWT, async (req, res) => {
  try {
    const reports = await db("whisper_reports").orderBy("created_at", "desc");
    res.json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

// Delete a whisper (admin)
app.delete("/api/whispers/:id", requireAdminJWT, async (req, res) => {
  try {
    const { id } = req.params;
    await db("whispers").where({ id }).del();
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting whisper:", error);
    res.status(500).json({ error: "Failed to delete whisper" });
  }
});

// Delete a whisper report (mark as reviewed)
app.delete("/api/whisper_reports/:id", requireAdminJWT, async (req, res) => {
  try {
    const { id } = req.params;
    await db("whisper_reports").where({ id }).del();
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting report:", error);
    res.status(500).json({ error: "Failed to delete report" });
  }
});

// After all other app setup, start the AI reply worker
aiReplyJobQueue.startWorker();

startServer();