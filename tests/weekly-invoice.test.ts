import * as dotenv from "dotenv";
import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

dotenv.config({ path: ".env.test.local" });
dotenv.config({ path: ".env.local" });

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
const describeWithDatabase = testDatabaseUrl ? describe : describe.skip;

describeWithDatabase.sequential("weekly invoice generation", () => {
  let context: Awaited<ReturnType<typeof createContext>>;

  beforeAll(async () => {
    process.env.DATABASE_URL = testDatabaseUrl;
    context = await createContext();
    await context.createFixtures();
  });

  afterAll(async () => {
    if (!context) return;
    await context.cleanup();
    await context.pool.end();
  });

  it("allows two invoices for the same customer and week", async () => {
    const first = await context.createInvoice("OWNER", 240);
    const second = await context.createInvoice("OWNER", 240);
    expect(first.id).not.toBe(second.id);
    expect(first.weekStart).toBe(second.weekStart);
  });

  it("rejects a Staff rate override", async () => {
    await expect(context.createInvoice("STAFF", 200)).rejects.toMatchObject({
      statusCode: 403,
      code: "FORBIDDEN",
    });
  });

  it("allocates unique sequential numbers under concurrency", async () => {
    const [first, second] = await Promise.all([
      context.createInvoice("OWNER", 240),
      context.createInvoice("OWNER", 240),
    ]);
    const numbers = [first.invoiceNo, second.invoiceNo]
      .map((value) => Number(value.split("-").at(-1)))
      .sort((a, b) => a - b);
    expect(new Set([first.invoiceNo, second.invoiceNo]).size).toBe(2);
    expect(numbers[1] - numbers[0]).toBe(1);
  });
});

async function createContext() {
  const [{ db, pool }, schema, { eq }, { createWeeklyInvoiceInDb }] = await Promise.all([
    import("@/lib/db"),
    import("@/lib/db/schema"),
    import("drizzle-orm"),
    import("@/lib/services/invoiceService"),
  ]);
  const suffix = randomUUID().slice(0, 8);
  let ownerId = "";
  let staffId = "";
  let milkTypeId = "";
  let customerId = "";

  async function createFixtures() {
    const createdUsers = await db.insert(schema.users).values([
      { name: "Invoice Test Owner", username: `invoice_owner_${suffix}`, passwordHash: "test", role: "OWNER" },
      { name: "Invoice Test Staff", username: `invoice_staff_${suffix}`, passwordHash: "test", role: "STAFF" },
    ]).returning({ id: schema.users.id, role: schema.users.role });
    ownerId = createdUsers.find((user) => user.role === "OWNER")!.id;
    staffId = createdUsers.find((user) => user.role === "STAFF")!.id;

    const [milk] = await db.insert(schema.milkTypes).values({
      name: `Invoice Test Milk ${suffix}`,
      nameUr: "Test",
      defaultRate: "250.00",
    }).returning({ id: schema.milkTypes.id });
    milkTypeId = milk.id;

    const [customer] = await db.insert(schema.customers).values({
      name: "Invoice Test Customer",
      phone: `92301${suffix.replace(/\D/g, "").padEnd(7, "0").slice(0, 7)}`,
      defaultMilkTypeId: milkTypeId,
      openingBalance: "0.00",
    }).returning({ id: schema.customers.id });
    customerId = customer.id;
    await db.insert(schema.customerRates).values({ customerId, milkTypeId, rate: "240.00" });
  }

  async function createInvoice(role: "OWNER" | "STAFF", rate: number) {
    const entryDate = "2026-09-28";
    return createWeeklyInvoiceInDb({
      customerId,
      weekStart: "2026-09-28",
      weekEnd: "2026-10-04",
      lines: [{ entryDate, milkTypeId, liters: 10, rate }],
    }, role === "OWNER" ? ownerId : staffId, role);
  }

  async function cleanup() {
    if (customerId) {
      await db.delete(schema.invoices).where(eq(schema.invoices.customerId, customerId));
      await db.delete(schema.customerRates).where(eq(schema.customerRates.customerId, customerId));
      await db.delete(schema.customers).where(eq(schema.customers.id, customerId));
    }
    if (milkTypeId) await db.delete(schema.milkTypes).where(eq(schema.milkTypes.id, milkTypeId));
    if (ownerId) await db.delete(schema.users).where(eq(schema.users.id, ownerId));
    if (staffId) await db.delete(schema.users).where(eq(schema.users.id, staffId));
  }

  return { pool, createFixtures, createInvoice, cleanup };
}
