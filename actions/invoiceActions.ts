// filepath: actions/invoiceActions.ts
"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser, requireRole } from "@/lib/auth/session";
import { AppError } from "@/lib/auth/errors";
import {
  createWeeklyInvoiceInDb,
  listInvoicesFromDb,
  getInvoiceByIdFromDb,
  voidInvoiceInDb,
  markInvoiceSharedInDb,
  getWeeklyBillsOverviewFromDb,
  type InvoiceDetail,
  type WeeklyBillsOverview,
} from "@/lib/services/invoiceService";
import {
  createWeeklyInvoiceSchema,
  voidInvoiceSchema,
  markInvoiceSharedSchema,
  listInvoicesFilterSchema,
  type CreateWeeklyInvoiceInput,
  type VoidInvoiceInput,
  type MarkInvoiceSharedInput,
  type ListInvoicesFilterInput,
  weeklyBillsOverviewSchema,
  type WeeklyBillsOverviewInput,
} from "@/lib/validators/invoiceValidators";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

function handleActionError(error: unknown): ActionResult<never> {
  if (error instanceof AppError) {
    return { success: false, error: error.message };
  }
  const message =
    error instanceof Error ? error.message : "An unexpected error occurred.";
  return { success: false, error: message };
}

/**
 * Creates a new weekly bill with line entries.
 * Permitted for both OWNER and STAFF.
 */
export async function createWeeklyInvoice(
  rawInput: CreateWeeklyInvoiceInput
): Promise<ActionResult<InvoiceDetail>> {
  try {
    const session = await getSessionUser();
    if (!session) return { success: false, error: "Authentication required." };

    const validated = createWeeklyInvoiceSchema.safeParse(rawInput);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Invalid invoice details.",
      };
    }

    const result = await createWeeklyInvoiceInDb(validated.data, session.userId, session.role);

    revalidatePath("/bills");
    revalidatePath("/");
    revalidatePath("/customers");
    revalidatePath(`/customers/${validated.data.customerId}`);

    return { success: true, data: result };
  } catch (error) {
    return handleActionError(error);
  }
}

export const createWeeklyInvoiceAction = createWeeklyInvoice;

/**
 * Retrieves invoices matching filter criteria.
 */
export async function getInvoicesAction(
  rawInput?: ListInvoicesFilterInput
): Promise<ActionResult<InvoiceDetail[]>> {
  try {
    const session = await getSessionUser();
    if (!session) return { success: false, error: "Authentication required." };

    const validated = listInvoicesFilterSchema.safeParse(rawInput || {});
    const filter = validated.success ? validated.data : {};

    const invoices = await listInvoicesFromDb(filter);
    return { success: true, data: invoices };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function getWeeklyBillsOverviewAction(
  rawInput: WeeklyBillsOverviewInput
): Promise<ActionResult<WeeklyBillsOverview>> {
  try {
    const session = await getSessionUser();
    if (!session) return { success: false, error: "Authentication required." };
    const validated = weeklyBillsOverviewSchema.safeParse(rawInput);
    if (!validated.success) return { success: false, error: validated.error.issues[0]?.message };
    return { success: true, data: await getWeeklyBillsOverviewFromDb(validated.data) };
  } catch (error) {
    return handleActionError(error);
  }
}

/**
 * Retrieves a single invoice with all lines.
 */
export async function getInvoiceByIdAction(
  id: string
): Promise<ActionResult<InvoiceDetail>> {
  try {
    const session = await getSessionUser();
    if (!session) return { success: false, error: "Authentication required." };

    const invoice = await getInvoiceByIdFromDb(id);
    if (!invoice) return { success: false, error: "Invoice not found." };

    return { success: true, data: invoice };
  } catch (error) {
    return handleActionError(error);
  }
}

/**
 * Voids an issued invoice. OWNER role required.
 */
export async function voidInvoiceAction(
  rawInput: VoidInvoiceInput
): Promise<ActionResult<InvoiceDetail>> {
  try {
    const session = await requireRole("OWNER");

    const validated = voidInvoiceSchema.safeParse(rawInput);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Invalid invoice ID.",
      };
    }

    const updated = await voidInvoiceInDb(validated.data.invoiceId, session.userId);

    revalidatePath("/bills");
    revalidatePath("/");
    revalidatePath("/customers");
    revalidatePath(`/customers/${updated.customerId}`);

    return { success: true, data: updated };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function voidInvoice(invoiceId: string): Promise<ActionResult<InvoiceDetail>> {
  return voidInvoiceAction({ invoiceId });
}

/**
 * Marks an invoice as shared via WhatsApp or native sheet.
 */
export async function markInvoiceSharedAction(
  rawInput: MarkInvoiceSharedInput
): Promise<ActionResult<{ shared: boolean }>> {
  try {
    const session = await getSessionUser();
    if (!session) return { success: false, error: "Authentication required." };

    const validated = markInvoiceSharedSchema.safeParse(rawInput);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Invalid invoice ID.",
      };
    }

    await markInvoiceSharedInDb(validated.data.invoiceId);
    revalidatePath("/bills");

    return { success: true, data: { shared: true } };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function markInvoiceShared(invoiceId: string): Promise<ActionResult<{ shared: boolean }>> {
  return markInvoiceSharedAction({ invoiceId });
}
