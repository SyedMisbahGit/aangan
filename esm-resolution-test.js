// Test file to check ESM module resolution
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

console.log('ESM Resolution Test');
console.log('==================');

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Current file:', __filename);
console.log('Current directory:', __dirname);

// Try to resolve a module
const vitestPath = resolve(__dirname, 'node_modules/vitest/package.json');
console.log('Vitest package path:', vitestPath);

// Try to import a local file
console.log('\nAttempting to import local file...');
try {
  const localModule = await import('./minimal-test-simple.js');
  console.log('✅ Successfully imported local module');
} catch (error) {
  console.error('❌ Failed to import local module:', error.message);
}

// Try to import a dependency
console.log('\nAttempting to import dependency...');
try {
  const vitest = await import('vitest');
  console.log('✅ Successfully imported vitest');
} catch (error) {
  console.error('❌ Failed to import vitest:', error.message);
}

console.log('\nTest completed');
