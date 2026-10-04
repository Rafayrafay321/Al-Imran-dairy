"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser, requireRole } from "@/lib/auth/session";
import { AppError } from "@/lib/auth/errors";
import {
  deletePaymentInDb,
  listCustomerPayments,
  recordPaymentInDb,
  type PaymentMutationResult,
  type PaymentRecord,
} from "@/lib/services/paymentService";
import { deletePaymentSchema, recordPaymentSchema } from "@/lib/validators/paymentValidators";

interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

function failure(error: unknown): ActionResult<never> {
  if (error instanceof AppError) return { success: false, error: error.message };
  return { success: false, error: error instanceof Error ? error.message : "Unexpected error." };
}

export async function getCustomerPayments(
  customerId: string
): Promise<ActionResult<PaymentRecord[]>> {
  try {
    const session = await getSessionUser();
    if (!session) return { success: false, error: "Authentication required." };
    const parsed = recordPaymentSchema.shape.customerId.safeParse(customerId);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };
    return { success: true, data: await listCustomerPayments(parsed.data) };
  } catch (error) {
    return failure(error);
  }
}

export async function recordPayment(
  customerId: string,
  amount: number,
  date: string,
  note?: string
): Promise<ActionResult<PaymentMutationResult>> {
  try {
    const session = await getSessionUser();
    if (!session) return { success: false, error: "Authentication required." };
    const parsed = recordPaymentSchema.safeParse({ customerId, amount, date, note });
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

    const result = await recordPaymentInDb(parsed.data, session.userId);
    revalidatePath(`/customers/${customerId}`);
    revalidatePath(`/customer/${customerId}`);
    revalidatePath("/customers");
    revalidatePath("/reports");
    return { success: true, data: result };
  } catch (error) {
    return failure(error);
  }
}

export async function deletePayment(
  paymentId: string
): Promise<ActionResult<PaymentMutationResult>> {
  try {
    await requireRole("OWNER");
    const parsed = deletePaymentSchema.safeParse({ paymentId });
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

    const result = await deletePaymentInDb(parsed.data.paymentId);
    revalidatePath(`/customers/${result.payment.customerId}`);
    revalidatePath(`/customer/${result.payment.customerId}`);
    revalidatePath("/customers");
    revalidatePath("/reports");
    return { success: true, data: result };
  } catch (error) {
    return failure(error);
  }
}
