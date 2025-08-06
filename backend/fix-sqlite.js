// Script to fix SQLite3 native module issues
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Starting SQLite3 module fix...');
console.log(`Node.js version: ${process.version}`);
console.log(`Platform: ${process.platform} (${process.arch})`);

// Function to run shell commands
function runCommand(command, cwd = process.cwd()) {
  console.log(`\n🚀 Running: ${command}`);
  try {
    const result = execSync(command, { cwd, stdio: 'inherit' });
    return { success: true, result };
  } catch (error) {
    console.error(`❌ Command failed: ${command}`, error);
    return { success: false, error };
  }
}

// Main function
async function fixSqlite() {
  console.log('\n🔍 Checking for node_modules/sqlite3...');
  const sqlite3Path = path.join(__dirname, 'node_modules', 'sqlite3');
  
  if (fs.existsSync(sqlite3Path)) {
    console.log('✅ Found sqlite3 module');
    
    // Rebuild sqlite3
    console.log('\n🔨 Rebuilding sqlite3 module...');
    const { success: rebuildSuccess } = runCommand('npm rebuild sqlite3 --build-from-source --sqlite_libname=sqlite3 --sqlite=./node_modules/sqlite3', __dirname);
    
    if (rebuildSuccess) {
      console.log('\n✅ Successfully rebuilt sqlite3 module');
    } else {
      console.log('\n⚠️ Failed to rebuild sqlite3 module. Trying alternative approach...');
      
      // Try reinstalling sqlite3 completely
      console.log('\n🔄 Reinstalling sqlite3...');
      const { success: reinstallSuccess } = runCommand('npm uninstall sqlite3 && npm install sqlite3@5.1.7 --build-from-source --sqlite_libname=sqlite3 --sqlite=./node_modules/sqlite3', __dirname);
      
      if (!reinstallSuccess) {
        console.error('\n❌ Failed to reinstall sqlite3 module');
        return false;
      }
    }
  } else {
    console.log('\n🔍 sqlite3 module not found. Installing...');
    const { success: installSuccess } = runCommand('npm install sqlite3@5.1.7 --build-from-source --sqlite_libname=sqlite3', __dirname);
    
    if (!installSuccess) {
      console.error('\n❌ Failed to install sqlite3 module');
      return false;
    }
  }
  
  // Verify the installation
  console.log('\n🔍 Verifying sqlite3 installation...');
  try {
    const sqlite3 = (await import('sqlite3')).default;
    console.log('✅ sqlite3 module loaded successfully');
    
    // Test basic SQLite functionality
    const db = new sqlite3.Database(':memory:');
    return new Promise((resolve) => {
      db.serialize(() => {
        db.run("CREATE TABLE test (id INT, name TEXT)");
        db.run("INSERT INTO test VALUES (1, 'test')");
        db.get("SELECT * FROM test", (err, row) => {
          if (err) {
            console.error('❌ SQLite test query failed:', err);
            resolve(false);
          } else {
            console.log('✅ SQLite test query successful:', row);
            db.close();
            resolve(true);
          }
        });
      });
    });
  } catch (error) {
    console.error('❌ Failed to load sqlite3 module:', error);
    return false;
  }
}

// Run the fix
fixSqlite()
  .then(success => {
    if (success) {
      console.log('\n✨ SQLite3 module is now working correctly!');
      console.log('You can now try running the backend server again.');
    } else {
      console.log('\n❌ Failed to fix SQLite3 module. Please check the error messages above.');
      console.log('\nNext steps:');
      console.log('1. Try running this script as Administrator');
      console.log('2. Make sure you have Python and Visual C++ Build Tools installed');
      console.log('3. Try using an LTS version of Node.js (e.g., v20.x)');
      console.log('4. If all else fails, consider using PostgreSQL instead of SQLite');
    }
  })
  .catch(error => {
    console.error('Unhandled error:', error);
  });
