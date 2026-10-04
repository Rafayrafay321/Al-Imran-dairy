// filepath: actions/customerActions.ts
"use server";

import { revalidatePath } from "next/cache";
import { requireRole, getSessionUser } from "@/lib/auth/session";
import { AppError } from "@/lib/auth/errors";
import {
  listCustomersFromDb,
  getCustomerByIdFromDb,
  createCustomerInDb,
  updateCustomerInDb,
  toggleCustomerActiveInDb,
  upsertSpecialRateInDb,
  deleteSpecialRateInDb,
  type CustomerWithBalance,
  type ListCustomersParams,
} from "@/lib/services/customerService";

export type { CustomerWithBalance, ListCustomersParams };
import {
  createCustomerSchema,
  updateCustomerSchema,
  toggleCustomerActiveSchema,
  upsertSpecialRateSchema,
  deleteSpecialRateSchema,
  type CreateCustomerInput,
  type UpdateCustomerInput,
  type ToggleCustomerActiveInput,
  type UpsertSpecialRateInput,
  type DeleteSpecialRateInput,
} from "@/lib/validators/masterDataValidators";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

function handleActionError(error: unknown): ActionResult<never> {
  if (error instanceof AppError) {
    return { success: false, error: error.message };
  }
  const message = error instanceof Error ? error.message : "An unexpected error occurred.";
  return { success: false, error: message };
}

/**
 * Returns customers matching search/filters with live computed balance.
 * Accessible by both Staff and Owner.
 */
export async function getCustomersAction(
  params: ListCustomersParams = {}
): Promise<ActionResult<CustomerWithBalance[]>> {
  try {
    const session = await getSessionUser();
    if (!session) {
      return { success: false, error: "Authentication required." };
    }

    const customers = await listCustomersFromDb(params);
    return { success: true, data: customers };
  } catch (error) {
    return handleActionError(error);
  }
}

/**
 * Returns full customer detail by ID with computed balance and special rates.
 */
export async function getCustomerByIdAction(
  id: string
): Promise<ActionResult<CustomerWithBalance>> {
  try {
    const session = await getSessionUser();
    if (!session) {
      return { success: false, error: "Authentication required." };
    }

    const customer = await getCustomerByIdFromDb(id);
    if (!customer) {
      return { success: false, error: "Customer not found." };
    }

    return { success: true, data: customer };
  } catch (error) {
    return handleActionError(error);
  }
}

/**
 * Adds a new customer with opening balance and normalized phone.
 * Accessible by Staff and Owner.
 */
export async function createCustomerAction(
  rawInput: CreateCustomerInput
): Promise<ActionResult<CustomerWithBalance>> {
  try {
    const session = await getSessionUser();
    if (!session) {
      return { success: false, error: "Authentication required." };
    }

    const validated = createCustomerSchema.safeParse(rawInput);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Invalid customer input.",
      };
    }

    const created = await createCustomerInDb(validated.data);
    revalidatePath("/customers");
    revalidatePath("/");
    return { success: true, data: created };
  } catch (error) {
    return handleActionError(error);
  }
}

/**
 * Updates customer master record. Owner only.
 */
export async function updateCustomerAction(
  rawInput: UpdateCustomerInput
): Promise<ActionResult<CustomerWithBalance>> {
  try {
    await requireRole("OWNER");

    const validated = updateCustomerSchema.safeParse(rawInput);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Invalid customer input.",
      };
    }

    const updated = await updateCustomerInDb(validated.data);
    revalidatePath("/customers");
    revalidatePath(`/customers/${validated.data.id}`);
    return { success: true, data: updated };
  } catch (error) {
    return handleActionError(error);
  }
}

/**
 * Deactivates or activates a customer. Owner only.
 */
export async function toggleCustomerActiveAction(
  rawInput: ToggleCustomerActiveInput
): Promise<ActionResult<CustomerWithBalance>> {
  try {
    await requireRole("OWNER");

    const validated = toggleCustomerActiveSchema.safeParse(rawInput);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Invalid input.",
      };
    }

    const updated = await toggleCustomerActiveInDb(validated.data.id, validated.data.isActive);
    revalidatePath("/customers");
    revalidatePath(`/customers/${validated.data.id}`);
    return { success: true, data: updated };
  } catch (error) {
    return handleActionError(error);
  }
}

/**
 * Upserts a special rate for a customer + milk type. Owner only.
 */
export async function upsertSpecialRateAction(
  rawInput: UpsertSpecialRateInput
): Promise<ActionResult<{ customerId: string; milkTypeId: string; rate: number }>> {
  try {
    await requireRole("OWNER");

    const validated = upsertSpecialRateSchema.safeParse(rawInput);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Invalid rate input.",
      };
    }

    const result = await upsertSpecialRateInDb(validated.data);
    revalidatePath(`/customers/${validated.data.customerId}`);
    return { success: true, data: result };
  } catch (error) {
    return handleActionError(error);
  }
}

/**
 * Deletes a special rate (reverts to default rate). Owner only.
 */
export async function deleteSpecialRateAction(
  rawInput: DeleteSpecialRateInput
): Promise<ActionResult<{ customerId: string; milkTypeId: string }>> {
  try {
    await requireRole("OWNER");

    const validated = deleteSpecialRateSchema.safeParse(rawInput);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Invalid input.",
      };
    }

    const result = await deleteSpecialRateInDb(validated.data);
    revalidatePath(`/customers/${validated.data.customerId}`);
    return { success: true, data: result };
  } catch (error) {
    return handleActionError(error);
  }
}
