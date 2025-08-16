import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/__tests__/**/*.test.{js,mjs,ts}'],
    testTimeout: 30000,
    setupFiles: ['./vitest.setup.js'],
    coverage: {
      provider: 'v8',
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
