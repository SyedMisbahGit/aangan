import { test, expect } from '@storybook/test';
import { composeStories } from '@storybook/react';
import * as stories from '../ErrorBoundary.stories';

// Compose all stories from the stories file
const { Default, WithError, WithCustomFallback } = composeStories(stories);

test.describe('ErrorBoundary Visual Regression Tests', () => {
  // Test the Default (no error) state
  test('Default - renders children without error', async ({ mount, page }) => {
    await mount(<Default />);
    
    // Verify the child content is rendered
    await expect(page.getByText('This is a normal child component')).toBeVisible();
    
    // Take a screenshot and compare with the baseline
    await expect(page).toHaveScreenshot('error-boundary-default.png', {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixelRatio: 0.01,
    });
  });

  // Test the error state with default fallback
  test('WithError - shows default error UI when child throws', async ({ mount, page }) => {
    // Suppress React error logs in test output
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    await mount(<WithError />);
    
    // Verify the error boundary caught the error and shows the fallback
    await expect(page.getByText(/something went wrong/i)).toBeVisible();
    
    // Take a screenshot and compare with the baseline
    await expect(page).toHaveScreenshot('error-boundary-with-error.png', {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixelRatio: 0.01,
    });
    
    // Clean up
    consoleError.mockRestore();
  });

  // Test the error state with custom fallback
  test('WithCustomFallback - shows custom error UI when child throws', async ({ mount, page }) => {
    // Suppress React error logs in test output
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    await mount(<WithCustomFallback />);
    
    // Verify the custom error UI is shown
    await expect(page.getByText('Custom Error UI')).toBeVisible();
    await expect(page.getByText('Something went wrong:')).toBeVisible();
    await expect(page.getByRole('button', { name: /try again/i })).toBeVisible();
    
    // Take a screenshot and compare with the baseline
    await expect(page).toHaveScreenshot('error-boundary-custom-fallback.png', {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixelRatio: 0.01,
    });
    
    // Clean up
    consoleError.mockRestore();
  });

  // Test the reset functionality
  test('Can reset error boundary', async ({ mount, page }) => {
    // Suppress React error logs in test output
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mount the component with an error
    await mount(<WithCustomFallback />);
    
    // Click the reset button
    const resetButton = page.getByRole('button', { name: /try again/i });
    await resetButton.click();
    
    // Verify the error boundary has been reset
    // (This depends on your implementation - you might need to adjust the selector)
    await expect(page.getByText('Custom Error UI')).not.toBeVisible();
    
    // Take a screenshot after reset (if applicable)
    // This would depend on what happens after reset in your implementation
    
    // Clean up
    consoleError.mockRestore();
  });

  // Test accessibility of the error boundary
  test('Error boundary is accessible', async ({ mount, page }) => {
    // Suppress React error logs in test output
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    await mount(<WithCustomFallback />);
    
    // Run accessibility tests
    await expect(page).toHaveNoViolations({
      // Configure axe options if needed
      axeOptions: {
        rules: {
          // Disable rules that don't apply to error states
          'page-has-heading-one': { enabled: false },
          'region': { enabled: false },
        },
      },
    });
    
    // Clean up
    consoleError.mockRestore();
  });
});
