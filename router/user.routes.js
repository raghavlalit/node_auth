import express from "express";
import UserService from "../controller/userService.js";

const router = express.Router();

/**User ROUTER */
router.get('/user', UserService.getUserList);

router.post('/update-user-profile', UserService.updateUserProfile);

router.post('/update-user-skills', UserService.updateUserSkills);

router.post('/update-user-education', UserService.updateUserEducation);

router.post('/update-user-experience', UserService.updateUserExperience);

router.post('/get-user-info', UserService.getUserInfo);

// New resume management routes
router.post('/add-user-resume', UserService.addUserResume);
router.post('/update-user-resume', UserService.updateUserResume);
router.post('/get-user-resumes', UserService.getUserResumes);
router.post('/delete-user-resume', UserService.deleteUserResume);

export default router;