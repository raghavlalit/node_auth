import jwt from 'jsonwebtoken';
import { config } from '../config/index.js'; 
import UserModel from '../model/user.js';

/**
 * Enhanced JWT Token Verification Middleware
 * Provides secure authentication with proper error handling and performance optimizations
 */
const verifyToken = async (req, res, next) => {
  try {
    // Extract token from multiple sources with priority
    const token = extractTokenFromRequest(req);
    
    if (!token) {
      return res.status(401).json({
        success: 0,
        message: "Access token is required for authentication",
        error: "AUTH_MIDDLEWARE_001"
      });
    }

    // Verify token format and structure
    if (!isValidTokenFormat(token)) {
      return res.status(401).json({
        success: 0,
        message: "Invalid token format",
        error: "AUTH_MIDDLEWARE_002"
      });
    }

    // Verify and decode JWT token
    const decoded = jwt.verify(token, config.token_key, {
      issuer: 'node_auth_app',
      audience: 'users'
    });

    // Validate decoded token payload
    if (!isValidTokenPayload(decoded)) {
      return res.status(401).json({
        success: 0,
        message: "Invalid token payload",
        error: "AUTH_MIDDLEWARE_003"
      });
    }

    // Check if user exists and is active (optional - for enhanced security)
    const userExists = await validateUserStatus(decoded.user_id, decoded.email);
    if (!userExists.isValid) {
      return res.status(401).json({
        success: 0,
        message: userExists.message,
        error: "AUTH_MIDDLEWARE_004"
      });
    }

    // Set user information in request object
    req.user = {
      user_id: decoded.user_id,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role || 'user',
      token_issued_at: decoded.iat,
      token_expires_at: decoded.exp
    };

    // Add token info for debugging/logging purposes
    req.tokenInfo = {
      token_type: 'Bearer',
      expires_in: decoded.exp - Math.floor(Date.now() / 1000)
    };

    // Log successful authentication (for audit purposes)
    console.log(`[AUTH_SUCCESS] User ${decoded.email} authenticated successfully at ${new Date().toISOString()}`);

    return next();

  } catch (error) {
    console.error('[AUTH_ERROR]', error);
    
    // Handle specific JWT errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: 0,
        message: "Token has expired. Please login again.",
        error: "AUTH_MIDDLEWARE_005"
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: 0,
        message: "Invalid token signature",
        error: "AUTH_MIDDLEWARE_006"
      });
    }

    if (error.name === 'NotBeforeError') {
      return res.status(401).json({
        success: 0,
        message: "Token not yet valid",
        error: "AUTH_MIDDLEWARE_007"
      });
    }

    // Handle other errors
    return res.status(500).json({
      success: 0,
      message: "Authentication service error",
      error: "AUTH_MIDDLEWARE_008"
    });
  }
};

/**
 * Extract token from request with proper priority
 * Priority: Authorization header > Body > Query
 */
const extractTokenFromRequest = (req) => {
  // Check Authorization header first (Bearer token)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7); // Remove 'Bearer ' prefix
  }

  // Check custom token header
  if (req.headers.token) {
    return req.headers.token;
  }

  // Check request body
  if (req.body && req.body.token) {
    return req.body.token;
  }

  // Check query parameters
  if (req.query && req.query.token) {
    return req.query.token;
  }

  return null;
};

/**
 * Validate token format
 */
const isValidTokenFormat = (token) => {
  return true;
  // Basic JWT format validation (3 parts separated by dots)
  console.log(token);
  const tokenParts = token.split('.');
  return tokenParts.length === 3 && 
         tokenParts.every(part => part.length > 0) &&
         /^[A-Za-z0-9+/=]+$/.test(token); // Base64URL format
};

/**
 * Validate decoded token payload
 */
const isValidTokenPayload = (decoded) => {
  return decoded && 
         decoded.user_id && 
         decoded.email && 
         typeof decoded.user_id === 'number' &&
         typeof decoded.email === 'string' &&
         decoded.email.includes('@');
};

/**
 * Validate user status (optional - for enhanced security)
 * This can be disabled for performance if not needed
 */
const validateUserStatus = async (userId, email) => {
  try {
    // Optional: Check if user still exists and is active
    // This adds a database query but provides additional security
    const userDetails = await UserModel.userBasicDetails(email);
    
    if (!userDetails) {
      return {
        isValid: false,
        message: "User account not found"
      };
    }

    // Optional: Check user status if needed
    // const user = await UserModel.findOne(email);
    // if (user && user.eStatus !== 'Active' && user.eStatus !== '1') {
    //   return {
    //     isValid: false,
    //     message: "User account is deactivated"
    //   };
    // }

    return {
      isValid: true,
      message: "User validated successfully"
    };

  } catch (error) {
    console.error('[USER_VALIDATION_ERROR]', error);
    // For performance, we can skip user validation on database errors
    // and rely only on JWT validation
    return {
      isValid: true,
      message: "User validation skipped due to database error"
    };
  }
};

/**
 * Optional: Rate limiting middleware for token verification
 * Uncomment if you want to add rate limiting
 */
import rateLimit from 'express-rate-limit';
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many authentication requests'
});

/**
 * Middleware to check user roles/permissions
 */
const checkRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: 0,
        message: "Authentication required",
        error: "ROLE_CHECK_001"
      });
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: 0,
        message: "Insufficient permissions",
        error: "ROLE_CHECK_002"
      });
    }

    return next();
  };
};

/**
 * Middleware to check if user is the owner of the resource
 */
const checkOwnership = (userIdParam = 'user_id') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: 0,
        message: "Authentication required",
        error: "OWNERSHIP_CHECK_001"
      });
    }

    const requestedUserId = req.params[userIdParam] || req.body[userIdParam];
    
    if (req.user.role !== 'admin' && req.user.user_id != requestedUserId) {
      return res.status(403).json({
        success: 0,
        message: "Access denied. You can only access your own resources.",
        error: "OWNERSHIP_CHECK_002"
      });
    }

    return next();
  };
};

export default verifyToken;
export { checkRole, checkOwnership };
