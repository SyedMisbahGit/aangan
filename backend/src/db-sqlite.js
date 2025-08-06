import knex from "knex";
import path from "path";
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// SQLite configuration for local development
const dbConfig = {
  client: "sqlite3",
  connection: {
    filename: path.join(__dirname, '..', 'whispers.db')
  },
  useNullAsDefault: true,
  pool: {
    min: 1,
    max: 1,
    idleTimeoutMillis: 3600000,
    acquireTimeoutMillis: 30000
  },
  debug: process.env.NODE_ENV === 'development',
  asyncStackTraces: true,
  log: {
    warn: (msg) => console.warn(`[Knex SQLite Warning] ${msg}`),
    error: (msg) => console.error(`[Knex SQLite Error] ${msg}`),
    deprecate: (method, alternative) => 
      console.warn(`[Knex SQLite Deprecation] ${method} is deprecated, use ${alternative} instead`),
    debug: (msg) => console.debug(`[Knex SQLite Debug] ${msg}`)
  }
};

// Create the Knex instance
const db = knex(dbConfig);

// Test the database connection
async function testConnection() {
  try {
    await db.raw('SELECT 1');
    console.log('✅ Successfully connected to SQLite database');
    return true;
  } catch (error) {
    console.error('❌ Error connecting to SQLite database:', error);
    throw error;
  }
}

// Run connection test
testConnection()
  .then(() => console.log('✅ Database connection test complete'))
  .catch(err => console.error('❌ Database connection test failed:', err));

export default db;
