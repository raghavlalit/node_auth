import express from "express";
import UserService from "../controller/userService.js";

const router = express.Router();

/**User ROUTER */
router.get('/user', UserService.getUserList);
router.post('/update-user-profile', UserService.updateUserProfile);

export default router;