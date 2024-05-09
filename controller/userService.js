import joi from "joi";
import apiInputValidator from "../libraries/api_input_validator.js";
import UserModel from '../model/user.js';
import { getFormattedDate } from "../libraries/common.js";

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
      console.log(req.body);
      return false;
    } catch (error) {
      next(error);
    }
  },

  updateUserProfile: async (req, res, next) => {
    try {
        await apiInputValidator(req.body, schema_rules.update_user_profile);
    
        const { requested_user_id, date_of_birth, gender, current_salary, is_annual_salary, country_id, state_id, city_id, zipcode, address } = req.body;
        const profile_id = await UserModel.isProfileExist(requested_user_id);
        const data_obj = {
          vDateOfBirth: date_of_birth,
          vGender: gender,
          iCurrentSalary: current_salary,
          eIsAnually: is_annual_salary,
          iCountryId: country_id,
          iStateId: state_id,
          iCityId: city_id,
          vZipcode: zipcode,
          vAddress: address,
        }
        if(profile_id){
            data_obj.iUpdatedBy = 1;
            data_obj.dtUpdateDate = await getFormattedDate();
          await UserModel.updateUserProfile(data_obj, profile_id);
        }else{
          data_obj.iUserId = requested_user_id;
          data_obj.iAddedBy = 1;
          data_obj.dtAddedDate = await getFormattedDate();
          await UserModel.insertUserProfile(data_obj);
        }
        res.status(201).json({
          success: 1,
          message: "User profile updated successfully...!",
        });
    } catch (error) {
      res.status(201).json({
        success: 0,
        error: error,
      });
    }
  }
}

const schema_rules = {
  update_user_profile: {
    requested_user_id: joi.string().required(),
    date_of_birth: joi.string().required(),
    gender: joi.string().required(),
    current_salary: joi.string().required(),
    is_annual_salary: joi.string().required(),
    country_id: joi.string().required(),
    state_id: joi.string().required(),
    city_id: joi.string().optional().allow(''),
    zipcode: joi.string().required(),
    address: joi.string().required(),
    user_id: joi.string().required(),
  },
};

export default UserService;