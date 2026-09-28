import z from "zod";

const createCategory = z.object({
  name: z
    .string()
    .min(2, "Category name must be at least 2 characters")
    .max(100),

  slug: z
    .string()
    .min(2, "Category slug is required")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug can only contain lowercase letters, numbers and hyphens",
    ),

  parent: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid parent category ID")
    .nullable()
    .optional(),

  image: z.string().url("Invalid image URL").optional().or(z.literal("")),

  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),

  isActive: z.boolean().optional(),

  sortOrder: z.number().int().min(0).optional(),
});

const updateCategory = z.object({
  name: z.string().min(2).max(100).optional(),

  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid category slug")
    .optional(),

  parent: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid parent category ID")
    .nullable()
    .optional(),

  image: z.string().url("Invalid image URL").optional().or(z.literal("")),

  description: z.string().max(500).optional(),

  isActive: z.boolean().optional(),

  sortOrder: z.number().int().min(0).optional(),
});

export const categoryZodSchema = {
  createCategory,
  updateCategory,
};
