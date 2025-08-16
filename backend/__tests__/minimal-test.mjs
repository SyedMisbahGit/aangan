// Minimal test file to verify Vitest with ESM
import { test, expect } from 'vitest';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('should pass a basic test', () => {
  expect(1 + 1).toBe(2);
});

test('should be able to use ES modules', () => {
  const obj = { a: 1 };
  expect(obj).toHaveProperty('a', 1);
});
