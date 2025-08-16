/**
 * Production-Grade Observability Infrastructure
 * Structured logging, Google Cloud Logging, Sentry error tracking, uptime monitoring
 */

import winston from 'winston';
import { LoggingWinston } from '@google-cloud/logging-winston';
import * as Sentry from '@sentry/node';

// Environment detection
const isProduction = process.env.NODE_ENV === 'production';
const isStaging = process.env.NODE_ENV === 'staging';
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Observability Configuration
 */
export const observabilityConfig = {
  // Google Cloud Logging
  gcp: {
    enabled: isProduction || isStaging,
    projectId: process.env.GCP_PROJECT_ID || 'aangan-staging',
    logName: process.env.GCP_LOG_NAME || 'aangan-backend',
    resource: {
      type: 'global',
      labels: {
        project_id: process.env.GCP_PROJECT_ID || 'aangan-staging'
      }
    }
  },

  // Sentry Error Tracking
  sentry: {
    enabled: isProduction || isStaging,
    dsn: process.env.SENTRY_DSN || 'https://your-sentry-dsn@sentry.io/project-id',
    environment: process.env.NODE_ENV || 'development',
    release: process.env.GIT_COMMIT || 'unknown',
    tracesSampleRate: isProduction ? 0.1 : 1.0, // 10% sampling in production
    profilesSampleRate: isProduction ? 0.01 : 0.1
  },

  // Performance Monitoring
  performance: {
    slowQueryThreshold: 1000, // ms
    slowRequestThreshold: 5000, // ms
    memoryWarningThreshold: 0.8, // 80% of heap used
    cpuWarningThreshold: 0.9 // 90% CPU usage
  },

  // Alerting Thresholds
  alerts: {
    errorRate: 0.05, // 5% error rate triggers alert
    responseTime: 2000, // 2s average response time
    memoryUsage: 0.85, // 85% memory usage
    diskSpace: 0.9, // 90% disk usage
    activeConnections: 1000 // Max WebSocket connections
  }
};

/**
 * Structured Logger Setup with Multiple Transports
 */
class AanganLogger {
  constructor() {
    this.logger = this.createLogger();
    this.setupSentry();
    this.setupPerformanceMonitoring();
  }

  createLogger() {
    const transports = [];

    // Console transport for development
    if (isDevelopment) {
      transports.push(new winston.transports.Console({
        level: 'debug',
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.timestamp(),
          winston.format.errors({ stack: true }),
          winston.format.printf(({ timestamp, level, message, ...meta }) => {
            const metaString = Object.keys(meta).length ? 
              '\n' + JSON.stringify(meta, null, 2) : '';
            return `${timestamp} [${level}]: ${message}${metaString}`;
          })
        )
      }));
    }

    // File transports for all environments
    transports.push(
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.errors({ stack: true }),
          winston.format.json()
        ),
        maxsize: 50 * 1024 * 1024, // 50MB
        maxFiles: 10
      }),
      new winston.transports.File({
        filename: 'logs/combined.log',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.errors({ stack: true }),
          winston.format.json()
        ),
        maxsize: 100 * 1024 * 1024, // 100MB
        maxFiles: 5
      })
    );

    // Google Cloud Logging transport for staging/production
    if (observabilityConfig.gcp.enabled && process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      try {
        const gcpLogging = new LoggingWinston({
          projectId: observabilityConfig.gcp.projectId,
          logName: observabilityConfig.gcp.logName,
          resource: observabilityConfig.gcp.resource,
          defaultCallback: (err) => {
            if (err) {
              console.error('Google Cloud Logging error:', err);
            }
          }
        });
        
        transports.push(gcpLogging);
        console.log('✅ Google Cloud Logging enabled');
      } catch (error) {
        console.warn('⚠️  Google Cloud Logging setup failed:', error.message);
      }
    }

    return winston.createLogger({
      level: isProduction ? 'info' : 'debug',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp'] }),
        winston.format.json()
      ),
      transports,
      exitOnError: false,
      exceptionHandlers: [
        new winston.transports.File({ filename: 'logs/exceptions.log' })
      ],
      rejectionHandlers: [
        new winston.transports.File({ filename: 'logs/rejections.log' })
      ]
    });
  }

  setupSentry() {
    if (observabilityConfig.sentry.enabled && observabilityConfig.sentry.dsn !== 'https://your-sentry-dsn@sentry.io/project-id') {
      try {
        Sentry.init({
          dsn: observabilityConfig.sentry.dsn,
          environment: observabilityConfig.sentry.environment,
          release: observabilityConfig.sentry.release,
          tracesSampleRate: observabilityConfig.sentry.tracesSampleRate,
          profilesSampleRate: observabilityConfig.sentry.profilesSampleRate,
          integrations: [
            new Sentry.Integrations.Http({ tracing: true }),
            new Sentry.Integrations.Express({ app: true }),
            new Sentry.Integrations.OnUncaughtException(),
            new Sentry.Integrations.OnUnhandledRejection()
          ],
          beforeSend(event) {
            // Filter out sensitive information
            if (event.request) {
              delete event.request.cookies;
              delete event.request.headers?.authorization;
              delete event.request.headers?.['x-access-token'];
              delete event.request.headers?.['x-refresh-token'];
            }
            return event;
          },
          beforeSendTransaction(transaction) {
            // Don't send health check transactions to reduce noise
            if (transaction.name?.includes('/health')) {
              return null;
            }
            return transaction;
          }
        });

        console.log('✅ Sentry error tracking enabled');
      } catch (error) {
        console.warn('⚠️  Sentry setup failed:', error.message);
      }
    }
  }

  setupPerformanceMonitoring() {
    // Memory usage monitoring
    setInterval(() => {
      const memUsage = process.memoryUsage();
      const heapPercent = memUsage.heapUsed / memUsage.heapTotal;
      
      if (heapPercent > observabilityConfig.performance.memoryWarningThreshold) {
        this.warn('High memory usage detected', {
          component: 'performance_monitor',
          heapUsed: memUsage.heapUsed,
          heapTotal: memUsage.heapTotal,
          heapPercent: (heapPercent * 100).toFixed(2) + '%',
          external: memUsage.external,
          rss: memUsage.rss
        });
      }
    }, 30000); // Check every 30 seconds

    // Process event listeners
    process.on('unhandledRejection', (reason, promise) => {
      this.error('Unhandled Promise Rejection', {
        component: 'error_handler',
        reason: reason?.message || reason,
        stack: reason?.stack,
        promise: promise.toString()
      });
    });

    process.on('uncaughtException', (error) => {
      this.error('Uncaught Exception', {
        component: 'error_handler',
        error: error.message,
        stack: error.stack
      });
    });

    // Graceful shutdown monitoring
    process.on('SIGTERM', () => {
      this.info('SIGTERM received, starting graceful shutdown', {
        component: 'lifecycle',
        action: 'shutdown_initiated'
      });
    });

    process.on('SIGINT', () => {
      this.info('SIGINT received, starting graceful shutdown', {
        component: 'lifecycle',
        action: 'shutdown_initiated'
      });
    });
  }

  // Logging methods with consistent structure
  debug(message, metadata = {}) {
    this.logger.debug(message, {
      ...metadata,
      timestamp: new Date().toISOString(),
      service: 'aangan-backend',
      version: process.env.npm_package_version || '1.0.0'
    });
  }

  info(message, metadata = {}) {
    this.logger.info(message, {
      ...metadata,
      timestamp: new Date().toISOString(),
      service: 'aangan-backend',
      version: process.env.npm_package_version || '1.0.0'
    });
  }

  warn(message, metadata = {}) {
    this.logger.warn(message, {
      ...metadata,
      timestamp: new Date().toISOString(),
      service: 'aangan-backend',
      version: process.env.npm_package_version || '1.0.0'
    });

    // Send warnings to Sentry in production
    if (observabilityConfig.sentry.enabled) {
      Sentry.captureMessage(message, 'warning');
    }
  }

  error(message, metadata = {}) {
    const errorData = {
      ...metadata,
      timestamp: new Date().toISOString(),
      service: 'aangan-backend',
      version: process.env.npm_package_version || '1.0.0'
    };

    this.logger.error(message, errorData);

    // Send errors to Sentry
    if (observabilityConfig.sentry.enabled) {
      if (metadata.error instanceof Error) {
        Sentry.captureException(metadata.error);
      } else {
        Sentry.captureMessage(message, 'error');
      }
    }
  }

  // Specialized logging methods
  logHttpRequest(req, res, duration) {
    const logData = {
      component: 'http_request',
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      duration,
      userAgent: req.get('user-agent'),
      ip: req.ip || req.connection.remoteAddress,
      contentLength: res.get('content-length')
    };

    // Log user info if available (without sensitive data)
    if (req.user) {
      logData.userId = req.user.userId;
      logData.userRole = req.user.role;
    }

    if (res.statusCode >= 500) {
      this.error('HTTP request failed', logData);
    } else if (res.statusCode >= 400) {
      this.warn('HTTP request error', logData);
    } else if (duration > observabilityConfig.performance.slowRequestThreshold) {
      this.warn('Slow HTTP request', logData);
    } else {
      this.info('HTTP request completed', logData);
    }
  }

  logWebSocketEvent(event, data) {
    this.info('WebSocket event', {
      component: 'websocket',
      event,
      ...data
    });
  }

  logDatabaseQuery(query, duration, error = null) {
    const logData = {
      component: 'database',
      query: query.substring(0, 500), // Truncate long queries
      duration,
      error: error?.message
    };

    if (error) {
      this.error('Database query failed', logData);
    } else if (duration > observabilityConfig.performance.slowQueryThreshold) {
      this.warn('Slow database query', logData);
    } else {
      this.debug('Database query completed', logData);
    }
  }

  logSecurityEvent(event, metadata = {}) {
    this.warn('Security event detected', {
      component: 'security',
      event,
      ...metadata
    });

    // Always send security events to Sentry
    if (observabilityConfig.sentry.enabled) {
      Sentry.captureMessage(`Security: ${event}`, 'warning');
    }
  }
}

// Create singleton logger instance
export const logger = new AanganLogger();

/**
 * HTTP Request Logging Middleware
 */
export const requestLoggingMiddleware = (req, res, next) => {
  const startTime = Date.now();

  // Log request start
  logger.debug('HTTP request started', {
    component: 'http_request',
    method: req.method,
    url: req.originalUrl || req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent')
  });

  // Override res.end to log completion
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    res.end = originalEnd;
    res.end(chunk, encoding);
    
    const duration = Date.now() - startTime;
    logger.logHttpRequest(req, res, duration);
  };

  next();
};

/**
 * Error Tracking Middleware
 */
export const errorTrackingMiddleware = (error, req, res, next) => {
  // Generate unique error ID for tracking
  const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Log detailed error information
  logger.error('Express error handler triggered', {
    component: 'error_handler',
    errorId,
    errorMessage: error.message,
    errorStack: error.stack,
    requestMethod: req.method,
    requestUrl: req.originalUrl || req.url,
    requestBody: req.body,
    userAgent: req.get('user-agent'),
    ip: req.ip || req.connection.remoteAddress,
    userId: req.user?.userId
  });

  // Set error context for Sentry
  if (observabilityConfig.sentry.enabled) {
    Sentry.withScope((scope) => {
      scope.setTag('errorId', errorId);
      scope.setUser({
        id: req.user?.userId,
        ip_address: req.ip
      });
      scope.setExtra('requestBody', req.body);
      scope.setExtra('requestQuery', req.query);
      scope.setExtra('requestParams', req.params);
      Sentry.captureException(error);
    });
  }

  // Send error response with error ID for tracking
  if (!res.headersSent) {
    res.status(error.status || 500).json({
      error: isProduction ? 'Internal Server Error' : error.message,
      errorId,
      timestamp: new Date().toISOString()
    });
  }

  next(error);
};

/**
 * Health Check Endpoint with System Metrics
 */
export const healthCheckHandler = async (req, res) => {
  const startTime = Date.now();
  const memUsage = process.memoryUsage();
  
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      used: Math.round(memUsage.heapUsed / 1024 / 1024),
      total: Math.round(memUsage.heapTotal / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024),
      rss: Math.round(memUsage.rss / 1024 / 1024)
    },
    system: {
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      pid: process.pid
    },
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  };

  // Check system health
  const memoryUsage = memUsage.heapUsed / memUsage.heapTotal;
  if (memoryUsage > observabilityConfig.alerts.memoryUsage) {
    healthData.status = 'warning';
    healthData.warnings = ['High memory usage'];
  }

  const responseTime = Date.now() - startTime;
  healthData.responseTime = responseTime;

  logger.debug('Health check completed', {
    component: 'health_check',
    status: healthData.status,
    responseTime,
    memoryUsage: (memoryUsage * 100).toFixed(2) + '%'
  });

  res.status(healthData.status === 'healthy' ? 200 : 503).json(healthData);
};

/**
 * Performance Metrics Collection
 */
export class PerformanceCollector {
  constructor() {
    this.metrics = {
      httpRequests: {
        total: 0,
        byStatus: {},
        byMethod: {},
        averageResponseTime: 0
      },
      websocket: {
        connections: 0,
        messagesReceived: 0,
        messagesSent: 0
      },
      database: {
        queries: 0,
        averageQueryTime: 0,
        errors: 0
      },
      errors: {
        total: 0,
        byType: {}
      }
    };

    this.startTime = Date.now();
  }

  recordHttpRequest(method, statusCode, duration) {
    this.metrics.httpRequests.total++;
    this.metrics.httpRequests.byMethod[method] = (this.metrics.httpRequests.byMethod[method] || 0) + 1;
    this.metrics.httpRequests.byStatus[statusCode] = (this.metrics.httpRequests.byStatus[statusCode] || 0) + 1;
    
    // Update average response time
    this.metrics.httpRequests.averageResponseTime = 
      (this.metrics.httpRequests.averageResponseTime * (this.metrics.httpRequests.total - 1) + duration) / 
      this.metrics.httpRequests.total;
  }

  recordWebSocketConnection(connected) {
    if (connected) {
      this.metrics.websocket.connections++;
    } else {
      this.metrics.websocket.connections = Math.max(0, this.metrics.websocket.connections - 1);
    }
  }

  recordWebSocketMessage(sent = false) {
    if (sent) {
      this.metrics.websocket.messagesSent++;
    } else {
      this.metrics.websocket.messagesReceived++;
    }
  }

  recordDatabaseQuery(duration, error = false) {
    this.metrics.database.queries++;
    
    if (error) {
      this.metrics.database.errors++;
    }

    // Update average query time
    this.metrics.database.averageQueryTime = 
      (this.metrics.database.averageQueryTime * (this.metrics.database.queries - 1) + duration) / 
      this.metrics.database.queries;
  }

  recordError(errorType) {
    this.metrics.errors.total++;
    this.metrics.errors.byType[errorType] = (this.metrics.errors.byType[errorType] || 0) + 1;
  }

  getMetrics() {
    return {
      ...this.metrics,
      uptime: Date.now() - this.startTime,
      timestamp: new Date().toISOString()
    };
  }

  logMetrics() {
    const metrics = this.getMetrics();
    
    logger.info('Performance metrics', {
      component: 'performance_metrics',
      ...metrics
    });

    // Check for alerts
    const errorRate = metrics.errors.total / (metrics.httpRequests.total || 1);
    if (errorRate > observabilityConfig.alerts.errorRate) {
      logger.warn('High error rate detected', {
        component: 'performance_alert',
        errorRate: (errorRate * 100).toFixed(2) + '%',
        threshold: (observabilityConfig.alerts.errorRate * 100).toFixed(2) + '%'
      });
    }

    if (metrics.httpRequests.averageResponseTime > observabilityConfig.alerts.responseTime) {
      logger.warn('High average response time detected', {
        component: 'performance_alert',
        averageResponseTime: metrics.httpRequests.averageResponseTime.toFixed(2) + 'ms',
        threshold: observabilityConfig.alerts.responseTime + 'ms'
      });
    }
  }
}

export const performanceCollector = new PerformanceCollector();

// Log metrics every 5 minutes
setInterval(() => {
  performanceCollector.logMetrics();
}, 5 * 60 * 1000);

/**
 * Graceful Shutdown Handler
 */
export const gracefulShutdown = (server, connections = []) => {
  const shutdown = (signal) => {
    logger.info(`${signal} received, starting graceful shutdown`, {
      component: 'lifecycle',
      action: 'shutdown_start',
      signal
    });

    // Set a timeout for forceful shutdown
    const forceShutdownTimeout = setTimeout(() => {
      logger.error('Graceful shutdown timeout, forcing exit', {
        component: 'lifecycle',
        action: 'forced_shutdown'
      });
      process.exit(1);
    }, 30000); // 30 seconds timeout

    Promise.all([
      // Close HTTP server
      new Promise((resolve) => {
        server?.close((err) => {
          if (err) {
            logger.error('Error closing HTTP server', { error: err.message });
          } else {
            logger.info('HTTP server closed');
          }
          resolve();
        });
      }),

      // Close database connections
      ...connections.map(conn => 
        new Promise((resolve) => {
          if (conn && typeof conn.destroy === 'function') {
            conn.destroy();
          }
          resolve();
        })
      ),

      // Flush Winston logs
      new Promise((resolve) => {
        logger.logger.end();
        setTimeout(resolve, 1000); // Give logs time to flush
      })
    ])
    .then(() => {
      clearTimeout(forceShutdownTimeout);
      logger.info('Graceful shutdown completed', {
        component: 'lifecycle',
        action: 'shutdown_complete'
      });
      process.exit(0);
    })
    .catch((error) => {
      clearTimeout(forceShutdownTimeout);
      logger.error('Error during graceful shutdown', {
        component: 'lifecycle',
        action: 'shutdown_error',
        error: error.message
      });
      process.exit(1);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

export default {
  logger,
  requestLoggingMiddleware,
  errorTrackingMiddleware,
  healthCheckHandler,
  performanceCollector,
  gracefulShutdown,
  observabilityConfig
};
