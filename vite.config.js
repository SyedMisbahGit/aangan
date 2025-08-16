import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'node', // Use 'jsdom' for browser-like environment if needed
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
    testTimeout: 30000, // Increase timeout for tests
  },
});
