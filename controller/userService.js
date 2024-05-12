import joi from "joi";
import apiInputValidator from "../libraries/api_input_validator.js";
import UserModel from '../model/user.js';
import { getDateTime } from "../libraries/common.js";

const UserService = {
  getUserList: async (req, res, next) => {
    try {
      const user = await UserModel.getAllUsers();
      res.status(201).json({
        success: 1,
        message: "User details found",
        data: user
      });
    } catch (error) {
      res.status(201).json({
        success: 0,
        error: error,
      });
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
          data_obj.dtUpdateDate = await getDateTime();
          await UserModel.updateUserProfile(data_obj, profile_id);
        }else{
          data_obj.iUserId = requested_user_id;
          data_obj.iAddedBy = 1;
          data_obj.dtAddedDate = await getDateTime();
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
  },
  updateUserSkills: async (req, res, next) => {
    try {
      await apiInputValidator(req.body, schema_rules.update_user_skills);

      const { requested_user_id, skills } = req.body;
      //delete already exist user skills
      await UserModel.deleteUserSkills(requested_user_id);

      const skills_arr = skills.split(',');
      //insert new user skills
      skills_arr.forEach( async (val) => {
        const insert_obj = {
          iUserId: requested_user_id,
          iSkillId: val,
          iAddedBy: 1,
          dtAddedDate: await getDateTime()
        }
        await UserModel.insertUserSkills(insert_obj);
      });
      res.status(201).json({
        success: 1,
        message: "User skills updated successfully...!",
      });
      
    } catch (error) {
      res.status(201).json({
        success: 0,
        error: error,
      });
    }
  },
  updateUserEducation: async (req, res, next) => {
    try {
      await apiInputValidator(req.body, schema_rules.update_user_education);

      const { requested_user_id, education_details } = req.body;
      //delete already exist user skills
      await UserModel.deleteUserEducation(requested_user_id);

      //insert new user skills
      for(const education of education_details){
        const insert_obj = {
          iUserId: requested_user_id,
          vDegreeName: education.degree,
          vInstituteName: education.institute,
          dtStartDate: education.start_date,
          dtEndDate: education.end_date,
          fPercentage: education.percentage,
          fCgpa: education.cgpa,
          iAddedBy: 1,
          dtAddedDate: await getDateTime()
        }
        await UserModel.insertUserEducation(insert_obj);
      };
      res.status(201).json({
        success: 1,
        message: "User Education updated successfully...!",
      });
      
    } catch (error) {
      res.status(201).json({
        success: 0,
        error: error,
      });
    }
  },
  updateUserExperience: async (req, res, next) => {
    try {
      await apiInputValidator(req.body, schema_rules.update_user_experience);

      const { requested_user_id, experience_details } = req.body;
      //delete already exist user skills
      await UserModel.deleteUserExperience(requested_user_id);

      //insert new user skills
      for(const experience of experience_details){
        const insert_obj = {
          iUserId: requested_user_id,
          vCompanyName: experience.company,
          vJobTitle: experience.job_title,
          iIsCurrentJob: experience.is_current_job,
          dtStartDate: experience.start_date,
          dtEndDate: experience.end_date,
          tDescription: experience.description,
          iCountryId: experience.country_id,
          iStateId: experience.state_id,
          iCityId: experience.city_id,
          iAddedBy: 1,
          dtAddedDate: await getDateTime()
        }
        await UserModel.insertUserExperience(insert_obj);
      };
      res.status(201).json({
        success: 1,
        message: "User Experience updated successfully...!",
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
    // user_id: joi.string().required(),
  },
  update_user_skills: {
    requested_user_id: joi.string().required(),
    skills: joi.string().required(),
    // user_id: joi.string().required(),
  },
  update_user_education: {
    requested_user_id: joi.string().required(),
    education_details: joi.array().items(
      joi.object().keys({
        degree: joi.string().required(),
        institute: joi.string().required(),
        start_date: joi.string().required(),
        end_date: joi.string().required(),
        percentage: joi.string().optional().allow(''),
        cgpa: joi.string().optional().allow(''),
      }),
    )
    // user_id: joi.string().required(),
  },
  update_user_experience: {
    requested_user_id: joi.string().required(),
    experience_details: joi.array().items(
      joi.object().keys({
        company: joi.string().required(),
        job_title: joi.string().required(),
        is_current_job: joi.string().required(),
        start_date: joi.string().required(),
        end_date: joi.string().required(),
        description: joi.string().optional().allow(''),
        country_id: joi.string().required(),
        state_id: joi.string().required(),
        city_id: joi.string().optional().allow(''),
      }),
    )
    // user_id: joi.string().required(),
  }

};

export default UserService;