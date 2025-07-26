import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redis } from '../config/redis.js';
import { logger } from '../utils/logger.js';
import crypto from 'crypto';

// Rate limit configuration
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

// Enhanced key generator with request fingerprinting
const keyGenerator = (req) => {
  const userId = req.user?.id || 'anonymous';
  const userAgent = req.headers['user-agent'] || 'unknown';
  const path = req.path;
  
  // Create a fingerprint of the request
  const fingerprint = crypto
    .createHash('sha256')
    .update(`${req.ip}:${userId}:${userAgent}:${path}`)
    .digest('hex');
    
  return `${process.env.NODE_ENV || 'development'}:rl:${fingerprint}`;
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
  if (['/health', '/status', '/metrics'].includes(req.path)) {
    return true;
  }
  
  // Skip whitelisted IPs
  const whitelist = (process.env.RATE_LIMIT_WHITELIST || '')
    .split(',')
    .map(ip => ip.trim())
    .filter(ip => ip);
    
  return whitelist.includes(req.ip);
};

// Create a rate limiter with the given configuration
const createRateLimiter = (config, type = 'standard') => {
  // Use in-memory store if Redis is not available
  const store = redis.getClient() 
    ? new RedisStore({
        sendCommand: (...args) => redis.getClient().sendCommand(args),
        prefix: 'rate_limit:'
      })
    : undefined;

  return rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    message: config.message,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator,
    store,
    skip: shouldSkipRateLimit,
    handler: (req, res) => {
      trackRequest(req, 'rate_limited');
      res.status(429).json({
        success: false,
        message: config.message,
        retryAfter: Math.ceil(config.windowMs / 1000),
      });
    },
    ...(type === 'apiKey' && {
      keyGenerator: (req) => {
        const apiKey = req.headers['x-api-key'] || 'none';
        const key = `api:${apiKey}`;
        return `${process.env.NODE_ENV || 'development'}:rl:${key}`;
      },
      skip: (req) => {
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
