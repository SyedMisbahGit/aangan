import knex from "knex";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProd = process.env.NODE_ENV === "production";

let dbConfig;

if (isProd) {
  // Production configuration (PostgreSQL)
  dbConfig = {
    client: "pg",
    connection: process.env.DATABASE_URL,
    pool: {
      min: 2,
      max: 8,
      idleTimeoutMillis: 30000,
      createTimeoutMillis: 3000,
      acquireTimeoutMillis: 30000,
      propagateCreateError: false
    },
    acquireConnectionTimeout: 5000,
    debug: false,
    asyncStackTraces: false,
  };
} else {
  // Development configuration (SQLite)
  const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'whispers.db');
  console.log(`Using SQLite database at: ${dbPath}`);
  
  dbConfig = {
    client: "sqlite3",
    connection: {
      filename: dbPath
    },
    useNullAsDefault: true,
    debug: true,
    asyncStackTraces: true,
  };
}

// Add logging configuration
const knexLogger = {
  warn: (msg) => console.warn(`[Knex Warning] ${msg}`),
  error: (msg) => console.error(`[Knex Error] ${msg}`),
  deprecate: (method, alternative) => 
    console.warn(`[Knex Deprecation] ${method} is deprecated, use ${alternative} instead`),
  debug: (msg) => console.debug(`[Knex Debug] ${msg}`)
};

dbConfig.log = knexLogger;

// Create the database connection
const db = knex(dbConfig);

// Add event listeners for connection errors
db.on('query-error', (error, obj) => {
  console.error('❌ Database query error:', error);
  console.error('Query details:', {
    sql: obj.sql,
    bindings: obj.bindings,
    method: obj.method,
    options: obj.options,
    __knexUid: obj.__knexUid,
    __knexQueryUid: obj.__knexQueryUid,
    __knexUid: obj.__knexUid
  });
  
  // Log detailed error information
  if (error.code) console.error('Error code:', error.code);
  if (error.errno) console.error('Error number:', error.errno);
  if (error.sqlMessage) console.error('SQL Message:', error.sqlMessage);
  if (error.sqlState) console.error('SQL State:', error.sqlState);
  if (error.sql) console.error('SQL Query:', error.sql);
  if (error.stack) console.error('Stack trace:', error.stack);
});

// Add event listener for successful queries
db.on('query', (query) => {
  console.log('📝 Database query:', {
    sql: query.sql,
    bindings: query.bindings,
    method: query.method,
    options: query.options,
    __knexUid: query.__knexUid,
    __knexQueryUid: query.__knexQueryUid
  });
});

// Test the database connection
const testConnection = async () => {
  try {
    console.log('🔍 Testing database connection...');
    console.log('Database configuration:', {
      client: dbConfig.client,
      connection: dbConfig.connection,
      useNullAsDefault: dbConfig.useNullAsDefault
    });
    
    // Test basic query
    const result = await db.raw('SELECT 1+1 as result');
    console.log('✅ Database connection test passed:', result.rows || result);
    
    // Check if the database file exists (for SQLite)
    if (dbConfig.client === 'sqlite3') {
      try {
        const dbPath = dbConfig.connection.filename;
        const fs = await import('fs');
        const dbExists = fs.existsSync(dbPath);
        console.log(`📁 Database file exists: ${dbExists} (${dbPath})`);
        
        if (!dbExists) {
          console.warn('⚠️  Database file does not exist. A new one will be created on first write.');
        } else {
          // Check if we can write to the database
          try {
            await db.raw('PRAGMA journal_mode = WAL;');
            console.log('✅ Database is writable');
          } catch (writeError) {
            console.error('❌ Database is not writable:', writeError);
            throw writeError;
          }
        }
      } catch (fsError) {
        console.error('❌ Error checking database file:', fsError);
        throw fsError;
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed');
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlMessage: error.sqlMessage,
      sqlState: error.sqlState,
      sql: error.sql,
      stack: error.stack
    });
    
    // Provide more helpful error messages for common issues
    if (error.code === 'ENOENT') {
      console.error('\n💡 The database file does not exist.');
      console.error('   Please make sure the database file exists at the specified path.');
    } else if (error.code === 'EACCES' || error.code === 'EPERM') {
      console.error('\n💡 Permission denied when accessing the database.');
      console.error('   Please check that the application has read/write permissions for the database file.');
    } else if (error.code === 'SQLITE_CANTOPEN') {
      console.error('\n💡 Cannot open the database file.');
      console.error('   This could be due to:');
      console.error('     1. The database file does not exist');
      console.error('     2. The application does not have permission to access the file');
      console.error('     3. The file path is incorrect');
      console.error('     4. The file is locked by another process');
    }
    
    throw error;
  }
};

// Run connection test
try {
  await testConnection();
} catch (error) {
  console.error('\n❌ Failed to connect to the database. Please check the error messages above for details.');
  process.exit(1);
}

export default db;
