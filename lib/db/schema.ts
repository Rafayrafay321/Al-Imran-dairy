// filepath: lib/db/schema.ts
import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  smallint,
  numeric,
  integer,
  date,
  primaryKey,
  index,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ==========================================
// 1. Users (Owner and Staff)
// ==========================================
export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    username: text("username").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    role: text("role").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  () => [
    check("users_role_check", sql`role IN ('OWNER', 'STAFF')`),
  ]
);

// ==========================================
// 2. Single-row shop settings
// ==========================================
export const shopSettings = pgTable(
  "shop_settings",
  {
    id: smallint("id").primaryKey().default(1),
    shopName: text("shop_name").notNull(),
    shopNameUr: text("shop_name_ur").notNull(),
    phone: text("phone"),
    addressUr: text("address_ur"),
  },
  () => [
    check("shop_settings_id_check", sql`id = 1`),
  ]
);

// ==========================================
// 3. Milk types with default rate
// ==========================================
export const milkTypes = pgTable(
  "milk_types",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull().unique(),
    nameUr: text("name_ur").notNull(),
    defaultRate: numeric("default_rate", { precision: 10, scale: 2 }).notNull(),
    isActive: boolean("is_active").notNull().default(true),
  },
  () => [
    check("milk_types_default_rate_check", sql`default_rate >= 0`),
  ]
);

// ==========================================
// 4. Customers (bulk buyers)
// ==========================================
export const customers = pgTable(
  "customers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    address: text("address"),
    defaultMilkTypeId: uuid("default_milk_type_id").references(
      () => milkTypes.id
    ),
    openingBalance: numeric("opening_balance", { precision: 12, scale: 2 })
      .notNull()
      .default("0"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_customers_name").on(sql`lower(name)`),
    index("idx_customers_phone").on(table.phone),
  ]
);

// ==========================================
// 5. Special per-customer rates
// ==========================================
export const customerRates = pgTable(
  "customer_rates",
  {
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" }),
    milkTypeId: uuid("milk_type_id")
      .notNull()
      .references(() => milkTypes.id),
    rate: numeric("rate", { precision: 10, scale: 2 }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.customerId, table.milkTypeId] }),
    check("customer_rates_rate_check", sql`rate >= 0`),
  ]
);

// ==========================================
// 6. Invoice number counter
// ==========================================
export const invoiceCounters = pgTable("invoice_counters", {
  year: integer("year").primaryKey(),
  lastNumber: integer("last_number").notNull().default(0),
});

// ==========================================
// 7. Invoices (Consolidated weekly bills)
// ==========================================
export const invoices = pgTable(
  "invoices",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    invoiceNo: text("invoice_no").notNull().unique(),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id),
    weekStart: date("week_start").notNull(),
    weekEnd: date("week_end").notNull(),
    issueDate: date("issue_date").notNull(),
    totalLiters: numeric("total_liters", { precision: 10, scale: 2 }).notNull(),
    totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
    previousBalance: numeric("previous_balance", { precision: 12, scale: 2 })
      .notNull()
      .default("0"),
    status: text("status").notNull().default("ISSUED"),
    sharedAt: timestamp("shared_at", { withTimezone: true }),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id),
    voidedBy: uuid("voided_by").references(() => users.id),
    voidedAt: timestamp("voided_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check(
      "invoices_status_check",
      sql`status IN ('ISSUED', 'VOID')`
    ),
    index("idx_invoices_customer_date").on(
      table.customerId,
      table.issueDate.desc()
    ),
  ]
);

// ==========================================
// 8. Invoice lines (daily entries within a weekly bill)
// ==========================================
export const invoiceLines = pgTable(
  "invoice_lines",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    invoiceId: uuid("invoice_id")
      .notNull()
      .references(() => invoices.id, { onDelete: "cascade" }),
    deliveryDate: date("delivery_date").notNull(),
    milkTypeId: uuid("milk_type_id")
      .notNull()
      .references(() => milkTypes.id),
    liters: numeric("liters", { precision: 10, scale: 2 }).notNull(),
    rate: numeric("rate", { precision: 10, scale: 2 }).notNull(),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  },
  (table) => [
    check("invoice_lines_liters_check", sql`liters > 0`),
    check("invoice_lines_rate_check", sql`rate >= 0`),
    index("idx_invoice_lines_invoice").on(table.invoiceId),
    index("idx_invoice_lines_date").on(table.deliveryDate),
  ]
);

// ==========================================
// 9. Payments
// ==========================================
export const payments = pgTable(
  "payments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    paymentDate: date("payment_date").notNull(),
    note: text("note"),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check("payments_amount_check", sql`amount > 0`),
    index("idx_payments_customer_date").on(
      table.customerId,
      table.paymentDate.desc()
    ),
  ]
);
