// filepath: scripts/test-master-data.ts
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { normalizePakistanPhone } from "../lib/utils/phone";
import { getShopSettingsFromDb } from "../lib/services/shopSettingsService";
import { listMilkTypesFromDb } from "../lib/services/milkTypeService";
import { listCustomersFromDb, getCustomerByIdFromDb, createCustomerInDb, updateCustomerInDb, upsertSpecialRateInDb, deleteSpecialRateInDb, } from "../lib/services/customerService";
import { pool } from "../lib/db";
async function runMasterDataTests() {
    const test1 = normalizePakistanPhone("0300 1234567");
    if (!test1.isValid || test1.normalized !== "923001234567") {
        throw new Error("Phone normalization failed for 0300 1234567");
    }
    const test2 = normalizePakistanPhone("+92 306-4703539");
    if (!test2.isValid || test2.normalized !== "923064703539") {
        throw new Error("Phone normalization failed for +92 306-4703539");
    }
    const testInvalid = normalizePakistanPhone("12345");
    if (testInvalid.isValid || !testInvalid.error) {
        throw new Error("Expected invalid phone to fail with error");
    }
    const settings = await getShopSettingsFromDb();
    if (!settings.shopName || !settings.shopNameUr) {
        throw new Error("Shop settings missing expected English or Urdu name");
    }
    const milkTypesList = await listMilkTypesFromDb();
    if (milkTypesList.length < 2) {
        throw new Error("Expected at least 2 milk types (Cow & Buffalo)");
    }
    const cow = milkTypesList.find(m => m.name.toLowerCase() === "cow")!;
    const buffalo = milkTypesList.find(m => m.name.toLowerCase() === "buffalo")!;
    const allCustomers = await listCustomersFromDb({ filter: "ALL" });
    if (allCustomers.length < 8) {
        throw new Error(`Expected at least 8 seeded customers, got ${allCustomers.length}`);
    }
    // Verify computed balance for Haji Abdul Rehman (seeded openingBalance 3400)
    const haji = allCustomers.find(c => c.name.includes("Haji Abdul Rehman"));
    if (!haji || haji.balance !== 3400) {
        throw new Error(`Expected Haji Abdul Rehman computed balance 3400, got ${haji?.balance}`);
    }
    const hasBalanceCustomers = await listCustomersFromDb({ filter: "HAS_BALANCE" });
    for (const c of hasBalanceCustomers) {
        if (c.balance <= 0)
            throw new Error("Has balance filter returned customer with 0 balance");
    }
    const searchName = await listCustomersFromDb({ search: "Bismillah" });
    if (searchName.length === 0)
        throw new Error("Search by name failed");
    const searchPhone = await listCustomersFromDb({ search: "92300" });
    if (searchPhone.length === 0)
        throw new Error("Search by phone failed");
    const testCustomer = allCustomers[0];
    // Upsert special rate for Cow milk = 235.50
    const upserted = await upsertSpecialRateInDb({
        customerId: testCustomer.id,
        milkTypeId: cow.id,
        rate: 235.50,
    });
    if (upserted.rate !== 235.50)
        throw new Error("Special rate upsert returned an unexpected rate");
    // Read customer detail and check special rate map
    const detailWithRate = await getCustomerByIdFromDb(testCustomer.id);
    if (!detailWithRate || detailWithRate.specialRates?.[cow.id] !== 235.50) {
        throw new Error(`Special rate was not found in customer detail: ${JSON.stringify(detailWithRate?.specialRates)}`);
    }
    // Delete special rate
    await deleteSpecialRateInDb({
        customerId: testCustomer.id,
        milkTypeId: cow.id,
    });
    const detailAfterDelete = await getCustomerByIdFromDb(testCustomer.id);
    if (detailAfterDelete?.specialRates?.[cow.id] !== undefined) {
        throw new Error("Special rate was not deleted!");
    }
    const normPhone = normalizePakistanPhone("0333 7654321");
    const newCust = await createCustomerInDb({
        name: "Master Test Customer",
        phone: normPhone.normalized!,
        address: "Test Shop #99",
        defaultMilkTypeId: buffalo.id,
        openingBalance: 1500,
    });
    if (newCust.phone !== "923337654321" || newCust.balance !== 1500) {
        throw new Error("New customer phone or computed balance mismatch");
    }
    // Deactivate test customer
    const updatedCust = await updateCustomerInDb({
        id: newCust.id,
        name: "Master Test Customer (Updated)",
        phone: newCust.phone,
        address: "Updated Address",
        defaultMilkTypeId: newCust.defaultMilkTypeId!,
    });
    if (updatedCust.name !== "Master Test Customer (Updated)")
        throw new Error("Customer update did not persist");
    await pool.end();
}
runMasterDataTests().catch(async (err) => {
    console.error("❌ Test failed:", err);
    await pool.end();
    process.exit(1);
});
