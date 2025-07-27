import type { TestRunnerConfig } from '@storybook/test-runner';
import { getStoryContext } from '@storybook/test-runner';
import { checkA11y, injectAxe } from 'axe-playwright';

const config: TestRunnerConfig = {
  async preRender(page) {
    await injectAxe(page);
  },
  async postRender(page, context) {
    // Get the entire context of a story, including parameters, args, argTypes, etc.
    const storyContext = await getStoryContext(page, context);
    
    // Skip a11y tests for stories that disable them
    if (storyContext.parameters?.a11y?.disable) {
      return;
    }

    // Apply story-level a11y rules or use defaults
    const a11yConfig = {
      rules: [
        // Disable rules that are known to have false positives
        { id: 'color-contrast', enabled: false },
        { id: 'landmark-one-main', enabled: false },
        { id: 'page-has-heading-one', enabled: false },
        { id: 'region', enabled: false },
      ],
      ...storyContext.parameters?.a11y?.config,
    };

    // Run accessibility tests
    await checkA11y(page, '#storybook-root', {
      detailedReport: true,
      detailedReportOptions: {
        html: true,
      },
      axeOptions: a11yConfig,
    });
  },
  tags: {
    // Disable snapshot tests for stories with this tag
    skip: ['no-test'],
    // Run visual tests for stories with this tag
    visualTest: ['visual-test'],
  },
  // Configure viewport for visual tests
  viewport: {
    viewports: [
      {
        name: 'mobile',
        width: 375,
        height: 667,
      },
      {
        name: 'tablet',
        width: 768,
        height: 1024,
      },
      {
        name: 'desktop',
        width: 1280,
        height: 1024,
      },
    ],
    defaultViewport: 'desktop',
  },
  // Configure visual regression testing
  visualTests: {
    // Directory where reference screenshots are stored
    referenceDir: './storybook-visual-tests/reference',
    // Directory where test screenshots are stored
    testDir: './storybook-visual-tests/test',
    // Directory where diffs are stored
    diffDir: './storybook-visual-tests/diff',
    // Threshold for considering images different (0-1)
    threshold: 0.01,
    // Whether to update reference screenshots instead of testing
    update: process.env.UPDATE_SNAPSHOTS === 'true',
  },
};

export default config;
