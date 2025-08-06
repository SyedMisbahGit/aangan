// Test script to debug database connection
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Set up __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, 'local.env') });

console.log('Environment Variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DB_PATH:', process.env.DB_PATH);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '***' : 'Not set');

// Import db after environment is set up
import { db } from './src/db.js';

// Test the database connection
async function testConnection() {
  try {
    console.log('Testing database connection...');
    const result = await db.raw('SELECT 1+1 as result');
    console.log('✅ Database connection successful');
    console.log('Test query result:', result);
    
    // List all tables in the database
    try {
      const tables = await db.raw("SELECT name FROM sqlite_master WHERE type='table'");
      console.log('\nDatabase tables:');
      console.log(tables);
    } catch (tableError) {
      console.warn('⚠️ Could not list tables (database might be empty):', tableError.message);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    if (error.message.includes('SQLITE_CANTOPEN')) {
      console.error('Error: Cannot open database file. Check the DB_PATH in your .env file.');
      console.error('Current DB_PATH:', process.env.DB_PATH || './whispers.db');
    }
    return false;
  }
}

// Run the test
testConnection()
  .then(success => {
    if (success) {
      console.log('\n✅ Database test completed successfully');
    } else {
      console.log('\n❌ Database test failed');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unhandled error in test script:', error);
    process.exit(1);
  });
