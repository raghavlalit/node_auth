import express from "express";
import Auth from "../controller/authService.js";
import verifyToken from "../middleware/auth.js";
import userRouter from './user.routes.js';

const router = express.Router();

/**AUTH & LOGIN ROUTER */
router.post('/login', Auth.Login);

/**AUTH & REGISTER ROUTER */
router.post('/register', Auth.Register);

router.use('/users', verifyToken, userRouter);

export default router;