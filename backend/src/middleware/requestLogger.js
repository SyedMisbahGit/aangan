import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger.js';
import { trackError } from './metrics.js';

// Skip logging for these paths (health checks, metrics, etc.)
const SKIP_LOGGING_PATHS = ['/health', '/metrics', '/favicon.ico'];

// Skip logging for these content types
const SKIP_LOGGING_CONTENT_TYPES = [
  'text/css',
  'application/javascript',
  'image/',
  'font/',
  'text/plain',
];

/**
 * Middleware to log all incoming requests with detailed information
 */
export function requestLogger(req, res, next) {
  // Skip logging for specific paths
  if (SKIP_LOGGING_PATHS.some(path => req.path.startsWith(path))) {
    return next();
  }

  // Skip logging for specific content types
  const contentType = req.get('content-type') || '';
  if (SKIP_LOGGING_CONTENT_TYPES.some(type => contentType.includes(type))) {
    return next();
  }

  // Generate a unique request ID
  const requestId = req.headers['x-request-id'] || uuidv4();
  req.requestId = requestId;
  
  // Capture the start time
  const startTime = process.hrtime();
  
  // Log the incoming request
  const requestLog = {
    requestId,
    method: req.method,
    url: req.originalUrl,
    path: req.path,
    query: Object.keys(req.query).length ? req.query : undefined,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    referer: req.get('referer'),
    contentType,
    contentLength: req.get('content-length'),
    // Don't log sensitive headers
    headers: {
      'x-forwarded-for': req.get('x-forwarded-for'),
      'x-real-ip': req.get('x-real-ip'),
      'x-request-id': requestId,
    },
    // Log user info if available
    user: req.user ? {
      id: req.user.id,
      role: req.user.role,
      // Don't include sensitive user info
    } : undefined,
  };

  // Log the request (info level for production, debug for development)
  const logLevel = process.env.NODE_ENV === 'production' ? 'info' : 'debug';
  logger[logLevel]('Incoming request', requestLog);

  // Capture response finish to log the completed request
  res.on('finish', () => {
    const responseTime = process.hrtime(startTime);
    const responseTimeMs = (responseTime[0] * 1e3) + (responseTime[1] / 1e6); // Convert to milliseconds
    
    const responseLog = {
      requestId,
      statusCode: res.statusCode,
      statusMessage: res.statusMessage,
      responseTime: `${responseTimeMs.toFixed(2)}ms`,
      contentLength: res.get('content-length'),
      contentType: res.get('content-type'),
      // Add cache headers if present
      cache: res.get('cache-control') || res.get('etag') ? {
        control: res.get('cache-control'),
        etag: res.get('etag'),
        lastModified: res.get('last-modified'),
      } : undefined,
    };

    // Determine log level based on status code
    let responseLogLevel = 'info';
    if (res.statusCode >= 400) {
      responseLogLevel = 'warn';
      if (res.statusCode >= 500) {
        responseLogLevel = 'error';
        
        // Log error details for 5xx errors
        trackError(
          req.path, 
          res.statusCode, 
          'server_error',
          {
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            responseTime: responseTimeMs,
          }
        );
      }
    }

    // Log the response
    logger[responseLogLevel]('Request completed', {
      ...requestLog,
      ...responseLog,
    });
  });

  // Log uncaught errors
  res.on('error', (error) => {
    logger.error('Response error', {
      requestId,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      url: req.originalUrl,
      method: req.method,
      statusCode: res.statusCode,
    });

    trackError(
      'response_error', 
      500, 
      'response_error',
      {
        method: req.method,
        url: req.originalUrl,
        error: error.message,
      }
    );
  });

  next();
}

/**
 * Middleware to log request/response bodies for debugging
 * WARNING: Only use in development as it can log sensitive data
 */
export function requestBodyLogger() {
  return (req, res, next) => {
    if (process.env.NODE_ENV !== 'development') {
      return next();
    }

    // Skip for certain content types
    const contentType = req.get('content-type') || '';
    if (SKIP_LOGGING_CONTENT_TYPES.some(type => contentType.includes(type))) {
      return next();
    }

    // Log request body if present
    if (req.body && Object.keys(req.body).length > 0) {
      logger.debug('Request body', {
        requestId: req.requestId,
        body: req.body,
      });
    }

    // Capture response body
    const originalSend = res.send;
    res.send = function (body) {
      // Log response body for non-200 responses or in verbose mode
      if (res.statusCode >= 400 || process.env.LOG_LEVEL === 'debug') {
        try {
          const responseBody = typeof body === 'string' ? JSON.parse(body) : body;
          logger.debug('Response body', {
            requestId: req.requestId,
            statusCode: res.statusCode,
            body: responseBody,
          });
        } catch (e) {
          // Ignore parsing errors
        }
      }
      return originalSend.call(this, body);
    };

    next();
  };
}

export default {
  requestLogger,
  requestBodyLogger,
};
