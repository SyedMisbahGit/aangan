// Test script for Knex.js integration with SQLite3
import knex from 'knex';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

// Set up __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, 'local.env') });

console.log('🚀 Starting Knex.js integration test...');
console.log(`Node.js version: ${process.version}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`DB_PATH: ${process.env.DB_PATH || 'Not set (using default)'}`);

// Test database configuration
const testDbPath = path.join(__dirname, 'test-knex.db');
console.log(`Using test database: ${testDbPath}`);

const config = {
  client: 'sqlite3',
  connection: {
    filename: testDbPath
  },
  useNullAsDefault: true,
  debug: true,
  log: {
    warn: (msg) => console.warn(`[Knex Warning] ${msg}`),
    error: (msg) => console.error(`[Knex Error] ${msg}`),
    deprecate: (method, alternative) => 
      console.warn(`[Knex Deprecation] ${method} is deprecated, use ${alternative} instead`),
    debug: (msg) => console.log(`[Knex Debug] ${msg}`)
  }
};

async function testKnex() {
  let db;
  
  try {
    // Initialize Knex
    console.log('\n1. Initializing Knex...');
    db = knex(config);
    
    // Test connection
    console.log('\n2. Testing database connection...');
    const result = await db.raw('SELECT 1+1 as result');
    console.log('✅ Connection test query result:', result);
    
    // Create a test table
    console.log('\n3. Creating test table...');
    if (await db.schema.hasTable('knex_test')) {
      await db.schema.dropTable('knex_test');
    }
    
    await db.schema.createTable('knex_test', (table) => {
      table.increments('id').primary();
      table.string('name');
      table.timestamps(true, true);
    });
    console.log('✅ Created test table');
    
    // Insert test data
    console.log('\n4. Inserting test data...');
    const [insertId] = await db('knex_test').insert({ name: 'Test Record' });
    console.log(`✅ Inserted test record with ID: ${insertId}`);
    
    // Query test data
    console.log('\n5. Querying test data...');
    const records = await db('knex_test').select('*');
    console.log('✅ Retrieved test records:', records);
    
    return true;
  } catch (error) {
    console.error('\n❌ Knex test failed:', error);
    
    // Log detailed error information
    if (error.code) console.error('Error code:', error.code);
    if (error.errno) console.error('Error number:', error.errno);
    if (error.sql) console.error('SQL:', error.sql);
    if (error.sqlMessage) console.error('SQL Message:', error.sqlMessage);
    if (error.sqlState) console.error('SQL State:', error.sqlState);
    
    return false;
  } finally {
    // Clean up
    if (db) {
      try {
        // Drop test table if it exists
        if (await db.schema.hasTable('knex_test')) {
          await db.schema.dropTable('knex_test');
        }
        
        // Close the connection
        await db.destroy();
        console.log('\n✅ Database connection closed');
      } catch (cleanupError) {
        console.error('Error during cleanup:', cleanupError);
      }
    }
    
    // Delete the test database file
    try {
      const fs = await import('fs');
      if (fs.existsSync(testDbPath)) {
        fs.unlinkSync(testDbPath);
        console.log('✅ Test database file removed');
      }
    } catch (fsError) {
      console.warn('Could not remove test database file:', fsError.message);
    }
  }
}

// Run the test
testKnex()
  .then(success => {
    if (success) {
      console.log('\n✨ Knex.js integration test passed successfully!');
      console.log('The issue might be in the backend application code, not in Knex or SQLite3.');
    } else {
      console.log('\n❌ Knex.js integration test failed.');
      console.log('\nTroubleshooting steps:');
      console.log('1. Check if SQLite3 is properly installed: npm list sqlite3');
      console.log('2. Try reinstalling Knex: npm uninstall knex && npm install knex');
      console.log('3. Try using a different version of Knex (check package.json for version)');
      console.log('4. Consider using PostgreSQL for production environments');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unhandled error in test script:', error);
    process.exit(1);
  });
