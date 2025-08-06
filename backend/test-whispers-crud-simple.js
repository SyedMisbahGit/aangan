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
        resolve({ lastID: this.lastID, changes: this.changes });
      }
    });
  });
}

// Get the current schema of the whispers table
async function getTableSchema() {
  try {
    console.log('\n🔍 Checking whispers table structure...');
    const columns = await runQuery('PRAGMA table_info(whispers)');
    console.log('Whispers table columns:');
    columns.forEach(col => {
      console.log(`- ${col.name} (${col.type})`);
    });
    return columns.map(col => col.name);
  } catch (error) {
    console.error('Error getting table schema:', error);
    throw error;
  }
}

// Test CRUD operations
async function testWhispersCRUD() {
  let columns = [];
  
  try {
    // 1. Get the current schema
    columns = await getTableSchema();
    
    // 2. Get current count of whispers
    const initialCount = await runQuery('SELECT COUNT(*) as count FROM whispers');
    console.log(`\n📊 Initial whispers count: ${initialCount[0].count}`);

    // 3. Prepare test data based on actual columns
    const testWhisper = {
      content: 'Test whisper from CRUD test',
      emotion: 'neutral',
      zone: 'test',
      // Only include columns that exist in the schema
      ...(columns.includes('created_at') ? { created_at: new Date().toISOString() } : {})
    };
    
    // 4. Build INSERT query dynamically based on available columns
    const insertColumns = Object.keys(testWhisper);
    const insertPlaceholders = insertColumns.map(() => '?').join(', ');
    const insertValues = insertColumns.map(col => testWhisper[col]);
    
    // 5. Test INSERT
    console.log('\n🔍 Testing INSERT operation...');
    const insertResult = await runCommand(
      `INSERT INTO whispers (${insertColumns.join(', ')}) VALUES (${insertPlaceholders})`,
      insertValues
    );
    
    const newId = insertResult.lastID;
    console.log(`✅ Inserted whisper with ID: ${newId}`);

    // 6. Test SELECT
    console.log('\n🔍 Testing SELECT operation...');
    const selectedWhisper = await runQuery('SELECT * FROM whispers WHERE id = ?', [newId]);
    
    if (selectedWhisper.length > 0) {
      console.log('✅ Retrieved whisper:', selectedWhisper[0]);
    } else {
      console.log('❌ Failed to retrieve inserted whisper');
    }

    // 7. Test UPDATE
    console.log('\n🔍 Testing UPDATE operation...');
    const updateResult = await runCommand(
      'UPDATE whispers SET content = ? WHERE id = ?',
      ['Updated test whisper content', newId]
    );
    
    console.log(`✅ Updated ${updateResult.changes} row(s)`);

    // 8. Verify UPDATE
    const updatedWhisper = await runQuery('SELECT content FROM whispers WHERE id = ?', [newId]);
    
    if (updatedWhisper.length > 0) {
      console.log('✅ Verified update. New content:', updatedWhisper[0].content);
    } else {
      console.log('❌ Failed to verify update');
    }

    // 9. Test DELETE
    console.log('\n🔍 Testing DELETE operation...');
    const deleteResult = await runCommand('DELETE FROM whispers WHERE id = ?', [newId]);
    
    console.log(`✅ Deleted ${deleteResult.changes} row(s)`);

    // 10. Verify DELETE
    const deletedWhisper = await runQuery('SELECT * FROM whispers WHERE id = ?', [newId]);
    
    if (deletedWhisper.length === 0) {
      console.log('✅ Verified delete - whisper no longer exists');
    } else {
      console.log('❌ Failed to verify delete');
    }

    // 11. Final count
    const finalCount = await runQuery('SELECT COUNT(*) as count FROM whispers');
    console.log(`\n📊 Final whispers count: ${finalCount[0].count}`);

    console.log('\n🎉 All database operations completed successfully!');

  } catch (error) {
    console.error('\n❌ Error during database operations:', error.message);
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
testWhispersCRUD();
