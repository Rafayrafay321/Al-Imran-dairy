import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { customers, payments, users } from "@/lib/db/schema";
import { customerBalanceSql } from "@/lib/balance";
import { AppError } from "@/lib/auth/errors";
import { type RecordPaymentInput } from "@/lib/validators/paymentValidators";

export interface PaymentRecord {
  id: string;
  customerId: string;
  amount: number;
  date: string;
  note: string | null;
  createdBy: string;
  recordedByName: string;
  createdAt: string;
}

export interface PaymentMutationResult {
  payment: PaymentRecord;
  updatedBalance: number;
}

export async function listCustomerPayments(customerId: string): Promise<PaymentRecord[]> {
  const rows = await db
    .select({
      id: payments.id,
      customerId: payments.customerId,
      amount: payments.amount,
      date: payments.paymentDate,
      note: payments.note,
      createdBy: payments.createdBy,
      recordedByName: users.name,
      createdAt: payments.createdAt,
    })
    .from(payments)
    .innerJoin(users, eq(payments.createdBy, users.id))
    .where(eq(payments.customerId, customerId))
    .orderBy(desc(payments.paymentDate), desc(payments.createdAt));

  return rows.map((row) => ({
    ...row,
    amount: Number(row.amount),
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function recordPaymentInDb(
  input: RecordPaymentInput,
  userId: string
): Promise<PaymentMutationResult> {
  return db.transaction(async (tx) => {
    const [customer] = await tx
      .select({ id: customers.id })
      .from(customers)
      .where(eq(customers.id, input.customerId))
      .limit(1);
    if (!customer) throw new AppError(404, "CUSTOMER_NOT_FOUND", "Customer not found.");

    const [created] = await tx
      .insert(payments)
      .values({
        customerId: input.customerId,
        amount: input.amount.toFixed(2),
        paymentDate: input.date,
        note: input.note || null,
        createdBy: userId,
      })
      .returning();

    const [creator] = await tx
      .select({ name: users.name })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    const [balanceRow] = await tx
      .select({ balance: customerBalanceSql })
      .from(customers)
      .where(eq(customers.id, input.customerId))
      .limit(1);

    return {
      payment: {
        id: created.id,
        customerId: created.customerId,
        amount: Number(created.amount),
        date: created.paymentDate,
        note: created.note,
        createdBy: created.createdBy,
        recordedByName: creator?.name ?? "Unknown user",
        createdAt: created.createdAt.toISOString(),
      },
      updatedBalance: Number(balanceRow?.balance ?? 0),
    };
  });
}

export async function deletePaymentInDb(paymentId: string): Promise<PaymentMutationResult> {
  return db.transaction(async (tx) => {
    const [existing] = await tx
      .select({
        id: payments.id,
        customerId: payments.customerId,
        amount: payments.amount,
        date: payments.paymentDate,
        note: payments.note,
        createdBy: payments.createdBy,
        recordedByName: users.name,
        createdAt: payments.createdAt,
      })
      .from(payments)
      .innerJoin(users, eq(payments.createdBy, users.id))
      .where(eq(payments.id, paymentId))
      .limit(1);
    if (!existing) throw new AppError(404, "PAYMENT_NOT_FOUND", "Payment not found.");

    await tx.delete(payments).where(and(eq(payments.id, paymentId), eq(payments.customerId, existing.customerId)));
    const [balanceRow] = await tx
      .select({ balance: customerBalanceSql })
      .from(customers)
      .where(eq(customers.id, existing.customerId))
      .limit(1);

    return {
      payment: {
        ...existing,
        amount: Number(existing.amount),
        createdAt: existing.createdAt.toISOString(),
      },
      updatedBalance: Number(balanceRow?.balance ?? 0),
    };
  });
}
