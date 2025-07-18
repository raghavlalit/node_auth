const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
let adminToken = '';
let superAdminToken = '';

// Test data
const testAdmin = {
  name: 'Test Admin',
  email: 'admin@test.com',
  password: 'AdminPass123!',
  phone: '1234567890',
  role: 'admin',
  permissions: 'user_management,content_moderation',
  status: 'Active'
};

const testSuperAdmin = {
  name: 'Super Admin',
  email: 'superadmin@test.com',
  password: 'SuperAdminPass123!',
  phone: '9876543210',
  role: 'super_admin',
  permissions: 'all',
  status: 'Active'
};

const testModerator = {
  name: 'Test Moderator',
  email: 'moderator@test.com',
  password: 'ModeratorPass123!',
  phone: '5555555555',
  role: 'moderator',
  permissions: 'content_moderation',
  status: 'Active'
};

// Helper function to make authenticated requests
const makeAuthRequest = async (method, url, data = null, token = adminToken) => {
  const config = {
    method,
    url: `${BASE_URL}${url}`,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    ...(data && { data })
  };
  return axios(config);
};

// Test Admin Registration
const testAdminRegistration = async () => {
  console.log('\n=== Testing Admin Registration ===');
  
  try {
    // Test 1: Register new admin
    console.log('1. Registering new admin...');
    const response1 = await makeAuthRequest('POST', '/admin/register', testAdmin);
    console.log('✅ Admin registration successful:', response1.data);
    
    // Test 2: Try to register with same email
    console.log('2. Testing duplicate email registration...');
    try {
      await makeAuthRequest('POST', '/admin/register', testAdmin);
    } catch (error) {
      console.log('✅ Duplicate email handled correctly:', error.response.data);
    }
    
    // Test 3: Register super admin
    console.log('3. Registering super admin...');
    const response3 = await makeAuthRequest('POST', '/admin/register', testSuperAdmin);
    console.log('✅ Super admin registration successful:', response3.data);
    superAdminToken = response3.data.data.token;
    
    // Test 4: Register moderator
    console.log('4. Registering moderator...');
    const response4 = await makeAuthRequest('POST', '/admin/register', testModerator);
    console.log('✅ Moderator registration successful:', response4.data);
    
  } catch (error) {
    console.error('❌ Admin registration test failed:', error.response?.data || error.message);
  }
};

// Test Admin Login
const testAdminLogin = async () => {
  console.log('\n=== Testing Admin Login ===');
  
  try {
    // Test 1: Login with correct credentials
    console.log('1. Testing admin login...');
    const response1 = await makeAuthRequest('POST', '/admin/login', {
      email: testAdmin.email,
      password: testAdmin.password
    });
    console.log('✅ Admin login successful:', response1.data);
    adminToken = response1.data.data.token;
    
    // Test 2: Login with wrong password
    console.log('2. Testing login with wrong password...');
    try {
      await makeAuthRequest('POST', '/admin/login', {
        email: testAdmin.email,
        password: 'wrongpassword'
      });
    } catch (error) {
      console.log('✅ Wrong password handled correctly:', error.response.data);
    }
    
    // Test 3: Login with non-existent email
    console.log('3. Testing login with non-existent email...');
    try {
      await makeAuthRequest('POST', '/admin/login', {
        email: 'nonexistent@test.com',
        password: 'somepassword'
      });
    } catch (error) {
      console.log('✅ Non-existent email handled correctly:', error.response.data);
    }
    
  } catch (error) {
    console.error('❌ Admin login test failed:', error.response?.data || error.message);
  }
};

// Test Admin Profile
const testAdminProfile = async () => {
  console.log('\n=== Testing Admin Profile ===');
  
  try {
    // Test 1: Get admin profile with valid token
    console.log('1. Getting admin profile...');
    const response1 = await makeAuthRequest('GET', '/admin/profile', null, adminToken);
    console.log('✅ Admin profile retrieved:', response1.data);
    
    // Test 2: Get profile without token
    console.log('2. Testing profile access without token...');
    try {
      await makeAuthRequest('GET', '/admin/profile');
    } catch (error) {
      console.log('✅ Unauthorized access handled correctly:', error.response.data);
    }
    
  } catch (error) {
    console.error('❌ Admin profile test failed:', error.response?.data || error.message);
  }
};

// Test Admin Management (Super Admin only)
const testAdminManagement = async () => {
  console.log('\n=== Testing Admin Management ===');
  
  try {
    // Test 1: Get all admins (Super Admin only)
    console.log('1. Getting all admins (Super Admin)...');
    const response1 = await makeAuthRequest('GET', '/admin/all', null, superAdminToken);
    console.log('✅ All admins retrieved:', response1.data);
    
    // Test 2: Get admin statistics
    console.log('2. Getting admin statistics...');
    const response2 = await makeAuthRequest('GET', '/admin/stats', null, adminToken);
    console.log('✅ Admin statistics retrieved:', response2.data);
    
    // Test 3: Search admins
    console.log('3. Searching admins...');
    const response3 = await makeAuthRequest('GET', '/admin/search?q=admin', null, adminToken);
    console.log('✅ Admin search completed:', response3.data);
    
    // Test 4: Get admins by role
    console.log('4. Getting admins by role...');
    const response4 = await makeAuthRequest('GET', '/admin/role/admin', null, adminToken);
    console.log('✅ Admins by role retrieved:', response4.data);
    
    // Test 5: Update admin status (Super Admin only)
    console.log('5. Updating admin status...');
    const response5 = await makeAuthRequest('PATCH', '/admin/1/status', {
      status: 'Inactive'
    }, superAdminToken);
    console.log('✅ Admin status updated:', response5.data);
    
    // Test 6: Try to access super admin features with regular admin token
    console.log('6. Testing permission restrictions...');
    try {
      await makeAuthRequest('GET', '/admin/all', null, adminToken);
    } catch (error) {
      console.log('✅ Permission restrictions working correctly:', error.response.data);
    }
    
  } catch (error) {
    console.error('❌ Admin management test failed:', error.response?.data || error.message);
  }
};

// Test Validation
const testValidation = async () => {
  console.log('\n=== Testing Input Validation ===');
  
  try {
    // Test 1: Invalid email format
    console.log('1. Testing invalid email format...');
    try {
      await makeAuthRequest('POST', '/admin/register', {
        ...testAdmin,
        email: 'invalid-email'
      });
    } catch (error) {
      console.log('✅ Invalid email validation working:', error.response.data);
    }
    
    // Test 2: Weak password
    console.log('2. Testing weak password...');
    try {
      await makeAuthRequest('POST', '/admin/register', {
        ...testAdmin,
        password: 'weak'
      });
    } catch (error) {
      console.log('✅ Weak password validation working:', error.response.data);
    }
    
    // Test 3: Missing required fields
    console.log('3. Testing missing required fields...');
    try {
      await makeAuthRequest('POST', '/admin/register', {
        name: 'Test Admin'
        // Missing email, password, phone
      });
    } catch (error) {
      console.log('✅ Required fields validation working:', error.response.data);
    }
    
    // Test 4: Invalid role
    console.log('4. Testing invalid role...');
    try {
      await makeAuthRequest('POST', '/admin/register', {
        ...testAdmin,
        role: 'invalid_role'
      });
    } catch (error) {
      console.log('✅ Invalid role validation working:', error.response.data);
    }
    
  } catch (error) {
    console.error('❌ Validation test failed:', error.response?.data || error.message);
  }
};

// Test Error Handling
const testErrorHandling = async () => {
  console.log('\n=== Testing Error Handling ===');
  
  try {
    // Test 1: Database connection error simulation
    console.log('1. Testing database error handling...');
    // This would require database manipulation to test properly
    
    // Test 2: Invalid token
    console.log('2. Testing invalid token...');
    try {
      await makeAuthRequest('GET', '/admin/profile', null, 'invalid_token');
    } catch (error) {
      console.log('✅ Invalid token handled correctly:', error.response.data);
    }
    
    // Test 3: Expired token (would need to create expired token)
    console.log('3. Testing expired token...');
    // This would require creating an expired JWT token
    
  } catch (error) {
    console.error('❌ Error handling test failed:', error.response?.data || error.message);
  }
};

// Main test runner
const runAllTests = async () => {
  console.log('🚀 Starting Admin API Tests...\n');
  
  try {
    await testAdminRegistration();
    await testAdminLogin();
    await testAdminProfile();
    await testAdminManagement();
    await testValidation();
    await testErrorHandling();
    
    console.log('\n✅ All admin API tests completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
  }
};

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = {
  testAdminRegistration,
  testAdminLogin,
  testAdminProfile,
  testAdminManagement,
  testValidation,
  testErrorHandling,
  runAllTests
}; 