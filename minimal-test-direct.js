// Minimal test file to run directly with Node.js
import { describe, it, expect } from 'vitest';

describe('Direct ESM Test', () => {
  it('should pass a basic test', () => {
    expect(1 + 1).toBe(2);
  });
});

// Run the tests if this file is executed directly
if (import.meta.vitest) {
  const { run } = await import('vitest/run');
  run();
}
