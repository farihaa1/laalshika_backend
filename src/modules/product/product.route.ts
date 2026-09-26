import { Router } from "express";

import { auth } from "../../middleware/auth";
import { validateRequest } from "../../middleware/validateRequest";

import { productController } from "./product.controller";
import { productUploadController } from "./product.upload.controller";
import { productZodSchema } from "./product.validate";
import { adminOnly } from "../../middleware/admin";

const productRoutes = Router();

// ==============================
// PUBLIC ROUTES
// ==============================

productRoutes.get("/", productController.getProducts);

productRoutes.get("/categories", productController.getCategories);

productRoutes.get("/slug/:slug", productController.getProductBySlug);

productRoutes.get("/:id/related", productController.getRelatedProducts);

// ==============================
// ADMIN ROUTES
// ==============================

// Generate Cloudinary upload signature
productRoutes.post(
  "/upload-signature",
  auth,
  adminOnly,
  productUploadController.getUploadSignature,
);

// Create product
productRoutes.post(
  "/",
  auth,
  adminOnly,
  validateRequest(productZodSchema.createProduct),
  productController.createProduct,
);

// Update product
productRoutes.patch(
  "/:id",
  auth,
  adminOnly,
  validateRequest(productZodSchema.updateProduct),
  productController.updateProduct,
);

// Delete product
productRoutes.delete("/:id", auth, adminOnly, productController.deleteProduct);

export default productRoutes;
