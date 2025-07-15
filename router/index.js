import express from "express";
import Auth from "../controller/authService.js";
import verifyToken from "../middleware/auth.js";
import userRouter from './user.routes.js';
import UserService from "../controller/userService.js";

const router = express.Router();

/**AUTH & LOGIN ROUTER */
router.post('/login', Auth.Login);

/**AUTH & REGISTER ROUTER */
router.post('/register', Auth.Register);

/**USER ROUTER */
router.use('/users', verifyToken, userRouter);
// router.use('/users', userRouter);

router.post('/submit-user-details', verifyToken, UserService.submitUserDetails);

router.post('/get-resume-info', verifyToken, UserService.getResumeInfo);

export default router;