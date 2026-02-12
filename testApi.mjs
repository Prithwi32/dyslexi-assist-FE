/**
 * Simple API Test Runner
 * 
 * Run this in Node.js to test backend connectivity without browser
 * Usage: node testApi.mjs
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:8001';

// Test health endpoint
async function testHealth() {
  console.log('🔍 Testing Health Check...');
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Backend is running!');
    console.log('Response:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Backend is not responding');
    if (error.code === 'ECONNREFUSED') {
      console.error('Connection refused. Is the backend running on port 8001?');
    } else {
      console.error('Error:', error.message);
    }
    return false;
  }
}

// Test registration
async function testRegister() {
  console.log('\n🔍 Testing User Registration...');
  try {
    const testUser = {
      email: `test-${Date.now()}@example.com`,
      password: 'testpass123',
      name: 'Test User',
      age: 12,
      grade_level: '7th Grade',
      metadata: { source: 'node-test' }
    };
    
    const response = await axios.post(`${BASE_URL}/register`, testUser);
    console.log('✅ Registration successful!');
    console.log('User ID:', response.data.user.user_id);
    return response.data;
  } catch (error) {
    console.error('❌ Registration failed');
    console.error('Error:', error.response?.data?.detail || error.message);
    return null;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting API Tests...\n');
  console.log('Target:', BASE_URL);
  console.log('═══════════════════════════════════\n');
  
  const healthOk = await testHealth();
  
  if (!healthOk) {
    console.log('\n⚠️  Backend is not running. Start it with:');
    console.log('   cd path/to/backend');
    console.log('   python -m uvicorn main:app --reload --port 8001');
    return;
  }
  
  const registerResult = await testRegister();
  
  console.log('\n═══════════════════════════════════');
  console.log('✨ Tests complete!');
  
  if (registerResult) {
    console.log('\n📋 Summary:');
    console.log('   ✓ Health check passed');
    console.log('   ✓ Registration passed');
    console.log('\n🎉 API integration is working correctly!');
  }
}

runTests().catch(console.error);
