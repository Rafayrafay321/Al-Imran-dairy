import * as dotenv from "dotenv";
import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

dotenv.config({ path: ".env.test.local" });
dotenv.config({ path: ".env.local" });

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
const describeWithDatabase = testDatabaseUrl ? describe : describe.skip;

describeWithDatabase("payment balance flow", () => {
  let context: Awaited<ReturnType<typeof createTestContext>>;

  beforeAll(async () => {
    process.env.DATABASE_URL = testDatabaseUrl;
    context = await createTestContext();
    await context.createFixtures();
  });

  afterAll(async () => {
    if (!context) return;
    await context.cleanup();
    await context.pool.end();
  });

  it("snapshots balance after payment and restores it after deletion", async () => {
    const firstInvoice = await context.createInvoice();
    expect(firstInvoice.totalAmount).toBe(5000);
    expect(await context.getBalance()).toBe(5000);

    const recorded = await context.recordPayment();
    expect(recorded.updatedBalance).toBe(3000);

    const secondInvoice = await context.createInvoice();
    expect(secondInvoice.previousBalance).toBe(3000);

    await context.voidInvoice(secondInvoice.id);
    const deleted = await context.deletePayment(recorded.payment.id);
    expect(deleted.updatedBalance).toBe(5000);
  });
});

async function createTestContext() {
  const [{ db, pool }, schema, { eq }, invoiceService, paymentService, balance] =
    await Promise.all([
      import("@/lib/db"),
      import("@/lib/db/schema"),
      import("drizzle-orm"),
      import("@/lib/services/invoiceService"),
      import("@/lib/services/paymentService"),
      import("@/lib/balance"),
    ]);
  const suffix = randomUUID().slice(0, 8);
  let userId = "";
  let milkTypeId = "";
  let customerId = "";
  const invoiceIds: string[] = [];

  async function createFixtures() {
    const [user] = await db.insert(schema.users).values({
      name: "Payment Test Owner",
      username: `payment_test_${suffix}`,
      passwordHash: "test-only",
      role: "OWNER",
    }).returning({ id: schema.users.id });
    userId = user.id;

    const [milk] = await db.insert(schema.milkTypes).values({
      name: `Payment Test Milk ${suffix}`,
      nameUr: "Test",
      defaultRate: "250.00",
    }).returning({ id: schema.milkTypes.id });
    milkTypeId = milk.id;

    const digits = suffix.replace(/\D/g, "").padEnd(7, "0").slice(0, 7);
    const [customer] = await db.insert(schema.customers).values({
      name: "Payment Test Customer",
      phone: `92300${digits}`,
      defaultMilkTypeId: milkTypeId,
      openingBalance: "0.00",
    }).returning({ id: schema.customers.id });
    customerId = customer.id;
  }

  async function createInvoice() {
    const today = new Date().toISOString().slice(0, 10);
    const invoice = await invoiceService.createWeeklyInvoiceInDb({
      customerId,
      weekStart: today,
      weekEnd: today,
      lines: [{ entryDate: today, milkTypeId, liters: 20, rate: 250 }],
    }, userId, "OWNER");
    invoiceIds.push(invoice.id);
    return invoice;
  }

  const getBalance = () => balance.getCustomerLiveBalance(customerId);
  const recordPayment = () => paymentService.recordPaymentInDb({
    customerId,
    amount: 2000,
    date: new Date().toISOString().slice(0, 10),
  }, userId);
  const deletePayment = (id: string) => paymentService.deletePaymentInDb(id);
  const voidInvoice = (id: string) => invoiceService.voidInvoiceInDb(id, userId);

  async function cleanup() {
    if (customerId) await db.delete(schema.payments).where(eq(schema.payments.customerId, customerId));
    for (const id of invoiceIds) await db.delete(schema.invoices).where(eq(schema.invoices.id, id));
    if (customerId) await db.delete(schema.customers).where(eq(schema.customers.id, customerId));
    if (milkTypeId) await db.delete(schema.milkTypes).where(eq(schema.milkTypes.id, milkTypeId));
    if (userId) await db.delete(schema.users).where(eq(schema.users.id, userId));
  }

  return { pool, createFixtures, createInvoice, getBalance, recordPayment, deletePayment, voidInvoice, cleanup };
}
