import bcrypt from 'bcryptjs';
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
const dbConfig = {
  client: 'sqlite3',
  connection: {
    filename: process.env.DB_PATH || path.join(__dirname, 'whispers.db')
  },
  useNullAsDefault: true
};

// Create Knex instance
const db = knex(dbConfig);

// Test user data
const testUser = {
  email: 'test@example.com',
  password: 'password123',
  name: 'Test User'
};

async function createTestUser() {
  try {
    console.log('🔍 Checking for existing test user...');
    
    // Check if user already exists
    const existingUser = await db('users').where({ email: testUser.email }).first();
    
    if (existingUser) {
      console.log('ℹ️  Test user already exists. Updating password...');
      // Update password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(testUser.password, salt);
      
      await db('users')
        .where({ email: testUser.email })
        .update({ 
          password_hash: passwordHash,
          updated_at: db.fn.now()
        });
      
      console.log('✅ Test user password updated successfully');
    } else {
      console.log('🔄 Creating test user...');
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(testUser.password, salt);
      
      // Insert test user
      await db('users').insert({
        email: testUser.email,
        password_hash: passwordHash,
        name: testUser.name,
        role: 'admin',
        is_verified: true,
        created_at: db.fn.now(),
        updated_at: db.fn.now()
      });
      
      console.log('✅ Test user created successfully');
    }
    
    // Verify the user was created/updated
    const user = await db('users').where({ email: testUser.email }).first();
    console.log('\n👤 Test User Details:');
    console.log(`ID: ${user.id}`);
    console.log(`Email: ${user.email}`);
    console.log(`Name: ${user.name}`);
    console.log(`Role: ${user.role}`);
    console.log(`Verified: ${user.is_verified ? '✅' : '❌'}`);
    console.log(`Created: ${user.created_at}`);
    console.log(`Updated: ${user.updated_at}`);
    
    console.log('\n🔑 Test credentials:');
    console.log(`Email: ${testUser.email}`);
    console.log(`Password: ${testUser.password}`);
    
  } catch (error) {
    console.error('❌ Error creating test user:', error);
    process.exit(1);
  } finally {
    // Close the database connection
    await db.destroy();
  }
}

// Run the function
createTestUser();
