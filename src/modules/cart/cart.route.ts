import { Router } from "express";

import { auth } from "../../middleware/auth";

import { validateRequest } from "../../middleware/validateRequest";

import { cartController } from "./cart.controller";

import { cartValidation } from "./cart.validation";

const cartRouter = Router();

// ============================================================
// ALL CART ROUTES REQUIRE LOGIN
// ============================================================

cartRouter.get("/", auth([]), cartController.getCart);

// ============================================================
// ADD
// ============================================================

cartRouter.post(
  "/add",

  auth([]),

  validateRequest(cartValidation.addToCartZodSchema),

  cartController.addToCart,
);

// ============================================================
// UPDATE QUANTITY
// ============================================================

cartRouter.patch(
  "/quantity",

  auth([]),

  validateRequest(cartValidation.updateCartQuantityZodSchema),

  cartController.updateCartQuantity,
);

// ============================================================
// REMOVE
// ============================================================

cartRouter.delete(
  "/item",

  auth([]),

  validateRequest(cartValidation.removeCartItemZodSchema),

  cartController.removeFromCart,
);

// ============================================================
// CLEAR
// ============================================================

cartRouter.delete(
  "/clear",

  auth([]),

  cartController.clearCart,
);

// ============================================================
// SYNC GUEST CART
// ============================================================

cartRouter.post(
  "/sync",

  auth([]),

  validateRequest(cartValidation.syncCartZodSchema),

  cartController.syncCart,
);

export default cartRouter;
