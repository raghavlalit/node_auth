import UserModel from '../model/user.js';

const UserService = {
  Test: async (req, res, next) => {
    try {
      const user = await UserModel.getAllUsers();
      res.status(201).json({
        success: 1,
        message: "User details found",
        data: user
      });
    } catch (error) {
      next(error);
    }
  },
  getUserList: async (req, res, next) => {
    try {
      
    } catch (error) {
      next(error);
    }
  }
}

export default UserService;