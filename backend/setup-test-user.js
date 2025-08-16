// Script to set up the users table and create a test user
import knex from 'knex';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Set up __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, 'local.env') });

// Database configuration
const db = knex({
  client: 'sqlite3',
  connection: {
    filename: process.env.DB_PATH || './whispers.db',
  },
  useNullAsDefault: true,
  debug: true
});

async function setupTestUser() {
  try {
    console.log('Setting up test user...');
    
    // Check if users table exists, if not create it
    const tableExists = await db.schema.hasTable('users');
    
    if (!tableExists) {
      console.log('Creating users table...');
      await db.schema.createTable('users', (table) => {
        table.increments('id').primary();
        table.string('email').unique().notNullable();
        table.string('username').unique().notNullable();
        table.string('password_hash').notNullable();
        table.string('role').defaultTo('user');
        table.boolean('is_verified').defaultTo(true);
        table.timestamp('email_verified_at').nullable();
        table.string('verification_token').nullable();
        table.string('reset_password_token').nullable();
        table.timestamp('reset_password_expires').nullable();
        table.timestamp('last_login').nullable();
        table.timestamps(true, true);
      });
      console.log('Users table created successfully.');
    } else {
      console.log('Users table already exists.');
    }
    
    // Check if test user already exists
    const testEmail = 'test@example.com';
    const existingUser = await db('users').where({ email: testEmail }).first();
    
    if (existingUser) {
      console.log('Test user already exists:');
      console.log(`  ID: ${existingUser.id}`);
      console.log(`  Email: ${existingUser.email}`);
      console.log(`  Username: ${existingUser.username}`);
      return;
    }
    
    // Create test user
    console.log('Creating test user...');
    const testPassword = 'password123';
    const passwordHash = await bcrypt.hash(testPassword, 10);
    
    const [userId] = await db('users').insert({
      email: testEmail,
      username: 'testuser',
      password_hash: passwordHash,
      role: 'admin',
      is_verified: true,
      email_verified_at: new Date(),
      created_at: new Date(),
      updated_at: new Date()
    });
    
    console.log('Test user created successfully!');
    console.log('You can now log in with:');
    console.log(`  Email: ${testEmail}`);
    console.log(`  Password: ${testPassword}`);
    
  } catch (error) {
    console.error('Error setting up test user:', error);
  } finally {
    // Close the database connection
    await db.destroy();
  }
}

// Run the function
setupTestUser();
