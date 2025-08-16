// Test direct db.js import
console.log('Testing direct db.js import...');

// Try to import the db module
import db from './src/db.js';

console.log('✅ Successfully imported db module');
console.log('DB client type:', db.client);
