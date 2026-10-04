import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { customers, invoices, payments } from "@/lib/db/schema";

/** opening balance + issued invoices - recorded payments */
export const customerBalanceSql = sql<string>`(
  COALESCE(${customers.openingBalance}, 0) +
  COALESCE((
    SELECT SUM(${invoices.totalAmount})
    FROM ${invoices}
    WHERE ${invoices.customerId} = ${customers.id}
      AND ${invoices.status} = 'ISSUED'
  ), 0) -
  COALESCE((
    SELECT SUM(${payments.amount})
    FROM ${payments}
    WHERE ${payments.customerId} = ${customers.id}
  ), 0)
)::numeric(12, 2)`;

export async function getCustomerLiveBalance(customerId: string): Promise<number> {
  const [row] = await db
    .select({ balance: customerBalanceSql })
    .from(customers)
    .where(eq(customers.id, customerId))
    .limit(1);

  return Number(row?.balance ?? 0);
}
