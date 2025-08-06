import knex from "knex";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProd = process.env.NODE_ENV === "production";

let dbConfig;

if (isProd) {
  // Production configuration (PostgreSQL)
  dbConfig = {
    client: "pg",
    connection: process.env.DATABASE_URL,
    pool: {
      min: 2,
      max: 8,
      idleTimeoutMillis: 30000,
      createTimeoutMillis: 3000,
      acquireTimeoutMillis: 30000,
      propagateCreateError: false
    },
    acquireConnectionTimeout: 5000,
    debug: false,
    asyncStackTraces: false,
  };
} else {
  // Development configuration (SQLite)
  const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'whispers.db');
  console.log(`Using SQLite database at: ${dbPath}`);
  
  dbConfig = {
    client: "sqlite3",
    connection: {
      filename: dbPath
    },
    useNullAsDefault: true,
    debug: true,
    asyncStackTraces: true,
  };
}

// Add logging configuration
const knexLogger = {
  warn: (msg) => console.warn(`[Knex Warning] ${msg}`),
  error: (msg) => console.error(`[Knex Error] ${msg}`),
  deprecate: (method, alternative) => 
    console.warn(`[Knex Deprecation] ${method} is deprecated, use ${alternative} instead`),
  debug: (msg) => console.debug(`[Knex Debug] ${msg}`)
};

dbConfig.log = knexLogger;

// Create the database connection
export const db = knex(dbConfig);

// Test the database connection
const testConnection = async () => {
  try {
    await db.raw('SELECT 1');
    console.log('✅ Database connection successful');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

// Run connection test
testConnection();

export default db;
