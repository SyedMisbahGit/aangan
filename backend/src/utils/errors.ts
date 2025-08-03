/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  statusCode: number;
  errorCode: string;

  constructor(message: string, statusCode: number = 500, errorCode: string = 'API_ERROR') {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * 400 Bad Request error
 */
export class BadRequestError extends ApiError {
  context?: Record<string, any>;

  constructor(
    message: string = 'Bad Request', 
    errorCode: string = 'BAD_REQUEST',
    context?: Record<string, any>
  ) {
    super(message, 400, errorCode);
    this.context = context;
  }
}

/**
 * 401 Unauthorized error
 */
export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Unauthorized', errorCode: string = 'UNAUTHORIZED') {
    super(message, 401, errorCode);
  }
}

/**
 * 403 Forbidden error
 */
export class ForbiddenError extends ApiError {
  constructor(message: string = 'Forbidden', errorCode: string = 'FORBIDDEN') {
    super(message, 403, errorCode);
  }
}

/**
 * 404 Not Found error
 */
export class NotFoundError extends ApiError {
  constructor(resource: string = 'Resource', errorCode: string = 'NOT_FOUND') {
    super(`${resource} not found`, 404, errorCode);
  }
}

/**
 * 409 Conflict error
 */
export class ConflictError extends ApiError {
  constructor(message: string = 'Conflict', errorCode: string = 'CONFLICT') {
    super(message, 409, errorCode);
  }
}

/**
 * 422 Unprocessable Entity error
 */
export class ValidationError extends ApiError {
  errors: Record<string, string[]>;
  
  constructor(errors: Record<string, string[]>, message: string = 'Validation failed') {
    super(message, 422, 'VALIDATION_ERROR');
    this.errors = errors;
  }
}

/**
 * 429 Too Many Requests error
 */
export class RateLimitError extends ApiError {
  constructor(message: string = 'Too many requests', errorCode: string = 'RATE_LIMIT_EXCEEDED') {
    super(message, 429, errorCode);
  }
}

/**
 * 500 Internal Server Error
 */
export class InternalServerError extends ApiError {
  constructor(message: string = 'Internal Server Error') {
    super(message, 500, 'INTERNAL_SERVER_ERROR');
  }
}
