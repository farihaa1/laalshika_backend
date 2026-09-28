import { Router } from "express";

import { auth } from "../../middleware/auth";
import { adminOnly } from "../../middleware/admin";
import { validateRequest } from "../../middleware/validateRequest";

import { productController } from "./product.controller";
import { productUploadController } from "./product.upload.controller";
import { productZodSchema } from "./product.validate";

const productRoutes = Router();

// =====================================
// PUBLIC
// =====================================

productRoutes.get("/", productController.getProducts);

productRoutes.get("/slug/:slug", productController.getProductBySlug);

productRoutes.get("/:id/related", productController.getRelatedProducts);

// =====================================
// ADMIN
// =====================================

productRoutes.post(
  "/upload-signature",
  auth,
  adminOnly,
  productUploadController.getUploadSignature,
);

productRoutes.post(
  "/",
  auth,
  adminOnly,
  validateRequest(productZodSchema.createProduct),
  productController.createProduct,
);

productRoutes.patch(
  "/:id",
  auth,
  adminOnly,
  validateRequest(productZodSchema.updateProduct),
  productController.updateProduct,
);

productRoutes.delete("/:id", auth, adminOnly, productController.deleteProduct);

export default productRoutes;
