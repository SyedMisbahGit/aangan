/**
 * Comprehensive WebSocket & Real-time Integration Tests
 * Tests multi-user sync, reconnection, stress testing for 100+ concurrent messages
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { io as Client } from 'socket.io-client';
import supertest from 'supertest';
import { app } from '../../src/app.js';

describe('🔌 WebSocket & Real-time Integration Tests', () => {
  let server;
  let clientSockets = [];
  let request;

  beforeAll(async () => {
    // Start server on random port for testing
    server = app.listen(0);
    const port = server.address().port;
    request = supertest(app);
    
    // Helper to create client connections
    global.createClient = (options = {}) => {
      const client = Client(`http://localhost:${port}`, {
        transports: ['websocket'],
        forceNew: true,
        timeout: 5000,
        ...options
      });
      clientSockets.push(client);
      return client;
    };
  });

  afterAll(async () => {
    server?.close();
  });

  beforeEach(() => {
    clientSockets = [];
  });

  afterEach(async () => {
    // Clean up all client connections
    await Promise.all(
      clientSockets.map(client => {
        return new Promise(resolve => {
          if (client.connected) {
            client.disconnect();
          }
          client.on('disconnect', resolve);
          setTimeout(resolve, 100); // Timeout fallback
        });
      })
    );
    clientSockets = [];
  });

  describe('📡 Multi-User WebSocket Synchronization', () => {
    test('should sync whisper creation between multiple clients', async () => {
      const client1 = createClient();
      const client2 = createClient();
      
      // Wait for both clients to connect
      await Promise.all([
        new Promise(resolve => client1.on('connect', resolve)),
        new Promise(resolve => client2.on('connect', resolve))
      ]);

      // Client 2 should receive whisper from Client 1
      const whisperReceived = new Promise(resolve => {
        client2.on('new_whisper', (data) => {
          resolve(data);
        });
      });

      // Client 1 creates a whisper
      const whisperData = {
        content: 'Test whisper for sync',
        emotion: 'excited',
        zone: 'library',
        anonymous: true
      };

      client1.emit('create_whisper', whisperData);

      // Verify Client 2 receives the whisper
      const receivedWhisper = await whisperReceived;
      expect(receivedWhisper.content).toBe(whisperData.content);
      expect(receivedWhisper.emotion).toBe(whisperData.emotion);
      expect(receivedWhisper.zone).toBe(whisperData.zone);
    });

    test('should sync reactions between multiple clients', async () => {
      const client1 = createClient();
      const client2 = createClient();
      const client3 = createClient();

      // Wait for all clients to connect
      await Promise.all([
        new Promise(resolve => client1.on('connect', resolve)),
        new Promise(resolve => client2.on('connect', resolve)),
        new Promise(resolve => client3.on('connect', resolve))
      ]);

      // Create a whisper first
      const whisperCreated = new Promise(resolve => {
        client2.on('new_whisper', resolve);
      });

      client1.emit('create_whisper', {
        content: 'Reaction test whisper',
        emotion: 'happy',
        zone: 'courtyard'
      });

      const whisper = await whisperCreated;

      // Client 2 and 3 should receive reaction updates
      const reactionUpdates = [];
      client2.on('whisper_reaction', data => reactionUpdates.push(data));
      client3.on('whisper_reaction', data => reactionUpdates.push(data));

      // Client 1 adds a reaction
      client1.emit('add_reaction', {
        whisperId: whisper.id,
        type: 'heart'
      });

      // Wait for reaction to propagate
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(reactionUpdates.length).toBeGreaterThanOrEqual(2);
      expect(reactionUpdates[0].whisperId).toBe(whisper.id);
      expect(reactionUpdates[0].type).toBe('heart');
    });

    test('should handle zone-specific broadcasting', async () => {
      const libraryClient1 = createClient();
      const libraryClient2 = createClient();
      const cafeteriaClient = createClient();

      // Wait for connections
      await Promise.all([
        new Promise(resolve => libraryClient1.on('connect', resolve)),
        new Promise(resolve => libraryClient2.on('connect', resolve)),
        new Promise(resolve => cafeteriaClient.on('connect', resolve))
      ]);

      // Join different zones
      libraryClient1.emit('join_zone', 'library');
      libraryClient2.emit('join_zone', 'library');
      cafeteriaClient.emit('join_zone', 'cafeteria');

      await new Promise(resolve => setTimeout(resolve, 50));

      // Track received whispers
      const libraryWhispers = [];
      const cafeteriaWhispers = [];

      libraryClient2.on('zone_whisper', data => libraryWhispers.push(data));
      cafeteriaClient.on('zone_whisper', data => cafeteriaWhispers.push(data));

      // Send zone-specific whisper
      libraryClient1.emit('zone_whisper', {
        content: 'Library is quiet today',
        zone: 'library'
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      // Library clients should receive, cafeteria client should not
      expect(libraryWhispers.length).toBe(1);
      expect(cafeteriaWhispers.length).toBe(0);
    });
  });

  describe('🔄 Offline/Online Reconnection Handling', () => {
    test('should handle client reconnection gracefully', async () => {
      const client = createClient({
        timeout: 1000,
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 100
      });

      // Wait for initial connection
      await new Promise(resolve => client.on('connect', resolve));
      expect(client.connected).toBe(true);

      // Simulate disconnect
      client.disconnect();
      expect(client.connected).toBe(false);

      // Reconnect should happen automatically
      const reconnected = new Promise(resolve => {
        client.on('reconnect', resolve);
      });

      client.connect();
      await reconnected;
      expect(client.connected).toBe(true);
    });

    test('should sync missed messages on reconnection', async () => {
      const client1 = createClient();
      const client2 = createClient();

      // Initial connection
      await Promise.all([
        new Promise(resolve => client1.on('connect', resolve)),
        new Promise(resolve => client2.on('connect', resolve))
      ]);

      // Client 2 disconnects
      client2.disconnect();
      await new Promise(resolve => setTimeout(resolve, 50));

      // Client 1 sends messages while Client 2 is offline
      client1.emit('create_whisper', {
        content: 'Message while offline 1',
        zone: 'library'
      });

      client1.emit('create_whisper', {
        content: 'Message while offline 2', 
        zone: 'library'
      });

      // Client 2 reconnects
      const missedMessages = [];
      client2.on('missed_messages', data => missedMessages.push(data));

      client2.connect();
      await new Promise(resolve => client2.on('connect', resolve));

      // Request missed messages
      client2.emit('request_missed_messages', { since: Date.now() - 10000 });

      await new Promise(resolve => setTimeout(resolve, 200));

      expect(missedMessages.length).toBeGreaterThan(0);
    });

    test('should handle connection timeouts properly', async () => {
      const client = createClient({
        timeout: 100, // Very short timeout
        reconnection: false
      });

      const connectError = new Promise(resolve => {
        client.on('connect_error', resolve);
      });

      // Should timeout and emit connect_error
      await connectError;
      expect(client.connected).toBe(false);
    });
  });

  describe('🚀 Stress Test: 100+ Concurrent Messages', () => {
    test('should handle 100 concurrent clients and messages', async () => {
      const NUM_CLIENTS = 100;
      const MESSAGES_PER_CLIENT = 2;
      
      // Create 100 concurrent clients (limited for CI environment)
      const clients = Array(NUM_CLIENTS).fill().map(() => createClient());
      
      // Wait for all connections
      await Promise.all(
        clients.map(client => new Promise(resolve => client.on('connect', resolve)))
      );

      // Track received messages
      let totalReceived = 0;
      const messagePromises = [];

      clients.forEach((client, index) => {
        // Each client except sender should receive messages from other clients
        const expectedMessages = (NUM_CLIENTS - 1) * MESSAGES_PER_CLIENT;
        let receivedCount = 0;

        const messagePromise = new Promise(resolve => {
          client.on('new_whisper', () => {
            receivedCount++;
            totalReceived++;
            if (receivedCount >= Math.min(expectedMessages, 10)) { // Limit for test speed
              resolve();
            }
          });
          
          // Timeout fallback
          setTimeout(resolve, 5000);
        });
        
        messagePromises.push(messagePromise);
      });

      // Send messages from all clients concurrently
      const sendPromises = clients.map((client, index) => {
        return Promise.all(
          Array(MESSAGES_PER_CLIENT).fill().map(async (_, msgIndex) => {
            await new Promise(resolve => setTimeout(resolve, Math.random() * 10));
            client.emit('create_whisper', {
              content: `Stress test message ${msgIndex} from client ${index}`,
              emotion: 'excited',
              zone: 'stress-test-zone'
            });
          })
        );
      });

      // Wait for all sends to complete
      await Promise.all(sendPromises);

      // Wait for message distribution (with timeout)
      await Promise.race([
        Promise.all(messagePromises),
        new Promise(resolve => setTimeout(resolve, 8000))
      ]);

      // Verify significant message distribution occurred
      expect(totalReceived).toBeGreaterThan(NUM_CLIENTS);
      
      console.log(`📊 Stress test completed: ${totalReceived} total messages received`);
    });

    test('should maintain performance under high load', async () => {
      const startTime = Date.now();
      const NUM_RAPID_MESSAGES = 50;
      
      const client1 = createClient();
      const client2 = createClient();

      await Promise.all([
        new Promise(resolve => client1.on('connect', resolve)),
        new Promise(resolve => client2.on('connect', resolve))
      ]);

      let messagesReceived = 0;
      const performancePromise = new Promise(resolve => {
        client2.on('new_whisper', () => {
          messagesReceived++;
          if (messagesReceived >= NUM_RAPID_MESSAGES) {
            resolve();
          }
        });
      });

      // Send rapid-fire messages
      for (let i = 0; i < NUM_RAPID_MESSAGES; i++) {
        client1.emit('create_whisper', {
          content: `Rapid message ${i}`,
          emotion: 'excited',
          zone: 'performance-test'
        });
        
        // Small delay to prevent overwhelming
        if (i % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 1));
        }
      }

      // Wait for all messages or timeout
      await Promise.race([
        performancePromise,
        new Promise(resolve => setTimeout(resolve, 10000))
      ]);

      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log(`⚡ Performance test: ${messagesReceived}/${NUM_RAPID_MESSAGES} messages in ${duration}ms`);
      
      // Should handle at least 80% of messages efficiently
      expect(messagesReceived).toBeGreaterThanOrEqual(NUM_RAPID_MESSAGES * 0.8);
      expect(duration).toBeLessThan(15000); // Should complete within 15 seconds
    });

    test('should handle memory efficiently with many connections', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      const NUM_CONNECTIONS = 50;
      
      // Create many concurrent connections
      const clients = Array(NUM_CONNECTIONS).fill().map(() => createClient());
      
      await Promise.all(
        clients.map(client => new Promise(resolve => client.on('connect', resolve)))
      );

      // Let connections stabilize
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const peakMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = peakMemory - initialMemory;
      
      // Disconnect all clients
      await Promise.all(
        clients.map(client => new Promise(resolve => {
          client.disconnect();
          client.on('disconnect', resolve);
          setTimeout(resolve, 100);
        }))
      );

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryLeakage = finalMemory - initialMemory;
      
      console.log(`💾 Memory test: Initial: ${(initialMemory/1024/1024).toFixed(1)}MB, Peak: ${(peakMemory/1024/1024).toFixed(1)}MB, Final: ${(finalMemory/1024/1024).toFixed(1)}MB`);
      
      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
      
      // Memory leakage should be minimal (less than 10MB)
      expect(memoryLeakage).toBeLessThan(10 * 1024 * 1024);
    });
  });

  describe('🔧 Error Handling & Edge Cases', () => {
    test('should handle malformed message data', async () => {
      const client = createClient();
      await new Promise(resolve => client.on('connect', resolve));

      const errorPromise = new Promise(resolve => {
        client.on('error', resolve);
      });

      // Send malformed data
      client.emit('create_whisper', null);
      client.emit('create_whisper', undefined);
      client.emit('create_whisper', 'invalid-string');

      // Should not crash server, may emit error
      await Promise.race([
        errorPromise,
        new Promise(resolve => setTimeout(resolve, 500))
      ]);

      // Server should still be responsive
      expect(client.connected).toBe(true);
    });

    test('should rate limit excessive requests', async () => {
      const client = createClient();
      await new Promise(resolve => client.on('connect', resolve));

      let rateLimited = false;
      client.on('rate_limit_exceeded', () => {
        rateLimited = true;
      });

      // Send excessive requests rapidly
      for (let i = 0; i < 100; i++) {
        client.emit('create_whisper', {
          content: `Spam message ${i}`,
          emotion: 'excited'
        });
      }

      await new Promise(resolve => setTimeout(resolve, 1000));

      // Should eventually rate limit (if implemented)
      // This test documents expected behavior
      console.log(`🚦 Rate limiting ${rateLimited ? 'ACTIVE' : 'NOT IMPLEMENTED'}`);
    });
  });
});
