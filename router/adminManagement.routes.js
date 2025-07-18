import express from "express";
import AdminManagement from "../controller/adminManagementService.js";
import { verifyAdminToken } from "../middleware/adminAuth.js";

const router = express.Router();

// ==================== ADMIN USERS MANAGEMENT ====================

// Get all admin users (Super Admin only)
router.get("/admins", verifyAdminToken, AdminManagement.getAllAdmins);

// Get admin by ID (Super Admin only)
router.get("/admins/:admin_id", verifyAdminToken, AdminManagement.getAdminById);

// Create new admin (Super Admin only)
router.post("/admins", verifyAdminToken, AdminManagement.createAdmin);

// Update admin (Super Admin only)
router.put("/admins/:admin_id", verifyAdminToken, AdminManagement.updateAdmin);

// Delete admin (Super Admin only)
router.delete("/admins/:admin_id", verifyAdminToken, AdminManagement.deleteAdmin);

// ==================== USERS MANAGEMENT ====================

// Get all users (Admin and Super Admin)
router.get("/users", verifyAdminToken, AdminManagement.getAllUsers);

// Get user by ID with full details (Admin and Super Admin)
router.get("/users/:user_id", verifyAdminToken, AdminManagement.getUserById);

// Update user status (Admin and Super Admin)
router.patch("/users/:user_id/status", verifyAdminToken, AdminManagement.updateUserStatus);

// Delete user (Admin and Super Admin)
router.delete("/users/:user_id", verifyAdminToken, AdminManagement.deleteUser);

// ==================== RESUME TEMPLATES MANAGEMENT ====================

// Get all resume templates (Admin and Super Admin)
router.get("/templates", verifyAdminToken, AdminManagement.getAllResumeTemplates);

// Get template by ID (Admin and Super Admin)
router.get("/templates/:template_id", verifyAdminToken, AdminManagement.getTemplateById);

// Create new resume template (Admin and Super Admin)
router.post("/templates", verifyAdminToken, AdminManagement.createResumeTemplate);

// Update resume template (Admin and Super Admin)
router.put("/templates/:template_id", verifyAdminToken, AdminManagement.updateResumeTemplate);

// Delete resume template (Admin and Super Admin)
router.delete("/templates/:template_id", verifyAdminToken, AdminManagement.deleteResumeTemplate);

// ==================== DASHBOARD STATISTICS ====================

// Get dashboard statistics (Admin and Super Admin)
router.get("/dashboard/stats", verifyAdminToken, AdminManagement.getDashboardStats);

export default router; 