/**
 * @file Redis-based caching utility with automatic reconnection and error handling
 * @module utils/cache
 * @description 
 * Provides a high-level interface for Redis caching operations with the following features:
 * - Automatic connection management with reconnection
 * - JSON serialization/deserialization
 * - Key pattern-based invalidation
 * - Graceful shutdown handling
 * - Comprehensive error handling and logging
 * - Singleton instance for application-wide use
 */

import { createClient } from 'redis';
import logger from './logger.js';

/**
 * Redis-based caching client with automatic reconnection and error handling
 * @class
 */
class Cache {
  /**
   * Create a new Cache instance
   * @constructor
   * @param {Object} [options] - Configuration options
   * @param {number} [options.defaultTTL=3600] - Default TTL in seconds (1 hour)
   * @param {string} [options.redisUrl] - Custom Redis connection URL
   */
  constructor({ defaultTTL = 3600, redisUrl } = {}) {
    /** @private */
    this.client = null;
    
    /** @private */
    this.isConnected = false;
    
    /** @private */
    this.defaultTTL = defaultTTL;
    
    /** @private */
    this.redisUrl = redisUrl || process.env.REDIS_URL || 'redis://localhost:6379';
  }

  /**
   * Establishes a connection to the Redis server
   * @async
   * @method connect
   * @returns {Promise<boolean>} True if connection was successful, false otherwise
   * @throws {Error} If Redis client configuration is invalid
   * @example
   * const cache = new Cache();
   * const isConnected = await cache.connect();
   * if (!isConnected) {
   *   console.error('Failed to connect to Redis');
   * }
   */
  async connect() {
    if (this.isConnected) return true;

    try {
      this.client = createClient({ 
        url: this.redisUrl,
        socket: {
          reconnectStrategy: (retries) => {
            // Exponential backoff for reconnection attempts
            const delay = Math.min(retries * 100, 5000); // Max 5 seconds
            logger.warn(`Redis reconnecting (attempt ${retries + 1})...`);
            return delay;
          }
        }
      });
      
      // Set up event handlers
      this.client.on('error', (err) => {
        logger.error('Redis client error:', err);
        this.isConnected = false;
      });
      
      this.client.on('connect', () => {
        logger.info('Redis connection established');
        this.isConnected = true;
      });
      
      this.client.on('reconnecting', () => {
        logger.info('Redis reconnecting...');
        this.isConnected = false;
      });
      
      this.client.on('end', () => {
        logger.warn('Redis connection closed');
        this.isConnected = false;
      });
      
      // Establish connection
      await this.client.connect();
      this.isConnected = true;
      return true;
      
    } catch (error) {
      const errorMsg = `Failed to connect to Redis at ${this.redisUrl}: ${error.message}`;
      logger.error(errorMsg, { error });
      this.isConnected = false;
      throw new Error(errorMsg, { cause: error });
    }
  }

  /**
   * Retrieves a value from the cache by key
   * @async
   * @method get
   * @param {string} key - The cache key to retrieve
   * @returns {Promise<*>} The cached value, or null if not found or on error
   * @example
   * const user = await cache.get(`user:${userId}`);
   * if (user) {
   *   console.log('User from cache:', user);
   * }
   */
  async get(key) {
    if (!this.isConnected) {
      logger.warn(`Attempted to get ${key} but cache is not connected`);
      return null;
    }
    
    if (typeof key !== 'string') {
      logger.warn('Cache key must be a string', { key });
      return null;
    }
    
    try {
      const value = await this.client.get(key);
      
      if (value === null) {
        logger.debug(`Cache miss for key: ${key}`);
        return null;
      }
      
      logger.debug(`Cache hit for key: ${key}`);
      return JSON.parse(value);
      
    } catch (error) {
      logger.error(`Error getting key ${key} from cache:`, error);
      return null;
    }
  }

  /**
   * Sets a value in the cache with an optional TTL
   * @async
   * @method set
   * @param {string} key - The cache key
   * @param {*} value - The value to cache (must be JSON-serializable)
   * @param {number} [ttlInSeconds=this.defaultTTL] - Time to live in seconds (0 = no expiration)
   * @returns {Promise<boolean>} True if the operation was successful
   * @example
   * // Cache a user object for 5 minutes
   * const success = await cache.set(
   *   `user:${userId}`, 
   *   { id: userId, name: 'John' },
   *   300 // 5 minutes
   * );
   */
  async set(key, value, ttlInSeconds = this.defaultTTL) {
    if (!this.isConnected) {
      logger.warn(`Attempted to set ${key} but cache is not connected`);
      return false;
    }
    
    if (typeof key !== 'string') {
      logger.warn('Cache key must be a string', { key });
      return false;
    }
    
    try {
      const serializedValue = JSON.stringify(value);
      
      if (ttlInSeconds > 0) {
        await this.client.set(key, serializedValue, { 
          EX: Math.ceil(ttlInSeconds) // Ensure integer value
        });
        logger.debug(`Cached ${key} with TTL ${ttlInSeconds}s`);
      } else {
        await this.client.set(key, serializedValue);
        logger.debug(`Cached ${key} without TTL`);
      }
      
      return true;
      
    } catch (error) {
      logger.error(`Error setting key ${key} in cache:`, error);
      return false;
    }
  }

  /**
   * Deletes a key from the cache
   * @async
   * @method del
   * @param {string} key - The cache key to delete
   * @returns {Promise<boolean>} True if the key was deleted, false if it didn't exist or on error
   * @example
   * // Remove a specific key
   * const wasDeleted = await cache.del(`user:${userId}`);
   */
  async del(key) {
    if (!this.isConnected) {
      logger.warn(`Attempted to delete ${key} but cache is not connected`);
      return false;
    }
    
    if (typeof key !== 'string') {
      logger.warn('Cache key must be a string', { key });
      return false;
    }
    
    try {
      const result = await this.client.del(key);
      const wasDeleted = result > 0;
      
      if (wasDeleted) {
        logger.debug(`Deleted cache key: ${key}`);
      } else {
        logger.debug(`Attempted to delete non-existent key: ${key}`);
      }
      
      return wasDeleted;
      
    } catch (error) {
      logger.error(`Error deleting key ${key} from cache:`, error);
      return false;
    }
  }

  /**
   * Invalidates all cache entries matching a pattern
   * @async
   * @method invalidatePattern
   * @param {string} pattern - Pattern to match keys (supports Redis glob-style patterns)
   * @returns {Promise<number>} Number of keys deleted
   * @example
   * // Invalidate all user-related cache entries
   * const count = await cache.invalidatePattern('user:*');
   * console.log(`Invalidated ${count} cache entries`);
   * 
   * @warning Be cautious with patterns that might match many keys in production
   */
  async invalidatePattern(pattern) {
    if (!this.isConnected) {
      logger.warn(`Attempted to invalidate pattern ${pattern} but cache is not connected`);
      return 0;
    }
    
    if (typeof pattern !== 'string') {
      logger.warn('Pattern must be a string', { pattern });
      return 0;
    }
    
    // Safety check for patterns that might be too broad
    const SAFE_PATTERN_LIMIT = 1000;
    const UNSAFE_PATTERNS = ['*', ':*', '*:*'];
    
    if (UNSAFE_PATTERNS.includes(pattern)) {
      logger.warn(`Potentially unsafe pattern '${pattern}' - use with caution`);
    }
    
    try {
      const keys = await this.client.keys(pattern);
      
      if (keys.length === 0) {
        logger.debug(`No keys matched pattern: ${pattern}`);
        return 0;
      }
      
      if (keys.length > SAFE_PATTERN_LIMIT) {
        logger.warn(`Pattern '${pattern}' matched ${keys.length} keys, which exceeds the safe limit of ${SAFE_PATTERN_LIMIT}`);
        // Optionally, you could implement batching here for large key sets
      }
      
      const result = await this.client.del(keys);
      logger.debug(`Invalidated ${result} keys matching pattern: ${pattern}`);
      
      return result;
      
    } catch (error) {
      logger.error(`Error invalidating cache pattern '${pattern}':`, error);
      return 0;
    }
  }

  /**
   * Flushes the entire Redis database (DANGEROUS - use with extreme caution!)
   * @async
   * @method flush
   * @returns {Promise<boolean>} True if the operation was successful
   * @example
   * // Only allow in non-production environments
   * if (process.env.NODE_ENV !== 'production') {
   *   await cache.flush();
   * }
   * @warning This will delete ALL data in the current Redis database
   */
  async flush() {
    if (!this.isConnected) {
      logger.warn('Attempted to flush cache but not connected');
      return false;
    }
    
    // Add an extra safety check for production environments
    if (process.env.NODE_ENV === 'production' && !process.env.ALLOW_CACHE_FLUSH) {
      const error = new Error('Cache flush is disabled in production');
      logger.error('Attempted to flush cache in production environment', { error });
      throw error;
    }
    
    try {
      logger.warn('Flushing entire cache - this will delete ALL data in the current Redis database');
      await this.client.flushDb();
      logger.info('Cache flushed successfully');
      return true;
      
    } catch (error) {
      logger.error('Error flushing cache:', error);
      return false;
    }
  }

  /**
   * Gracefully disconnects from the Redis server
   * @async
   * @method disconnect
   * @returns {Promise<void>}
   * @example
   * // On application shutdown
   * await cache.disconnect();
   */
  async disconnect() {
    if (!this.client) return;
    
    try {
      logger.info('Disconnecting from Redis...');
      await this.client.quit();
      this.isConnected = false;
      logger.info('Disconnected from Redis');
      
    } catch (error) {
      logger.error('Error disconnecting from Redis:', error);
      throw error; // Re-throw to allow handling in the calling code
    }
  }
}

/**
 * Default Redis URL from environment or default
 * @constant
 * @type {string}
 */
const DEFAULT_REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

/**
 * Default cache TTL in seconds (1 hour)
 * @constant
 * @type {number}
 */
const DEFAULT_CACHE_TTL = 3600;

/**
 * Singleton cache instance for application-wide use
 * @type {Cache}
 * @example
 * // Basic usage
 * import { cache } from './utils/cache';
 * 
 * // Set a value
 * await cache.set('key', { data: 'value' });
 * 
 * // Get a value
 * const value = await cache.get('key');
 */
export const cache = new Cache({
  redisUrl: DEFAULT_REDIS_URL,
  defaultTTL: DEFAULT_CACHE_TTL
});

// Auto-connect when imported (non-blocking)
if (process.env.NODE_ENV !== 'test') {
  cache.connect().catch(err => {
    logger.error('Failed to connect to Redis on startup:', err);
  });
}

// Graceful shutdown handlers
const shutdownHandlers = {
  /** @type {NodeJS.SignalsListener} */
  handleSignal: async (signal) => {
    logger.info(`Received ${signal}, shutting down gracefully...`);
    
    try {
      await cache.disconnect();
      logger.info('Cache disconnected successfully');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown:', error);
      process.exit(1);
    }
  },
  
  /**
   * Registers shutdown handlers for various signals
   * @private
   */
  register: function() {
    const signals = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
    signals.forEach(signal => {
      process.on(signal, () => this.handleSignal(signal));
    });
  }
};

// Register shutdown handlers
shutdownHandlers.register();

// Export the Cache class for testing and advanced usage
export { Cache };
