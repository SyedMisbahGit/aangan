// Test script to debug ESM import issues
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the auth module
const authModulePath = './src/routes/auth.js';
const fullPath = path.resolve(__dirname, authModulePath);

console.log(`🔍 Testing ESM import for: ${fullPath}`);

// Test 1: Check if file exists and is readable
try {
  if (!fs.existsSync(fullPath)) {
    throw new Error(`File not found: ${fullPath}`);
  }
  console.log('✅ File exists and is readable');
} catch (error) {
  console.error('❌ File check failed:', error.message);
  process.exit(1);
}

// Test 2: Read file content
try {
  const fileContent = fs.readFileSync(fullPath, 'utf8');
  console.log('✅ File content can be read');
  
  // Check for export default in file content
  const hasDefaultExport = fileContent.includes('export default');
  console.log(`🔍 File contains 'export default': ${hasDefaultExport ? '✅ Yes' : '❌ No'}`);
} catch (error) {
  console.error('❌ Error reading file content:', error.message);
  process.exit(1);
}

// Test 3: Dynamic import with relative path
console.log('\n🔄 Testing dynamic import with relative path...');
try {
  const module = await import(authModulePath);
  console.log('✅ Dynamic import with relative path succeeded');
  console.log('Module keys:', Object.keys(module));
  if (module.default) {
    console.log('✅ Module has default export');
  } else {
    console.log('❌ Module does not have default export');
  }
} catch (error) {
  console.error('❌ Dynamic import with relative path failed:', error.message);
  console.error('Error code:', error.code);
}

// Test 4: Dynamic import with full path
console.log('\n🔄 Testing dynamic import with full path...');
try {
  const module = await import(fullPath);
  console.log('✅ Dynamic import with full path succeeded');
  console.log('Module keys:', Object.keys(module));
} catch (error) {
  console.error('❌ Dynamic import with full path failed:', error.message);
  console.error('Error code:', error.code);
}

// Test 5: Dynamic import with file URL
console.log('\n🔄 Testing dynamic import with file URL...');
try {
  const fileUrl = new URL(`file://${fullPath.replace(/\\/g, '/')}`);
  console.log(`Importing from: ${fileUrl}`);
  const module = await import(fileUrl);
  console.log('✅ Dynamic import with file URL succeeded');
  console.log('Module keys:', Object.keys(module));
} catch (error) {
  console.error('❌ Dynamic import with file URL failed:', error.message);
  console.error('Error code:', error.code);
  if (error.code === 'ERR_UNSUPPORTED_ESM_URL_SCHEME') {
    console.error('\n⚠️  Your Node.js version may not support file:// URL scheme for dynamic imports');
  }
}

// Test 6: Try using createRequire for CJS-style require
console.log('\n🔄 Testing CJS-style require with createRequire...');
try {
  const { createRequire } = require('module');
  const requireModule = createRequire(import.meta.url);
  const module = requireModule(fullPath);
  console.log('✅ CJS-style require succeeded');
  console.log('Module exports:', Object.keys(module));
} catch (error) {
  console.error('❌ CJS-style require failed:', error.message);
  console.error('Error code:', error.code);
}

console.log('\n🔍 Test completed');
