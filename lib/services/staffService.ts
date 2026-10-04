// filepath: lib/services/staffService.ts
import bcrypt from "bcryptjs";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { requireRole } from "@/lib/auth/session";
import {
  createStaffSchema,
  resetPasswordSchema,
  toggleStaffStatusSchema,
  type CreateStaffInput,
} from "@/lib/auth/validators";
import { ValidationError, AppError } from "@/lib/auth/errors";
import { type User } from "@/lib/data/types";

export interface StaffMember extends User {
  createdAt?: string;
}

/**
 * Returns all staff members. Strictly requires OWNER role.
 */
export async function listStaffMembers(): Promise<StaffMember[]> {
  await requireRole("OWNER");

  const records = await db
    .select({
      id: users.id,
      name: users.name,
      username: users.username,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.role, "STAFF"))
    .orderBy(users.name);

  return records.map((r) => ({
    id: r.id,
    name: r.name,
    username: r.username,
    role: "STAFF" as const,
    isActive: r.isActive,
    createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : undefined,
  }));
}

/**
 * Creates a new staff member account. Strictly requires OWNER role.
 */
export async function createStaffMember(
  input: CreateStaffInput
): Promise<StaffMember> {
  await requireRole("OWNER");
  const validated = createStaffSchema.parse(input);

  // Check unique username
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(sql`lower(${users.username})`, validated.username.toLowerCase()))
    .limit(1);

  if (existing.length > 0) {
    throw new ValidationError("A user with this username already exists.");
  }

  const passwordHash = await bcrypt.hash(validated.password, 10);

  const [inserted] = await db
    .insert(users)
    .values({
      name: validated.name,
      username: validated.username,
      passwordHash,
      role: "STAFF",
      isActive: true,
    })
    .returning({
      id: users.id,
      name: users.name,
      username: users.username,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
    });

  return {
    id: inserted.id,
    name: inserted.name,
    username: inserted.username,
    role: "STAFF",
    isActive: inserted.isActive,
    createdAt: inserted.createdAt ? new Date(inserted.createdAt).toISOString() : undefined,
  };
}

/**
 * Toggles a staff member's active status. Strictly requires OWNER role.
 */
export async function toggleStaffStatus(
  staffId: string,
  isActive: boolean
): Promise<StaffMember> {
  await requireRole("OWNER");
  toggleStaffStatusSchema.parse({ staffId, isActive });

  const [updated] = await db
    .update(users)
    .set({ isActive })
    .where(eq(users.id, staffId))
    .returning({
      id: users.id,
      name: users.name,
      username: users.username,
      role: users.role,
      isActive: users.isActive,
    });

  if (!updated) {
    throw new AppError(404, "NOT_FOUND", "Staff member not found.");
  }

  return {
    id: updated.id,
    name: updated.name,
    username: updated.username,
    role: "STAFF",
    isActive: updated.isActive,
  };
}

/**
 * Resets a staff member's password. Strictly requires OWNER role.
 */
export async function resetStaffPassword(
  staffId: string,
  newPassword: string
): Promise<void> {
  await requireRole("OWNER");
  resetPasswordSchema.parse({ staffId, newPassword });

  const passwordHash = await bcrypt.hash(newPassword, 10);

  const result = await db
    .update(users)
    .set({ passwordHash })
    .where(eq(users.id, staffId))
    .returning({ id: users.id });

  if (result.length === 0) {
    throw new AppError(404, "NOT_FOUND", "Staff member not found.");
  }
}
