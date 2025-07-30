import { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { RenderOptions } from '@testing-library/react';

type CustomRenderOptions = RenderOptions & {
  route?: string;
  path?: string;
  queryClient?: QueryClient;
};

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity, // Changed from cacheTime to gcTime in @tanstack/query v4+
      },
    },
  });

export const renderWithProviders = (
  ui: ReactElement,
  {
    route = '/',
    path = '*',
    queryClient = createTestQueryClient(),
    ...options
  }: CustomRenderOptions = {}
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path={path} element={children} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );

  return {
    ...render(ui, { wrapper: Wrapper, ...options }),
    queryClient,
  };
};

// Re-export values from @testing-library/react
export {
  render as baseRender,
  screen,
  fireEvent,
  waitFor,
  within,
  act,
  cleanup,
  renderHook,
  screen as testScreen,
  waitForElementToBeRemoved,
  type RenderResult
} from '@testing-library/react';

// Named export for renderWithProviders
export { renderWithProviders as render };
