const knex = require('knex');
const path = require('path');

// SQLite configuration for local development
const dbConfig = {
  client: "sqlite3",
  connection: {
    filename: path.join(__dirname, 'whispers.db')
  },
  useNullAsDefault: true,
  debug: true
};

// Create the Knex instance
const db = knex(dbConfig);

// Test the database connection
async function testConnection() {
  try {
    console.log('🔌 Testing connection to SQLite database...');
    const result = await db.raw('SELECT 1 as test');
    console.log('✅ Connection test result:', result);
    
    // Test a simple query
    const count = await db('whispers').count('* as count').first();
    console.log('📊 Total whispers in database:', count.count);
    
    return true;
  } catch (error) {
    console.error('❌ Error testing database connection:', error);
    throw error;
  } finally {
    // Close the database connection
    await db.destroy();
    console.log('🔌 Database connection closed');
  }
}

// Run the test
testConnection()
  .then(() => console.log('\n🎉 Database connection test completed successfully!'))
  .catch(err => console.error('\n❌ Database connection test failed:', err));
