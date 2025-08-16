// Script to check users in the database
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

async function checkUsers() {
  try {
    console.log('Checking users in the database...');
    
    // Check if users table exists
    const tableExists = await db.schema.hasTable('users');
    if (!tableExists) {
      console.log('Users table does not exist in the database.');
      return;
    }
    
    // Get all users
    const users = await db('users').select('*');
    
    if (users.length === 0) {
      console.log('No users found in the database.');
      console.log('You may need to create a test user.');
    } else {
      console.log(`Found ${users.length} user(s) in the database:`);
      users.forEach((user, index) => {
        console.log(`\nUser #${index + 1}:`);
        console.log(`  ID: ${user.id}`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Username: ${user.username || 'N/A'}`);
        console.log(`  Created At: ${user.created_at}`);
        console.log(`  Last Login: ${user.last_login || 'Never'}`);
      });
    }
  } catch (error) {
    console.error('Error checking users:', error);
  } finally {
    // Close the database connection
    await db.destroy();
  }
}

// Run the function
checkUsers();
