import express from "express";
import Auth from "../controller/authService.js";
import verifyToken from "../middleware/auth.js";
import userRouter from './user.routes.js';
import UserService from "../controller/userService.js";
import adminRouter from './admin.routes.js';
import adminManagementRouter from './adminManagement.routes.js';

const router = express.Router();

/** ADMIN ROUTER */
router.use('/admin', adminRouter);

/** ADMIN MANAGEMENT ROUTER */
router.use('/admin-management', adminManagementRouter);

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