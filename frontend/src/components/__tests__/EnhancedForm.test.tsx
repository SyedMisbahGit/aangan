import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { z } from 'zod';
import { EnhancedForm } from '../shared/EnhancedForm';
import { act } from 'react-dom/test-utils';

// Mock the Loading component
vi.mock('@/components/ui/loading', () => ({
  Loading: ({ text }: { text?: string }) => (
    <div data-testid="loading">{text || 'Loading...'}</div>
  ),
}));

// Mock the toast notification
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe('EnhancedForm', () => {
  const mockOnSubmit = vi.fn();
  const formSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    email: z.string().email('Invalid email address'),
  });

  const renderForm = (props = {}) => {
    const defaultProps = {
      schema: formSchema,
      onSubmit: mockOnSubmit,
      ...props,
    };

    return render(
      <EnhancedForm {...defaultProps}>
        {({ register, formState: { errors } }) => (
          <>
            <div>
              <label htmlFor="username">Username</label>
              <input
                id="username"
                data-testid="username"
                {...register('username')}
              />
              {errors.username && (
                <span data-testid="username-error">
                  {errors.username.message}
                </span>
              )}
            </div>
            <div>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                data-testid="email"
                {...register('email')}
              />
              {errors.email && (
                <span data-testid="email-error">
                  {errors.email.message}
                </span>
              )}
            </div>
            <button type="submit" data-testid="submit">
              Submit
            </button>
          </>
        )}
      </EnhancedForm>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form with children', () => {
    renderForm();
    
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByTestId('submit')).toBeInTheDocument();
  });

  it('validates form fields on submit', async () => {
    renderForm();
    
    // Submit the form without filling any fields
    fireEvent.click(screen.getByTestId('submit'));
    
    // Check for validation errors
    await waitFor(() => {
      expect(screen.getByTestId('username-error')).toHaveTextContent(
        'Username must be at least 3 characters'
      );
      expect(screen.getByTestId('email-error')).toHaveTextContent(
        'Invalid email address'
      );
    });
    
    // The submit handler should not be called
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with form data when validation passes', async () => {
    const formData = {
      username: 'testuser',
      email: 'test@example.com',
    };
    
    renderForm();
    
    // Fill in the form
    fireEvent.change(screen.getByTestId('username'), {
      target: { value: formData.username },
    });
    
    fireEvent.change(screen.getByTestId('email'), {
      target: { value: formData.email },
    });
    
    // Submit the form
    fireEvent.click(screen.getByTestId('submit'));
    
    // The submit handler should be called with the form data
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(formData, expect.anything());
    });
  });

  it('shows loading state when isLoading is true', async () => {
    renderForm({ isLoading: true });
    
    // The loading component should be visible
    expect(screen.getByTestId('loading')).toHaveTextContent('Submitting...');
    
    // The submit button should be disabled
    expect(screen.getByTestId('submit')).toBeDisabled();
  });

  it('shows submit error when provided', () => {
    const errorMessage = 'Submission failed';
    renderForm({ submitError: errorMessage });
    
    // The error message should be visible
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('shows success message when submitSuccess is true', () => {
    const successMessage = 'Form submitted successfully!';
    renderForm({ submitSuccess: true, successMessage });
    
    // The success message should be visible
    expect(screen.getByText(successMessage)).toBeInTheDocument();
  });

  it('resets the form when resetOnSubmit is true', async () => {
    const formData = {
      username: 'testuser',
      email: 'test@example.com',
    };
    
    renderForm({ 
      resetOnSubmit: true,
      onSubmit: async (_, { reset }) => {
        reset();
      },
    });
    
    // Fill in the form
    fireEvent.change(screen.getByTestId('username'), {
      target: { value: formData.username },
    });
    
    fireEvent.change(screen.getByTestId('email'), {
      target: { value: formData.email },
    });
    
    // Submit the form
    fireEvent.click(screen.getByTestId('submit'));
    
    // The form should be reset after submission
    await waitFor(() => {
      expect(screen.getByTestId('username')).toHaveValue('');
      expect(screen.getByTestId('email')).toHaveValue('');
    });
  });

  it('handles async form submission', async () => {
    const formData = {
      username: 'testuser',
      email: 'test@example.com',
    };
    
    // Mock an async submission
    const asyncSubmit = vi.fn().mockImplementation(
      () => new Promise((resolve) => {
        setTimeout(() => {
          resolve({ success: true });
        }, 100);
      })
    );
    
    renderForm({ onSubmit: asyncSubmit });
    
    // Fill in the form
    fireEvent.change(screen.getByTestId('username'), {
      target: { value: formData.username },
    });
    
    fireEvent.change(screen.getByTestId('email'), {
      target: { value: formData.email },
    });
    
    // Submit the form
    await act(async () => {
      fireEvent.click(screen.getByTestId('submit'));
      
      // The form should be in a submitting state
      expect(screen.getByTestId('submit')).toBeDisabled();
      
      // Wait for the async operation to complete
      await new Promise((resolve) => setTimeout(resolve, 150));
    });
    
    // The submit handler should have been called
    expect(asyncSubmit).toHaveBeenCalledWith(
      formData,
      expect.objectContaining({
        reset: expect.any(Function),
      })
    );
  });
});
