import React, { ReactNode } from 'react';
import { useForm, FormProvider as RHFProvider, SubmitHandler, UseFormReturn, FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z, ZodTypeAny } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { formatValidationErrors, validators, VALIDATION_MESSAGES } from '@/lib/validators';

interface EnhancedFormProps<T extends FieldValues> {
  /**
   * The form schema using Zod for validation
   */
  schema: ZodTypeAny;
  /**
   * Form submission handler
   */
  onSubmit: SubmitHandler<T>;
  /**
   * Form children (form fields)
   */
  children: ReactNode | ((methods: UseFormReturn<T>) => ReactNode);
  /**
   * Optional class name for the form element
   */
  className?: string;
  /**
   * Form submission loading state
   */
  isLoading?: boolean;
  /**
   * Form submission error message
   */
  submitError?: string | null;
  /**
   * Form submission success state
   */
  submitSuccess?: boolean;
  /**
   * Success message to display on successful submission
   */
  successMessage?: string;
  /**
   * Optional reset form after successful submission
   */
  resetOnSubmit?: boolean;
  /**
   * Default form values
   */
  defaultValues?: Partial<T>;
  /**
   * Optional mode for form validation
   * @default 'onSubmit'
   */
  mode?: 'onSubmit' | 'onBlur' | 'onChange' | 'onTouched';
}

/**
 * EnhancedForm component that provides form validation, loading states,
 * and accessible error messages out of the box.
 */
function EnhancedForm<T extends FieldValues>({
  schema,
  onSubmit,
  children,
  className,
  isLoading = false,
  submitError,
  submitSuccess = false,
  successMessage = 'Form submitted successfully!',
  resetOnSubmit = false,
  defaultValues,
  mode = 'onSubmit',
}: EnhancedFormProps<T>) {
  const methods = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as any,
    mode,
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = methods;

  const handleFormSubmit: SubmitHandler<T> = async (data) => {
    try {
      await onSubmit(data);
      if (resetOnSubmit) {
        reset();
      }
    } catch (error) {
      // Error is handled by the submitError prop
      console.error('Form submission error:', error);
    }
  };

  // Format errors for display
  const formattedErrors = formatValidationErrors(errors);

  return (
    <RHFProvider {...methods}>
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className={cn('space-y-6', className)}
        noValidate
      >
        {/* Form fields */}
        {typeof children === 'function' ? children(methods) : children}

        {/* Form submission feedback */}
        <AnimatePresence>
          {submitError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-4 text-sm text-red-700 bg-red-100 rounded-lg"
              role="alert"
              aria-live="assertive"
            >
              {submitError}
            </motion.div>
          )}

          {submitSuccess && successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-4 text-sm text-green-700 bg-green-100 rounded-lg"
              role="status"
              aria-live="polite"
            >
              {successMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className={cn(
              'px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md',
              'hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-colors duration-200',
              'inline-flex items-center justify-center',
              'min-w-[120px]' // Ensure consistent button width
            )}
            aria-busy={isSubmitting || isLoading}
          >
            {(isSubmitting || isLoading) ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit'
            )}
          </button>
        </div>
      </form>
    </RHFProvider>
  );
}

// Export the form context for use with useFormContext
export { useFormContext } from 'react-hook-form';

export default EnhancedForm;
