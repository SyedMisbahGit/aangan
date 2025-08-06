import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redis } from '../config/redis.js';
import logger from '../utils/logger.js';
import crypto from 'crypto';

// Use in-memory store if Redis is not available
const store = redis.client ? new RedisStore({
  sendCommand: (...args) => redis.client.sendCommand(args),
  prefix: 'rl:',
}) : new rateLimit.MemoryStore();

// Rate limit configuration with enhanced security
const RATE_LIMIT_CONFIG = {
  // Public endpoints (higher limits for authenticated users)
  public: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // 200 requests per window for public endpoints
    message: 'Too many requests, please try again later.',
    skip: (req) => req.user?.id // Skip if user is authenticated
  },
  
  // Standard rate limits for authenticated users
  standard: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300, // 300 requests per window
    message: 'Too many requests, please try again later.',
    skip: (req) => !req.user?.id // Only apply to authenticated users
  },
  
  // Stricter limits for authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 login attempts per window
    message: 'Too many login attempts, please try again later.',
    keyGenerator: (req) => {
      // Use IP + user agent for auth attempts
      const userAgent = req.headers['user-agent'] || 'unknown';
      return `auth:${req.ip}:${userAgent}`;
    }
  },
  
  // Stricter limits for password reset endpoints
  passwordReset: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 attempts per hour
    message: 'Too many password reset attempts, please try again later.'
  },
  
  // API key rate limits (per hour)
  apiKey: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 1000, // 1000 requests per hour
    message: 'API rate limit exceeded. Please try again later or contact support.',
    keyGenerator: (req) => {
      const apiKey = req.headers['x-api-key'] || 'none';
      return `api:${apiKey}`;
    }
  },
  
  // WebSocket connection limits
  wsConnection: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10, // 10 connection attempts per 5 minutes
    message: 'Too many connection attempts. Please try again later.'
  }
};

// Enhanced key generator with request fingerprinting and rate limiting tiers
const keyGenerator = (req, type = 'standard') => {
  const userId = req.user?.id || 'anonymous';
  const userAgent = req.headers['user-agent'] || 'unknown';
  const path = req.path;
  
  // Different key generation strategies based on rate limit type
  switch (type) {
    case 'auth':
      return `auth:${req.ip}:${userAgent}`;
      
    case 'passwordReset':
      const email = req.body?.email || 'unknown';
      return `pwd_reset:${req.ip}:${email}`;
      
    case 'ws':
      return `ws:${req.ip}:${userAgent}`;
      
    default: {
      // Standard key generation with fingerprinting
      const fingerprint = crypto
        .createHash('sha256')
        .update(`${req.ip}:${userId}:${userAgent}:${path}`)
        .digest('hex');
        
      return `${process.env.NODE_ENV || 'development'}:rl:${fingerprint}`;
    }
  }
};

// Track requests for analytics and monitoring
const trackRequest = (req, type = 'standard') => {
  const requestInfo = {
    timestamp: new Date().toISOString(),
    ip: req.ip,
    method: req.method,
    path: req.path,
    userAgent: req.headers['user-agent'],
    userId: req.user?.id || 'anonymous',
    type,
  };
  
  if (type === 'rate_limited') {
    logger.warn('Rate limited request detected', requestInfo);
  }
};

// Skip rate limiting for specific conditions
const shouldSkipRateLimit = (req) => {
  // Skip health checks and monitoring endpoints
  if (['/health', '/status', '/metrics', '/favicon.ico'].includes(req.path)) {
    return true;
  }
  
  // Skip whitelisted IPs and localhost in development
  const whitelist = [
    ...(process.env.RATE_LIMIT_WHITELIST || '').split(',').map(ip => ip.trim()),
    ...(process.env.NODE_ENV !== 'production' ? ['127.0.0.1', '::1', '::ffff:127.0.0.1'] : [])
  ].filter(ip => ip);
  
  // Check if IP is in whitelist
  if (whitelist.includes(req.ip)) {
    return true;
  }
  
  // Skip rate limiting for admin users
  if (req.user?.role === 'admin') {
    return true;
  }
  
  return false;
};

// Create a rate limiter with the given configuration
const createRateLimiter = (config, type = 'standard') => {

  // Create rate limiter with enhanced configuration
  const limiter = rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    message: config.message,
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    keyGenerator: (req) => keyGenerator(req, type),
    store,
    skip: (req) => {
      // Use custom skip function if provided, otherwise use default
      if (typeof config.skip === 'function' && config.skip(req)) {
        return true;
      }
      return shouldSkipRateLimit(req);
    },
    handler: (req, res) => {
      trackRequest(req, 'rate_limited');
      
      // Add Retry-After header
      const retryAfter = Math.ceil(config.windowMs / 1000);
      res.setHeader('Retry-After', retryAfter);
      
      // Return rate limit exceeded response
      res.status(429).json({
        success: false,
        message: config.message,
        error: 'rate_limit_exceeded',
        retryAfter,
        limit: config.max,
        window: config.windowMs,
        type
      });
    }
  });

  // Add a reset method to clear rate limit for a specific key
  limiter.resetKey = async (key) => {
    if (store.resetKey) {
      return store.resetKey(key);
    }
    // Fallback for memory store
    store.resetKey?.(key);
  };

  return limiter;
};

// Create rate limiters from config
export const standardLimiter = createRateLimiter(RATE_LIMIT_CONFIG.standard);
export const authLimiter = createRateLimiter(RATE_LIMIT_CONFIG.auth, 'auth');
export const apiKeyLimiter = createRateLimiter(RATE_LIMIT_CONFIG.apiKey, 'apiKey');

// Request tracking middleware for analytics
export const requestTracker = (req, res, next) => {
  // Skip tracking for static assets and health checks
  if (
    req.path.match(/\.(css|js|jpg|jpeg|png|gif|ico|svg)$/) ||
    ['/health', '/status', '/metrics', '/favicon.ico'].includes(req.path)
  ) {
    return next();
  }
  
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      userId: req.user?.id || 'anonymous',
      timestamp: new Date().toISOString(),
    };
    
    if (duration > 1000) {
      logger.warn('Slow request detected', { ...logData, duration });
    }
    
    if (res.statusCode >= 400) {
      logger.error('Request error', { 
        ...logData, 
        error: res.statusMessage,
        body: res.statusCode >= 500 ? req.body : undefined,
      });
    } else {
      logger.info('Request completed', logData);
    }
  });
  
  next();
};

// Health check endpoint
export const healthCheck = (req, res) => {
  const status = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    redis: redis.getClient() ? 'connected' : 'disabled',
  };
  
  res.json(status);
};

export default {
  standardLimiter,
  authLimiter,
  apiKeyLimiter,
  requestTracker,
  healthCheck,
};
