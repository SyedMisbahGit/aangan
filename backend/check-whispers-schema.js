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
  console.log('Connected to SQLite database');});

// Check the schema of the whispers table
db.all("PRAGMA table_info(whispers)", [], (err, columns) => {
  if (err) {
    console.error('Error getting table info:', err);
    db.close();
    return;
  }
  
  console.log('\n=== Whispers Table Schema ===');
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
  
  // Close the database connection
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('\nDatabase connection closed');
    }
  });
});
