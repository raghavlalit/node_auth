# API Documentation

## Overview
This document provides comprehensive documentation for all API endpoints in the Node.js Authentication API.

## Base URL
```
http://localhost:4001/api
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 🔐 Authentication Endpoints

### 1. User Login
**Endpoint:** `POST /login`

**Description:** Authenticate user and receive JWT token

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (Success - 200):**
```json
{
  "success": 1,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "user_id": "1",
      "name": "John Doe",
      "email": "user@example.com",
      "phone": "1234567890",
      "status": "Active"
    }
  }
}
```

**Response (Error - 400):**
```json
{
  "success": 0,
  "error": "INVALID_CREDENTIALS",
  "message": "Invalid email or password"
}
```

### 2. User Registration
**Endpoint:** `POST /register`

**Description:** Register a new user account

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "phone": "1234567890",
  "status": "Active"
}
```

**Response (Success - 201):**
```json
{
  "success": 1,
  "message": "User registered successfully",
  "data": {
    "user_id": "2",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

## 👥 User Management Endpoints

### 3. Get User List
**Endpoint:** `GET /users/user`

**Description:** Retrieve list of all users

**Headers:**
```
Authorization: Bearer <token>
```

**Response (Success - 200):**
```json
{
  "success": 1,
  "message": "User details found",
  "data": [
    {
      "user_id": "1",
      "name": "John Doe",
      "email": "john@example.com"
    }
  ]
}
```

### 4. Update User Profile
**Endpoint:** `POST /users/update-user-profile`

**Description:** Update user profile information

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "requested_user_id": "1",
  "user_id": "1",
  "date_of_birth": "1995-10-02",
  "gender": "Male",
  "current_salary": "1018000",
  "is_annual_salary": "1",
  "country_id": "1",
  "state_id": "1",
  "city_id": "1",
  "zipcode": "12345",
  "address": "123 Main Street, City, State"
}
```

**Response (Success - 201):**
```json
{
  "success": 1,
  "message": "User profile updated successfully...!"
}
```

### 5. Update User Skills
**Endpoint:** `POST /users/update-user-skills`

**Description:** Update user skills

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "requested_user_id": "1",
  "user_id": "1",
  "skills": "3,6,12,1,8"
}
```

**Response (Success - 201):**
```json
{
  "success": 1,
  "message": "User skills updated successfully...!"
}
```

### 6. Update User Education
**Endpoint:** `POST /users/update-user-education`

**Description:** Update user education details

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "requested_user_id": "1",
  "user_id": "1",
  "education_details": [
    {
      "degree": "Bachelor of Technology",
      "institute": "DPGITM",
      "start_date": "2013-08-01",
      "end_date": "2017-05-31",
      "percentage": "85",
      "cgpa": "8.5"
    }
  ]
}
```

**Response (Success - 201):**
```json
{
  "success": 1,
  "message": "User Education updated successfully...!"
}
```

### 7. Update User Experience
**Endpoint:** `POST /users/update-user-experience`

**Description:** Update user work experience

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "requested_user_id": "1",
  "user_id": "1",
  "experience_details": [
    {
      "company": "Hidden brains infotech",
      "job_title": "Senior software engineer",
      "is_current_job": "1",
      "start_date": "2020-01-01",
      "end_date": "2023-12-31",
      "description": "Worked on various web development projects",
      "country_id": "1",
      "state_id": "1",
      "city_id": "1"
    }
  ]
}
```

**Response (Success - 201):**
```json
{
  "success": 1,
  "message": "User Experience updated successfully...!"
}
```

### 8. Get User Info
**Endpoint:** `POST /users/get-user-info`

**Description:** Get user profile information

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "requested_user_id": "1",
  "user_id": "1"
}
```

**Response (Success - 200):**
```json
{
  "success": 1,
  "message": "User profile details found successfully...!",
  "data": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "date_of_birth": "1995-10-02",
    "gender": "Male",
    "current_salary": "1018000",
    "zipcode": "12345",
    "address": "123 Main Street",
    "country": "United States",
    "state": "California",
    "city": "San Francisco",
    "skills": [
      {
        "skill": "JavaScript",
        "skill_code": "JS"
      }
    ],
    "education": [
      {
        "degree": "Bachelor of Technology",
        "institute": "DPGITM",
        "start_date": "2013-08-01",
        "end_date": "2017-05-31",
        "percentage": "85",
        "cgpa": "8.5"
      }
    ],
    "experience": [
      {
        "company_name": "Hidden brains infotech",
        "job_title": "Senior software engineer",
        "is_current_job": "1",
        "start_date": "2020-01-01",
        "end_date": "2023-12-31",
        "description": "Worked on various web development projects",
        "country": "United States",
        "state": "California",
        "city": "San Francisco"
      }
    ]
  }
}
```

### 9. Submit User Details (Complete Profile)
**Endpoint:** `POST /users/submit-user-details`

**Description:** Submit complete user profile, education, experience, and skills in one request

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "requested_user_id": "1",
  "user_id": "1",
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
      "countryId": "1",
      "stateId": "1",
      "cityId": "1"
    }
  ],
  "skills": [3, 6, 12, 1, 8]
}
```

**Response (Success - 201):**
```json
{
  "success": 1,
  "message": "User details submitted successfully!",
  "data": {
    "user_id": "1",
    "profile_updated": true,
    "skills_count": 5,
    "education_count": 1,
    "experience_count": 1
  }
}
```

### 10. Get Resume Info
**Endpoint:** `POST /users/get-resume-info`

**Description:** Get comprehensive resume information including user details, profile, education, experience, and skills with completeness analysis

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "requested_user_id": "1"
}
```

**Response (Success - 200):**
```json
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
```

**Response (Error - 404):**
```json
{
  "success": 0,
  "error": "User not found",
  "message": "The requested user does not exist"
}
```

---

## 🔍 Health Check Endpoints

### 11. System Health
**Endpoint:** `GET /health`

**Description:** Check system health and database connectivity

**Response (Success - 200):**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "environment": "development",
  "database": {
    "status": "healthy",
    "timestamp": "2024-01-15T10:30:00.000Z"
  },
  "databaseStats": {
    "totalConnections": 5,
    "usedConnections": 2,
    "freeConnections": 3,
    "pendingConnections": 0,
    "timestamp": "2024-01-15T10:30:00.000Z"
  },
  "memory": {
    "rss": 52428800,
    "heapTotal": 41943040,
    "heapUsed": 20971520,
    "external": 1048576
  },
  "version": "1.0.0"
}
```

---

## 📊 Error Responses

### Common Error Format
```json
{
  "success": 0,
  "error": "ERROR_CODE",
  "message": "Human readable error message",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/endpoint",
  "method": "POST"
}
```

### Error Codes
- `VALIDATION_ERROR` - Input validation failed
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `DUPLICATE_ENTRY` - Duplicate data found
- `DB_CONNECTION_ERROR` - Database connection failed
- `INTERNAL_ERROR` - Server error

### Validation Error Response
```json
{
  "success": 0,
  "error": "VALIDATION_ERROR",
  "message": "Invalid input data",
  "details": [
    {
      "field": "email",
      "message": "\"email\" must be a valid email",
      "type": "string.email"
    }
  ]
}
```

---

## 🔧 Testing

### Using cURL
```bash
# Test login
curl -X POST http://localhost:4001/api/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'

# Test get resume info
curl -X POST http://localhost:4001/api/users/get-resume-info \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"requested_user_id": "1"}'
```

### Using Postman/Insomnia
1. Set base URL: `http://localhost:4001/api`
2. Add headers: `Content-Type: application/json`
3. For authenticated endpoints, add: `Authorization: Bearer <token>`
4. Use the request body examples above

---

## 📝 Notes

1. **Authentication**: Most endpoints require JWT token in Authorization header
2. **Validation**: All inputs are validated using Joi schema
3. **Error Handling**: Comprehensive error handling with detailed messages
4. **Rate Limiting**: 100 requests per 15 minutes per IP
5. **Compression**: All responses are gzipped for better performance
6. **Health Checks**: Use `/health` endpoint to monitor system status

---

## 🚀 Performance Tips

1. **Use Compression**: Responses are automatically compressed
2. **Batch Operations**: Use `/submit-user-details` for bulk updates
3. **Health Monitoring**: Regularly check `/health` endpoint
4. **Error Handling**: Implement proper error handling in your client
5. **Caching**: Consider caching resume data on client side

---

## 🔒 Security Considerations

1. **HTTPS**: Always use HTTPS in production
2. **Token Storage**: Store JWT tokens securely
3. **Input Validation**: All inputs are validated server-side
4. **Rate Limiting**: Implement client-side rate limiting
5. **Error Messages**: Don't expose sensitive information in errors 