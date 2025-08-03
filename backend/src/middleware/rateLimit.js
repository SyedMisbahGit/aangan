import rateLimit from 'express-rate-limit';
import { logger } from '../utils/logger.js';

// Configuration
const RATE_LIMIT_CONFIG = {
  // Standard rate limits (per 15 minutes)
  standard: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: 'Too many requests, please try again later.',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    skipFailedRequests: true, // Don't count failed requests (status >= 400)
    keyGenerator: (req) => {
      // Use IP + user agent for better rate limiting
      return `${req.ip}-${req.headers['user-agent'] || 'unknown'}`;
    }
  },
  
  // Stricter limits for authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // 20 requests per window
    message: 'Too many login attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skipFailedRequests: true,
    keyGenerator: (req) => {
      // For auth endpoints, include the username in the key if available
      const username = req.body?.username || 'unknown';
      return `auth-${req.ip}-${username}`;
    }
  },
  
  // API key rate limits (per hour)
  apiKey: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 1000, // 1000 requests per hour
    message: 'API rate limit exceeded. Please try again later or contact support.',
    standardHeaders: true,
    legacyHeaders: false,
    skipFailedRequests: true,
    keyGenerator: (req) => {
      // Use API key from header or query param
      const apiKey = req.headers['x-api-key'] || req.query.apiKey || 'unknown';
      return `api-${apiKey}`;
    }
  }
};

// Whitelist of IPs that bypass rate limiting
const WHITELISTED_IPS = new Set([
  '127.0.0.1',
  '::1',
  '::ffff:127.0.0.1',
  ...(process.env.WHITELISTED_IPS?.split(',') || [])
]);

/**
 * Check if the request should skip rate limiting
 * @param {Object} req - Express request object
 * @returns {boolean} True if rate limiting should be skipped
 */
const shouldSkipRateLimit = (req) => {
  const clientIp = req.ip || req.connection.remoteAddress;
  
  // Skip rate limiting for whitelisted IPs
  if (WHITELISTED_IPS.has(clientIp)) {
    return true;
  }
  
  // Skip rate limiting for health checks and static assets
  const path = req.path || '';
  if (path === '/health' || path === '/healthz' || path === '/status' || path.startsWith('/static/')) {
    return true;
  }
  
  return false;
};

/**
 * Create a rate limiter with the given configuration
 * @param {Object} config - Rate limiting configuration
 * @param {string} [type='standard'] - Type of rate limiter (standard, auth, apiKey)
 * @returns {Function} Express middleware function
 */
const createRateLimiter = (config, type = 'standard') => {
  const limiter = rateLimit({
    ...config,
    // Use in-memory store (default)
    store: new rateLimit.MemoryStore(config.windowMs),
    
    // Skip rate limiting for whitelisted IPs and health checks
    skip: (req) => shouldSkipRateLimit(req),
    
    // Custom handler for rate limit exceeded
    handler: (req, res, next, options) => {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        path: req.path,
        method: req.method,
        limit: config.max,
        windowMs: config.windowMs,
        type
      });
      
      res.status(options.statusCode || 429).json({
        success: false,
        error: options.message,
        retryAfter: Math.ceil(options.windowMs / 1000)
      });
    },
    
    // Track rate limited requests
    onLimitReached: (req) => {
      logger.warn('Rate limit reached', {
        ip: req.ip,
        path: req.path,
        method: req.method,
        type,
        timestamp: new Date().toISOString()
      });
    }
  });
  
  return limiter;
};

// Create rate limiters from config
export const standardLimiter = createRateLimiter(RATE_LIMIT_CONFIG.standard);
export const authLimiter = createRateLimiter(RATE_LIMIT_CONFIG.auth, 'auth');
export const apiKeyLimiter = createRateLimiter(RATE_LIMIT_CONFIG.apiKey, 'apiKey');

/**
 * Middleware to track all requests for analytics
 * This is separate from rate limiting and runs on all requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
export const requestTracker = (req, res, next) => {
  const start = Date.now();
  
  // Capture response finish to log the request details
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, path, ip } = req;
    const statusCode = res.statusCode;
    const contentLength = res.get('content-length') || 0;
    const userAgent = req.headers['user-agent'] || '';
    
    // Log the request details
    logger.info('Request processed', {
      method,
      path,
      statusCode,
      duration,
      contentLength,
      ip,
      userAgent,
      timestamp: new Date().toISOString()
    });
    
    // Log slow requests (over 1 second)
    if (duration > 1000) {
      logger.warn('Slow request', {
        method,
        path,
        duration,
        statusCode,
        timestamp: new Date().toISOString(),
        error: res.statusMessage,
        body: res.statusCode >= 500 ? req.body : undefined
      });
    } else {
      logger.info('Request completed', logData);
    }
  });
  
  next();
};
