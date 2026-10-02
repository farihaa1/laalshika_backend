import { Request, Response } from "express";

import { catchAsync } from "../utils/catchAsync";

import { cartService } from "./cart.service";

// ============================================================
// GET CART
// ============================================================

const getCart = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const cart = await cartService.getCart(userId);

  return res.status(200).json({
    success: true,

    message: "Cart retrieved successfully",

    data: cart,
  });
});

// ============================================================
// ADD TO CART
// ============================================================

const addToCart = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const { productId, quantity, variant } = req.body;

  const cart = await cartService.addToCart(
    userId,
    productId,
    quantity,
    variant,
  );

  return res.status(200).json({
    success: true,

    message: "Item added to cart successfully",

    data: cart,
  });
});

// ============================================================
// UPDATE QUANTITY
// ============================================================

const updateCartQuantity = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const { productId, sku, color, size, quantity } = req.body;

  const cart = await cartService.updateCartQuantity(
    userId,
    productId,
    sku,
    color,
    size,
    quantity,
  );

  return res.status(200).json({
    success: true,

    message: "Cart quantity updated successfully",

    data: cart,
  });
});

// ============================================================
// REMOVE
// ============================================================

const removeFromCart = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const { productId, sku, color, size } = req.body;

  const cart = await cartService.removeFromCart(
    userId,
    productId,
    sku,
    color,
    size,
  );

  return res.status(200).json({
    success: true,

    message: "Item removed from cart",

    data: cart,
  });
});

// ============================================================
// CLEAR
// ============================================================

const clearCart = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const cart = await cartService.clearCart(userId);

  return res.status(200).json({
    success: true,

    message: "Cart cleared successfully",

    data: cart,
  });
});

// ============================================================
// SYNC
// ============================================================

const syncCart = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const { items } = req.body;

  const cart = await cartService.syncCart(userId, items);

  return res.status(200).json({
    success: true,

    message: "Cart synchronized successfully",

    data: cart,
  });
});

// ============================================================
// EXPORT
// ============================================================

export const cartController = {
  getCart,

  addToCart,

  updateCartQuantity,

  removeFromCart,

  clearCart,

  syncCart,
};
