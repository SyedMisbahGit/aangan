import client from 'prom-client';
import responseTime from 'response-time';

// Create a Registry which registers the metrics
const register = new client.Registry();

// Enable collection of default metrics
client.collectDefaultMetrics({
  app: 'college-whisper-api',
  prefix: 'node_',
  timeout: 10000,
  gcDurationBuckets: [0.1, 0.5, 1, 2, 5], // These are the default buckets.
  register
});

// Create custom metrics
const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10], // 0.1 to 10 seconds
});

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const httpRequestDurationByEndpoint = new client.Summary({
  name: 'http_request_duration_microseconds_by_endpoint',
  help: 'Duration of HTTP requests by endpoint in microseconds',
  labelNames: ['method', 'route', 'code']
});

const databaseQueryDuration = new client.Histogram({
  name: 'database_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation', 'table']
});

const redisOperationDuration = new client.Histogram({
  name: 'redis_operation_duration_seconds',
  help: 'Duration of Redis operations in seconds',
  labelNames: ['operation']
});

const errorCounter = new client.Counter({
  name: 'api_errors_total',
  help: 'Total number of errors in the API',
  labelNames: ['endpoint', 'status_code', 'error_type']
});

// Register the metrics
register.registerMetric(httpRequestDurationMicroseconds);
register.registerMetric(httpRequestsTotal);
register.registerMetric(httpRequestDurationByEndpoint);
register.registerMetric(databaseQueryDuration);
register.registerMetric(redisOperationDuration);
register.registerMetric(errorCounter);

/**
 * Middleware to track request metrics
 */
export const metricsMiddleware = responseTime((req, res, time) => {
  const route = req.route ? req.route.path : req.path;
  const statusCode = res.statusCode;
  const method = req.method;
  
  // Record request duration
  httpRequestDurationMicroseconds
    .labels(method, route, statusCode)
    .observe(time / 1000); // Convert to seconds
    
  // Record total requests
  httpRequestsTotal.inc({
    method,
    route,
    status_code: statusCode
  });
  
  // Record duration by endpoint
  if (route) {
    httpRequestDurationByEndpoint
      .labels(method, route, statusCode)
      .observe(time * 1000); // Convert to microseconds
  }
});

/**
 * Track database query metrics
 */
export const trackDatabaseQuery = (operation, table, startTime) => {
  const duration = process.hrtime(startTime);
  const durationInSeconds = duration[0] + duration[1] / 1e9;
  
  databaseQueryDuration
    .labels(operation, table)
    .observe(durationInSeconds);
};

/**
 * Track Redis operation metrics
 */
export const trackRedisOperation = (operation, startTime) => {
  const duration = process.hrtime(startTime);
  const durationInSeconds = duration[0] + duration[1] / 1e9;
  
  redisOperationDuration
    .labels(operation)
    .observe(durationInSeconds);
};

/**
 * Track API errors
 */
export const trackError = (endpoint, statusCode, errorType) => {
  errorCounter.inc({
    endpoint,
    status_code: statusCode,
    error_type: errorType || 'unknown'
  });
};

/**
 * Get metrics endpoint handler
 */
export const getMetrics = async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.end(metrics);
  } catch (err) {
    console.error('Error generating metrics:', err);
    res.status(500).end('Error generating metrics');
  }
};

export default {
  metricsMiddleware,
  trackDatabaseQuery,
  trackRedisOperation,
  trackError,
  getMetrics,
  register
};
