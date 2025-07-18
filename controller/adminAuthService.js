import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import AdminModel from '../model/admin.js';
import { config } from '../config/index.js';
import joi from "joi";
import apiInputValidator from "../libraries/api_input_validator.js";

const AdminAuth = {

  Login: async (req, res, next) => {
    try {
        console.log(req.body);
      // Validate admin input
      await apiInputValidator(req.body, schema_rules.admin_login);
      
      // Get and sanitize admin input
      const { email, password } = req.body;
      const sanitizedEmail = email.toLowerCase().trim();
  
      // Validate if admin exists in our database
      const admin = await AdminModel.findOne(sanitizedEmail);
  
      if (!admin) {
        return res.status(401).json({
          success: 0,
          message: "Invalid email or password",
          error: "ADMIN_AUTH_001"
        });
      }

      // Check if admin is active
      if (admin.eStatus !== 'Active' && admin.eStatus !== '1') {
        return res.status(403).json({
          success: 0,
          message: "Admin account is deactivated. Please contact super administrator.",
          error: "ADMIN_AUTH_002"
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, admin.vPassword);
      
      if (!isPasswordValid) {
        return res.status(401).json({
          success: 0,
          message: "Invalid email or password",
          error: "ADMIN_AUTH_001"
        });
      }

      // Create token payload (exclude sensitive data)
      const tokenPayload = {
        admin_id: admin.iAdminId,
        email: admin.vEmail,
        name: admin.vName
      };

      // Create token with consistent configuration
      const token = jwt.sign(
        tokenPayload,
        config.token_key,
        {
          expiresIn: "24h",
          issuer: 'node_auth_app',
          audience: 'admins'
        }
      );

      // Prepare safe admin data for response
      const safeAdminData = {
        admin_id: admin.iAdminId,
        name: admin.vName,
        email: admin.vEmail,
        status: admin.eStatus,
        created_at: admin.dtAddedDate,
        last_login: new Date().toISOString()
      };

      // Log successful admin login (for audit purposes)
      console.log(`[ADMIN_LOGIN_SUCCESS] Admin ${admin.vEmail} logged in successfully at ${new Date().toISOString()}`);

      return res.status(200).json({
        success: 1,
        message: "Admin login successful",
        data: {
          admin: safeAdminData,
          token: token,
          token_type: "Bearer",
          expires_in: "24h"
        }
      });

    } catch (error) {
      console.error('[ADMIN_LOGIN_ERROR]', error);
      
      // Handle validation errors
      if (error.isJoi) {
        return res.status(400).json({
          success: 0,
          message: "Validation error",
          error: "VALIDATION_001",
          details: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        });
      }

      // Handle other errors
      return res.status(500).json({
        success: 0,
        message: "Internal server error occurred during admin login",
        error: "INTERNAL_001"
      });
    }
  },

  Register: async (req, res, next) => {
    try {
      // Validate admin input
      await apiInputValidator(req.body, schema_rules.admin_register);

      // Get and sanitize admin input
      const { name, email, password, status } = req.body;
      const sanitizedEmail = email.toLowerCase().trim();
      const sanitizedName = name.trim();
  
      // Validate if admin exists in our database
      const oldAdmin = await AdminModel.findOne(sanitizedEmail);
  
      if (oldAdmin) {
        return res.status(409).json({
          success: 0,
          message: "Admin already exists. Please login instead.",
          error: "ADMIN_REG_001"
        });
      }

      // Validate password strength
      if (!isPasswordStrong(password)) {
        return res.status(400).json({
          success: 0,
          message: "Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character",
          error: "ADMIN_REG_002"
        });
      }
  
      // Encrypt admin password with higher salt rounds for better security
      const encryptedPassword = await bcrypt.hash(password, 12);
  
      // Create admin in our database
      const insert_obj = {
        vName: sanitizedName,
        vEmail: sanitizedEmail,
        vPassword: encryptedPassword,
        eStatus: status || 'Active',
        dtAddedDate: new Date().toISOString(),
      };

      const inserted_id = await AdminModel.create(insert_obj);
  
      // Create token payload
      const tokenPayload = {
        admin_id: inserted_id[0], // Assuming insert returns array with ID
        email: sanitizedEmail,
        name: sanitizedName
      };

      // Create token with consistent configuration
      const token = jwt.sign(
        tokenPayload,
        config.token_key,
        {
          expiresIn: "24h",
          issuer: 'node_auth_app',
          audience: 'admins'
        }
      );

      // Log successful admin registration
      console.log(`[ADMIN_REGISTER_SUCCESS] Admin ${sanitizedEmail} registered successfully at ${new Date().toISOString()}`);

      return res.status(201).json({
        success: 1,
        message: "Admin registered successfully",
        data: {
          admin_id: inserted_id[0],
          name: sanitizedName,
          email: sanitizedEmail,
          token: token,
          token_type: "Bearer",
          expires_in: "24h"
        }
      });

    } catch (error) {
      console.error('[ADMIN_REGISTER_ERROR]', error);
      
      // Handle validation errors
      if (error.isJoi) {
        return res.status(400).json({
          success: 0,
          message: "Validation error",
          error: "VALIDATION_001",
          details: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        });
      }

      // Handle database errors
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
          success: 0,
          message: "Admin already exists with this email",
          error: "ADMIN_REG_001"
        });
      }

      return res.status(500).json({
        success: 0,
        message: "Internal server error occurred during admin registration",
        error: "INTERNAL_001"
      });
    }
  },

  // Helper function to validate password strength
  validatePassword: (password) => {
    return isPasswordStrong(password);
  },

  // Get admin profile
  getAdminProfile: async (req, res, next) => {
    try {
      // Get admin ID from token (assuming middleware sets req.admin)
      const adminId = req.admin?.admin_id || req.body.admin_id;

      if (!adminId) {
        return res.status(401).json({
          success: 0,
          message: "Admin authentication required",
          error: "ADMIN_AUTH_003"
        });
      }

      // Get admin details
      const admin = await AdminModel.findById(adminId);

      if (!admin) {
        return res.status(404).json({
          success: 0,
          message: "Admin not found",
          error: "ADMIN_AUTH_004"
        });
      }

      // Prepare safe admin data
      const safeAdminData = {
        admin_id: admin.iAdminId,
        name: admin.vName,
        email: admin.vEmail,
        status: admin.eStatus,
        created_at: admin.dtAddedDate,
        updated_at: admin.dtUpdatedDate
      };

      return res.status(200).json({
        success: 1,
        message: "Admin profile retrieved successfully",
        data: {
          admin: safeAdminData
        }
      });

    } catch (error) {
      console.error('[ADMIN_PROFILE_ERROR]', error);
      
      return res.status(500).json({
        success: 0,
        message: "Internal server error occurred while retrieving admin profile",
        error: "INTERNAL_001"
      });
    }
  }
}

// Password strength validation function
const isPasswordStrong = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
};

const schema_rules = {
  admin_login: {
    email: joi.string().email().required().messages({
      'string.empty': 'Email is required',
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required'
    }),
    password: joi.string().required().messages({
      'string.empty': 'Password is required',
      'any.required': 'Password is required'
    })
  },
  admin_register: {
    name: joi.string().min(2).max(100).required().messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 100 characters',
      'any.required': 'Name is required'
    }),
    email: joi.string().email().required().messages({
      'string.empty': 'Email is required',
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required'
    }),
    password: joi.string().min(8).required().messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 8 characters long',
      'any.required': 'Password is required'
    }),
    status: joi.string().valid('Active', 'Inactive', '1', '0').optional().messages({
      'any.only': 'Status must be Active, Inactive, 1, or 0'
    })
  }
};

export default AdminAuth;