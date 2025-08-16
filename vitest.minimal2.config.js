// Minimal Vitest configuration for debugging
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 30000,
    include: ['minimal-test-simple.js'],
    watch: false,
    threads: false,
    isolate: false,
    passWithNoTests: true,
    logHeapUsage: true,
    clearMocks: true,
    mockReset: true,
    restoreMocks: true,
    setupFiles: [],
    globalSetup: [],
    deps: {
      inline: ['vitest']
    }
  },
});
