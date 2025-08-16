// Enhanced database connection test script
import knex from 'knex';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Starting database connection test...');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '***' : 'Not set');

// Configuration matching the main app
const config = {
  client: process.env.NODE_ENV === 'production' ? 'pg' : 'sqlite3',
  connection: process.env.NODE_ENV === 'production'
    ? process.env.DATABASE_URL
    : { filename: path.join(__dirname, 'dev.sqlite3') },
  useNullAsDefault: process.env.NODE_ENV !== 'production',
  debug: true,
  asyncStackTraces: true,
  log: {
    debug: (msg) => console.log(`[Knex DEBUG] ${msg}`),
    error: (msg) => console.error(`[Knex ERROR] ${msg}`),
    warn: (msg) => console.warn(`[Knex WARN] ${msg}`),
    deprecate: (method, alternative) => 
      console.warn(`[Knex DEPRECATE] ${method} is deprecated, use ${alternative} instead`),
  }
};

console.log('Database configuration:', {
  client: config.client,
  connection: config.connection && typeof config.connection === 'object' 
    ? { ...config.connection, filename: config.connection.filename || 'N/A' }
    : '***',
  useNullAsDefault: config.useNullAsDefault
});

// Create Knex instance
const db = knex(config);

// Test the connection
async function testConnection() {
  try {
    console.log('Testing database connection...');
    const result = await db.raw('SELECT 1+1 as result');
    console.log('✅ Database connection successful');
    console.log('Query result:', result);
    
    // Test a simple table query if in development
    if (process.env.NODE_ENV !== 'production') {
      console.log('Testing table access...');
      const tables = await db.raw("SELECT name FROM sqlite_master WHERE type='table'");
      console.log('Available tables:', tables);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error stack:', error.stack);
    throw error;
  } finally {
    // Close the connection
    await db.destroy();
    console.log('Database connection closed');
  }
}

// Run the test
testConnection()
  .then(() => console.log('✅ Test completed successfully'))
  .catch(() => console.error('❌ Test failed'))
  .finally(() => process.exit(0));
