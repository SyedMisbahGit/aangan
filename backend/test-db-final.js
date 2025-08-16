// Test the final db.js with all features
console.log('Testing final db.js with all features...');

// Try to import the final db module
import db from './src/db-final.js';

console.log('✅ Successfully imported final db module');
console.log('DB client type:', db.client);
console.log('Environment:', process.env.NODE_ENV || 'development');

// Test a simple query after the connection is established
async function testQuery() {
  try {
    const [rows] = await db.raw('SELECT 1+1 as result');
    console.log('✅ Simple query result:', rows[0]);
    
    // Test a table creation
    await db.schema.dropTableIfExists('test_table');
    await db.schema.createTable('test_table', (table) => {
      table.increments('id');
      table.string('name');
    });
    console.log('✅ Successfully created test_table');
    
    // Insert a test row
    await db('test_table').insert({ name: 'test' });
    console.log('✅ Successfully inserted test row');
    
    // Query the test row
    const results = await db('test_table').select('*');
    console.log('✅ Test table contents:', results);
    
    return true;
  } catch (error) {
    console.error('❌ Test query failed:', error);
    throw error;
  } finally {
    // Clean up
    await db.destroy();
    console.log('✅ Database connection closed');
  }
}

// Run the test
testQuery()
  .then(() => console.log('✅ All tests completed successfully'))
  .catch(err => console.error('❌ Tests failed:', err));
