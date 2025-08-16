// Enhanced db.js with more features
import knex from 'knex';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProd = process.env.NODE_ENV === 'production';

// Basic configuration
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

// Create the Knex instance
const db = knex(config);

// Test the connection
db.raw('SELECT 1+1 as result')
  .then(() => {
    console.log('✅ Database connection successful');
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err);
  });

export default db;
