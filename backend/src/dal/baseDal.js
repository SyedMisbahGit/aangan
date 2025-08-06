import { cache } from '../utils/cache.js';
import logger from '../utils/logger.js';

/**
 * Base Data Access Layer class with built-in caching
 */
export class BaseDal {
  /**
   * Create a new DAL instance
   * @param {string} name Name of the DAL (used for logging and cache key prefixes)
   * @param {Object} options Configuration options
   * @param {number} [options.defaultTtl=300] Default cache TTL in seconds
   * @param {boolean} [options.cacheEnabled=true] Whether caching is enabled
   */
  constructor(name, options = {}) {
    this.name = name;
    this.cacheEnabled = options.cacheEnabled !== false;
    this.defaultTtl = options.defaultTtl || 300; // 5 minutes default
    this.cachePrefix = `dal:${name}:`;
  }

  /**
   * Generate a cache key
   * @param {string} key Cache key suffix
   * @returns {string} Full cache key with prefix
   */
  _cacheKey(key) {
    return `${this.cachePrefix}${key}`;
  }

  /**
   * Get a value from cache
   * @param {string} key Cache key
   * @returns {Promise<any>} Cached value or null
   */
  async _getFromCache(key) {
    if (!this.cacheEnabled || !cache.isConnected) return null;
    
    try {
      const value = await cache.get(this._cacheKey(key));
      if (value) {
        logger.debug(`[${this.name}] Cache hit for key: ${key}`);
      }
      return value;
    } catch (error) {
      logger.error(`[${this.name}] Cache get error:`, error);
      return null;
    }
  }

  /**
   * Set a value in cache
   * @param {string} key Cache key
   * @param {any} value Value to cache
   * @param {number} ttl Time to live in seconds
   * @returns {Promise<boolean>} Success status
   */
  async _setInCache(key, value, ttl = this.defaultTtl) {
    if (!this.cacheEnabled || !cache.isConnected) return false;
    
    try {
      await cache.set(this._cacheKey(key), value, ttl);
      return true;
    } catch (error) {
      logger.error(`[${this.name}] Cache set error:`, error);
      return false;
    }
  }

  /**
   * Invalidate cache entries by key pattern
   * @param {string} pattern Pattern to match cache keys
   * @returns {Promise<number>} Number of keys invalidated
   */
  async _invalidateCache(pattern) {
    if (!this.cacheEnabled || !cache.isConnected) return 0;
    
    try {
      const fullPattern = this._cacheKey(pattern);
      const count = await cache.invalidatePattern(fullPattern);
      logger.debug(`[${this.name}] Invalidated ${count} cache entries for pattern: ${pattern}`);
      return count;
    } catch (error) {
      logger.error(`[${this.name}] Cache invalidation error:`, error);
      return 0;
    }
  }

  /**
   * Execute a cached database operation
   * @param {Object} options Options
   * @param {string} options.key Cache key
   * @param {Function} options.queryFn Function that returns a promise with the database query
   * @param {number} [options.ttl] Cache TTL in seconds
   * @param {boolean} [options.forceRefresh] Force refresh the cache
   * @returns {Promise<any>} Query result
   */
  async cachedQuery({ key, queryFn, ttl, forceRefresh = false }) {
    // Try to get from cache first
    if (!forceRefresh) {
      const cached = await this._getFromCache(key);
      if (cached !== null) {
        return cached;
      }
    }

    // Execute the query
    const result = await queryFn();

    // Cache the result if it's not null/undefined
    if (result !== null && result !== undefined) {
      await this._setInCache(key, result, ttl);
    }

    return result;
  }

  /**
   * Invalidate all cached items for this DAL
   * @returns {Promise<number>} Number of cache entries invalidated
   */
  async invalidateAll() {
    return this._invalidateCache('*');
  }
}
