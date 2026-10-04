// filepath: scripts/test-flow-simplification.ts
import { db, pool } from "../lib/db";
import { customers, milkTypes, users } from "../lib/db/schema";
import { eq } from "drizzle-orm";
import { createWeeklyInvoiceInDb, listInvoicesFromDb, getInvoiceByIdFromDb, voidInvoiceInDb, markInvoiceSharedInDb, } from "../lib/services/invoiceService";
async function runWeeklyBillTests() {
    // 1. Get active customer, milk types, and user
    const [testCust] = await db.select().from(customers).where(eq(customers.isActive, true)).limit(1);
    const milks = await db.select().from(milkTypes).where(eq(milkTypes.isActive, true)).limit(2);
    const [testUser] = await db.select().from(users).limit(1);
    if (!testCust || milks.length === 0 || !testUser) {
        throw new Error("Missing test customer, milk type, or user in database");
    }
    const testLines = [
        {
            entryDate: "2026-09-28",
            milkTypeId: milks[0].id,
            liters: 10,
            rate: Number(milks[0].defaultRate),
        },
        {
            entryDate: "2026-09-29",
            milkTypeId: milks[milks.length > 1 ? 1 : 0].id,
            liters: 15.5,
            rate: Number(milks[milks.length > 1 ? 1 : 0].defaultRate),
        },
    ];
    const createdBill = await createWeeklyInvoiceInDb({
        customerId: testCust.id,
        weekStart: "2026-09-28",
        weekEnd: "2026-10-04",
        lines: testLines,
    }, testUser.id, testUser.role as "OWNER" | "STAFF");
    if (!createdBill.invoiceNo.startsWith("INV-")) {
        throw new Error(`Invalid invoiceNo format: ${createdBill.invoiceNo}`);
    }
    if (createdBill.lines.length !== 2) {
        throw new Error(`Expected 2 lines, got ${createdBill.lines.length}`);
    }
    const loadedBill = await getInvoiceByIdFromDb(createdBill.id);
    if (!loadedBill)
        throw new Error("Failed to load invoice by ID");
    const billList = await listInvoicesFromDb({ customerId: testCust.id });
    if (!billList.some((invoice) => invoice.id === createdBill.id))
        throw new Error("Created invoice was not returned by the invoice list");
    await markInvoiceSharedInDb(createdBill.id);
    const sharedBill = await getInvoiceByIdFromDb(createdBill.id);
    if (!sharedBill?.sharedAt)
        throw new Error("Invoice sharedAt was not set");
    const voidedBill = await voidInvoiceInDb(createdBill.id, testUser.id);
    if (voidedBill.status !== "VOID")
        throw new Error("Expected status VOID");
}
runWeeklyBillTests()
    .catch((err) => {
    console.error("❌ Test failed:", err);
    process.exit(1);
})
    .finally(async () => {
    await pool.end();
});
