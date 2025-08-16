// Manual WebSocket test script
import { Server } from 'socket.io';
import { createServer } from 'http';
import { io as Client } from 'socket.io-client';
import inMemoryPubSub from '../backend/test-in-memory-pubsub.js';

// Configuration
const PORT = 3003;
const TEST_CHANNEL = 'manual-test-channel';
const TEST_MESSAGE = { text: 'Manual test message', timestamp: new Date().toISOString() };

// Create HTTP server and Socket.IO instance
const httpServer = createServer();
const io = new Server(httpServer);

// Track test results
const testResults = {
  serverStarted: false,
  clientConnected: false,
  messageReceived: false,
  errors: []
};

// Setup WebSocket server
io.on('connection', (socket) => {
  console.log('\n[Server] Client connected:', socket.id);
  testResults.clientConnected = true;
  
  // Handle subscription
  socket.on('subscribe', (channel) => {
    console.log(`[Server] Client subscribed to ${channel}`);
    const unsubscribe = inMemoryPubSub.subscribe(channel, (message) => {
      console.log(`[Server] Sending message to client on ${channel}:`, message);
      socket.emit('message', { channel, message });
    });
    
    // Store unsubscribe function for cleanup
    socket.unsubscribeFns = socket.unsubscribeFns || [];
    socket.unsubscribeFns.push(unsubscribe);
  });
  
  // Handle publish
  socket.on('publish', async ({ channel, message }) => {
    console.log(`[Server] Received publish to ${channel}:`, message);
    await inMemoryPubSub.publish(channel, message);
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('[Server] Client disconnected:', socket.id);
    if (socket.unsubscribeFns) {
      socket.unsubscribeFns.forEach(fn => fn());
    }
  });
});

// Start the server
httpServer.listen(PORT, '0.0.0.0', () => {
  testResults.serverStarted = true;
  console.log(`\n[Server] WebSocket server running on port ${PORT}`);
  
  // Run the test
  runTest();
});

// Test function
async function runTest() {
  console.log('\n[Test] Starting WebSocket test...');
  
  // Create a client
  const client = Client(`http://localhost:${PORT}`);
  
  // Test connection
  await new Promise((resolve) => {
    client.on('connect', () => {
      console.log('[Client] Connected to server');
      
      // Subscribe to test channel
      client.emit('subscribe', TEST_CHANNEL);
      console.log(`[Client] Subscribed to ${TEST_CHANNEL}`);
      
      // Listen for messages
      client.on('message', ({ channel, message }) => {
        console.log(`[Client] Received message on ${channel}:`, message);
        testResults.messageReceived = true;
        
        // Verify the message
        if (channel !== TEST_CHANNEL) {
          testResults.errors.push(`Expected channel ${TEST_CHANNEL}, got ${channel}`);
        }
        
        if (message.text !== TEST_MESSAGE.text) {
          testResults.errors.push(`Message content mismatch: ${JSON.stringify(message)}`);
        }
        
        // Cleanup and exit
        client.disconnect();
        httpServer.close(() => {
          printTestResults();
          process.exit(testResults.errors.length > 0 ? 1 : 0);
        });
      });
      
      // Publish a test message after a short delay
      setTimeout(() => {
        console.log(`[Client] Publishing to ${TEST_CHANNEL}:`, TEST_MESSAGE);
        client.emit('publish', {
          channel: TEST_CHANNEL,
          message: TEST_MESSAGE
        });
      }, 100);
      
      resolve();
    });
    
    // Handle connection errors
    client.on('connect_error', (error) => {
      console.error('[Client] Connection error:', error);
      testResults.errors.push(`Connection error: ${error.message}`);
      process.exit(1);
    });
  });
}

// Print test results
function printTestResults() {
  console.log('\n=== Test Results ===');
  console.log(`✅ Server started: ${testResults.serverStarted ? 'Yes' : 'No'}`);
  console.log(`✅ Client connected: ${testResults.clientConnected ? 'Yes' : 'No'}`);
  console.log(`✅ Message received: ${testResults.messageReceived ? 'Yes' : 'No'}`);
  
  if (testResults.errors.length > 0) {
    console.log('\n❌ Errors:');
    testResults.errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error}`);
    });
    console.log('\n❌ Test failed!');
  } else {
    console.log('\n✅ All tests passed!');
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n[Server] Shutting down...');
  httpServer.close(() => {
    process.exit(0);
  });
});
