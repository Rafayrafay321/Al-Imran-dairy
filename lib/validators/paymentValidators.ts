import { z } from "zod";
import { todayInKarachi } from "@/lib/date";

const paymentDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format.")
  .refine((date) => date <= todayInKarachi(), "Payment date cannot be in the future.");

export const recordPaymentSchema = z.object({
  customerId: z.string().uuid("Invalid customer ID."),
  amount: z.number().positive("Payment amount must be greater than zero."),
  date: paymentDateSchema,
  note: z.string().trim().max(255, "Note must be 255 characters or fewer.").optional(),
});

export const deletePaymentSchema = z.object({
  paymentId: z.string().uuid("Invalid payment ID."),
});

export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
