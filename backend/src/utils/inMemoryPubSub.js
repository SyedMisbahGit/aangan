/**
 * @file In-memory Pub/Sub implementation
 * @description Provides a simple in-memory publish/subscribe system
 * This is used as a fallback when Redis Pub/Sub is not available
 */

class InMemoryPubSub {
  constructor() {
    this.channels = new Map();
    this.patterns = new Map();
  }

  /**
   * Subscribe to a channel
   * @param {string} channel - Channel name
   * @param {Function} callback - Callback function when a message is received
   * @returns {() => void} Unsubscribe function
   */
  subscribe(channel, callback) {
    if (!this.channels.has(channel)) {
      this.channels.set(channel, new Set());
    }
    
    const subscribers = this.channels.get(channel);
    subscribers.add(callback);
    
    // Return unsubscribe function
    return () => {
      subscribers.delete(callback);
      if (subscribers.size === 0) {
        this.channels.delete(channel);
      }
    };
  }

  /**
   * Publish a message to a channel
   * @param {string} channel - Channel name
   * @param {any} message - Message to publish
   * @returns {number} Number of subscribers that received the message
   */
  publish(channel, message) {
    if (!this.channels.has(channel)) {
      return 0;
    }
    
    const subscribers = this.channels.get(channel);
    const messageString = JSON.stringify(message);
    
    // Notify all subscribers
    subscribers.forEach(callback => {
      try {
        callback(messageString, channel);
      } catch (error) {
        console.error(`Error in pub/sub callback for channel ${channel}:`, error);
      }
    });
    
    return subscribers.size;
  }

  /**
   * Pattern-based subscription (mimics Redis PSUBSCRIBE)
   * @param {string} pattern - Pattern to match channels
   * @param {Function} callback - Callback function when a message is received
   * @returns {() => void} Unsubscribe function
   */
  psubscribe(pattern, callback) {
    if (!this.patterns.has(pattern)) {
      this.patterns.set(pattern, new Set());
    }
    
    const patternSubscribers = this.patterns.get(pattern);
    patternSubscribers.add(callback);
    
    // Return unsubscribe function
    return () => {
      patternSubscribers.delete(callback);
      if (patternSubscribers.size === 0) {
        this.patterns.delete(pattern);
      }
    };
  }

  /**
   * Publish a message to all matching pattern channels
   * @param {string} channel - Channel name
   * @param {any} message - Message to publish
   * @returns {number} Number of pattern subscribers that received the message
   */
  publishToPatterns(channel, message) {
    let total = 0;
    const messageString = JSON.stringify(message);
    
    for (const [pattern, subscribers] of this.patterns.entries()) {
      if (this._matchesPattern(channel, pattern)) {
        subscribers.forEach(callback => {
          try {
            callback(messageString, channel);
            total++;
          } catch (error) {
            console.error(`Error in pattern pub/sub callback for pattern ${pattern}:`, error);
          }
        });
      }
    }
    
    return total;
  }

  /**
   * Check if a channel matches a pattern (supports * wildcard)
   * @private
   */
  _matchesPattern(channel, pattern) {
    const regexPattern = pattern
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*');
    
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(channel);
  }

  /**
   * Close all subscriptions (cleanup)
   */
  close() {
    this.channels.clear();
    this.patterns.clear();
  }
}

// Export a singleton instance
export const inMemoryPubSub = new InMemoryPubSub();

export default inMemoryPubSub;
