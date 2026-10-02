import { Schema, model } from "mongoose";

import { ICart, ICartItem, ICartVariant } from "./cart.interface";

// ============================================================
// CART VARIANT SCHEMA
// ============================================================

const cartVariantSchema = new Schema<ICartVariant>(
  {
    color: {
      type: String,
      default: undefined,
    },

    size: {
      type: String,
      default: undefined,
    },

    sku: {
      type: String,
      default: undefined,
    },
  },
  {
    _id: false,
  },
);

// ============================================================
// CART ITEM SCHEMA
// ============================================================

const cartItemSchema = new Schema<ICartItem>(
  {
    productId: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      default: "",
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },

    variant: {
      type: cartVariantSchema,
      default: undefined,
    },
  },
  {
    _id: false,
  },
);

// ============================================================
// CART SCHEMA
// ============================================================

const cartSchema = new Schema<ICart>(
  {
    user: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    items: {
      type: [cartItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

// ============================================================
// MODEL
// ============================================================

const Cart = model<ICart>("Cart", cartSchema);

export default Cart;
