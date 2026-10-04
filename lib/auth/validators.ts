// filepath: lib/auth/validators.ts
import { z } from "zod";

export const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, "Username is required")
    .max(50, "Username too long"),
  password: z
    .string()
    .min(1, "Password is required")
    .max(100, "Password too long"),
});

export const createStaffSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name too long"),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username too long")
    .regex(/^[a-z0-9_]+$/, "Username can only contain lowercase letters, numbers, and underscores"),
  password: z
    .string()
    .min(4, "Password must be at least 4 characters")
    .max(100, "Password too long"),
});

export type CreateStaffInput = z.infer<typeof createStaffSchema>;

export const toggleStaffStatusSchema = z.object({
  staffId: z.string().uuid("Invalid staff ID"),
  isActive: z.boolean(),
});

export type ToggleStaffStatusInput = z.infer<typeof toggleStaffStatusSchema>;

export const resetPasswordSchema = z.object({
  staffId: z.string().uuid("Invalid staff ID"),
  newPassword: z
    .string()
    .min(4, "New password must be at least 4 characters")
    .max(100, "Password too long"),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
