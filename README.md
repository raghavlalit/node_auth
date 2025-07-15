# Node.js Authentication API

A secure, optimized, and production-ready Node.js authentication API with comprehensive user management features.

## 🚀 Features

- **🔐 Secure Authentication** - JWT-based authentication with enhanced security
- **👥 User Management** - Complete user profile, education, experience, and skills management
- **🛡️ Security** - Helmet, CORS, rate limiting, input validation, and SQL injection protection
- **📊 Performance** - Compression, connection pooling, and optimized database queries
- **🔍 Monitoring** - Health checks, logging, and error tracking
- **📝 Documentation** - Comprehensive API documentation and examples

## 📋 Prerequisites

- Node.js >= 16.0.0
- MySQL >= 8.0
- npm >= 8.0.0

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd node_auth
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment file
   cp example.env .env
   
   # Edit .env with your database credentials
   nano .env
   ```

4. **Database Setup**
   ```bash
   # Import the database schema
   mysql -u your_username -p your_database < node_auth.sql
   ```

5. **Start the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 🔧 Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
API_PORT=4001
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=node_auth
DB_DEBUG=false

# JWT Configuration
TOKEN_KEY=your_secret_key_here

# CORS Configuration (Production)
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
```

## 📚 API Documentation

### Authentication Endpoints

#### Login
```http
POST /api/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Register
```http
POST /api/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "phone": "1234567890",
  "status": "Active"
}
```

### User Management Endpoints

#### Submit User Details (Complete Profile)
```http
POST /api/users/submit-user-details
Authorization: Bearer <token>
Content-Type: application/json

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
    "address": "123 Main Street"
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
      "description": "Worked on various web development projects",
      "countryId": "1",
      "stateId": "1",
      "cityId": "1"
    }
  ],
  "skills": [3, 6, 12, 1, 8]
}
```

#### Get User List
```http
GET /api/users/user
Authorization: Bearer <token>
```

#### Get User Info
```http
POST /api/users/get-user-info
Authorization: Bearer <token>
Content-Type: application/json

{
  "requested_user_id": "1",
  "user_id": "1"
}
```

### Health Check

#### System Health
```http
GET /health
```

Returns system status including database health, uptime, and performance metrics.

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt with 12 salt rounds
- **Input Validation** - Comprehensive request validation
- **SQL Injection Protection** - Parameterized queries and input sanitization
- **Rate Limiting** - Protection against brute force attacks
- **CORS Protection** - Configurable cross-origin resource sharing
- **Helmet Security** - HTTP headers for security
- **Input Sanitization** - Automatic data cleaning and validation

## 📊 Performance Features

- **Compression** - Gzip compression for responses
- **Connection Pooling** - Optimized database connections
- **Caching Headers** - Static file caching
- **Request Logging** - Performance monitoring
- **Error Handling** - Comprehensive error management

## 🛠️ Development

### Available Scripts

```bash
# Start development server
npm run dev

# Start production server
npm start

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check health
npm run health

# View documentation
npm run docs
```

### Project Structure

```
node_auth/
├── config/                 # Configuration files
│   ├── db.connection.js   # Database connection
│   └── index.js          # App configuration
├── controller/            # Business logic
│   ├── authService.js    # Authentication logic
│   └── userService.js    # User management logic
├── documentation/         # API documentation
│   ├── API_DOCUMENTATION.md
│   ├── AUTH_MIDDLEWARE_OPTIMIZATION.md
│   ├── DB_CONNECTION_OPTIMIZATION.md
│   └── LOGIN_API_OPTIMIZATION.md
├── libraries/            # Utility functions
│   ├── api_input_validator.js
│   └── common.js
├── middleware/           # Express middleware
│   ├── auth.js          # Authentication middleware
│   ├── error_handler.js # Global error handler
│   └── path_handler.js  # 404 handler
├── model/               # Database models
│   └── user.js
├── router/              # Route definitions
│   ├── index.js
│   └── user.routes.js
├── app.js               # Main application file
├── package.json         # Dependencies and scripts
└── README.md           # This file
```

## 🧪 Testing

### Manual Testing

Use the provided test file:
```bash
node test_submit_user_details.js
```

### API Testing with cURL

```bash
# Test login
curl -X POST http://localhost:4001/api/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'

# Test health check
curl http://localhost:4001/health
```

## 📈 Monitoring

### Health Check Endpoint

The `/health` endpoint provides:
- Database connection status
- System uptime
- Memory usage
- Environment information
- Database statistics

### Logging

The application logs:
- Request/response details
- Authentication events
- Database operations
- Error details
- Performance metrics

## 🔧 Configuration

### Database Configuration

Environment-specific database settings:
- **Development**: 2-10 connections, 30s timeouts
- **Production**: 5-20 connections, 60s timeouts
- **Test**: 1-5 connections, 10s timeouts

### Security Configuration

- Rate limiting: 100 requests per 15 minutes per IP
- CORS: Configurable origins
- JWT: 24-hour expiration
- Password: Minimum 8 characters with complexity requirements

## 🚀 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure database SSL certificates
- [ ] Set secure `TOKEN_KEY`
- [ ] Configure `ALLOWED_ORIGINS`
- [ ] Enable database connection pooling
- [ ] Set up monitoring and logging
- [ ] Configure reverse proxy (nginx)
- [ ] Set up SSL certificates

### Docker Deployment

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 4001
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Check the documentation in `/documentation`
- Review the API examples
- Check the health endpoint for system status

## 🔄 Changelog

### v1.0.0
- Initial release
- Complete authentication system
- User management features
- Security optimizations
- Performance improvements
- Comprehensive documentation
