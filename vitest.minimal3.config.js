// Minimal Vitest configuration
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['minimal-vitest-test.js'],
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
