import { validationResult } from 'express-validator';
import logger from './secureLogger';

/**
 * Async handler wrapper that catches errors and passes them to Express error handling
 * @param {Function} fn - Async route handler function
 * @returns {Function} Wrapped route handler with error handling
 */
export const asyncHandler = (fn) => (req, res, next) => {
  return Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Validates request against validation rules and returns errors if any
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {boolean} True if validation passed, false otherwise
 */
export const validateRequest = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation failed', { 
      path: req.path, 
      method: req.method,
      errors: errors.array() 
    });
    
    res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
        value: err.value
      }))
    });
    return false;
  }
  return true;
};

/**
 * Standard success response formatter
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 * @returns {Object} Formatted JSON response
 */
export const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Standard error response formatter
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {Error} error - Original error object (optional)
 * @param {string} errorCode - Application-specific error code (optional)
 * @returns {Object} Formatted JSON error response
 */
export const errorResponse = (res, message, statusCode = 500, error = null, errorCode = null) => {
  if (error) {
    logger.error(message, { 
      statusCode, 
      error: error.message, 
      stack: error.stack,
      path: res.req?.path,
      method: res.req?.method
    });
  } else {
    logger.warn(message, { statusCode });
  }

  return res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' && error ? error.message : undefined,
    errorCode,
    ...(process.env.NODE_ENV === 'development' && error ? { stack: error.stack } : {})
  });
};

/**
 * Wrapper for route handlers with standardized error handling
 * @param {Function} handler - Route handler function
 * @param {Object} options - Configuration options
 * @param {Array} options.validators - Array of express-validator validators
 * @param {string} options.resourceName - Name of the resource for logging
 * @returns {Function} Wrapped route handler
 */
export const createRouteHandler = (handler, { validators = [], resourceName = 'resource' } = {}) => {
  return async (req, res, next) => {
    try {
      // Run validators if provided
      if (validators.length > 0) {
        await Promise.all(validators.map(validator => validator.run(req)));
        if (!validateRequest(req, res)) return;
      }

      // Execute the handler
      const result = await handler(req, res, next);
      
      // If handler didn't send a response, send a success response
      if (!res.headersSent) {
        successResponse(res, result);
      }
    } catch (error) {
      // If error is an instance of our custom error class, use its status code
      const statusCode = error.statusCode || 500;
      const errorCode = error.errorCode || 'UNKNOWN_ERROR';
      
      errorResponse(
        res, 
        error.message || `Failed to process ${resourceName}`, 
        statusCode, 
        error,
        errorCode
      );
    }
  };
};

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(message, statusCode = 500, errorCode = 'API_ERROR') {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 404 Not Found error
 */
export class NotFoundError extends ApiError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

/**
 * 403 Forbidden error
 */
export class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

/**
 * 401 Unauthorized error
 */
export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

/**
 * 400 Bad Request error
 */
export class BadRequestError extends ApiError {
  constructor(message = 'Bad Request') {
    super(message, 400, 'BAD_REQUEST');
  }
}
