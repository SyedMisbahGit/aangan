// Simple script to check if test user exists and verify password hash
import dotenv from 'dotenv';
import knex from 'knex';
import path from 'path';
import { fileURLToPath } from 'url';

// Set up __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, 'local.env') });

console.log('🔍 Starting test user verification...');
console.log(`Database path: ${process.env.DB_PATH || './whispers.db'}`);

// Initialize Knex with SQLite configuration
const db = knex({
  client: 'sqlite3',
  connection: {
    filename: process.env.DB_PATH || './whispers.db'
  },
  useNullAsDefault: true,
  debug: true // Enable query logging
});

async function checkDatabase() {
  try {
    // Check if database file exists
    const dbFile = path.resolve(process.env.DB_PATH || './whispers.db');
    const fs = await import('fs');
    
    if (!fs.existsSync(dbFile)) {
      console.error(`❌ Database file not found at: ${dbFile}`);
      return false;
    }
    
    console.log(`✅ Database file exists at: ${dbFile}`);
    
    // Check if users table exists
    const tableExists = await db.schema.hasTable('users');
    if (!tableExists) {
      console.error('❌ Users table does not exist in the database');
      return false;
    }
    
    console.log('✅ Users table exists');
    return true;
  } catch (error) {
    console.error('❌ Error checking database:', error);
    return false;
  }
}

async function checkTestUser() {
  try {
    console.log('\n🔍 Checking for test user: test@example.com');
    
    // Get test user
    const testUser = await db('users')
      .where({ email: 'test@example.com' })
      .first();
    
    if (!testUser) {
      console.error('❌ Test user not found in the database');
      return false;
    }
    
    console.log('✅ Test user found in database:');
    console.log({
      id: testUser.id,
      email: testUser.email,
      password_hash: testUser.password_hash ? '*** (hash exists)' : '❌ No password hash',
      created_at: testUser.created_at,
      updated_at: testUser.updated_at
    });
    
    if (!testUser.password_hash) {
      console.error('❌ No password hash found for test user');
      return false;
    }
    
    // Check if password hash looks like a bcrypt hash
    const isBcryptHash = testUser.password_hash.startsWith('$2a$') && 
                         testUser.password_hash.length >= 60;
    
    console.log(`\n🔑 Password hash analysis:`);
    console.log(`- Format: ${isBcryptHash ? '✅ Valid bcrypt hash' : '❌ Not a valid bcrypt hash'}`);
    console.log(`- Length: ${testUser.password_hash.length} characters`);
    
    if (isBcryptHash) {
      try {
        // Test the password hash with bcrypt
        const bcrypt = await import('bcryptjs');
        const isPasswordValid = await bcrypt.compare('password123', testUser.password_hash);
        
        console.log(`\n🔑 Password verification result: ${isPasswordValid ? '✅ Valid password' : '❌ Invalid password'}`);
      } catch (bcryptError) {
        console.error('❌ Error during password verification:', bcryptError.message);
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error checking test user:', error.message);
    return false;
  }
}

async function main() {
  try {
    console.log('🔍 Starting database and test user verification...');
    
    const dbOk = await checkDatabase();
    if (!dbOk) {
      console.log('\n❌ Database verification failed');
      process.exit(1);
    }
    
    const userOk = await checkTestUser();
    if (!userOk) {
      console.log('\n❌ Test user verification failed');
      process.exit(1);
    }
    
    console.log('\n✅ Verification completed successfully');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  } finally {
    // Close the database connection
    await db.destroy();
  }
}

// Run the main function
main();
