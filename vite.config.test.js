// Minimal Vitest configuration for the main project
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Basic settings
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
    
    // Test file patterns
    include: [
      '**/__tests__/**/*.test.js',
      '**/__tests__/**/*.test.ts',
      '**/__tests__/**/*.spec.js',
      '**/__tests__/**/*.spec.ts',
      '**/*.test.js',
      '**/*.test.ts',
      '**/*.spec.js',
      '**/*.spec.ts',
    ],
    
    // Exclude patterns
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '**/.git/**',
      '**/test/**',
      '**/__tests__/test-utils/**',
      '**/__mocks__/**',
    ],
    
    // Test timeouts
    testTimeout: 30000,
    hookTimeout: 30000,
    teardownTimeout: 30000,
    
    // Coverage settings (if needed)
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
