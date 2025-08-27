import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

type CustomRenderOptions = RenderOptions & {
  route?: string;
  queryClient?: QueryClient;
};

const AllTheProviders = ({
  children,
  queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
    },
  }),
}: {
  children: React.ReactNode;
  queryClient?: QueryClient;
}) => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  { route = '/', queryClient, ...options }: CustomRenderOptions = {}
) => {
  window.history.pushState({}, 'Test page', route);
  
  return render(ui, {
    wrapper: (props) => <AllTheProviders {...props} queryClient={queryClient} />,
    ...options,
  });
};

export * from '@testing-library/react';
export { customRender as render };
import userEvent from '@testing-library/user-event';
export { userEvent };

// Re-export userEvent with proper typing
export { default as userEvent } from '@testing-library/user-event';

// Custom test utilities
export const mockMatchMedia = () => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

// Mock for next/router
export const mockNextRouter = () => {
  const mockRouter = {
    route: '/',
    pathname: '/',
    query: {},
    asPath: '/',
    push: vi.fn(),
    replace: vi.fn(),
    reload: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn().mockResolvedValue(undefined),
    beforePopState: vi.fn(),
    events: {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
    },
  };

  vi.mock('next/router', () => ({
    useRouter: () => mockRouter,
  }));

  return mockRouter;
};

// Mock for API responses
export const mockApiResponse = (status: number, data: any, ok = true) => {
  return {
    ok,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
  } as Response;
};

// Mock for localStorage
export const mockLocalStorage = () => {
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value.toString();
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    };
  })();

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });

  return localStorageMock;
};

// Mock for sessionStorage
export const mockSessionStorage = () => {
  const sessionStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value.toString();
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    };
  })();

  Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock,
    writable: true,
  });

  return sessionStorageMock;
};
