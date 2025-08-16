// Test module resolution
console.log('Testing module resolution...');

// Try to import the db module
import db from './src/db.js';

console.log('✅ Successfully imported db module');
console.log('DB client:', db.client);
