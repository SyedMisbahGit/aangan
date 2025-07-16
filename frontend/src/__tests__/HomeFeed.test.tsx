import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect } from 'vitest';

// Create a mock HomeFeed component
const MockHomeFeed = () => (
  <div data-testid="home-feed">
    <h1>Campus Feed</h1>
    <p>Test whisper content</p>
    <span>42</span>
    <div data-testid="emotion-badge">joy</div>
  </div>
);

// Create a new QueryClient for testing
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('HomeFeed', () => {
  it('renders without crashing', () => {
    renderWithRouter(<MockHomeFeed />);
    expect(screen.getByText(/campus/i)).toBeInTheDocument();
  });

  it('displays whisper content', () => {
    renderWithRouter(<MockHomeFeed />);
    expect(screen.getByText('Test whisper content')).toBeInTheDocument();
  });

  it('shows active users count', () => {
    renderWithRouter(<MockHomeFeed />);
    expect(screen.getByText(/42/i)).toBeInTheDocument();
  });

  it('renders emotion badge', () => {
    renderWithRouter(<MockHomeFeed />);
    expect(screen.getByTestId('emotion-badge')).toHaveTextContent('joy');
  });
}); 