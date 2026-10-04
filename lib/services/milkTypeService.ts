// filepath: lib/services/milkTypeService.ts
import { eq, asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { milkTypes } from "@/lib/db/schema";
import {
  type CreateMilkTypeInput,
  type UpdateMilkTypeRateInput,
  type ToggleMilkTypeActiveInput,
} from "@/lib/validators/masterDataValidators";

export interface MilkTypeRecord {
  id: string;
  name: string;
  nameUr: string;
  defaultRate: number;
  isActive: boolean;
}

/**
 * Returns all milk types from the database.
 */
export async function listMilkTypesFromDb(
  includeInactive = false
): Promise<MilkTypeRecord[]> {
  const query = db.select().from(milkTypes);

  const rows = includeInactive
    ? await query.orderBy(asc(milkTypes.name))
    : await query.where(eq(milkTypes.isActive, true)).orderBy(asc(milkTypes.name));

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    nameUr: r.nameUr,
    defaultRate: parseFloat(r.defaultRate),
    isActive: r.isActive,
  }));
}

/**
 * Creates a new milk type in the database.
 */
export async function createMilkTypeInDb(
  input: CreateMilkTypeInput
): Promise<MilkTypeRecord> {
  const [created] = await db
    .insert(milkTypes)
    .values({
      name: input.name,
      nameUr: input.nameUr,
      defaultRate: input.defaultRate.toFixed(2),
      isActive: true,
    })
    .returning();

  return {
    id: created.id,
    name: created.name,
    nameUr: created.nameUr,
    defaultRate: parseFloat(created.defaultRate),
    isActive: created.isActive,
  };
}

/**
 * Updates default rate for a milk type.
 */
export async function updateMilkTypeRateInDb(
  input: UpdateMilkTypeRateInput
): Promise<MilkTypeRecord> {
  const [updated] = await db
    .update(milkTypes)
    .set({
      defaultRate: input.defaultRate.toFixed(2),
    })
    .where(eq(milkTypes.id, input.id))
    .returning();

  if (!updated) {
    throw new Error("Milk type not found.");
  }

  return {
    id: updated.id,
    name: updated.name,
    nameUr: updated.nameUr,
    defaultRate: parseFloat(updated.defaultRate),
    isActive: updated.isActive,
  };
}

/**
 * Activates or deactivates a milk type.
 */
export async function toggleMilkTypeActiveInDb(
  input: ToggleMilkTypeActiveInput
): Promise<MilkTypeRecord> {
  const [updated] = await db
    .update(milkTypes)
    .set({
      isActive: input.isActive,
    })
    .where(eq(milkTypes.id, input.id))
    .returning();

  if (!updated) {
    throw new Error("Milk type not found.");
  }

  return {
    id: updated.id,
    name: updated.name,
    nameUr: updated.nameUr,
    defaultRate: parseFloat(updated.defaultRate),
    isActive: updated.isActive,
  };
}
