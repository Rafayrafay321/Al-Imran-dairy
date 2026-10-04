// filepath: lib/db/migrate.ts
import * as dotenv from "dotenv";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, pool } from "./index";

dotenv.config({ path: ".env.local" });

async function runMigrations() {
  try {
    await migrate(db, { migrationsFolder: "./drizzle" });
  } catch (err) {
    console.error("❌ Migration failed:", err);
    throw err;
  }
}

if (require.main === module || process.argv[1]?.includes("migrate")) {
  runMigrations()
    .then(async () => {
      await pool.end();
      process.exit(0);
    })
    .catch(async () => {
      await pool.end();
      process.exit(1);
    });
}
