import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Database setup
let db;

async function initializeDatabase() {
  db = await open({
    filename: join(__dirname, 'whispers.db'),
    driver: sqlite3.Database
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
  `);

  // Insert default admin user if not exists
  const adminExists = await db.get('SELECT id FROM admin_users WHERE username = ?', ['admin']);
  if (!adminExists) {
    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
    await db.run('INSERT INTO admin_users (username, password_hash) VALUES (?, ?)', ['admin', passwordHash]);
  }

  // Insert default feature toggles
  const features = ['shrines', 'capsules', 'mirrorMode', 'murmurs'];
  for (const feature of features) {
    await db.run('INSERT OR IGNORE INTO feature_toggles (feature_name, enabled) VALUES (?, ?)', [feature, 1]);
  }

  console.log('Database initialized successfully');
}

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:8080',
    'http://localhost:8081',
    'http://localhost:8082',
    'http://localhost:8083',
    'http://localhost:8084',
    'http://localhost:8085',
    'http://localhost:8086'
  ],
  credentials: true
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// More strict rate limiting for whisper creation
const whisperLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 whispers per minute
  message: 'Too many whispers, please wait a moment.'
});

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await db.get('SELECT * FROM admin_users WHERE username = ?', [decoded.username]);
    
    if (!user) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Whisper routes
app.get('/api/whispers', async (req, res) => {
  try {
    const { zone, emotion, limit = 50, offset = 0 } = req.query;
    
    let query = 'SELECT * FROM whispers';
    let params = [];
    
    if (zone || emotion) {
      const conditions = [];
      if (zone) {
        conditions.push('zone = ?');
        params.push(zone);
      }
      if (emotion) {
        conditions.push('emotion = ?');
        params.push(emotion);
      }
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const whispers = await db.all(query, params);
    
    // Format timestamps
    const formattedWhispers = whispers.map(whisper => ({
      ...whisper,
      timestamp: formatTimestamp(whisper.created_at)
    }));
    
    res.json(formattedWhispers);
  } catch (error) {
    console.error('Error fetching whispers:', error);
    res.status(500).json({ error: 'Failed to fetch whispers' });
  }
});

app.post('/api/whispers', whisperLimiter, async (req, res) => {
  try {
    const { content, emotion, zone } = req.body;
    
    if (!content || !emotion || !zone) {
      return res.status(400).json({ error: 'Content, emotion, and zone are required' });
    }
    
    if (content.length > 280) {
      return res.status(400).json({ error: 'Whisper content too long' });
    }
    
    const validEmotions = ['joy', 'nostalgia', 'calm', 'anxiety', 'hope', 'love'];
    if (!validEmotions.includes(emotion)) {
      return res.status(400).json({ error: 'Invalid emotion' });
    }
    
    const id = uuidv4();
    await db.run(
      'INSERT INTO whispers (id, content, emotion, zone) VALUES (?, ?, ?, ?)',
      [id, content, emotion, zone]
    );
    
    // Log analytics event
    await db.run(
      'INSERT INTO analytics_events (event_type, event_data) VALUES (?, ?)',
      ['whisper_created', JSON.stringify({ emotion, zone, content_length: content.length })]
    );
    
    res.status(201).json({ success: true, id });
  } catch (error) {
    console.error('Error creating whisper:', error);
    res.status(500).json({ error: 'Failed to create whisper' });
  }
});

// Analytics routes (admin only)
app.get('/api/analytics/whispers', authenticateToken, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const [totalWhispers, whispersToday, emotionStats, zoneStats] = await Promise.all([
      db.get('SELECT COUNT(*) as count FROM whispers'),
      db.get('SELECT COUNT(*) as count FROM whispers WHERE DATE(created_at) = ?', [today]),
      db.all('SELECT emotion, COUNT(*) as count FROM whispers GROUP BY emotion'),
      db.all('SELECT zone, COUNT(*) as count FROM whispers GROUP BY zone')
    ]);
    
    res.json({
      totalWhispers: totalWhispers.count,
      whispersToday: whispersToday.count,
      emotionDistribution: emotionStats,
      zoneDistribution: zoneStats
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

app.get('/api/analytics/zones', authenticateToken, async (req, res) => {
  try {
    const zones = await db.all(`
      SELECT 
        zone,
        COUNT(*) as whisper_count,
        COUNT(DISTINCT DATE(created_at)) as active_days
      FROM whispers 
      GROUP BY zone 
      ORDER BY whisper_count DESC
    `);
    
    res.json(zones);
  } catch (error) {
    console.error('Error fetching zone analytics:', error);
    res.status(500).json({ error: 'Failed to fetch zone analytics' });
  }
});

// Feature toggle routes (admin only)
app.get('/api/features/toggles', async (req, res) => {
  try {
    const toggles = await db.all('SELECT feature_name, enabled FROM feature_toggles');
    const toggleMap = {};
    toggles.forEach(toggle => {
      toggleMap[toggle.feature_name] = toggle.enabled === 1;
    });
    res.json(toggleMap);
  } catch (error) {
    console.error('Error fetching feature toggles:', error);
    res.status(500).json({ error: 'Failed to fetch feature toggles' });
  }
});

app.post('/api/features/toggles', authenticateToken, async (req, res) => {
  try {
    const { feature, enabled } = req.body;
    
    if (!feature || typeof enabled !== 'boolean') {
      return res.status(400).json({ error: 'Feature name and enabled status required' });
    }
    
    await db.run(
      'UPDATE feature_toggles SET enabled = ?, updated_at = CURRENT_TIMESTAMP WHERE feature_name = ?',
      [enabled ? 1 : 0, feature]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating feature toggle:', error);
    res.status(500).json({ error: 'Failed to update feature toggle' });
  }
});

// Authentication routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    
    const user = await db.get('SELECT * FROM admin_users WHERE username = ?', [username]);
    
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { username: user.username, id: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      user: {
        username: user.username,
        role: 'admin'
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({
    valid: true,
    user: {
      username: req.user.username,
      role: 'admin'
    }
  });
});

// Utility function to format timestamps
function formatTimestamp(timestamp) {
  const now = new Date();
  const created = new Date(timestamp);
  const diffMs = now - created;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return created.toLocaleDateString();
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
async function startServer() {
  try {
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`🚀 Shhh WhisperVerse Backend running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔐 Admin login: POST http://localhost:${PORT}/api/auth/login`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
#   D a t a b a s e   r e s e t   t r i g g e r  
 