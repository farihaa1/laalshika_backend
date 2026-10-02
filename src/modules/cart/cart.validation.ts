import { z } from "zod";

// ============================================================
// VARIANT
// ============================================================

const cartVariantSchema = z
  .object({
    color: z.string().optional(),
    size: z.string().optional(),
    sku: z.string().optional(),
  })
  .optional();

// ============================================================
// CART ITEM
// ============================================================

const cartItemSchema = z.object({
  productId: z.string().min(1),

  name: z.string().min(1).max(200),

  slug: z.string().min(1),

  image: z.string().optional(),

  price: z.number().min(0),

  quantity: z.number().int().min(1).max(10),

  variant: cartVariantSchema,
});

// ============================================================
// ADD TO CART
// ============================================================

const addToCartZodSchema = z.object({
  productId: z.string().min(1),

  quantity: z.number().int().min(1).max(10),

  variant: cartVariantSchema,
});

// ============================================================
// UPDATE QUANTITY
// ============================================================

const updateCartQuantityZodSchema = z.object({
  productId: z.string().min(1),

  sku: z.string().optional(),

  color: z.string().optional(),

  size: z.string().optional(),

  quantity: z.number().int().min(1).max(10),
});

// ============================================================
// REMOVE ITEM
// ============================================================

const removeCartItemZodSchema = z.object({
  productId: z.string().min(1),

  sku: z.string().optional(),

  color: z.string().optional(),

  size: z.string().optional(),
});

// ============================================================
// SYNC CART
// ============================================================

const syncCartZodSchema = z.object({
  items: z.array(cartItemSchema),
});

// ============================================================
// EXPORT
// ============================================================

export const cartValidation = {
  addToCartZodSchema,

  updateCartQuantityZodSchema,

  removeCartItemZodSchema,

  syncCartZodSchema,
};
