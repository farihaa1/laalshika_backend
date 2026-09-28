import { Router } from "express";

import { validateRequest } from "../../middleware/validateRequest";

import { auth } from "../../middleware/auth";

import { userZodSchema } from "./user.validate";

import { userController } from "./user.controller";

import { googleController } from "./google.controller";

const userRoutes = Router();

// ============================================================
// LOCAL AUTH
// ============================================================

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

// ============================================================
// GOOGLE AUTH
// ============================================================

userRoutes.get(
  "/google",

  googleController.googleLogin,
);

userRoutes.get(
  "/google/callback",

  googleController.googleCallback,
);

// ============================================================
// TOKEN
// ============================================================

userRoutes.post(
  "/refresh-token",

  userController.refreshToken,
);

userRoutes.post(
  "/logout",

  userController.logoutUser,
);

// ============================================================
// CURRENT USER
// ============================================================

userRoutes.get(
  "/me",

  auth([]),

  userController.getMe,
);

export default userRoutes;
