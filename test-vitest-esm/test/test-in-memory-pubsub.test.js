import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Import the local in-memory pub/sub implementation
import InMemoryPubSub from '../src/in-memory-pubsub.js';

describe('InMemoryPubSub', () => {
  let pubsub;
  
  beforeEach(() => {
    // Create a new instance for each test
    pubsub = new InMemoryPubSub();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('publish', () => {
    it('should publish messages to a channel', async () => {
      const channel = 'test-channel';
      const message = { text: 'test message' };
      
      const result = await pubsub.publish(channel, message);
      
      expect(result).toBe(true);
      expect(console.log).toHaveBeenCalledWith(
        `[InMemoryPubSub] Publishing to ${channel}:`,
        message
      );
    });

    it('should handle errors during publish', async () => {
      const message = { text: 'test message' };
      
      // Spy on console.error to verify it's called
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Test with invalid channel (null)
      let result = await pubsub.publish(null, message);
      expect(result).toBe(false);
      expect(errorSpy).toHaveBeenCalled();
      
      // Reset the spy
      errorSpy.mockClear();
      
      // Test with invalid channel (empty string)
      result = await pubsub.publish('', message);
      expect(result).toBe(false);
      expect(errorSpy).toHaveBeenCalled();
      
      // Clean up
      errorSpy.mockRestore();
    });
  });

  describe('subscribe', () => {
    it('should subscribe to a channel and receive messages', async () => {
      const channel = 'test-channel';
      const message = { text: 'test message' };
      const callback = vi.fn();
      
      // Subscribe to the channel
      const unsubscribe = await pubsub.subscribe(channel, callback);
      
      // Publish a message
      await pubsub.publish(channel, message);
      
      // The callback should have been called with the message
      expect(callback).toHaveBeenCalledWith(message);
      
      // Unsubscribe
      unsubscribe();
      
      // Publish another message
      await pubsub.publish(channel, { text: 'another message' });
      
      // The callback should not have been called again
      expect(callback).toHaveBeenCalledTimes(1);
    });
    
    it('should handle errors during subscription', async () => {
      const channel = 'test-channel';
      const callback = vi.fn();
      
      // Spy on console.error to verify it's called
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Test with invalid channel (null)
      await expect(pubsub.subscribe(null, callback)).rejects.toThrow();
      
      // Test with invalid callback (not a function)
      await expect(pubsub.subscribe(channel, null)).rejects.toThrow();
      
      // Verify error was logged
      expect(errorSpy).toHaveBeenCalledTimes(2);
      
      // Clean up
      errorSpy.mockRestore();
    });
  });

  describe('getHistory', () => {
    it('should return message history for a channel', async () => {
      const channel = 'test-channel';
      const message1 = { text: 'message 1' };
      const message2 = { text: 'message 2' };
      
      // Publish some messages
      await pubsub.publish(channel, message1);
      await pubsub.publish(channel, message2);
      
      // Get the history
      const history = await pubsub.getHistory(channel);
      
      // The history should contain the published messages
      expect(history).toHaveLength(2);
      expect(history).toContainEqual(message1);
      expect(history).toContainEqual(message2);
    });
    
    it('should return an empty array for a non-existent channel', async () => {
      const history = await pubsub.getHistory('non-existent-channel');
      expect(history).toEqual([]);
    });
  });

  describe('multiple subscribers', () => {
    it('should deliver messages to all subscribers', async () => {
      const channel = 'test-channel';
      const message = { text: 'test message' };
      
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      // Subscribe two callbacks to the same channel
      const unsubscribe1 = await pubsub.subscribe(channel, callback1);
      const unsubscribe2 = await pubsub.subscribe(channel, callback2);
      
      // Publish a message
      await pubsub.publish(channel, message);
      
      // Both callbacks should have been called with the message
      expect(callback1).toHaveBeenCalledWith(message);
      expect(callback2).toHaveBeenCalledWith(message);
      
      // Clean up
      unsubscribe1();
      unsubscribe2();
    });
  });
});
