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
import { createServer } from "http";
import { Server } from "socket.io";

// Load environment variables
dotenv.config();

// Railway deployment - fresh start - timestamp: 2025-01-05T12:50:00Z

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Trust proxy for rate limiting with X-Forwarded-For headers
app.set('trust proxy', 1);
console.log('✅ Express trust proxy is set to 1 (for X-Forwarded-For headers)');

// Socket.IO authentication middleware
io.use((socket, next) => {
  const key = socket.handshake.auth?.clientKey;
  if (key !== process.env.SOCKET_SHARED_KEY) {
    return next(new Error("unauthorized"));
  }
  return next();
});

// Per-IP rate limiting for socket messages
const msgBuckets = new Map(); // ip -> { count, ts }

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

const PORT = process.env.PORT || 3001;

// Debug: Log the actual PORT value
console.log(`🔧 PORT environment variable: ${process.env.PORT || 'not set'}`);
console.log(`🔧 Using port: ${PORT}`);

// Database setup
let db;

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

async function initializeDatabase() {
  try {
    const DB_PATH = process.env.DB_PATH || join(__dirname, "whispers.db");
    console.log(`📁 Database path: ${DB_PATH}`);
    
    db = await open({
      filename: DB_PATH,
      driver: sqlite3.Database,
    });
    
    console.log("✅ Database connection established");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    throw error;
  }

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

  console.log("✅ Database initialized successfully");
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

// Admin login route
app.post("/api/admin/login", async (req, res) => {
  try {
    const { pass } = req.body;
    
    if (!pass) {
      return res.status(400).json({ error: "Password required" });
    }

    // Get admin user from database
    const adminUser = await db.get(
      "SELECT * FROM admin_users WHERE username = ?",
      [process.env.ADMIN_USERNAME || "admin"]
    );

    if (!adminUser) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Compare password with stored hash
    const isValid = await bcrypt.compare(pass, adminUser.password_hash);
    
    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        username: adminUser.username, 
        role: "admin",
        id: adminUser.id 
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    res.json({ token, user: { username: adminUser.username, role: "admin" } });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ error: "Login failed" });
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

    // Content moderation pre-filter
    const BAD_WORDS = ["chutiya", "bc", "mc", "madarchod", "bhosadike", "bhenchod"];
    const hasBadWord = BAD_WORDS.some(bad => 
      content.toLowerCase().includes(bad.toLowerCase())
    );
    
    if (hasBadWord) {
      return res.status(400).json({ error: "content-flagged" });
    }

    const id = uuidv4();
    await db.run(
      "INSERT INTO whispers (id, content, emotion, zone) VALUES (?, ?, ?, ?)",
      [id, content, emotion, zone],
    );

    const whisper = await db.get("SELECT * FROM whispers WHERE id = ?", [id]);
    whisper.timestamp = formatTimestamp(whisper.created_at);

    // Emit real-time whisper event
    io.emit('new-whisper', {
      ...whisper,
      timestamp: formatTimestamp(whisper.created_at),
      realTime: true
    });

    // Emit zone-specific whisper event
    io.to(`zone-${zone}`).emit('zone-whisper', {
      ...whisper,
      timestamp: formatTimestamp(whisper.created_at),
      realTime: true
    });

    // Update emotion pulse
    const currentPulse = emotionPulse.get(emotion) || { count: 0, lastPulse: new Date() };
    currentPulse.count += 1;
    currentPulse.lastPulse = new Date();
    emotionPulse.set(emotion, currentPulse);

    // Broadcast emotion pulse update
    io.emit('emotion-pulse-update', {
      emotion,
      pulse: currentPulse,
      totalPulses: Array.from(emotionPulse.values()).reduce((sum, pulse) => sum + pulse.count, 0)
    });

    console.log(`📝 New whisper created and broadcast: ${id} in zone ${zone} with emotion ${emotion}`);

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
    console.log("🚀 Starting Aangan Backend...");
    console.log(`🔧 PORT: ${PORT}`);
    console.log(`🔧 NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔧 DB_PATH: ${process.env.DB_PATH || 'default'}`);
    
    console.log("📊 Initializing database...");
    await initializeDatabase();
    console.log("✅ Database initialized successfully");

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

startServer();