import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
(globalThis as { IntersectionObserver?: typeof IntersectionObserver }).IntersectionObserver = class IntersectionObserver {
  // Empty constructor is intentional for test mocks
  constructor() { /* noop */ }
  // Empty methods are intentional for test mocks
  disconnect() { /* noop */ }
  observe() { /* noop */ }
  unobserve() { /* noop */ }
  root: Element | null = null;
  rootMargin: string = '';
  thresholds: ReadonlyArray<number> = [];
  takeRecords() { return []; }
};

// Mock ResizeObserver
(globalThis as { ResizeObserver?: typeof ResizeObserver }).ResizeObserver = class ResizeObserver {
  // Empty constructor is intentional for test mocks
  constructor() { /* noop */ }
  // Empty methods are intentional for test mocks
  disconnect() { /* noop */ }
  observe() { /* noop */ }
  unobserve() { /* noop */ }
}; 