import { test, expect } from '@storybook/test';
import { composeStories } from '@storybook/react';
import * as stories from '../DreamHeader.stories';

// Compose all stories from the stories file
const { LoggedOut, LoggedIn, WithNotification, MobileView } = composeStories(stories);

test.describe('DreamHeader Visual Regression Tests', () => {
  // Test the LoggedOut state
  test('LoggedOut - matches visual snapshot', async ({ mount, page }) => {
    await mount(<LoggedOut />);
    
    // Wait for the component to be fully rendered
    await page.waitForSelector('[data-testid="dream-header"]');
    
    // Take a screenshot and compare with the baseline
    await expect(page).toHaveScreenshot('dream-header-logged-out.png', {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixelRatio: 0.01, // Allow 1% pixel difference
    });
  });

  // Test the LoggedIn state
  test('LoggedIn - matches visual snapshot', async ({ mount, page }) => {
    await mount(<LoggedIn />);
    
    // Wait for the component to be fully rendered
    await page.waitForSelector('[data-testid="dream-header"]');
    
    // Take a screenshot and compare with the baseline
    await expect(page).toHaveScreenshot('dream-header-logged-in.png', {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixelRatio: 0.01,
    });
  });

  // Test the WithNotification state
  test('WithNotification - matches visual snapshot', async ({ mount, page }) => {
    await mount(<WithNotification />);
    
    // Wait for the component to be fully rendered
    await page.waitForSelector('[data-testid="dream-header"]');
    
    // Take a screenshot and compare with the baseline
    await expect(page).toHaveScreenshot('dream-header-with-notification.png', {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixelRatio: 0.01,
    });
  });

  // Test the MobileView state
  test('MobileView - matches visual snapshot', async ({ mount, page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    
    await mount(<MobileView />);
    
    // Wait for the component to be fully rendered
    await page.waitForSelector('[data-testid="dream-header"]');
    
    // Take a screenshot and compare with the baseline
    await expect(page).toHaveScreenshot('dream-header-mobile-view.png', {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixelRatio: 0.01,
    });
  });

  // Test interactive elements
  test('Dropdown menu - opens and matches snapshot', async ({ mount, page }) => {
    await mount(<LoggedIn />);
    
    // Click the user menu button
    const menuButton = page.locator('[data-testid="user-menu-button"]');
    await menuButton.click();
    
    // Wait for the dropdown to be visible
    const dropdown = page.locator('[data-testid="user-dropdown"]');
    await expect(dropdown).toBeVisible();
    
    // Take a screenshot of the open dropdown
    await expect(page).toHaveScreenshot('dream-header-dropdown-open.png', {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixelRatio: 0.01,
    });
  });
});
