import jwt from 'jsonwebtoken';
import { config } from '../config/index.js'; 
import AdminModel from '../model/admin.js';

/**
 * Enhanced JWT Token Verification Middleware for Admin APIs
 * Provides secure authentication with proper error handling and admin-specific checks
 */
const verifyAdminToken = async (req, res, next) => {
  try {
    // Extract token from multiple sources with priority
    const token = extractTokenFromRequest(req);
    
    if (!token) {
      return res.status(401).json({
        success: 0,
        message: "Access token is required for admin authentication",
        error: "ADMIN_AUTH_MIDDLEWARE_001"
      });
    }

    // Verify token format and structure
    if (!isValidTokenFormat(token)) {
      return res.status(401).json({
        success: 0,
        message: "Invalid token format",
        error: "ADMIN_AUTH_MIDDLEWARE_002"
      });
    }

    // Verify and decode JWT token
    const decoded = jwt.verify(token, config.token_key, {
      issuer: 'node_auth_app',
      audience: 'admins'
    });

    // Validate decoded token payload
    if (!isValidAdminTokenPayload(decoded)) {
      return res.status(401).json({
        success: 0,
        message: "Invalid admin token payload",
        error: "ADMIN_AUTH_MIDDLEWARE_003"
      });
    }

    // Check if admin exists and is active
    const adminExists = await validateAdminStatus(decoded.admin_id, decoded.email);
    if (!adminExists.isValid) {
      return res.status(401).json({
        success: 0,
        message: adminExists.message,
        error: "ADMIN_AUTH_MIDDLEWARE_004"
      });
    }

    // Set admin information in request object
    req.admin = {
      admin_id: decoded.admin_id,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role || 'admin',
      permissions: decoded.permissions || 'all',
      token_issued_at: decoded.iat,
      token_expires_at: decoded.exp
    };

    // Add token info for debugging/logging purposes
    req.tokenInfo = {
      token_type: 'Bearer',
      expires_in: decoded.exp - Math.floor(Date.now() / 1000)
    };

    // Log successful admin authentication (for audit purposes)
    console.log(`[ADMIN_AUTH_SUCCESS] Admin ${decoded.email} authenticated successfully at ${new Date().toISOString()}`);

    return next();

  } catch (error) {
    console.error('[ADMIN_AUTH_ERROR]', error);
    
    // Handle specific JWT errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: 0,
        message: "Admin token has expired. Please login again.",
        error: "ADMIN_AUTH_MIDDLEWARE_005"
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: 0,
        message: "Invalid admin token signature",
        error: "ADMIN_AUTH_MIDDLEWARE_006"
      });
    }

    if (error.name === 'NotBeforeError') {
      return res.status(401).json({
        success: 0,
        message: "Admin token not yet valid",
        error: "ADMIN_AUTH_MIDDLEWARE_007"
      });
    }

    // Handle other errors
    return res.status(500).json({
      success: 0,
      message: "Admin authentication service error",
      error: "ADMIN_AUTH_MIDDLEWARE_008"
    });
  }
};

/**
 * Extract token from request with proper priority
 * Priority: Authorization header > Body > Query
 */
const extractTokenFromRequest = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  if (req.headers.token) {
    return req.headers.token;
  }
  if (req.body && req.body.token) {
    return req.body.token;
  }
  if (req.query && req.query.token) {
    return req.query.token;
  }
  return null;
};

/**
 * Validate token format
 */
const isValidTokenFormat = (token) => {
  const tokenParts = token.split('.');
  return tokenParts.length === 3 && 
         tokenParts.every(part => part.length > 0);
};

/**
 * Validate decoded admin token payload
 */
const isValidAdminTokenPayload = (decoded) => {
  return decoded && 
         decoded.admin_id && 
         decoded.email && 
         typeof decoded.admin_id === 'number' &&
         typeof decoded.email === 'string' &&
         decoded.email.includes('@');
};

/**
 * Validate admin status
 */
const validateAdminStatus = async (adminId, email) => {
  try {
    const adminDetails = await AdminModel.findOne(email);
    if (!adminDetails) {
      return {
        isValid: false,
        message: "Admin account not found"
      };
    }
    if (adminDetails.eStatus !== 'Active' && adminDetails.eStatus !== '1') {
      return {
        isValid: false,
        message: "Admin account is deactivated"
      };
    }
    return {
      isValid: true,
      message: "Admin validated successfully"
    };
  } catch (error) {
    console.error('[ADMIN_VALIDATION_ERROR]', error);
    return {
      isValid: true,
      message: "Admin validation skipped due to database error"
    };
  }
};

/**
 * Middleware to check admin roles/permissions
 */
const checkAdminRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: 0,
        message: "Admin authentication required",
        error: "ADMIN_ROLE_CHECK_001"
      });
    }
    if (allowedRoles.length > 0 && !allowedRoles.includes(req.admin.role)) {
      return res.status(403).json({
        success: 0,
        message: "Insufficient admin permissions",
        error: "ADMIN_ROLE_CHECK_002"
      });
    }
    return next();
  };
};

/**
 * Middleware to check if admin is the owner of the resource
 */
const checkAdminOwnership = (adminIdParam = 'admin_id') => {
  return (req, res, next) => {
    const resourceAdminId = req.body[adminIdParam] || req.params[adminIdParam];
    if (!req.admin || req.admin.admin_id !== Number(resourceAdminId)) {
      return res.status(403).json({
        success: 0,
        message: "You do not have permission to access this resource",
        error: "ADMIN_OWNERSHIP_001"
      });
    }
    return next();
  };
};

export { verifyAdminToken, checkAdminOwnership };
