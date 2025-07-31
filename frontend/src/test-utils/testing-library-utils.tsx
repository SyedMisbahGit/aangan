import React, { ReactElement } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import theme from '../theme';
import { apiSlice } from '../features/api/apiSlice';
import { authSlice } from '../features/auth/authSlice';
import { RootState } from '../app/store';

// Mock the WebSocket client
jest.mock('../app/wsClient', () => ({
  __esModule: true,
  default: {
    connect: jest.fn(),
    disconnect: jest.fn(),
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
    send: jest.fn(),
  },
}));

// Mock the WebSocket hook
jest.mock('../hooks/useWebSocket', () => ({
  __esModule: true,
  default: () => ({
    isConnected: true,
    lastMessage: null,
    sendMessage: jest.fn(),
  }),
}));

type CustomRenderOptions = {
  preloadedState?: Partial<RootState>;
  route?: string;
  renderOptions?: Omit<RenderOptions, 'wrapper'>;
};

// Create a custom renderer with all the providers
export function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState = {},
    route = '/',
    ...renderOptions
  }: CustomRenderOptions = {}
): RenderResult {
  // Create a new store instance for each test
  const store = configureStore({
    reducer: {
      [apiSlice.reducerPath]: apiSlice.reducer,
      auth: authSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(apiSlice.middleware),
    preloadedState,
  });

  // Set up RTK Query listeners
  setupListeners(store.dispatch);

  // Wrapper component for all providers
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <SnackbarProvider maxSnack={3}>
          <MemoryRouter initialEntries={[route]}>
            <Routes>
              <Route path="*" element={children} />
            </Routes>
          </MemoryRouter>
        </SnackbarProvider>
      </ThemeProvider>
    </Provider>
  );

  // Return an object with the store and all of RTL's query functions
  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    store,
  };
}

// Re-export everything from testing-library
// eslint-disable-next-line react-refresh/only-export-components
export * from '@testing-library/react';

// Override render method
export { renderWithProviders as render };

// Mock data generators
export const mockUser = (overrides = {}) => ({
  id: 'user-123',
  username: 'testuser',
  email: 'test@example.com',
  role: 'user',
  isVerified: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const mockWhisper = (overrides = {}) => ({
  id: 'whisper-123',
  content: 'This is a test whisper',
  author: 'user-123',
  isAnonymous: false,
  isPublic: true,
  likes: 5,
  comments: 2,
  tags: ['test', 'example'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

// Custom matchers
expect.extend({
  toBeInTheDocument(actual: HTMLElement | null) {
    const pass = actual !== null && document.body.contains(actual);
    return {
      pass,
      message: () =>
        `expected ${this.utils.printReceived(actual)} ${
          pass ? 'not to be' : 'to be'
        } in the document`,
    };
  },
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock the ResizeObserver
class ResizeObserverStub {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

window.ResizeObserver = ResizeObserverStub;

// Mock the IntersectionObserver
class IntersectionObserverStub {
  root = null;
  rootMargin = '';
  thresholds = [0];
  
  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback;
    if (options) {
      this.root = options.root || null;
      this.rootMargin = options.rootMargin || '';
      if (options.threshold !== undefined) {
        this.thresholds = Array.isArray(options.threshold) 
          ? options.threshold 
          : [options.threshold];
      }
    }
  }
  
  observe = jest.fn((target: Element) => {
    // Immediately trigger the callback with the target being visible
    const entry: IntersectionObserverEntry = {
      target,
      isIntersecting: true,
      intersectionRatio: 1,
      boundingClientRect: target.getBoundingClientRect(),
      intersectionRect: target.getBoundingClientRect(),
      rootBounds: null,
      time: Date.now(),
    };
    
    // Call the callback with the entry
    this.callback([entry], this);
  });
  
  unobserve = jest.fn();
  disconnect = jest.fn();
  takeRecords = jest.fn();
}

window.IntersectionObserver = IntersectionObserverStub;

// Mock the scrollTo method
window.scrollTo = jest.fn();

// Mock the WebSocket
class WebSocketStub {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;
  
  onopen: ((this: WebSocket, ev: Event) => any) | null = null;
  onmessage: ((this: WebSocket, ev: MessageEvent) => any) | null = null;
  onerror: ((this: WebSocket, ev: Event) => any) | null = null;
  onclose: ((this: WebSocket, ev: CloseEvent) => any) | null = null;
  
  readyState = WebSocketStub.CONNECTING;
  url: string;
  
  constructor(url: string | URL, protocols?: string | string[]) {
    this.url = url.toString();
    // Simulate connection opening
    setTimeout(() => {
      this.readyState = WebSocketStub.OPEN;
      if (this.onopen) this.onopen(new Event('open'));
    }, 0);
  }
  
  send = jest.fn((data: string | ArrayBufferLike | Blob | ArrayBufferView) => {
    // Mock a response for certain message types
    if (typeof data === 'string') {
      const message = JSON.parse(data);
      if (message.type === 'AUTH') {
        this.mockMessage({
          type: 'AUTH_SUCCESS',
          payload: { userId: 'test-user-123' },
        });
      }
    }
  });
  
  close = jest.fn((code?: number, reason?: string) => {
    this.readyState = WebSocketStub.CLOSED;
    if (this.onclose) {
      this.onclose(new CloseEvent('close', { 
        wasClean: true, 
        code: code || 1000, 
        reason: reason || 'Normal closure' 
      }));
    }
  });
  
  // Helper to mock incoming messages
  mockMessage(message: any) {
    if (this.onmessage) {
      this.onmessage(new MessageEvent('message', {
        data: JSON.stringify(message)
      }));
    }
  }
  
  // Helper to simulate connection error
  simulateError() {
    this.readyState = WebSocketStub.CLOSED;
    if (this.onerror) this.onerror(new Event('error'));
    if (this.onclose) {
      this.onclose(new CloseEvent('close', { 
        wasClean: false, 
        code: 1006, 
        reason: 'Connection failed' 
      }));
    }
  }
}

// @ts-ignore
window.WebSocket = WebSocketStub;

// Helper to wait for all async operations to complete
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

// Helper to simulate a successful API response
export const mockApiResponse = (data: any, status = 200) => ({
  status,
  data,
  isSuccess: status >= 200 && status < 300,
  isError: status >= 400,
  error: status >= 400 ? { data: { message: 'Error occurred' } } : undefined,
});
