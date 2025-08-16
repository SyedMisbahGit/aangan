# Backend Testing Guide

## Table of Contents
1. [Testing Framework](#testing-framework)
2. [Test Structure](#test-structure)
3. [Running Tests](#running-tests)
4. [Writing Tests](#writing-tests)
5. [Error Handling in Tests](#error-handling-in-tests)
6. [Mocking](#mocking)
7. [Test Coverage](#test-coverage)
8. [Debugging Tests](#debugging-tests)
9. [Best Practices](#best-practices)

## Testing Framework

We use **Vitest** as our testing framework with the following key features:
- ESM module support
- Jest-compatible API
- Built-in code coverage
- Watch mode for development

## Test Structure

```
backend/
  src/
    __tests__/
      routes/
        auth.routes.test.ts    # Authentication route tests
      services/
        auth.service.test.ts   # Service layer tests
      utils/
        validation.test.ts     # Utility function tests
      integration/
        auth.flow.test.ts      # Integration tests
```

## Running Tests

### Run All Tests
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage
```

### Run Specific Tests
```bash
# Run a specific test file
npx vitest run src/__tests__/routes/auth.routes.test.ts

# Run tests matching a pattern
npx vitest run -t "should return 400 for invalid input"
```

### Watch Mode
```bash
# Run in watch mode (development)
npm run test:watch
```

## Writing Tests

### Test File Structure
```typescript
import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../app';
import * as authService from '../../services/auth.service';

// Mock dependencies
vi.mock('../../services/auth.service');

describe('Auth Routes', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      // Test implementation
    });

    it('should return 400 for invalid input', async () => {
      // Test implementation
    });
  });
});
```

## Error Handling in Tests

### Testing Error Responses
When testing error cases, ensure:
1. The correct HTTP status code is returned
2. The error response has the expected structure
3. Error messages are appropriate and helpful

Example:
```typescript
it('should return 400 for invalid input', async () => {
  const validationErrors = [
    { path: 'email', msg: 'Invalid email format' },
    { path: 'password', msg: 'Password must be at least 6 characters' },
    { path: 'name', msg: 'Name is required' }
  ];
  
  const validationError = new Error('Validation failed');
  validationError.name = 'ValidationError';
  validationError.statusCode = 400;
  validationError.errors = validationErrors;
  
  // Mock the service to throw a validation error
  vi.mocked(authService.register).mockRejectedValue(validationError);

  const response = await request(app)
    .post('/api/auth/register')
    .send({
      email: 'invalid-email',
      password: '123',
      name: '',
    });

  expect(response.status).toBe(400);
  expect(response.body).toHaveProperty('error');
  expect(response.body.error).toHaveProperty('status', 400);
  expect(response.body.error).toHaveProperty('message', 'Validation failed');
  expect(Array.isArray(response.body.error.details)).toBe(true);
});
```

## Mocking

### Mocking Services
```typescript
// Mock an entire module
vi.mock('../../services/auth.service');

// Mock a specific function
vi.mocked(authService.register).mockResolvedValue({
  id: '123',
  email: 'test@example.com',
  name: 'Test User'
});

// Mock a rejected promise
vi.mocked(authService.login).mockRejectedValue(
  new Error('Invalid credentials')
);
```

### Mocking Dependencies
```typescript
import * as emailService from '../../services/email.service';

// Mock a dependency
vi.mock('../../services/email.service', () => ({
  sendWelcomeEmail: vi.fn().mockResolvedValue(true)
}));
```

## Test Coverage

### Generating Coverage Report
```bash
npm run test:coverage
```

### Coverage Configuration
Coverage thresholds are defined in `vite.config.test.js`:

```javascript
export default defineConfig({
  test: {
    coverage: {
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80
      }
    }
  }
});
```

## Debugging Tests

### Debugging with Chrome DevTools
1. Add `debugger` statements in your test or code
2. Run tests in debug mode:
   ```bash
   node --inspect-brk node_modules/vitest/vitest.mjs run
   ```
3. Open Chrome and navigate to `chrome://inspect`
4. Click on "Open dedicated DevTools for Node"
5. Click the resume button to start debugging

### Debugging with VS Code
1. Add this configuration to your `launch.json`:
   ```json
   {
     "type": "node",
     "request": "launch",
     "name": "Debug Tests",
     "runtimeExecutable": "npm",
     "runtimeArgs": ["test"],
     "skipFiles": ["<node_internals>/**"],
     "console": "integratedTerminal"
   }
   ```
2. Set breakpoints in your test or code
3. Press F5 to start debugging

## Best Practices

1. **Test Naming**: Use descriptive test names that explain the expected behavior
2. **AAA Pattern**: Structure tests with Arrange-Act-Assert
3. **Test Isolation**: Each test should be independent and not rely on state from other tests
4. **Clean Up**: Reset mocks and clear test data after each test
5. **Mock External Services**: Never make real API calls in tests
6. **Test Edge Cases**: Include tests for error conditions and edge cases
7. **Keep Tests Fast**: Avoid unnecessary I/O operations in tests
8. **Use Snapshots Sparingly**: Prefer explicit assertions over snapshots for better maintainability

### Example of a Well-Structured Test

```typescript
describe('User Service', () => {
  describe('createUser', () => {
    it('should create a new user with valid data', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        password: 'securePassword123',
        name: 'Test User'
      };
      
      // Act
      const result = await userService.createUser(userData);
      
      // Assert
      expect(result).toHaveProperty('id');
      expect(result.email).toBe(userData.email);
      expect(result.name).toBe(userData.name);
      expect(result).not.toHaveProperty('password'); // Password should be hashed and not returned
    });
  });
});
```

## Common Issues and Solutions

### ESM Module Issues
If you encounter ESM-related errors:
1. Ensure `"type": "module"` is set in `package.json`
2. Use file extensions in imports (e.g., `import { app } from '../../app.js'`)
3. Check that all dependencies support ESM

### Test Timeouts
If tests are timing out:
1. Increase the test timeout:
   ```typescript
   it('should complete within 10 seconds', async () => {
     // Test implementation
   }, 10000); // 10 second timeout
   ```
2. Check for unhandled promises or hanging connections
3. Ensure all async operations are properly awaited

### Debugging Hanging Tests
If a test hangs:
1. Add `--no-watch` to disable watch mode
2. Use `--run` to run tests serially
3. Add `--single-thread` to isolate the issue
4. Add logging to identify where the test is getting stuck

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
