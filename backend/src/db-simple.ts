// Simplified version of db.ts to isolate the issue
import knex from 'knex';

const config = {
  client: 'sqlite3',
  connection: {
    filename: './test.db',
  },
  useNullAsDefault: true,
};

const db = knex(config);
export { db };
export default db;
