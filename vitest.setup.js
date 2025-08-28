// Global test setup for Vitest
import { beforeAll, afterAll, afterEach, vi, expect } from 'vitest';

// Mock localStorage for Node.js environment
if (typeof window === 'undefined') {
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

  global.localStorage = localStorageMock;
  global.sessionStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };
}

// Mock WebSocket for testing
class MockWebSocket {
  constructor(url) {
    this.url = url;
    this.readyState = 1; // OPEN
    this.onopen = null;
    this.onmessage = null;
    this.onclose = null;
    this.onerror = null;
    this.sentMessages = [];
    
    // Auto-connect
    setImmediate(() => {
      if (this.onopen) this.onopen({ type: 'open' });
    });
  }
  
  send(data) {
    this.sentMessages.push(data);
  }
  
  close() {
    this.readyState = 3; // CLOSED
    if (this.onclose) this.onclose({ type: 'close' });
  }
  
  // Test helper method
  simulateMessage(data) {
    if (this.onmessage) {
      this.onmessage({ data });
    }
  }
}

global.WebSocket = MockWebSocket;

// Mock timers
global.setImmediate = global.setImmediate || ((fn, ...args) => global.setTimeout(fn, 0, ...args));

// Mock requestIdleCallback for testing
global.requestIdleCallback = global.requestIdleCallback || function (cb) {
  const start = Date.now();
  return setTimeout(() => {
    cb({
      didTimeout: false,
      timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
    });
  }, 1);
};

global.cancelIdleCallback = global.cancelIdleCallback || function (id) {
  clearTimeout(id);
};

// Cleanup after each test
afterEach(() => {
  // Clear all mocks
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
