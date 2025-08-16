// Minimal Node.js test file with no dependencies
console.log('Minimal test file running');
console.log('Process info:');
console.log('- Node.js version:', process.version);
console.log('- Platform:', process.platform);
console.log('- Current working directory:', process.cwd());
console.log('- Environment variables:');
console.log('  - NODE_OPTIONS:', process.env.NODE_OPTIONS || 'Not set');
console.log('  - NODE_ENV:', process.env.NODE_ENV || 'Not set');

// Simple test
const result = 1 + 1;
console.log('1 + 1 =', result);

// Test complete
console.log('Minimal test completed successfully');
