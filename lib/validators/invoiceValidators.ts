// filepath: lib/validators/invoiceValidators.ts
import { z } from "zod";

const dateStringSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format.");

const invoiceLineInputSchema = z.object({
  entryDate: dateStringSchema,
  milkTypeId: z.string().uuid("Invalid milk type ID."),
  liters: z.number().positive("Please enter a valid number of liters."),
  rate: z.number().positive("Rate must be greater than zero."),
});

export const createWeeklyInvoiceSchema = z
  .object({
    customerId: z.string().uuid("Invalid customer ID."),
    weekStart: dateStringSchema,
    weekEnd: dateStringSchema,
    lines: z
      .array(invoiceLineInputSchema)
      .min(1, "At least one delivery line is required to generate a bill."),
  })
  .refine((data) => data.weekStart <= data.weekEnd, {
    message: "Week start date cannot be after week end date.",
    path: ["weekEnd"],
  })
  .refine(
    (data) => data.lines.every((line) => line.entryDate >= data.weekStart && line.entryDate <= data.weekEnd),
    { message: "Every entry date must be inside the selected week.", path: ["lines"] }
  );

export type CreateWeeklyInvoiceInput = z.infer<typeof createWeeklyInvoiceSchema>;

export const voidInvoiceSchema = z.object({
  invoiceId: z.string().uuid("Invalid invoice ID."),
});

export type VoidInvoiceInput = z.infer<typeof voidInvoiceSchema>;

export const markInvoiceSharedSchema = z.object({
  invoiceId: z.string().uuid("Invalid invoice ID."),
});

export type MarkInvoiceSharedInput = z.infer<typeof markInvoiceSharedSchema>;

export const listInvoicesFilterSchema = z.object({
  customerId: z.string().uuid().optional(),
  status: z.enum(["ALL", "ISSUED", "VOID"]).default("ALL").optional(),
  createdBy: z.string().uuid().optional(),
  search: z.string().trim().optional(),
  weekStart: dateStringSchema.optional(),
  weekEnd: dateStringSchema.optional(),
});

export type ListInvoicesFilterInput = z.infer<typeof listInvoicesFilterSchema>;

export const weeklyBillsOverviewSchema = z.object({
  weekStart: dateStringSchema,
  weekEnd: dateStringSchema,
}).refine((data) => data.weekStart <= data.weekEnd, {
  message: "Week start date cannot be after week end date.",
  path: ["weekEnd"],
});

export type WeeklyBillsOverviewInput = z.infer<typeof weeklyBillsOverviewSchema>;
