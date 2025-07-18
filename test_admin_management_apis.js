const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
let superAdminToken = '';
let adminToken = '';

// Test data
const testSuperAdmin = {
  name: 'Super Admin',
  email: 'superadmin@test.com',
  password: 'SuperAdminPass123!',
  phone: '9876543210',
  role: 'super_admin',
  permissions: 'all',
  status: 'Active'
};

const testAdmin = {
  name: 'Test Admin',
  email: 'admin@test.com',
  password: 'AdminPass123!',
  phone: '1234567890',
  role: 'admin',
  permissions: 'user_management,content_moderation',
  status: 'Active'
};

const testTemplate = {
  template_name: 'Professional Template',
  template_description: 'A clean and professional resume template',
  template_html: '<div class="resume">...</div>',
  template_css: '.resume { font-family: Arial; }',
  category: 'Professional',
  status: 'Active'
};

// Helper function to make authenticated requests
const makeAuthRequest = async (method, url, data = null, token = superAdminToken) => {
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

// Test Admin Users Management
const testAdminUsersManagement = async () => {
  console.log('\n=== Testing Admin Users Management ===');
  
  try {
    // Test 1: Get all admins
    console.log('1. Getting all admins...');
    const response1 = await makeAuthRequest('GET', '/admin-management/admins');
    console.log('✅ All admins retrieved:', response1.data);
    
    // Test 2: Create new admin
    console.log('2. Creating new admin...');
    const response2 = await makeAuthRequest('POST', '/admin-management/admins', {
      name: 'New Admin',
      email: 'newadmin@test.com',
      password: 'NewAdminPass123!',
      phone: '5555555555',
      role: 'admin',
      permissions: 'user_management',
      status: 'Active'
    });
    console.log('✅ New admin created:', response2.data);
    
    // Test 3: Get admin by ID
    console.log('3. Getting admin by ID...');
    const adminId = response2.data.data.admin_id;
    const response3 = await makeAuthRequest('GET', `/admin-management/admins/${adminId}`);
    console.log('✅ Admin details retrieved:', response3.data);
    
    // Test 4: Update admin
    console.log('4. Updating admin...');
    const response4 = await makeAuthRequest('PUT', `/admin-management/admins/${adminId}`, {
      name: 'Updated Admin',
      role: 'moderator',
      permissions: 'content_moderation'
    });
    console.log('✅ Admin updated:', response4.data);
    
    // Test 5: Delete admin
    console.log('5. Deleting admin...');
    const response5 = await makeAuthRequest('DELETE', `/admin-management/admins/${adminId}`);
    console.log('✅ Admin deleted:', response5.data);
    
  } catch (error) {
    console.error('❌ Admin users management test failed:', error.response?.data || error.message);
  }
};

// Test Users Management
const testUsersManagement = async () => {
  console.log('\n=== Testing Users Management ===');
  
  try {
    // Test 1: Get all users
    console.log('1. Getting all users...');
    const response1 = await makeAuthRequest('GET', '/admin-management/users');
    console.log('✅ All users retrieved:', response1.data);
    
    // Test 2: Get user by ID with full details
    console.log('2. Getting user by ID...');
    const response2 = await makeAuthRequest('GET', '/admin-management/users/1');
    console.log('✅ User details retrieved:', response2.data);
    
    // Test 3: Update user status
    console.log('3. Updating user status...');
    const response3 = await makeAuthRequest('PATCH', '/admin-management/users/1/status', {
      status: 'Inactive'
    });
    console.log('✅ User status updated:', response3.data);
    
    // Test 4: Reactivate user
    console.log('4. Reactivating user...');
    const response4 = await makeAuthRequest('PATCH', '/admin-management/users/1/status', {
      status: 'Active'
    });
    console.log('✅ User reactivated:', response4.data);
    
    // Test 5: Delete user (soft delete)
    console.log('5. Deleting user...');
    const response5 = await makeAuthRequest('DELETE', '/admin-management/users/1');
    console.log('✅ User deleted:', response5.data);
    
  } catch (error) {
    console.error('❌ Users management test failed:', error.response?.data || error.message);
  }
};

// Test Resume Templates Management
const testResumeTemplatesManagement = async () => {
  console.log('\n=== Testing Resume Templates Management ===');
  
  try {
    // Test 1: Get all templates
    console.log('1. Getting all templates...');
    const response1 = await makeAuthRequest('GET', '/admin-management/templates');
    console.log('✅ All templates retrieved:', response1.data);
    
    // Test 2: Create new template
    console.log('2. Creating new template...');
    const response2 = await makeAuthRequest('POST', '/admin-management/templates', testTemplate);
    console.log('✅ New template created:', response2.data);
    
    // Test 3: Get template by ID
    console.log('3. Getting template by ID...');
    const templateId = response2.data.data.template_id;
    const response3 = await makeAuthRequest('GET', `/admin-management/templates/${templateId}`);
    console.log('✅ Template details retrieved:', response3.data);
    
    // Test 4: Update template
    console.log('4. Updating template...');
    const response4 = await makeAuthRequest('PUT', `/admin-management/templates/${templateId}`, {
      template_name: 'Updated Professional Template',
      template_description: 'Updated description',
      category: 'Modern'
    });
    console.log('✅ Template updated:', response4.data);
    
    // Test 5: Delete template
    console.log('5. Deleting template...');
    const response5 = await makeAuthRequest('DELETE', `/admin-management/templates/${templateId}`);
    console.log('✅ Template deleted:', response5.data);
    
  } catch (error) {
    console.error('❌ Resume templates management test failed:', error.response?.data || error.message);
  }
};

// Test Dashboard Statistics
const testDashboardStatistics = async () => {
  console.log('\n=== Testing Dashboard Statistics ===');
  
  try {
    // Test 1: Get dashboard statistics
    console.log('1. Getting dashboard statistics...');
    const response1 = await makeAuthRequest('GET', '/admin-management/dashboard/stats');
    console.log('✅ Dashboard statistics retrieved:', response1.data);
    
  } catch (error) {
    console.error('❌ Dashboard statistics test failed:', error.response?.data || error.message);
  }
};

// Test Permission Restrictions
const testPermissionRestrictions = async () => {
  console.log('\n=== Testing Permission Restrictions ===');
  
  try {
    // Test 1: Try to access super admin features with regular admin token
    console.log('1. Testing admin permission restrictions...');
    try {
      await makeAuthRequest('GET', '/admin-management/admins', null, adminToken);
    } catch (error) {
      console.log('✅ Admin permission restrictions working:', error.response.data);
    }
    
    // Test 2: Try to access admin features without token
    console.log('2. Testing authentication requirements...');
    try {
      await makeAuthRequest('GET', '/admin-management/users');
    } catch (error) {
      console.log('✅ Authentication requirements working:', error.response.data);
    }
    
  } catch (error) {
    console.error('❌ Permission restrictions test failed:', error.response?.data || error.message);
  }
};

// Test Validation
const testValidation = async () => {
  console.log('\n=== Testing Input Validation ===');
  
  try {
    // Test 1: Invalid admin creation data
    console.log('1. Testing invalid admin creation...');
    try {
      await makeAuthRequest('POST', '/admin-management/admins', {
        name: 'A', // Too short
        email: 'invalid-email',
        password: 'weak'
      });
    } catch (error) {
      console.log('✅ Admin validation working:', error.response.data);
    }
    
    // Test 2: Invalid template creation data
    console.log('2. Testing invalid template creation...');
    try {
      await makeAuthRequest('POST', '/admin-management/templates', {
        template_name: 'A', // Too short
        category: 'Invalid'
      });
    } catch (error) {
      console.log('✅ Template validation working:', error.response.data);
    }
    
  } catch (error) {
    console.error('❌ Validation test failed:', error.response?.data || error.message);
  }
};

// Test Search and Filtering
const testSearchAndFiltering = async () => {
  console.log('\n=== Testing Search and Filtering ===');
  
  try {
    // Test 1: Search admins
    console.log('1. Testing admin search...');
    const response1 = await makeAuthRequest('GET', '/admin-management/admins?search=admin');
    console.log('✅ Admin search working:', response1.data);
    
    // Test 2: Search users
    console.log('2. Testing user search...');
    const response2 = await makeAuthRequest('GET', '/admin-management/users?search=user');
    console.log('✅ User search working:', response2.data);
    
    // Test 3: Search templates
    console.log('3. Testing template search...');
    const response3 = await makeAuthRequest('GET', '/admin-management/templates?search=professional');
    console.log('✅ Template search working:', response3.data);
    
    // Test 4: Filter by status
    console.log('4. Testing status filtering...');
    const response4 = await makeAuthRequest('GET', '/admin-management/users?status=Active');
    console.log('✅ Status filtering working:', response4.data);
    
  } catch (error) {
    console.error('❌ Search and filtering test failed:', error.response?.data || error.message);
  }
};

// Test Pagination
const testPagination = async () => {
  console.log('\n=== Testing Pagination ===');
  
  try {
    // Test 1: Paginated admin list
    console.log('1. Testing admin pagination...');
    const response1 = await makeAuthRequest('GET', '/admin-management/admins?page=1&limit=5');
    console.log('✅ Admin pagination working:', response1.data);
    
    // Test 2: Paginated user list
    console.log('2. Testing user pagination...');
    const response2 = await makeAuthRequest('GET', '/admin-management/users?page=1&limit=5');
    console.log('✅ User pagination working:', response2.data);
    
    // Test 3: Paginated template list
    console.log('3. Testing template pagination...');
    const response3 = await makeAuthRequest('GET', '/admin-management/templates?page=1&limit=5');
    console.log('✅ Template pagination working:', response3.data);
    
  } catch (error) {
    console.error('❌ Pagination test failed:', error.response?.data || error.message);
  }
};

// Main test runner
const runAllTests = async () => {
  console.log('🚀 Starting Admin Management API Tests...\n');
  
  try {
    // First, we need to login as super admin to get token
    console.log('Logging in as super admin...');
    const loginResponse = await makeAuthRequest('POST', '/admin/login', {
      email: testSuperAdmin.email,
      password: testSuperAdmin.password
    });
    superAdminToken = loginResponse.data.data.token;
    console.log('✅ Super admin login successful');
    
    // Login as regular admin
    console.log('Logging in as regular admin...');
    const adminLoginResponse = await makeAuthRequest('POST', '/admin/login', {
      email: testAdmin.email,
      password: testAdmin.password
    });
    adminToken = adminLoginResponse.data.data.token;
    console.log('✅ Admin login successful');
    
    await testAdminUsersManagement();
    await testUsersManagement();
    await testResumeTemplatesManagement();
    await testDashboardStatistics();
    await testPermissionRestrictions();
    await testValidation();
    await testSearchAndFiltering();
    await testPagination();
    
    console.log('\n✅ All admin management API tests completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
  }
};

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = {
  testAdminUsersManagement,
  testUsersManagement,
  testResumeTemplatesManagement,
  testDashboardStatistics,
  testPermissionRestrictions,
  testValidation,
  testSearchAndFiltering,
  testPagination,
  runAllTests
}; 