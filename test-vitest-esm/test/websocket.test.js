import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { io as Client } from 'socket.io-client';

// Simple in-memory pub/sub for testing
class InMemoryPubSub {
  constructor() {
    this.channels = new Map();
    this.subscribers = new Map();
  }

  async publish(channel, message) {
    if (!this.channels.has(channel)) {
      this.channels.set(channel, []);
    }
    
    const messages = this.channels.get(channel);
    messages.push(message);
    if (messages.length > 100) messages.shift();
    
    if (this.subscribers.has(channel)) {
      const subscribers = this.subscribers.get(channel);
      for (const callback of subscribers) {
        try {
          callback(message);
        } catch (error) {
          console.error('Error in subscriber callback:', error);
        }
      }
    }
    
    return true;
  }
  
  async subscribe(channel, callback) {
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
          console.error('Error in initial callback:', error);
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
  
  async getHistory(channel) {
    return this.channels.get(channel) || [];
  }
}

describe('WebSocket Server', () => {
  let io, httpServer, clientSocket, pubsub;
  const PORT = 3003;
  
  beforeAll((done) => {
    // Create pub/sub instance
    pubsub = new InMemoryPubSub();
    
    // Create HTTP server
    httpServer = createServer();
    
    // Create Socket.IO server
    io = new Server(httpServer);
    
    // Setup WebSocket server
    io.on('connection', (socket) => {
      // Subscribe to channels
      socket.on('subscribe', (channel) => {
        const unsubscribe = pubsub.subscribe(channel, (message) => {
          socket.emit('message', { channel, message });
        });
        
        // Store unsubscribe function for cleanup
        socket.unsubscribeFns = socket.unsubscribeFns || [];
        socket.unsubscribeFns.push(unsubscribe);
      });
      
      // Publish messages
      socket.on('publish', async ({ channel, message }) => {
        await pubsub.publish(channel, message);
      });
      
      // Cleanup on disconnect
      socket.on('disconnect', () => {
        if (socket.unsubscribeFns) {
          socket.unsubscribeFns.forEach(fn => fn());
        }
      });
    });
    
    // Start server
    httpServer.listen(PORT, () => {
      done();
    });
  });
  
  afterEach(() => {
    if (clientSocket?.connected) {
      clientSocket.disconnect();
    }
  });
  
  afterAll((done) => {
    io.close(() => {
      httpServer.close(done);
    });
  });
  
  it('should connect and subscribe to a channel', (done) => {
    clientSocket = Client(`http://localhost:${PORT}`);
    const testChannel = 'test-channel';
    const testMessage = { text: 'Hello, WebSocket!' };
    
    clientSocket.on('connect', () => {
      // Subscribe to a channel
      clientSocket.emit('subscribe', testChannel);
      
      // Listen for messages on the channel
      clientSocket.on('message', ({ channel, message }) => {
        expect(channel).toBe(testChannel);
        expect(message).toEqual(testMessage);
        done();
      });
      
      // Publish a message to the channel
      clientSocket.emit('publish', {
        channel: testChannel,
        message: testMessage
      });
    });
  });
  
  it('should handle multiple clients in the same channel', (done) => {
    const testChannel = 'multi-client-channel';
    const testMessage = { text: 'Multi-client test' };
    let messageCount = 0;
    
    // Create first client
    const client1 = Client(`http://localhost:${PORT}`);
    
    client1.on('connect', () => {
      client1.emit('subscribe', testChannel);
      
      // Create second client after first is connected
      const client2 = Client(`http://localhost:${PORT}`);
      
      client2.on('connect', () => {
        client2.emit('subscribe', testChannel);
        
        // Listen for messages on both clients
        const checkDone = () => {
          messageCount++;
          if (messageCount === 2) {
            client1.disconnect();
            client2.disconnect();
            done();
          }
        };
        
        client1.on('message', ({ channel, message }) => {
          expect(channel).toBe(testChannel);
          expect(message).toEqual(testMessage);
          checkDone();
        });
        
        client2.on('message', ({ channel, message }) => {
          expect(channel).toBe(testChannel);
          expect(message).toEqual(testMessage);
          checkDone();
        });
        
        // Publish a message from client1
        client1.emit('publish', {
          channel: testChannel,
          message: testMessage
        });
      });
    });
  });
});
