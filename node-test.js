// Simple Node.js test file to check module resolution
console.log('Node.js test file running');
console.log('__dirname:', __dirname);
console.log('__filename:', __filename);

// Try to import a core module
const path = require('path');
console.log('Successfully required path module');
console.log('Current directory:', process.cwd());
