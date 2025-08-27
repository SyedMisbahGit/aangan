/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node', // Start with node environment (simpler than jsdom)
    include: ['src/test/simple-test.ts'],
    watch: false,
    silent: false,
    logHeapUsage: true,
    testTimeout: 5000,
    open: false,
    reporters: 'verbose',
    watchExclude: ['**/node_modules/**', '**/dist/**'],
  },
});
