import joi from "joi";
import apiInputValidator from "../libraries/api_input_validator.js";
import UserModel from '../model/user.js';
import { getDateTime } from "../libraries/common.js";
import db from '../config/db.connection.js';

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
  },
  getUserInfo: async (req, res, next) => {
    try {
      await apiInputValidator(req.body, schema_rules.get_user_info);
      const { requested_user_id } = req.body;

      const user_profile_info = await UserModel.getUserProfileData(requested_user_id);
      if(user_profile_info){
        const user_skills = await UserModel.getuserSkills(requested_user_id);
        user_profile_info.skills = user_skills;
        const user_education = await UserModel.getuserEducation(requested_user_id);
        user_profile_info.education = user_education;
        const user_experience = await UserModel.getuserExperience(requested_user_id);
        user_profile_info.experience = user_experience;
      }
      res.status(201).json({
        success: 1,
        message: "User profile details found successfully...!",
        data: user_profile_info
      });

    } catch (error) {
      res.status(201).json({
        success: 0,
        error: error,
      });
    }
  },
  submitUserDetails: async (req, res, next) => {
    try {
      // Validate input data
      await apiInputValidator(req.body, schema_rules.submit_user_details);
      
      const { 
        requested_user_id, 
        profile, 
        education, 
        experience, 
        skills 
      } = req.body;

      // Check if user exists
      const userExists = await UserModel.userBasicDetailsById(requested_user_id);
      console.log(userExists);
      if (!userExists) {
        return res.status(400).json({
          success: 0,
          error: "User not found"
        });
      }

      // Start transaction for data consistency
      const trx = await db.transaction();

      try {
        // 1. Handle Profile Data
        const profile_id = await UserModel.isProfileExist(requested_user_id);
        const profile_data = {
          vDateOfBirth: profile.dateOfBirth,
          vGender: profile.gender,
          iCurrentSalary: profile.currentSalary,
          eIsAnually: profile.isAnnually,
          iCountryId: profile.countryId,
          iStateId: profile.stateId,
          iCityId: profile.cityId || null,
          vZipcode: profile.zipcode,
          vAddress: profile.address,
        };

        if (profile_id) {
          profile_data.iUpdatedBy = 1;
          profile_data.dtUpdateDate = await getDateTime();
          await UserModel.updateUserProfile(profile_data, profile_id);
        } else {
          profile_data.iUserId = requested_user_id;
          profile_data.iAddedBy = 1;
          profile_data.dtAddedDate = await getDateTime();
          await UserModel.insertUserProfile(profile_data);
        }

        // 2. Handle Skills Data
        if (skills && skills.length > 0) {
          await UserModel.deleteUserSkills(requested_user_id);
          
          for (const skillId of skills) {
            const skill_data = {
              iUserId: requested_user_id,
              iSkillId: skillId,
              iAddedBy: 1,
              dtAddedDate: await getDateTime()
            };
            await UserModel.insertUserSkills(skill_data);
          }
        }

        // 3. Handle Education Data
        if (education && education.length > 0) {
          await UserModel.deleteUserEducation(requested_user_id);
          
          for (const edu of education) {
            const education_data = {
              iUserId: requested_user_id,
              vDegreeName: edu.degreeName,
              vInstituteName: edu.instituteName,
              dtStartDate: edu.startDate,
              dtEndDate: edu.endDate,
              fPercentage: edu.percentage || null,
              fCgpa: edu.cgpa || null,
              iAddedBy: 1,
              dtAddedDate: await getDateTime()
            };
            await UserModel.insertUserEducation(education_data);
          }
        }

        // 4. Handle Experience Data
        if (experience && experience.length > 0) {
          await UserModel.deleteUserExperience(requested_user_id);
          
          for (const exp of experience) {
            const experience_data = {
              iUserId: requested_user_id,
              vCompanyName: exp.companyName,
              vJobTitle: exp.jobTitle,
              iIsCurrentJob: exp.isCurrentJob,
              dtStartDate: exp.startDate,
              dtEndDate: exp.endDate,
              tDescription: exp.description || null,
              iCountryId: exp.countryId,
              iStateId: exp.stateId,
              iCityId: exp.cityId || null,
              iAddedBy: 1,
              dtAddedDate: await getDateTime()
            };
            await UserModel.insertUserExperience(experience_data);
          }
        }

        // Commit transaction
        await trx.commit();

        res.status(201).json({
          success: 1,
          message: "User details submitted successfully!",
          data: {
            user_id: requested_user_id,
            profile_updated: true,
            skills_count: skills ? skills.length : 0,
            education_count: education ? education.length : 0,
            experience_count: experience ? experience.length : 0
          }
        });

      } catch (transactionError) {
        // Rollback transaction on error
        await trx.rollback();
        throw transactionError;
      }

    } catch (error) {
      console.error('Error in submitUserDetails:', error);
      
      // Handle specific validation errors
      if (error.isJoi) {
        return res.status(400).json({
          success: 0,
          error: "Validation error",
          details: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        });
      }

      // Handle database errors
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({
          success: 0,
          error: "Duplicate entry found"
        });
      }

      res.status(500).json({
        success: 0,
        error: "Internal server error occurred while submitting user details"
      });
    }
  },

  getResumeInfo: async (req, res, next) => {
    try {
      // Validate input data
      await apiInputValidator(req.body, schema_rules.get_resume_info);
      
      const { requested_user_id } = req.body;

      // Check if user exists
      const userExists = await UserModel.userBasicDetailsById(requested_user_id);
      if (!userExists) {
        return res.status(404).json({
          success: 0,
          error: "User not found",
          message: "The requested user does not exist"
        });
      }

      // Get comprehensive resume data
      const resumeData = {
        user: userExists,
        profile: null,
        education: [],
        experience: [],
        skills: []
      };

      // Get user profile data
      const profileData = await UserModel.getUserProfileData(requested_user_id);
      if (profileData) {
        resumeData.profile = {
          dateOfBirth: profileData.date_of_birth,
          gender: profileData.gender,
          currentSalary: profileData.current_salary,
          zipcode: profileData.zipcode,
          address: profileData.address,
          country: profileData.country,
          state: profileData.state,
          city: profileData.city
        };
      }

      // Get user skills
      const skillsData = await UserModel.getuserSkills(requested_user_id);
      if (skillsData && skillsData.length > 0) {
        resumeData.skills = skillsData.map(skill => ({
          skillName: skill.skill,
          skillCode: skill.skill_code
        }));
      }

      // Get user education
      const educationData = await UserModel.getuserEducation(requested_user_id);
      if (educationData && educationData.length > 0) {
        resumeData.education = educationData.map(edu => ({
          degreeName: edu.degree,
          instituteName: edu.institute,
          startDate: edu.start_date,
          endDate: edu.end_date,
          percentage: edu.percentage,
          cgpa: edu.cgpa
        }));
      }

      // Get user experience
      const experienceData = await UserModel.getuserExperience(requested_user_id);
      if (experienceData && experienceData.length > 0) {
        resumeData.experience = experienceData.map(exp => ({
          companyName: exp.company_name,
          jobTitle: exp.job_title,
          isCurrentJob: exp.is_current_job,
          startDate: exp.start_date,
          endDate: exp.end_date,
          description: exp.description,
          country: exp.country,
          state: exp.state,
          city: exp.city
        }));
      }

      // Calculate resume completeness
      const completeness = {
        profile: !!resumeData.profile,
        skills: resumeData.skills.length > 0,
        education: resumeData.education.length > 0,
        experience: resumeData.experience.length > 0,
        totalPercentage: 0
      };

      const completedSections = [completeness.profile, completeness.skills, completeness.education, completeness.experience]
        .filter(Boolean).length;
      completeness.totalPercentage = Math.round((completedSections / 4) * 100);

      res.status(200).json({
        success: 1,
        message: "Resume information retrieved successfully",
        data: {
          resume: resumeData,
          completeness: completeness,
          summary: {
            totalSkills: resumeData.skills.length,
            totalEducation: resumeData.education.length,
            totalExperience: resumeData.experience.length,
            hasProfile: !!resumeData.profile
          }
        }
      });

    } catch (error) {
      console.error('Error in getResumeInfo:', error);
      
      // Handle specific validation errors
      if (error.isJoi) {
        return res.status(400).json({
          success: 0,
          error: "Validation error",
          message: "Invalid input data",
          details: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        });
      }

      // Handle database errors
      if (error.code === 'ER_NO_SUCH_TABLE') {
        return res.status(500).json({
          success: 0,
          error: "Database configuration error",
          message: "Required database tables are missing"
        });
      }

      res.status(500).json({
        success: 0,
        error: "Internal server error occurred while retrieving resume information"
      });
    }
  },

  // New API methods for user resume management
  addUserResume: async (req, res, next) => {
    try {
      // Validate input data
      await apiInputValidator(req.body, schema_rules.add_user_resume);
      
      const { user_id, resume_name } = req.body;

      // Check if user exists
      const userExists = await UserModel.userBasicDetailsById(user_id);
      if (!userExists) {
        return res.status(404).json({
          success: 0,
          error: "User not found",
          message: "The requested user does not exist"
        });
      }

      // Check if resume name already exists for this user
      const existingResumes = await UserModel.getUserResumes(user_id);
      const duplicateName = existingResumes.find(resume => 
        resume.resume_name.toLowerCase() === resume_name.toLowerCase()
      );

      if (duplicateName) {
        return res.status(409).json({
          success: 0,
          error: "Duplicate resume name",
          message: "A resume with this name already exists for this user"
        });
      }

      // Prepare resume data
      const resumeData = {
        iUserId: user_id,
        vResumeName: resume_name,
        dtAddedDate: await getDateTime(),
        eStatus: 'Active'
      };

      // Insert new resume
      const result = await UserModel.insertUserResume(resumeData);
      
      // Get the created resume
      const createdResume = await UserModel.getResumeById(result[0]);

      res.status(201).json({
        success: 1,
        message: "Resume added successfully",
        data: {
          resume_id: createdResume.resume_id,
          resume_name: createdResume.resume_name,
          user_id: createdResume.user_id,
          added_date: createdResume.added_date,
          status: createdResume.status
        }
      });

    } catch (error) {
      console.error('Error in addUserResume:', error);
      
      // Handle specific validation errors
      if (error.isJoi) {
        return res.status(400).json({
          success: 0,
          error: "Validation error",
          message: "Invalid input data",
          details: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        });
      }

      // Handle database errors
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
          success: 0,
          error: "Duplicate entry",
          message: "A resume with this name already exists"
        });
      }

      res.status(500).json({
        success: 0,
        error: "Internal server error occurred while adding resume"
      });
    }
  },

  updateUserResume: async (req, res, next) => {
    try {
      // Validate input data
      await apiInputValidator(req.body, schema_rules.update_user_resume);
      
      const { resume_id, user_id, resume_name } = req.body;

      // Check if user exists
      const userExists = await UserModel.userBasicDetailsById(user_id);
      if (!userExists) {
        return res.status(404).json({
          success: 0,
          error: "User not found",
          message: "The requested user does not exist"
        });
      }

      // Check if resume exists
      const resumeExists = await UserModel.isResumeExist(resume_id);
      if (!resumeExists) {
        return res.status(404).json({
          success: 0,
          error: "Resume not found",
          message: "The requested resume does not exist"
        });
      }

      // Get current resume to verify ownership
      const currentResume = await UserModel.getResumeById(resume_id);
      if (currentResume.user_id != user_id) {
        return res.status(403).json({
          success: 0,
          error: "Access denied",
          message: "You can only update your own resumes"
        });
      }

      // Check if new name conflicts with other resumes of the same user
      const existingResumes = await UserModel.getUserResumes(user_id);
      const duplicateName = existingResumes.find(resume => 
        resume.resume_id != resume_id && 
        resume.resume_name.toLowerCase() === resume_name.toLowerCase()
      );

      if (duplicateName) {
        return res.status(409).json({
          success: 0,
          error: "Duplicate resume name",
          message: "A resume with this name already exists for this user"
        });
      }

      // Prepare update data
      const updateData = {
        vResumeName: resume_name,
        dtUpdatedDate: await getDateTime()
      };

      // Update resume
      await UserModel.updateUserResume(updateData, resume_id);
      
      // Get the updated resume
      const updatedResume = await UserModel.getResumeById(resume_id);

      res.status(200).json({
        success: 1,
        message: "Resume updated successfully",
        data: {
          resume_id: updatedResume.resume_id,
          resume_name: updatedResume.resume_name,
          user_id: updatedResume.user_id,
          updated_date: updatedResume.updated_date,
          status: updatedResume.status
        }
      });

    } catch (error) {
      console.error('Error in updateUserResume:', error);
      
      // Handle specific validation errors
      if (error.isJoi) {
        return res.status(400).json({
          success: 0,
          error: "Validation error",
          message: "Invalid input data",
          details: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        });
      }

      // Handle database errors
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
          success: 0,
          error: "Duplicate entry",
          message: "A resume with this name already exists"
        });
      }

      res.status(500).json({
        success: 0,
        error: "Internal server error occurred while updating resume"
      });
    }
  },

  getUserResumes: async (req, res, next) => {
    try {
      // Validate input data
      await apiInputValidator(req.body, schema_rules.get_user_resumes);
      
      const { user_id } = req.body;

      // Check if user exists
      const userExists = await UserModel.userBasicDetailsById(user_id);
      if (!userExists) {
        return res.status(404).json({
          success: 0,
          error: "User not found",
          message: "The requested user does not exist"
        });
      }

      // Get user resumes
      const resumes = await UserModel.getUserResumes(user_id);
      const resumeCount = await UserModel.getUserResumeCount(user_id);

      res.status(200).json({
        success: 1,
        message: "User resumes retrieved successfully",
        data: {
          resumes: resumes,
          total_count: resumeCount,
          user: {
            user_id: userExists.user_id,
            name: userExists.name,
            email: userExists.email
          }
        }
      });

    } catch (error) {
      console.error('Error in getUserResumes:', error);
      
      // Handle specific validation errors
      if (error.isJoi) {
        return res.status(400).json({
          success: 0,
          error: "Validation error",
          message: "Invalid input data",
          details: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        });
      }

      res.status(500).json({
        success: 0,
        error: "Internal server error occurred while retrieving user resumes"
      });
    }
  },

  deleteUserResume: async (req, res, next) => {
    try {
      // Validate input data
      await apiInputValidator(req.body, schema_rules.delete_user_resume);
      
      const { resume_id, user_id } = req.body;

      // Check if user exists
      const userExists = await UserModel.userBasicDetailsById(user_id);
      if (!userExists) {
        return res.status(404).json({
          success: 0,
          error: "User not found",
          message: "The requested user does not exist"
        });
      }

      // Check if resume exists
      const resumeExists = await UserModel.isResumeExist(resume_id);
      if (!resumeExists) {
        return res.status(404).json({
          success: 0,
          error: "Resume not found",
          message: "The requested resume does not exist"
        });
      }

      // Get current resume to verify ownership
      const currentResume = await UserModel.getResumeById(resume_id);
      if (currentResume.user_id != user_id) {
        return res.status(403).json({
          success: 0,
          error: "Access denied",
          message: "You can only delete your own resumes"
        });
      }

      // Soft delete resume (set status to Inactive)
      await UserModel.deleteUserResume(resume_id);

      res.status(200).json({
        success: 1,
        message: "Resume deleted successfully",
        data: {
          resume_id: resume_id,
          deleted_at: await getDateTime()
        }
      });

    } catch (error) {
      console.error('Error in deleteUserResume:', error);
      
      // Handle specific validation errors
      if (error.isJoi) {
        return res.status(400).json({
          success: 0,
          error: "Validation error",
          message: "Invalid input data",
          details: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        });
      }

      res.status(500).json({
        success: 0,
        error: "Internal server error occurred while deleting resume"
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
  update_user_skills: {
    requested_user_id: joi.string().required(),
    skills: joi.string().required(),
    user_id: joi.string().required(),
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
    ),
    user_id: joi.string().required(),
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
    ),
    user_id: joi.string().required(),
  },
  get_user_info: {
    requested_user_id: joi.string().required(),
    user_id: joi.string().required(),
  },
  submit_user_details: {
    requested_user_id: joi.required(),
    profile: joi.object().keys({
      dateOfBirth: joi.string().required(),
      gender: joi.string().required(),
      currentSalary: joi.string().required(),
      isAnnually: joi.string().required(),
      countryId: joi.string().required(),
      stateId: joi.string().required(),
      cityId: joi.string().optional().allow(''),
      zipcode: joi.string().required(),
      address: joi.string().required(),
    }),
    education: joi.array().items(
      joi.object().keys({
        degreeName: joi.string().required(),
        instituteName: joi.string().required(),
        startDate: joi.string().required(),
        endDate: joi.string().required(),
        percentage: joi.string().optional().allow(''),
        cgpa: joi.string().optional().allow(''),
      }),
    ),
    experience: joi.array().items(
      joi.object().keys({
        companyName: joi.string().required(),
        jobTitle: joi.string().required(),
        isCurrentJob: joi.required(),
        startDate: joi.string().required(),
        endDate: joi.string().optional().allow(''),
        description: joi.string().optional().allow(''),
        countryId: joi.string().optional().allow(''),
        stateId: joi.string().optional().allow(''),
        cityId: joi.string().optional().allow(''),
      }),
    ),
    skills: joi.array().items(joi.optional().allow('')),
    user_id: joi.required(),
  },
  get_resume_info: {
    requested_user_id: joi.required()
  },
  // New validation schemas for resume management
  add_user_resume: {
    user_id: joi.string().required().messages({
      'string.empty': 'User ID is required',
      'any.required': 'User ID is required'
    }),
    resume_name: joi.string().required().min(3).max(100).messages({
      'string.empty': 'Resume name is required',
      'string.min': 'Resume name must be at least 3 characters long',
      'string.max': 'Resume name cannot exceed 100 characters',
      'any.required': 'Resume name is required'
    })
  },
  update_user_resume: {
    resume_id: joi.string().required().messages({
      'string.empty': 'Resume ID is required',
      'any.required': 'Resume ID is required'
    }),
    user_id: joi.string().required().messages({
      'string.empty': 'User ID is required',
      'any.required': 'User ID is required'
    }),
    resume_name: joi.string().required().min(3).max(100).messages({
      'string.empty': 'Resume name is required',
      'string.min': 'Resume name must be at least 3 characters long',
      'string.max': 'Resume name cannot exceed 100 characters',
      'any.required': 'Resume name is required'
    })
  },
  get_user_resumes: {
    user_id: joi.string().required().messages({
      'string.empty': 'User ID is required',
      'any.required': 'User ID is required'
    })
  },
  delete_user_resume: {
    resume_id: joi.string().required().messages({
      'string.empty': 'Resume ID is required',
      'any.required': 'Resume ID is required'
    }),
    user_id: joi.string().required().messages({
      'string.empty': 'User ID is required',
      'any.required': 'User ID is required'
    })
  }
};

export default UserService;