// Test the simplified db.js
console.log('Testing simplified db.js...');

// Try to import the simplified db module
import db from './src/db-simple.js';

console.log('✅ Successfully imported simplified db module');
console.log('DB client type:', db.client);

// Test a simple query
db.raw('SELECT 1+1 as result')
  .then(([rows]) => {
    console.log('✅ Simple query result:', rows[0]);
    return db.destroy();
  })
  .then(() => {
    console.log('✅ Database connection closed');
  })
  .catch((err) => {
    console.error('❌ Error:', err);
  });
