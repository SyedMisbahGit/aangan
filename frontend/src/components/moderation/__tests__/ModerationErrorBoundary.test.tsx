import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ModerationErrorBoundary from '../ModerationErrorBoundary';

// A component that throws an error
const ErrorComponent = () => {
  throw new Error('Test error');
};

describe('ModerationErrorBoundary', () => {
  // Suppress console.error for this test file
  const originalConsoleError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  it('renders children when there is no error', () => {
    render(
      <ModerationErrorBoundary>
        <div data-testid="child">Test Content</div>
      </ModerationErrorBoundary>
    );
    
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.queryByText(/error in/i)).not.toBeInTheDocument();
  });

  it('displays error fallback UI when child throws', () => {
    render(
      <ModerationErrorBoundary componentName="Test Component">
        <ErrorComponent />
      </ModerationErrorBoundary>
    );

    expect(screen.getByText(/error in test component/i)).toBeInTheDocument();
    expect(screen.getByText(/an error occurred while loading the moderation content/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('calls window.location.reload when retry button is clicked', () => {
    // Mock window.location.reload
    const originalLocation = window.location;
    delete window.location;
    window.location = { ...originalLocation, reload: jest.fn() };

    render(
      <ModerationErrorBoundary>
        <ErrorComponent />
      </ModerationErrorBoundary>
    );

    fireEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(window.location.reload).toHaveBeenCalled();

    // Restore original window.location
    window.location = originalLocation;
  });

  it('uses default component name when not provided', () => {
    render(
      <ModerationErrorBoundary>
        <ErrorComponent />
      </ModerationErrorBoundary>
    );

    expect(screen.getByText(/error in moderation component/i)).toBeInTheDocument();
  });
});
