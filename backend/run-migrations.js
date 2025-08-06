const knex = require('knex');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Database configuration
const config = {
  client: 'sqlite3',
  connection: {
    filename: process.env.DB_PATH || './whispers.db',
  },
  useNullAsDefault: true,
  migrations: {
    directory: path.join(__dirname, 'migrations'),
  },
  seeds: {
    directory: path.join(__dirname, 'seeds'),
  },
};

// Create a Knex instance
const db = knex(config);

// Run migrations
async function runMigrations() {
  try {
    console.log('Running migrations...');
    await db.migrate.latest();
    console.log('Migrations completed successfully!');
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

runMigrations();
