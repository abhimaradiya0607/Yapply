import { z } from "zod";

export const onboardingSchema = z.object({
  fullname: z
    .string()
    .trim()
    .min(2, "Full name must contain at least 2 characters")
    .max(255, "Full name cannot exceed 255 characters"),

  bio: z
    .string()
    .trim()
    .min(1, "Bio is required")
    .max(1000, "Bio cannot exceed 1000 characters"),

  nativelanguage: z
    .string()
    .trim()
    .min(2, "Native language is required")
    .max(100, "Native language cannot exceed 100 characters"),

  learninglanguage: z
    .string()
    .trim()
    .min(2, "Learning language is required")
    .max(100, "Learning language cannot exceed 100 characters"),

  location: z
    .string()
    .trim()
    .min(2, "Location is required")
    .max(255, "Location cannot exceed 255 characters"),
});

export type OnboardingData = z.infer<typeof onboardingSchema>;