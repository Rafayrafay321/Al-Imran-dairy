// filepath: lib/services/customerService.ts
import { eq, and, sql, or, ilike } from "drizzle-orm";
import { db } from "@/lib/db";
import { customers, customerRates, milkTypes } from "@/lib/db/schema";
import { customerBalanceSql } from "@/lib/balance";
import {
  type CreateCustomerInput,
  type UpdateCustomerInput,
  type UpsertSpecialRateInput,
  type DeleteSpecialRateInput,
} from "@/lib/validators/masterDataValidators";

export type CustomerFilterChip = "ALL" | "HAS_BALANCE" | "INACTIVE";

export interface CustomerWithBalance {
  id: string;
  name: string;
  phone: string;
  address: string | null;
  defaultMilkTypeId: string | null;
  defaultMilkTypeName?: string;
  openingBalance: number;
  balance: number;
  isActive: boolean;
  specialRates?: Record<string, number>;
  createdAt: Date;
}

export interface ListCustomersParams {
  search?: string;
  filter?: CustomerFilterChip;
  includeInactive?: boolean;
}

/**
 * Returns customers matching search/filter with live computed balance:
 * opening_balance + SUM(ISSUED invoices) - SUM(payments)
 */
export async function listCustomersFromDb(
  params: ListCustomersParams = {}
): Promise<CustomerWithBalance[]> {
  const { search, filter = "ALL", includeInactive = false } = params;

  // Build conditions array
  const conditions = [];

  if (filter === "INACTIVE") {
    conditions.push(eq(customers.isActive, false));
  } else if (!includeInactive) {
    conditions.push(eq(customers.isActive, true));
  }

  // Filter chips
  if (filter === "HAS_BALANCE") {
    conditions.push(sql`${customerBalanceSql} > 0`);
  }

  // Search filter (name or phone)
  if (search && search.trim()) {
    const q = `%${search.trim().toLowerCase()}%`;
    conditions.push(
      or(
        ilike(customers.name, q),
        ilike(customers.phone, q)
      )
    );
  }

  const query = db
    .select({
      id: customers.id,
      name: customers.name,
      phone: customers.phone,
      address: customers.address,
      defaultMilkTypeId: customers.defaultMilkTypeId,
      defaultMilkTypeName: milkTypes.name,
      openingBalance: customers.openingBalance,
      balance: customerBalanceSql,
      isActive: customers.isActive,
      createdAt: customers.createdAt,
    })
    .from(customers)
    .leftJoin(milkTypes, eq(customers.defaultMilkTypeId, milkTypes.id));

  const rows = conditions.length > 0
    ? await query.where(and(...conditions)).orderBy(customers.name)
    : await query.orderBy(customers.name);

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    phone: r.phone,
    address: r.address,
    defaultMilkTypeId: r.defaultMilkTypeId,
    defaultMilkTypeName: r.defaultMilkTypeName || undefined,
    openingBalance: parseFloat(r.openingBalance),
    balance: parseFloat(r.balance || "0"),
    isActive: r.isActive,
    createdAt: r.createdAt,
  }));
}

/**
 * Returns full customer detail by ID with computed balance and special rates map.
 */
export async function getCustomerByIdFromDb(
  id: string
): Promise<CustomerWithBalance | null> {
  const [row] = await db
    .select({
      id: customers.id,
      name: customers.name,
      phone: customers.phone,
      address: customers.address,
      defaultMilkTypeId: customers.defaultMilkTypeId,
      defaultMilkTypeName: milkTypes.name,
      openingBalance: customers.openingBalance,
      balance: customerBalanceSql,
      isActive: customers.isActive,
      createdAt: customers.createdAt,
    })
    .from(customers)
    .leftJoin(milkTypes, eq(customers.defaultMilkTypeId, milkTypes.id))
    .where(eq(customers.id, id))
    .limit(1);

  if (!row) return null;

  // Fetch special rates for this customer
  const ratesRows = await db
    .select({
      milkTypeId: customerRates.milkTypeId,
      rate: customerRates.rate,
    })
    .from(customerRates)
    .where(eq(customerRates.customerId, id));

  const specialRatesMap: Record<string, number> = {};
  for (const r of ratesRows) {
    specialRatesMap[r.milkTypeId] = parseFloat(r.rate);
  }

  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    address: row.address,
    defaultMilkTypeId: row.defaultMilkTypeId,
    defaultMilkTypeName: row.defaultMilkTypeName || undefined,
    openingBalance: parseFloat(row.openingBalance),
    balance: parseFloat(row.balance || "0"),
    isActive: row.isActive,
    specialRates: specialRatesMap,
    createdAt: row.createdAt,
  };
}

/**
 * Creates a new customer with opening balance in paisa/numeric format.
 */
export async function createCustomerInDb(
  input: CreateCustomerInput
): Promise<CustomerWithBalance> {
  const [created] = await db
    .insert(customers)
    .values({
      name: input.name,
      phone: input.phone,
      address: input.address || null,
      defaultMilkTypeId: input.defaultMilkTypeId,
      openingBalance: input.openingBalance.toFixed(2),
      isActive: true,
    })
    .returning();

  return {
    id: created.id,
    name: created.name,
    phone: created.phone,
    address: created.address,
    defaultMilkTypeId: created.defaultMilkTypeId,
    openingBalance: parseFloat(created.openingBalance),
    balance: parseFloat(created.openingBalance),
    isActive: created.isActive,
    specialRates: {},
    createdAt: created.createdAt,
  };
}

/**
 * Updates customer details (Owner only).
 */
export async function updateCustomerInDb(
  input: UpdateCustomerInput
): Promise<CustomerWithBalance> {
  const [updated] = await db
    .update(customers)
    .set({
      name: input.name,
      phone: input.phone,
      address: input.address || null,
      defaultMilkTypeId: input.defaultMilkTypeId,
    })
    .where(eq(customers.id, input.id))
    .returning();

  if (!updated) {
    throw new Error("Customer not found.");
  }

  const live = await getCustomerByIdFromDb(updated.id);
  if (!live) throw new Error("Failed to reload customer details.");
  return live;
}

/**
 * Activates or deactivates a customer (Owner only).
 */
export async function toggleCustomerActiveInDb(
  id: string,
  isActive: boolean
): Promise<CustomerWithBalance> {
  const [updated] = await db
    .update(customers)
    .set({ isActive })
    .where(eq(customers.id, id))
    .returning();

  if (!updated) {
    throw new Error("Customer not found.");
  }

  const live = await getCustomerByIdFromDb(updated.id);
  if (!live) throw new Error("Failed to reload customer details.");
  return live;
}

/**
 * Upserts a special rate for a specific customer and milk type (Owner only).
 */
export async function upsertSpecialRateInDb(
  input: UpsertSpecialRateInput
): Promise<{ customerId: string; milkTypeId: string; rate: number }> {
  const [upserted] = await db
    .insert(customerRates)
    .values({
      customerId: input.customerId,
      milkTypeId: input.milkTypeId,
      rate: input.rate.toFixed(2),
    })
    .onConflictDoUpdate({
      target: [customerRates.customerId, customerRates.milkTypeId],
      set: {
        rate: input.rate.toFixed(2),
      },
    })
    .returning();

  return {
    customerId: upserted.customerId,
    milkTypeId: upserted.milkTypeId,
    rate: parseFloat(upserted.rate),
  };
}

/**
 * Deletes a special rate for a specific customer and milk type (Owner only).
 */
export async function deleteSpecialRateInDb(
  input: DeleteSpecialRateInput
): Promise<{ customerId: string; milkTypeId: string }> {
  await db
    .delete(customerRates)
    .where(
      and(
        eq(customerRates.customerId, input.customerId),
        eq(customerRates.milkTypeId, input.milkTypeId)
      )
    );

  return {
    customerId: input.customerId,
    milkTypeId: input.milkTypeId,
  };
}
