import mongoose from "mongoose";
import AppError from "../../error/AppError";
import Cart from "./cart.model";
import { ICartItem, ICartVariant } from "./cart.interface";
import { CART_CONSTANTS } from "./cart.constant";
import Product from "../product/product.model";

// ============================================================
// TYPES
// ============================================================

interface ICartRequestVariant {
  color?: string;
  size?: string;
  sku?: string;
}

// ============================================================
// PRODUCT ID
// ============================================================

const getProductId = (productId: string) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new AppError(400, "Invalid product ID");
  }

  return productId;
};

// ============================================================
// GET USER CART
// ============================================================

const getCart = async (userId: string) => {
  let cart = await Cart.findOne({
    user: userId,
  });

  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [],
    });
  }

  return cart;
};

// ============================================================
// GET ACTIVE PRODUCT
// ============================================================

const getActiveProduct = async (productId: string) => {
  const validProductId = getProductId(productId);

  const product = await Product.findOne({
    _id: validProductId,
    isActive: true,
  });

  if (!product) {
    throw new AppError(404, "Product not found or inactive");
  }

  return product;
};

// ============================================================
// FIND VARIANT
// ============================================================

const findVariant = (product: any, requestedVariant?: ICartRequestVariant) => {
  // ----------------------------------------------------------
  // NO VARIANTS
  // ----------------------------------------------------------

  if (!product.variants || product.variants.length === 0) {
    return undefined;
  }

  // ----------------------------------------------------------
  // VARIANTS EXIST BUT NOTHING SELECTED
  // ----------------------------------------------------------

  if (!requestedVariant) {
    throw new AppError(400, "Please select a product variant");
  }

  // ----------------------------------------------------------
  // SKU MATCH
  // ----------------------------------------------------------

  if (requestedVariant.sku) {
    const variant = product.variants.find(
      (item: any) => item.sku === requestedVariant.sku,
    );

    if (!variant) {
      throw new AppError(400, "Selected variant is not available");
    }

    return variant;
  }

  // ----------------------------------------------------------
  // COLOR + SIZE MATCH
  // ----------------------------------------------------------

  const variant = product.variants.find((item: any) => {
    const attributes = item.attributes ?? [];

    const colorAttribute = attributes.find(
      (attribute: any) => attribute.name?.toLowerCase() === "color",
    );

    const sizeAttribute = attributes.find(
      (attribute: any) => attribute.name?.toLowerCase() === "size",
    );

    const colorMatches =
      requestedVariant.color === undefined ||
      colorAttribute?.value === requestedVariant.color;

    const sizeMatches =
      requestedVariant.size === undefined ||
      sizeAttribute?.value === requestedVariant.size;

    return colorMatches && sizeMatches;
  });

  if (!variant) {
    throw new AppError(400, "Selected variant is not available");
  }

  return variant;
};

// ============================================================
// BUILD SAFE VARIANT
//
// IMPORTANT:
// With exactOptionalPropertyTypes:
// color?: string
//
// means:
//   property may be omitted
//
// It does NOT mean:
//   color: undefined
//
// So we only add a property when
// its value actually exists.
// ============================================================

const buildVariant = (
  color: string | undefined,
  size: string | undefined,
  sku: string | undefined,
): ICartVariant | undefined => {
  const variant: ICartVariant = {};

  if (color !== undefined) {
    variant.color = color;
  }

  if (size !== undefined) {
    variant.size = size;
  }

  if (sku !== undefined) {
    variant.sku = sku;
  }

  if (Object.keys(variant).length === 0) {
    return undefined;
  }

  return variant;
};

// ============================================================
// BUILD REQUEST VARIANT
//
// This is the other important fix.
//
// Instead of doing:
//
// {
//   sku,
//   color,
//   size,
// }
//
// we only add properties that exist.
// ============================================================

const buildRequestVariant = (
  sku: string | undefined,
  color: string | undefined,
  size: string | undefined,
): ICartRequestVariant | undefined => {
  const variant: ICartRequestVariant = {};

  if (sku !== undefined) {
    variant.sku = sku;
  }

  if (color !== undefined) {
    variant.color = color;
  }

  if (size !== undefined) {
    variant.size = size;
  }

  if (Object.keys(variant).length === 0) {
    return undefined;
  }

  return variant;
};

// ============================================================
// BUILD CART ITEM FROM DATABASE
// ============================================================

const buildCartItem = async (
  productId: string,
  quantity: number,
  requestedVariant?: ICartRequestVariant,
): Promise<ICartItem> => {
  // ----------------------------------------------------------
  // MAX QUANTITY
  // ----------------------------------------------------------

  if (quantity > CART_CONSTANTS.MAX_QUANTITY_PER_ITEM) {
    throw new AppError(
      400,
      `Maximum quantity is ${CART_CONSTANTS.MAX_QUANTITY_PER_ITEM}`,
    );
  }

  // ----------------------------------------------------------
  // PRODUCT
  // ----------------------------------------------------------

  const product = await getActiveProduct(productId);

  // ----------------------------------------------------------
  // VARIANT
  // ----------------------------------------------------------

  const variant = findVariant(product, requestedVariant);

  // ----------------------------------------------------------
  // STOCK
  // ----------------------------------------------------------

  const availableStock = variant
    ? Number(variant.stock ?? 0)
    : Number(product.stock ?? 0);

  if (availableStock <= 0) {
    throw new AppError(400, "Product is out of stock");
  }

  if (quantity > availableStock) {
    throw new AppError(400, `Only ${availableStock} item(s) available`);
  }

  // ----------------------------------------------------------
  // PRICE
  // ----------------------------------------------------------

  const regularPrice = variant?.price ?? product.price ?? 0;

  const discountPrice = product.discountPrice;

  const finalPrice =
    discountPrice !== undefined && discountPrice < regularPrice
      ? discountPrice
      : regularPrice;

  // ----------------------------------------------------------
  // ATTRIBUTES
  // ----------------------------------------------------------

  const attributes = variant?.attributes ?? [];

  const color = attributes.find(
    (attribute: any) => attribute.name?.toLowerCase() === "color",
  )?.value;

  const size = attributes.find(
    (attribute: any) => attribute.name?.toLowerCase() === "size",
  )?.value;

  // ----------------------------------------------------------
  // IMAGE
  // ----------------------------------------------------------

  const image = variant?.images?.[0] ?? product.images?.[0] ?? "";

  // ----------------------------------------------------------
  // SAFE VARIANT
  // ----------------------------------------------------------

  const safeVariant = buildVariant(color, size, variant?.sku);

  // ----------------------------------------------------------
  // BUILD ITEM
  // ----------------------------------------------------------

  const item: ICartItem = {
    productId: product._id.toString(),

    name: product.name,

    slug: product.slug,

    image,

    price: finalPrice,

    quantity,
  };

  // IMPORTANT:
  // Don't do:
  //
  // variant: safeVariant
  //
  // because safeVariant can be undefined.
  //
  // Instead, only add the property
  // when it exists.

  if (safeVariant !== undefined) {
    item.variant = safeVariant;
  }

  return item;
};

// ============================================================
// SAME CART ITEM
// ============================================================

const isSameCartItem = (
  cartItem: ICartItem,
  productId: string,
  variant?: ICartRequestVariant,
) => {
  if (cartItem.productId !== productId) {
    return false;
  }

  // ----------------------------------------------------------
  // SKU
  // ----------------------------------------------------------

  if (variant?.sku !== undefined || cartItem.variant?.sku !== undefined) {
    return cartItem.variant?.sku === variant?.sku;
  }

  // ----------------------------------------------------------
  // COLOR + SIZE
  // ----------------------------------------------------------

  return (
    cartItem.variant?.color === variant?.color &&
    cartItem.variant?.size === variant?.size
  );
};

// ============================================================
// ADD TO CART
// ============================================================

const addToCart = async (
  userId: string,
  productId: string,
  quantity: number,
  variant?: ICartRequestVariant,
) => {
  const cart = await getCart(userId);

  // ----------------------------------------------------------
  // BUILD AUTHORITATIVE ITEM
  // ----------------------------------------------------------

  const newItem = await buildCartItem(productId, quantity, variant);

  // ----------------------------------------------------------
  // FIND EXISTING
  // ----------------------------------------------------------

  const existingItem = cart.items.find((cartItem) =>
    isSameCartItem(cartItem, productId, variant),
  );

  // ----------------------------------------------------------
  // EXISTING ITEM
  // ----------------------------------------------------------

  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;

    if (newQuantity > CART_CONSTANTS.MAX_QUANTITY_PER_ITEM) {
      throw new AppError(
        400,
        `Maximum quantity is ${CART_CONSTANTS.MAX_QUANTITY_PER_ITEM}`,
      );
    }

    // --------------------------------------------------------
    // RE-CHECK PRODUCT
    // --------------------------------------------------------

    const product = await getActiveProduct(productId);

    const selectedVariant = findVariant(product, variant);

    const availableStock = selectedVariant
      ? Number(selectedVariant.stock ?? 0)
      : Number(product.stock ?? 0);

    if (newQuantity > availableStock) {
      throw new AppError(400, `Only ${availableStock} item(s) available`);
    }

    // --------------------------------------------------------
    // REFRESH DATA
    // --------------------------------------------------------

    existingItem.name = newItem.name;

    existingItem.slug = newItem.slug;

    existingItem.image = newItem.image;

    existingItem.price = newItem.price;

    existingItem.quantity = newQuantity;

    // --------------------------------------------------------
    // VARIANT
    // --------------------------------------------------------

    if (newItem.variant !== undefined) {
      existingItem.variant = newItem.variant;
    } else {
      delete existingItem.variant;
    }
  }

  // ----------------------------------------------------------
  // NEW ITEM
  // ----------------------------------------------------------
  else {
    cart.items.push(newItem);
  }

  await cart.save();

  return cart;
};

// ============================================================
// UPDATE QUANTITY
// ============================================================

const updateCartQuantity = async (
  userId: string,
  productId: string,
  sku: string | undefined,
  color: string | undefined,
  size: string | undefined,
  quantity: number,
) => {
  // --------------------------------------------------------
  // MAX
  // --------------------------------------------------------

  if (quantity > CART_CONSTANTS.MAX_QUANTITY_PER_ITEM) {
    throw new AppError(
      400,
      `Maximum quantity is ${CART_CONSTANTS.MAX_QUANTITY_PER_ITEM}`,
    );
  }

  // --------------------------------------------------------
  // CART
  // --------------------------------------------------------

  const cart = await getCart(userId);

  // --------------------------------------------------------
  // BUILD VARIANT SAFELY
  // --------------------------------------------------------

  const requestedVariant = buildRequestVariant(sku, color, size);

  // --------------------------------------------------------
  // FIND ITEM
  // --------------------------------------------------------

  const item = cart.items.find((cartItem) =>
    isSameCartItem(cartItem, productId, requestedVariant),
  );

  if (!item) {
    throw new AppError(404, "Cart item not found");
  }

  // --------------------------------------------------------
  // PRODUCT
  // --------------------------------------------------------

  const product = await getActiveProduct(productId);

  // --------------------------------------------------------
  // USE EXISTING CART VARIANT
  // --------------------------------------------------------

  const variant = findVariant(product, item.variant);

  // --------------------------------------------------------
  // STOCK
  // --------------------------------------------------------

  const availableStock = variant
    ? Number(variant.stock ?? 0)
    : Number(product.stock ?? 0);

  if (quantity > availableStock) {
    throw new AppError(400, `Only ${availableStock} item(s) available`);
  }

  // --------------------------------------------------------
  // PRICE
  // --------------------------------------------------------

  const regularPrice = variant?.price ?? product.price ?? 0;

  const discountPrice = product.discountPrice;

  const finalPrice =
    discountPrice !== undefined && discountPrice < regularPrice
      ? discountPrice
      : regularPrice;

  // --------------------------------------------------------
  // UPDATE
  // --------------------------------------------------------

  item.price = finalPrice;

  item.name = product.name;

  item.slug = product.slug;

  item.image = variant?.images?.[0] ?? product.images?.[0] ?? "";

  item.quantity = quantity;

  await cart.save();

  return cart;
};

// ============================================================
// REMOVE ITEM
// ============================================================

const removeFromCart = async (
  userId: string,
  productId: string,
  sku: string | undefined,
  color: string | undefined,
  size: string | undefined,
) => {
  const cart = await getCart(userId);

  // --------------------------------------------------------
  // BUILD VARIANT SAFELY
  // --------------------------------------------------------

  const requestedVariant = buildRequestVariant(sku, color, size);

  // --------------------------------------------------------
  // OLD LENGTH
  // --------------------------------------------------------

  const oldLength = cart.items.length;

  // --------------------------------------------------------
  // REMOVE
  // --------------------------------------------------------

  cart.items = cart.items.filter(
    (item) => !isSameCartItem(item, productId, requestedVariant),
  );

  // --------------------------------------------------------
  // NOT FOUND
  // --------------------------------------------------------

  if (cart.items.length === oldLength) {
    throw new AppError(404, "Cart item not found");
  }

  await cart.save();

  return cart;
};

// ============================================================
// CLEAR CART
// ============================================================

const clearCart = async (userId: string) => {
  const cart = await getCart(userId);

  cart.items = [];

  await cart.save();

  return cart;
};

// ============================================================
// SYNC GUEST CART
// ============================================================

const syncCart = async (userId: string, guestItems: ICartItem[]) => {
  const cart = await getCart(userId);

  // ----------------------------------------------------------
  // GUEST ITEMS
  // ----------------------------------------------------------

  for (const guestItem of guestItems) {
    const validatedItem = await buildCartItem(
      guestItem.productId,
      guestItem.quantity,
      guestItem.variant,
    );

    // --------------------------------------------------------
    // FIND EXISTING
    // --------------------------------------------------------

    const existingItem = cart.items.find((cartItem) =>
      isSameCartItem(cartItem, guestItem.productId, guestItem.variant),
    );

    // --------------------------------------------------------
    // EXISTING
    // --------------------------------------------------------

    if (existingItem) {
      const mergedQuantity = Math.min(
        existingItem.quantity + validatedItem.quantity,

        CART_CONSTANTS.MAX_QUANTITY_PER_ITEM,
      );

      // ------------------------------------------------------
      // PRODUCT
      // ------------------------------------------------------

      const product = await getActiveProduct(guestItem.productId);

      // ------------------------------------------------------
      // VARIANT
      // ------------------------------------------------------

      const variant = findVariant(product, guestItem.variant);

      // ------------------------------------------------------
      // STOCK
      // ------------------------------------------------------

      const availableStock = variant
        ? Number(variant.stock ?? 0)
        : Number(product.stock ?? 0);

      if (mergedQuantity > availableStock) {
        throw new AppError(
          400,
          `Only ${availableStock} item(s) available for ${product.name}`,
        );
      }

      // ------------------------------------------------------
      // UPDATE
      // ------------------------------------------------------

      existingItem.name = validatedItem.name;

      existingItem.slug = validatedItem.slug;

      existingItem.image = validatedItem.image;

      existingItem.price = validatedItem.price;

      existingItem.quantity = mergedQuantity;

      if (validatedItem.variant !== undefined) {
        existingItem.variant = validatedItem.variant;
      } else {
        delete existingItem.variant;
      }
    }

    // --------------------------------------------------------
    // NEW
    // --------------------------------------------------------
    else {
      cart.items.push(validatedItem);
    }
  }

  await cart.save();

  return cart;
};

// ============================================================
// EXPORT
// ============================================================

export const cartService = {
  getCart,

  addToCart,

  updateCartQuantity,

  removeFromCart,

  clearCart,

  syncCart,
};
