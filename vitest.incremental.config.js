// Incremental Vitest configuration with additional settings
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Basic settings from minimal config that worked
    globals: true,
    environment: 'node',
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
    
    // Include test files
    include: [
      '**/__tests__/**/*.test.js',
      '**/__tests__/**/*.test.mjs',
      '**/__tests__/**/*.test.ts',
      '**/__tests__/**/*.spec.js',
      '**/__tests__/**/*.spec.mjs',
      '**/__tests__/**/*.spec.ts',
      'minimal-vitest-test.js',
    ],
    
    // Exclude files
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '**/.git/**',
      '**/test/**',
      '**/__tests__/test-utils/**',
      '**/__mocks__/**',
    ],
    
    // Coverage settings
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
