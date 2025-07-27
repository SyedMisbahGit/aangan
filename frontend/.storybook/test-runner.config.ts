import type { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: './.storybook',
  testMatch: '**/*.stories.@(js|jsx|ts|tsx)',
  testIgnore: '**/node_modules/**',
  timeout: 30000,
  expect: {
    toHaveScreenshot: {
      // Maximum allowed pixel difference between the reference and test screenshots
      maxDiffPixelRatio: 0.01,
      // Maximum allowed color difference per pixel
      threshold: 0.1,
    },
  },
  use: {
    // Base URL for all tests
    baseURL: 'http://localhost:6006',
    // Browser to run tests in
    browserName: 'chromium',
    // Viewport size
    viewport: { width: 1280, height: 1024 },
    // Enable screenshot on failure
    screenshot: 'only-on-failure',
    // Video recording options
    video: 'on-first-retry',
    // Trace collection for test failures
    trace: 'on-first-retry',
  },
  // Configure retries for flaky tests
  retries: 2,
  // Run tests in parallel
  workers: process.env.CI ? 2 : 4,
  // Reporter configuration
  reporter: [
    ['list'],
    [
      'html',
      {
        outputFolder: 'test-results/html',
        open: 'never',
      },
    ],
    [
      'junit',
      {
        outputFile: 'test-results/junit/results.xml',
      },
    ],
  ],
  // Global setup and teardown
  globalSetup: require.resolve('./test-runner-global-setup'),
  // Web server configuration for Storybook
  webServer: {
    command: 'npm run storybook -- --ci --port 6006',
    port: 6006,
    reuseExistingServer: !process.env.CI,
    timeout: 120000, // 2 minutes
  },
};

export default config;
