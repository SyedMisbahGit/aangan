// In-memory pub/sub system for testing
class InMemoryPubSub {
  constructor() {
    this.channels = new Map();
    this.subscribers = new Map();
  }

  // Publish a message to a channel
  async publish(channel, message) {
    // Validate channel
    if (!channel) {
      console.error('[InMemoryPubSub] Error: Channel cannot be null or undefined');
      return false;
    }
    
    // Validate message
    if (message === undefined || message === null) {
      console.error('[InMemoryPubSub] Error: Message cannot be null or undefined');
      return false;
    }
    
    try {
      console.log(`[InMemoryPubSub] Publishing to ${channel}:`, message);
      
      if (!this.channels.has(channel)) {
        this.channels.set(channel, []);
      }
      
      // Store message in channel history (limit to last 100 messages)
      const messages = this.channels.get(channel);
      messages.push(message);
      if (messages.length > 100) {
        messages.shift();
      }
      
      // Notify subscribers
      if (this.subscribers.has(channel)) {
        const subscribers = this.subscribers.get(channel);
        for (const callback of subscribers) {
          try {
            callback(message);
          } catch (error) {
            console.error(`[InMemoryPubSub] Error in subscriber callback:`, error);
          }
        }
      }
      
      return true;
    } catch (error) {
      console.error('[InMemoryPubSub] Error during publish:', error);
      return false;
    }
  }
  
  // Subscribe to a channel
  async subscribe(channel, callback) {
    // Validate channel
    if (!channel) {
      const errorMsg = '[InMemoryPubSub] Error: Channel cannot be null or undefined';
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
    
    // Validate callback
    if (typeof callback !== 'function') {
      const errorMsg = '[InMemoryPubSub] Error: Callback must be a function';
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
    
    try {
      console.log(`[InMemoryPubSub] New subscriber to ${channel}`);
      
      if (!this.subscribers.has(channel)) {
        this.subscribers.set(channel, new Set());
      }
      
      const subscribers = this.subscribers.get(channel);
      subscribers.add(callback);
      
      // Send existing messages if any
      if (this.channels.has(channel)) {
        const messages = this.channels.get(channel);
        for (const message of messages) {
          try {
            callback(message);
          } catch (error) {
            console.error(`[InMemoryPubSub] Error in initial callback:`, error);
          }
        }
      }
      
      // Return unsubscribe function
      return () => {
        try {
          if (this.subscribers.has(channel)) {
            const currentSubscribers = this.subscribers.get(channel);
            currentSubscribers.delete(callback);
            if (currentSubscribers.size === 0) {
              this.subscribers.delete(channel);
            }
          }
        } catch (error) {
          console.error('[InMemoryPubSub] Error during unsubscribe:', error);
        }
      };
    } catch (error) {
      console.error('[InMemoryPubSub] Error during subscribe:', error);
      // Return a no-op function for consistency
      return () => {};
    }
  }
  
  // Get message history for a channel
  async getHistory(channel) {
    return this.channels.get(channel) || [];
  }
}

export default InMemoryPubSub;
