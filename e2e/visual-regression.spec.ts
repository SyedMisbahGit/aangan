import { test, expect } from '@playwright/test';

// Helper to render a React component in a blank page
async function renderComponent(page, componentPath, componentName, props = {}) {
  await page.setContent('<div id="root"></div>');
  await page.addScriptTag({
    type: 'module',
    content: `
      import React from "react";
      import { createRoot } from "react-dom/client";
      import Comp from "${componentPath}";
      createRoot(document.getElementById("root")).render(
        React.createElement(Comp, ${JSON.stringify(props)})
      );
    `,
  });
}

test.describe('Visual Regression: Error and Skeleton States', () => {
  test('ErrorPage visual snapshot', async ({ page }) => {
    await renderComponent(
      page,
      '/src/components/shared/ErrorPage',
      'ErrorPage',
      {
        title: 'Test Error',
        message: 'Something went wrong.',
        narratorLine: 'A gentle hush falls over the campus.',
        errorDetails: 'Test error details.'
      }
    );
    await expect(page.locator('#root')).toHaveScreenshot('error-page.png');
  });

  test('WhisperSkeleton visual snapshot', async ({ page }) => {
    await renderComponent(
      page,
      '/src/components/whisper/WhisperSkeleton',
      'WhisperSkeleton'
    );
    await expect(page.locator('#root')).toHaveScreenshot('whisper-skeleton.png');
  });

  test('CustomSkeletonCard visual snapshot', async ({ page }) => {
    await renderComponent(
      page,
      '/src/components/ui/skeleton',
      'CustomSkeletonCard'
    );
    await expect(page.locator('#root')).toHaveScreenshot('custom-skeleton-card.png');
  });
}); 