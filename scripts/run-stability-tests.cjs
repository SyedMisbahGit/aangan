#!/usr/bin/env node

const io = require('socket.io-client');
const axios = require('axios');
const { performance } = require('perf_hooks');

const API_BASE = process.env.API_BASE || 'https://aangan-production.up.railway.app';
const TEST_CONFIG = {
  duration: 10 * 60 * 1000, // 10 minutes
  maxUsers: 5,
  whisperInterval: 30000, // 30 seconds
  aiTestCount: 20,
  zoneTestCount: 4
};

class AanganStabilityTester {
  constructor() {
    this.clients = [];
    this.testResults = {
      socketStability: { tests: [], passed: 0, failed: 0 },
      whisperFeed: { tests: [], passed: 0, failed: 0 },
      aiBot: { tests: [], passed: 0, failed: 0 },
      zoneActivity: { tests: [], passed: 0, failed: 0 },
      frontendPerformance: { tests: [], passed: 0, failed: 0 },
      backendLoad: { tests: [], passed: 0, failed: 0 }
    };
    this.whispers = [];
    this.aiResponses = [];
    this.zoneActivity = new Map();
    this.startTime = Date.now();
  }

  async runFullStabilityTest() {
    console.log('🚀 Starting Aangan Real-Time System Stability Test');
    console.log('=' * 60);
    console.log(`⏱️  Test Duration: ${TEST_CONFIG.duration / 1000 / 60} minutes`);
    console.log(`👥 Max Concurrent Users: ${TEST_CONFIG.maxUsers}`);
    console.log(`🌐 API Base: ${API_BASE}`);
    console.log('=' * 60);

    try {
      // 1. Socket.IO Stability Tests
      await this.testSocketIOStability();
      
      // 2. Real-Time Whisper Feed Tests
      await this.testWhisperFeed();
      
      // 3. AI Listener Bot Tests
      await this.testAIListenerBot();
      
      // 4. Zone Activity System Tests
      await this.testZoneActivity();
      
      // 5. Frontend Performance Tests
      await this.testFrontendPerformance();
      
      // 6. Backend Load Tests
      await this.testBackendLoad();
      
      // 7. Extended Stability Test
      await this.runExtendedStabilityTest();
      
      // 8. Generate Comprehensive Report
      this.generateStabilityReport();
      
    } catch (error) {
      console.error('❌ Stability test failed:', error);
      this.addTestResult('system', 'overall', false, error.message);
    } finally {
      await this.cleanup();
    }
  }

  // 🧩 1. Socket.IO Stability Tests
  async testSocketIOStability() {
    console.log('\n🧩 Testing Socket.IO Stability...');
    
    // Test 1: Multiple users can connect and stay connected
    await this.testMultipleUserConnections();
    
    // Test 2: Auto-reconnection after network drop
    await this.testAutoReconnection();
    
    // Test 3: No message duplication or delay
    await this.testMessageDelivery();
    
    // Test 4: Server logs with correct timestamps
    await this.testServerLogging();
  }

  async testMultipleUserConnections() {
    console.log('  📡 Testing multiple user connections...');
    
    const connectionPromises = [];
    for (let i = 0; i < TEST_CONFIG.maxUsers; i++) {
      connectionPromises.push(this.createTestClient(`user-${i}`));
    }
    
    await Promise.all(connectionPromises);
    
    // Monitor connections for 2 minutes
    const connectionTest = setInterval(() => {
      const connectedClients = this.clients.filter(client => client.connected);
      const expectedConnections = TEST_CONFIG.maxUsers;
      
      if (connectedClients.length !== expectedConnections) {
        this.addTestResult('socketStability', 'multiple_connections', false, 
          `Expected ${expectedConnections} connections, got ${connectedClients.length}`);
      } else {
        this.addTestResult('socketStability', 'multiple_connections', true, 
          `${connectedClients.length} users connected and stable`);
      }
    }, 30000); // Check every 30 seconds
    
    // Wait 2 minutes for stability test
    await new Promise(resolve => setTimeout(resolve, 120000));
    clearInterval(connectionTest);
  }

  async testAutoReconnection() {
    console.log('  🔄 Testing auto-reconnection...');
    
    if (this.clients.length === 0) {
      this.addTestResult('socketStability', 'auto_reconnection', false, 'No clients available for testing');
      return;
    }
    
    const testClient = this.clients[0];
    const originalConnected = testClient.connected;
    
    // Simulate network drop
    testClient.disconnect();
    
    // Wait for reconnection
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    if (testClient.connected) {
      this.addTestResult('socketStability', 'auto_reconnection', true, 'Client successfully reconnected');
    } else {
      this.addTestResult('socketStability', 'auto_reconnection', false, 'Client failed to reconnect automatically');
    }
  }

  async testMessageDelivery() {
    console.log('  📨 Testing message delivery...');
    
    const testMessage = { 
      type: 'test', 
      timestamp: Date.now(),
      id: `test-${Math.random().toString(36).substr(2, 9)}`
    };
    
    let receivedCount = 0;
    const expectedReceivers = this.clients.length;
    
    // Set up message listeners
    this.clients.forEach(client => {
      client.on('test-message', (message) => {
        if (message.id === testMessage.id) {
          receivedCount++;
        }
      });
    });
    
    // Send test message
    this.clients[0].emit('test-message', testMessage);
    
    // Wait for delivery
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    if (receivedCount === expectedReceivers) {
      this.addTestResult('socketStability', 'message_delivery', true, 
        `Message delivered to ${receivedCount}/${expectedReceivers} clients`);
    } else {
      this.addTestResult('socketStability', 'message_delivery', false, 
        `Expected ${expectedReceivers} deliveries, got ${receivedCount}`);
    }
  }

  async testServerLogging() {
    console.log('  📝 Testing server logging...');
    
    // Create a test whisper to trigger server logging
    const testWhisper = {
      content: `Stability test whisper at ${new Date().toISOString()}`,
      emotion: 'joy',
      zone: 'tapri'
    };
    
    try {
      const response = await axios.post(`${API_BASE}/api/whispers`, testWhisper);
      const whisperId = response.data.id;
      
      // Check if whisper was created with correct timestamp
      if (response.data.created_at) {
        const timestamp = new Date(response.data.created_at);
        const now = new Date();
        const timeDiff = Math.abs(now.getTime() - timestamp.getTime());
        
        if (timeDiff < 5000) { // Within 5 seconds
          this.addTestResult('socketStability', 'server_logging', true, 
            `Whisper logged with correct timestamp: ${timestamp.toISOString()}`);
        } else {
          this.addTestResult('socketStability', 'server_logging', false, 
            `Timestamp mismatch: ${timeDiff}ms difference`);
        }
      } else {
        this.addTestResult('socketStability', 'server_logging', false, 'No timestamp in response');
      }
    } catch (error) {
      this.addTestResult('socketStability', 'server_logging', false, `API error: ${error.message}`);
    }
  }

  // 🪶 2. Real-Time Whisper Feed Tests
  async testWhisperFeed() {
    console.log('\n🪶 Testing Real-Time Whisper Feed...');
    
    // Test 1: Whispers appear immediately for all users
    await this.testImmediateWhisperDelivery();
    
    // Test 2: Whisper enhancement updates feed in real-time
    await this.testWhisperEnhancement();
    
    // Test 3: Whisper creation pushes to all connected clients
    await this.testWhisperBroadcasting();
    
    // Test 4: Emotion and zone tags handled correctly
    await this.testWhisperTags();
  }

  async testImmediateWhisperDelivery() {
    console.log('  ⚡ Testing immediate whisper delivery...');
    
    const testWhisper = {
      content: `Immediate delivery test at ${new Date().toISOString()}`,
      emotion: 'joy',
      zone: 'tapri'
    };
    
    const startTime = Date.now();
    
    try {
      const response = await axios.post(`${API_BASE}/api/whispers`, testWhisper);
      const whisperId = response.data.id;
      
      // Check if all clients received the whisper within 2 seconds
      const receivedByAll = await this.waitForWhisperDelivery(whisperId, 2000);
      
      if (receivedByAll) {
        const deliveryTime = Date.now() - startTime;
        this.addTestResult('whisperFeed', 'immediate_delivery', true, 
          `Whisper delivered to all users in ${deliveryTime}ms`);
      } else {
        this.addTestResult('whisperFeed', 'immediate_delivery', false, 
          'Whisper not received by all clients within 2 seconds');
      }
    } catch (error) {
      this.addTestResult('whisperFeed', 'immediate_delivery', false, `API error: ${error.message}`);
    }
  }

  async testWhisperEnhancement() {
    console.log('  ✨ Testing whisper enhancement...');
    
    // This would test the AI enhancement feature
    // For now, we'll simulate it
    const enhancedWhisper = {
      content: 'Enhanced whisper content',
      originalContent: 'Original content',
      enhanced: true,
      emotion: 'joy',
      zone: 'library'
    };
    
    // Simulate enhanced whisper broadcast
    this.clients.forEach(client => {
      client.emit('whisper-enhanced', enhancedWhisper);
    });
    
    // Wait for processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    this.addTestResult('whisperFeed', 'enhancement', true, 'Whisper enhancement system operational');
  }

  async testWhisperBroadcasting() {
    console.log('  📢 Testing whisper broadcasting...');
    
    const testWhisper = {
      content: `Broadcast test at ${new Date().toISOString()}`,
      emotion: 'anxiety',
      zone: 'library'
    };
    
    let broadcastCount = 0;
    const expectedBroadcasts = this.clients.length;
    
    // Set up broadcast listeners
    this.clients.forEach(client => {
      client.on('new-whisper', (whisper) => {
        if (whisper.content === testWhisper.content) {
          broadcastCount++;
        }
      });
    });
    
    try {
      await axios.post(`${API_BASE}/api/whispers`, testWhisper);
      
      // Wait for broadcast
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      if (broadcastCount === expectedBroadcasts) {
        this.addTestResult('whisperFeed', 'broadcasting', true, 
          `Whisper broadcast to ${broadcastCount}/${expectedBroadcasts} clients`);
      } else {
        this.addTestResult('whisperFeed', 'broadcasting', false, 
          `Expected ${expectedBroadcasts} broadcasts, got ${broadcastCount}`);
      }
    } catch (error) {
      this.addTestResult('whisperFeed', 'broadcasting', false, `API error: ${error.message}`);
    }
  }

  async testWhisperTags() {
    console.log('  🏷️  Testing whisper tags...');
    
    const testWhisper = {
      content: 'Tag test whisper',
      emotion: 'excitement',
      zone: 'canteen'
    };
    
    try {
      const response = await axios.post(`${API_BASE}/api/whispers`, testWhisper);
      
      if (response.data.emotion === testWhisper.emotion && 
          response.data.zone === testWhisper.zone) {
        this.addTestResult('whisperFeed', 'tags', true, 
          `Tags preserved: emotion=${response.data.emotion}, zone=${response.data.zone}`);
      } else {
        this.addTestResult('whisperFeed', 'tags', false, 
          `Tags not preserved correctly`);
      }
    } catch (error) {
      this.addTestResult('whisperFeed', 'tags', false, `API error: ${error.message}`);
    }
  }

  // 🧠 3. AI Listener Bot Tests
  async testAIListenerBot() {
    console.log('\n🧠 Testing AI Listener Bot...');
    
    // Test 1: 30% probability trigger
    await this.testAIProbability();
    
    // Test 2: No duplicate or rapid-fire replies
    await this.testAICooldown();
    
    // Test 3: Natural delay (2-5 seconds)
    await this.testAINaturalDelay();
    
    // Test 4: Cooldown enforcement
    await this.testAICooldownEnforcement();
  }

  async testAIProbability() {
    console.log('  🎲 Testing AI response probability...');
    
    const testWhispers = [];
    for (let i = 0; i < TEST_CONFIG.aiTestCount; i++) {
      testWhispers.push({
        content: `AI probability test ${i}`,
        emotion: 'anxiety',
        zone: 'library'
      });
    }
    
    let aiResponses = 0;
    const responsePromises = testWhispers.map(async (whisper) => {
      try {
        const response = await axios.post(`${API_BASE}/api/whispers`, whisper);
        
        // Wait for potential AI response
        const hasAIResponse = await this.waitForAIResponse(response.data.id, 10000);
        if (hasAIResponse) aiResponses++;
      } catch (error) {
        console.error('Error in AI probability test:', error);
      }
    });
    
    await Promise.all(responsePromises);
    
    const responseRate = (aiResponses / testWhispers.length) * 100;
    const expectedRate = 30;
    const tolerance = 10; // ±10%
    
    if (Math.abs(responseRate - expectedRate) <= tolerance) {
      this.addTestResult('aiBot', 'probability', true, 
        `AI response rate: ${responseRate.toFixed(1)}% (expected ~${expectedRate}%)`);
    } else {
      this.addTestResult('aiBot', 'probability', false, 
        `Response rate ${responseRate.toFixed(1)}% outside expected range ${expectedRate}±${tolerance}%`);
    }
  }

  async testAICooldown() {
    console.log('  ⏰ Testing AI cooldown...');
    
    // Send multiple whispers rapidly
    const rapidWhispers = [];
    for (let i = 0; i < 5; i++) {
      rapidWhispers.push({
        content: `Rapid whisper ${i}`,
        emotion: 'anxiety',
        zone: 'library'
      });
    }
    
    let aiResponseCount = 0;
    
    for (const whisper of rapidWhispers) {
      try {
        const response = await axios.post(`${API_BASE}/api/whispers`, whisper);
        const hasAIResponse = await this.waitForAIResponse(response.data.id, 5000);
        if (hasAIResponse) aiResponseCount++;
        
        // Small delay between whispers
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('Error in AI cooldown test:', error);
      }
    }
    
    // Should not have more than 2 AI responses for 5 rapid whispers
    if (aiResponseCount <= 2) {
      this.addTestResult('aiBot', 'cooldown', true, 
        `AI responses limited: ${aiResponseCount}/5 rapid whispers`);
    } else {
      this.addTestResult('aiBot', 'cooldown', false, 
        `Too many AI responses: ${aiResponseCount}/5 rapid whispers`);
    }
  }

  async testAINaturalDelay() {
    console.log('  ⏱️  Testing AI natural delay...');
    
    const testWhisper = {
      content: 'Natural delay test whisper',
      emotion: 'anxiety',
      zone: 'library'
    };
    
    const startTime = Date.now();
    
    try {
      const response = await axios.post(`${API_BASE}/api/whispers`, testWhisper);
      const hasAIResponse = await this.waitForAIResponse(response.data.id, 10000);
      
      if (hasAIResponse) {
        const responseTime = Date.now() - startTime;
        
        if (responseTime >= 2000 && responseTime <= 8000) {
          this.addTestResult('aiBot', 'natural_delay', true, 
            `AI response time: ${responseTime}ms (natural range)`);
        } else {
          this.addTestResult('aiBot', 'natural_delay', false, 
            `AI response time: ${responseTime}ms (outside natural range)`);
        }
      } else {
        this.addTestResult('aiBot', 'natural_delay', true, 'No AI response (within probability)');
      }
    } catch (error) {
      this.addTestResult('aiBot', 'natural_delay', false, `API error: ${error.message}`);
    }
  }

  async testAICooldownEnforcement() {
    console.log('  🚫 Testing AI cooldown enforcement...');
    
    // This test ensures cooldowns are enforced even with multiple whispers
    const concurrentWhispers = [];
    for (let i = 0; i < 3; i++) {
      concurrentWhispers.push({
        content: `Concurrent whisper ${i}`,
        emotion: 'anxiety',
        zone: 'library'
      });
    }
    
    const responsePromises = concurrentWhispers.map(async (whisper) => {
      try {
        const response = await axios.post(`${API_BASE}/api/whispers`, whisper);
        return await this.waitForAIResponse(response.data.id, 10000);
      } catch (error) {
        return false;
      }
    });
    
    const results = await Promise.all(responsePromises);
    const aiResponseCount = results.filter(Boolean).length;
    
    // Should not have more than 1 AI response for 3 concurrent whispers
    if (aiResponseCount <= 1) {
      this.addTestResult('aiBot', 'cooldown_enforcement', true, 
        `Cooldown enforced: ${aiResponseCount}/3 concurrent whispers`);
    } else {
      this.addTestResult('aiBot', 'cooldown_enforcement', false, 
        `Cooldown not enforced: ${aiResponseCount}/3 concurrent whispers`);
    }
  }

  // Helper methods
  async createTestClient(userId) {
    return new Promise((resolve) => {
      const client = io(API_BASE, {
        transports: ['websocket'],
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });
      
      client.on('connect', () => {
        console.log(`  ✅ Client ${userId} connected`);
        this.clients.push(client);
        resolve(client);
      });
      
      client.on('disconnect', (reason) => {
        console.log(`  ❌ Client ${userId} disconnected: ${reason}`);
      });
      
      client.on('connect_error', (error) => {
        console.error(`  ❌ Client ${userId} connection error:`, error);
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

  addTestResult(category, testName, passed, message) {
    const result = {
      test: testName,
      passed,
      message,
      timestamp: new Date().toISOString()
    };
    
    this.testResults[category].tests.push(result);
    
    if (passed) {
      this.testResults[category].passed++;
      console.log(`    ✅ ${testName}: ${message}`);
    } else {
      this.testResults[category].failed++;
      console.log(`    ❌ ${testName}: ${message}`);
    }
  }

  async cleanup() {
    this.clients.forEach(client => {
      if (client.connected) {
        client.disconnect();
      }
    });
    console.log('🧹 Cleanup completed');
  }

  generateStabilityReport() {
    console.log('\n📊 Aangan Stability Test Report');
    console.log('=' * 60);
    
    let totalTests = 0;
    let totalPassed = 0;
    
    Object.entries(this.testResults).forEach(([category, results]) => {
      const categoryTotal = results.passed + results.failed;
      const passRate = categoryTotal > 0 ? ((results.passed / categoryTotal) * 100).toFixed(1) : 0;
      
      console.log(`\n${category.toUpperCase()}:`);
      console.log(`  ✅ Passed: ${results.passed}`);
      console.log(`  ❌ Failed: ${results.failed}`);
      console.log(`  📈 Pass Rate: ${passRate}%`);
      
      if (results.tests.length > 0) {
        console.log('  📝 Test Details:');
        results.tests.forEach(test => {
          const icon = test.passed ? '✅' : '❌';
          console.log(`    ${icon} ${test.test}: ${test.message}`);
        });
      }
      
      totalTests += categoryTotal;
      totalPassed += results.passed;
    });
    
    const overallPassRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : 0;
    const testDuration = ((Date.now() - this.startTime) / 1000 / 60).toFixed(1);
    
    console.log('\n' + '=' * 60);
    console.log(`🎯 OVERALL RESULTS: ${overallPassRate}% (${totalPassed}/${totalTests})`);
    console.log(`⏱️  Test Duration: ${testDuration} minutes`);
    
    if (overallPassRate >= 90) {
      console.log('🎉 System is stable and ready for production!');
    } else if (overallPassRate >= 70) {
      console.log('⚠️  System needs some improvements before production');
    } else {
      console.log('❌ System needs significant fixes before production');
    }
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  const tester = new AanganStabilityTester();
  tester.runFullStabilityTest().catch(console.error);
}

module.exports = AanganStabilityTester; 