// Minimal Vitest configuration for debugging
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
    },
    testTimeout: 30000,
    hookTimeout: 30000,
    teardownTimeout: 30000,
    watchExclude: ['**/node_modules/**', '**/dist/**', '**/.git/**'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/coverage/**',
        '**/test/**',
        '**/__tests__/test-utils/**',
        '**/__mocks__/**',
        '**/*.config.js',
        '**/*.cjs',
        '**/*.mjs',
      ],
    },
  },
});
