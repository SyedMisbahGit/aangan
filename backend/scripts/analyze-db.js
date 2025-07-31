import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = path.join(__dirname, '..', 'whispers.db');

// Connect to SQLite database
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

// Get all tables
function getTables() {
  return new Promise((resolve) => {
    db.all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'", [], (err, tables) => {
      if (err) throw err;
      resolve(tables.map(t => t.name));
    });
  });
}

// Get table schema and indexes
function getTableInfo(table) {
  return new Promise((resolve) => {
    db.serialize(() => {
      const result = { name: table, columns: [], indexes: [] };
      
      // Get columns
      db.all(`PRAGMA table_info(${table})`, [], (err, columns) => {
        if (err) throw err;
        result.columns = columns;
        
        // Get indexes
        db.all(`PRAGMA index_list(${table})`, [], (err, indexes) => {
          if (err) throw err;
          
          const indexPromises = indexes.map(idx => 
            new Promise(res => {
              db.all(`PRAGMA index_info(${idx.name})`, [], (err, info) => {
                res({...idx, columns: info.map(i => i.name)});
              });
            })
          );
          
          Promise.all(indexPromises).then(indexDetails => {
            result.indexes = indexDetails;
            resolve(result);
          });
        });
      });
    });
  });
}

// Main function
async function analyze() {
  try {
    const tables = await getTables();
    console.log(`Found ${tables.length} tables:\n`);
    
    for (const table of tables) {
      const info = await getTableInfo(table);
      console.log(`\n=== ${table.toUpperCase()} ===`);
      
      console.log('\nColumns:');
      info.columns.forEach(col => {
        console.log(`  - ${col.name} (${col.type})` +
                   `${col.pk ? ' PK' : ''}` +
                   `${col.notnull ? ' NOT NULL' : ''}`);
      });
      
      if (info.indexes.length > 0) {
        console.log('\nIndexes:');
        info.indexes.forEach(idx => {
          console.log(`  - ${idx.name} (${idx.columns.join(', ')})` +
                     `${idx.unique ? ' UNIQUE' : ''}`);
        });
      }
      console.log('\n' + '-'.repeat(50));
    }
    
  } catch (err) {
    console.error('Error analyzing database:', err);
  } finally {
    db.close();
  }
}

analyze();
