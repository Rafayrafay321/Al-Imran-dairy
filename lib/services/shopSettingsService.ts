// filepath: lib/services/shopSettingsService.ts
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { shopSettings } from "@/lib/db/schema";
import { type UpdateShopSettingsInput } from "@/lib/validators/masterDataValidators";

export interface ShopSettingsRecord {
  id: number;
  shopName: string;
  shopNameUr: string;
  phone: string;
  addressUr: string;
}

/**
 * Retrieves the singleton shop configuration row from PostgreSQL.
 */
export async function getShopSettingsFromDb(): Promise<ShopSettingsRecord> {
  const [row] = await db
    .select()
    .from(shopSettings)
    .where(eq(shopSettings.id, 1))
    .limit(1);

  if (!row) {
    return {
      id: 1,
      shopName: "Al-Imran Dairy",
      shopNameUr: "العمران ڈیری",
      phone: "923064703539",
      addressUr: "مین بازار، نزد جامع مسجد",
    };
  }

  return {
    id: row.id,
    shopName: row.shopName,
    shopNameUr: row.shopNameUr,
    phone: row.phone || "",
    addressUr: row.addressUr || "",
  };
}

/**
 * Updates the singleton shop configuration row (Owner only).
 */
export async function updateShopSettingsInDb(
  data: UpdateShopSettingsInput
): Promise<ShopSettingsRecord> {
  const current = await getShopSettingsFromDb();

  const [updated] = await db
    .insert(shopSettings)
    .values({
      id: 1,
      shopName: data.shopName ?? current.shopName,
      shopNameUr: data.shopNameUr ?? current.shopNameUr,
      phone: data.phone ?? current.phone,
      addressUr: data.addressUr ?? current.addressUr,
    })
    .onConflictDoUpdate({
      target: shopSettings.id,
      set: {
        shopName: data.shopName ?? current.shopName,
        shopNameUr: data.shopNameUr ?? current.shopNameUr,
        phone: data.phone ?? current.phone,
        addressUr: data.addressUr ?? current.addressUr,
      },
    })
    .returning();

  return {
    id: updated.id,
    shopName: updated.shopName,
    shopNameUr: updated.shopNameUr,
    phone: updated.phone || "",
    addressUr: updated.addressUr || "",
  };
}
