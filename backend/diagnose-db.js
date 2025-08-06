const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Database path
const dbPath = path.join(__dirname, 'whispers.db');

// Check if database file exists
const dbExists = fs.existsSync(dbPath);
console.log(`\n📂 Database file exists: ${dbExists ? '✅ Yes' : '❌ No'}`);

if (!dbExists) {
  console.log('\n❌ Database file not found. Please check the path and try again.');
  process.exit(1);
}

// Create a new database connection
console.log('\n🔌 Attempting to connect to SQLite database...');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error('❌ Error connecting to SQLite database:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to SQLite database');
});

// Helper function to run SQL queries with better error handling
function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error('\n❌ Query Error:', err.message);
        console.log('SQL:', sql);
        console.log('Params:', params);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// Main diagnostic function
async function diagnoseDatabase() {
  try {
    // 1. Check database integrity
    console.log('\n🔍 Checking database integrity...');
    const integrity = await runQuery('PRAGMA integrity_check');
    console.log('✅ Database integrity check:', integrity);

    // 2. List all tables
    console.log('\n📋 Listing all tables...');
    const tables = await runQuery(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    );
    console.log('Found tables:', tables.map(t => t.name).join(', '));

    // 3. Check if 'whispers' table exists
    const whispersTableExists = tables.some(t => t.name === 'whispers');
    console.log('\n🔍 Checking if whispers table exists:', whispersTableExists ? '✅ Yes' : '❌ No');

    if (whispersTableExists) {
      // 4. Get schema of whispers table
      console.log('\n📝 Whispers table schema:');
      const schema = await runQuery('PRAGMA table_info(whispers)');
      console.table(schema);

      // 5. Count rows in whispers table
      const count = await runQuery('SELECT COUNT(*) as count FROM whispers');
      console.log(`\n📊 Whispers table row count: ${count[0].count}`);
    }

    // 6. List all tables with row counts
    console.log('\n📊 Table row counts:');
    for (const table of tables) {
      try {
        const count = await runQuery(`SELECT COUNT(*) as count FROM ${table.name}`);
        console.log(`- ${table.name}: ${count[0].count} rows`);
      } catch (err) {
        console.log(`- ${table.name}: ❌ Error - ${err.message}`);
      }
    }

  } catch (error) {
    console.error('\n❌ Error during database diagnosis:', error);
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

// Run the diagnostic
diagnoseDatabase();
