import React from 'react';
import { render, screen, fireEvent } from '../../test-utils/testing-library-utils';
import ErrorBoundary from './ErrorBoundary';

// A component that will throw an error
const ErrorComponent = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>Normal content</div>;
};

describe('ErrorBoundary', () => {
  // Suppress error logs for the tests
  const originalConsoleError = console.error;
  
  beforeAll(() => {
    // Mock console.error to avoid polluting test output
    console.error = jest.fn();
  });
  
  afterAll(() => {
    // Restore console.error
    console.error = originalConsoleError;
  });
  
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Normal content')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong.')).not.toBeInTheDocument();
  });
  
  it('displays error UI when a child component throws an error', () => {
    // Prevent the error from being logged during the test
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <ErrorBoundary>
        <ErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    
    // Check that the error UI is displayed
    expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
    expect(screen.queryByText('Normal content')).not.toBeInTheDocument();
    
    // Check that the error was logged
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
  
  it('calls onError callback when an error is caught', () => {
    const mockOnError = jest.fn();
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <ErrorBoundary onError={mockOnError}>
        <ErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(mockOnError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );
    
    errorSpy.mockRestore();
  });
  
  it('allows resetting the error state', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    const { rerender } = render(
      <ErrorBoundary>
        <ErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    
    // Should show error UI
    expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
    
    // Rerender with error resolved
    rerender(
      <ErrorBoundary>
        <ErrorComponent shouldThrow={false} />
      </ErrorBoundary>
    );
    
    // Should still show error UI because error boundary doesn't auto-recover
    expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
    
    // Click the reset button
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    
    // Should now show the normal content
    expect(screen.getByText('Normal content')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong.')).not.toBeInTheDocument();
    
    errorSpy.mockRestore();
  });
  
  it('calls onReset callback when error is reset', () => {
    const mockOnReset = jest.fn();
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <ErrorBoundary onReset={mockOnReset}>
        <ErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    
    // Click the reset button
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    
    expect(mockOnReset).toHaveBeenCalled();
    
    errorSpy.mockRestore();
  });
  
  it('displays custom fallback UI when provided', () => {
    const CustomFallback = ({ error, resetErrorBoundary }) => (
      <div>
        <h2>Custom Error</h2>
        <p>{error.message}</p>
        <button onClick={resetErrorBoundary}>Retry</button>
      </div>
    );
    
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <ErrorBoundary fallbackComponent={CustomFallback}>
        <ErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    
    // Should show custom fallback UI
    expect(screen.getByText('Custom Error')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    
    errorSpy.mockRestore();
  });
  
  it('resets when resetKeys change', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    const { rerender } = render(
      <ErrorBoundary resetKeys={[1]}>
        <ErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    
    // Should show error UI
    expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
    
    // Rerender with a new resetKey
    rerender(
      <ErrorBoundary resetKeys={[2]}>
        <ErrorComponent shouldThrow={false} />
      </ErrorBoundary>
    );
    
    // Should now show the normal content because the resetKey changed
    expect(screen.getByText('Normal content')).toBeInTheDocument();
    
    errorSpy.mockRestore();
  });
});
