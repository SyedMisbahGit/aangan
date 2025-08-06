const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, 'whispers.db');

// Create a new database connection
console.log('🔌 Connecting to SQLite database...');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error('❌ Error connecting to SQLite database:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to SQLite database');
});

// Enable foreign key constraints
db.get("PRAGMA foreign_keys = ON");

// Helper function to run SQL commands with better error handling
function runCommand(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        console.error('\n❌ Command Error:', err.message);
        console.log('SQL:', sql);
        console.log('Params:', params);
        reject(err);
      } else {
        console.log(`✅ Executed: ${sql.split(' ')[0].toUpperCase()}`);
        resolve({ lastID: this.lastID, changes: this.changes });
      }
    });
  });
}

// Helper function to check if a column exists
function columnExists(table, column) {
  return new Promise((resolve, reject) => {
    db.get(
      `PRAGMA table_info(${table})`,
      [],
      (err, row) => {
        if (err) {
          console.error('\n❌ Error checking columns:', err.message);
          reject(err);
          return;
        }
        
        // Check if the column exists in the table
        db.all(
          `PRAGMA table_info(${table})`,
          [],
          (err, columns) => {
            if (err) {
              console.error('\n❌ Error getting table info:', err.message);
              reject(err);
              return;
            }
            
            const columnExists = columns.some(col => col.name === column);
            console.log(`Column '${column}' exists in '${table}': ${columnExists ? '✅ Yes' : '❌ No'}`);
            resolve(columnExists);
          }
        );
      }
    );
  });
}

// Fix the whispers table schema
async function fixWhispersSchema() {
  try {
    // Check if guest_id column already exists
    const guestIdExists = await columnExists('whispers', 'guest_id');
    
    if (!guestIdExists) {
      console.log('\n🔧 Adding guest_id column to whispers table...');
      await runCommand(
        'ALTER TABLE whispers ADD COLUMN guest_id TEXT'
      );
      console.log('✅ Added guest_id column to whispers table');
    } else {
      console.log('\n✅ guest_id column already exists in whispers table');
    }
    
    // Check for other missing columns that might be needed
    const columnsToCheck = [
      'emotional_tone',
      'whisper_type',
      'soft_title',
      'ai_reply_status'
    ];
    
    for (const column of columnsToCheck) {
      const columnExists = await columnExists('whispers', column);
      if (!columnExists) {
        console.log(`\n🔧 Adding ${column} column to whispers table...`);
        await runCommand(
          `ALTER TABLE whispers ADD COLUMN ${column} TEXT`
        );
        console.log(`✅ Added ${column} column to whispers table`);
      } else {
        console.log(`\n✅ ${column} column already exists in whispers table`);
      }
    }
    
    console.log('\n🎉 Database schema update complete!');
    
  } catch (error) {
    console.error('\n❌ Error updating database schema:', error.message);
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

// Run the schema fix
fixWhispersSchema();
