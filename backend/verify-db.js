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
  console.log('Connected to SQLite database');
});

// Function to list all tables
function listTables() {
  return new Promise((resolve, reject) => {
    db.all("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name", [], (err, tables) => {
      if (err) {
        reject(err);
        return;
      }
      console.log('\n=== Database Tables ===');
      console.log(tables.map(t => t.name).join('\n'));
      resolve(tables.map(t => t.name));
    });
  });
}

// Function to describe a table
function describeTable(tableName) {
  return new Promise((resolve, reject) => {
    db.all(`PRAGMA table_info(${tableName})`, [], (err, columns) => {
      if (err) {
        console.error(`Error describing table ${tableName}:`, err);
        reject(err);
        return;
      }
      
      console.log(`\n=== Table: ${tableName} ===`);
      console.log('Column Name'.padEnd(20), 'Type'.padEnd(15), 'Nullable'.padEnd(10), 'Default');
      console.log('-'.repeat(60));
      
      columns.forEach(col => {
        console.log(
          col.name.padEnd(20),
          col.type.padEnd(15),
          (col.notnull ? 'NO' : 'YES').padEnd(10),
          col.dflt_value || 'NULL'
        );
      });
      
      resolve(columns);
    });
  });
}

// Function to count rows in a table
function countRows(tableName) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT COUNT(*) as count FROM ${tableName}`, [], (err, result) => {
      if (err) {
        console.error(`Error counting rows in ${tableName}:`, err);
        resolve(0);
        return;
      }
      console.log(`\nRows in ${tableName}: ${result.count}`);
      resolve(result.count);
    });
  });
}

// Main function
async function verifyDatabase() {
  try {
    // List all tables
    const tables = await listTables();
    
    // Describe each table
    for (const table of tables) {
      await describeTable(table);
      await countRows(table);
    }
    
    console.log('\n=== Database Verification Complete ===');
  } catch (error) {
    console.error('Error during database verification:', error);
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

// Run the verification
verifyDatabase();
