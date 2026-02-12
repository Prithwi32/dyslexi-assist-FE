/**
 * Backend API Integration Test File
 * 
 * This file tests the API integration with the FastAPI backend.
 * Run this in the browser console or create a test page to verify connectivity.
 * 
 * PREREQUISITES:
 * 1. FastAPI backend must be running on http://localhost:8001
 * 2. MongoDB should be connected (for full functionality)
 * 
 * To test in browser console:
 * 1. Import this file in your app
 * 2. Open browser console
 * 3. Run: await testBackendIntegration()
 */

import { userService, assignmentService, sessionService, progressService, debugService } from './backendApi';

/**
 * Test 1: Health Check
 */
export async function testHealthCheck() {
  console.log('🔍 Testing Health Check...');
  try {
    const health = await userService.healthCheck();
    console.log('✅ Health Check Success:', health);
    return { success: true, data: health };
  } catch (error) {
    console.error('❌ Health Check Failed:', error);
    return { success: false, error };
  }
}

/**
 * Test 2: User Registration
 */
export async function testUserRegistration() {
  console.log('🔍 Testing User Registration...');
  try {
    const testUser = {
      email: `test-${Date.now()}@example.com`,
      password: 'testpass123',
      name: 'Test User',
      age: 12,
      grade_level: '7th Grade',
      metadata: { source: 'integration-test' }
    };
    
    const result = await userService.registerUser(testUser);
    console.log('✅ Registration Success:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('❌ Registration Failed:', error);
    return { success: false, error };
  }
}

/**
 * Test 3: User Login
 */
export async function testUserLogin(email: string, password: string) {
  console.log('🔍 Testing User Login...');
  try {
    const result = await userService.loginUser({ email, password });
    console.log('✅ Login Success:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('❌ Login Failed:', error);
    return { success: false, error };
  }
}

/**
 * Test 4: Get User Profile
 */
export async function testGetUserProfile(userId: string) {
  console.log('🔍 Testing Get User Profile...');
  try {
    const user = await userService.getUserProfile(userId);
    console.log('✅ Get Profile Success:', user);
    return { success: true, data: user };
  } catch (error) {
    console.error('❌ Get Profile Failed:', error);
    return { success: false, error };
  }
}

/**
 * Test 5: Submit Assignment
 */
export async function testSubmitAssignment(userId: string) {
  console.log('🔍 Testing Submit Assignment...');
  try {
    const assignmentData = {
      user_id: userId,
      session_id: `test-session-${Date.now()}`,
      assignment_name: 'Integration Test Assignment',
      assignment_type: 'diagnostic',
      tasks: [
        {
          task_type: 'word_recognition',
          prompt: 'Read the word: cat',
          user_response: 'cat',
          correct_answer: 'cat',
          is_correct: true,
          response_time_ms: 1200,
          difficulty_level: 1
        },
        {
          task_type: 'phonics',
          prompt: 'Sound out: dog',
          user_response: 'dog',
          correct_answer: 'dog',
          is_correct: true,
          response_time_ms: 1500,
          difficulty_level: 2
        }
      ],
      flags: {
        high_anxiety_signals: false,
        prefers_visual_aids: true,
        low_confidence: false
      }
    };
    
    const result = await assignmentService.submitAssignment(assignmentData);
    console.log('✅ Submit Assignment Success:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('❌ Submit Assignment Failed:', error);
    return { success: false, error };
  }
}

/**
 * Test 6: Get User Assignments
 */
export async function testGetUserAssignments(userId: string) {
  console.log('🔍 Testing Get User Assignments...');
  try {
    const result = await assignmentService.getUserAssignments(userId);
    console.log('✅ Get Assignments Success:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('❌ Get Assignments Failed:', error);
    return { success: false, error };
  }
}

/**
 * Test 7: Analyze User Weaknesses
 */
export async function testAnalyzeWeaknesses(userId: string) {
  console.log('🔍 Testing Analyze Weaknesses...');
  try {
    const result = await assignmentService.analyzeUserWeaknesses(userId);
    console.log('✅ Analyze Weaknesses Success:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('❌ Analyze Weaknesses Failed:', error);
    return { success: false, error };
  }
}

/**
 * Test 8: Debug - List Sessions
 */
export async function testListSessions() {
  console.log('🔍 Testing List Sessions (Debug)...');
  try {
    const result = await debugService.listAllSessions();
    console.log('✅ List Sessions Success:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('❌ List Sessions Failed:', error);
    return { success: false, error };
  }
}

/**
 * Run all tests in sequence
 */
export async function testBackendIntegration() {
  console.log('🚀 Starting Backend API Integration Tests...\n');
  
  const results = {
    healthCheck: null,
    registration: null,
    login: null,
    profile: null,
    submitAssignment: null,
    getAssignments: null,
    analyzeWeaknesses: null,
    listSessions: null
  };
  
  // Test 1: Health Check
  results.healthCheck = await testHealthCheck();
  console.log('\n---\n');
  
  if (!results.healthCheck.success) {
    console.error('⚠️ Backend is not running. Please start the FastAPI server on http://localhost:8001');
    return results;
  }
  
  // Test 2: Register User
  results.registration = await testUserRegistration();
  console.log('\n---\n');
  
  if (!results.registration.success) {
    console.error('⚠️ Registration failed. Cannot proceed with other tests.');
    return results;
  }
  
  const userId = results.registration.data?.user?.user_id;
  const userEmail = results.registration.data?.user?.email;
  const userPassword = 'testpass123';
  
  if (!userId) {
    console.error('⚠️ No user ID received. Cannot proceed with other tests.');
    return results;
  }
  
  // Test 3: Login
  results.login = await testUserLogin(userEmail, userPassword);
  console.log('\n---\n');
  
  // Test 4: Get Profile
  results.profile = await testGetUserProfile(userId);
  console.log('\n---\n');
  
  // Test 5: Submit Assignment
  results.submitAssignment = await testSubmitAssignment(userId);
  console.log('\n---\n');
  
  // Test 6: Get Assignments
  results.getAssignments = await testGetUserAssignments(userId);
  console.log('\n---\n');
  
  // Test 7: Analyze Weaknesses
  results.analyzeWeaknesses = await testAnalyzeWeaknesses(userId);
  console.log('\n---\n');
  
  // Test 8: Debug - List Sessions
  results.listSessions = await testListSessions();
  console.log('\n---\n');
  
  // Summary
  const successCount = Object.values(results).filter(r => r?.success).length;
  const totalTests = Object.keys(results).length;
  
  console.log('📊 Test Summary:');
  console.log(`✅ Passed: ${successCount}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - successCount}/${totalTests}`);
  
  if (successCount === totalTests) {
    console.log('\n🎉 All tests passed! Backend integration is working correctly.');
  } else {
    console.log('\n⚠️ Some tests failed. Check the errors above.');
  }
  
  return results;
}

// Export for use in other files
export default {
  testHealthCheck,
  testUserRegistration,
  testUserLogin,
  testGetUserProfile,
  testSubmitAssignment,
  testGetUserAssignments,
  testAnalyzeWeaknesses,
  testListSessions,
  testBackendIntegration
};
