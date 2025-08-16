import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import inMemoryPubSub from '../test-in-memory-pubsub.js';

describe('InMemoryPubSub', () => {
  let pubsub;
  
  beforeEach(() => {
    // Create a new instance for each test
    pubsub = new inMemoryPubSub.constructor();
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
    
    it('should store message history (max 100 messages)', async () => {
      const channel = 'test-channel';
      
      // Publish 101 messages
      for (let i = 0; i < 101; i++) {
        await pubsub.publish(channel, { count: i });
      }
      
      const history = await pubsub.getHistory(channel);
      expect(history).toHaveLength(100);
      expect(history[0].count).toBe(1); // First message should be the second one published
      expect(history[99].count).toBe(100); // Last message should be the 101st published
    });
  });

  describe('subscribe', () => {
    it('should call callback with existing messages when subscribing', async () => {
      const channel = 'test-channel';
      const message = { text: 'existing message' };
      await pubsub.publish(channel, message);
      
      const callback = jest.fn();
      const unsubscribe = await pubsub.subscribe(channel, callback);
      
      expect(callback).toHaveBeenCalledWith(message);
      
      // Cleanup
      unsubscribe();
    });
    
    it('should call callback with new messages after subscribing', async () => {
      const channel = 'test-channel';
      const callback = jest.fn();
      
      const unsubscribe = await pubsub.subscribe(channel, callback);
      
      const message = { text: 'new message' };
      await pubsub.publish(channel, message);
      
      expect(callback).toHaveBeenCalledWith(message);
      
      // Cleanup
      unsubscribe();
    });
    
    it('should handle multiple subscribers to the same channel', async () => {
      const channel = 'test-channel';
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      
      const unsubscribe1 = await pubsub.subscribe(channel, callback1);
      const unsubscribe2 = await pubsub.subscribe(channel, callback2);
      
      const message = { text: 'message for all' };
      await pubsub.publish(channel, message);
      
      expect(callback1).toHaveBeenCalledWith(message);
      expect(callback2).toHaveBeenCalledWith(message);
      
      // Cleanup
      unsubscribe1();
      unsubscribe2();
    });
    
    it('should not call unsubscribed callbacks', async () => {
      const channel = 'test-channel';
      const callback = jest.fn();
      
      const unsubscribe = await pubsub.subscribe(channel, callback);
      unsubscribe();
      
      await pubsub.publish(channel, { text: 'should not be received' });
      
      expect(callback).not.toHaveBeenCalled();
    });
  });
  
  describe('error handling', () => {
    it('should handle errors in subscriber callbacks', async () => {
      const channel = 'test-channel';
      const error = new Error('Test error');
      const badCallback = jest.fn().mockImplementation(() => {
        throw error;
      });
      
      const unsubscribe = await pubsub.subscribe(channel, badCallback);
      
      await pubsub.publish(channel, { text: 'test' });
      
      expect(console.error).toHaveBeenCalledWith(
        '[InMemoryPubSub] Error in subscriber callback:',
        error
      );
      
      // Cleanup
      unsubscribe();
    });
  });
});
