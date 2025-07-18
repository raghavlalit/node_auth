// Test file for User Resume Management APIs
// This demonstrates how to call the new resume management APIs

const testData = {
  user_id: "1", // Replace with actual user ID
  resume_name: "My Professional Resume",
  resume_id: "1" // Replace with actual resume ID after creation
};

// Example API call using fetch (for browser or Node.js with fetch)
async function testAddUserResume() {
  try {
    const response = await fetch('http://localhost:4001/api/users/add-user-resume', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: testData.user_id,
        resume_name: testData.resume_name
      })
    });

    const result = await response.json();
    console.log('=== Add User Resume API Response ===');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.success === 1) {
      console.log('✅ Resume added successfully!');
      console.log('📄 Resume ID:', result.data.resume_id);
      console.log('📝 Resume Name:', result.data.resume_name);
      // Store the resume ID for other tests
      testData.resume_id = result.data.resume_id;
    } else {
      console.log('❌ Error:', result.error);
      if (result.message) console.log('Message:', result.message);
      if (result.details) {
        console.log('Validation details:', result.details);
      }
    }
  } catch (error) {
    console.error('❌ Network error:', error);
  }
}

async function testGetUserResumes() {
  try {
    const response = await fetch('http://localhost:4001/api/users/get-user-resumes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: testData.user_id
      })
    });

    const result = await response.json();
    console.log('\n=== Get User Resumes API Response ===');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.success === 1) {
      console.log('✅ User resumes retrieved successfully!');
      console.log('📊 Total Resumes:', result.data.total_count);
      console.log('👤 User:', result.data.user.name);
      
      if (result.data.resumes.length > 0) {
        console.log('\n📄 Resumes:');
        result.data.resumes.forEach((resume, index) => {
          console.log(`   ${index + 1}. ${resume.resume_name} (ID: ${resume.resume_id})`);
          console.log(`      Added: ${resume.added_date}`);
          console.log(`      Status: ${resume.status}`);
        });
      } else {
        console.log('📝 No resumes found for this user');
      }
    } else {
      console.log('❌ Error:', result.error);
      if (result.message) console.log('Message:', result.message);
    }
  } catch (error) {
    console.error('❌ Network error:', error);
  }
}

async function testUpdateUserResume() {
  try {
    const updatedName = "Updated Professional Resume";
    
    const response = await fetch('http://localhost:4001/api/users/update-user-resume', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resume_id: testData.resume_id,
        user_id: testData.user_id,
        resume_name: updatedName
      })
    });

    const result = await response.json();
    console.log('\n=== Update User Resume API Response ===');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.success === 1) {
      console.log('✅ Resume updated successfully!');
      console.log('📄 Resume ID:', result.data.resume_id);
      console.log('📝 New Name:', result.data.resume_name);
      console.log('🕒 Updated:', result.data.updated_date);
    } else {
      console.log('❌ Error:', result.error);
      if (result.message) console.log('Message:', result.message);
      if (result.details) {
        console.log('Validation details:', result.details);
      }
    }
  } catch (error) {
    console.error('❌ Network error:', error);
  }
}

async function testDeleteUserResume() {
  try {
    const response = await fetch('http://localhost:4001/api/users/delete-user-resume', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resume_id: testData.resume_id,
        user_id: testData.user_id
      })
    });

    const result = await response.json();
    console.log('\n=== Delete User Resume API Response ===');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.success === 1) {
      console.log('✅ Resume deleted successfully!');
      console.log('📄 Deleted Resume ID:', result.data.resume_id);
      console.log('🕒 Deleted At:', result.data.deleted_at);
    } else {
      console.log('❌ Error:', result.error);
      if (result.message) console.log('Message:', result.message);
    }
  } catch (error) {
    console.error('❌ Network error:', error);
  }
}

// Error testing functions
async function testAddResumeWithInvalidData() {
  try {
    const response = await fetch('http://localhost:4001/api/users/add-user-resume', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: "999", // Non-existent user
        resume_name: "Test Resume"
      })
    });

    const result = await response.json();
    console.log('\n=== Test Add Resume with Invalid User ===');
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Network error:', error);
  }
}

async function testAddResumeWithDuplicateName() {
  try {
    const response = await fetch('http://localhost:4001/api/users/add-user-resume', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: testData.user_id,
        resume_name: testData.resume_name // Same name as existing
      })
    });

    const result = await response.json();
    console.log('\n=== Test Add Resume with Duplicate Name ===');
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Network error:', error);
  }
}

async function testUpdateResumeWithInvalidData() {
  try {
    const response = await fetch('http://localhost:4001/api/users/update-user-resume', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resume_id: "999", // Non-existent resume
        user_id: testData.user_id,
        resume_name: "Updated Resume"
      })
    });

    const result = await response.json();
    console.log('\n=== Test Update Non-existent Resume ===');
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Network error:', error);
  }
}

// Example using curl commands
console.log('\n=== CURL Command Examples ===');

console.log('\n1. Add User Resume:');
console.log('curl -X POST http://localhost:4001/api/users/add-user-resume \\');
console.log('  -H "Content-Type: application/json" \\');
console.log('  -d \'' + JSON.stringify({
  user_id: testData.user_id,
  resume_name: testData.resume_name
}, null, 2) + '\'');

console.log('\n2. Get User Resumes:');
console.log('curl -X POST http://localhost:4001/api/users/get-user-resumes \\');
console.log('  -H "Content-Type: application/json" \\');
console.log('  -d \'' + JSON.stringify({
  user_id: testData.user_id
}, null, 2) + '\'');

console.log('\n3. Update User Resume:');
console.log('curl -X POST http://localhost:4001/api/users/update-user-resume \\');
console.log('  -H "Content-Type: application/json" \\');
console.log('  -d \'' + JSON.stringify({
  resume_id: testData.resume_id,
  user_id: testData.user_id,
  resume_name: "Updated Professional Resume"
}, null, 2) + '\'');

console.log('\n4. Delete User Resume:');
console.log('curl -X POST http://localhost:4001/api/users/delete-user-resume \\');
console.log('  -H "Content-Type: application/json" \\');
console.log('  -d \'' + JSON.stringify({
  resume_id: testData.resume_id,
  user_id: testData.user_id
}, null, 2) + '\'');

// Example using Postman/Insomnia
console.log('\n=== Postman/Insomnia Setup ===');
console.log('Base URL: http://localhost:4001/api/users');
console.log('Headers: Content-Type: application/json');

console.log('\nEndpoints:');
console.log('1. POST /add-user-resume');
console.log('2. POST /get-user-resumes');
console.log('3. POST /update-user-resume');
console.log('4. POST /delete-user-resume');

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  // Node.js environment
  console.log('\n=== Testing User Resume Management APIs ===');
  
  // Run main tests
  await testAddUserResume();
  await testGetUserResumes();
  await testUpdateUserResume();
  await testDeleteUserResume();
  
  // Run error tests
  await testAddResumeWithInvalidData();
  await testAddResumeWithDuplicateName();
  await testUpdateResumeWithInvalidData();
}

// Expected Response Structures:

/*
1. Add User Resume Success Response:
{
  "success": 1,
  "message": "Resume added successfully",
  "data": {
    "resume_id": "1",
    "resume_name": "My Professional Resume",
    "user_id": "1",
    "added_date": "2024-01-15 10:30:00",
    "status": "Active"
  }
}

2. Get User Resumes Success Response:
{
  "success": 1,
  "message": "User resumes retrieved successfully",
  "data": {
    "resumes": [
      {
        "resume_id": "1",
        "user_id": "1",
        "resume_name": "My Professional Resume",
        "added_date": "2024-01-15 10:30:00",
        "updated_date": null,
        "status": "Active"
      }
    ],
    "total_count": 1,
    "user": {
      "user_id": "1",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}

3. Update User Resume Success Response:
{
  "success": 1,
  "message": "Resume updated successfully",
  "data": {
    "resume_id": "1",
    "resume_name": "Updated Professional Resume",
    "user_id": "1",
    "updated_date": "2024-01-15 10:35:00",
    "status": "Active"
  }
}

4. Delete User Resume Success Response:
{
  "success": 1,
  "message": "Resume deleted successfully",
  "data": {
    "resume_id": "1",
    "deleted_at": "2024-01-15 10:40:00"
  }
}
*/ 