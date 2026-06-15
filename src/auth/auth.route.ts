import { Router } from "express";
import { authController } from "./auth.controller";
import { auth } from "../middleware/auth";
import { UserRole } from "../modules/users/user.constrain";

const authRouter = Router();

authRouter.post("/change-password", auth(Object.values(UserRole)), authController.changePassword);
authRouter.post("/reset-password", auth(Object.values(UserRole)), authController.resetPassword);



export default authRouter