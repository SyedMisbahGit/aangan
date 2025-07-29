# Code Organization & Linting Guidelines

This document outlines the code organization patterns and linting rules for the College Whisper platform.

## Table of Contents

- [Directory Structure](#directory-structure)
- [Component Organization](#component-organization)
- [Utility Functions](#utility-functions)
- [Testing Guidelines](#testing-guidelines)
- [Linting Rules](#linting-rules)
- [Best Practices](#best-practices)

## Directory Structure

```text
frontend/
├── src/
│   ├── components/      # Reusable UI components
│   ├── contexts/        # React context providers
│   ├── utils/           # Utility functions and helpers
│   ├── __tests__/       # Test utilities and setup
│   └── ...
```

## Component Organization

1. **Component Files**
   - One component per file
   - Use PascalCase for component filenames (e.g., `UserProfile.tsx`)
   - Keep components small and focused on a single responsibility

2. **Exports**
   - Use named exports for components
   - Export types/interfaces used by the component in the same file
   - For components with multiple exports, use an `index.ts` file

## Utility Functions

1. **Location**
   - Place utility functions in the `utils` directory
   - Group related utilities in the same file
   - Use descriptive filenames (e.g., `routeUtils.ts`, `stringUtils.ts`)

2. **Naming**
   - Use camelCase for function names
   - Be descriptive about what the function does
   - Export functions individually for better tree-shaking

## Testing Guidelines

1. **Test Files**
   - Place test files next to the code they test with `.test.tsx` or `.test.ts` extension
   - For test utilities, place them in `__tests__` directory

2. **Best Practices**
   - Mock external dependencies
   - Test component rendering and interactions
   - Test error boundaries and edge cases
   - Keep tests focused and independent

## Linting Rules

1. **ESLint Configuration**
   - Uses `@typescript-eslint` for TypeScript support
   - React Hooks rules enabled
   - Strict type-checking with TypeScript

2. **Common Rules**
   - No `console` statements in production code
   - Consistent return types
   - No unused variables
   - Proper TypeScript types for all variables and functions

3. **Auto-fixable Issues**

   Run the following to automatically fix fixable issues:

   ```bash
   npm run lint:fix
   ```

## Best Practices

1. **Error Handling**
   - Use proper error boundaries for React components
   - Log errors appropriately (using a logging service)
   - Provide meaningful error messages

2. **Performance**
   - Use React.memo for expensive components
   - Implement proper dependency arrays for hooks
   - Avoid inline function definitions in JSX

3. **Code Style**
   - Use TypeScript for type safety
   - Follow the Airbnb JavaScript Style Guide
   - Use Prettier for consistent code formatting

## Commit Message Guidelines

Follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages:

```text
<type>[optional scope]: <description>

[optional body]

[optional footer]
```

Example:

```text
fix(header): resolve navigation flicker on mobile

- Fixed issue with mobile menu not closing after navigation
- Added transition effects for smoother experience

Fixes #123
```
