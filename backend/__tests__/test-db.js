import knex from 'knex';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test database configuration
const testDbConfig = {
  client: 'sqlite3',
  connection: {
    filename: ':memory:' // Use in-memory SQLite for tests
  },
  useNullAsDefault: true,
  migrations: {
    directory: path.join(__dirname, '../migrations')
  },
  seeds: {
    directory: path.join(__dirname, '../seeds')
  },
  debug: false
};

// Create a test database instance
const testDb = knex(testDbConfig);

// Function to initialize the test database
async function initTestDatabase() {
  // Run migrations
  await testDb.migrate.latest();
  
  // Run seeds if needed
  // await testDb.seed.run();
  
  return testDb;
}

// Function to destroy the test database
async function destroyTestDatabase() {
  await testDb.destroy();
}

export { testDb, initTestDatabase, destroyTestDatabase };
