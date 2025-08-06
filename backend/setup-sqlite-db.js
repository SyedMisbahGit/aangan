const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Database path
const dbPath = path.join(__dirname, 'whispers.db');

// Create a new database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err);
    process.exit(1);
  }
  console.log('Connected to SQLite database');
});

// Enable foreign key constraints
db.get("PRAGMA foreign_keys = ON");

// Create tables
const createTables = `
  -- Whispers table
  CREATE TABLE IF NOT EXISTS whispers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    emotion TEXT,
    zone TEXT,
    is_ai_generated BOOLEAN DEFAULT 0,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    guest_id TEXT,
    emotional_tone TEXT,
    whisper_type TEXT,
    soft_title TEXT,
    ai_reply_status TEXT
  );

  -- Whisper reactions
  CREATE TABLE IF NOT EXISTS whisper_reactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    whisper_id INTEGER NOT NULL,
    guest_id TEXT,
    emoji TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (whisper_id) REFERENCES whispers (id) ON DELETE CASCADE
  );

  -- Whisper reports
  CREATE TABLE IF NOT EXISTS whisper_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    whisper_id INTEGER NOT NULL,
    reason TEXT,
    guest_id TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (whisper_id) REFERENCES whispers (id) ON DELETE CASCADE
  );

  -- Whisper replies
  CREATE TABLE IF NOT EXISTS whisper_replies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    whisper_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    guest_id TEXT,
    is_ai_generated BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (whisper_id) REFERENCES whispers (id) ON DELETE CASCADE
  );
`;

// Run the SQL to create tables
db.serialize(() => {
  // Run each statement one by one
  const statements = createTables.split(';');
  
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    statements.forEach((statement) => {
      const trimmed = statement.trim();
      if (trimmed) {
        db.run(trimmed, (err) => {
          if (err) {
            console.error('Error executing statement:', err);
            console.error('Statement:', trimmed);
          }
        });
      }
    });
    
    db.run('COMMIT', (err) => {
      if (err) {
        console.error('Error committing transaction:', err);
      } else {
        console.log('Database tables created successfully!');
      }
      
      // Close the database connection
      db.close((err) => {
        if (err) {
          console.error('Error closing database:', err);
        } else {
          console.log('Database connection closed');
        }
      });
    });
  });
});
