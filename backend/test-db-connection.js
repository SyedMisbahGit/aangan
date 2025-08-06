const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, 'whispers.db');

// Create a new database connection
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err);
    process.exit(1);
  }
  console.log('Connected to SQLite database');
});

// Enable foreign key constraints
db.get("PRAGMA foreign_keys = ON");

// Test data
const testWhisper = {
  content: "This is a test whisper for database connection testing.",
  emotion: "neutral",
  zone: "test",
  guest_id: "test_user_123",
  whisper_type: "test"
};

// Test CRUD operations
async function testDatabaseOperations() {
  try {
    // Test INSERT
    const insertId = await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO whispers (content, emotion, zone, guest_id, whisper_type) VALUES (?, ?, ?, ?, ?)',
        [testWhisper.content, testWhisper.emotion, testWhisper.zone, testWhisper.guest_id, testWhisper.whisper_type],
        function(err) {
          if (err) return reject(err);
          resolve(this.lastID);
        }
      );
    });
    
    console.log(`✅ Successfully inserted whisper with ID: ${insertId}`);
    
    // Test SELECT
    const selectedWhisper = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM whispers WHERE id = ?', [insertId], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
    
    console.log('✅ Successfully retrieved whisper:', selectedWhisper);
    
    // Test UPDATE
    const newContent = "This whisper has been updated!";
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE whispers SET content = ? WHERE id = ?',
        [newContent, insertId],
        (err) => err ? reject(err) : resolve()
      );
    });
    
    // Verify UPDATE
    const updatedWhisper = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM whispers WHERE id = ?', [insertId], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
    
    console.log('✅ Successfully updated whisper. New content:', updatedWhisper.content);
    
    // Test DELETE
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM whispers WHERE id = ?', [insertId], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
    
    // Verify DELETE
    const deletedWhisper = await new Promise((resolve) => {
      db.get('SELECT * FROM whispers WHERE id = ?', [insertId], (err, row) => {
        resolve(row);
      });
    });
    
    if (!deletedWhisper) {
      console.log('✅ Successfully deleted whisper');
    } else {
      console.log('❌ Failed to delete whisper');
    }
    
    console.log('\n✅ All database operations completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during database operations:', error);
  } finally {
    // Close the database connection
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
      } else {
        console.log('Database connection closed');
      }
    });
  }
}

// Run the test
testDatabaseOperations();
