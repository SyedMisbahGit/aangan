#!/usr/bin/env node

/**
 * Test Fail-Safe Defaults
 * 
 * This script tests that our fail-safe default principle is working:
 * - Unauthenticated access to protected routes should be denied
 * - Authenticated access to protected routes should be allowed
 */

const http = require('http');

const BASE_URL = 'http://localhost:3001';
const log = (desc, status, data) => console.log(`\n--- ${desc} (${status}) ---\n`, data);

// Helper function to make HTTP requests
function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const requestOptions = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = http.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

async function testFailSafeDefaults() {
  console.log('🧪 Testing Fail-Safe Defaults...\n');

  // Test 1: Public routes should be accessible
  console.log('1️⃣ Testing Public Routes (should succeed):');
  
  try {
    const healthResult = await makeRequest('/api/health');
    log('GET /api/health', healthResult.status, healthResult.data);
    
    const whispersResult = await makeRequest('/api/whispers');
    log('GET /api/whispers', whispersResult.status, whispersResult.data);
    
    const featuresResult = await makeRequest('/api/features/toggles');
    log('GET /api/features/toggles', featuresResult.status, featuresResult.data);
  } catch (error) {
    console.log('❌ Error testing public routes:', error.message);
  }

  // Test 2: Protected routes should be denied without authentication
  console.log('\n2️⃣ Testing Protected Routes (should be denied):');
  
  try {
    const analyticsResult = await makeRequest('/api/analytics/whispers');
    log('GET /api/analytics/whispers (no auth)', analyticsResult.status, analyticsResult.data);
    
    const zonesResult = await makeRequest('/api/analytics/zones');
    log('GET /api/analytics/zones (no auth)', zonesResult.status, zonesResult.data);
    
    const fcmResult = await makeRequest('/api/admin/fcm-tokens');
    log('GET /api/admin/fcm-tokens (no auth)', fcmResult.status, fcmResult.data);
    
    const verifyResult = await makeRequest('/api/auth/verify');
    log('GET /api/auth/verify (no auth)', verifyResult.status, verifyResult.data);
  } catch (error) {
    console.log('❌ Error testing protected routes:', error.message);
  }

  // Test 3: Protected routes with invalid token should be denied
  console.log('\n3️⃣ Testing Protected Routes (invalid token):');
  
  try {
    const invalidTokenResult = await makeRequest('/api/analytics/whispers', {
      headers: { 'Authorization': 'Bearer invalid-token' }
    });
    log('GET /api/analytics/whispers (invalid token)', invalidTokenResult.status, invalidTokenResult.data);
  } catch (error) {
    console.log('❌ Error testing invalid token:', error.message);
  }

  // Test 4: Admin login should work (this is the entry point)
  console.log('\n4️⃣ Testing Admin Login (entry point):');
  
  try {
    const loginResult = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: { username: 'admin', password: 'test-password' }
    });
    log('POST /api/auth/login', loginResult.status, loginResult.data);
  } catch (error) {
    console.log('❌ Error testing admin login:', error.message);
  }

  console.log('\n✅ Fail-Safe Defaults Test Complete!');
  console.log('\n📋 Summary:');
  console.log('- Public routes should return 200 OK');
  console.log('- Protected routes should return 401 Unauthorized without auth');
  console.log('- Invalid tokens should return 403 Forbidden');
  console.log('- Admin login should work (even if credentials are wrong)');
}

// Run the test
testFailSafeDefaults().catch(console.error); 