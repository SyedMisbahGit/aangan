// Import necessary testing utilities
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi, expect } from 'vitest';

// Mock window.matchMedia which is not implemented in JSDOM
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => {
    const listeners: Array<() => void> = [];
    return {
      matches: false,
      media: query,
      onchange: null,
      // Deprecated methods
      addListener: vi.fn((listener: () => void) => {
        listeners.push(listener);
      }),
      removeListener: vi.fn((listener: () => void) => {
        const index = listeners.indexOf(listener);
        if (index >= 0) listeners.splice(index, 1);
      }),
      // Modern methods
      addEventListener: vi.fn((type: string, listener: EventListenerOrEventListenerObject | null) => {
        if (type === 'change' && typeof listener === 'function') {
          listeners.push(listener as () => void);
        }
      }),
      removeEventListener: vi.fn((type: string, listener: EventListenerOrEventListenerObject | null) => {
        if (type === 'change' && typeof listener === 'function') {
          const index = listeners.indexOf(listener as () => void);
          if (index >= 0) listeners.splice(index, 1);
        }
      }),
      // Simple implementation of dispatchEvent
      dispatchEvent: vi.fn((event: Event) => {
        listeners.forEach(listener => listener());
        return true;
      }),
    };
  }),
});

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    },
  };
})();

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

// Clean up after each test case
// (e.g., clearing jsdom)
afterEach(() => {
  cleanup();
  window.localStorage.clear();
  window.sessionStorage.clear();
});

// Mock the useNavigate hook from react-router-dom
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual as Record<string, unknown>,
    useNavigate: () => mockNavigate,
  };
});

// Add custom matchers
expect.extend({
  toBeInTheDocument: (received: HTMLElement) => {
    const pass = document.body.contains(received);
    return {
      pass,
      message: () => `Expected element ${pass ? 'not ' : ''}to be in the document`,
    };
  },
  toHaveTextContent: (received: HTMLElement, expected: string | RegExp) => {
    const text = received.textContent || '';
    const pass = typeof expected === 'string' 
      ? text.includes(expected) 
      : expected.test(text);
    return {
      pass,
      message: () => `Expected element ${pass ? 'not ' : ''}to have text content: ${expected}\nReceived: ${text}`,
    };
  },
});
