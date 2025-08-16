import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { io as Client } from 'socket.io-client';
import inMemoryPubSub from '../test-in-memory-pubsub.js';

describe('WebSocket Server Integration', () => {
  let io, serverSocket, clientSocket, httpServer;
  const PORT = 3002;
  
  beforeAll((done) => {
    httpServer = createServer();
    io = new Server(httpServer);
    
    // Setup WebSocket server
    io.on('connection', (socket) => {
      serverSocket = socket;
      
      // Subscribe to channels
      socket.on('subscribe', (channel) => {
        const unsubscribe = inMemoryPubSub.subscribe(channel, (message) => {
          socket.emit('message', { channel, message });
        });
        
        // Store unsubscribe function for cleanup
        socket.unsubscribeFns = socket.unsubscribeFns || [];
        socket.unsubscribeFns.push(unsubscribe);
      });
      
      // Publish messages
      socket.on('publish', async ({ channel, message }) => {
        await inMemoryPubSub.publish(channel, message);
      });
      
      // Cleanup on disconnect
      socket.on('disconnect', () => {
        if (socket.unsubscribeFns) {
          socket.unsubscribeFns.forEach(fn => fn());
        }
      });
    });
    
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
  
  it('should handle multiple channels', (done) => {
    const channel1 = 'channel-1';
    const channel2 = 'channel-2';
    const message1 = { text: 'Message for channel 1' };
    const message2 = { text: 'Message for channel 2' };
    
    clientSocket = Client(`http://localhost:${PORT}`);
    
    clientSocket.on('connect', () => {
      // Subscribe to both channels
      clientSocket.emit('subscribe', channel1);
      clientSocket.emit('subscribe', channel2);
      
      let receivedMessages = [];
      
      clientSocket.on('message', ({ channel, message }) => {
        receivedMessages.push({ channel, message });
        
        if (receivedMessages.length === 2) {
          // Sort to handle messages arriving in any order
          receivedMessages.sort((a, b) => a.channel.localeCompare(b.channel));
          
          expect(receivedMessages[0]).toEqual({
            channel: channel1,
            message: message1
          });
          
          expect(receivedMessages[1]).toEqual({
            channel: channel2,
            message: message2
          });
          
          done();
        }
      });
      
      // Publish messages to both channels
      clientSocket.emit('publish', { channel: channel1, message: message1 });
      clientSocket.emit('publish', { channel: channel2, message: message2 });
    });
  });
  
  it('should not receive messages after unsubscribing', (done) => {
    const testChannel = 'unsubscribe-test';
    let receivedMessage = false;
    
    clientSocket = Client(`http://localhost:${PORT}`);
    
    clientSocket.on('connect', () => {
      // Subscribe and immediately unsubscribe
      clientSocket.emit('subscribe', testChannel);
      clientSocket.emit('unsubscribe', testChannel);
      
      // Set a timeout to check if we receive any messages
      setTimeout(() => {
        expect(receivedMessage).toBe(false);
        done();
      }, 100);
      
      clientSocket.on('message', () => {
        receivedMessage = true;
      });
      
      // Try to publish a message
      clientSocket.emit('publish', {
        channel: testChannel,
        message: { text: 'Should not be received' }
      });
    });
  });
});
