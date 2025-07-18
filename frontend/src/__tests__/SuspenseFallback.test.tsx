import React, { Suspense } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CustomSkeletonCard } from '../components/ui/skeleton';

// Lazy component that never resolves
const NeverResolve = React.lazy(() => new Promise(() => {}));

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