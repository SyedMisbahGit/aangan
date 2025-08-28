import { afterAll } from 'vitest';
import { cleanupTestData } from './test-utils.js';

// Global test setup can go here

// Clean up test data after all tests have run
afterAll(async () => {
  await cleanupTestData();
});
