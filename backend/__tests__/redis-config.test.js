import { describe, it, expect, beforeEach, afterEach, vi, beforeAll, afterAll } from 'vitest';
import { PubSubAdapter } from '../src/utils/pubSubAdapter.js';

// Helper function to set environment variables
const setEnvVars = (useRedis) => {
  process.env.USE_REDIS = useRedis ? 'true' : 'false';
  process.env.REDIS_URL = useRedis ? 'redis://localhost:6379' : '';
};

describe('PubSubAdapter with different configurations', () => {
  let originalEnv;
  let pubSubAdapter;

  beforeAll(() => {
    // Save original environment variables
    originalEnv = { ...process.env };
  });

  afterAll(() => {
    // Restore original environment variables
    process.env = originalEnv;
  });

  describe('with USE_REDIS=false', () => {
    beforeEach(() => {
      setEnvVars(false);
      // Create a new instance for each test
      pubSubAdapter = new PubSubAdapter();
      vi.spyOn(console, 'log').mockImplementation(() => {});
      vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(async () => {
      vi.clearAllMocks();
      await pubSubAdapter.disconnect();
    });

    it('should use in-memory implementation', async () => {
      await pubSubAdapter.init();
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Using in-memory pub/sub (Redis disabled)'));
    });

    it('should publish and subscribe to messages', async () => {
      const channel = 'test-channel';
      const message = { text: 'test message' };
      
      await pubSubAdapter.init();
      
      const receivedMessages = [];
      const callback = (msg) => receivedMessages.push(msg);
      
      // Subscribe to the channel
      await pubSubAdapter.subscribe(channel, callback);
      
      // Publish a message
      await pubSubAdapter.publish(channel, message);
      
      // Give some time for the message to be processed
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verify the message was received
      expect(receivedMessages).toHaveLength(1);
      expect(receivedMessages[0]).toEqual(message);
    });
  });

  // Only run Redis tests if explicitly enabled to avoid test failures in environments without Redis
  if (process.env.TEST_REDIS === 'true') {
    describe('with USE_REDIS=true', () => {
      beforeEach(() => {
        setEnvVars(true);
        // Create a new instance for each test
        pubSubAdapter = new PubSubAdapter();
        vi.spyOn(console, 'log').mockImplementation(() => {});
        vi.spyOn(console, 'error').mockImplementation(() => {});
      });

      afterEach(async () => {
        vi.clearAllMocks();
        await pubSubAdapter.disconnect();
      });

      it('should connect to Redis', async () => {
        await pubSubAdapter.init();
        expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Connected to Redis'));
      }, 10000); // Increased timeout for Redis connection

      it('should publish and subscribe to messages using Redis', async () => {
        const channel = 'test-channel';
        const message = { text: 'test message' };
        
        await pubSubAdapter.init();
        
        const receivedMessages = [];
        const callback = (msg) => receivedMessages.push(msg);
        
        // Subscribe to the channel
        await pubSubAdapter.subscribe(channel, callback);
        
        // Publish a message
        await pubSubAdapter.publish(channel, message);
        
        // Give some time for the message to be processed
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Verify the message was received
        expect(receivedMessages).toHaveLength(1);
        expect(receivedMessages[0]).toEqual(message);
      }, 10000); // Increased timeout for Redis operations
    });
  } else {
    describe('with USE_REDIS=true', () => {
      it('skipping Redis tests - set TEST_REDIS=true to enable', () => {
        // This test is skipped by default to avoid test failures in environments without Redis
        // To run Redis tests, set the TEST_REDIS environment variable to 'true'
        expect(true).toBe(true);
      });
    });
  }
});
