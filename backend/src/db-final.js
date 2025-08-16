// Final version of db.js with logging and all features
import knex from 'knex';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProd = process.env.NODE_ENV === 'production';

// Configuration
const config = {
  client: isProd ? 'pg' : 'sqlite3',
  connection: isProd 
    ? process.env.DATABASE_URL 
    : { filename: path.join(__dirname, '../dev.sqlite3') },
  useNullAsDefault: !isProd,
  pool: isProd 
    ? {
        min: 2,
        max: 10,
        idleTimeoutMillis: 30000,
        createTimeoutMillis: 3000,
        acquireTimeoutMillis: 30000
      }
    : undefined,
  debug: false,
  asyncStackTraces: false
};

// Custom logger
const knexLogger = {
  debug: (msg) => console.log(`[Knex DEBUG] ${msg}`),
  error: (msg) => console.error(`[Knex ERROR] ${msg}`),
  warn: (msg) => console.warn(`[Knex WARN] ${msg}`),
  deprecate: (method, alternative) => 
    console.warn(`[Knex DEPRECATE] ${method} is deprecated, use ${alternative} instead`),
};

// Add logger to config
config.log = knexLogger;

// Create the Knex instance
const db = knex(config);

// Test the connection
async function testConnection() {
  try {
    console.log('Testing database connection...');
    const result = await db.raw('SELECT 1+1 as result');
    console.log('✅ Database connection successful');
    return result;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

// Run connection test when this module is imported
let connectionTest = testConnection().catch(err => {
  console.error('Failed to connect to database:', err);
  process.exit(1);
});

export default db;
