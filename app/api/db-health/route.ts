// filepath: app/api/db-health/route.ts
import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { shopSettings, users, milkTypes, customers } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  const start = performance.now();

  try {
    // 1. Ping database with basic query
    await db.execute(sql`SELECT 1 as ping, current_database() as db_name, version() as version`);
    const durationMs = Math.round(performance.now() - start);

    // 2. Fetch basic statistics
    const [shop] = await db.select().from(shopSettings).limit(1);
    const userList = await db.select({ count: sql<number>`count(*)` }).from(users);
    const milkTypeList = await db.select({ count: sql<number>`count(*)` }).from(milkTypes);
    const customerList = await db.select({ count: sql<number>`count(*)` }).from(customers);

    return NextResponse.json({
      status: "ok",
      database: "connected",
      latencyMs: durationMs,
      details: {
        serverTime: new Date().toISOString(),
        shopConfigured: !!shop,
        shopName: shop?.shopName ?? "Not configured",
        counts: {
          users: Number(userList[0]?.count ?? 0),
          milkTypes: Number(milkTypeList[0]?.count ?? 0),
          customers: Number(customerList[0]?.count ?? 0),
        },
      },
    });
  } catch (error: unknown) {
    const durationMs = Math.round(performance.now() - start);
    console.error("Database health check error:", error);
    const message = error instanceof Error ? error.message : "Unknown database connection error";

    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
        latencyMs: durationMs,
        error: message,
        hint: !process.env.DATABASE_URL
          ? "DATABASE_URL is not defined in environment variables"
          : "Verify your Neon connection string in .env.local",
      },
      { status: 503 }
    );
  }
}
