#!/usr/bin/env node

/**
 * Test script to verify backend authentication endpoints
 */

const { execSync } = require('child_process');

console.log('🚀 Testing KNSTherapy Backend Authentication Endpoints...\n');

const BASE_URL = 'http://localhost:3001/v1';

// Test data
const testCommunityUser = {
  name: 'Test User',
  email: 'testuser@example.com',
  password: 'Password123',
  username: 'testuser123',
  bio: 'This is a test community user',
};

const testTherapist = {
  name: 'Dr. Jane Smith',
  email: 'dr.jane@example.com',
  password: 'Password123',
  licenseNumber: 'LIC123456',
  specialties: ['anxiety', 'depression'],
  yearsOfPractice: 5,
  credentials: [
    {
      type: 'degree',
      name: 'PhD in Clinical Psychology',
      institution: 'University of Example',
      year: 2018,
    },
  ],
  bio: 'Experienced therapist specializing in anxiety and depression',
};

function makeRequest(endpoint, method = 'GET', data = null, headers = {}) {
  try {
    const curlCommand = [
      'curl',
      '-s',
      '-X',
      method,
      '-H',
      'Content-Type: application/json',
      ...Object.entries(headers).flat(),
      data ? '-d' : '',
      data ? `'${JSON.stringify(data)}'` : '',
      `${BASE_URL}${endpoint}`,
    ].filter(Boolean);

    const result = execSync(curlCommand.join(' '), { encoding: 'utf8' });
    return JSON.parse(result);
  } catch (error) {
    console.error(`❌ Error making request to ${endpoint}:`, error.message);
    return null;
  }
}

async function runTests() {
  console.log('1. Testing Community User Registration...');
  const communityUserResult = makeRequest('/auth/register/community', 'POST', testCommunityUser);
  if (communityUserResult && communityUserResult.user) {
    console.log('✅ Community user registration successful');
    console.log(`   User ID: ${communityUserResult.user.id}`);
    console.log(
      `   Username: ${communityUserResult.user.communityProfile && communityUserResult.user.communityProfile.username}`
    );
  } else {
    console.log('❌ Community user registration failed');
  }

  console.log('\n2. Testing Therapist Registration...');
  const therapistResult = makeRequest('/auth/register/therapist', 'POST', testTherapist);
  if (therapistResult && therapistResult.user) {
    console.log('✅ Therapist registration successful');
    console.log(`   User ID: ${therapistResult.user.id}`);
    console.log(
      `   License: ${therapistResult.user.therapistProfile && therapistResult.user.therapistProfile.licenseNumber}`
    );
    console.log(
      `   Status: ${therapistResult.user.therapistProfile && therapistResult.user.therapistProfile.verificationStatus}`
    );
  } else {
    console.log('❌ Therapist registration failed');
  }

  console.log('\n3. Testing Available Therapists Endpoint...');
  const availableTherapists = makeRequest('/therapists/available');
  if (availableTherapists) {
    console.log('✅ Available therapists endpoint working');
    console.log(`   Found ${(availableTherapists.results && availableTherapists.results.length) || 0} therapists`);
  } else {
    console.log('❌ Available therapists endpoint failed');
  }

  console.log('\n4. Testing Community Users Endpoint...');
  const communityUsers = makeRequest('/community/users');
  if (communityUsers) {
    console.log('✅ Community users endpoint working');
    console.log(`   Found ${(communityUsers.results && communityUsers.results.length) || 0} users`);
  } else {
    console.log('❌ Community users endpoint failed');
  }

  console.log('\n✨ Backend test completed!');
}

// Check if server is running
console.log('🔍 Checking if backend server is running...');
try {
  execSync(`curl -s ${BASE_URL}/auth/login > /dev/null`);
  console.log('✅ Backend server is running\n');
  runTests();
} catch (error) {
  console.log('❌ Backend server is not running. Please start it with: npm run dev\n');
  process.exit(1);
}
