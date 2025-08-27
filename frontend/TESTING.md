# Testing Guide

This guide covers the testing setup and practices for the Aangan frontend application.

## Table of Contents

- [Test Types](#test-types)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Visual Regression Testing](#visual-regression-testing)
- [Test Coverage](#test-coverage)
- [CI/CD Integration](#cicd-integration)
- [Best Practices](#best-practices)

## Test Types

### Unit Tests
- Location: `src/**/__tests__/*.test.tsx`
- Purpose: Test individual functions and components in isolation
- Framework: Vitest + React Testing Library

### Component Tests
- Location: `cypress/component/**/*.cy.tsx`
- Purpose: Test React components in isolation with real interactions
- Framework: Cypress Component Testing

### E2E Tests
- Location: `cypress/e2e/**/*.cy.ts`
- Purpose: Test complete user flows
- Framework: Cypress E2E

### Visual Regression Tests
- Location: `cypress/e2e/visual-regression/*.cy.ts`
- Purpose: Detect visual regressions in the UI
- Tool: Percy

## Running Tests

### Local Development

```bash
# Install dependencies
npm install

# Run unit tests
npm test

# Run unit tests with coverage
npm run test:coverage

# Open Cypress test runner
npm run cypress:open

# Run E2E tests in headless mode
npm run test:e2e

# Run visual regression tests (requires PERCY_TOKEN)
PERCY_TOKEN=your_token_here npm run test:visual
```

### CI/CD Pipeline

Tests are automatically run on:
- Push to `main` or `develop` branches
- Pull requests targeting `main` or `develop`

## Writing Tests

### Component Tests

```typescript
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### E2E Tests

```typescript
describe('User Flow', () => {
  it('completes the signup flow', () => {
    cy.visit('/signup');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });
});
```

## Visual Regression Testing

### Setup

1. Sign up at [Percy](https://percy.io/)
2. Create a new project
3. Set `PERCY_TOKEN` in your environment variables

### Taking Snapshots

```typescript
// Basic snapshot
cy.takeSnapshot('My Component');

// With options
cy.takeSnapshot('My Component', {
  widths: [375, 768, 1280],
  percyCSS: `
    .dynamic-content { display: none; }
  `
});
```

## Test Coverage

Coverage reports are generated using Istanbul/nyc. To view the coverage report:

```bash
# Generate coverage report
npm run test:coverage

# Open HTML report (after running the above)
open coverage/lcov-report/index.html
```

## CI/CD Integration

### GitHub Actions

Workflow files:
- `.github/workflows/cypress-tests.yml`: Runs E2E and visual tests
- `.github/workflows/unit-tests.yml`: Runs unit tests and coverage

### Environment Variables

Required environment variables for CI:

```env
# Percy
PERCY_TOKEN=your_percy_token

# API
VITE_API_URL=https://api.example.com
```

## Best Practices

### Test Organization
- Group related tests in `describe` blocks
- Use clear, descriptive test names
- Keep tests focused and independent

### Selectors
- Prefer `data-cy` attributes for test selectors
- Avoid using implementation details like class names

### Performance
- Mock external dependencies
- Use `cy.intercept()` to mock API calls
- Clean up test data after each test

### Accessibility
- Run accessibility checks in your tests
- Use `cy.checkA11y()` to verify accessibility

## Troubleshooting

### Tests are flaky
- Add retries for flaky tests
- Use `cy.wait('@apiRequest')` to wait for API calls
- Disable animations in tests

### Visual tests failing
- Review the Percy dashboard for differences
- Update baselines when intentional changes are made
- Use `percyCSS` to hide dynamic content

## Resources

- [Cypress Documentation](https://docs.cypress.io/)
- [Testing Library](https://testing-library.com/)
- [Percy Documentation](https://docs.percy.io/)
- [Vitest Documentation](https://vitest.dev/)
