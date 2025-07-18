import db from "../config/db.connection.js";

const AdminModel = {
  // Get all admins (for admin management)
  getAllAdmins: async () => {
    const admins = await db.select(
      'iAdminId as admin_id',
      'vName as name',
      'vEmail as email',
      'vPhoneNo as phone',
      'eStatus as status',
      'dtAddedDate as added_date',
      'dtUpdatedDate as updated_date'
    ).from('sys_admin').where('eStatus', 'Active').orderBy('dtAddedDate', 'desc');
    return admins;
  },

  // Find admin by email
  findOne: async (email) => {
    const admin = await db.select(
      'iAdminId as iAdminId',
      'vName as vName',
      'vEmail as vEmail',
      'vPassword as vPassword',
      'vPhoneNo as vPhoneNo',
      'eStatus as eStatus',
      'dtAddedDate as dtAddedDate',
      'dtUpdatedDate as dtUpdatedDate'
    ).from('sys_admin').where('vEmail', email).first();
    return admin;
  },

  // Find admin by ID
  findById: async (admin_id) => {
    const admin = await db.select(
      'iAdminId as iAdminId',
      'vName as vName',
      'vEmail as vEmail',
      'vPhoneNo as vPhoneNo',
      'eStatus as eStatus',
      'dtAddedDate as dtAddedDate',
      'dtUpdatedDate as dtUpdatedDate'
    ).from('sys_admin').where('iAdminId', admin_id).where('eStatus', 'Active').first();
    return admin;
  },

  // Create new admin
  create: async (insert_obj) => {
    return await db.insert(insert_obj).into("sys_admin");
  },

  // Update admin
  update: async (update_obj, admin_id) => {
    return await db("sys_admin").update(update_obj).where("iAdminId", admin_id);
  },

  // Soft delete admin (set status to Inactive)
  delete: async (admin_id) => {
    return await db("sys_admin").update({ 
      eStatus: 'Inactive',
      dtUpdatedDate: new Date().toISOString()
    }).where("iAdminId", admin_id);
  },

  // Check if admin exists by email
  isAdminExists: async (email) => {
    const admin = await db.select('iAdminId as admin_id').from('sys_admin').where('vEmail', email).where('eStatus', 'Active').first();
    return admin?.admin_id ? admin.admin_id : '';
  },

  // Get admin count
  getAdminCount: async () => {
    const count = await db("sys_admin")
      .where('eStatus', 'Active')
      .count('iAdminId as count')
      .first();
    return count?.count || 0;
  },

  // Get admins by role (removed role filter)
  getAdminsByRole: async () => {
    const admins = await db.select(
      'iAdminId as admin_id',
      'vName as name',
      'vEmail as email',
      'vPhoneNo as phone',
      'eStatus as status',
      'dtAddedDate as added_date'
    ).from('sys_admin').where('eStatus', 'Active').orderBy('dtAddedDate', 'desc');
    return admins;
  },

  // Update admin password
  updatePassword: async (admin_id, newPassword) => {
    return await db("sys_admin").update({ 
      vPassword: newPassword,
      dtUpdatedDate: new Date().toISOString()
    }).where("iAdminId", admin_id);
  },

  // Update admin status
  updateStatus: async (admin_id, status) => {
    return await db("sys_admin").update({ 
      eStatus: status,
      dtUpdatedDate: new Date().toISOString()
    }).where("iAdminId", admin_id);
  },

  // Get admin with basic details
  getAdminBasicDetails: async (admin_id) => {
    const admin = await db.select(
      'iAdminId as admin_id',
      'vName as name',
      'vEmail as email',
      'vPhoneNo as phone',
      'eStatus as status'
    ).from('sys_admin').where('iAdminId', admin_id).where('eStatus', 'Active').first();
    return admin;
  },

  // Search admins by name or email
  searchAdmins: async (searchTerm) => {
    const admins = await db.select(
      'iAdminId as admin_id',
      'vName as name',
      'vEmail as email',
      'vPhoneNo as phone',
      'eStatus as status',
      'dtAddedDate as added_date'
    ).from('sys_admin')
    .where('eStatus', 'Active')
    .where(function() {
      this.where('vName', 'like', `%${searchTerm}%`)
        .orWhere('vEmail', 'like', `%${searchTerm}%`);
    })
    .orderBy('dtAddedDate', 'desc');
    return admins;
  },

  // Get admin statistics
  getAdminStats: async () => {
    const stats = await db.raw(`
      SELECT 
        COUNT(*) as total_admins,
        COUNT(CASE WHEN eStatus = 'Active' THEN 1 END) as active_admins,
        COUNT(CASE WHEN eStatus = 'Inactive' THEN 1 END) as inactive_admins
      FROM sys_admin
    `);
    return stats[0][0];
  },

  // Get all admins with filters and pagination (removed role/permissions)
  getAllAdminsWithFilters: async (filters = {}, search = '', limit = 10, offset = 0) => {
    let query = db.select(
      'iAdminId as admin_id',
      'vName as name',
      'vEmail as email',
      'vPhoneNo as phone',
      'eStatus as status',
      'dtAddedDate as added_date',
      'dtUpdatedDate as updated_date'
    ).from('sys_admin');

    // Apply filters
    if (filters.eStatus) {
      query = query.where('eStatus', filters.eStatus);
    }

    // Apply search
    if (search) {
      query = query.where(function() {
        this.where('vName', 'like', `%${search}%`)
          .orWhere('vEmail', 'like', `%${search}%`)
          .orWhere('vPhoneNo', 'like', `%${search}%`);
      });
    }

    return await query.orderBy('dtAddedDate', 'desc').limit(limit).offset(offset);
  },

  // Get admin count with filters
  getAdminCountWithFilters: async (filters = {}, search = '') => {
    let query = db('sys_admin');

    // Apply filters
    if (filters.eStatus) {
      query = query.where('eStatus', filters.eStatus);
    }

    // Apply search
    if (search) {
      query = query.where(function() {
        this.where('vName', 'like', `%${search}%`)
          .orWhere('vEmail', 'like', `%${search}%`)
          .orWhere('vPhoneNo', 'like', `%${search}%`);
      });
    }

    const result = await query.count('iAdminId as count').first();
    return result?.count || 0;
  }
}

export default AdminModel; 