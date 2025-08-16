/**
 * @file Pub/Sub Adapter
 * @description Provides a unified interface for pub/sub operations that works with both Redis and in-memory implementations
 */

import { createClient } from 'redis';
import logger from './logger.js';
import inMemoryPubSub from './inMemoryPubSub.js';

/**
 * Determine if Redis should be used based on environment variables
 * @type {boolean}
 */
const USE_REDIS = process.env.USE_REDIS === 'true';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

class PubSubAdapter {
  constructor() {
    this.redisClient = null;
    this.redisSubscriber = null;
    this.redisPublisher = null;
    this.isRedisConnected = false;
    this.pendingSubscriptions = new Map();
    this.pendingPatternSubscriptions = new Map();
  }

  /**
   * Initialize the pub/sub adapter
   * @returns {Promise<void>}
   */
  async init() {
    if (!USE_REDIS) {
      logger.info('Using in-memory pub/sub (Redis disabled)');
      return;
    }

    try {
      // Create Redis clients
      this.redisClient = createClient({ url: REDIS_URL });
      this.redisSubscriber = this.redisClient.duplicate();
      this.redisPublisher = this.redisClient.duplicate();

      // Set up error handlers
      const handleError = (error) => {
        logger.error('Redis connection error:', error);
        this.isRedisConnected = false;
      };

      this.redisClient.on('error', handleError);
      this.redisSubscriber.on('error', handleError);
      this.redisPublisher.on('error', handleError);

      // Connect to Redis
      await this.redisClient.connect();
      await this.redisSubscriber.connect();
      await this.redisPublisher.connect();

      this.isRedisConnected = true;
      logger.info('Redis pub/sub connected successfully');

      // Process any pending subscriptions
      this.pendingSubscriptions.forEach(({ channel, callback }) => {
        this.redisSubscriber.subscribe(channel, callback);
      });
      this.pendingSubscriptions.clear();

      // Process any pending pattern subscriptions
      this.pendingPatternSubscriptions.forEach(({ pattern, callback }) => {
        this.redisSubscriber.pSubscribe(pattern, callback);
      });
      this.pendingPatternSubscriptions.clear();

    } catch (error) {
      logger.error('Failed to initialize Redis pub/sub, falling back to in-memory:', error);
      this.isRedisConnected = false;
    }
  }

  /**
   * Subscribe to a channel
   * @param {string} channel - Channel name
   * @param {(message: string, channel: string) => void} callback - Callback function
   * @returns {Promise<() => Promise<void>>} Unsubscribe function
   */
  async subscribe(channel, callback) {
    if (this.isRedisConnected) {
      try {
        await this.redisSubscriber.subscribe(channel, callback);
        return async () => {
          await this.redisSubscriber.unsubscribe(channel, callback);
        };
      } catch (error) {
        logger.error(`Failed to subscribe to Redis channel ${channel}:`, error);
        // Fall through to in-memory
      }
    }

    // Use in-memory pub/sub
    return inMemoryPubSub.subscribe(channel, callback);
  }

  /**
   * Publish a message to a channel
   * @param {string} channel - Channel name
   * @param {any} message - Message to publish
   * @returns {Promise<number>} Number of subscribers that received the message
   */
  async publish(channel, message) {
    if (this.isRedisConnected) {
      try {
        const result = await this.redisPublisher.publish(channel, JSON.stringify(message));
        return result;
      } catch (error) {
        logger.error(`Failed to publish to Redis channel ${channel}:`, error);
        // Fall through to in-memory
      }
    }

    // Use in-memory pub/sub
    return inMemoryPubSub.publish(channel, message);
  }

  /**
   * Pattern-based subscription (mimics Redis PSUBSCRIBE)
   * @param {string} pattern - Pattern to match channels
   * @param {(message: string, channel: string) => void} callback - Callback function
   * @returns {Promise<() => Promise<void>>} Unsubscribe function
   */
  async psubscribe(pattern, callback) {
    if (this.isRedisConnected) {
      try {
        await this.redisSubscriber.pSubscribe(pattern, callback);
        return async () => {
          await this.redisSubscriber.pUnsubscribe(pattern, callback);
        };
      } catch (error) {
        logger.error(`Failed to subscribe to Redis pattern ${pattern}:`, error);
        // Fall through to in-memory
      }
    }

    // Use in-memory pub/sub
    return inMemoryPubSub.psubscribe(pattern, callback);
  }

  /**
   * Close all connections and clean up
   * @returns {Promise<void>}
   */
  async close() {
    if (this.isRedisConnected) {
      try {
        await Promise.all([
          this.redisSubscriber?.quit(),
          this.redisPublisher?.quit(),
          this.redisClient?.quit()
        ].filter(Boolean));
      } catch (error) {
        logger.error('Error closing Redis connections:', error);
      } finally {
        this.isRedisConnected = false;
      }
    }

    // Clean up in-memory pub/sub
    inMemoryPubSub.close();
  }
}

// Export a singleton instance
const pubSubAdapter = new PubSubAdapter();

// Auto-initialize (non-blocking)
if (process.env.NODE_ENV !== 'test') {
  pubSubAdapter.init().catch(error => {
    logger.error('Failed to initialize pub/sub adapter:', error);
  });
}

export default pubSubAdapter;
