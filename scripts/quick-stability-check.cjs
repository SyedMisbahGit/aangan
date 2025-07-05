#!/usr/bin/env node

const io = require('socket.io-client');
const axios = require('axios');

const API_BASE = process.env.API_BASE || 'https://aangan-production.up.railway.app';

class QuickStabilityCheck {
  constructor() {
    this.results = [];
    this.clients = [];
  }

  async runQuickCheck() {
    console.log('🚀 Quick Stability Check for Aangan Real-Time System');
    console.log('=' * 50);

    try {
      // 1. Test server health
      await this.testServerHealth();
      
      // 2. Test basic connection
      await this.testBasicConnection();
      
      // 3. Test whisper creation
      await this.testWhisperCreation();
      
      // 4. Test real-time delivery
      await this.testRealTimeDelivery();
      
      // 5. Test zone activity
      await this.testZoneActivity();
      
      // 6. Generate quick report
      this.generateQuickReport();
      
    } catch (error) {
      console.error('❌ Quick check failed:', error.message);
      this.addResult('system', false, `System error: ${error.message}`);
    } finally {
      this.cleanup();
    }
  }

  async testServerHealth() {
    console.log('\n🏥 Testing server health...');
    
    try {
      const response = await axios.get(`${API_BASE}/api/realtime/health`, {
        timeout: 10000
      });
      
      const health = response.data;
      
      if (health.status === 'healthy') {
        this.addResult('server_health', true, 'Server is healthy');
        console.log(`  ✅ Memory: ${health.memory.used}MB / ${health.memory.total}MB`);
        console.log(`  ✅ Uptime: ${Math.floor(health.uptime)}s`);
        console.log(`  ✅ Active connections: ${health.connections.active}`);
      } else {
        this.addResult('server_health', false, `Server status: ${health.status}`);
      }
    } catch (error) {
      this.addResult('server_health', false, `Health check failed: ${error.message}`);
    }
  }

  async testBasicConnection() {
    console.log('\n🔌 Testing basic connection...');
    
    return new Promise((resolve) => {
      const client = io(API_BASE, {
        transports: ['websocket'],
        timeout: 10000
      });
      
      const timeout = setTimeout(() => {
        this.addResult('basic_connection', false, 'Connection timeout');
        client.disconnect();
        resolve();
      }, 10000);
      
      client.on('connect', () => {
        clearTimeout(timeout);
        this.addResult('basic_connection', true, 'Connection successful');
        this.clients.push(client);
        console.log('  ✅ Connected to real-time server');
        resolve();
      });
      
      client.on('connect_error', (error) => {
        clearTimeout(timeout);
        this.addResult('basic_connection', false, `Connection error: ${error.message}`);
        resolve();
      });
    });
  }

  async testWhisperCreation() {
    console.log('\n📝 Testing whisper creation...');
    
    try {
      const whisper = {
        content: `Quick test whisper at ${new Date().toISOString()}`,
        emotion: 'joy',
        zone: 'tapri'
      };
      
      const response = await axios.post(`${API_BASE}/api/whispers`, whisper, {
        timeout: 10000
      });
      
      if (response.data.id) {
        this.addResult('whisper_creation', true, 'Whisper created successfully');
        console.log(`  ✅ Whisper ID: ${response.data.id}`);
        return response.data.id;
      } else {
        this.addResult('whisper_creation', false, 'No whisper ID returned');
      }
    } catch (error) {
      this.addResult('whisper_creation', false, `Whisper creation failed: ${error.message}`);
    }
  }

  async testRealTimeDelivery() {
    console.log('\n⚡ Testing real-time delivery...');
    
    if (this.clients.length === 0) {
      this.addResult('realtime_delivery', false, 'No clients available for testing');
      return;
    }
    
    return new Promise((resolve) => {
      const client = this.clients[0];
      let whisperReceived = false;
      
      const timeout = setTimeout(() => {
        if (!whisperReceived) {
          this.addResult('realtime_delivery', false, 'No real-time whisper received within 5 seconds');
        }
        resolve();
      }, 5000);
      
      client.on('new-whisper', (whisper) => {
        clearTimeout(timeout);
        whisperReceived = true;
        this.addResult('realtime_delivery', true, 'Real-time whisper received');
        console.log(`  ✅ Received whisper: ${whisper.content.substring(0, 50)}...`);
        resolve();
      });
      
      // Create a test whisper to trigger real-time delivery
      this.createTestWhisper();
    });
  }

  async createTestWhisper() {
    try {
      const whisper = {
        content: `Real-time test whisper at ${new Date().toISOString()}`,
        emotion: 'anxiety',
        zone: 'library'
      };
      
      await axios.post(`${API_BASE}/api/whispers`, whisper, {
        timeout: 5000
      });
    } catch (error) {
      console.error('Error creating test whisper:', error.message);
    }
  }

  async testZoneActivity() {
    console.log('\n📍 Testing zone activity...');
    
    try {
      const response = await axios.get(`${API_BASE}/api/realtime/zones`, {
        timeout: 10000
      });
      
      const zones = response.data.zones;
      
      if (Array.isArray(zones)) {
        this.addResult('zone_activity', true, `Zone activity API working (${zones.length} zones)`);
        console.log(`  ✅ Active zones: ${zones.length}`);
        
        zones.forEach(zone => {
          console.log(`    - ${zone.zone}: ${zone.activeUsers} users (${zone.activityLevel})`);
        });
      } else {
        this.addResult('zone_activity', false, 'Invalid zone activity response');
      }
    } catch (error) {
      this.addResult('zone_activity', false, `Zone activity failed: ${error.message}`);
    }
  }

  addResult(test, passed, message) {
    this.results.push({
      test,
      passed,
      message,
      timestamp: new Date().toISOString()
    });
  }

  generateQuickReport() {
    console.log('\n📊 Quick Stability Check Report');
    console.log('=' * 50);
    
    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;
    
    console.log(`\nOverall Results: ${passRate}% (${passed}/${total})`);
    
    this.results.forEach(result => {
      const icon = result.passed ? '✅' : '❌';
      console.log(`${icon} ${result.test}: ${result.message}`);
    });
    
    console.log('\n' + '=' * 50);
    
    if (passRate >= 80) {
      console.log('🎉 System appears stable! Ready for detailed testing.');
    } else if (passRate >= 60) {
      console.log('⚠️  System has some issues. Review before production.');
    } else {
      console.log('❌ System has critical issues. Fix before testing.');
    }
    
    console.log('\nNext Steps:');
    if (passRate >= 80) {
      console.log('1. Run full stability test: node scripts/run-stability-tests.js');
      console.log('2. Perform manual testing with multiple users');
      console.log('3. Test mobile performance');
    } else {
      console.log('1. Check server logs for errors');
      console.log('2. Verify API endpoints are working');
      console.log('3. Check network connectivity');
    }
  }

  cleanup() {
    this.clients.forEach(client => {
      if (client.connected) {
        client.disconnect();
      }
    });
  }
}

// Run the quick check if this file is executed directly
if (require.main === module) {
  const checker = new QuickStabilityCheck();
  checker.runQuickCheck().catch(console.error);
}

module.exports = QuickStabilityCheck; 