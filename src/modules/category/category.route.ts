import { Router } from "express";

import { auth } from "../../middleware/auth";
import { adminOnly } from "../../middleware/admin";
import { validateRequest } from "../../middleware/validateRequest";

import { categoryController } from "./category.controller";
import { categoryUploadController } from "./categoryUploadController";
import { categoryZodSchema } from "./category.validate";

const categoryRoutes = Router();

// =====================================
// PUBLIC
// =====================================

categoryRoutes.get("/", categoryController.getCategories);

categoryRoutes.get("/:id", categoryController.getCategoryById);

// =====================================
// ADMIN
// =====================================

categoryRoutes.post(
  "/upload-signature",
  auth,
  adminOnly,
  categoryUploadController.getUploadSignature,
);

categoryRoutes.post(
  "/",
  auth,
  adminOnly,
  validateRequest(categoryZodSchema.createCategory),
  categoryController.createCategory,
);

categoryRoutes.patch(
  "/:id",
  auth,
  adminOnly,
  validateRequest(categoryZodSchema.updateCategory),
  categoryController.updateCategory,
);

categoryRoutes.delete(
  "/:id",
  auth,
  adminOnly,
  categoryController.deleteCategory,
);

export default categoryRoutes;
