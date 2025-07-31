import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { z } from 'zod';
import { EnhancedForm } from '@/components/shared/EnhancedForm';
import { LoadingProvider } from '@/contexts/LoadingContext';
import { ErrorHandlerProvider } from '@/hooks/useErrorHandler';

// Mock API
const mockApi = {
  submitForm: vi.fn().mockResolvedValue({ success: true }),
};

// Test form component
const TestForm = () => {
  const formSchema = z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(8, 'Password too short'),
  });

  const handleSubmit = async (data: any) => {
    await mockApi.submitForm(data);
    return { success: true };
  };

  return (
    <ErrorHandlerProvider>
      <LoadingProvider>
        <EnhancedForm schema={formSchema} onSubmit={handleSubmit}>
          {({ register, formState: { errors } }) => (
            <div>
              <input data-testid="email" {...register('email')} />
              {errors.email && <span data-testid="error">{errors.email.message}</span>}
              <button type="submit" data-testid="submit">Submit</button>
            </div>
          )}
        </EnhancedForm>
      </LoadingProvider>
    </ErrorHandlerProvider>
  );
};

describe('Form Integration Test', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('submits form with valid data', async () => {
    render(<TestForm />);
    
    fireEvent.change(screen.getByTestId('email'), {
      target: { value: 'test@example.com' },
    });
    
    await act(async () => {
      fireEvent.click(screen.getByTestId('submit'));
    });
    
    expect(mockApi.submitForm).toHaveBeenCalledWith({
      email: 'test@example.com'
    });
  });

  it('shows validation errors', async () => {
    render(<TestForm />);
    
    fireEvent.change(screen.getByTestId('email'), {
      target: { value: 'invalid' },
    });
    
    await act(async () => {
      fireEvent.click(screen.getByTestId('submit'));
    });
    
    expect(screen.getByTestId('error')).toHaveTextContent('Invalid email');
    expect(mockApi.submitForm).not.toHaveBeenCalled();
  });
});
