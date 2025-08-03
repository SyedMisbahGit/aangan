import logger from '../utils/logger.js';
import * as Sentry from '@sentry/node';

/**
 * Error handling middleware for Express
 */
export const errorHandler = (err, req, res, next) => {
  // Extract error details
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const stack = process.env.NODE_ENV === 'development' ? err.stack : undefined;
  
  // Log the error
  logger.error({
    message: err.message,
    status: statusCode,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: req.user?.id,
    stack: stack,
    ...(err.errors && { errors: err.errors }),
    ...(err.code && { code: err.code }),
  });

  // Capture to Sentry in production
  if (process.env.NODE_ENV === 'production') {
    Sentry.withScope(scope => {
      scope.setExtras({
        path: req.path,
        method: req.method,
        ip: req.ip,
        userId: req.user?.id,
        body: req.body,
        query: req.query,
        params: req.params,
        headers: {
          'user-agent': req.get('user-agent'),
          'x-forwarded-for': req.get('x-forwarded-for'),
          'x-real-ip': req.get('x-real-ip'),
        },
      });
      
      if (req.user) {
        scope.setUser({
          id: req.user.id,
          email: req.user.email,
          role: req.user.role,
        });
      }
      
      scope.setTag('environment', process.env.NODE_ENV);
      scope.setTag('service', 'aangan-api');
      
      Sentry.captureException(err);
    });
  }

  // Don't leak stack traces in production
  const errorResponse = {
    error: {
      status: statusCode,
      message: message,
      ...(process.env.NODE_ENV === 'development' && { stack: stack }),
      ...(err.errors && { details: err.errors }),
    },
  };

  // Handle specific error types
  if (err.name === 'ValidationError') {
    errorResponse.error.message = 'Validation Error';
    errorResponse.error.errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message,
      type: e.type,
    }));
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
};

/**
 * 404 handler middleware
 */
export const notFoundHandler = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

/**
 * Async handler wrapper to catch async/await errors
 */
export const asyncHandler = (fn) => (req, res, next) => {
  return Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Initialize error tracking
 */
export const initErrorTracking = (app) => {
  // Initialize Sentry if DSN is provided
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      release: `aangan@${process.env.npm_package_version}`,
      integrations: [
        // Enable HTTP calls tracing
        new Sentry.Integrations.Http({ tracing: true }),
        // Enable Express.js middleware tracing
        new Sentry.Integrations.Express({ app }),
      ],
      // Performance Monitoring
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    });

    // RequestHandler creates a separate execution context using domains, so that every
    // transaction/span/breadcrumb will be attached to its own Hub instance
    app.use(Sentry.Handlers.requestHandler());
    // TracingHandler creates a trace for every incoming request
    app.use(Sentry.Handlers.tracingHandler());
    
    logger.info('Sentry error tracking initialized');
  } else {
    logger.warn('Sentry DSN not provided, error tracking disabled');
  }
};

/**
 * Error boundary for unhandled promise rejections
 */
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', { promise, reason });
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(reason, {
      tags: { type: 'unhandledRejection' },
      extra: { promise },
    });
  }
});

/**
 * Error boundary for uncaught exceptions
 */
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error, {
      tags: { type: 'uncaughtException' },
    });
    // Don't exit in development to allow for debugging
    process.exit(1);
  }
});

export default {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  initErrorTracking,
};
