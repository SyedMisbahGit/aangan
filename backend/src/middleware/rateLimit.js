import rateLimit from 'express-rate-limit';
import { logger } from '../utils/logger.js';
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';
import { promisify } from 'util';

// Configuration
const RATE_LIMIT_CONFIG = {
  // Standard rate limits (per 15 minutes)
  standard: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: 'Too many requests, please try again later.'
  },
  
  // Stricter limits for authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // 20 requests per window
    message: 'Too many login attempts, please try again later.'
  },
  
  // API key rate limits (per hour)
  apiKey: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 1000, // 1000 requests per hour
    message: 'API rate limit exceeded. Please try again later or contact support.'
  }
};

// Initialize Redis client with enhanced configuration
let redisClient;
let redisStore;

const initRedis = () => {
  if (!process.env.REDIS_URL) {
    logger.warn('REDIS_URL not set, using in-memory rate limiting');
    return null;
  }

  try {
    redisClient = createClient({
      url: process.env.REDIS_URL,
      socket: {
        tls: process.env.NODE_ENV === 'production',
        rejectUnauthorized: false,
        reconnectStrategy: (retries) => {
          const maxRetries = 5;
          if (retries > maxRetries) {
            logger.warn('Max Redis reconnection attempts reached');
            return new Error('Max reconnection attempts reached');
          }
          // Exponential backoff with jitter
          const baseDelay = Math.min(100 * Math.pow(2, retries), 5000);
          const jitter = Math.floor(Math.random() * 100);
          return baseDelay + jitter;
        },
      },
      pingInterval: 30000, // Send PING every 30 seconds
    });

    // Redis event handlers
    redisClient.on('error', (err) => {
      logger.error('Redis error:', err);
    });

    redisClient.on('connect', () => {
      logger.info('Connected to Redis for rate limiting');
    });

    redisClient.on('reconnecting', () => {
      logger.info('Reconnecting to Redis...');
    });

    // Add a ping utility
    const ping = async () => {
      try {
        await redisClient.ping();
        return true;
      } catch (err) {
        logger.error('Redis ping failed:', err);
        return false;
      }
    };

    // Test connection
    (async () => {
      try {
        await redisClient.connect();
        const isAlive = await ping();
        if (!isAlive) {
          logger.warn('Redis connection test failed');
        }
      } catch (err) {
        logger.error('Failed to connect to Redis:', err);
      }
    })();

    // Create Redis store with error handling
    redisStore = new RedisStore({
      sendCommand: (...args) => {
        try {
          return redisClient.sendCommand(args);
        } catch (err) {
          logger.error('Redis command failed:', err);
          throw err;
        }
      },
      prefix: `rl:${process.env.NODE_ENV || 'development'}:`, // Namespace by environment
      // Add a small jitter to avoid thundering herd problem
      expiry: Math.floor(RATE_LIMIT_CONFIG.standard.windowMs / 1000) * (0.9 + Math.random() * 0.2)
    });

    return redisClient;
  } catch (err) {
    logger.error('Failed to initialize Redis:', err);
    return null;
  }
};

// Initialize Redis on startup
initRedis();

// Graceful shutdown handler
const shutdown = async () => {
  if (redisClient && redisClient.isOpen) {
    try {
      await redisClient.quit();
      logger.info('Redis connection closed gracefully');
    } catch (err) {
      logger.error('Error closing Redis connection:', err);
    }
  }
  process.exit(0);
};

// Handle process termination
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Enhanced key generator with additional request context
const keyGenerator = (req) => {
  const userId = req.user?.id || 'anonymous';
  const userAgent = req.headers['user-agent'] || 'unknown';
  const path = req.path;
  // Create a fingerprint of the request
  const fingerprint = crypto
    .createHash('sha256')
    .update(`${req.ip}:${userId}:${userAgent}:${path}`)
    .digest('hex');
  return fingerprint;
};

// Request tracking for suspicious activity
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
  
  // Log detailed info for rate-limited requests
  if (type === 'rate_limited') {
    logger.warn('Rate limited request detected', requestInfo);
    
    // Here you could add additional logic like:
    // - Temporary IP blocking for excessive violations
    // - Alerting for potential attacks
    // - Request pattern analysis
  }
};

// Skip function for whitelisted IPs and health checks
const shouldSkipRateLimit = (req) => {
  // Skip health checks and monitoring endpoints
  if (req.path === '/health' || req.path === '/status') {
    return true;
  }
  
  // Skip whitelisted IPs
  const whitelist = (process.env.RATE_LIMIT_WHITELIST || '')
    .split(',')
    .map(ip => ip.trim())
    .filter(ip => ip);
    
  return whitelist.includes(req.ip);
};

// Standard rate limiter
const createRateLimiter = (config, type = 'standard') => {
  return rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    message: config.message,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator,
    store: redisStore,
    skip: shouldSkipRateLimit,
    handler: (req, res) => {
      trackRequest(req, 'rate_limited');
      res.status(429).json({
        success: false,
        message: config.message,
        // Include rate limit info in the response
        retryAfter: Math.ceil(config.windowMs / 1000),
      });
    },
    // Add jitter to avoid thundering herd
    delayMs: 0,
    ...(type === 'apiKey' && {
      keyGenerator: (req) => {
        const apiKey = req.headers['x-api-key'] || 'none';
        return `api:${apiKey}`;
      },
      skip: (req) => {
        // Don't apply API key rate limiting to non-API routes
        if (!req.path.startsWith('/api/')) return true;
        return shouldSkipRateLimit(req);
      }
    })
  });
};

// Create rate limiters from config
export const standardLimiter = createRateLimiter(RATE_LIMIT_CONFIG.standard);
export const authLimiter = createRateLimiter(RATE_LIMIT_CONFIG.auth, 'auth');
export const apiKeyLimiter = createRateLimiter(RATE_LIMIT_CONFIG.apiKey, 'apiKey');

// Middleware to track all requests for analytics
// This is separate from rate limiting and runs on all requests
export const requestTracker = (req, res, next) => {
  // Skip tracking for static assets and health checks
  if (
    req.path.match(/\.(css|js|jpg|jpeg|png|gif|ico|svg)$/) ||
    req.path === '/health' ||
    req.path === '/favicon.ico'
  ) {
    return next();
  }
  
  // Log request details
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
    
    // Log slow requests
    if (duration > 1000) { // More than 1 second is considered slow
      logger.warn('Slow request detected', { ...logData, duration });
    }
    
    // Log 4xx and 5xx responses
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

// Export the Redis client for use in other parts of the app
export { redisClient };
