import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UserModel from '../model/user.js';
import { config } from '../config/index.js';
import joi from "joi";
import apiInputValidator from "../libraries/api_input_validator.js";

const Auth = {

  Login: async (req, res, next) => {
    try {
      // Validate user input
      await apiInputValidator(req.body, schema_rules.login);
      
      // Get and sanitize user input
      const { email, password } = req.body;
      const sanitizedEmail = email.toLowerCase().trim();
  
      // Validate if user exists in our database
      const user = await UserModel.findOne(sanitizedEmail);
  
      if (!user) {
        return res.status(401).json({
          success: 0,
          message: "Invalid email or password",
          error: "AUTH_001"
        });
      }

      // Check if user is active
      if (user.eStatus !== 'Active' && user.eStatus !== '1') {
        return res.status(403).json({
          success: 0,
          message: "Account is deactivated. Please contact administrator.",
          error: "AUTH_002"
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.vPassword);
      
      if (!isPasswordValid) {
        return res.status(401).json({
          success: 0,
          message: "Invalid email or password",
          error: "AUTH_001"
        });
      }

      // Create token payload (exclude sensitive data)
      const tokenPayload = {
        user_id: user.iUserId,
        email: user.vEmail,
        name: user.vName,
        role: user.eRole || 'user'
      };

      // Create token with consistent configuration
      const token = jwt.sign(
        tokenPayload,
        config.token_key,
        {
          expiresIn: "24h", // Increased from 2h for better UX
          issuer: 'node_auth_app',
          audience: 'users'
        }
      );

      // Prepare safe user data for response
      const safeUserData = {
        user_id: user.iUserId,
        name: user.vName,
        email: user.vEmail,
        phone: user.vPhoneNo,
        status: user.eStatus,
        created_at: user.dtAddedDate,
        last_login: new Date().toISOString()
      };

      // Log successful login (for audit purposes)
      console.log(`[LOGIN_SUCCESS] User ${user.vEmail} logged in successfully at ${new Date().toISOString()}`);

      return res.status(200).json({
        success: 1,
        message: "Login successful",
        data: {
          user: safeUserData,
          token: token,
          token_type: "Bearer",
          expires_in: "24h"
        }
      });

    } catch (error) {
      console.error('[LOGIN_ERROR]', error);
      
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
        message: "Internal server error occurred during login",
        error: "INTERNAL_001"
      });
    }
  },

  Register: async (req, res, next) => {
    try {
      // Validate user input
      await apiInputValidator(req.body, schema_rules.register);

      // Get and sanitize user input
      const { name, email, password, phone, status } = req.body;
      const sanitizedEmail = email.toLowerCase().trim();
      const sanitizedName = name.trim();
  
      // Validate if user exists in our database
      const oldUser = await UserModel.findOne(sanitizedEmail);
  
      if (oldUser) {
        return res.status(409).json({
          success: 0,
          message: "User already exists. Please login instead.",
          error: "REG_001"
        });
      }

      // Validate password strength
      if (!isPasswordStrong(password)) {
        return res.status(400).json({
          success: 0,
          message: "Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character",
          error: "REG_002"
        });
      }
  
      // Encrypt user password with higher salt rounds for better security
      const encryptedPassword = await bcrypt.hash(password, 12);
  
      // Create user in our database
      const insert_obj = {
        vName: sanitizedName,
        vEmail: sanitizedEmail,
        vPassword: encryptedPassword,
        vPhoneNo: phone.trim(),
        eStatus: status || 'Active',
        dtAddedDate: new Date().toISOString(),
        iAddedBy: 1
      };

      const inserted_id = await UserModel.create(insert_obj);
  
      // Create token payload
      const tokenPayload = {
        user_id: inserted_id[0], // Assuming insert returns array with ID
        email: sanitizedEmail,
        name: sanitizedName,
        role: 'user'
      };

      // Create token with consistent configuration
      const token = jwt.sign(
        tokenPayload,
        config.token_key,
        {
          expiresIn: "24h",
          issuer: 'node_auth_app',
          audience: 'users'
        }
      );

      // Log successful registration
      console.log(`[REGISTER_SUCCESS] User ${sanitizedEmail} registered successfully at ${new Date().toISOString()}`);

      return res.status(201).json({
        success: 1,
        message: "User registered successfully",
        data: {
          user_id: inserted_id[0],
          token: token,
          token_type: "Bearer",
          expires_in: "24h"
        }
      });

    } catch (error) {
      console.error('[REGISTER_ERROR]', error);
      
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
          message: "User already exists with this email",
          error: "REG_001"
        });
      }

      return res.status(500).json({
        success: 0,
        message: "Internal server error occurred during registration",
        error: "INTERNAL_001"
      });
    }
  },

  // Helper function to validate password strength
  validatePassword: (password) => {
    return isPasswordStrong(password);
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
  login: {
    email: joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: joi.string().min(1).required().messages({
      'string.min': 'Password is required',
      'any.required': 'Password is required'
    }),
  },
  register: {
    email: joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: joi.string().min(8).required().messages({
      'string.min': 'Password must be at least 8 characters long',
      'any.required': 'Password is required'
    }),
    name: joi.string().min(2).max(50).required().messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 50 characters',
      'any.required': 'Name is required'
    }),
    phone: joi.string().min(10).max(15).required().messages({
      'string.min': 'Phone number must be at least 10 digits',
      'string.max': 'Phone number cannot exceed 15 digits',
      'any.required': 'Phone number is required'
    }),
    status: joi.string().valid('Active', 'Inactive', '1', '0').optional().default('Active'),
  }
};

export default Auth;