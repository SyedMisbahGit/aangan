# Aangan Frontend API Reference

## Table of Contents
- [Loading Components](#loading-components)
- [Form Components](#form-components)
- [Error Handling](#error-handling)
- [Utilities](#utilities)

---

## Loading Components

### `Loading`
A customizable loading spinner.

**Props:**
- `variant`: 'default' | 'primary' | 'secondary' | 'destructive' | 'success'
- `size`: 'sm' | 'default' | 'lg' | 'xl' | '2xl'
- `text`: string (default: 'Loading...')
- `fullScreen`: boolean (default: false)

### `LoadingWrapper`
Shows a loading overlay over content.

**Props:**
- `isLoading`: boolean (required)
- `message`: string
- `fullScreen`: boolean (default: false)
- `blurContent`: boolean (default: false)

### `LoadingProvider` & `useLoading`
Manages global loading states.

```typescript
const { showLoading, hideLoading, isLoading } = useLoading();
```

---

## Form Components

### `EnhancedForm`
Form with validation and error handling.

**Props:**
- `schema`: Zod schema (required)
- `onSubmit`: (data, helpers) => Promise
- `defaultValues`: object
- `mode`: 'onSubmit' | 'onBlur' | 'onChange'

**Example:**
```tsx
<EnhancedForm
  schema={formSchema}
  onSubmit={async (data, { reset }) => {
    await api.submit(data);
    reset();
  }}
>
  {({ register, formState: { errors } }) => (
    <>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
      <button type="submit">Submit</button>
    </>
  )}
</EnhancedForm>
```

---

## Error Handling

### `useErrorHandler`
Handles errors consistently.

```typescript
const { handleError, withErrorHandling } = useErrorHandler();

// Basic usage
handleError(error, {
  errorMessage: 'Custom message',
  redirectTo: '/error',
});

// With async function
const result = await withErrorHandling(
  () => api.fetchData(),
  { errorMessage: 'Fetch failed' }
);
```

### `ErrorBoundary`
Catches React component errors.

```tsx
<ErrorBoundary>
  <ComponentThatMightError />
</ErrorBoundary>
```

---

## Utilities

### Validation

```typescript
// Create field schema
const fieldSchema = createFieldSchema('string', {
  required: true,
  minLength: 3,
  pattern: {
    value: /^[A-Za-z]+$/,
    message: 'Letters only'
  }
});

// Format validation errors
const errors = formatValidationErrors(validationResult);
```

### Error Utilities

```typescript
// Create standardized error
const error = createError(
  'Not found',
  'NOT_FOUND',
  404,
  { resource: 'user' },
  true // isRetryable
);

// Handle API errors
const { error } = handleApiError(err, 'User API');

// Retry with backoff
const result = await withRetry(
  () => fetchData(),
  { maxRetries: 3 }
);
```

### Type Definitions

```typescript
interface AppError extends Error {
  code?: string;
  status?: number;
  details?: Record<string, unknown>;
  isRetryable?: boolean;
  retryAfter?: number;
}

interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  exponentialBackoff?: boolean;
  backoffFactor?: number;
  isRetryable?: (error: unknown) => boolean;
  onRetry?: (error: unknown, attempt: number, delay: number) => void;
}
```

---

## Best Practices

1. **Form Validation**
   - Use Zod for schema validation
   - Provide clear error messages
   - Validate on blur for better UX

2. **Error Handling**
   - Use `useErrorHandler` for consistent error handling
   - Log errors with context
   - Provide user-friendly messages

3. **Loading States**
   - Use `LoadingWrapper` for page-level loading
   - Use `useLoading` for component-level loading
   - Show loading indicators for async operations

4. **Type Safety**
   - Define TypeScript interfaces for all props and state
   - Use type guards for runtime type checking
   - Leverage Zod for runtime validation

---

## Troubleshooting

### Common Issues

1. **Form not validating**
   - Ensure the Zod schema is correctly defined
   - Check that form fields match schema keys
   - Verify the form's `mode` prop is set appropriately

2. **Loading state not updating**
   - Check for unhandled promise rejections
   - Ensure `hideLoading` is called in all code paths
   - Verify the loading key matches between show/hide calls

3. **Error handling not working**
   - Check that errors are being properly thrown
   - Verify error boundaries are set up correctly
   - Ensure error messages are properly propagated

For additional help, refer to the source code or open an issue.
