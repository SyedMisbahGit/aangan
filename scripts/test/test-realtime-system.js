const io = require('socket.io-client');
const axios = require('axios');

const API_BASE = process.env.API_BASE || 'https://aangan-production.up.railway.app';
const TEST_DURATION = 10 * 60 * 1000; // 10 minutes
const MAX_CONCURRENT_USERS = 5;

class RealtimeSystemTester {
  constructor() {
    this.clients = [];
    this.testResults = {
      socketStability: { passed: 0, failed: 0, details: [] },
      whisperFeed: { passed: 0, failed: 0, details: [] },
      aiBot: { passed: 0, failed: 0, details: [] },
      zoneActivity: { passed: 0, failed: 0, details: [] },
      performance: { passed: 0, failed: 0, details: [] },
      backend: { passed: 0, failed: 0, details: [] }
    };
    this.whispers = [];
    this.zoneActivity = new Map();
  }

  async runFullTest() {
    console.log('🚀 Starting Aangan Real-Time System Stability Test');
    console.log(`⏱️  Test Duration: ${TEST_DURATION / 1000 / 60} minutes`);
    console.log(`👥 Max Concurrent Users: ${MAX_CONCURRENT_USERS}`);
    console.log('=' * 60);

    try {
      // 1. Test Socket.IO Stability
      await this.testSocketIOStability();
      
      // 2. Test Real-Time Whisper Feed
      await this.testWhisperFeed();
      
      // 3. Test AI Listener Bot
      await this.testAIListenerBot();
      
      // 4. Test Zone Activity System
      await this.testZoneActivity();
      
      // 5. Test Frontend Performance
      await this.testFrontendPerformance();
      
      // 6. Test Backend Load
      await this.testBackendLoad();
      
      // 7. Run extended stability test
      await this.runExtendedStabilityTest();
      
      // 8. Generate test report
      this.generateTestReport();
      
    } catch (error) {
      console.error('❌ Test failed:', error);
    } finally {
      this.cleanup();
    }
  }

  async testSocketIOStability() {
    console.log('\n🧩 Testing Socket.IO Stability...');
    
    // Test multiple concurrent connections
    const connectionPromises = [];
    for (let i = 0; i < MAX_CONCURRENT_USERS; i++) {
      connectionPromises.push(this.createTestClient(`user-${i}`));
    }
    
    await Promise.all(connectionPromises);
    
    // Test connection stability over time
    const stabilityTest = setInterval(() => {
      const connectedClients = this.clients.filter(client => client.connected);
      if (connectedClients.length !== MAX_CONCURRENT_USERS) {
        this.testResults.socketStability.failed++;
        this.testResults.socketStability.details.push({
          test: 'Connection Stability',
          error: `Expected ${MAX_CONCURRENT_USERS} connections, got ${connectedClients.length}`
        });
      } else {
        this.testResults.socketStability.passed++;
      }
    }, 30000); // Check every 30 seconds
    
    // Test auto-reconnection
    await this.testAutoReconnection();
    
    // Test message delivery
    await this.testMessageDelivery();
    
    clearInterval(stabilityTest);
  }

  async testWhisperFeed() {
    console.log('\n🪶 Testing Real-Time Whisper Feed...');
    
    // Test immediate whisper appearance
    const testWhisper = {
      content: `Test whisper at ${new Date().toISOString()}`,
      emotion: 'joy',
      zone: 'tapri'
    };
    
    const startTime = Date.now();
    
    // Create whisper via API
    const response = await axios.post(`${API_BASE}/api/whispers`, testWhisper);
    const whisperId = response.data.id;
    
    // Check if all clients received the whisper within 2 seconds
    const receivedByAll = await this.waitForWhisperDelivery(whisperId, 2000);
    
    if (receivedByAll) {
      this.testResults.whisperFeed.passed++;
      console.log('✅ Whisper appeared immediately for all users');
    } else {
      this.testResults.whisperFeed.failed++;
      this.testResults.whisperFeed.details.push({
        test: 'Immediate Whisper Delivery',
        error: 'Whisper not received by all clients within 2 seconds'
      });
    }
    
    // Test whisper enhancement
    await this.testWhisperEnhancement();
  }

  async testAIListenerBot() {
    console.log('\n🧠 Testing AI Listener Bot...');
    
    // Test response probability (should be ~30%)
    const testWhispers = [];
    for (let i = 0; i < 20; i++) {
      testWhispers.push({
        content: `AI test whisper ${i}`,
        emotion: 'anxiety',
        zone: 'library'
      });
    }
    
    let aiResponses = 0;
    const responsePromises = testWhispers.map(async (whisper) => {
      const response = await axios.post(`${API_BASE}/api/whispers`, whisper);
      
      // Wait for potential AI response
      const hasAIResponse = await this.waitForAIResponse(response.data.id, 10000);
      if (hasAIResponse) aiResponses++;
    });
    
    await Promise.all(responsePromises);
    
    const responseRate = (aiResponses / testWhispers.length) * 100;
    const expectedRate = 30;
    const tolerance = 10; // ±10%
    
    if (Math.abs(responseRate - expectedRate) <= tolerance) {
      this.testResults.aiBot.passed++;
      console.log(`✅ AI response rate: ${responseRate.toFixed(1)}% (expected ~${expectedRate}%)`);
    } else {
      this.testResults.aiBot.failed++;
      this.testResults.aiBot.details.push({
        test: 'AI Response Probability',
        error: `Response rate ${responseRate.toFixed(1)}% outside expected range ${expectedRate}±${tolerance}%`
      });
    }
    
    // Test cooldown enforcement
    await this.testAICooldown();
  }

  async testZoneActivity() {
    console.log('\n📍 Testing Zone Activity System...');
    
    // Test zone joining
    const zones = ['tapri', 'library', 'hostel', 'canteen'];
    const joinPromises = zones.map(zone => 
      this.clients[0].emit('join-zone', zone)
    );
    
    await Promise.all(joinPromises);
    
    // Wait for zone activity updates
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if zone activity is tracked
    const zoneActivityResponse = await axios.get(`${API_BASE}/api/realtime/zones`);
    const activeZones = zoneActivityResponse.data.zones;
    
    if (activeZones.length > 0) {
      this.testResults.zoneActivity.passed++;
      console.log(`✅ Zone activity tracked: ${activeZones.length} active zones`);
    } else {
      this.testResults.zoneActivity.failed++;
      this.testResults.zoneActivity.details.push({
        test: 'Zone Activity Tracking',
        error: 'No zone activity detected'
      });
    }
    
    // Test zone filtering
    await this.testZoneFiltering();
  }

  async testFrontendPerformance() {
    console.log('\n📲 Testing Frontend Performance...');
    
    // Simulate mobile-like conditions
    const performanceTests = [
      this.simulateSlowNetwork(),
      this.simulateLowMemory(),
      this.testHapticFeedback(),
      this.testKeyboardAwareness()
    ];
    
    const results = await Promise.allSettled(performanceTests);
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        this.testResults.performance.passed++;
      } else {
        this.testResults.performance.failed++;
        this.testResults.performance.details.push({
          test: `Performance Test ${index + 1}`,
          error: result.reason || 'Performance test failed'
        });
      }
    });
  }

  async testBackendLoad() {
    console.log('\n📦 Testing Backend Load...');
    
    // Test server health
    const healthResponse = await axios.get(`${API_BASE}/api/health`);
    if (healthResponse.data.status === 'ok') {
      this.testResults.backend.passed++;
      console.log('✅ Backend health check passed');
    } else {
      this.testResults.backend.failed++;
      this.testResults.backend.details.push({
        test: 'Backend Health',
        error: 'Health check failed'
      });
    }
    
    // Test database writes
    await this.testDatabaseWrites();
    
    // Test memory usage
    await this.testMemoryUsage();
  }

  async runExtendedStabilityTest() {
    console.log('\n🧪 Running Extended Stability Test...');
    
    const startTime = Date.now();
    const testInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      
      // Create random whispers every 30 seconds
      if (elapsed % 30000 === 0) {
        this.createRandomWhisper();
      }
      
      // Check connection stability
      const connectedClients = this.clients.filter(client => client.connected);
      if (connectedClients.length !== MAX_CONCURRENT_USERS) {
        console.warn(`⚠️  Connection lost: ${connectedClients.length}/${MAX_CONCURRENT_USERS} clients connected`);
      }
      
      // Stop after test duration
      if (elapsed >= TEST_DURATION) {
        clearInterval(testInterval);
        console.log('✅ Extended stability test completed');
      }
    }, 1000);
  }

  // Helper methods
  async createTestClient(userId) {
    return new Promise((resolve) => {
      const client = io(API_BASE, {
        transports: ['websocket'],
        timeout: 20000,
        reconnection: true
      });
      
      client.on('connect', () => {
        console.log(`✅ Client ${userId} connected`);
        this.clients.push(client);
        resolve(client);
      });
      
      client.on('disconnect', () => {
        console.log(`❌ Client ${userId} disconnected`);
      });
      
      client.on('connect_error', (error) => {
        console.error(`❌ Client ${userId} connection error:`, error);
      });
    });
  }

  async waitForWhisperDelivery(whisperId, timeout) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const checkInterval = setInterval(() => {
        const receivedByAll = this.clients.every(client => 
          client.receivedWhispers && client.receivedWhispers.includes(whisperId)
        );
        
        if (receivedByAll || Date.now() - startTime > timeout) {
          clearInterval(checkInterval);
          resolve(receivedByAll);
        }
      }, 100);
    });
  }

  async waitForAIResponse(whisperId, timeout) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const checkInterval = setInterval(() => {
        const hasAIResponse = this.clients.some(client => 
          client.aiResponses && client.aiResponses.includes(whisperId)
        );
        
        if (hasAIResponse || Date.now() - startTime > timeout) {
          clearInterval(checkInterval);
          resolve(hasAIResponse);
        }
      }, 100);
    });
  }

  async testAutoReconnection() {
    console.log('Testing auto-reconnection...');
    
    // Simulate network drop
    const testClient = this.clients[0];
    testClient.disconnect();
    
    // Wait for reconnection
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    if (testClient.connected) {
      this.testResults.socketStability.passed++;
      console.log('✅ Auto-reconnection successful');
    } else {
      this.testResults.socketStability.failed++;
      this.testResults.socketStability.details.push({
        test: 'Auto-reconnection',
        error: 'Client failed to reconnect automatically'
      });
    }
  }

  async testMessageDelivery() {
    console.log('Testing message delivery...');
    
    const testMessage = { type: 'test', timestamp: Date.now() };
    let receivedCount = 0;
    
    // Set up message listeners
    this.clients.forEach(client => {
      client.on('test-message', (message) => {
        if (message.timestamp === testMessage.timestamp) {
          receivedCount++;
        }
      });
    });
    
    // Send test message
    this.clients[0].emit('test-message', testMessage);
    
    // Wait for delivery
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (receivedCount === this.clients.length) {
      this.testResults.socketStability.passed++;
      console.log('✅ Message delivery successful');
    } else {
      this.testResults.socketStability.failed++;
      this.testResults.socketStability.details.push({
        test: 'Message Delivery',
        error: `Expected ${this.clients.length} deliveries, got ${receivedCount}`
      });
    }
  }

  generateTestReport() {
    console.log('\n📊 Test Report');
    console.log('=' * 60);
    
    Object.entries(this.testResults).forEach(([category, results]) => {
      const total = results.passed + results.failed;
      const passRate = total > 0 ? ((results.passed / total) * 100).toFixed(1) : 0;
      
      console.log(`\n${category.toUpperCase()}:`);
      console.log(`  ✅ Passed: ${results.passed}`);
      console.log(`  ❌ Failed: ${results.failed}`);
      console.log(`  📈 Pass Rate: ${passRate}%`);
      
      if (results.details.length > 0) {
        console.log('  📝 Details:');
        results.details.forEach(detail => {
          console.log(`    - ${detail.test}: ${detail.error}`);
        });
      }
    });
    
    const totalTests = Object.values(this.testResults).reduce((sum, result) => 
      sum + result.passed + result.failed, 0
    );
    const totalPassed = Object.values(this.testResults).reduce((sum, result) => 
      sum + result.passed, 0
    );
    const overallPassRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : 0;
    
    console.log('\n' + '=' * 60);
    console.log(`🎯 OVERALL RESULTS: ${overallPassRate}% (${totalPassed}/${totalTests})`);
    
    if (overallPassRate >= 90) {
      console.log('🎉 System is stable and ready for production!');
    } else if (overallPassRate >= 70) {
      console.log('⚠️  System needs some improvements before production');
    } else {
      console.log('❌ System needs significant fixes before production');
    }
  }

  cleanup() {
    this.clients.forEach(client => {
      if (client.connected) {
        client.disconnect();
      }
    });
    console.log('🧹 Cleanup completed');
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  const tester = new RealtimeSystemTester();
  tester.runFullTest().catch(console.error);
}

module.exports = RealtimeSystemTester; 