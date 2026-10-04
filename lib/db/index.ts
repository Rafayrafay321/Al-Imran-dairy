import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Prevent multiple connection pools during Next.js hot module reloading
declare global {
  var _dbPool: Pool | undefined;
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString && typeof window === "undefined") {
  console.warn(
    "⚠️ DATABASE_URL is not configured. Please define it in your .env.local file."
  );
}

export const pool =
  global._dbPool ??
  new Pool({
    connectionString: connectionString || "",
    ssl:
      !connectionString || connectionString.includes("localhost")
        ? false
        : { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

if (process.env.NODE_ENV !== "production") {
  global._dbPool = pool;
}

/**
 * Drizzle ORM client configured with node-postgres and interactive transaction support.
 * Works seamlessly with Neon pooled connection string.
 */
export const db = drizzle(pool, { schema });

export * from "./schema";
