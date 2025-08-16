// Minimal test case to verify Vitest is working
import { test, expect, vi } from 'vitest';

// A simple test
const sum = (a, b) => a + b;

// A simple mock
export const mockFn = vi.fn();

test('should pass', () => {
  expect(sum(1, 2)).toBe(3);
});

test('mock should work', () => {
  mockFn();
  expect(mockFn).toHaveBeenCalled();
});
