import { z } from 'zod';
import { isAfter, isBefore, isDate, parseISO } from 'date-fns';

/**
 * Common validation messages used across the application
 */
export const VALIDATION_MESSAGES = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  minLength: (length: number) => `Must be at least ${length} characters`,
  maxLength: (length: number) => `Must be at most ${length} characters`,
  min: (min: number) => `Must be at least ${min}`,
  max: (max: number) => `Must be at most ${max}`,
  url: 'Please enter a valid URL',
  passwordMismatch: 'Passwords do not match',
  invalidDate: 'Please enter a valid date',
  dateInFuture: 'Date must be in the future',
  dateInPast: 'Date must be in the past',
  invalidNumber: 'Please enter a valid number',
  positiveNumber: 'Must be a positive number',
  integer: 'Must be a whole number',
} as const;

/**
 * Schema for validating email addresses
 */
export const emailSchema = z
  .string()
  .min(1, { message: VALIDATION_MESSAGES.required })
  .email({ message: VALIDATION_MESSAGES.email });

/**
 * Schema for validating passwords
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export const passwordSchema = z
  .string()
  .min(8, { message: VALIDATION_MESSAGES.minLength(8) })
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character');

/**
 * Schema for validating usernames
 * - 3-30 characters
 * - Alphanumeric with underscores and hyphens
 */
export const usernameSchema = z
  .string()
  .min(3, { message: VALIDATION_MESSAGES.minLength(3) })
  .max(30, { message: VALIDATION_MESSAGES.maxLength(30) })
  .regex(/^[a-zA-Z0-9_-]+$/, 'Can only contain letters, numbers, underscores, and hyphens');

/**
 * Schema for validating URLs
 */
export const urlSchema = z
  .string()
  .url({ message: VALIDATION_MESSAGES.url })
  .refine(
    (url) => {
      try {
        const { protocol } = new URL(url);
        return protocol === 'http:' || protocol === 'https:';
      } catch {
        return false;
      }
    },
    { message: 'URL must start with http:// or https://' }
  );

/**
 * Schema for validating dates in the future
 */
export const futureDateSchema = z.string().refine(
  (dateString) => {
    try {
      const date = parseISO(dateString);
      return isAfter(date, new Date());
    } catch {
      return false;
    }
  },
  { message: VALIDATION_MESSAGES.dateInFuture }
);

/**
 * Schema for validating dates in the past
 */
export const pastDateSchema = z.string().refine(
  (dateString) => {
    try {
      const date = parseISO(dateString);
      return isBefore(date, new Date());
    } catch {
      return false;
    }
  },
  { message: VALIDATION_MESSAGES.dateInPast }
);

/**
 * Schema for validating positive numbers
 */
export const positiveNumberSchema = z
  .number()
  .positive({ message: VALIDATION_MESSAGES.positiveNumber });

/**
 * Schema for validating integers
 */
export const integerSchema = z
  .number()
  .int({ message: VALIDATION_MESSAGES.integer });

/**
 * Helper function to create a validation schema for a field with custom rules
 */
type ValidationRules = {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: {
    value: RegExp;
    message: string;
  };
  validate?: (value: any) => boolean | string;
};

export function createFieldSchema(
  type: 'string' | 'number' | 'date' | 'email' | 'url' = 'string',
  rules: ValidationRules = {}
) {
  let schema = type === 'string' 
    ? z.string() 
    : type === 'number' 
      ? z.number() 
      : type === 'date' 
        ? z.string() 
        : type === 'email' 
          ? emailSchema 
          : urlSchema;

  // Apply common validation rules
  if (rules.required) {
    schema = schema.min(1, { message: VALIDATION_MESSAGES.required });
  }

  if (rules.minLength !== undefined && type === 'string') {
    schema = schema.min(rules.minLength, { 
      message: VALIDATION_MESSAGES.minLength(rules.minLength) 
    });
  }

  if (rules.maxLength !== undefined && type === 'string') {
    schema = schema.max(rules.maxLength, { 
      message: VALIDATION_MESSAGES.maxLength(rules.maxLength) 
    });
  }

  if (rules.pattern) {
    schema = schema.refine(
      (val) => rules.pattern!.value.test(val as string),
      { message: rules.pattern.message }
    );
  }

  if (rules.validate) {
    schema = schema.refine(
      (val) => {
        const result = rules.validate!(val);
        return result === true || typeof result === 'undefined';
      },
      { message: typeof rules.validate('') === 'string' ? rules.validate('') as string : 'Validation failed' }
    );
  }

  return schema;
}

/**
 * Utility function to format validation errors for display
 */
export function formatValidationErrors(errors: Record<string, any>): Record<string, string> {
  const formatted: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(errors)) {
    if (value && typeof value === 'object' && 'message' in value) {
      formatted[key] = value.message as string;
    } else if (Array.isArray(value) && value.length > 0) {
      formatted[key] = value[0];
    } else if (typeof value === 'string') {
      formatted[key] = value;
    }
  }
  
  return formatted;
}

/**
 * Custom validation functions
 */
export const validators = {
  /**
   * Validates that a field matches another field's value
   */
  matchField: (fieldName: string, message?: string) => 
    (value: any, formValues: any) => 
      value === formValues[fieldName] || (message || 'Fields do not match'),
  
  /**
   * Validates that a value is one of the allowed values
   */
  oneOf: <T extends readonly any[]>(allowedValues: T, message?: string) =>
    (value: any) =>
      allowedValues.includes(value) || (message || `Must be one of: ${allowedValues.join(', ')}`),
  
  /**
   * Validates that a string is a valid date in the future
   */
  futureDate: (value: string) => {
    try {
      const date = parseISO(value);
      return isAfter(date, new Date()) || VALIDATION_MESSAGES.dateInFuture;
    } catch {
      return VALIDATION_MESSAGES.invalidDate;
    }
  },
  
  /**
   * Validates that a string is a valid date in the past
   */
  pastDate: (value: string) => {
    try {
      const date = parseISO(value);
      return isBefore(date, new Date()) || VALIDATION_MESSAGES.dateInPast;
    } catch {
      return VALIDATION_MESSAGES.invalidDate;
    }
  },
};

export default {
  emailSchema,
  passwordSchema,
  usernameSchema,
  urlSchema,
  futureDateSchema,
  pastDateSchema,
  positiveNumberSchema,
  integerSchema,
  createFieldSchema,
  formatValidationErrors,
  validators,
  VALIDATION_MESSAGES,
};
