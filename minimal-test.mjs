// Minimal test file with .mjs extension to ensure ESM
import { test, expect } from 'vitest';

// Simple test case
test('simple test', () => {
  expect(1 + 1).toBe(2);
});

// Log module information
console.log('ESM import.meta.url:', import.meta.url);
console.log('ESM import.meta.resolve:', import.meta.resolve);
