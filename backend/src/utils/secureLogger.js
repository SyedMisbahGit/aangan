import winston from 'winston';
import { createLogger, format, transports } from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';
import { fileURLToPath } from 'url';

const { combine, timestamp, printf, colorize } = format;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// List of sensitive field names to redact
const SENSITIVE_FIELDS = [
  'password',
  'token',
  'accessToken',
  'refreshToken',
  'authorization',
  'apiKey',
  'apikey',
  'api_key',
  'secret',
  'credentials',
  'ssn',
  'social',
  'creditcard',
  'credit_card',
  'card_number',
  'expiry',
  'cvv',
  'phone',
  'email',
  'address',
  'ip',
  'user_agent',
  'fingerprint',
  'session_id',
  'jti',
  'sub',
  'user_id',
  'userId'
];

// Regular expression to match sensitive field names (case insensitive)
const SENSITIVE_FIELDS_REGEX = new RegExp(
  `(${SENSITIVE_FIELDS.join('|')})`,
  'i' // Case insensitive
);

// Redact sensitive data from an object
const redactSensitiveData = (data) => {
  if (!data || typeof data !== 'object') {
    return data;
  }

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => redactSensitiveData(item));
  }

  // Handle buffers and other non-plain objects
  if (Buffer.isBuffer(data) || !(data.constructor === Object || data.constructor === undefined)) {
    return '[REDACTED]';
  }

  // Process object properties
  const result = {};
  for (const [key, value] of Object.entries(data)) {
    // Check if the key matches any sensitive field pattern
    if (SENSITIVE_FIELDS_REGEX.test(key)) {
      result[key] = '[REDACTED]';
    } else if (value && typeof value === 'object') {
      // Recursively process nested objects
      result[key] = redactSensitiveData(value);
    } else if (typeof value === 'string' && isSensitiveValue(value)) {
      // Check if the value itself contains sensitive data
      result[key] = redactValue(value);
    } else {
      result[key] = value;
    }
  }
  
  return result;
};

// Check if a value contains sensitive data
const isSensitiveValue = (value) => {
  if (typeof value !== 'string') return false;
  
  // Check for JWT tokens
  if (/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/.test(value)) {
    return true;
  }
  
  // Check for API keys (e.g., starts with sk_ or AKIA)
  if (/^(sk_|AKIA|SG\.[a-zA-Z0-9_-]+\.)/.test(value)) {
    return true;
  }
  
  // Check for credit card numbers
  if (/\b(?:\d[ -]*?){13,16}\b/.test(value)) {
    return true;
  }
  
  return false;
};

// Redact sensitive values
const redactValue = (value) => {
  if (typeof value !== 'string') return value;
  
  // Redact JWT tokens
  value = value.replace(
    /(eyJ[a-zA-Z0-9_-]{5,}\.eyJ[a-zA-Z0-9_-]{5,})\.[a-zA-Z0-9_-]*/g,
    '$1.[REDACTED]'
  );
  
  // Redact API keys
  value = value.replace(
    /(sk_|AKIA|SG\.[a-zA-Z0-9_-]+\.)[a-zA-Z0-9_-]+/g,
    '$1[REDACTED]'
  );
  
  // Redact credit card numbers
  value = value.replace(
    /\b(?:\d[ -]*?){13,16}\b/g,
    '[REDACTED]'
  );
  
  return value;
};

// Custom formatter that redacts sensitive data
const redactingFormatter = format((info, opts) => {
  // Redact sensitive data in the message
  if (typeof info.message === 'object') {
    info.message = redactSensitiveData(info.message);
  } else if (typeof info.message === 'string') {
    info.message = redactValue(info.message);
  }
  
  // Redact sensitive data in metadata
  const redactedMeta = {};
  for (const [key, value] of Object.entries(info)) {
    if (key === 'message' || key === 'level' || key === 'timestamp') continue;
    redactedMeta[key] = redactSensitiveData(value);
  }
  
  return { ...info, ...redactedMeta };
});

// Create a logger instance
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    redactingFormatter(),
    format.errors({ stack: true }),
    format.json()
  ),
  defaultMeta: { service: 'college-whisper' },
  transports: [
    // Write all logs with level `error` and below to `error.log`
    new transports.DailyRotateFile({
      filename: path.join(__dirname, '../../logs/error-%DATE%.log'),
      level: 'error',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d'
    }),
    // Write all logs with level `info` and below to `combined.log`
    new transports.DailyRotateFile({
      filename: path.join(__dirname, '../../logs/combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d'
    })
  ]
});

// Add console transport in non-production environments
if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: combine(
      colorize(),
      printf(({ level, message, timestamp, ...meta }) => {
        let logMessage = `${timestamp} ${level}: ${message}`;
        
        // Add metadata if present
        const metaString = Object.keys(meta).length > 0 
          ? '\n' + JSON.stringify(meta, null, 2)
          : '';
          
        return logMessage + metaString;
      })
    )
  }));
}

// Request logging middleware
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Skip logging for health checks
  if (req.path === '/health') {
    return next();
  }
  
  // Log the request
  logger.info('Incoming request', {
    method: req.method,
    url: req.originalUrl,
    path: req.path,
    query: req.query,
    headers: {
      'user-agent': req.headers['user-agent'],
      'x-forwarded-for': req.headers['x-forwarded-for']
    },
    ip: req.ip,
    timestamp: new Date().toISOString()
  });
  
  // Log the response
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    logger.info('Request completed', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });
  });
  
  next();
};

// Error logging middleware
export const errorLogger = (err, req, res, next) => {
  logger.error('Unhandled error', {
    error: {
      message: err.message,
      stack: err.stack,
      name: err.name
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      path: req.path,
      query: req.query,
      params: req.params,
      ip: req.ip
    },
    timestamp: new Date().toISOString()
  });
  
  next(err);
};

// Log stream for morgan
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

export default logger;
