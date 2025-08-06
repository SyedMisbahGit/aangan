// Minimal test script to check SQLite3 functionality
console.log('🚀 Starting minimal SQLite3 test...');

async function testSqlite() {
  try {
    // Test basic SQLite3 functionality
    console.log('1. Testing direct SQLite3 import...');
    const sqlite3 = (await import('sqlite3')).default;
    console.log('✅ SQLite3 module imported successfully');
    
    // Test creating an in-memory database
    console.log('\n2. Testing in-memory database...');
    const db = new sqlite3.Database(':memory:');
    
    // Test basic SQL operations
    await new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run('CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)', (err) => {
          if (err) return reject(err);
          console.log('✅ Created test table');
          
          db.run("INSERT INTO test (name) VALUES ('test')", function(err) {
            if (err) return reject(err);
            console.log(`✅ Inserted test row with ID: ${this.lastID}`);
            
            db.get("SELECT * FROM test", (err, row) => {
              if (err) return reject(err);
              console.log('✅ Retrieved test row:', row);
              
              db.close(err => {
                if (err) return reject(err);
                console.log('✅ Database connection closed');
                resolve();
              });
            });
          });
        });
      });
    });
    
    console.log('\n✅ All SQLite3 tests passed!');
    return true;
  } catch (error) {
    console.error('\n❌ SQLite3 test failed:', error);
    console.error('Error details:', {
      code: error.code,
      errno: error.errno,
      syscall: error.syscall,
      path: error.path,
      message: error.message
    });
    return false;
  }
}

// Run the test
testSqlite()
  .then(success => {
    if (success) {
      console.log('\n✨ SQLite3 is working correctly!');
    } else {
      console.log('\n❌ SQLite3 test failed. Please check the error messages above.');
      console.log('\nTroubleshooting steps:');
      console.log('1. Try running: npm rebuild sqlite3 --build-from-source');
      console.log('2. Try installing a specific version: npm install sqlite3@5.1.7');
      console.log('3. Try using Node.js LTS version (e.g., v20.x)');
      console.log('4. Consider using PostgreSQL instead of SQLite');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unhandled error in test script:', error);
    process.exit(1);
  });
