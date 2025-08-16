// Simplified db.js for testing
import knex from 'knex';
import dotenv from 'dotenv';

dotenv.config();

// Simple configuration
const config = {
  client: 'sqlite3',
  connection: {
    filename: './dev.sqlite3'
  },
  useNullAsDefault: true
};

// Create and export the Knex instance
const db = knex(config);

// Simple test query
db.raw('SELECT 1+1 as result')
  .then(() => {
    console.log('✅ Database connection successful');
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err);
  });

export default db;
