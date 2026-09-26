import { Router } from "express";

import { validateRequest } from "../../middleware/validateRequest";
import { auth } from "../../middleware/auth";
import { userZodSchema } from "./user.validate";
import { userController } from "./user.controller";

const userRoutes = Router();

userRoutes.post(
  "/register",
  validateRequest(userZodSchema.userCreateZodSchema),
  userController.registerUser,
);

userRoutes.post(
  "/login",
  validateRequest(userZodSchema.userLoginZodSchema),
  userController.loginUser,
);

userRoutes.post("/refresh-token", userController.refreshToken);

userRoutes.post("/logout", userController.logoutUser);

userRoutes.get("/me", auth, userController.getMe);

export default userRoutes;
