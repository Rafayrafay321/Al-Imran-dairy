# Codebase Context

Last inspected: 2026-10-03

This file is a durable map of the implemented repository. Read it together with
`project.md` (product intent) and `.agents/rules/backendeule.md` (engineering
rules). Verify the specific files involved before changing code because this
snapshot can become stale.

## Product

IrFan is a phone-first milk-shop billing application for one Pakistani dairy.
Owner and Staff users manage bulk customers, rates, weekly milk bills, balances,
payments, reports, and WhatsApp PDF sharing. The UI is English; customer invoice
content is intended to be Urdu.

The current implementation has simplified the original PRD around consolidated
weekly bills. It does not currently implement a separate persisted delivery
ledger or a distinct per-delivery invoice type.

## Runtime and dependencies

- Next.js 16.3.7 App Router, React 19.2.8, TypeScript 5 in strict mode.
- Tailwind CSS 4 through `@tailwindcss/postcss`; a few local UI primitives.
- PostgreSQL/Neon via `pg` and Drizzle ORM 0.45.3.
- Zod 4.6.5 validation.
- JWT cookie sessions via `jose`; passwords via `bcryptjs`.
- Icons via `lucide-react`.
- Vitest is configured for database integration tests. Those tests require a
  separate `TEST_DATABASE_URL`; they skip when it is absent so the normal
  application database is never mutated accidentally.
- `npm run dev` and `npm run build` use webpack. Webpack is required on this
  Windows installation because the native Next.js SWC binding does not load and
  Turbopack cannot run with the WASM-only fallback. Other scripts include
  `start`, `lint`, and the Drizzle generate/migrate/push/seed/studio commands.

Required environment variables are documented in `.env.example`:
`DATABASE_URL`, `TEST_DATABASE_URL`, `JWT_SECRET`, `INITIAL_OWNER_PASSWORD`,
`INITIAL_STAFF_PASSWORD`, and `PORT`.

The root layout now provides shared browser/Capacitor connectivity state. An
amber `OfflineBanner` appears globally when offline, and mutation/share controls
use that state to disable without clearing their local form values.

## Main architecture

The implemented request path is generally:

`App Router page -> client feature component -> client hook -> server action -> service -> Drizzle/PostgreSQL`

- `app/`: thin route composition and redirects.
- `components/`: feature-oriented, mobile-first React components.
- `hooks/`: client orchestration and state.
- `actions/`: Next.js server actions, boundary validation, authentication, and
  cache revalidation.
- `lib/services/`: business logic plus direct Drizzle queries. There is no
  separate repository layer.
- `lib/db/`: Drizzle schema, connection, seed, and migration scripts.
- `lib/validators/` and `lib/auth/validators.ts`: Zod input schemas.
- `lib/data/`: shared types/money helpers plus old in-memory compatibility
  adapters. Do not assume everything exported here is database-backed.

## Routes

- `/`: client-side home/login switch; also protected by middleware.
- `/login`: database-backed credentials login.
- `/home`: home screen.
- `/customers` and `/customers/[id]`: customer list and detail.
- `/bills` and `/bills/new`: weekly bill list and creation.
- `/reports`: balances, monthly sales, and daily invoice summaries.
- `/settings`: Owner-only staff/shop/milk settings.
- `/api/db-health`: public database health/details endpoint.
- `/customer`, `/customer/[id]`, `/home/customers`, `/invoice`,
  `/invoice/new`, `/invoice/success`, `/weekly`, and `/monthly` are aliases or
  redirects retained for compatibility.

## Authentication and authorization

- `middleware.ts` verifies the `auth_session` JWT and redirects unauthenticated
  page requests to `/login`.
- `lib/auth/session.ts` signs HS256 JWTs containing `userId` and `role`, stored
  in an HTTP-only, SameSite=Lax cookie for seven days.
- `actions/authActions.ts` validates credentials and sets/clears the cookie.
- `lib/services/authService.ts` verifies bcrypt hashes and uses an in-memory
  per-process login rate limiter from `lib/auth/rateLimit.ts`.
- Owner checks use `requireRole("OWNER")`; settings also guard at page level.
- Staff may create customers and weekly invoices and view general data.
- Important security debt: both middleware and session code contain the same
  hard-coded fallback JWT secret if `JWT_SECRET` is missing.
- `/api/db-health` bypasses authentication and exposes database/shop/count/error
  details.

## Implemented database model

Source of truth in code: `lib/db/schema.ts`.

- `users`: OWNER/STAFF accounts and password hashes.
- `shop_settings`: singleton row with English/Urdu identity.
- `milk_types`: active flag, English/Urdu name, default decimal rate.
- `customers`: contact details, optional default milk type, opening balance,
  active flag. There is no current `billing_mode` column.
- `customer_rates`: per-customer/per-milk override.
- `invoice_counters`: yearly sequential counter.
- `invoices`: weekly period, totals, previous-balance snapshot, status,
  sharing/void metadata.
- `invoice_lines`: dated milk line items stored directly under invoices.
- `payments`: persisted customer ledger entries with creator and date metadata.

Customer live balance is computed centrally by `lib/balance.ts` as opening
balance plus issued invoice totals minus payment totals. Issued invoice creation
snapshots that balance into `previousBalance`.

## Core business flows

### Weekly invoice

`useNewWeeklyBill` loads active customers and milk types, manages a Monday-to-
Sunday line-entry form, refreshes the selected customer's balance, resolves
rates for display, and submits through `createWeeklyInvoice`.

`invoiceService.createWeeklyInvoiceInDb` runs a transaction that:

1. Loads and validates the active customer.
2. Computes the live previous balance.
3. Atomically increments the current year's invoice counter.
4. Resolves the authoritative customer/default rate for each line, rejects a
   Staff override, and permits an explicit Owner override.
5. Inserts the invoice and its invoice lines.

Line dates must fall inside the chosen week, amounts are calculated with integer
paisa arithmetic, and invoice numbers use `INV-YYYY-NNNN`. The `/bills` screen
shows generated and not-yet-billed customers for the chosen week, supports
quick-create links, and opens `/bills/[id]` for sharing or Owner-only voiding.
Both Owner and Staff can create bills. Only Owner can void.

### Payments

Customer detail records payments through database-backed server actions. Staff
and Owner may record a positive, non-future payment; only Owner sees and may use
the confirmed delete flow. Saving or deleting refreshes the displayed balance
and payment ledger immediately. Payments never render on invoice PDFs; their
only invoice effect is the live balance snapshotted onto a later invoice.

### Customers and master data

- Customer listing supports search, active-only results, and an outstanding-
  balance filter.
- Owner can update/deactivate customers and manage special rates.
- Staff and Owner can add customers.
- Owner manages milk types, shop settings, staff activation, and staff password
  resets.
- Pakistani phone numbers are normalized by `lib/utils/phone.ts`.

### Reports

- Balances are database-backed and sorted from computed live balances.
- Monthly sales aggregate issued invoices by customer and issue month.
- The daily report currently reports invoices issued on a day, not underlying
  delivery records. It uses placeholder values (`10:00 AM`, rate `0`) and puts
  invoice number into staff-related fields.
- `useReportsData` initializes to hard-coded September 2026/month-date values;
  its selected month label is not passed to the monthly server query, so the
  month selector and fetched month can diverge.

### PDF and WhatsApp

- `UrduInvoiceTemplate.tsx` exports the A5, RTL `UrduInvoice` raster source,
  including the Urdu line table, totals, footer, and VOID watermark.
- `lib/pdfGenerator.ts` loads full invoice/shop data, converts a locally bundled
  Noto Naskh Arabic font to an embedded base64 `@font-face`, mounts the invoice
  off-screen, rasterizes at 2x with `html2canvas`, and creates a compressed A5
  PDF Blob with `jsPDF`.
- `usePreparedInvoicePdf` starts PDF preparation when success, list-row, or
  detail UI loads. Share taps use the already-prepared Blob to preserve browser
  user activation.
- `lib/share.ts` writes PDFs to Capacitor cache and invokes native Share on a
  native platform. Browser Web Share is used when file sharing is supported;
  otherwise the PDF downloads with an explanatory UI note.
- Successful native/browser share marks the invoice shared. Download fallback
  and cancelled shares do not. Issued invoices always offer Resend; VOID
  invoices never render a share control.
- Capacitor core/filesystem/share packages are installed, but an Android native
  wrapper/configuration has not yet been added to this repository.

### PWA and shared UX states

- `public/manifest.json` configures the standalone Al-Imran Dairy PWA and its
  192px, 512px, and maskable icons. There is intentionally no service worker or
  offline data cache.
- `ConnectivityProvider`, `OfflineBanner`, `PageSkeleton`, and `EmptyState` are
  the shared primitives for online state, loading, and empty lists.
- `lib/friendlyError.ts` maps common connectivity, liters-validation, and stale
  rate failures to plain-language inline messages.
- `@capacitor/network` is installed for native connectivity events.
- Owner and Staff share the same current home action-card system; role checks
  only control which permitted destination cards appear. The Owner settings
  screen is headed simply `Settings` and groups shop, milk, and staff cards
  under consistent typography.

## Mock and incomplete paths

The app is not fully database-backed:

- `lib/data/payments.ts` is a legacy in-memory adapter, but the active customer
  detail flow now uses database-backed payment server actions instead.
- `lib/data/customers.ts`, `settings.ts`, `reports.ts`, and `invoices.ts` are old
  in-memory/fallback adapters. Most active screens use server actions instead,
  but these modules remain exported by `lib/data/index.ts`.
- `lib/mock.ts` remains in use for login prop types/header branding and payment
  display types/data.
- There is no standalone delivery-entry workflow, per-delivery invoice flow,
  weekly queue generation from unbilled deliveries, CSV export, automatic
  backup, PWA manifest/service configuration, or Capacitor Android wrapper.

## Schema and migration warning

There is material drift between migration artifacts and the TypeScript schema:

- `drizzle/0000_foamy_redwing.sql` describes the older PRD schema with
  `deliveries`, customer `billing_mode`, invoice `type`, and period columns.
- `lib/db/schema.ts` describes the simplified schema with `invoice_lines`,
  `week_start`, and `week_end`, and without deliveries/billing mode/type.
- `lib/db/migrate-flow-simplification.ts` imperatively converts an existing
  database by dropping `deliveries` and other old columns, but it is not a
  versioned Drizzle migration and is not exposed as a package script.
- Do not generate or apply migrations until the actual target database state is
  inspected and the desired schema direction is explicitly approved.

## Known quality and security concerns

- Urdu and punctuation text is visibly mojibake-corrupted in multiple source
  files, seeds, messages, and `project.md`.
- `app/page.tsx` decides whether to show home or login from a `sessionStorage`
  `current_user` key, while actual auth uses an HTTP-only cookie. Login does not
  visibly set that key, so root-page behavior is inconsistent with middleware.
- Invoice list queries are unpaginated.
- `markInvoiceSharedInDb` does not verify that an invoice exists or is issued.
- `getShopSettingsAction` lacks its own explicit session check, although normal
  page access is middleware-protected.
- `app/api/db-health/route.ts` uses `any`, logs raw errors, and returns internal
  error text publicly.
- Several source files exceed project size guidance: `invoiceService.ts` is 381
  lines; `useNewWeeklyBill.ts` is 245; `MilkTypesCard.tsx` is 196; and multiple
  components exceed the 150-line component limit.
- Naming is inconsistent between Al-Madina in page metadata and Al-Imran in
  seeded/default shop content.
- README is still the default Create Next App document.

## Verification state

- There are three executable database scripts: `test-auth.ts`,
  `test-master-data.ts`, and `test-flow-simplification.ts`.
- They are manual integration scripts, not isolated deterministic tests. The
  latter two mutate the configured database; the flow script creates and voids
  an invoice, and the master-data script creates/updates a customer and special
  rates.
- `npm test` runs Vitest using the runner config loader. Payment and weekly
  invoice integration tests are gated by `TEST_DATABASE_URL`; weekly coverage
  includes duplicate same-week invoices, Staff rate rejection, and concurrent
  invoice-number allocation.
- On 2026-10-03, `npm run build` completed successfully with Webpack after the
  `/bills` route added the Suspense boundary required by `useSearchParams`.
  Next.js still reports non-fatal warnings about the unavailable native Windows
  SWC binary and the deprecated `middleware.ts` convention.

## Safe starting procedure for future tasks

1. Read this file, `project.md`, and `.agents/rules/backendeule.md`.
2. Check the exact files named by the requested feature; do not rely solely on
   this snapshot.
3. Check `package.json`/lockfile before using a package API.
4. Treat `lib/db/schema.ts` as the intended code model but verify live DB and
   migration state before schema work.
5. Prefer database-backed server actions/services; do not extend the in-memory
   adapters.
6. Ask for approval before dependencies, schema/migrations, auth/security,
   payments, destructive actions, or public contract changes.
7. Run lint, TypeScript/build, and relevant safe tests. Do not run the mutating
   integration scripts against a non-test database without explicit approval.
