import express from "express";
import AdminAuth from "../controller/adminAuthService.js";
import { verifyAdminToken } from "../middleware/adminAuth.js";

const router = express.Router();

// Admin Authentication Routes
router.post("/login", AdminAuth.Login);
router.post("/register", AdminAuth.Register);

// Admin Profile Routes (Protected)
router.get("/profile", verifyAdminToken, AdminAuth.getAdminProfile);

// Admin Management Routes (Protected - Super Admin only)
router.get("/all", verifyAdminToken, async (req, res) => {
  try {
    // Check if user is super admin
    if (req.user?.role !== 'super_admin') {
      return res.status(403).json({
        success: 0,
        message: "Access denied. Super admin privileges required.",
        error: "PERMISSION_DENIED"
      });
    }

    const AdminModel = (await import("../model/admin.js")).default;
    const admins = await AdminModel.getAllAdmins();

    return res.status(200).json({
      success: 1,
      message: "Admins retrieved successfully",
      data: {
        admins: admins,
        count: admins.length
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
});

// Get admin statistics
router.get("/stats", verifyAdminToken, async (req, res) => {
  try {
    // Check if user is admin or super admin
    if (!['admin', 'super_admin'].includes(req.user?.role)) {
      return res.status(403).json({
        success: 0,
        message: "Access denied. Admin privileges required.",
        error: "PERMISSION_DENIED"
      });
    }

    const AdminModel = (await import("../model/admin.js")).default;
    const stats = await AdminModel.getAdminStats();

    return res.status(200).json({
      success: 1,
      message: "Admin statistics retrieved successfully",
      data: {
        statistics: stats
      }
    });

  } catch (error) {
    console.error('[GET_ADMIN_STATS_ERROR]', error);
    return res.status(500).json({
      success: 0,
      message: "Internal server error occurred while retrieving admin statistics",
      error: "INTERNAL_001"
    });
  }
});

// Search admins
router.get("/search", verifyAdminToken, async (req, res) => {
  try {
    // Check if user is admin or super admin
    if (!['admin', 'super_admin'].includes(req.user?.role)) {
      return res.status(403).json({
        success: 0,
        message: "Access denied. Admin privileges required.",
        error: "PERMISSION_DENIED"
      });
    }

    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: 0,
        message: "Search term must be at least 2 characters long",
        error: "VALIDATION_001"
      });
    }

    const AdminModel = (await import("../model/admin.js")).default;
    const admins = await AdminModel.searchAdmins(q.trim());

    return res.status(200).json({
      success: 1,
      message: "Admin search completed successfully",
      data: {
        admins: admins,
        count: admins.length,
        search_term: q.trim()
      }
    });

  } catch (error) {
    console.error('[SEARCH_ADMINS_ERROR]', error);
    return res.status(500).json({
      success: 0,
      message: "Internal server error occurred while searching admins",
      error: "INTERNAL_001"
    });
  }
});

// Get admins by role
router.get("/role/:role", verifyAdminToken, async (req, res) => {
  try {
    // Check if user is admin or super admin
    if (!['admin', 'super_admin'].includes(req.user?.role)) {
      return res.status(403).json({
        success: 0,
        message: "Access denied. Admin privileges required.",
        error: "PERMISSION_DENIED"
      });
    }

    const { role } = req.params;
    const validRoles = ['admin', 'super_admin', 'moderator'];
    
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: 0,
        message: "Invalid role. Must be one of: admin, super_admin, moderator",
        error: "VALIDATION_001"
      });
    }

    const AdminModel = (await import("../model/admin.js")).default;
    const admins = await AdminModel.getAdminsByRole(role);

    return res.status(200).json({
      success: 1,
      message: `Admins with role '${role}' retrieved successfully`,
      data: {
        admins: admins,
        count: admins.length,
        role: role
      }
    });

  } catch (error) {
    console.error('[GET_ADMINS_BY_ROLE_ERROR]', error);
    return res.status(500).json({
      success: 0,
      message: "Internal server error occurred while retrieving admins by role",
      error: "INTERNAL_001"
    });
  }
});

// Update admin status (Super Admin only)
router.patch("/:admin_id/status", verifyAdminToken, async (req, res) => {
  try {
    // Check if user is super admin
    if (req.user?.role !== 'super_admin') {
      return res.status(403).json({
        success: 0,
        message: "Access denied. Super admin privileges required.",
        error: "PERMISSION_DENIED"
      });
    }

    const { admin_id } = req.params;
    const { status } = req.body;

    if (!['Active', 'Inactive'].includes(status)) {
      return res.status(400).json({
        success: 0,
        message: "Invalid status. Must be 'Active' or 'Inactive'",
        error: "VALIDATION_001"
      });
    }

    const AdminModel = (await import("../model/admin.js")).default;
    
    // Check if admin exists
    const admin = await AdminModel.findById(admin_id);
    if (!admin) {
      return res.status(404).json({
        success: 0,
        message: "Admin not found",
        error: "ADMIN_NOT_FOUND"
      });
    }

    // Update status
    await AdminModel.updateStatus(admin_id, status);

    return res.status(200).json({
      success: 1,
      message: `Admin status updated to '${status}' successfully`,
      data: {
        admin_id: admin_id,
        status: status
      }
    });

  } catch (error) {
    console.error('[UPDATE_ADMIN_STATUS_ERROR]', error);
    return res.status(500).json({
      success: 0,
      message: "Internal server error occurred while updating admin status",
      error: "INTERNAL_001"
    });
  }
});

// Delete admin (Super Admin only)
router.delete("/:admin_id", verifyAdminToken, async (req, res) => {
  try {
    // Check if user is super admin
    if (req.user?.role !== 'super_admin') {
      return res.status(403).json({
        success: 0,
        message: "Access denied. Super admin privileges required.",
        error: "PERMISSION_DENIED"
      });
    }

    const { admin_id } = req.params;

    const AdminModel = (await import("../model/admin.js")).default;
    
    // Check if admin exists
    const admin = await AdminModel.findById(admin_id);
    if (!admin) {
      return res.status(404).json({
        success: 0,
        message: "Admin not found",
        error: "ADMIN_NOT_FOUND"
      });
    }

    // Soft delete admin
    await AdminModel.delete(admin_id);

    return res.status(200).json({
      success: 1,
      message: "Admin deleted successfully",
      data: {
        admin_id: admin_id
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
});

export default router;