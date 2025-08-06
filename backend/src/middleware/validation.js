import { body, param, query, validationResult } from 'express-validator';
import logger from '../utils/logger.js';
import mime from 'mime-types';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import redis from 'redis';

// Initialize Redis client for rate limiting
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Rate limiter for authentication attempts
const authLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'auth_fail',
  points: 5, // 5 attempts
  duration: 60 * 15, // 15 minutes
  blockDuration: 60 * 30, // Block for 30 minutes after 5 failed attempts
});

/**
 * Validation middleware for request bodies
 * @param {Array} validations - Array of validation rules
 * @returns {Function} Express middleware function
 */
export const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    logger.warn('Validation failed', { 
      path: req.path, 
      method: req.method,
      errors: errors.array() 
    });

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  };
};

// Common validation rules
export const commonValidations = {
  // Rate limiting for authentication attempts
  authRateLimit: (req, res, next) => {
    const ip = req.ip;
    authLimiter.consume(ip)
      .then(() => next())
      .catch(() => {
        res.status(429).json({ 
          success: false, 
          message: 'Too many login attempts. Please try again later.' 
        });
      });
  },
  
  // File upload validation
  validateFile: (fieldName, allowedTypes = ['image/jpeg', 'image/png', 'image/gif'], maxSizeMB = 5) => {
    return (req, res, next) => {
      if (!req.files || !req.files[fieldName]) {
        return next();
      }
      
      const file = req.files[fieldName];
      const fileType = mime.lookup(file.name);
      const fileSizeMB = file.size / (1024 * 1024);
      
      if (!allowedTypes.includes(fileType)) {
        return res.status(400).json({
          success: false,
          message: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
        });
      }
      
      if (fileSizeMB > maxSizeMB) {
        return res.status(400).json({
          success: false,
          message: `File too large. Maximum size: ${maxSizeMB}MB`
        });
      }
      
      next();
    };
  },
  
  // Request size limit
  requestSizeLimit: (limit = '5mb') => {
    return (req, res, next) => {
      const contentLength = req.headers['content-length'];
      if (contentLength > 5 * 1024 * 1024) { // 5MB
        return res.status(413).json({
          success: false,
          message: 'Request entity too large. Maximum size is 5MB.'
        });
      }
      next();
    };
  },
  email: body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  password: body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number')
    .matches(/[^A-Za-z0-9]/)
    .withMessage('Password must contain at least one special character'),

  username: body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_.-]+$/)
    .withMessage('Username can only contain letters, numbers, dots, underscores, and hyphens'),

  content: body('content')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Content must be between 1 and 500 characters')
    .escape(),

  idParam: (paramName) => 
    param(paramName)
      .isInt({ min: 1 })
      .withMessage('ID must be a positive integer')
      .toInt(),
};

// Enhanced sanitization middleware
export const sanitizeInput = (req, res, next) => {
  const sanitize = (value) => {
    if (typeof value === 'string') {
      // Remove null bytes and trim
      return value.replace(/\0/g, '').trim();
    }
    return value;
  };

  // Sanitize request body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      req.body[key] = sanitize(req.body[key]);
    });
  }
  
  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      req.query[key] = sanitize(req.query[key]);
    });
  }
  
  // Sanitize route parameters
  if (req.params) {
    Object.keys(req.params).forEach(key => {
      req.params[key] = sanitize(req.params[key]);
    });
  }
  
  next();
};

// Enhanced XSS Protection middleware
export const xssProtection = (req, res, next) => {
  // Security headers
  const securityHeaders = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-site',
  };

  // Set security headers
  Object.entries(securityHeaders).forEach(([header, value]) => {
    res.setHeader(header, value);
  });

  // Dynamic CSP based on environment
  const isProduction = process.env.NODE_ENV === 'production';
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    `connect-src 'self' ${process.env.API_URL || 'http://localhost:3000'}`,
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'self'"
  ];

  if (!isProduction) {
    // Allow webpack dev server in development
    cspDirectives.push("connect-src 'self' ws://localhost:* wss://localhost:*");
  }

  // Set CSP header
  res.setHeader('Content-Security-Policy', cspDirectives.join('; '));
  
  next();
};
