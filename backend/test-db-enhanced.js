// Test the enhanced db.js
console.log('Testing enhanced db.js...');

// Try to import the enhanced db module
import db from './src/db-enhanced.js';

console.log('✅ Successfully imported enhanced db module');
console.log('DB client type:', db.client);
console.log('Environment:', process.env.NODE_ENV || 'development');

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
