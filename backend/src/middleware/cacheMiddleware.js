import { cache } from '../utils/cache.js';
import logger from '../utils/logger.js';

/**
 * Generate a cache key from request parameters
 * @param {Object} req Express request object
 * @returns {string} Cache key
 */
const generateCacheKey = (req) => {
  const path = req.originalUrl || req.url;
  const query = JSON.stringify(req.query);
  const params = req.params ? JSON.stringify(req.params) : '';
  const user = req.user ? `:user:${req.user.id}` : '';
  return `cache:${req.method}:${path}${user}:${query}:${params}`;
};

/**
 * Middleware to cache responses
 * @param {Object} options Configuration options
 * @param {number} [options.ttl=300] Time to live in seconds (default: 5 minutes)
 * @param {Function} [options.keyGenerator] Custom cache key generator function
 * @param {Function} [options.shouldCache] Function to determine if response should be cached
 * @returns {Function} Express middleware
 */
export const cacheMiddleware = (options = {}) => {
  const {
    ttl = 300, // 5 minutes default TTL
    keyGenerator = generateCacheKey,
    shouldCache = () => true
  } = options;

  return async (req, res, next) => {
    // Skip caching for non-GET requests by default
    if (req.method !== 'GET') return next();
    
    // Skip if cache is not connected
    if (!cache.isConnected) return next();
    
    // Generate cache key
    const key = keyGenerator(req);
    
    try {
      // Try to get cached response
      const cached = await cache.get(key);
      
      if (cached) {
        logger.debug(`Cache hit for key: ${key}`);
        
        // Set cache headers
        res.set('X-Cache', 'HIT');
        res.set('Cache-Control', `public, max-age=${ttl}`);
        
        // Send cached response
        return res.json(cached);
      }
      
      // Cache miss, continue to route handler
      logger.debug(`Cache miss for key: ${key}`);
      res.set('X-Cache', 'MISS');
      
      // Override res.json to cache the response
      const originalJson = res.json;
      res.json = (body) => {
        // Only cache if status is 2xx
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // Check if we should cache this response
          if (shouldCache(req, body)) {
            cache.set(key, body, ttl).catch(err => {
              logger.error('Error setting cache:', err);
            });
          }
        }
        
        // Call original res.json
        originalJson.call(res, body);
      };
      
      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      next();
    }
  };
};

/**
 * Invalidate cache for specific patterns
 * @param {string|string[]} patterns Cache key patterns to invalidate
 * @returns {Function} Express middleware
 */
export const invalidateCache = (patterns) => {
  return async (req, res, next) => {
    if (!cache.isConnected) return next();
    
    // Wait for the response to be sent
    res.on('finish', async () => {
      try {
        const patternsArray = Array.isArray(patterns) ? patterns : [patterns];
        
        for (const pattern of patternsArray) {
          const count = await cache.invalidatePattern(pattern);
          logger.debug(`Invalidated ${count} cache entries for pattern: ${pattern}`);
        }
      } catch (error) {
        logger.error('Error invalidating cache:', error);
      }
    });
    
    next();
  };
};

/**
 * Middleware to prevent caching of sensitive data
 */
export const noCache = (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
};

export default {
  cache: cacheMiddleware,
  invalidate: invalidateCache,
  noCache
};
