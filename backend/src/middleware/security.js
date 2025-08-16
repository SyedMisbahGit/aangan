/**
 * Production-Grade Security Middleware for Aangan Backend
 * Includes JWT refresh, Helmet security headers, CORS lockdown, validation
 */

import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';

// Environment-specific configurations
const isProduction = process.env.NODE_ENV === 'production';
const isStaging = process.env.NODE_ENV === 'staging';
const isDevelopment = process.env.NODE_ENV === 'development';

// Security Configuration
export const securityConfig = {
  // JWT Configuration
  jwt: {
    accessTokenSecret: process.env.JWT_ACCESS_SECRET || 'aangan-access-secret-dev',
    refreshTokenSecret: process.env.JWT_REFRESH_SECRET || 'aangan-refresh-secret-dev',
    accessTokenExpiry: isProduction ? '15m' : '1h',
    refreshTokenExpiry: isProduction ? '7d' : '30d',
    issuer: 'aangan-app',
    audience: isProduction ? 'aangan.app' : 'localhost'
  },

  // CORS Configuration
  cors: {
    production: [
      'https://aangan.app',
      'https://www.aangan.app',
      'https://staging.aangan.app'
    ],
    staging: [
      'https://staging.aangan.app',
      'https://aangan-staging.up.railway.app',
      'http://localhost:3000',
      'http://localhost:5173'
    ],
    development: [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173'
    ]
  },

  // Rate Limiting
  rateLimit: {
    // General API rate limiting
    general: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: isProduction ? 100 : 1000, // requests per windowMs
      message: {
        error: 'Too many requests from this IP, please try again later.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: '15 minutes'
      },
      standardHeaders: true,
      legacyHeaders: false
    },

    // Stricter rate limiting for auth endpoints
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: isProduction ? 5 : 50, // login attempts per windowMs
      message: {
        error: 'Too many authentication attempts, please try again later.',
        code: 'AUTH_RATE_LIMIT_EXCEEDED',
        retryAfter: '15 minutes'
      },
      skipSuccessfulRequests: true
    },

    // WebSocket connection rate limiting
    websocket: {
      windowMs: 1 * 60 * 1000, // 1 minute
      max: isProduction ? 10 : 100, // connections per minute
      message: 'Too many WebSocket connections, please try again later.'
    }
  }
};

/**
 * Advanced Helmet Security Headers Configuration
 */
export const helmetSecurityMiddleware = () => {
  return helmet({
    // Content Security Policy
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com",
          "https://cdn.jsdelivr.net"
        ],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'", // TODO: Remove in production with proper nonces
          "https://cdn.jsdelivr.net",
          "https://www.googletagmanager.com"
        ],
        fontSrc: [
          "'self'",
          "https://fonts.gstatic.com",
          "https://cdn.jsdelivr.net"
        ],
        imgSrc: [
          "'self'",
          "data:",
          "https://images.unsplash.com",
          "https://via.placeholder.com"
        ],
        connectSrc: [
          "'self'",
          "wss://aangan.app",
          "wss://staging.aangan.app",
          "ws://localhost:*",
          "https://api.aangan.app"
        ],
        mediaSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameSrc: ["'none'"],
        upgradeInsecureRequests: isProduction ? [] : null
      }
    },

    // HTTP Strict Transport Security
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: isProduction
    },

    // X-Frame-Options
    frameguard: { action: 'deny' },

    // X-Content-Type-Options
    noSniff: true,

    // X-XSS-Protection
    xssFilter: true,

    // Referrer Policy
    referrerPolicy: { policy: 'same-origin' },

    // Permissions Policy
    permissionsPolicy: {
      features: {
        geolocation: ['self'],
        microphone: ['none'],
        camera: ['none'],
        payment: ['none'],
        usb: ['none'],
        magnetometer: ['none'],
        gyroscope: ['none'],
        speaker: ['self'],
        vibrate: ['self'],
        fullscreen: ['self']
      }
    },

    // Cross-Origin Policies
    crossOriginEmbedderPolicy: false, // Disable for WebSocket compatibility
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  });
};

/**
 * Advanced CORS Middleware with Environment-Specific Origins
 */
export const corsSecurityMiddleware = () => {
  let allowedOrigins = securityConfig.cors.development;

  if (isProduction) {
    allowedOrigins = securityConfig.cors.production;
  } else if (isStaging) {
    allowedOrigins = securityConfig.cors.staging;
  }

  return cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin && !isProduction) {
        return callback(null, true);
      }

      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`🚫 CORS blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS policy'), false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-Access-Token',
      'X-Refresh-Token',
      'X-Guest-ID',
      'X-Zone-ID'
    ],
    exposedHeaders: [
      'X-Access-Token',
      'X-Refresh-Token',
      'X-Token-Expires-In'
    ],
    maxAge: isProduction ? 86400 : 600, // Preflight cache duration
    preflightContinue: false,
    optionsSuccessStatus: 204
  });
};

/**
 * General API Rate Limiting Middleware
 */
export const generalRateLimitMiddleware = () => {
  return rateLimit(securityConfig.rateLimit.general);
};

/**
 * Authentication Rate Limiting Middleware
 */
export const authRateLimitMiddleware = () => {
  return rateLimit(securityConfig.rateLimit.auth);
};

/**
 * JWT Token Generation and Validation
 */
export class JWTSecurityManager {
  static generateTokenPair(payload) {
    const accessToken = jwt.sign(
      { ...payload, type: 'access' },
      securityConfig.jwt.accessTokenSecret,
      {
        expiresIn: securityConfig.jwt.accessTokenExpiry,
        issuer: securityConfig.jwt.issuer,
        audience: securityConfig.jwt.audience,
        algorithm: 'HS256'
      }
    );

    const refreshToken = jwt.sign(
      { ...payload, type: 'refresh' },
      securityConfig.jwt.refreshTokenSecret,
      {
        expiresIn: securityConfig.jwt.refreshTokenExpiry,
        issuer: securityConfig.jwt.issuer,
        audience: securityConfig.jwt.audience,
        algorithm: 'HS256'
      }
    );

    return { accessToken, refreshToken };
  }

  static verifyAccessToken(token) {
    try {
      const decoded = jwt.verify(token, securityConfig.jwt.accessTokenSecret, {
        issuer: securityConfig.jwt.issuer,
        audience: securityConfig.jwt.audience,
        algorithms: ['HS256']
      });

      if (decoded.type !== 'access') {
        throw new Error('Invalid token type');
      }

      return { valid: true, decoded };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  static verifyRefreshToken(token) {
    try {
      const decoded = jwt.verify(token, securityConfig.jwt.refreshTokenSecret, {
        issuer: securityConfig.jwt.issuer,
        audience: securityConfig.jwt.audience,
        algorithms: ['HS256']
      });

      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      return { valid: true, decoded };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  static refreshAccessToken(refreshToken) {
    const verificationResult = this.verifyRefreshToken(refreshToken);
    
    if (!verificationResult.valid) {
      throw new Error(`Invalid refresh token: ${verificationResult.error}`);
    }

    const { decoded } = verificationResult;
    const payload = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };

    return this.generateTokenPair(payload);
  }
}

/**
 * JWT Authentication Middleware with Refresh Token Support
 */
export const jwtAuthMiddleware = (options = {}) => {
  const { optional = false, roles = [] } = options;

  return async (req, res, next) => {
    try {
      const accessToken = req.headers.authorization?.replace('Bearer ', '') ||
                         req.headers['x-access-token'];
      const refreshToken = req.headers['x-refresh-token'];

      // If no tokens and authentication is optional, continue
      if (!accessToken && !refreshToken && optional) {
        req.user = null;
        return next();
      }

      // If no tokens but authentication is required, return error
      if (!accessToken && !refreshToken) {
        return res.status(401).json({
          error: 'Authentication required',
          code: 'NO_TOKEN_PROVIDED'
        });
      }

      let tokenResult = null;
      let newTokens = null;

      // Try to verify access token first
      if (accessToken) {
        tokenResult = JWTSecurityManager.verifyAccessToken(accessToken);
      }

      // If access token is invalid/expired, try to refresh using refresh token
      if (!tokenResult?.valid && refreshToken) {
        try {
          newTokens = JWTSecurityManager.refreshAccessToken(refreshToken);
          tokenResult = JWTSecurityManager.verifyAccessToken(newTokens.accessToken);
          
          // Set new tokens in response headers
          res.setHeader('X-Access-Token', newTokens.accessToken);
          res.setHeader('X-Refresh-Token', newTokens.refreshToken);
          res.setHeader('X-Token-Expires-In', securityConfig.jwt.accessTokenExpiry);
          
        } catch (refreshError) {
          return res.status(401).json({
            error: 'Token refresh failed',
            code: 'REFRESH_TOKEN_INVALID',
            message: refreshError.message
          });
        }
      }

      // If still no valid token, return error
      if (!tokenResult?.valid) {
        return res.status(401).json({
          error: 'Invalid or expired token',
          code: 'TOKEN_INVALID',
          message: tokenResult?.error || 'Token verification failed'
        });
      }

      // Check role-based access if roles are specified
      if (roles.length > 0 && !roles.includes(tokenResult.decoded.role)) {
        return res.status(403).json({
          error: 'Insufficient permissions',
          code: 'INSUFFICIENT_PERMISSIONS',
          requiredRoles: roles,
          userRole: tokenResult.decoded.role
        });
      }

      // Attach user info to request
      req.user = tokenResult.decoded;
      req.tokenRefreshed = !!newTokens;

      next();
    } catch (error) {
      console.error('JWT Auth Middleware Error:', error);
      res.status(500).json({
        error: 'Authentication system error',
        code: 'AUTH_SYSTEM_ERROR'
      });
    }
  };
};

/**
 * Enhanced Input Validation Middleware
 */
export const validationMiddleware = (validations) => {
  return [
    ...validations,
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: errors.array().map(error => ({
            field: error.path,
            message: error.msg,
            value: error.value,
            location: error.location
          }))
        });
      }
      next();
    }
  ];
};

/**
 * Common Validation Rules
 */
export const validationRules = {
  // User input validations
  whisper: [
    body('content')
      .trim()
      .isLength({ min: 1, max: 1000 })
      .withMessage('Content must be between 1 and 1000 characters')
      .escape(),
    body('emotion')
      .isIn(['happy', 'sad', 'excited', 'calm', 'anxious', 'angry', 'confused', 'peaceful'])
      .withMessage('Invalid emotion type'),
    body('zone')
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Zone must be between 1 and 50 characters')
      .escape()
  ],

  // Authentication validations
  login: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Invalid email format'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
  ],

  register: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Invalid email format'),
    body('password')
      .isLength({ min: 8 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must contain at least 8 characters with uppercase, lowercase, number and special character'),
    body('username')
      .trim()
      .isLength({ min: 3, max: 30 })
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username must be 3-30 characters, letters, numbers, and underscores only')
      .escape()
  ]
};

/**
 * Security Headers Middleware for API Responses
 */
export const securityHeadersMiddleware = (req, res, next) => {
  // Remove potentially dangerous headers
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');

  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  next();
};

/**
 * Request Sanitization Middleware
 */
export const requestSanitizationMiddleware = (req, res, next) => {
  // Remove null bytes and other dangerous characters
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      return obj.replace(/\0/g, '').trim();
    }
    if (typeof obj === 'object' && obj !== null) {
      Object.keys(obj).forEach(key => {
        obj[key] = sanitize(obj[key]);
      });
    }
    return obj;
  };

  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  req.params = sanitize(req.params);

  next();
};

export default {
  helmetSecurityMiddleware,
  corsSecurityMiddleware,
  generalRateLimitMiddleware,
  authRateLimitMiddleware,
  jwtAuthMiddleware,
  validationMiddleware,
  validationRules,
  securityHeadersMiddleware,
  requestSanitizationMiddleware,
  JWTSecurityManager,
  securityConfig
};
