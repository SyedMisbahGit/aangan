# Testing Strategy

## Overview
This document outlines the testing strategy for the College Whisper application, covering unit, integration, E2E, and visual regression testing.

## Testing Pyramid

```
          /\
         /  \
        /    \
       / E2E  \
      /        \
     /          \
    / Integration\
   /              \
  /                \
 /     Unit         \
/____________________\
```

## 1. Unit Testing

### Tools
- **Vitest**: Fast test runner with Jest-compatible API
- **React Testing Library**: For testing React components
- **MSW (Mock Service Worker)**: For mocking API calls

### What to Test
- Individual React components
- Utility functions
- Custom hooks
- Redux reducers/actions (if used)
- Form validation logic

### Example: Testing a Component

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './Button';

describe('Button Component', () => {
  it('calls onClick handler when clicked', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await userEvent.click(screen.getByRole('button', { name: /click me/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## 2. Integration Testing

### Tools
- **Vitest** + **React Testing Library**
- **MSW** for API mocking
- **React Router** test utilities

### What to Test
- Component interactions
- Form submissions
- API integrations
- State management

### Example: Testing a Form

```typescript
describe('Login Form', () => {
  it('submits the form with email and password', async () => {
    const mockSubmit = vi.fn();
    render(<LoginForm onSubmit={mockSubmit} />);
    
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    expect(mockSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
  });
});
```

## 3. End-to-End (E2E) Testing

### Tools
- **Cypress**: For full application testing
- **Cypress Testing Library**: For better selectors
- **Cypress Real Events**: For realistic browser events

### What to Test
- Critical user journeys
- Authentication flows
- Form submissions with real API calls
- Navigation
- Error states

### Example: Cypress Test

```typescript
describe('Authentication', () => {
  it('allows users to sign in', () => {
    cy.visit('/login');
    cy.findByLabelText(/email/i).type('user@example.com');
    cy.findByLabelText(/password/i).type('password123');
    cy.findByRole('button', { name: /sign in/i }).click();
    
    cy.url().should('include', '/dashboard');
    cy.findByText(/welcome back/i).should('be.visible');
  });
});
```

## 4. Visual Regression Testing

### Tools
- **Loki**: For visual regression testing
- **Storybook**: For component documentation and visual testing

### What to Test
- UI component variations
- Responsive design
- Cross-browser compatibility

### Example: Storybook + Loki

1. Create stories for components:

```typescript
// Button.stories.tsx
export default {
  title: 'Components/Button',
  component: Button,
};

export const Primary = () => (
  <Button variant="primary">Click me</Button>
);
```

2. Run visual tests:
```bash
# Capture reference images
loki test --reference

# Run tests against references
loki test
```

## 5. Performance Testing

### Tools
- **Lighthouse CI**: For performance audits
- **Web Vitals**: For Core Web Vitals monitoring

### What to Test
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Time to Interactive (TTI)
- Bundle size

## 6. Accessibility Testing

### Tools
- **axe-core**: For automated accessibility testing
- **@testing-library/jest-dom**: For accessibility matchers
- **Lighthouse**: For accessibility audits

### What to Test
- Keyboard navigation
- Screen reader compatibility
- Color contrast
- ARIA attributes

## 7. Test Coverage

### Goals
- 80%+ unit test coverage
- 70%+ integration test coverage
- Critical user flows covered by E2E tests
- Visual regression tests for all UI components

### Coverage Reporting
- **Vitest** for unit/integration coverage
- **Cypress** for E2E coverage (if applicable)
- **Codecov** for coverage reporting

## 8. CI/CD Integration

### GitHub Actions Workflow
```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm test -- --coverage
      
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          CYPRESS_RECORD_KEY: ${{ secrets.CYPRESS_RECORD_KEY }}
      
      - name: Run visual tests
        run: npm run test:visual
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## 9. Testing Best Practices

1. **Write tests first** when fixing bugs
2. Test behavior, not implementation
3. Use meaningful test descriptions
4. Keep tests isolated and independent
5. Mock external dependencies
6. Test edge cases and error states
7. Run tests in CI on every push/PR
8. Keep tests fast and reliable

## 10. Common Test Patterns

### Mocking API Calls with MSW

```typescript
import { setupServer } from 'msw/node';
import { rest } from 'msw';

const server = setupServer(
  rest.get('/api/user', (req, res, ctx) => {
    return res(
      ctx.json({ id: 1, name: 'Test User' })
    );
  })
);

describe('UserProfile', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('displays user data', async () => {
    render(<UserProfile userId={1} />);
    expect(await screen.findByText('Test User')).toBeInTheDocument();
  });
});
```

### Testing Hooks

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  it('increments counter', () => {
    const { result } = renderHook(() => useCounter());
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
  });
});
```

## 11. Performance Optimization

### Tools
- **Webpack Bundle Analyzer**: For bundle analysis
- **Lighthouse CI**: For performance budgets
- **React DevTools Profiler**: For React performance analysis

### Strategies
- Code splitting with React.lazy()
- Memoization with React.memo and useMemo
- Virtualization for large lists
- Image optimization
- Tree shaking and dead code elimination

## 12. Monitoring and Maintenance

### Tools
- **Sentry**: For error tracking
- **LogRocket**: For session replay
- **Google Analytics**: For user behavior tracking

### Metrics to Monitor
- Test coverage trends
- Test execution time
- Flaky tests
- Performance metrics
- Error rates

## 13. Getting Started

### Setup
```bash
# Install dependencies
npm install

# Run unit tests
npm test

# Run E2E tests
npm run test:e2e

# Run visual tests
npm run test:visual

# Run performance tests
npm run test:performance
```

### Writing Your First Test
1. Identify what to test
2. Create a test file with `.test.tsx` or `.spec.tsx` extension
3. Write test cases using the patterns above
4. Run tests and ensure they pass
5. Submit a pull request with test coverage

## 14. Troubleshooting

### Common Issues
- **Tests are flaky**: Ensure tests are isolated and don't share state
- **Slow tests**: Mock expensive operations and network requests
- **False positives**: Avoid testing implementation details
- **Type errors**: Keep type definitions up to date

### Getting Help
- Check the [Testing Library documentation](https://testing-library.com/)
- Review the [Vitest documentation](https://vitest.dev/)
- Consult the [Cypress documentation](https://docs.cypress.io/)
- Ask for help in the team's development channel
