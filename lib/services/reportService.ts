// filepath: lib/services/reportService.ts
import { sql, eq, desc, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { customers, invoices } from "@/lib/db/schema";
import { customerBalanceSql } from "@/lib/balance";
import {
  type Customer,
  type TodayMetrics,
  type SalesReportCustomerRow,
  type WeeklySummaryEntry,
} from "@/lib/data/types";

/**
 * Returns customers sorted by balance (descending) for the balances report.
 */
export async function getBalancesReportFromDb(): Promise<Customer[]> {
  const rows = await db
    .select({
      id: customers.id,
      name: customers.name,
      phone: customers.phone,
      address: customers.address,
      defaultMilkTypeId: customers.defaultMilkTypeId,
      isActive: customers.isActive,
      balance: customerBalanceSql,
    })
    .from(customers)
    .where(eq(customers.isActive, true))
    .orderBy(desc(customerBalanceSql));

  return rows.map((r) => {
    const bal = parseFloat(r.balance || "0");
    return {
      id: r.id,
      name: r.name,
      phone: r.phone,
      address: r.address ?? undefined,
      defaultMilkTypeId: r.defaultMilkTypeId ?? "",
      isActive: r.isActive,
      balance: bal,
      previousBalance: bal,
    };
  });
}

/**
 * Returns today's activity metrics for the home screen.
 */
export async function getTodayMetricsFromDb(): Promise<TodayMetrics> {
  const today = new Date().toISOString().split("T")[0];

  const [billsResult] = await db
    .select({
      count: sql<number>`count(*)::int`,
      totalLiters: sql<string>`coalesce(sum(${invoices.totalLiters}), 0)::text`,
    })
    .from(invoices)
    .where(and(eq(invoices.issueDate, today), eq(invoices.status, "ISSUED")));

  return {
    totalLiters: parseFloat(billsResult?.totalLiters || "0"),
    billsCount: billsResult?.count || 0,
  };
}

/**
 * Returns monthly consolidated sales summary grouped by customer.
 */
export async function getMonthlySalesReportFromDb(
  month = new Date().toISOString().slice(0, 7)
): Promise<SalesReportCustomerRow[]> {
  const rows = await db
    .select({
      customerId: invoices.customerId,
      customerName: customers.name,
      phone: customers.phone,
      totalLiters: sql<string>`coalesce(sum(${invoices.totalLiters}), 0)::text`,
      totalAmount: sql<string>`coalesce(sum(${invoices.totalAmount}), 0)::text`,
      count: sql<number>`count(*)::int`,
    })
    .from(invoices)
    .innerJoin(customers, eq(invoices.customerId, customers.id))
    .where(
      and(
        sql`to_char(${invoices.issueDate}, 'YYYY-MM') = ${month}`,
        eq(invoices.status, "ISSUED")
      )
    )
    .groupBy(invoices.customerId, customers.name, customers.phone);

  return rows.map((r) => {
    const totalAmount = parseFloat(r.totalAmount);
    return {
      customerId: r.customerId,
      customerName: r.customerName,
      phone: r.phone,
      totalLiters: parseFloat(r.totalLiters),
      totalAmount,
      previousBalance: 0,
      grandTotal: totalAmount,
      month,
      deliveryCount: r.count,
    };
  });
}

/**
 * Returns daily/weekly summary entries.
 */
export async function getDailyDeliveriesReportFromDb(
  date = new Date().toISOString().split("T")[0]
): Promise<WeeklySummaryEntry[]> {
  const rows = await db
    .select({
      id: invoices.id,
      invoiceNo: invoices.invoiceNo,
      customerName: customers.name,
      totalLiters: invoices.totalLiters,
      totalAmount: invoices.totalAmount,
      issueDate: invoices.issueDate,
    })
    .from(invoices)
    .innerJoin(customers, eq(invoices.customerId, customers.id))
    .where(and(eq(invoices.issueDate, date), eq(invoices.status, "ISSUED")));

  return rows.map((r) => ({
    id: r.id,
    time: "10:00 AM",
    customerName: r.customerName,
    liters: parseFloat(r.totalLiters),
    rate: 0,
    amount: parseFloat(r.totalAmount),
    date: r.issueDate,
    staffName: r.invoiceNo,
    recordedBy: r.invoiceNo,
  }));
}
