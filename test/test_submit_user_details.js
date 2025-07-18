// Test file for submit-user-details API
// This demonstrates how to call the new API with the provided form data structure

const testData = {
  "requested_user_id": "1", // Replace with actual user ID
  "user_id": "1", // Replace with actual user ID
  "profile": {
    "dateOfBirth": "1995-10-02",
    "gender": "Male",
    "currentSalary": "1018000",
    "isAnnually": "1",
    "countryId": "1",
    "stateId": "1",
    "cityId": "1",
    "zipcode": "12345",
    "address": "123 Main Street, City, State"
  },
  "education": [
    {
      "degreeName": "b-tech",
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
      "description": "Worked on various web development projects using modern technologies",
      "countryId": "1",
      "stateId": "1",
      "cityId": "1"
    }
  ],
  "skills": [3, 6, 12, 1, 8]
};

// Example API call using fetch (for browser or Node.js with fetch)
async function testSubmitUserDetails() {
  try {
    const response = await fetch('http://localhost:3000/api/submit-user-details', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    console.log('API Response:', result);
    
    if (result.success === 1) {
      console.log('✅ User details submitted successfully!');
      console.log('📊 Summary:', result.data);
    } else {
      console.log('❌ Error:', result.error);
      if (result.details) {
        console.log('Validation details:', result.details);
      }
    }
  } catch (error) {
    console.error('❌ Network error:', error);
  }
}

// Example using curl command
console.log('\n=== CURL Command Example ===');
console.log('curl -X POST http://localhost:3000/api/submit-user-details \\');
console.log('  -H "Content-Type: application/json" \\');
console.log('  -d \'' + JSON.stringify(testData, null, 2) + '\'');

// Example using Postman/Insomnia
console.log('\n=== Postman/Insomnia Setup ===');
console.log('URL: POST http://localhost:3000/api/submit-user-details');
console.log('Headers: Content-Type: application/json');
console.log('Body (raw JSON):');
console.log(JSON.stringify(testData, null, 2));

// Run test if this file is executed directly
if (typeof window === 'undefined') {
  // Node.js environment
  console.log('\n=== Testing API ===');
  testSubmitUserDetails();
} 