const dotenv = require('dotenv');
dotenv.config();

const config = {
  client: process.env.NODE_ENV === 'production' ? 'pg' : 'sqlite3',
  connection: process.env.NODE_ENV === 'production'
    ? process.env.DATABASE_URL
    : {
        filename: process.env.DB_PATH || './whispers.db',
      },
  useNullAsDefault: process.env.NODE_ENV !== 'production',
  migrations: {
    directory: './migrations',
  },
  seeds: {
    directory: './seeds',
  },
};

module.exports = config; 