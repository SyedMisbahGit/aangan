import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node', // Start with node environment (simpler than jsdom)
    include: ['src/test/simple.test.ts'],
    watch: false,
    silent: false,
    logHeapUsage: true,
    testTimeout: 5000,
    open: false,
    reporters: 'verbose',
    watchExclude: ['**/node_modules/**', '**/dist/**'],
    // Disable all transforms for debugging
    transformMode: {
      web: ['.*']
    },
    // Disable all coverage for now
    coverage: {
      enabled: false
    },
    // Disable all mocks for now
    mockReset: false,
    // Disable all snapshots for now
    snapshotFormat: {
      printBasicPrototype: true
    },
    // Disable all type checking for now
    typecheck: {
      enabled: false
    }
  },
});
