// Using require for better compatibility with Knex and TypeScript
import dotenv from 'dotenv';
import type { Knex } from 'knex';

// Initialize environment variables
dotenv.config();

// Use require for Knex to avoid module resolution issues
const knex = require('knex');

const isProd = process.env.NODE_ENV === 'production';
const config: Knex.Config = isProd
  ? {
      client: 'pg',
      connection: process.env.DATABASE_URL,
      pool: { min: 2, max: 10 },
    }
  : {
      client: 'sqlite3',
      connection: {
        filename: process.env.DB_PATH || './whispers.db',
      },
      useNullAsDefault: true,
    };

// Create and export the Knex instance
const db = knex(config);
export { db };
export default db;