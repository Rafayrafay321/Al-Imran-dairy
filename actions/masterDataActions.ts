// filepath: actions/masterDataActions.ts
"use server";

import { revalidatePath } from "next/cache";
import { requireRole, getSessionUser } from "@/lib/auth/session";
import { AppError } from "@/lib/auth/errors";
import {
  getShopSettingsFromDb,
  updateShopSettingsInDb,
  type ShopSettingsRecord,
} from "@/lib/services/shopSettingsService";
import {
  listMilkTypesFromDb,
  createMilkTypeInDb,
  updateMilkTypeRateInDb,
  toggleMilkTypeActiveInDb,
  type MilkTypeRecord,
} from "@/lib/services/milkTypeService";

export type { MilkTypeRecord, ShopSettingsRecord };
import {
  updateShopSettingsSchema,
  createMilkTypeSchema,
  updateMilkTypeRateSchema,
  toggleMilkTypeActiveSchema,
  type UpdateShopSettingsInput,
  type CreateMilkTypeInput,
  type UpdateMilkTypeRateInput,
  type ToggleMilkTypeActiveInput,
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

// ==========================================
// Shop Settings Actions (Owner only updates)
// ==========================================

export async function getShopSettingsAction(): Promise<ActionResult<ShopSettingsRecord>> {
  try {
    const settings = await getShopSettingsFromDb();
    return { success: true, data: settings };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateShopSettingsAction(
  rawInput: UpdateShopSettingsInput
): Promise<ActionResult<ShopSettingsRecord>> {
  try {
    await requireRole("OWNER");

    const validated = updateShopSettingsSchema.safeParse(rawInput);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Invalid shop settings input.",
      };
    }

    const updated = await updateShopSettingsInDb(validated.data);
    revalidatePath("/settings");
    revalidatePath("/");
    return { success: true, data: updated };
  } catch (error) {
    return handleActionError(error);
  }
}

// ==========================================
// Milk Types Actions (Owner only updates)
// ==========================================

export async function getMilkTypesAction(
  includeInactive = false
): Promise<ActionResult<MilkTypeRecord[]>> {
  try {
    const session = await getSessionUser();
    if (!session) {
      return { success: false, error: "Authentication required." };
    }

    const list = await listMilkTypesFromDb(includeInactive);
    return { success: true, data: list };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function createMilkTypeAction(
  rawInput: CreateMilkTypeInput
): Promise<ActionResult<MilkTypeRecord>> {
  try {
    await requireRole("OWNER");

    const validated = createMilkTypeSchema.safeParse(rawInput);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Invalid milk type data.",
      };
    }

    const created = await createMilkTypeInDb(validated.data);
    revalidatePath("/settings");
    revalidatePath("/customers");
    return { success: true, data: created };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateMilkTypeRateAction(
  rawInput: UpdateMilkTypeRateInput
): Promise<ActionResult<MilkTypeRecord>> {
  try {
    await requireRole("OWNER");

    const validated = updateMilkTypeRateSchema.safeParse(rawInput);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Invalid rate data.",
      };
    }

    const updated = await updateMilkTypeRateInDb(validated.data);
    revalidatePath("/settings");
    revalidatePath("/customers");
    return { success: true, data: updated };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function toggleMilkTypeActiveAction(
  rawInput: ToggleMilkTypeActiveInput
): Promise<ActionResult<MilkTypeRecord>> {
  try {
    await requireRole("OWNER");

    const validated = toggleMilkTypeActiveSchema.safeParse(rawInput);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Invalid status data.",
      };
    }

    const updated = await toggleMilkTypeActiveInDb(validated.data);
    revalidatePath("/settings");
    revalidatePath("/customers");
    return { success: true, data: updated };
  } catch (error) {
    return handleActionError(error);
  }
}
