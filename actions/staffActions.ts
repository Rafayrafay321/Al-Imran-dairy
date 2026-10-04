// filepath: actions/staffActions.ts
"use server";

import { revalidatePath } from "next/cache";
import {
  listStaffMembers,
  createStaffMember,
  toggleStaffStatus,
  resetStaffPassword,
  type StaffMember,
} from "@/lib/services/staffService";
import {
  type CreateStaffInput,
  type ResetPasswordInput,
  type ToggleStaffStatusInput,
} from "@/lib/auth/validators";
import { AppError } from "@/lib/auth/errors";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

function handleActionError(error: unknown): ActionResult<never> {
  if (error instanceof AppError) {
    return {
      success: false,
      error: error.message,
    };
  }
  const message = error instanceof Error ? error.message : "An unexpected error occurred.";
  return {
    success: false,
    error: message,
  };
}

/**
 * Lists all staff members. OWNER only.
 */
export async function getStaffListAction(): Promise<ActionResult<StaffMember[]>> {
  try {
    const list = await listStaffMembers();
    return { success: true, data: list };
  } catch (error) {
    return handleActionError(error);
  }
}

/**
 * Creates a new staff account. OWNER only.
 */
export async function createStaffAction(
  input: CreateStaffInput
): Promise<ActionResult<StaffMember>> {
  try {
    const created = await createStaffMember(input);
    revalidatePath("/settings");
    return { success: true, data: created };
  } catch (error) {
    return handleActionError(error);
  }
}

/**
 * Activates or deactivates a staff member. OWNER only.
 */
export async function toggleStaffStatusAction(
  input: ToggleStaffStatusInput
): Promise<ActionResult<StaffMember>> {
  try {
    const updated = await toggleStaffStatus(input.staffId, input.isActive);
    revalidatePath("/settings");
    return { success: true, data: updated };
  } catch (error) {
    return handleActionError(error);
  }
}

/**
 * Resets a staff member's password. OWNER only.
 */
export async function resetStaffPasswordAction(
  input: ResetPasswordInput
): Promise<ActionResult<void>> {
  try {
    await resetStaffPassword(input.staffId, input.newPassword);
    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}
