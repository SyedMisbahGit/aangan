# Visual Regression Testing with Storybook and Chromatic

This document outlines our visual regression testing strategy using Storybook and Chromatic to ensure UI consistency across our application.

## Table of Contents
- [Overview](#overview)
- [Getting Started](#getting-started)
- [Writing Stories](#writing-stories)
- [Running Visual Tests](#running-visual-tests)
- [Reviewing Changes](#reviewing-changes)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

We use [Storybook](https://storybook.js.org/) for developing and documenting UI components in isolation, and [Chromatic](https://www.chromatic.com/) for visual regression testing. This combination helps us:

1. Catch visual regressions before they reach production
2. Document component variations and states
3. Collaborate on UI changes
4. Test components across different viewports and themes

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn
- A Chromatic account (sign up at [chromatic.com](https://www.chromatic.com/start))

### Installation

1. Install dependencies:
   ```bash
   npm install --save-dev @storybook/addon-a11y @storybook/addon-essentials @storybook/addon-interactions @storybook/addon-links @storybook/blocks @storybook/react @storybook/react-vite @storybook/testing-library @storybook/test-runner @chromatic-com/storybook
   ```

2. Set up your Chromatic project token as an environment variable:
   ```bash
   # In your .env file
   CHROMATIC_PROJECT_TOKEN=your-project-token-here
   ```

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

### Best Practices for Stories

1. **Component Organization**: Group related components in the Storybook sidebar using `/` (e.g., `Components/Buttons/Button`)
2. **Naming Conventions**: Use PascalCase for story names (e.g., `PrimaryButton`)
3. **Documentation**: Use JSDoc comments to document props and component usage
4. **Variants**: Create stories for all important states and variants of your component
5. **Accessibility**: Use the a11y addon to test for accessibility issues

## Running Visual Tests

### Local Development

1. Start Storybook in development mode:
   ```bash
   npm run storybook
   ```

2. Open your browser to `http://localhost:6006`

### Visual Testing with Chromatic

1. Build your Storybook:
   ```bash
   npm run build-storybook
   ```

2. Publish to Chromatic:
   ```bash
   npx chromatic --project-token=$CHROMATIC_PROJECT_TOKEN
   ```

3. For CI/CD, add this to your pipeline:
   ```yaml
   - name: Publish to Chromatic
     run: npx chromatic --project-token=$CHROMATIC_PROJECT_TOKEN --exit-once-uploaded
     env:
       CHROMATIC_PROJECT_TOKEN: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
   ```

## Reviewing Changes

When you push changes that affect UI components:

1. Chromatic will automatically detect changes in your components
2. It will capture screenshots of all stories
3. It will compare them against the baseline (usually the `main` branch)
4. You'll receive a PR comment with a link to review the changes
5. Review the visual diffs and either:
   - Approve acceptable changes
   - Request updates for regressions

## Best Practices

1. **Small, Focused PRs**: Keep PRs small to make visual reviews manageable
2. **Descriptive Commit Messages**: Clearly explain UI changes in commit messages
3. **Test Responsiveness**: Test components at multiple breakpoints
4. **Use Interactions**: Test interactive states with the `play` function
5. **Document Edge Cases**: Include stories for error states and edge cases

## Troubleshooting

### Storybook Won't Start
- Ensure all dependencies are installed
- Check for syntax errors in your stories
- Clear the cache with `rm -rf node_modules/.cache`

### Chromatic Build Failures
- Verify your project token is set correctly
- Check network connectivity
- Look for errors in the Chromatic build logs

### Visual Diffs Unexpected
- Review the diff to understand what changed
- Check for timing issues with animations or loading states
- Use the `chromatic` CLI options to adjust diff sensitivity if needed

## Additional Resources

- [Storybook Documentation](https://storybook.js.org/docs/react/get-started/introduction)
- [Chromatic Documentation](https://www.chromatic.com/docs/)
- [Testing React Components with Storybook](https://storybook.js.org/tutorials/intro-to-storybook/react/en/test/)
- [Visual Testing Handbook](https://www.learnstorybook.com/visual-testing-handbook/)
