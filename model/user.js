import db from "../config/db.connection.js";

const UserModel = {
  getAllUsers: async () => {
    const users = await db.from('sys_user').first();
    return users;
  },
  findOne: async (email) => {
    const users = await db.from('sys_user')
      .where('vEmail', email)
      .first();
    return users;
  },
  create: async (insert_obj) => {
    return await db.insert(insert_obj).into("sys_user");
  }
}

export default UserModel;
