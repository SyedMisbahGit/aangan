# Visual Testing Guide

This guide provides comprehensive information about our visual testing setup using Storybook and Chromatic.

## Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
- [Writing Stories](#writing-stories)
- [Visual Testing with Chromatic](#visual-testing-with-chromatic)
- [Local Development Workflow](#local-development-workflow)
- [CI/CD Integration](#cicd-integration)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)
- [FAQs](#faqs)

## Overview

We use [Storybook](https://storybook.js.org/) for developing and documenting UI components in isolation, and [Chromatic](https://www.chromatic.com/) for visual regression testing. This combination helps us:

- Catch visual regressions before they reach production
- Document component variations and states
- Collaborate on UI changes
- Test components across different viewports and themes

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- A Chromatic account (sign up at [chromatic.com/start](https://www.chromatic.com/start))

### Installation

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Set up your Chromatic project token as an environment variable:
   ```bash
   # In your .env file
   CHROMATIC_PROJECT_TOKEN=your-project-token-here
   ```

### Running Storybook Locally

```bash
# Start Storybook in development mode
npm run storybook
```

This will start Storybook at `http://localhost:6006`.

## Writing Stories

Stories are written in `.stories.tsx` files alongside their components. Here's an example:

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { YourComponent } from './YourComponent';

const meta: Meta<typeof YourComponent> = {
  title: 'Components/YourComponent',
  component: YourComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    // Define your component's props and controls here
  },
};

export default meta;
type Story = StoryObj<typeof YourComponent>;

export const Default: Story = {
  args: {
    // Default props here
  },
};

export const WithCustomProps: Story = {
  args: {
    // Custom props here
  },
};
```

## Visual Testing with Chromatic

### Running Visual Tests Locally

1. Build your Storybook:
   ```bash
   npm run build-storybook
   ```

2. Publish to Chromatic:
   ```bash
   npx chromatic --project-token=$CHROMATIC_PROJECT_TOKEN
   ```

### Understanding Test Results

Chromatic will provide a link to view the test results. You'll see:

- **UI Review**: Visual changes that need to be reviewed
- **Tests**: Automated test results
- **Snapshots**: Current and previous versions of your components

## Local Development Workflow

1. Start Storybook in development mode:
   ```bash
   npm run storybook
   ```

2. As you make changes to components and stories, Storybook will hot reload.

3. When you're ready to test visual changes:
   ```bash
   # Build Storybook
   npm run build-storybook
   
   # Run visual tests
   npx chromatic --project-token=$CHROMATIC_PROJECT_TOKEN
   ```

## CI/CD Integration

We've set up a GitHub Actions workflow that runs on every push to `main` and on pull requests. The workflow:

1. Builds the frontend
2. Runs Storybook build
3. Publishes to Chromatic for visual testing
4. Uploads test results as artifacts

### Manual Testing in CI

To manually trigger a visual test run:

1. Go to the "Actions" tab in your GitHub repository
2. Select the "Chromatic Visual Testing" workflow
3. Click "Run workflow"

## Best Practices

### Writing Good Stories

1. **Cover All States**: Create stories for all important states and variants of your component
2. **Use Controls**: Leverage Storybook's controls to make components interactive
3. **Document**: Use JSDoc and Storybook's docs addon to document component usage
4. **Test Edges**: Include edge cases and error states in your stories

### Visual Testing

1. **Review Changes**: Always review visual changes in Chromatic before merging
2. **Use Auto-Accept**: For small, intentional changes, use Chromatic's auto-accept feature
3. **Test Responsively**: Test components at different viewports
4. **Use Interactions**: Test interactive states with the `play` function

## Troubleshooting

### Common Issues

#### Storybook Won't Start
- Ensure all dependencies are installed
- Check for syntax errors in your stories
- Clear the cache with `rm -rf node_modules/.cache`

#### Chromatic Build Failures
- Verify your project token is set correctly
- Check network connectivity
- Look for errors in the Chromatic build logs

#### Visual Diffs Unexpected
- Review the diff to understand what changed
- Check for timing issues with animations or loading states
- Use the `chromatic` CLI options to adjust diff sensitivity

## FAQs

### How do I update baselines?

1. Make your changes
2. Run Chromatic with the `--auto-accept-changes` flag
3. Or manually accept changes in the Chromatic UI

### How do I test a specific component?

Use the `--only-changed` flag to only test changed components:

```bash
npx chromatic --project-token=$CHROMATIC_PROJECT_TOKEN --only-changed
```

### How do I test different viewports?

Use Storybook's viewport addon in your story parameters:

```tsx
export const MobileView: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};
```

## Additional Resources

- [Storybook Documentation](https://storybook.js.org/docs/react/get-started/introduction)
- [Chromatic Documentation](https://www.chromatic.com/docs/)
- [Testing React Components with Storybook](https://storybook.js.org/tutorials/intro-to-storybook/react/en/test/)
- [Visual Testing Handbook](https://www.learnstorybook.com/visual-testing-handbook/)
