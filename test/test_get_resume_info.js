// Test file for get-resume-info API
// This demonstrates how to call the new API to retrieve comprehensive resume data

const testData = {
  "requested_user_id": "1" // Replace with actual user ID
};

// Example API call using fetch (for browser or Node.js with fetch)
async function testGetResumeInfo() {
  try {
    const response = await fetch('http://localhost:4001/api/users/get-resume-info', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    console.log('API Response:', JSON.stringify(result, null, 2));
    
    if (result.success === 1) {
      console.log('✅ Resume information retrieved successfully!');
      console.log('📊 Resume Summary:', result.data.summary);
      console.log('📈 Completeness:', result.data.completeness.totalPercentage + '%');
      
      // Display user information
      if (result.data.resume.user) {
        console.log('\n👤 User Information:');
        console.log(`   Name: ${result.data.resume.user.name}`);
        console.log(`   Email: ${result.data.resume.user.email}`);
        console.log(`   Phone: ${result.data.resume.user.phone}`);
        console.log(`   Status: ${result.data.resume.user.status}`);
      }
      
      // Display profile information
      if (result.data.resume.profile) {
        console.log('\n📋 Profile Information:');
        console.log(`   Date of Birth: ${result.data.resume.profile.dateOfBirth}`);
        console.log(`   Gender: ${result.data.resume.profile.gender}`);
        console.log(`   Current Salary: ${result.data.resume.profile.currentSalary}`);
        console.log(`   Address: ${result.data.resume.profile.address}`);
        console.log(`   Location: ${result.data.resume.profile.city}, ${result.data.resume.profile.state}, ${result.data.resume.profile.country}`);
      }
      
      // Display skills
      if (result.data.resume.skills.length > 0) {
        console.log('\n🛠️ Skills:');
        result.data.resume.skills.forEach((skill, index) => {
          console.log(`   ${index + 1}. ${skill.skillName} (${skill.skillCode})`);
        });
      }
      
      // Display education
      if (result.data.resume.education.length > 0) {
        console.log('\n🎓 Education:');
        result.data.resume.education.forEach((edu, index) => {
          console.log(`   ${index + 1}. ${edu.degreeName} from ${edu.instituteName}`);
          console.log(`      Period: ${edu.startDate} to ${edu.endDate}`);
          if (edu.percentage) console.log(`      Percentage: ${edu.percentage}%`);
          if (edu.cgpa) console.log(`      CGPA: ${edu.cgpa}`);
        });
      }
      
      // Display experience
      if (result.data.resume.experience.length > 0) {
        console.log('\n💼 Experience:');
        result.data.resume.experience.forEach((exp, index) => {
          console.log(`   ${index + 1}. ${exp.jobTitle} at ${exp.companyName}`);
          console.log(`      Period: ${exp.startDate} to ${exp.endDate || 'Present'}`);
          console.log(`      Location: ${exp.city}, ${exp.state}, ${exp.country}`);
          if (exp.description) console.log(`      Description: ${exp.description}`);
          if (exp.isCurrentJob) console.log(`      Status: Current Job`);
        });
      }
      
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

// Test with invalid user ID
async function testGetResumeInfoInvalidUser() {
  try {
    const invalidData = {
      "requested_user_id": "999" // Non-existent user ID
    };
    
    const response = await fetch('http://localhost:4001/api/users/get-resume-info', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidData)
    });

    const result = await response.json();
    console.log('\n=== Testing with Invalid User ID ===');
    console.log('Response:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Network error:', error);
  }
}

// Test with missing user ID
async function testGetResumeInfoMissingUserId() {
  try {
    const invalidData = {
      // Missing requested_user_id
    };
    
    const response = await fetch('http://localhost:4001/api/users/get-resume-info', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidData)
    });

    const result = await response.json();
    console.log('\n=== Testing with Missing User ID ===');
    console.log('Response:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Network error:', error);
  }
}

// Example using curl command
console.log('\n=== CURL Command Example ===');
console.log('curl -X POST http://localhost:4001/api/users/get-resume-info \\');
console.log('  -H "Content-Type: application/json" \\');
console.log('  -d \'' + JSON.stringify(testData, null, 2) + '\'');

// Example using Postman/Insomnia
console.log('\n=== Postman/Insomnia Setup ===');
console.log('URL: POST http://localhost:4001/api/users/get-resume-info');
console.log('Headers: Content-Type: application/json');
console.log('Body (raw JSON):');
console.log(JSON.stringify(testData, null, 2));

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  // Node.js environment
  console.log('\n=== Testing Resume Info API ===');
  
  // Run main test
  await testGetResumeInfo();
  
  // Run error tests
  await testGetResumeInfoInvalidUser();
  await testGetResumeInfoMissingUserId();
}

// Expected Response Structure:
/*
{
  "success": 1,
  "message": "Resume information retrieved successfully",
  "data": {
    "resume": {
      "user": {
        "email": "user@example.com",
        "name": "John Doe",
        "phone": "1234567890",
        "status": "Active"
      },
      "profile": {
        "dateOfBirth": "1995-10-02",
        "gender": "Male",
        "currentSalary": "1018000",
        "zipcode": "12345",
        "address": "123 Main Street",
        "country": "United States",
        "state": "California",
        "city": "San Francisco"
      },
      "skills": [
        {
          "skillName": "JavaScript",
          "skillCode": "JS"
        },
        {
          "skillName": "Node.js",
          "skillCode": "NODE"
        }
      ],
      "education": [
        {
          "degreeName": "Bachelor of Technology",
          "instituteName": "DPGITM",
          "startDate": "2013-08-01",
          "endDate": "2017-05-31",
          "percentage": "85",
          "cgpa": "8.5"
        }
      ],
      "experience": [
        {
          "companyName": "Hidden brains infotech",
          "jobTitle": "Senior software engineer",
          "isCurrentJob": "1",
          "startDate": "2020-01-01",
          "endDate": "2023-12-31",
          "description": "Worked on various web development projects",
          "country": "United States",
          "state": "California",
          "city": "San Francisco"
        }
      ]
    },
    "completeness": {
      "profile": true,
      "skills": true,
      "education": true,
      "experience": true,
      "totalPercentage": 100
    },
    "summary": {
      "totalSkills": 2,
      "totalEducation": 1,
      "totalExperience": 1,
      "hasProfile": true
    }
  }
}
*/ 