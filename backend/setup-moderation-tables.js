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

// Create moderation tables SQL
const createModerationTables = `
  -- Content flags table
  CREATE TABLE IF NOT EXISTS content_flags (
    id TEXT PRIMARY KEY,
    content_id TEXT NOT NULL,
    content_type TEXT NOT NULL,
    reason TEXT NOT NULL,
    details TEXT,
    status TEXT DEFAULT 'pending',
    resolution TEXT,
    reported_by TEXT,
    reporter_ip TEXT,
    resolved_by TEXT,
    resolved_at TIMESTAMP,
    moderator_note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Moderation actions table
  CREATE TABLE IF NOT EXISTS moderation_actions (
    id TEXT PRIMARY KEY,
    action TEXT NOT NULL,
    reason TEXT,
    metadata TEXT DEFAULT '{}',
    target_user_id TEXT,
    target_content_id TEXT,
    target_content_type TEXT,
    moderator_id TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- User suspensions table
  CREATE TABLE IF NOT EXISTS user_suspensions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    reason TEXT NOT NULL,
    suspended_until TIMESTAMP NOT NULL,
    is_permanent BOOLEAN DEFAULT 0,
    moderator_id TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

// Run the SQL to create moderation tables
db.serialize(() => {
  // Run each statement one by one
  const statements = createModerationTables.split(';');
  
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    statements.forEach((statement) => {
      const trimmed = statement.trim();
      if (trimmed) {
        db.run(trimmed, (err) => {
          if (err) {
            console.error('Error executing statement:', err);
            console.error('Statement:', trimmed);
          } else {
            console.log('Executed statement successfully');
          }
        });
      }
    });
    
    db.run('COMMIT', (err) => {
      if (err) {
        console.error('Error committing transaction:', err);
      } else {
        console.log('Moderation tables created successfully!');
      }
      
      // Verify tables were created
      db.all("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%moderation%' OR name LIKE '%flag%' OR name LIKE '%suspension%'", [], (err, tables) => {
        if (err) {
          console.error('Error listing tables:', err);
        } else {
          console.log('Created tables:', tables.map(t => t.name).join(', '));
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
});
