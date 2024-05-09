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
  }
}

export default UserModel;
