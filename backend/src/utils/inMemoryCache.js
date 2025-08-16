/**
 * @file In-memory cache implementation
 * @description Provides a simple in-memory cache with TTL support
 * This is used as a fallback when Redis is not available
 */

class InMemoryCache {
  constructor() {
    this.store = new Map();
    this.ttlMap = new Map();
  }

  /**
   * Set a value in the cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache (will be JSON stringified)
   * @param {number} [ttl] - Time to live in seconds
   * @returns {Promise<boolean>} True if successful
   */
  async set(key, value, ttl) {
    this.store.set(key, JSON.stringify(value));
    
    // Clear existing TTL if any
    if (this.ttlMap.has(key)) {
      clearTimeout(this.ttlMap.get(key));
      this.ttlMap.delete(key);
    }
    
    // Set new TTL if provided
    if (ttl) {
      const timeout = setTimeout(() => {
        this.store.delete(key);
        this.ttlMap.delete(key);
      }, ttl * 1000);
      
      this.ttlMap.set(key, timeout);
    }
    
    return true;
  }

  /**
   * Get a value from the cache
   * @param {string} key - Cache key
   * @returns {Promise<any|null>} Cached value or null if not found/expired
   */
  async get(key) {
    if (!this.store.has(key)) return null;
    return JSON.parse(this.store.get(key));
  }

  /**
   * Delete a key from the cache
   * @param {string} key - Cache key to delete
   * @returns {Promise<boolean>} True if key existed and was deleted
   */
  async del(key) {
    const existed = this.store.has(key);
    if (existed) {
      this.store.delete(key);
      if (this.ttlMap.has(key)) {
        clearTimeout(this.ttlMap.get(key));
        this.ttlMap.delete(key);
      }
    }
    return existed;
  }

  /**
   * Clear all cached values
   * @returns {Promise<boolean>} Always returns true
   */
  async flushAll() {
    this.store.clear();
    for (const timeout of this.ttlMap.values()) {
      clearTimeout(timeout);
    }
    this.ttlMap.clear();
    return true;
  }

  /**
   * Close the cache connection (no-op for in-memory cache)
   * @returns {Promise<boolean>} Always returns true
   */
  async close() {
    return true;
  }

  /**
   * Check if the cache is connected (always true for in-memory cache)
   * @returns {boolean} Always returns true
   */
  get isConnected() {
    return true;
  }
}

// Export a singleton instance
export const inMemoryCache = new InMemoryCache();

export default inMemoryCache;
