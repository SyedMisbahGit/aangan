// Test script to debug module loading issues
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testModuleLoading() {
  const modulePath = './src/routes/auth.js';
  const fullPath = path.resolve(__dirname, modulePath);
  
  console.log(`\n🔍 Testing module loading for: ${fullPath}`);
  
  try {
    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      throw new Error(`File not found: ${fullPath}`);
    }
    
    console.log('✅ File exists');
    
    // Read file content
    const fileContent = fs.readFileSync(fullPath, 'utf8');
    console.log('\n📄 File content (first 200 chars):');
    console.log(fileContent.substring(0, 200) + '...');
    
    // Check for export default in file content
    const hasDefaultExport = fileContent.includes('export default');
    console.log(`\n🔍 Has 'export default': ${hasDefaultExport ? '✅ Yes' : '❌ No'}`);
    
    // Try to import the module using file:// URL
    console.log('\n🔄 Attempting to import module...');
    const modulePath = new URL(fullPath, 'file:///').href;
    console.log(`Importing from: ${modulePath}`);
    const module = await import(modulePath);
    
    console.log('\n📦 Module imported successfully. Module keys:');
    console.log(Object.keys(module));
    
    // Check for default export
    if (module.default) {
      console.log('\n✅ Module has a default export:', module.default);
      
      // Check if it's a router
      if (typeof module.default === 'function' && 
          typeof module.default.get === 'function' && 
          typeof module.default.post === 'function') {
        console.log('✅ Default export appears to be an Express Router');
      } else {
        console.log('⚠️ Default export does not appear to be an Express Router');
      }
    } else {
      console.log('\n❌ Module does not have a default export');
    }
    
    return true;
  } catch (error) {
    console.error('\n❌ Error loading module:');
    console.error('Name:', error.name);
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    console.error('Stack:', error.stack);
    
    // Check for common issues
    if (error.code === 'ERR_MODULE_NOT_FOUND') {
      console.error('\n🔍 The module or one of its dependencies could not be found');
      const match = error.message.match(/Cannot find module '([^']+)'/);
      if (match) {
        console.error(`Missing module: ${match[1]}`);
      }
    }
    
    return false;
  }
}

// Run the test
testModuleLoading()
  .then(success => {
    console.log(`\n${success ? '✅' : '❌'} Module loading test ${success ? 'succeeded' : 'failed'}`);
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unhandled error in test script:', error);
    process.exit(1);
  });
