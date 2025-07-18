import React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '../components/shared/ErrorBoundary';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';

// Helper component that throws
function ThrowError() {
  throw new Error('Test error');
}

describe('ErrorBoundary', () => {
  it('catches errors and renders fallback UI', () => {
    render(
      <BrowserRouter>
        <ErrorBoundary narratorLine="Test error boundary narrator line">
          <ThrowError />
        </ErrorBoundary>
      </BrowserRouter>
    );
    expect(screen.getByText(/something went adrift/i)).toBeInTheDocument();
    expect(screen.getByText(/test error boundary narrator line/i)).toBeInTheDocument();
  });
}); 