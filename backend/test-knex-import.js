// Test direct knex import
console.log('Testing direct knex import...');

// Try to import knex directly
import knex from 'knex';

console.log('✅ Successfully imported knex module');
console.log('Knex version:', knex.VERSION);

// Test creating a simple Knex instance
const testKnex = knex({
  client: 'sqlite3',
  connection: {
    filename: ':memory:'
  },
  useNullAsDefault: true
});

console.log('✅ Successfully created Knex instance');

// Clean up
testKnex.destroy().then(() => {
  console.log('✅ Successfully destroyed Knex instance');
});
