// Script to inspect the test user in the database
import knex from 'knex';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

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

async function inspectTestUser() {
  try {
    console.log('Inspecting test user in the database...');
    
    // Check if users table exists
    const tableExists = await db.schema.hasTable('users');
    if (!tableExists) {
      console.error('❌ Users table does not exist!');
      return;
    }
    
    // Get all users
    const users = await db('users').select('*');
    
    if (users.length === 0) {
      console.log('No users found in the database.');
    } else {
      console.log(`\nFound ${users.length} user(s) in the database:`);
      users.forEach((user, index) => {
        console.log(`\nUser #${index + 1}:`);
        console.log(`  ID: ${user.id}`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Username: ${user.username || 'N/A'}`);
        console.log(`  Password Hash: ${user.password_hash}`);
        console.log(`  Is Verified: ${user.is_verified}`);
        console.log(`  Created At: ${user.created_at}`);
        console.log(`  Last Login: ${user.last_login || 'Never'}`);
      });
    }
    
    // Check if we can find the test user specifically
    const testEmail = 'test@example.com';
    const testUser = await db('users').where({ email: testEmail }).first();
    
    if (testUser) {
      console.log('\n🔍 Test user details:');
      console.log(JSON.stringify(testUser, null, 2));
      
      // Check if password hash looks valid
      const isBcryptHash = testUser.password_hash.match(/^\$2[aby]\$\d{2}\$[.\/0-9A-Za-z]{53}$/);
      console.log(`\n🔑 Password hash validation:`);
      console.log(`  Hash format looks valid: ${isBcryptHash ? '✅' : '❌'}`);
      
      if (!isBcryptHash) {
        console.log('  WARNING: The password hash does not appear to be a valid bcrypt hash.');
        console.log('  This is likely why login is failing.');
      }
    } else {
      console.log(`\n❌ Test user with email ${testEmail} not found!`);
    }
    
  } catch (error) {
    console.error('Error inspecting test user:', error);
  } finally {
    // Close the database connection
    await db.destroy();
  }
}

// Run the function
inspectTestUser();
