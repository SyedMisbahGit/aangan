import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import ErrorPage from '../components/shared/ErrorPage';

// Simple test wrapper
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('ErrorPage - Smoke Test', () => {
  it('renders without crashing', () => {
    render(
      <TestWrapper>
        <ErrorPage message="Test error message" />
      </TestWrapper>
    );
    
    expect(screen.getByText(/the winds have paused/i)).toBeInTheDocument();
    expect(screen.getByText(/test error message/i)).toBeInTheDocument();
  });
});
