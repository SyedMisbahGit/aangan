console.log('Node.js version:', process.version);
console.log('Current directory:', process.cwd());

// Simple test
console.log('1 + 1 =', 1 + 1);

// Test if we can require Vitest
try {
  const vitest = require('vitest');
  console.log('Vitest version:', vitest.version);
} catch (error) {
  console.error('Failed to require vitest:', error);
}
