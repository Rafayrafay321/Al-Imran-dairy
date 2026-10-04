CREATE TABLE "customer_rates" (
	"customer_id" uuid NOT NULL,
	"milk_type_id" uuid NOT NULL,
	"rate" numeric(10, 2) NOT NULL,
	CONSTRAINT "customer_rates_customer_id_milk_type_id_pk" PRIMARY KEY("customer_id","milk_type_id"),
	CONSTRAINT "customer_rates_rate_check" CHECK (rate >= 0)
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"address" text,
	"default_milk_type_id" uuid,
	"billing_mode" text DEFAULT 'WEEKLY' NOT NULL,
	"opening_balance" numeric(12, 2) DEFAULT '0' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "customers_billing_mode_check" CHECK (billing_mode IN ('PER_DELIVERY', 'WEEKLY'))
);
--> statement-breakpoint
CREATE TABLE "deliveries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"milk_type_id" uuid NOT NULL,
	"delivery_date" date NOT NULL,
	"liters" numeric(10, 2) NOT NULL,
	"rate" numeric(10, 2) NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"invoice_id" uuid,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "deliveries_liters_check" CHECK (liters > 0)
);
--> statement-breakpoint
CREATE TABLE "invoice_counters" (
	"year" integer PRIMARY KEY NOT NULL,
	"last_number" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_no" text NOT NULL,
	"customer_id" uuid NOT NULL,
	"type" text NOT NULL,
	"issue_date" date NOT NULL,
	"period_start" date,
	"period_end" date,
	"total_liters" numeric(10, 2) NOT NULL,
	"total_amount" numeric(12, 2) NOT NULL,
	"previous_balance" numeric(12, 2) DEFAULT '0' NOT NULL,
	"status" text DEFAULT 'ISSUED' NOT NULL,
	"shared_at" timestamp with time zone,
	"created_by" uuid NOT NULL,
	"voided_by" uuid,
	"voided_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invoices_invoice_no_unique" UNIQUE("invoice_no"),
	CONSTRAINT "invoices_type_check" CHECK (type IN ('PER_DELIVERY', 'WEEKLY')),
	CONSTRAINT "invoices_status_check" CHECK (status IN ('ISSUED', 'VOID'))
);
--> statement-breakpoint
CREATE TABLE "milk_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"name_ur" text NOT NULL,
	"default_rate" numeric(10, 2) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "milk_types_name_unique" UNIQUE("name"),
	CONSTRAINT "milk_types_default_rate_check" CHECK (default_rate >= 0)
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"payment_date" date NOT NULL,
	"note" text,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payments_amount_check" CHECK (amount > 0)
);
--> statement-breakpoint
CREATE TABLE "shop_settings" (
	"id" smallint PRIMARY KEY DEFAULT 1 NOT NULL,
	"shop_name" text NOT NULL,
	"shop_name_ur" text NOT NULL,
	"phone" text,
	"address_ur" text,
	CONSTRAINT "shop_settings_id_check" CHECK (id = 1)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"username" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_role_check" CHECK (role IN ('OWNER', 'STAFF'))
);
--> statement-breakpoint
ALTER TABLE "customer_rates" ADD CONSTRAINT "customer_rates_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_rates" ADD CONSTRAINT "customer_rates_milk_type_id_milk_types_id_fk" FOREIGN KEY ("milk_type_id") REFERENCES "public"."milk_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_default_milk_type_id_milk_types_id_fk" FOREIGN KEY ("default_milk_type_id") REFERENCES "public"."milk_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_milk_type_id_milk_types_id_fk" FOREIGN KEY ("milk_type_id") REFERENCES "public"."milk_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_voided_by_users_id_fk" FOREIGN KEY ("voided_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_customers_name" ON "customers" USING btree (lower(name));--> statement-breakpoint
CREATE INDEX "idx_customers_phone" ON "customers" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "idx_deliveries_customer_date" ON "deliveries" USING btree ("customer_id","delivery_date");--> statement-breakpoint
CREATE INDEX "idx_deliveries_date" ON "deliveries" USING btree ("delivery_date");--> statement-breakpoint
CREATE INDEX "idx_invoices_customer_date" ON "invoices" USING btree ("customer_id","issue_date" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_payments_customer_date" ON "payments" USING btree ("customer_id","payment_date" DESC NULLS LAST);