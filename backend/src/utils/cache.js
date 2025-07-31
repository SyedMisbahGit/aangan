import { createClient } from 'redis';
import { logger } from './logger.js';

class Cache {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.defaultTTL = 3600; // 1 hour default TTL
  }

  /**
   * Initialize Redis connection
   */
  async connect() {
    if (this.isConnected) return;

    try {
      const url = process.env.REDIS_URL || 'redis://localhost:6379';
      this.client = createClient({ url });
      
      this.client.on('error', (err) => {
        logger.error('Redis error:', err);
        this.isConnected = false;
      });
      
      this.client.on('connect', () => {
        logger.info('Connected to Redis');
        this.isConnected = true;
      });
      
      this.client.on('reconnecting', () => {
        logger.info('Reconnecting to Redis...');
        this.isConnected = false;
      });
      
      await this.client.connect();
      this.isConnected = true;
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      this.isConnected = false;
    }
  }

  /**
   * Get a value from cache
   * @param {string} key Cache key
   * @returns {Promise<any>} Cached value or null if not found
   */
  async get(key) {
    if (!this.isConnected) return null;
    
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error(`Error getting key ${key} from cache:`, error);
      return null;
    }
  }

  /**
   * Set a value in cache with optional TTL
   * @param {string} key Cache key
   * @param {any} value Value to cache (will be JSON stringified)
   * @param {number} ttlInSeconds Time to live in seconds (default: 1 hour)
   * @returns {Promise<boolean>} Success status
   */
  async set(key, value, ttlInSeconds = this.defaultTTL) {
    if (!this.isConnected) return false;
    
    try {
      const serializedValue = JSON.stringify(value);
      
      if (ttlInSeconds > 0) {
        await this.client.set(key, serializedValue, { EX: ttlInSeconds });
      } else {
        await this.client.set(key, serializedValue);
      }
      
      return true;
    } catch (error) {
      logger.error(`Error setting key ${key} in cache:`, error);
      return false;
    }
  }

  /**
   * Delete a key from cache
   * @param {string} key Cache key
   * @returns {Promise<boolean>} Success status
   */
  async del(key) {
    if (!this.isConnected) return false;
    
    try {
      const result = await this.client.del(key);
      return result > 0;
    } catch (error) {
      logger.error(`Error deleting key ${key} from cache:`, error);
      return false;
    }
  }

  /**
   * Invalidate cache by pattern (supports wildcards)
   * @param {string} pattern Pattern to match keys (e.g., 'user:*')
   * @returns {Promise<number>} Number of keys deleted
   */
  async invalidatePattern(pattern) {
    if (!this.isConnected) return 0;
    
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length === 0) return 0;
      
      const result = await this.client.del(keys);
      return result;
    } catch (error) {
      logger.error(`Error invalidating cache pattern ${pattern}:`, error);
      return 0;
    }
  }

  /**
   * Clear the entire cache (use with caution!)
   * @returns {Promise<boolean>} Success status
   */
  async flush() {
    if (!this.isConnected) return false;
    
    try {
      await this.client.flushDb();
      return true;
    } catch (error) {
      logger.error('Error flushing cache:', error);
      return false;
    }
  }

  /**
   * Close the Redis connection
   */
  async disconnect() {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
    }
  }
}

// Create and export a singleton instance
export const cache = new Cache();

// Auto-connect when imported
cache.connect().catch(err => {
  logger.error('Failed to connect to Redis on startup:', err);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await cache.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await cache.disconnect();
  process.exit(0);
});
