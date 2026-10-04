// filepath: lib/validators/masterDataValidators.ts
import { z } from "zod";
import { normalizePakistanPhone } from "../utils/phone";

/**
 * Validates and normalizes Pakistani phone numbers with Zod.
 */
const pakistanPhoneSchema = z
  .string()
  .trim()
  .min(1, "Phone number is required.")
  .transform((val, ctx) => {
    const res = normalizePakistanPhone(val);
    if (!res.isValid || !res.normalized) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          res.error ||
          "Invalid phone number. Must be 11 digits starting with 03 (e.g. 0300 1234567).",
      });
      return val;
    }
    return res.normalized;
  });

// Shop Settings
export const updateShopSettingsSchema = z.object({
  shopName: z
    .string()
    .trim()
    .min(2, "Shop name must be at least 2 characters.")
    .max(100, "Shop name must be under 100 characters."),
  shopNameUr: z
    .string()
    .trim()
    .min(2, "Urdu shop name must be at least 2 characters.")
    .max(100, "Urdu shop name must be under 100 characters."),
  phone: pakistanPhoneSchema,
  addressUr: z.string().trim().max(255).optional(),
});

export type UpdateShopSettingsInput = z.infer<typeof updateShopSettingsSchema>;

// Milk Types
export const createMilkTypeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(50),
  nameUr: z
    .string()
    .trim()
    .min(2, "Urdu name must be at least 2 characters.")
    .max(50),
  defaultRate: z
    .number()
    .positive("Default rate must be greater than zero."),
});

export type CreateMilkTypeInput = z.infer<typeof createMilkTypeSchema>;

export const updateMilkTypeRateSchema = z.object({
  id: z.string().uuid("Invalid milk type ID."),
  defaultRate: z
    .number()
    .positive("Default rate must be greater than zero."),
});

export type UpdateMilkTypeRateInput = z.infer<typeof updateMilkTypeRateSchema>;

export const toggleMilkTypeActiveSchema = z.object({
  id: z.string().uuid("Invalid milk type ID."),
  isActive: z.boolean(),
});

export type ToggleMilkTypeActiveInput = z.infer<typeof toggleMilkTypeActiveSchema>;

// Customers
export const createCustomerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Customer name must be at least 2 characters.")
    .max(100),
  phone: pakistanPhoneSchema,
  address: z.string().trim().max(255).optional(),
  defaultMilkTypeId: z.string().uuid("Invalid default milk type ID."),
  openingBalance: z
    .number()
    .min(0, "Opening balance cannot be negative.")
    .default(0),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;

export const updateCustomerSchema = z.object({
  id: z.string().uuid("Invalid customer ID."),
  name: z
    .string()
    .trim()
    .min(2, "Customer name must be at least 2 characters.")
    .max(100),
  phone: pakistanPhoneSchema,
  address: z.string().trim().max(255).optional(),
  defaultMilkTypeId: z.string().uuid("Invalid default milk type ID."),
});

export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;

export const toggleCustomerActiveSchema = z.object({
  id: z.string().uuid("Invalid customer ID."),
  isActive: z.boolean(),
});

export type ToggleCustomerActiveInput = z.infer<typeof toggleCustomerActiveSchema>;

// Special Customer Rates
export const upsertSpecialRateSchema = z.object({
  customerId: z.string().uuid("Invalid customer ID."),
  milkTypeId: z.string().uuid("Invalid milk type ID."),
  rate: z
    .number()
    .positive("Rate must be greater than zero."),
});

export type UpsertSpecialRateInput = z.infer<typeof upsertSpecialRateSchema>;

export const deleteSpecialRateSchema = z.object({
  customerId: z.string().uuid("Invalid customer ID."),
  milkTypeId: z.string().uuid("Invalid milk type ID."),
});

export type DeleteSpecialRateInput = z.infer<typeof deleteSpecialRateSchema>;
