// Simple test script to check basic functionality
console.log('Starting simple test...');

// Test 1: Basic Node.js functionality
try {
  console.log('Test 1: Basic Node.js functionality - PASSED');
} catch (error) {
  console.error('Test 1: Basic Node.js functionality - FAILED', error);
}

// Test 2: Environment variables
try {
  const dotenv = await import('dotenv');
  dotenv.config();
  console.log('Test 2: dotenv import and config - PASSED');
  console.log('  NODE_ENV:', process.env.NODE_ENV || 'Not set');
} catch (error) {
  console.error('Test 2: dotenv import and config - FAILED', error);
}

// Test 3: Basic file system operations
try {
  const fs = await import('fs');
  const path = await import('path');
  const currentDir = process.cwd();
  console.log('Test 3: File system operations - PASSED');
  console.log('  Current directory:', currentDir);
  
  // Check if package.json exists
  const packagePath = path.join(currentDir, 'package.json');
  if (fs.existsSync(packagePath)) {
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
    console.log('  Package name:', pkg.name);
    console.log('  Package version:', pkg.version);
  } else {
    console.log('  package.json not found in:', currentDir);
  }
} catch (error) {
  console.error('Test 3: File system operations - FAILED', error);
}

// Test 4: Database connection (simplified)
try {
  console.log('Test 4: Attempting to import Knex...');
  const knex = await import('knex');
  console.log('  Knex imported successfully');
  
  console.log('  Creating Knex configuration...');
  const config = {
    client: 'sqlite3',
    connection: {
      filename: './test-whisper.db'
    },
    useNullAsDefault: true,
    debug: true
  };
  
  console.log('  Initializing Knex...');
  const db = knex.default(config);
  
  console.log('  Testing database connection...');
  const result = await db.raw('SELECT 1+1 as result');
  console.log('  Test query result:', result);
  
  console.log('Test 4: Database connection - PASSED');
  
  // Close the connection
  await db.destroy();
} catch (error) {
  console.error('Test 4: Database connection - FAILED');
  console.error('  Error details:', error.message);
  if (error.code) console.error('  Error code:', error.code);
  if (error.errno) console.error('  Error number:', error.errno);
  if (error.syscall) console.error('  System call:', error.syscall);
  if (error.path) console.error('  Path:', error.path);
}

console.log('\nTest script completed.');
