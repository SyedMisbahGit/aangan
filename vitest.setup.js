// Global test setup
import { beforeAll, afterAll, afterEach, vi, expect } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import matchers from '@testing-library/jest-dom/matchers';
import { toHaveNoViolations } from 'jest-axe';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);
expect.extend({ toHaveNoViolations });

// Mock global objects
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock WebSocket server for testing
class MockWebSocket {
  constructor(url) {
    this.url = url;
    this.readyState = WebSocket.OPEN;
    this.onopen = null;
    this.onmessage = null;
    this.onclose = null;
    this.onerror = null;
    this.sentMessages = [];
    
    // Auto-connect
    setTimeout(() => {
      if (this.onopen) this.onopen({ type: 'open' });
    }, 0);
  }

  send(data) {
    this.sentMessages.push(JSON.parse(data));
  }

  close() {
    this.readyState = WebSocket.CLOSED;
    if (this.onclose) this.onclose({ code: 1000, reason: 'Test closure' });
  }

  // Test helper methods
  simulateMessage(data) {
    if (this.onmessage) {
      this.onmessage({ data: JSON.stringify(data) });
    }
  }
}

global.WebSocket = MockWebSocket;

// Global test utilities
global.render = render;
global.screen = screen;

// Cleanup after each test
afterEach(() => {
  // Clear all mocks
  vi.clearAllMocks();
  
  // Clean up any rendered components
  cleanup();
  
  // Clear local storage
  localStorage.clear();
  cleanup();
  vi.clearAllMocks();
});

// Global test timeout
beforeAll(() => {
  vi.setConfig({ testTimeout: 30000 });
});

// Cleanup after all tests
afterAll(() => {
  vi.restoreAllMocks();
});
