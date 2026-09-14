import { z } from "zod";

export const userSchema = z.object({
  fullname: z.string().min(2, "Full name must contain at least 2 characters")
.max(255, "Full name cannot exceed 255 characters"),
  email: z.email("Invalid email address"),
  passwordHash: z.string().min(8).max(255),
  bio: z.string().max(1000).default(""),
  profileurl: z.string().url("Invalid profile URL").max(500).or(z.literal("")).default(""),
  nativelanguage: z.string().max(100).default(""),
  learninglanguage: z.string().max(100).default(""),
  location: z.string().max(255).default(""),
  isonboarded: z.boolean().default(false),
  friends: z.array(z.uuid("Each friend ID must be a valid UUID")).default([]),
});

export const registerSchema = z.object({
    fullname: z.string().trim()
      .min(2, "Full name must contain at least 2 characters")
      .max(255, "Full name cannot exceed 255 characters"),
  
    email: z.email("Invalid email address"),
  
    password: z.string().min(6, "Password must contain at least 8 characters")
      .max(72, "Password cannot exceed 72 characters"),
  });
  
  export type RegisterInput = z.infer<typeof registerSchema>;