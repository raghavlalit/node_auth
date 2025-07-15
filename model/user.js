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
    const users = await db.select('vEmail as email', 'vName as name', 'vPhoneNo as phone', 'eStatus as status')
      .from('sys_user')
      .where('iUserId', user_id)
      .first();
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
}

export default UserModel;
