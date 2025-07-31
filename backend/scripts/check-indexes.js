import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', 'whispers.db');

// Connect to SQLite database
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

// Function to get all indexes and their details
function getAllIndexes() {
  return new Promise((resolve, reject) => {
    // First, get all tables
    db.all(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'",
      [],
      (err, tables) => {
        if (err) {
          reject(err);
          return;
        }

        const allIndexes = [];
        let processed = 0;

        // For each table, get its indexes
        if (tables.length === 0) {
          resolve([]);
          return;
        }

        tables.forEach(table => {
          // Get index info for this table
          db.all(
            `PRAGMA index_list(${table.name})`,
            [],
            (err, indexes) => {
              if (err) {
                processed++;
                if (processed === tables.length) resolve(allIndexes);
                return;
              }

              if (indexes.length === 0) {
                processed++;
                if (processed === tables.length) resolve(allIndexes);
                return;
              }

              let indexProcessed = 0;
              
              indexes.forEach(idx => {
                // Get columns for this index
                db.all(
                  `PRAGMA index_info('${idx.name}')`,
                  [],
                  (err, columns) => {
                    allIndexes.push({
                      table_name: table.name,
                      index_name: idx.name,
                      columns: columns.map(c => c.name),
                      is_unique: idx.unique === 1,
                      origin: idx.origin || ''
                    });

                    indexProcessed++;
                    if (indexProcessed === indexes.length) {
                      processed++;
                      if (processed === tables.length) {
                        resolve(allIndexes);
                      }
                    }
                  }
                );
              });
            }
          );
        });
      }
    );
  });
}

// Function to analyze table statistics
function analyzeTable(tableName) {
  return new Promise((resolve) => {
    db.get(`SELECT COUNT(*) as count FROM ${tableName}`, [], (err, row) => {
      if (err) {
        console.error(`Error analyzing table ${tableName}:`, err.message);
        resolve(null);
        return;
      }
      resolve(row?.count || 0);
    });
  });
}

// Main function
async function main() {
  try {
    console.log('=== Database Index Analysis ===\n');
    
    // Get all indexes
    const indexes = await getAllIndexes();
    
    // Group indexes by table
    const tables = {};
    indexes.forEach(row => {
      if (!tables[row.table_name]) {
        tables[row.table_name] = [];
      }
      
      // Find if this index is already in our table
      const existingIndex = tables[row.table_name].find(
        idx => idx.name === row.index_name
      );
      
      if (existingIndex) {
        existingIndex.columns.push(row.column_name);
      } else {
        tables[row.table_name].push({
          name: row.index_name,
          columns: [row.column_name],
          unique: row.is_unique === 1,
          origin: row.index_origin
        });
      }
    });
    
    // Get list of all tables
    const tableNames = await new Promise((resolve) => {
      db.all(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'",
        [],
        (err, rows) => {
          if (err) resolve([]);
          else resolve(rows.map(r => r.name));
        }
      );
    });
    
    // Analyze each table
    for (const tableName of tableNames) {
      const rowCount = await analyzeTable(tableName);
      const tableIndexes = tables[tableName] || [];
      
      console.log(`\n=== Table: ${tableName} (${rowCount} rows) ===`);
      
      if (tableIndexes.length === 0) {
        console.log('  No indexes found');
        continue;
      }
      
      console.log('  Indexes:');
      tableIndexes.forEach(idx => {
        const type = idx.unique ? 'UNIQUE' : 'INDEX';
        const origin = idx.origin ? ` (${idx.origin})` : '';
        console.log(`  - ${idx.name}: ${type} ON (${idx.columns.join(', ')})${origin}`);
      });
      
      // Check for potential missing indexes based on common patterns
      const tableInfo = await new Promise(resolve => {
        db.all(`PRAGMA table_info(${tableName})`, [], (err, cols) => {
          if (err) resolve({});
          
          const columns = cols || [];
          const fkColumns = columns.filter(c => c.pk === 0 && c.name.endsWith('_id'));
          const dateColumns = columns.filter(c => c.type && c.type.toLowerCase().includes('date'));
          
          resolve({ fkColumns, dateColumns, allColumns: columns });
        });
      });
      
      // Check for missing indexes on foreign keys
      if (tableInfo.fkColumns && tableInfo.fkColumns.length > 0) {
        const missingFkIndexes = tableInfo.fkColumns.filter(col => {
          const colName = col.name;
          return !tableIndexes.some(idx => 
            idx.columns.includes(colName) && idx.columns.length === 1
          );
        });
        
        if (missingFkIndexes.length > 0) {
          console.log('\n  [WARNING] Potential missing indexes on foreign keys:');
          missingFkIndexes.forEach(col => {
            console.log(`  - Consider adding index on: ${col.name}`);
          });
        }
      }
      
      // Check for missing indexes on date columns
      if (tableInfo.dateColumns && tableInfo.dateColumns.length > 0) {
        const missingDateIndexes = tableInfo.dateColumns.filter(col => {
          const colName = col.name;
          return !tableIndexes.some(idx => 
            idx.columns.includes(colName) && idx.columns.length === 1
          );
        });
        
        if (missingDateIndexes.length > 0) {
          console.log('\n  [INFO] Consider adding indexes on these date columns for time-based queries:');
          missingDateIndexes.forEach(col => {
            console.log(`  - ${col.name} (${col.type})`);
          });
        }
      }
    }
    
  } catch (error) {
    console.error('Error during analysis:', error);
  } finally {
    db.close();
  }
}

main();
