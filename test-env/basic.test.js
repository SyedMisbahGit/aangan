// Basic test to verify Vitest works
import { test, expect } from 'vitest';

test('basic test', () => {
  expect(1 + 1).toBe(2);
});

test('object test', () => {
  const obj = { a: 1 };
  expect(obj).toHaveProperty('a', 1);
});
