import z from "zod";

const variantAttributeSchema = z.object({
  name: z.string().min(1, "Attribute name is required"),
  value: z.string().min(1, "Attribute value is required"),
});

const productVariantSchema = z.object({
  attributes: z
    .array(variantAttributeSchema)
    .min(1, "At least one variant attribute is required"),

  sku: z.string().min(1).optional(),

  stock: z.number().int().min(0),

  price: z.number().min(0).optional(),

  images: z.array(z.string().url()).optional(),
});

const specificationSchema = z.object({
  key: z.string().min(1, "Specification key is required"),
  value: z.string().min(1, "Specification value is required"),
});

const createProduct = z
  .object({
    name: z.string().min(2).max(200),

    slug: z
      .string()
      .min(2)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),

    description: z.string().min(10),

    category: z.string().min(1),

    price: z.number().min(0),

    discountPrice: z.number().min(0).optional(),

    images: z.array(z.string().url()).min(1),

    variants: z.array(productVariantSchema).optional(),

    stock: z.number().int().min(0),

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

const updateProduct = z.object({
  name: z.string().min(2).max(200).optional(),

  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
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
});

export const productZodSchema = {
  createProduct,
  updateProduct,
};
