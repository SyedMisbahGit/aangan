import { createClient } from 'redis';
import { logger } from '../utils/logger.js';

class RedisClient {
  constructor() {
    if (!process.env.REDIS_URL) {
      logger.warn('REDIS_URL not set, using in-memory rate limiting');
      this.client = null;
      return;
    }

    try {
      this.client = createClient({
        url: process.env.REDIS_URL,
        socket: {
          tls: process.env.NODE_ENV === 'production',
          rejectUnauthorized: false,
          reconnectStrategy: (retries) => {
            const maxRetries = 5;
            if (retries > maxRetries) {
              logger.warn('Max Redis reconnection attempts reached');
              return new Error('Max reconnection attempts reached');
            }
            // Exponential backoff with jitter
            const baseDelay = Math.min(100 * Math.pow(2, retries), 5000);
            const jitter = Math.floor(Math.random() * 100);
            return baseDelay + jitter;
          },
        },
        pingInterval: 30000, // Send PING every 30 seconds
      });

      this.setupEventListeners();
      this.connect();
    } catch (err) {
      logger.error('Failed to initialize Redis client:', err);
      this.client = null;
    }
  }

  async connect() {
    if (!this.client) return false;
    
    try {
      await this.client.connect();
      const isAlive = await this.ping();
      if (!isAlive) {
        logger.warn('Redis connection test failed');
        return false;
      }
      logger.info('Connected to Redis');
      return true;
    } catch (err) {
      logger.error('Failed to connect to Redis:', err);
      return false;
    }
  }

  async disconnect() {
    if (this.client) {
      try {
        await this.client.quit();
        logger.info('Redis connection closed');
        return true;
      } catch (err) {
        logger.error('Error closing Redis connection:', err);
        return false;
      }
    }
    return true;
  }

  async ping() {
    if (!this.client) return false;
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (err) {
      logger.error('Redis ping failed:', err);
      return false;
    }
  }

  setupEventListeners() {
    if (!this.client) return;

    this.client.on('error', (err) => {
      logger.error('Redis client error:', err);
    });

    this.client.on('connect', () => {
      logger.info('Redis client connected');
    });

    this.client.on('reconnecting', () => {
      logger.info('Redis client reconnecting...');
    });

    this.client.on('ready', () => {
      logger.info('Redis client ready');
    });

    this.client.on('end', () => {
      logger.info('Redis client disconnected');
    });
  }

  getClient() {
    return this.client;
  }

  async set(key, value, ttlSeconds = null) {
    if (!this.client) return null;
    try {
      if (ttlSeconds) {
        return await this.client.set(key, value, { EX: ttlSeconds });
      }
      return await this.client.set(key, value);
    } catch (err) {
      logger.error('Redis set error:', err);
      return null;
    }
  }

  async get(key) {
    if (!this.client) return null;
    try {
      return await this.client.get(key);
    } catch (err) {
      logger.error('Redis get error:', err);
      return null;
    }
  }

  async del(key) {
    if (!this.client) return 0;
    try {
      return await this.client.del(key);
    } catch (err) {
      logger.error('Redis del error:', err);
      return 0;
    }
  }
}

// Create a singleton instance
export const redis = new RedisClient();

// Graceful shutdown
const shutdown = async () => {
  await redis.disconnect();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export default redis;
