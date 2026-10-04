// filepath: lib/services/invoiceService.ts
import { eq, desc, and, sql, or, ilike } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  invoices,
  invoiceLines,
  customers,
  milkTypes,
  customerRates,
  invoiceCounters,
} from "@/lib/db/schema";
import { customerBalanceSql } from "@/lib/balance";
import { ForbiddenError } from "@/lib/auth/errors";
import {
  type CreateWeeklyInvoiceInput,
  type ListInvoicesFilterInput,
  type WeeklyBillsOverviewInput,
} from "@/lib/validators/invoiceValidators";
import { calculateLineTotal, paisaToRupees, rupeesToPaisa } from "@/lib/data/money";
import { type UserRole } from "@/lib/data/types";

interface InvoiceLineDetail {
  id: string;
  deliveryDate: string;
  milkTypeId: string;
  milkTypeName: string;
  milkTypeNameUr: string;
  liters: number;
  rate: number;
  amount: number;
}

export interface InvoiceDetail {
  id: string;
  invoiceNo: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  weekStart: string;
  weekEnd: string;
  issueDate: string;
  totalLiters: number;
  totalAmount: number;
  previousBalance: number;
  grandTotal: number;
  status: "ISSUED" | "VOID";
  sharedAt: string | null;
  createdBy: string;
  createdAt: string;
  lines: InvoiceLineDetail[];
}

export interface NotBilledCustomer {
  id: string;
  name: string;
  phone: string;
  balance: number;
}

export interface WeeklyBillsOverview {
  generated: InvoiceDetail[];
  notBilled: NotBilledCustomer[];
}

/** Allocates the next invoice number atomically for the given year */
async function allocateInvoiceNumber(tx: Parameters<Parameters<typeof db.transaction>[0]>[0]): Promise<string> {
  const currentYear = new Date().getFullYear();
  const [counter] = await tx
    .insert(invoiceCounters)
    .values({ year: currentYear, lastNumber: 1 })
    .onConflictDoUpdate({
      target: invoiceCounters.year,
      set: { lastNumber: sql`${invoiceCounters.lastNumber} + 1` },
    })
    .returning({ lastNumber: invoiceCounters.lastNumber });

  return `INV-${currentYear}-${counter.lastNumber.toString().padStart(4, "0")}`;
}

/** Resolves the effective rate for a customer and milk type */
async function resolveLineRate(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  customerId: string,
  milkTypeId: string,
  submittedRate: number,
  userRole: UserRole
): Promise<{ rate: number; milkName: string; milkNameUr: string }> {
  const [milk] = await tx.select().from(milkTypes).where(eq(milkTypes.id, milkTypeId)).limit(1);
  if (!milk) throw new Error(`Milk type ${milkTypeId} not found.`);

  const [special] = await tx
    .select()
    .from(customerRates)
    .where(and(eq(customerRates.customerId, customerId), eq(customerRates.milkTypeId, milkTypeId)))
    .limit(1);

  const resolvedRate = Number(special?.rate ?? milk.defaultRate);
  if (userRole === "STAFF" && rupeesToPaisa(submittedRate) !== rupeesToPaisa(resolvedRate)) {
    throw new ForbiddenError("Rate has changed. Please refresh and try again.");
  }

  return {
    rate: userRole === "OWNER" ? submittedRate : resolvedRate,
    milkName: milk.name,
    milkNameUr: milk.nameUr,
  };
}

/**
 * Creates a consolidated weekly bill in an atomic database transaction.
 */
export async function createWeeklyInvoiceInDb(
  input: CreateWeeklyInvoiceInput,
  createdByUserId: string,
  userRole: UserRole
): Promise<InvoiceDetail> {
  return await db.transaction(async (tx) => {
    const [cust] = await tx
      .select({
        id: customers.id,
        name: customers.name,
        phone: customers.phone,
        isActive: customers.isActive,
        balance: customerBalanceSql,
      })
      .from(customers)
      .where(eq(customers.id, input.customerId))
      .limit(1);

    if (!cust) throw new Error("Customer not found.");
    if (!cust.isActive) throw new Error("Cannot create bill for inactive customer.");

    const previousBalance = parseFloat(cust.balance || "0");
    const invoiceNo = await allocateInvoiceNumber(tx);
    const today = new Date().toISOString().split("T")[0];

    // Compute lines and sums
    let totalLitersCentis = 0;
    let totalAmountPaisa = 0;
    const computedLines = [];

    for (const line of input.lines) {
      const { rate, milkName, milkNameUr } = await resolveLineRate(
        tx,
        input.customerId,
        line.milkTypeId,
        line.rate,
        userRole
      );
      const lineAmount = calculateLineTotal(line.liters, rate);
      totalLitersCentis += Math.round(line.liters * 100);
      totalAmountPaisa += rupeesToPaisa(lineAmount);

      computedLines.push({
        deliveryDate: line.entryDate,
        milkTypeId: line.milkTypeId,
        milkTypeName: milkName,
        milkTypeNameUr: milkNameUr,
        liters: line.liters,
        rate,
        amount: lineAmount,
      });
    }

    const totalLiters = totalLitersCentis / 100;
    const totalAmount = paisaToRupees(totalAmountPaisa);

    const [createdInv] = await tx
      .insert(invoices)
      .values({
        invoiceNo,
        customerId: input.customerId,
        weekStart: input.weekStart,
        weekEnd: input.weekEnd,
        issueDate: today,
        totalLiters: totalLiters.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        previousBalance: previousBalance.toFixed(2),
        status: "ISSUED",
        createdBy: createdByUserId,
      })
      .returning();

    const createdLines: InvoiceLineDetail[] = [];
    for (const cLine of computedLines) {
      const [insertedLine] = await tx
        .insert(invoiceLines)
        .values({
          invoiceId: createdInv.id,
          deliveryDate: cLine.deliveryDate,
          milkTypeId: cLine.milkTypeId,
          liters: cLine.liters.toFixed(2),
          rate: cLine.rate.toFixed(2),
          amount: cLine.amount.toFixed(2),
        })
        .returning();

      createdLines.push({
        id: insertedLine.id,
        deliveryDate: insertedLine.deliveryDate,
        milkTypeId: insertedLine.milkTypeId,
        milkTypeName: cLine.milkTypeName,
        milkTypeNameUr: cLine.milkTypeNameUr,
        liters: cLine.liters,
        rate: cLine.rate,
        amount: cLine.amount,
      });
    }

    return {
      id: createdInv.id,
      invoiceNo: createdInv.invoiceNo,
      customerId: cust.id,
      customerName: cust.name,
      customerPhone: cust.phone,
      weekStart: createdInv.weekStart,
      weekEnd: createdInv.weekEnd,
      issueDate: createdInv.issueDate,
      totalLiters,
      totalAmount,
      previousBalance,
      grandTotal: totalAmount + previousBalance,
      status: "ISSUED",
      sharedAt: null,
      createdBy: createdInv.createdBy,
      createdAt: createdInv.createdAt.toISOString(),
      lines: createdLines,
    };
  });
}

/** Fetches invoices matching filter criteria */
export async function listInvoicesFromDb(
  filter: ListInvoicesFilterInput = {}
): Promise<InvoiceDetail[]> {
  const conditions = [];

  if (filter.customerId) {
    conditions.push(eq(invoices.customerId, filter.customerId));
  }
  if (filter.status && filter.status !== "ALL") {
    conditions.push(eq(invoices.status, filter.status));
  }
  if (filter.createdBy) {
    conditions.push(eq(invoices.createdBy, filter.createdBy));
  }
  if (filter.search && filter.search.trim()) {
    const q = `%${filter.search.trim().toLowerCase()}%`;
    conditions.push(or(ilike(customers.name, q), ilike(customers.phone, q), ilike(invoices.invoiceNo, q)));
  }
  if (filter.weekStart) conditions.push(eq(invoices.weekStart, filter.weekStart));
  if (filter.weekEnd) conditions.push(eq(invoices.weekEnd, filter.weekEnd));

  const query = db
    .select({
      id: invoices.id,
      invoiceNo: invoices.invoiceNo,
      customerId: invoices.customerId,
      customerName: customers.name,
      customerPhone: customers.phone,
      weekStart: invoices.weekStart,
      weekEnd: invoices.weekEnd,
      issueDate: invoices.issueDate,
      totalLiters: invoices.totalLiters,
      totalAmount: invoices.totalAmount,
      previousBalance: invoices.previousBalance,
      status: invoices.status,
      sharedAt: invoices.sharedAt,
      createdBy: invoices.createdBy,
      createdAt: invoices.createdAt,
    })
    .from(invoices)
    .innerJoin(customers, eq(invoices.customerId, customers.id));

  const rows = conditions.length > 0
    ? await query.where(and(...conditions)).orderBy(desc(invoices.createdAt))
    : await query.orderBy(desc(invoices.createdAt));

  return rows.map((r) => {
    const totalAmount = parseFloat(r.totalAmount);
    const previousBalance = parseFloat(r.previousBalance);
    return {
      id: r.id,
      invoiceNo: r.invoiceNo,
      customerId: r.customerId,
      customerName: r.customerName,
      customerPhone: r.customerPhone,
      weekStart: r.weekStart,
      weekEnd: r.weekEnd,
      issueDate: r.issueDate,
      totalLiters: parseFloat(r.totalLiters),
      totalAmount,
      previousBalance,
      grandTotal: totalAmount + previousBalance,
      status: r.status as "ISSUED" | "VOID",
      sharedAt: r.sharedAt?.toISOString() || null,
      createdBy: r.createdBy,
      createdAt: r.createdAt.toISOString(),
      lines: [],
    };
  });
}

export async function getWeeklyBillsOverviewFromDb(
  input: WeeklyBillsOverviewInput
): Promise<WeeklyBillsOverview> {
  const [generated, activeCustomers] = await Promise.all([
    listInvoicesFromDb({ weekStart: input.weekStart, weekEnd: input.weekEnd }),
    db.select({
      id: customers.id,
      name: customers.name,
      phone: customers.phone,
      balance: customerBalanceSql,
    }).from(customers).where(eq(customers.isActive, true)).orderBy(customers.name),
  ]);
  const billedCustomerIds = new Set(
    generated.filter((invoice) => invoice.status === "ISSUED").map((invoice) => invoice.customerId)
  );
  return {
    generated,
    notBilled: activeCustomers
      .filter((customer) => !billedCustomerIds.has(customer.id))
      .map((customer) => ({ ...customer, balance: Number(customer.balance ?? 0) })),
  };
}

/** Returns a single invoice with its line items */
export async function getInvoiceByIdFromDb(id: string): Promise<InvoiceDetail | null> {
  const [row] = await db
    .select({
      id: invoices.id,
      invoiceNo: invoices.invoiceNo,
      customerId: invoices.customerId,
      customerName: customers.name,
      customerPhone: customers.phone,
      weekStart: invoices.weekStart,
      weekEnd: invoices.weekEnd,
      issueDate: invoices.issueDate,
      totalLiters: invoices.totalLiters,
      totalAmount: invoices.totalAmount,
      previousBalance: invoices.previousBalance,
      status: invoices.status,
      sharedAt: invoices.sharedAt,
      createdBy: invoices.createdBy,
      createdAt: invoices.createdAt,
    })
    .from(invoices)
    .innerJoin(customers, eq(invoices.customerId, customers.id))
    .where(eq(invoices.id, id))
    .limit(1);

  if (!row) return null;

  const lines = await db
    .select({
      id: invoiceLines.id,
      deliveryDate: invoiceLines.deliveryDate,
      milkTypeId: invoiceLines.milkTypeId,
      milkTypeName: milkTypes.name,
      milkTypeNameUr: milkTypes.nameUr,
      liters: invoiceLines.liters,
      rate: invoiceLines.rate,
      amount: invoiceLines.amount,
    })
    .from(invoiceLines)
    .innerJoin(milkTypes, eq(invoiceLines.milkTypeId, milkTypes.id))
    .where(eq(invoiceLines.invoiceId, row.id))
    .orderBy(invoiceLines.deliveryDate);

  const totalAmount = parseFloat(row.totalAmount);
  const previousBalance = parseFloat(row.previousBalance);

  return {
    id: row.id,
    invoiceNo: row.invoiceNo,
    customerId: row.customerId,
    customerName: row.customerName,
    customerPhone: row.customerPhone,
    weekStart: row.weekStart,
    weekEnd: row.weekEnd,
    issueDate: row.issueDate,
    totalLiters: parseFloat(row.totalLiters),
    totalAmount,
    previousBalance,
    grandTotal: totalAmount + previousBalance,
    status: row.status as "ISSUED" | "VOID",
    sharedAt: row.sharedAt?.toISOString() || null,
    createdBy: row.createdBy,
    createdAt: row.createdAt.toISOString(),
    lines: lines.map((l) => ({
      id: l.id,
      deliveryDate: l.deliveryDate,
      milkTypeId: l.milkTypeId,
      milkTypeName: l.milkTypeName,
      milkTypeNameUr: l.milkTypeNameUr,
      liters: parseFloat(l.liters),
      rate: parseFloat(l.rate),
      amount: parseFloat(l.amount),
    })),
  };
}

/** Voids an issued invoice (Owner only) */
export async function voidInvoiceInDb(
  invoiceId: string,
  voidedByUserId: string
): Promise<InvoiceDetail> {
  const [updated] = await db
    .update(invoices)
    .set({
      status: "VOID",
      voidedBy: voidedByUserId,
      voidedAt: new Date(),
    })
    .where(and(eq(invoices.id, invoiceId), eq(invoices.status, "ISSUED")))
    .returning();

  if (!updated) throw new Error("Invoice not found or already voided.");

  const live = await getInvoiceByIdFromDb(updated.id);
  if (!live) throw new Error("Failed to load voided invoice details.");
  return live;
}

/** Marks an invoice as shared */
export async function markInvoiceSharedInDb(invoiceId: string): Promise<void> {
  const [updated] = await db
    .update(invoices)
    .set({ sharedAt: new Date() })
    .where(and(eq(invoices.id, invoiceId), eq(invoices.status, "ISSUED")))
    .returning({ id: invoices.id });
  if (!updated) throw new Error("Invoice not found or voided.");
}
