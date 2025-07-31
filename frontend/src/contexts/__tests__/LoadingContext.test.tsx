import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, renderHook, act, screen } from '@testing-library/react';
import { LoadingProvider, useLoading } from '../LoadingContext';

// Test component that uses the loading context
const TestComponent = () => {
  const { showLoading, hideLoading, isLoading } = useLoading();
  
  return (
    <div>
      <div data-testid="loading-state">{isLoading() ? 'Loading...' : 'Not Loading'}</div>
      <button onClick={() => showLoading('Loading test')} data-testid="show-loading">
        Show Loading
      </button>
      <button onClick={() => hideLoading()} data-testid="hide-loading">
        Hide Loading
      </button>
    </div>
  );
};

describe('LoadingContext', () => {
  // Wrapper component to provide the context
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <LoadingProvider>{children}</LoadingProvider>
  );

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('provides initial context values', () => {
    const { result } = renderHook(() => useLoading(), { wrapper });
    
    expect(result.current).toHaveProperty('loadingState');
    expect(result.current.loadingState.isLoading).toBe(false);
    expect(result.current).toHaveProperty('showLoading');
    expect(result.current).toHaveProperty('hideLoading');
    expect(result.current).toHaveProperty('isLoading');
  });

  it('updates loading state when showLoading is called', () => {
    const { result } = renderHook(() => useLoading(), { wrapper });
    
    act(() => {
      result.current.showLoading('Loading data...');
    });
    
    expect(result.current.loadingState.isLoading).toBe(true);
    expect(result.current.loadingState.message).toBe('Loading data...');
    expect(result.current.isLoading()).toBe(true);
  });

  it('updates loading state when hideLoading is called', () => {
    const { result } = renderHook(() => useLoading(), { wrapper });
    
    // First show loading
    act(() => {
      result.current.showLoading('Loading data...');
    });
    
    // Then hide it
    act(() => {
      result.current.hideLoading();
    });
    
    expect(result.current.loadingState.isLoading).toBe(false);
    expect(result.current.isLoading()).toBe(false);
  });

  it('tracks loading state with keys', () => {
    const { result } = renderHook(() => useLoading(), { wrapper });
    
    // Show loading with a specific key
    act(() => {
      result.current.showLoading('Loading item 1', 'item1');
    });
    
    expect(result.current.isLoading('item1')).toBe(true);
    expect(result.current.isLoading('item2')).toBe(false);
    
    // Show loading with a different key
    act(() => {
      result.current.showLoading('Loading item 2', 'item2');
    });
    
    expect(result.current.isLoading('item1')).toBe(true);
    expect(result.current.isLoading('item2')).toBe(true);
    
    // Hide loading for item1
    act(() => {
      result.current.hideLoading('item1');
    });
    
    expect(result.current.isLoading('item1')).toBe(false);
    expect(result.current.isLoading('item2')).toBe(true);
  });

  it('uses default message when none is provided', () => {
    const { result } = renderHook(() => useLoading(), { 
      wrapper: ({ children }) => (
        <LoadingProvider defaultMessage="Default loading...">
          {children}
        </LoadingProvider>
      )
    });
    
    act(() => {
      result.current.showLoading();
    });
    
    expect(result.current.loadingState.message).toBe('Default loading...');
  });

  it('throws an error when used outside of provider', () => {
    // Suppress the expected error message in the test output
    const originalError = console.error;
    console.error = vi.fn();
    
    expect(() => {
      renderHook(() => useLoading());
    }).toThrow('useLoading must be used within a LoadingProvider');
    
    console.error = originalError;
  });

  it('works with the TestComponent', () => {
    render(<TestComponent />, { wrapper });
    
    // Initial state
    expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
    
    // Show loading
    act(() => {
      screen.getByTestId('show-loading').click();
    });
    
    expect(screen.getByTestId('loading-state')).toHaveTextContent('Loading...');
    
    // Hide loading
    act(() => {
      screen.getByTestId('hide-loading').click();
    });
    
    expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
  });
});
