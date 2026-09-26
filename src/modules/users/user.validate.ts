import z from "zod";

const userCreateZodSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(255, "Name cannot be more than 255 characters"),

  email: z.email({
    error: "Invalid email",
  }),

  phone: z.string().min(5),

  password: z.string().min(8, "Password must be at least 8 characters"),
});

const userLoginZodSchema = z.object({
  email: z.email({
    error: "Invalid email",
  }),

  password: z.string().min(1),
});

export const userZodSchema = {
  userCreateZodSchema,
  userLoginZodSchema,
};
