import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import ErrorPage from '../components/shared/ErrorPage';
import { describe, it, expect } from 'vitest';

expect.extend(toHaveNoViolations);

describe('ErrorPage accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(
      <ErrorPage
        title="Test Error"
        message="Something went wrong."
        narratorLine="A gentle hush falls over the campus."
        errorDetails="Test error details."
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
}); 