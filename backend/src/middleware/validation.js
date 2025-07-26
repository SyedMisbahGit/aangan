import { body, validationResult } from 'express-validator';
import { logger } from '../utils/logger.js';

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

// Sanitization middleware
export const sanitizeInput = (req, res, next) => {
  // Sanitize all string fields in the request body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
  }
  
  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key].trim();
      }
    });
  }
  
  next();
};

// XSS Protection middleware
export const xssProtection = (req, res, next) => {
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data:; " +
    "font-src 'self'; " +
    "connect-src 'self';"
  );
  
  next();
};
