import db from "../config/db.connection.js";

const ResumeTemplateModel = {
  // Get all templates with filters and pagination
  getAllTemplatesWithFilters: async (filters = {}, search = '', limit = 10, offset = 0) => {
    let query = db.select(
      'iTemplateId as template_id',
      'vTemplateName as template_name',
      'vTemplateDescription as template_description',
      'vTemplateHtml as template_html',
      'vTemplateCss as template_css',
      'vCategory as category',
      'eStatus as status',
      'dtAddedDate as added_date',
      'dtUpdatedDate as updated_date'
    ).from('sys_resume_templates');

    // Apply filters
    if (filters.eStatus) {
      query = query.where('eStatus', filters.eStatus);
    }
    if (filters.vCategory) {
      query = query.where('vCategory', filters.vCategory);
    }

    // Apply search
    if (search) {
      query = query.where(function() {
        this.where('vTemplateName', 'like', `%${search}%`)
          .orWhere('vTemplateDescription', 'like', `%${search}%`)
          .orWhere('vCategory', 'like', `%${search}%`);
      });
    }

    return await query.orderBy('dtAddedDate', 'desc').limit(limit).offset(offset);
  },

  // Get template count with filters
  getTemplateCountWithFilters: async (filters = {}, search = '') => {
    let query = db('sys_resume_templates');

    // Apply filters
    if (filters.eStatus) {
      query = query.where('eStatus', filters.eStatus);
    }
    if (filters.vCategory) {
      query = query.where('vCategory', filters.vCategory);
    }

    // Apply search
    if (search) {
      query = query.where(function() {
        this.where('vTemplateName', 'like', `%${search}%`)
          .orWhere('vTemplateDescription', 'like', `%${search}%`)
          .orWhere('vCategory', 'like', `%${search}%`);
      });
    }

    const result = await query.count('iTemplateId as count').first();
    return result?.count || 0;
  },

  // Find template by ID
  findById: async (template_id) => {
    const template = await db.select(
      'iTemplateId as template_id',
      'vTemplateName as template_name',
      'vTemplateDescription as template_description',
      'vTemplateHtml as template_html',
      'vTemplateCss as template_css',
      'vCategory as category',
      'eStatus as status',
      'dtAddedDate as added_date',
      'dtUpdatedDate as updated_date'
    ).from('sys_resume_templates').where('iTemplateId', template_id).first();
    return template;
  },

  // Find template by name
  findByName: async (template_name) => {
    const template = await db.select(
      'iTemplateId as template_id',
      'vTemplateName as template_name'
    ).from('sys_resume_templates').where('vTemplateName', template_name).first();
    return template;
  },

  // Create new template
  create: async (insert_obj) => {
    return await db.insert(insert_obj).into("sys_resume_templates");
  },

  // Update template
  update: async (update_obj, template_id) => {
    return await db("sys_resume_templates").update(update_obj).where("iTemplateId", template_id);
  },

  // Delete template
  delete: async (template_id) => {
    return await db("sys_resume_templates").where("iTemplateId", template_id).del();
  },

  // Check template usage
  checkTemplateUsage: async (template_id) => {
    const result = await db("sys_user_resume")
      .where("iTemplateId", template_id)
      .count("iResumeId as count")
      .first();
    return result?.count || 0;
  },

  // Get template statistics
  getTemplateStats: async () => {
    const stats = await db.raw(`
      SELECT 
        COUNT(*) as total_templates,
        COUNT(CASE WHEN eStatus = 'Active' THEN 1 END) as active_templates,
        COUNT(CASE WHEN eStatus = 'Inactive' THEN 1 END) as inactive_templates,
        COUNT(CASE WHEN vCategory = 'Professional' THEN 1 END) as professional_templates,
        COUNT(CASE WHEN vCategory = 'Creative' THEN 1 END) as creative_templates,
        COUNT(CASE WHEN vCategory = 'Modern' THEN 1 END) as modern_templates,
        COUNT(CASE WHEN vCategory = 'Classic' THEN 1 END) as classic_templates
      FROM sys_resume_templates
    `);
    return stats[0][0];
  },

  // Get templates by category
  getTemplatesByCategory: async (category) => {
    const templates = await db.select(
      'iTemplateId as template_id',
      'vTemplateName as template_name',
      'vTemplateDescription as template_description',
      'vCategory as category',
      'eStatus as status'
    ).from('sys_resume_templates')
    .where('vCategory', category)
    .where('eStatus', 'Active')
    .orderBy('dtAddedDate', 'desc');
    return templates;
  },

  // Get active templates for user selection
  getActiveTemplates: async () => {
    const templates = await db.select(
      'iTemplateId as template_id',
      'vTemplateName as template_name',
      'vTemplateDescription as template_description',
      'vCategory as category'
    ).from('sys_resume_templates')
    .where('eStatus', 'Active')
    .orderBy('vCategory', 'asc')
    .orderBy('vTemplateName', 'asc');
    return templates;
  }
};

export default ResumeTemplateModel; 