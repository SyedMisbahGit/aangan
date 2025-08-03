import knex from "knex";
import dotenv from "dotenv";

dotenv.config();

const isProd = process.env.NODE_ENV === "production";

const dbConfig = {
  client: "pg",
  connection: process.env.DATABASE_URL,
  pool: {
    min: 2,      // Minimum number of connections
    max: 8,      // Maximum number of connections (reduced from 10)
    idleTimeoutMillis: 30000,  // 30 seconds
    createTimeoutMillis: 3000,  // 3 seconds
    acquireTimeoutMillis: 30000, // 30 seconds
    propagateCreateError: false
  },
  acquireConnectionTimeout: 5000, // 5 seconds
  debug: process.env.NODE_ENV === 'development',
  asyncStackTraces: process.env.NODE_ENV !== 'production',
  log: {
    warn: (msg) => console.warn(`[Knex Warning] ${msg}`),
    error: (msg) => console.error(`[Knex Error] ${msg}`),
    deprecate: (method, alternative) => 
      console.warn(`[Knex Deprecation] ${method} is deprecated, use ${alternative} instead`),
    debug: (msg) => console.debug(`[Knex Debug] ${msg}`)
  }
};

// For development with SQLite
if (!isProd) {
  dbConfig.client = "sqlite3";
  dbConfig.connection = {
    filename: process.env.DB_PATH || "./whispers.db"
  };
  dbConfig.useNullAsDefault = true;
  // Remove pool settings for SQLite as they're not needed
  delete dbConfig.pool;
}

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
