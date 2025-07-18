import AdminModel from '../model/admin.js';
import UserModel from '../model/user.js';
import ResumeTemplateModel from '../model/resumeTemplate.js';
import { config } from '../config/index.js';
import joi from "joi";
import apiInputValidator from "../libraries/api_input_validator.js";

const AdminManagement = {

  // ==================== ADMIN USERS MANAGEMENT ====================

  // Get all admin users with pagination and filters
  getAllAdmins: async (req, res, next) => {
    try {
      const { page = 1, limit = 10, search, role, status } = req.query;
      const offset = (page - 1) * limit;

      // Build filter conditions
      const filters = { eStatus: 'Active' };
      if (role) filters.vRole = role;
      if (status) filters.eStatus = status;

      const admins = await AdminModel.getAllAdminsWithFilters(filters, search, limit, offset);
      const totalCount = await AdminModel.getAdminCountWithFilters(filters, search);

      return res.status(200).json({
        success: 1,
        message: "Admins retrieved successfully",
        data: {
          admins: admins,
          pagination: {
            current_page: parseInt(page),
            total_pages: Math.ceil(totalCount / limit),
            total_records: totalCount,
            records_per_page: parseInt(limit)
          }
        }
      });

    } catch (error) {
      console.error('[GET_ALL_ADMINS_ERROR]', error);
      return res.status(500).json({
        success: 0,
        message: "Internal server error occurred while retrieving admins",
        error: "INTERNAL_001"
      });
    }
  },

  // Get admin by ID
  getAdminById: async (req, res, next) => {
    try {
      const { admin_id } = req.params;

      if (!admin_id || isNaN(admin_id)) {
        return res.status(400).json({
          success: 0,
          message: "Valid admin ID is required",
          error: "VALIDATION_001"
        });
      }

      const admin = await AdminModel.findById(admin_id);

      if (!admin) {
        return res.status(404).json({
          success: 0,
          message: "Admin not found",
          error: "ADMIN_NOT_FOUND"
        });
      }

      return res.status(200).json({
        success: 1,
        message: "Admin details retrieved successfully",
        data: {
          admin: admin
        }
      });

    } catch (error) {
      console.error('[GET_ADMIN_BY_ID_ERROR]', error);
      return res.status(500).json({
        success: 0,
        message: "Internal server error occurred while retrieving admin details",
        error: "INTERNAL_001"
      });
    }
  },

  // Create new admin
  createAdmin: async (req, res, next) => {
    try {
      // Validate admin input
      await apiInputValidator(req.body, schema_rules.createAdmin);

      const { name, email, password, phone, status } = req.body;
      const sanitizedEmail = email.toLowerCase().trim();

      // Check if admin already exists
      const existingAdmin = await AdminModel.findOne(sanitizedEmail);
      if (existingAdmin) {
        return res.status(409).json({
          success: 0,
          message: "Admin with this email already exists",
          error: "ADMIN_EXISTS"
        });
      }

      // Create admin
      const insert_obj = {
        vName: name.trim(),
        vEmail: sanitizedEmail,
        vPassword: password, // Will be hashed in model
        vPhoneNo: phone.trim(),
        eStatus: status || 'Active',
        dtAddedDate: new Date().toISOString(),
        iAddedBy: req.admin?.admin_id || 1
      };

      const inserted_id = await AdminModel.create(insert_obj);

      return res.status(201).json({
        success: 1,
        message: "Admin created successfully",
        data: {
          admin_id: inserted_id[0],
          name: name.trim(),
          email: sanitizedEmail
        }
      });

    } catch (error) {
      console.error('[CREATE_ADMIN_ERROR]', error);
      
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

      return res.status(500).json({
        success: 0,
        message: "Internal server error occurred while creating admin",
        error: "INTERNAL_001"
      });
    }
  },

  // Update admin
  updateAdmin: async (req, res, next) => {
    try {
      const { admin_id } = req.params;
      
      if (!admin_id || isNaN(admin_id)) {
        return res.status(400).json({
          success: 0,
          message: "Valid admin ID is required",
          error: "VALIDATION_001"
        });
      }

      // Validate update input
      await apiInputValidator(req.body, schema_rules.updateAdmin);

      const { name, email, phone, status } = req.body;

      // Check if admin exists
      const existingAdmin = await AdminModel.findById(admin_id);
      if (!existingAdmin) {
        return res.status(404).json({
          success: 0,
          message: "Admin not found",
          error: "ADMIN_NOT_FOUND"
        });
      }

      // Check if email is being changed and if it already exists
      if (email && email.toLowerCase().trim() !== existingAdmin.vEmail) {
        const emailExists = await AdminModel.findOne(email.toLowerCase().trim());
        if (emailExists && emailExists.iAdminId !== parseInt(admin_id)) {
          return res.status(409).json({
            success: 0,
            message: "Email already exists with another admin",
            error: "EMAIL_EXISTS"
          });
        }
      }

      // Update admin
      const update_obj = {
        vName: name?.trim() || existingAdmin.vName,
        vEmail: email?.toLowerCase().trim() || existingAdmin.vEmail,
        vPhoneNo: phone?.trim() || existingAdmin.vPhoneNo,
        eStatus: status || existingAdmin.eStatus,
        dtUpdatedDate: new Date().toISOString(),
        iUpdatedBy: req.admin?.admin_id || 1
      };

      await AdminModel.update(update_obj, admin_id);

      return res.status(200).json({
        success: 1,
        message: "Admin updated successfully",
        data: {
          admin_id: parseInt(admin_id),
          updated_fields: Object.keys(update_obj).filter(key => key !== 'dtUpdatedDate' && key !== 'iUpdatedBy')
        }
      });

    } catch (error) {
      console.error('[UPDATE_ADMIN_ERROR]', error);
      
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

      return res.status(500).json({
        success: 0,
        message: "Internal server error occurred while updating admin",
        error: "INTERNAL_001"
      });
    }
  },

  // Delete admin (soft delete)
  deleteAdmin: async (req, res, next) => {
    try {
      const { admin_id } = req.params;

      if (!admin_id || isNaN(admin_id)) {
        return res.status(400).json({
          success: 0,
          message: "Valid admin ID is required",
          error: "VALIDATION_001"
        });
      }

      // Check if admin exists
      const existingAdmin = await AdminModel.findById(admin_id);
      if (!existingAdmin) {
        return res.status(404).json({
          success: 0,
          message: "Admin not found",
          error: "ADMIN_NOT_FOUND"
        });
      }

      // Prevent self-deletion
      if (parseInt(admin_id) === req.admin?.admin_id) {
        return res.status(403).json({
          success: 0,
          message: "You cannot delete your own account",
          error: "SELF_DELETE_NOT_ALLOWED"
        });
      }

      // Soft delete admin
      await AdminModel.delete(admin_id);

      return res.status(200).json({
        success: 1,
        message: "Admin deleted successfully",
        data: {
          admin_id: parseInt(admin_id)
        }
      });

    } catch (error) {
      console.error('[DELETE_ADMIN_ERROR]', error);
      return res.status(500).json({
        success: 0,
        message: "Internal server error occurred while deleting admin",
        error: "INTERNAL_001"
      });
    }
  },

  // ==================== USERS MANAGEMENT ====================

  // Get all users with pagination and filters
  getAllUsers: async (req, res, next) => {
    try {
      const { page = 1, limit = 10, search, status } = req.query;
      const offset = (page - 1) * limit;

      // Build filter conditions
      const filters = {};
      if (status) filters.eStatus = status;

      const users = await UserModel.getAllUsersWithFilters(filters, search, limit, offset);
      const totalCount = await UserModel.getUserCountWithFilters(filters, search);

      return res.status(200).json({
        success: 1,
        message: "Users retrieved successfully",
        data: {
          users: users,
          pagination: {
            current_page: parseInt(page),
            total_pages: Math.ceil(totalCount / limit),
            total_records: totalCount,
            records_per_page: parseInt(limit)
          }
        }
      });

    } catch (error) {
      console.error('[GET_ALL_USERS_ERROR]', error);
      return res.status(500).json({
        success: 0,
        message: "Internal server error occurred while retrieving users",
        error: "INTERNAL_001"
      });
    }
  },

  // Get user by ID with full details
  getUserById: async (req, res, next) => {
    try {
      const { user_id } = req.params;

      if (!user_id || isNaN(user_id)) {
        return res.status(400).json({
          success: 0,
          message: "Valid user ID is required",
          error: "VALIDATION_001"
        });
      }

      const user = await UserModel.getUserWithFullDetails(user_id);

      if (!user) {
        return res.status(404).json({
          success: 0,
          message: "User not found",
          error: "USER_NOT_FOUND"
        });
      }

      return res.status(200).json({
        success: 1,
        message: "User details retrieved successfully",
        data: {
          user: user
        }
      });

    } catch (error) {
      console.error('[GET_USER_BY_ID_ERROR]', error);
      return res.status(500).json({
        success: 0,
        message: "Internal server error occurred while retrieving user details",
        error: "INTERNAL_001"
      });
    }
  },

  // Update user status
  updateUserStatus: async (req, res, next) => {
    try {
      const { user_id } = req.params;
      const { status } = req.body;

      if (!user_id || isNaN(user_id)) {
        return res.status(400).json({
          success: 0,
          message: "Valid user ID is required",
          error: "VALIDATION_001"
        });
      }

      if (!['Active', 'Inactive'].includes(status)) {
        return res.status(400).json({
          success: 0,
          message: "Status must be 'Active' or 'Inactive'",
          error: "VALIDATION_001"
        });
      }

      // Check if user exists
      const existingUser = await UserModel.findById(user_id);
      if (!existingUser) {
        return res.status(404).json({
          success: 0,
          message: "User not found",
          error: "USER_NOT_FOUND"
        });
      }

      // Update user status
      await UserModel.updateStatus(user_id, status);

      return res.status(200).json({
        success: 1,
        message: `User status updated to '${status}' successfully`,
        data: {
          user_id: parseInt(user_id),
          status: status
        }
      });

    } catch (error) {
      console.error('[UPDATE_USER_STATUS_ERROR]', error);
      return res.status(500).json({
        success: 0,
        message: "Internal server error occurred while updating user status",
        error: "INTERNAL_001"
      });
    }
  },

  // Delete user (soft delete)
  deleteUser: async (req, res, next) => {
    try {
      const { user_id } = req.params;

      if (!user_id || isNaN(user_id)) {
        return res.status(400).json({
          success: 0,
          message: "Valid user ID is required",
          error: "VALIDATION_001"
        });
      }

      // Check if user exists
      const existingUser = await UserModel.findById(user_id);
      if (!existingUser) {
        return res.status(404).json({
          success: 0,
          message: "User not found",
          error: "USER_NOT_FOUND"
        });
      }

      // Soft delete user
      await UserModel.delete(user_id);

      return res.status(200).json({
        success: 1,
        message: "User deleted successfully",
        data: {
          user_id: parseInt(user_id)
        }
      });

    } catch (error) {
      console.error('[DELETE_USER_ERROR]', error);
      return res.status(500).json({
        success: 0,
        message: "Internal server error occurred while deleting user",
        error: "INTERNAL_001"
      });
    }
  },

  // ==================== RESUME TEMPLATES MANAGEMENT ====================

  // Get all resume templates
  getAllResumeTemplates: async (req, res, next) => {
    try {
      const { page = 1, limit = 10, search, status } = req.query;
      const offset = (page - 1) * limit;

      // Build filter conditions
      const filters = {};
      if (status) filters.eStatus = status;

      const templates = await ResumeTemplateModel.getAllTemplatesWithFilters(filters, search, limit, offset);
      const totalCount = await ResumeTemplateModel.getTemplateCountWithFilters(filters, search);

      return res.status(200).json({
        success: 1,
        message: "Resume templates retrieved successfully",
        data: {
          templates: templates,
          pagination: {
            current_page: parseInt(page),
            total_pages: Math.ceil(totalCount / limit),
            total_records: totalCount,
            records_per_page: parseInt(limit)
          }
        }
      });

    } catch (error) {
      console.error('[GET_ALL_TEMPLATES_ERROR]', error);
      return res.status(500).json({
        success: 0,
        message: "Internal server error occurred while retrieving templates",
        error: "INTERNAL_001"
      });
    }
  },

  // Get template by ID
  getTemplateById: async (req, res, next) => {
    try {
      const { template_id } = req.params;

      if (!template_id || isNaN(template_id)) {
        return res.status(400).json({
          success: 0,
          message: "Valid template ID is required",
          error: "VALIDATION_001"
        });
      }

      const template = await ResumeTemplateModel.findById(template_id);

      if (!template) {
        return res.status(404).json({
          success: 0,
          message: "Template not found",
          error: "TEMPLATE_NOT_FOUND"
        });
      }

      return res.status(200).json({
        success: 1,
        message: "Template details retrieved successfully",
        data: {
          template: template
        }
      });

    } catch (error) {
      console.error('[GET_TEMPLATE_BY_ID_ERROR]', error);
      return res.status(500).json({
        success: 0,
        message: "Internal server error occurred while retrieving template details",
        error: "INTERNAL_001"
      });
    }
  },

  // Create new resume template
  createResumeTemplate: async (req, res, next) => {
    try {
      // Validate template input
      await apiInputValidator(req.body, schema_rules.createTemplate);

      const { template_name, template_description, template_html, template_css, category, status } = req.body;

      // Check if template name already exists
      const existingTemplate = await ResumeTemplateModel.findByName(template_name.trim());
      if (existingTemplate) {
        return res.status(409).json({
          success: 0,
          message: "Template with this name already exists",
          error: "TEMPLATE_EXISTS"
        });
      }

      // Create template
      const insert_obj = {
        vTemplateName: template_name.trim(),
        vTemplateDescription: template_description?.trim(),
        vTemplateHtml: template_html,
        vTemplateCss: template_css,
        vCategory: category || 'Professional',
        eStatus: status || 'Active',
        dtAddedDate: new Date().toISOString(),
        iAddedBy: req.admin?.admin_id || 1
      };

      const inserted_id = await ResumeTemplateModel.create(insert_obj);

      return res.status(201).json({
        success: 1,
        message: "Resume template created successfully",
        data: {
          template_id: inserted_id[0],
          template_name: template_name.trim(),
          category: category || 'Professional'
        }
      });

    } catch (error) {
      console.error('[CREATE_TEMPLATE_ERROR]', error);
      
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

      return res.status(500).json({
        success: 0,
        message: "Internal server error occurred while creating template",
        error: "INTERNAL_001"
      });
    }
  },

  // Update resume template
  updateResumeTemplate: async (req, res, next) => {
    try {
      const { template_id } = req.params;
      
      if (!template_id || isNaN(template_id)) {
        return res.status(400).json({
          success: 0,
          message: "Valid template ID is required",
          error: "VALIDATION_001"
        });
      }

      // Validate update input
      await apiInputValidator(req.body, schema_rules.updateTemplate);

      const { template_name, template_description, template_html, template_css, category, status } = req.body;

      // Check if template exists
      const existingTemplate = await ResumeTemplateModel.findById(template_id);
      if (!existingTemplate) {
        return res.status(404).json({
          success: 0,
          message: "Template not found",
          error: "TEMPLATE_NOT_FOUND"
        });
      }

    //   // Check if template name is being changed and if it already exists
    //   if (template_name && template_name.trim() !== existingTemplate.vTemplateName) {
    //     const nameExists = await ResumeTemplateModel.findByName(template_name.trim());
    //     if (nameExists && nameExists.iTemplateId !== parseInt(template_id)) {
    //       return res.status(409).json({
    //         success: 0,
    //         message: "Template name already exists",
    //         error: "TEMPLATE_NAME_EXISTS"
    //       });
    //     }
    //   }

      // Update template
      const update_obj = {
        vTemplateName: template_name?.trim() || existingTemplate.vTemplateName,
        vTemplateDescription: template_description?.trim() || existingTemplate.vTemplateDescription,
        vTemplateHtml: template_html || existingTemplate.vTemplateHtml,
        vTemplateCss: template_css || existingTemplate.vTemplateCss,
        vCategory: category || existingTemplate.vCategory,
        eStatus: status || existingTemplate.eStatus,
        dtUpdatedDate: new Date().toISOString(),
        iUpdatedBy: req.admin?.admin_id || 1
      };

      await ResumeTemplateModel.update(update_obj, template_id);

      return res.status(200).json({
        success: 1,
        message: "Resume template updated successfully",
        data: {
          template_id: parseInt(template_id),
          updated_fields: Object.keys(update_obj).filter(key => key !== 'dtUpdatedDate' && key !== 'iUpdatedBy')
        }
      });

    } catch (error) {
      console.error('[UPDATE_TEMPLATE_ERROR]', error);
      
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

      return res.status(500).json({
        success: 0,
        message: "Internal server error occurred while updating template",
        error: "INTERNAL_001"
      });
    }
  },

  // Delete resume template
  deleteResumeTemplate: async (req, res, next) => {
    try {
      const { template_id } = req.params;

      if (!template_id || isNaN(template_id)) {
        return res.status(400).json({
          success: 0,
          message: "Valid template ID is required",
          error: "VALIDATION_001"
        });
      }

      // Check if template exists
      const existingTemplate = await ResumeTemplateModel.findById(template_id);
      if (!existingTemplate) {
        return res.status(404).json({
          success: 0,
          message: "Template not found",
          error: "TEMPLATE_NOT_FOUND"
        });
      }

      // Check if template is being used
      const templateUsage = await ResumeTemplateModel.checkTemplateUsage(template_id);
      if (templateUsage > 0) {
        return res.status(400).json({
          success: 0,
          message: "Cannot delete template as it is being used by users",
          error: "TEMPLATE_IN_USE"
        });
      }

      // Delete template
      await ResumeTemplateModel.delete(template_id);

      return res.status(200).json({
        success: 1,
        message: "Resume template deleted successfully",
        data: {
          template_id: parseInt(template_id)
        }
      });

    } catch (error) {
      console.error('[DELETE_TEMPLATE_ERROR]', error);
      return res.status(500).json({
        success: 0,
        message: "Internal server error occurred while deleting template",
        error: "INTERNAL_001"
      });
    }
  },

  // ==================== DASHBOARD STATISTICS ====================

  // Get admin dashboard statistics
  getDashboardStats: async (req, res, next) => {
    try {
      const adminStats = await AdminModel.getAdminStats();
      const userStats = await UserModel.getUserStats();
      const templateStats = await ResumeTemplateModel.getTemplateStats();
      const resumeStats = await UserModel.getResumeStats();

      return res.status(200).json({
        success: 1,
        message: "Dashboard statistics retrieved successfully",
        data: {
          admin_statistics: adminStats,
          user_statistics: userStats,
          template_statistics: templateStats,
          resume_statistics: resumeStats
        }
      });

    } catch (error) {
      console.error('[GET_DASHBOARD_STATS_ERROR]', error);
      return res.status(500).json({
        success: 0,
        message: "Internal server error occurred while retrieving dashboard statistics",
        error: "INTERNAL_001"
      });
    }
  }
};

// Validation schemas
const schema_rules = {
  createAdmin: {
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
    phone: joi.string().min(10).max(15).required().messages({
      'string.empty': 'Phone number is required',
      'string.min': 'Phone number must be at least 10 characters long',
      'string.max': 'Phone number cannot exceed 15 characters',
      'any.required': 'Phone number is required'
    }),
    status: joi.string().valid('Active', 'Inactive').optional().messages({
      'any.only': 'Status must be Active or Inactive'
    })
  },
  updateAdmin: {
    name: joi.string().min(2).max(100).optional().messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 100 characters'
    }),
    email: joi.string().email().optional().messages({
      'string.email': 'Please enter a valid email address'
    }),
    phone: joi.string().min(10).max(15).optional().messages({
      'string.min': 'Phone number must be at least 10 characters long',
      'string.max': 'Phone number cannot exceed 15 characters'
    }),
    status: joi.string().valid('Active', 'Inactive').optional().messages({
      'any.only': 'Status must be Active or Inactive'
    })
  },
  createTemplate: {
    template_name: joi.string().min(3).max(100).required().messages({
      'string.empty': 'Template name is required',
      'string.min': 'Template name must be at least 3 characters long',
      'string.max': 'Template name cannot exceed 100 characters',
      'any.required': 'Template name is required'
    }),
    template_description: joi.string().max(500).optional().messages({
      'string.max': 'Description cannot exceed 500 characters'
    }),
    template_html: joi.string().required().messages({
      'string.empty': 'Template HTML is required',
      'any.required': 'Template HTML is required'
    }),
    template_css: joi.string().optional().messages({
      'string.empty': 'Template CSS cannot be empty'
    }),
    category: joi.string().valid('Professional', 'Creative', 'Modern', 'Classic').optional().messages({
      'any.only': 'Category must be one of: Professional, Creative, Modern, Classic'
    }),
    status: joi.string().valid('Active', 'Inactive').optional().messages({
      'any.only': 'Status must be Active or Inactive'
    })
  },
  updateTemplate: {
    template_name: joi.string().min(3).max(100).optional().messages({
      'string.min': 'Template name must be at least 3 characters long',
      'string.max': 'Template name cannot exceed 100 characters'
    }),
    template_description: joi.string().max(500).optional().messages({
      'string.max': 'Description cannot exceed 500 characters'
    }),
    template_html: joi.string().optional().messages({
      'string.empty': 'Template HTML cannot be empty'
    }),
    template_css: joi.string().optional().messages({
      'string.empty': 'Template CSS cannot be empty'
    }),
    category: joi.string().valid('Professional', 'Creative', 'Modern', 'Classic').optional().messages({
      'any.only': 'Category must be one of: Professional, Creative, Modern, Classic'
    }),
    status: joi.string().valid('Active', 'Inactive').optional().messages({
      'any.only': 'Status must be Active or Inactive'
    })
  }
};

export default AdminManagement; 