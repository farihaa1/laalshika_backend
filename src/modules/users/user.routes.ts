import { Router } from "express";
import { validateRequest } from "../../middleware/validateRequest";
import { userZodSchema } from "./user.validate";
import { userController } from "./user.controller";

const userRoutes = Router();

userRoutes.post("/", validateRequest(userZodSchema.userCreateZodSchema), userController.registerUser)
