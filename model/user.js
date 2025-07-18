import db from "../config/db.connection.js";

const UserModel = {
  getAllUsers: async () => {
    const users = await db.from('sys_user').first();
    return users;
  },
  userBasicDetails: async (email) => {
    const users = await db.select('iUserId as user_id').from('sys_user').where('vEmail', email).first();
    return users;
  },
  userBasicDetailsById: async (user_id) => {
    const users = await db.select('vEmail as email', 'vName as name', 'vPhoneNo as phone', 'eStatus as status').from('sys_user').where('iUserId', user_id).first();
    return users;
  },
  findOne: async (email) => {
    const users = await db.from('sys_user').where('vEmail', email).first();
    return users;
  },
  create: async (insert_obj) => {
    return await db.insert(insert_obj).into("sys_user");
  },
  isProfileExist: async (user_id) => {
    const profile = await db.select('iUserProfileId as profile_id').from('sys_user_profile').where('iUserId', user_id).first();
    return profile?.profile_id ? profile.profile_id : '';
  },
  insertUserProfile: async (insert_obj) => {
    return await db.insert(insert_obj).into("sys_user_profile");
  },
  updateUserProfile: async (update_obj, profile_id) => {
    return await db("sys_user_profile").update(update_obj).where("iUserProfileId", profile_id);
  },
  deleteUserSkills: async (user_id) => {
    return await db("sys_user_skills").del().where("iUserId", user_id);
  },
  insertUserSkills: async (insert_obj) => {
    return await db.insert(insert_obj).into("sys_user_skills");
  },
  deleteUserEducation: async (user_id) => {
    return await db("sys_education_details").del().where("iUserId", user_id);
  },
  insertUserEducation: async (insert_obj) => {
    return await db.insert(insert_obj).into("sys_education_details");
  },
  deleteUserExperience: async (user_id) => {
    return await db("sys_experience_details").del().where("iUserId", user_id);
  },
  insertUserExperience: async (insert_obj) => {
    return await db.insert(insert_obj).into("sys_experience_details");
  },
  getUserProfileData: async (user_id) => {
    const user_info = await db.select(
        'su.vName as name', 'su.vEmail as email', 'su.vPhoneNo as phone', 'sup.vDateOfBirth as date_of_birth', 'sup.vGender as gender', 'sup.iCurrentSalary as current salary',
        'sup.vZipcode as zipcode', 'sup.vAddress as address', 'country.vCountry as country', 'state.vState as state', 'city.vCity as city'
      )
      .from('sys_user as su')
      .leftJoin('sys_user_profile as sup', 'su.iUserId', 'sup.iUserId')
      .leftJoin('sys_country as country', 'sup.iCountryId', 'country.iCountryId')
      .leftJoin('sys_state as state', 'sup.iStateId', 'state.iStateId')
      .leftJoin('sys_city as city', 'sup.iCityId', 'city.iCityId')
      .where('su.iUserId', user_id).first();
    return user_info;
  },
  getuserSkills: async (user_id) => {
    const user_skills = await db.select('ss.vSkillName as skill', 'ss.vSkillCode as skill_code')
      .from('sys_user_skills as sus')
      .leftJoin('sys_skills as ss', 'sus.iSkillId', 'ss.iSkillId')
      .where('sus.iUserId', user_id);
    return user_skills;
  },
  getuserEducation: async (user_id) => {
    const user_education = await db.select(
        'vDegreeName as degree', 'vInstituteName as institute', 'dtStartDate as start_date', 'dtEndDate as end_date', 'fPercentage as percentage', 'fCgpa as cgpa'
      )
      .from('sys_education_details')
      .where('iUserId', user_id);
    return user_education;
  },
  getuserExperience: async (user_id) => {
    const user_experience = await db.select(
        'sed.vCompanyName as company_name', 'sed.vJobTitle as job_title', 'sed.iIsCurrentJob as is_current_job', 'sed.dtStartDate as start_date', 'sed.dtEndDate as end_date',
        'sed.tDescription as description', 'country.vCountry as country', 'state.vState as state', 'city.vCity as city'
      )
      .from('sys_experience_details as sed')
      .leftJoin('sys_country as country', 'sed.iCountryId', 'country.iCountryId')
      .leftJoin('sys_state as state', 'sed.iStateId', 'state.iStateId')
      .leftJoin('sys_city as city', 'sed.iCityId', 'city.iCityId')
      .where('sed.iUserId', user_id);
    return user_experience;
  },
  // New methods for user resume management
  getUserResumes: async (user_id) => {
    const resumes = await db.select(
      'iResumeId as resume_id',
      'iUserId as user_id',
      'vResumeName as resume_name',
      'dtAddedDate as added_date',
      'dtUpdatedDate as updated_date',
      'eStatus as status'
    )
    .from('sys_user_resume')
    .where('iUserId', user_id)
    .where('eStatus', 'Active')
    .orderBy('dtAddedDate', 'desc');
    return resumes;
  },
  getResumeById: async (resume_id) => {
    const resume = await db.select(
      'iResumeId as resume_id',
      'iUserId as user_id',
      'vResumeName as resume_name',
      'dtAddedDate as added_date',
      'dtUpdatedDate as updated_date',
      'eStatus as status'
    )
    .from('sys_user_resume')
    .where('iResumeId', resume_id)
    .where('eStatus', 'Active')
    .first();
    return resume;
  },
  insertUserResume: async (insert_obj) => {
    return await db.insert(insert_obj).into("sys_user_resume");
  },
  updateUserResume: async (update_obj, resume_id) => {
    return await db("sys_user_resume").update(update_obj).where("iResumeId", resume_id);
  },
  deleteUserResume: async (resume_id) => {
    return await db("sys_user_resume").update({ eStatus: 'Inactive' }).where("iResumeId", resume_id);
  },
  isResumeExist: async (resume_id) => {
    const resume = await db.select('iResumeId as resume_id').from('sys_user_resume').where('iResumeId', resume_id).where('eStatus', 'Active').first();
    return resume?.resume_id ? resume.resume_id : '';
  },
  getUserResumeCount: async (user_id) => {
    const count = await db("sys_user_resume")
      .where('iUserId', user_id)
      .where('eStatus', 'Active')
      .count('iResumeId as count')
      .first();
    return count?.count || 0;
  },

  // Admin management methods
  getAllUsersWithFilters: async (filters = {}, search = '', limit = 10, offset = 0) => {
    let query = db.select(
      'iUserId as user_id',
      'vName as name',
      'vEmail as email',
      'vPhoneNo as phone',
      'eStatus as status',
      'dtAddedDate as added_date'
    ).from('sys_user');

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

  getUserCountWithFilters: async (filters = {}, search = '') => {
    let query = db('sys_user');

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

    const result = await query.count('iUserId as count').first();
    return result?.count || 0;
  },

  findById: async (user_id) => {
    const user = await db.select(
      'iUserId as user_id',
      'vName as name',
      'vEmail as email',
      'vPhoneNo as phone',
      'eStatus as status',
      'dtAddedDate as added_date'
    ).from('sys_user').where('iUserId', user_id).first();
    return user;
  },

  updateStatus: async (user_id, status) => {
    return await db("sys_user").update({ 
      eStatus: status,
      dtUpdatedDate: new Date().toISOString()
    }).where("iUserId", user_id);
  },

  delete: async (user_id) => {
    return await db("sys_user").update({ 
      eStatus: 'Inactive',
      dtUpdatedDate: new Date().toISOString()
    }).where("iUserId", user_id);
  },

  getUserWithFullDetails: async (user_id) => {
    const user = await db.select(
      'su.iUserId as user_id',
      'su.vName as name',
      'su.vEmail as email',
      'su.vPhoneNo as phone',
      'su.eStatus as status',
      'su.dtAddedDate as added_date',
      'sup.vDateOfBirth as date_of_birth',
      'sup.vGender as gender',
      'sup.iCurrentSalary as current_salary',
      'sup.vZipcode as zipcode',
      'sup.vAddress as address',
      'country.vCountry as country',
      'state.vState as state',
      'city.vCity as city'
    )
    .from('sys_user as su')
    .leftJoin('sys_user_profile as sup', 'su.iUserId', 'sup.iUserId')
    .leftJoin('sys_country as country', 'sup.iCountryId', 'country.iCountryId')
    .leftJoin('sys_state as state', 'sup.iStateId', 'state.iStateId')
    .leftJoin('sys_city as city', 'sup.iCityId', 'city.iCityId')
    .where('su.iUserId', user_id)
    .first();

    if (user) {
      // Get user skills
      user.skills = await UserModel.getuserSkills(user_id);
      
      // Get user education
      user.education = await UserModel.getuserEducation(user_id);
      
      // Get user experience
      user.experience = await UserModel.getuserExperience(user_id);
      
      // Get user resumes
      user.resumes = await UserModel.getUserResumes(user_id);
    }

    return user;
  },

  getUserStats: async () => {
    const stats = await db.raw(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN eStatus = 'Active' THEN 1 END) as active_users,
        COUNT(CASE WHEN eStatus = 'Inactive' THEN 1 END) as inactive_users,
        COUNT(CASE WHEN DATE(dtAddedDate) = CURDATE() THEN 1 END) as new_users_today,
        COUNT(CASE WHEN DATE(dtAddedDate) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN 1 END) as new_users_week,
        COUNT(CASE WHEN DATE(dtAddedDate) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 END) as new_users_month
      FROM sys_user
    `);
    return stats[0][0];
  },

  getResumeStats: async () => {
    const stats = await db.raw(`
      SELECT 
        COUNT(*) as total_resumes,
        COUNT(CASE WHEN eStatus = 'Active' THEN 1 END) as active_resumes,
        COUNT(CASE WHEN eStatus = 'Inactive' THEN 1 END) as inactive_resumes,
        COUNT(CASE WHEN DATE(dtAddedDate) = CURDATE() THEN 1 END) as new_resumes_today,
        COUNT(CASE WHEN DATE(dtAddedDate) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN 1 END) as new_resumes_week,
        COUNT(CASE WHEN DATE(dtAddedDate) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 END) as new_resumes_month
      FROM sys_user_resume
    `);
    return stats[0][0];
  }
}

export default UserModel;
