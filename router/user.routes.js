import express from "express";
import UserService from "../controller/userService.js";

const router = express.Router();

/**User ROUTER */
router.get('/user', UserService.getUserList);

export default router;