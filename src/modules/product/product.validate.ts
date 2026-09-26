import z from "zod";

const productVariantSchema = z.object({
  name: z.string().min(1, "Variant name is required"),
  value: z.string().min(1, "Variant value is required"),
  stock: z.number().int().min(0, "Stock cannot be negative"),
});

const specificationSchema = z.object({
  key: z.string().min(1, "Specification key is required"),
  value: z.string().min(1, "Specification value is required"),
});

const createProduct = z
  .object({
    name: z
      .string()
      .min(2, "Product name must be at least 2 characters")
      .max(200, "Product name cannot exceed 200 characters"),

    slug: z
      .string()
      .min(2, "Slug is required")
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug can only contain lowercase letters, numbers and hyphens",
      ),

    description: z
      .string()
      .min(10, "Description must be at least 10 characters"),

    category: z.string().min(1, "Category is required"),

    price: z.number().min(0, "Price cannot be negative"),

    discountPrice: z
      .number()
      .min(0, "Discount price cannot be negative")
      .optional(),

    images: z
      .array(z.string().url("Each image must be a valid URL"))
      .min(1, "At least one product image is required"),

    variants: z.array(productVariantSchema).optional(),

    stock: z.number().int().min(0, "Stock cannot be negative"),

    specifications: z.array(specificationSchema).optional(),

    isFeatured: z.boolean().optional(),

    isActive: z.boolean().optional(),
  })
  .refine(
    (data) =>
      data.discountPrice === undefined || data.discountPrice < data.price,
    {
      message: "Discount price must be less than regular price",
      path: ["discountPrice"],
    },
  );

const updateProduct = z
  .object({
    name: z.string().min(2).max(200).optional(),

    slug: z
      .string()
      .min(2)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug")
      .optional(),

    description: z.string().min(10).optional(),

    category: z.string().min(1).optional(),

    price: z.number().min(0).optional(),

    discountPrice: z.number().min(0).optional(),

    images: z.array(z.string().url()).min(1).optional(),

    variants: z.array(productVariantSchema).optional(),

    stock: z.number().int().min(0).optional(),

    specifications: z.array(specificationSchema).optional(),

    isFeatured: z.boolean().optional(),

    isActive: z.boolean().optional(),
  })
  .refine(
    (data) =>
      data.price === undefined ||
      data.discountPrice === undefined ||
      data.discountPrice < data.price,
    {
      message: "Discount price must be less than regular price",
      path: ["discountPrice"],
    },
  );

export const productZodSchema = {
  createProduct,
  updateProduct,
};
