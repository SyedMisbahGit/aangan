# Error Handling & Logging System

This document outlines the error handling and logging architecture implemented in the Aangan platform.

## Overview

The error handling system is designed to provide consistent error reporting, logging, and user feedback across the application. It consists of:

1. **Centralized Error Handling** (`errorUtils.ts`)
2. **Logging Utility** (`logger.ts`)
3. **React Error Boundaries**
4. **API Error Handling**

## Error Handling Components

### 1. errorUtils.ts

Located at `frontend/src/lib/errorUtils.ts`, this module provides:

- `getErrorMessage`: Safely extracts error messages from various error types
- `isExpectedError`: Type guard for expected error types
- `handleError`: Centralized error handling function

### 2. logger.ts

Located at `frontend/src/lib/logger.ts`, this module provides:

- Production-safe logging
- Different log levels (debug, info, warn, error)
- Structured logging for better analysis

### 3. React Error Boundaries

Custom error boundary components that:
- Catch JavaScript errors in their child component tree
- Log those errors
- Display a fallback UI when errors occur

### 4. API Error Handling

Consistent error responses from the API:
```typescript
{
  success: boolean;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  data?: any;
}
```

## Usage Examples

### Basic Error Handling

```typescript
try {
  // Your code here
} catch (error) {
  const message = getErrorMessage(error);
  logger.error('Operation failed', { error, context: 'componentName' });
  // Show user-friendly error
}
```

### React Error Boundary

```typescript
<ErrorBoundary 
  fallback={<ErrorFallback />}
  onError={(error, errorInfo) => {
    logger.error('Component tree crashed', { error, errorInfo });
  }}
>
  <YourComponent />
</ErrorBoundary>
```

## Best Practices

1. **Always handle errors at the appropriate level**
   - UI errors: Handle in the component
   - Data fetching: Handle in the data layer
   - Critical errors: Let them bubble up to the nearest error boundary

2. **Use meaningful error messages**
   - Include relevant context
   - Avoid exposing sensitive information
   - Use error codes for programmatic handling

3. **Log appropriately**
   - Use appropriate log levels
   - Include relevant context
   - Be mindful of logging sensitive data

## Monitoring and Alerting

In production, logs are collected and can be monitored through:

- **Frontend**: Error tracking service (e.g., Sentry)
- **Backend**: Centralized logging system

## Troubleshooting

Common issues and solutions:

1. **Missing error messages**
   - Check the browser console
   - Verify error boundaries are properly implemented
   - Ensure error objects are properly serialized

2. **Logs not appearing**
   - Check log level configuration
   - Verify logging service is properly initialized
   - Check network requests for failed log submissions
