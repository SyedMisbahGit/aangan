// Simplified in-memory pub/sub system for testing
class InMemoryPubSub {
  constructor() {
    this.channels = new Map();
    this.subscribers = new Map();
  }

  // Publish a message to a channel
  async publish(channel, message) {
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
  }
  
  // Subscribe to a channel
  async subscribe(channel, callback) {
    console.log(`[InMemoryPubSub] New subscriber to ${channel}`);
    
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, new Set());
    }
    
    this.subscribers.get(channel).add(callback);
    
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
      if (this.subscribers.has(channel)) {
        const subscribers = this.subscribers.get(channel);
        subscribers.delete(callback);
        if (subscribers.size === 0) {
          this.subscribers.delete(channel);
        }
      }
    };
  }
  
  // Get message history for a channel
  async getHistory(channel) {
    return this.channels.get(channel) || [];
  }
}

// Create a singleton instance
const inMemoryPubSub = new InMemoryPubSub();

export default inMemoryPubSub;
