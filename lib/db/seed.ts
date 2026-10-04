// filepath: lib/db/seed.ts
import * as dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, pool } from "./index";
import {
  shopSettings,
  milkTypes,
  users,
  customers,
  customerRates,
  invoiceCounters,
} from "./schema";

dotenv.config({ path: ".env.local" });

async function seed() {

  // 1. Shop Settings (Single row with id = 1)
  await db
    .insert(shopSettings)
    .values({
      id: 1,
      shopName: "Al-Imran Dairy",
      shopNameUr: "العمران ڈیری",
      phone: "0306-4703539",
      addressUr: "مین بازار، نزد جامع مسجد",
    })
    .onConflictDoUpdate({
      target: shopSettings.id,
      set: {
        shopName: "Al-Imran Dairy",
        shopNameUr: "العمران ڈیری",
        phone: "0306-4703539",
        addressUr: "مین بازار، نزد جامع مسجد",
      },
    });

  // 2. Milk Types (Cow & Buffalo)
  const [cowType] = await db
    .insert(milkTypes)
    .values({
      name: "Cow",
      nameUr: "گائے",
      defaultRate: "220.00",
      isActive: true,
    })
    .onConflictDoUpdate({
      target: milkTypes.name,
      set: {
        nameUr: "گائے",
        defaultRate: "220.00",
        isActive: true,
      },
    })
    .returning();

  const [buffaloType] = await db
    .insert(milkTypes)
    .values({
      name: "Buffalo",
      nameUr: "بھینس",
      defaultRate: "260.00",
      isActive: true,
    })
    .onConflictDoUpdate({
      target: milkTypes.name,
      set: {
        nameUr: "بھینس",
        defaultRate: "260.00",
        isActive: true,
      },
    })
    .returning();

  // 3. Users (Owner and Staff with hashed passwords)
  const ownerRawPassword = process.env.INITIAL_OWNER_PASSWORD || "123";
  const staffRawPassword = process.env.INITIAL_STAFF_PASSWORD || "123";

  const ownerPasswordHash = await bcrypt.hash(ownerRawPassword, 10);
  const staffPasswordHash = await bcrypt.hash(staffRawPassword, 10);

  await db
    .insert(users)
    .values({
      name: "Muhammad Irfan",
      username: "owner",
      passwordHash: ownerPasswordHash,
      role: "OWNER",
      isActive: true,
    })
    .onConflictDoUpdate({
      target: users.username,
      set: {
        name: "Muhammad Irfan",
        passwordHash: ownerPasswordHash,
        role: "OWNER",
        isActive: true,
      },
    });

  await db
    .insert(users)
    .values({
      name: "Ali Raza",
      username: "staff",
      passwordHash: staffPasswordHash,
      role: "STAFF",
      isActive: true,
    })
    .onConflictDoUpdate({
      target: users.username,
      set: {
        name: "Ali Raza",
        passwordHash: staffPasswordHash,
        role: "STAFF",
        isActive: true,
      },
    });

  // 4. Invoice Counter (Current year)
  const currentYear = new Date().getFullYear();
  await db
    .insert(invoiceCounters)
    .values({
      year: currentYear,
      lastNumber: 0,
    })
    .onConflictDoNothing();

  // 5. Demo customers and special rates
  const demoCustomers = [
    {
      name: "Haji Abdul Rehman",
      phone: "923009876543",
      address: "Main Bazar Shop #12",
      defaultMilkTypeId: buffaloType.id,
      openingBalance: "3400.00",
      specialRates: [{ milkTypeId: buffaloType.id, rate: "250.00" }],
    },
    {
      name: "Bismillah Hotel & Tea Stall",
      phone: "923214567890",
      address: "Chowk Yadgar",
      defaultMilkTypeId: cowType.id,
      openingBalance: "8500.00",
      specialRates: [],
    },
    {
      name: "Chaudhry Nadeem Sweet Mart",
      phone: "923331122334",
      address: "Railway Road",
      defaultMilkTypeId: buffaloType.id,
      openingBalance: "0.00",
      specialRates: [
        { milkTypeId: cowType.id, rate: "215.00" },
        { milkTypeId: buffaloType.id, rate: "255.00" },
      ],
    },
    {
      name: "Malik Usman",
      phone: "923457788990",
      address: "Street 4, Bilal Town",
      defaultMilkTypeId: cowType.id,
      openingBalance: "1200.00",
      specialRates: [],
    },
    {
      name: "Madina Milk Shop & Khoya",
      phone: "923123456789",
      address: "General Bus Stand",
      defaultMilkTypeId: buffaloType.id,
      openingBalance: "4500.00",
      specialRates: [{ milkTypeId: buffaloType.id, rate: "252.00" }],
    },
    {
      name: "Sheikh Tariq General Store",
      phone: "923015556677",
      address: "Saddar Bazar",
      defaultMilkTypeId: cowType.id,
      openingBalance: "0.00",
      specialRates: [],
    },
    {
      name: "Al-Madad Hotel",
      phone: "923224443322",
      address: "Circular Road",
      defaultMilkTypeId: buffaloType.id,
      openingBalance: "11200.00",
      specialRates: [
        { milkTypeId: cowType.id, rate: "210.00" },
        { milkTypeId: buffaloType.id, rate: "250.00" },
      ],
    },
    {
      name: "Farhan Butt",
      phone: "923349988776",
      address: "Civil Lines",
      defaultMilkTypeId: cowType.id,
      openingBalance: "2300.00",
      specialRates: [{ milkTypeId: cowType.id, rate: "218.00" }],
    },
  ];

  for (const c of demoCustomers) {
    // Check if customer already exists by phone
    const existing = await db
      .select({ id: customers.id })
      .from(customers)
      .where(eq(customers.phone, c.phone))
      .limit(1);

    let customerId: string;

    if (existing.length > 0) {
      customerId = existing[0].id;
      await db
        .update(customers)
        .set({
          name: c.name,
          address: c.address,
          defaultMilkTypeId: c.defaultMilkTypeId,
          openingBalance: c.openingBalance,
          isActive: true,
        })
        .where(eq(customers.id, customerId));
    } else {
      const [inserted] = await db
        .insert(customers)
        .values({
          name: c.name,
          phone: c.phone,
          address: c.address,
          defaultMilkTypeId: c.defaultMilkTypeId,
          openingBalance: c.openingBalance,
          isActive: true,
        })
        .returning();
      customerId = inserted.id;
    }

    // Upsert special rates
    if (c.specialRates.length > 0) {
      for (const sr of c.specialRates) {
        await db
          .insert(customerRates)
          .values({
            customerId,
            milkTypeId: sr.milkTypeId,
            rate: sr.rate,
          })
          .onConflictDoUpdate({
            target: [customerRates.customerId, customerRates.milkTypeId],
            set: { rate: sr.rate },
          });
      }
    }
  }

}

// Direct execution
if (require.main === module || process.argv[1]?.includes("seed")) {
  seed()
    .then(async () => {
      await pool.end();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error("❌ Seed failed with error:", err);
      await pool.end();
      process.exit(1);
    });
}
