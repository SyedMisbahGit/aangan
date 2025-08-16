// Minimal Vitest configuration for debugging
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 30000,
    include: ['backend/__tests__/minimal.test.js'],
  },
});
