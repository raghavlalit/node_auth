import express from "express";
import Auth from "../controller/authService.js";
import verifyToken from "../middleware/auth.js";
import UserService from "../controller/userService.js";

const router = express.Router();

router.post('/test', verifyToken, UserService.Test);

/**AUTH & LOGIN ROUTER */
router.post('/login', Auth.Login);

/**AUTH & REGISTER ROUTER */
router.post('/register', Auth.Register);

export default router;