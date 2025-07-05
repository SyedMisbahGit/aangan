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
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { v4 as uuidv4 } from "uuid";
import { readFileSync } from "fs";

// Load environment variables
dotenv.config();

// Railway deployment - fresh start - timestamp: 2025-01-05T12:50:00Z

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Debug: Log the actual PORT value
console.log(`🔧 PORT environment variable: ${process.env.PORT || 'not set'}`);
console.log(`🔧 Using port: ${PORT}`);

// Database setup
let db;

const ADMIN_API_KEY = process.env.ADMIN_API_KEY || "changeme";

async function initializeDatabase() {
  const DB_PATH = process.env.DB_PATH || join(__dirname, "whispers.db");
  db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database,
  });

  // Create tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS whispers (
      id TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      emotion TEXT NOT NULL,
      zone TEXT NOT NULL,
      likes INTEGER DEFAULT 0,
      replies INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS feature_toggles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      feature_name TEXT UNIQUE NOT NULL,
      enabled BOOLEAN DEFAULT 1,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS analytics_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_type TEXT NOT NULL,
      event_data TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS fcm_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      token TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Insert default admin user if not exists
  const adminExists = await db.get(
    "SELECT id FROM admin_users WHERE username = ?",
    [process.env.ADMIN_USERNAME || "admin"],
  );
  if (!adminExists) {
    const passwordHash = await bcrypt.hash(
      process.env.ADMIN_PASSWORD || "admin123",
      10,
    );
    await db.run(
      "INSERT INTO admin_users (username, password_hash) VALUES (?, ?)",
      [process.env.ADMIN_USERNAME || "admin", passwordHash],
    );
  }

  // Insert default feature toggles
  const features = ["shrines", "capsules", "mirrorMode", "murmurs"];
  for (const feature of features) {
    await db.run(
      "INSERT OR IGNORE INTO feature_toggles (feature_name, enabled) VALUES (?, ?)",
      [feature, 1],
    );
  }

  console.log("Database initialized successfully");
}

// Middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
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

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api/", limiter);

// Adjust whisper rate-limit: 5 per 10 min per IP
const whisperLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // limit each IP to 5 whispers per 10 min
  message: "Too many whispers, please wait a while.",
});

// Authentication middleware (admin only)
const authenticateAdminJWT = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }
  try {
    jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid token" });
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
    const { zone, emotion, limit = 50, offset = 0 } = req.query;

    let query = "SELECT * FROM whispers";
    let params = [];

    if (zone || emotion) {
      const conditions = [];
      if (zone) {
        conditions.push("zone = ?");
        params.push(zone);
      }
      if (emotion) {
        conditions.push("emotion = ?");
        params.push(emotion);
      }
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));

    const whispers = await db.all(query, params);

    // Format timestamps
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

app.post("/api/whispers", whisperLimiter, async (req, res) => {
  try {
    const { content, emotion, zone } = req.body;

    if (!content || !emotion || !zone) {
      return res
        .status(400)
        .json({ error: "Content, emotion, and zone are required" });
    }

    const id = uuidv4();
    await db.run(
      "INSERT INTO whispers (id, content, emotion, zone) VALUES (?, ?, ?, ?)",
      [id, content, emotion, zone],
    );

    const whisper = await db.get("SELECT * FROM whispers WHERE id = ?", [id]);
    whisper.timestamp = formatTimestamp(whisper.created_at);

    res.status(201).json(whisper);
  } catch (error) {
    console.error("Error creating whisper:", error);
    res.status(500).json({ error: "Failed to create whisper" });
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
    console.log("🚀 Starting Shhh WhisperVerse Backend...");
    console.log("📊 Initializing database...");
    
    await initializeDatabase();

    // Add a small delay to ensure everything is ready
    await new Promise(resolve => setTimeout(resolve, 2000));

    app.listen(PORT, () => {
      console.log(`🚀 Shhh WhisperVerse Backend running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer(); 