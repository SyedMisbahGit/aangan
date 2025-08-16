import knex from 'knex';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Set up __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, 'local.env') });

console.log('🔍 Initializing database...');
console.log(`Database path: ${process.env.DB_PATH || './whispers.db'}`);

// Database configuration
const dbConfig = {
  client: 'sqlite3',
  connection: {
    filename: process.env.DB_PATH || path.join(__dirname, 'whispers.db')
  },
  useNullAsDefault: true,
  debug: true
};

// Create Knex instance
const db = knex(dbConfig);

// Schema creation
async function createSchema() {
  try {
    // Check if users table exists
    const hasUsersTable = await db.schema.hasTable('users');
    
    if (!hasUsersTable) {
      console.log('🔄 Creating users table...');
      await db.schema.createTable('users', (table) => {
        table.increments('id').primary();
        table.string('email').unique().notNullable();
        table.string('password_hash').notNullable();
        table.string('name');
        table.string('role').defaultTo('user');
        table.boolean('is_verified').defaultTo(false);
        table.timestamp('last_login');
        table.timestamps(true, true);
      });
      console.log('✅ Created users table');
    } else {
      console.log('ℹ️  Users table already exists');
    }

    // Add more tables as needed
    // Example: whispers table
    const hasWhispersTable = await db.schema.hasTable('whispers');
    if (!hasWhispersTable) {
      console.log('🔄 Creating whispers table...');
      await db.schema.createTable('whispers', (table) => {
        table.increments('id').primary();
        table.integer('user_id').unsigned().references('id').inTable('users');
        table.string('content', 1000).notNullable();
        table.boolean('is_anonymous').defaultTo(false);
        table.timestamps(true, true);
      });
      console.log('✅ Created whispers table');
    } else {
      console.log('ℹ️  Whispers table already exists');
    }

    console.log('\n🎉 Database initialization complete!');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  } finally {
    // Close the database connection
    await db.destroy();
  }
}

// Run the schema creation
createSchema();
