const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, 'whispers.db');

// Create a new database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err);
    process.exit(1);
  }
  console.log('✅ Connected to SQLite database');
});

// Enable foreign key constraints
db.get("PRAGMA foreign_keys = ON");

// Helper function to run SQL queries with promises
function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error('Query error:', err);
        console.error('SQL:', sql);
        console.error('Params:', params);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// Helper function to run SQL commands with promises
function runCommand(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        console.error('Command error:', err);
        console.error('SQL:', sql);
        console.error('Params:', params);
        reject(err);
      } else {
        resolve({ lastID: this.lastID, changes: this.changes });
      }
    });
  });
}

// Test database operations
async function testDatabase() {
  try {
    // 1. Check if tables exist
    const tables = await runQuery(
      "SELECT name FROM sqlite_master WHERE type='table'"
    );
    console.log('\n📋 Database tables:', tables.map(t => t.name).join(', '));

    // 2. Test INSERT
    console.log('\n🔍 Testing INSERT operation...');
    const insertResult = await runCommand(
      `INSERT INTO whispers (content, emotion, zone, guest_id, whisper_type) 
       VALUES (?, ?, ?, ?, ?)`,
      ['Test whisper content', 'neutral', 'test', 'test_user_123', 'test']
    );
    console.log(`✅ Inserted whisper with ID: ${insertResult.lastID}`);

    // 3. Test SELECT
    console.log('\n🔍 Testing SELECT operation...');
    const whisper = await runQuery(
      'SELECT * FROM whispers WHERE id = ?',
      [insertResult.lastID]
    );
    console.log('✅ Retrieved whisper:', whisper[0]);

    // 4. Test UPDATE
    console.log('\n🔍 Testing UPDATE operation...');
    const updateResult = await runCommand(
      'UPDATE whispers SET content = ? WHERE id = ?',
      ['Updated test whisper content', insertResult.lastID]
    );
    console.log(`✅ Updated ${updateResult.changes} row(s)`);

    // 5. Verify UPDATE
    const updatedWhisper = await runQuery(
      'SELECT content FROM whispers WHERE id = ?',
      [insertResult.lastID]
    );
    console.log('✅ Verified update. New content:', updatedWhisper[0].content);

    // 6. Test DELETE
    console.log('\n🔍 Testing DELETE operation...');
    const deleteResult = await runCommand(
      'DELETE FROM whispers WHERE id = ?',
      [insertResult.lastID]
    );
    console.log(`✅ Deleted ${deleteResult.changes} row(s)`);

    // 7. Verify DELETE
    const deletedWhisper = await runQuery(
      'SELECT * FROM whispers WHERE id = ?',
      [insertResult.lastID]
    );
    console.log('✅ Verify delete - found rows:', deletedWhisper.length);

    console.log('\n🎉 All database operations completed successfully!');

  } catch (error) {
    console.error('❌ Error during database operations:', error);
  } finally {
    // Close the database connection
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
      } else {
        console.log('\n🔌 Database connection closed');
      }
    });
  }
}

// Run the test
testDatabase();
