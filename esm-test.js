// Simple ESM test file to check module resolution
console.log('ESM test file running');
console.log('import.meta.url:', import.meta.url);

// Try to import a core module
import { fileURLToPath } from 'url';
console.log('Successfully imported from url module');

// Try to import a local file
// import { InMemoryPubSub } from './backend/test-in-memory-pubsub.js';
// console.log('Successfully imported InMemoryPubSub');

// Try to import a dependency
import { vi } from 'vitest';
console.log('Successfully imported from vitest');

console.log('ESM test completed successfully');
