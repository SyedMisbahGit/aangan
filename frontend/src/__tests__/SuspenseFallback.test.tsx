import React, { Suspense } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CustomSkeletonCard } from '../components/ui/skeleton';

// Lazy component that never resolves - empty block is intentional for testing
const NeverResolve = React.lazy(() => new Promise(() => {
  // This promise never resolves to test the Suspense fallback
  // The empty block is intentional for this test case
}));

describe('Suspense Fallback', () => {
  it('renders CustomSkeletonCard while loading', () => {
    render(
      <Suspense fallback={<CustomSkeletonCard data-testid="skeleton" />}> 
        <NeverResolve />
      </Suspense>
    );
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
  });
}); 