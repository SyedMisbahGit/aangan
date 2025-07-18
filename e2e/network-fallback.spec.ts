import { test, expect } from '@playwright/test';

test.describe('Network Fallbacks', () => {
  test('shows skeleton and network indicator on slow network', async ({ page, context }) => {
    // Simulate Slow 3G
    await context.setOffline(false);
    await context.setDefaultNavigationTimeout(10000);
    await context.setNetworkConditions({
      download: 500 * 1024 / 8, // 500kbps
      upload: 500 * 1024 / 8,
      latency: 400,
    });
    await page.goto('http://localhost:3000'); // Adjust if your dev server runs elsewhere

    // Should see the skeleton and network indicator
    await expect(page.locator('text=Connecting to campus...')).toBeVisible();
    await expect(page.locator('[data-testid="skeleton"]')).toBeVisible();
  });

  test('shows skeleton and network indicator when offline', async ({ page, context }) => {
    await page.goto('http://localhost:3000');
    await context.setOffline(true);

    // Should see the skeleton and network indicator
    await expect(page.locator('text=Connecting to campus...')).toBeVisible();
    await expect(page.locator('[data-testid="skeleton"]')).toBeVisible();
  });
}); 