// Basic test to verify Vitest works with ESM
import { describe, it, expect } from 'vitest';

describe('Basic Test Suite', () => {
  it('should pass a basic assertion', () => {
    expect(1 + 1).toBe(2);
  });

  it('should work with async/await', async () => {
    const result = await Promise.resolve('test');
    expect(result).toBe('test');
  });
});
