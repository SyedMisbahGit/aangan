import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./__tests__/vitest.setup.js'],
    testTimeout: 10000, // 10 second timeout for tests
    include: ['**/__tests__/**/*.test.js'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '**/.next/**',
      '**/.git/**',
    ],
    logHeapUsage: true,
    clearMocks: true,
    restoreMocks: true,
    mockReset: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      all: true,
      include: ['src/**/*.js'],
      exclude: [
        '**/*.test.js',
        '**/__tests__/**',
        '**/__mocks__/**',
        '**/test-utils/**',
        '**/test-db.js',
        '**/config/**',
        '**/migrations/**',
        '**/seeds/**',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
