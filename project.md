# Milk Shop Invoicing App — Project Requirements Document (PRD)

**Version:** 1.0 (MVP)
**Status:** Draft for build
**Target user:** Milk shop owner + employees (non-technical), using phones
**Primary goal:** Create an invoice for a bulk customer in under 30 seconds and send the PDF directly on WhatsApp in one tap.

---

## 1. Product Summary

A mobile-first web app (installable as a PWA, and wrapped into an Android APK using Capacitor upon completion) that lets a milk shop record deliveries to bulk customers (shops and individuals), generate invoices per delivery or as a weekly consolidated bill, and send the PDF invoice directly via the phone's native WhatsApp share. The app UI is in simple English. The invoice the customer receives is in simple, readable Urdu.

### 1.1 Confirmed Requirements (from client discussion)

| Area | Decision |
|---|---|
| Customers | Bulk buyers: shops and individuals (not walk-in retail) |
| Billing modes | **Both**: per-delivery invoice and **weekly consolidated invoice** |
| Invoice fields | Customer, date, milk type (optional/pre-filled), liters, rate, line amount, total, **previous balance**. No fat/SNF, no delivery slots, no "payment received" line |
| Pricing | Default rate per milk type (cow / buffalo), **special per-customer rates**, owner can edit rates |
| WhatsApp | Invoice is generated as a **PDF**, then shared directly to the customer via the phone's native Share sheet → WhatsApp. No public URL or deep link needed. |
| Devices | Phone-first (Android APK via Capacitor / PWA) |
| Users | **Roles**: Owner and Staff |
| Language | App: strictly simple English (no Urdu in the app UI). Invoice: simple readable Urdu for the customer |
| Connectivity | Online only. If offline, show a clear message and let the user retry when back |
| Reports | Customer list with balances and reports |
| Scale | One shop, about 50 invoices per month, one Owner and a few Staff. Free tiers are more than enough; no performance tuning needed |

### 1.2 Assumptions (please confirm with the client)

1. **Payments must be recorded** even though they are not printed on the invoice. Previous balance cannot be calculated without knowing what each customer has paid. The MVP includes a very small "Record payment" screen.
2. **Milk type is "optional" in the UI** by giving each customer a default milk type, so the field is pre-filled and usually skipped. Internally every delivery still has a milk type so the correct rate can be applied.
3. Currency is PKR, no tax/GST on invoices, timezone is Asia/Karachi.
4. Invoices cannot be edited after being issued. They can be **voided** by the Owner and re-created. This keeps balances trustworthy.
5. Urdu digits: Western digits (0-9) are used in invoices because they are common in Pakistani business paperwork and easier to read next to `Rs`.

---

## 2. Users and Roles

| Capability | Owner | Staff |
|---|:---:|:---:|
| Create deliveries / invoices | Yes | Yes |
| Send invoice via WhatsApp | Yes | Yes |
| View customers | Yes | Yes |
| Add customers | Yes | Yes |
| Edit / deactivate customers | Yes | No |
| Edit default milk rates | Yes | No |
| Set special customer rates | Yes | No |
| Record payments | Yes | Yes |
| Void an invoice | Yes | No |
| View reports | Yes | Limited (own daily entries only) |
| Manage staff accounts | Yes | No |
| Export data | Yes | No |

Staff accounts are created by the Owner (no public sign-up).

---

## 3. Functional Requirements

### 3.1 Home Screen (3 big buttons)

1. **New Invoice** (main action)
2. **Customers**
3. **Reports** (Owner) / **Today's Entries** (Staff)

Keep the whole app to these areas plus a small Settings page. No dashboards, no charts in v1.

### 3.2 Customers

- Fields: name, phone (WhatsApp number), address (optional), default milk type, billing mode (Per Delivery / Monthly), opening balance, active flag.
- Search by name or phone, big tappable list.
- Customer detail page: current balance, list of invoices, list of payments, special rates.
- Phone number is normalized to international format on save (see Section 5.4).

### 3.3 Rates

- **Default rates:** one rate per milk type, editable by Owner. Milk types are a small owner-managed list (starts with Cow and Buffalo, more can be added).
- **Special rates:** optional override per customer per milk type.
- **Rate resolution order** when adding a delivery: customer special rate, otherwise default rate.
- The rate used is **copied (snapshotted) onto every delivery and invoice line**, so changing a rate later never changes old invoices.
- Staff sees the rate but cannot change it. Owner can override the rate on an individual line if needed.

### 3.4 Per-Delivery Invoice Flow (the fast path)

1. Tap **New Invoice**.
2. Search and pick the customer.
3. Milk type is pre-filled (change if needed).
4. Enter liters using a large numeric keypad.
5. Rate is auto-filled. Total is calculated live.
6. Tap **Create Invoice**.
7. Success screen shows the invoice summary with a large green **Send on WhatsApp** button.

### 3.5 Weekly Invoice Flow

- Staff or Owner logs each delivery during the week with the same quick form (customer, milk type, liters, date defaults to today) without generating an invoice.
- At week end (or anytime), Owner opens **Weekly Bills**:
  - Select the week (date range), see customers with un-invoiced deliveries in that period.
  - Preview the consolidated bill (one line per delivery).
  - Generate for one customer or for all selected customers.
  - The app generates a **PDF** for each invoice and presents a "Send next" queue.
  - For each customer, the owner taps **"Share on WhatsApp"** — the phone's native Share sheet opens and the owner selects WhatsApp to send the PDF directly to the customer's number.
- All included deliveries are marked as invoiced so they cannot be billed twice.

### 3.6 Invoice Content (Urdu)

Each invoice shows:

- Shop name and phone
- Invoice number and date (weekly bills show the period, e.g. "1 Oct – 7 Oct 2026")
- Customer name
- Line items: date, milk type, liters, rate per liter, amount
- Total liters and **invoice total**
- **Previous balance** (balance before this invoice)
- **Total payable** (previous balance + invoice total)

The payment received line is intentionally excluded.

### 3.7 WhatsApp Sending (v1 — Native PDF Share)

The invoice is rendered on-device as a **PDF** and shared directly via the phone's native Share sheet:

1. After generating the invoice, the app renders the Urdu invoice layout into a **PDF file** on-device (using a library such as `html2canvas` + `jsPDF` or equivalent).
2. The PDF is passed to the **Web Share API** (`navigator.share({ files: [pdfFile] })`) or, when running as a Capacitor APK, to the **`@capacitor/share`** plugin.
3. The phone's native Share sheet appears; the owner selects **WhatsApp** and picks the customer's chat. The PDF lands directly in the chat — no message text required, though a short Urdu caption is pre-filled.
4. The app then marks the invoice as **"Sent"**. A **Resend** button is always available.

> **No public URL is generated or required.** The customer receives the full PDF invoice directly in WhatsApp. There is no `/i/[token]` page.

> **Limitation to explain to the client:** The app cannot confirm whether the owner actually tapped Send inside WhatsApp. "Sent" means the Share sheet was opened. A **Resend** button is always available.

**Optional short Urdu caption (pre-filled alongside the PDF):**

```
السلام علیکم {customer_name}،

آپ کا دودھ کا بل تیار ہے۔
بل نمبر: {invoice_no}
تاریخ: {period_start} – {period_end}
کل مقدار: {total_liters} لیٹر
اس بل کی رقم: Rs {invoice_total}
پچھلا بقایا: Rs {previous_balance}
کل واجب الادا: Rs {grand_total}

شکریہ
{shop_name}
```

### 3.8 Payments (minimal)

- **Record payment:** customer, amount, date, optional note.
- Payments only affect the customer's balance and the "previous balance" on future invoices.
- Not shown on the invoice itself.

### 3.9 Reports (Owner)

MVP reports (simple tables, no charts):

1. **Customer balances:** all customers with current outstanding balance, sortable, with a "Send reminder" WhatsApp deep link (pre-filled Urdu text).
2. **Monthly sales:** per customer, total liters and total amount for a chosen month.
3. **Daily deliveries:** total liters and amount for a chosen day, and per-staff entries.
4. **Customer statement:** all invoices and payments for one customer over a date range.

Post-MVP: CSV export, charts.

### 3.10 Connectivity Behavior

- The app needs internet to save anything.
- If offline: show a persistent banner ("No internet. Please wait until it is back."), disable the Create/Save buttons, and **keep the typed form values on screen** so nothing is lost.
- Saves retry automatically only when the user taps the button again once back online. No offline queue or sync in v1.
- The PWA installs to the home screen for an app-like feel, but does not cache business data.

---

## 4. Non-Functional Requirements

| Area | Requirement |
|---|---|
| Usability | Large touch targets (min 48px), one primary action per screen, English wording at a simple reading level, numeric keypad for quantities |
| Performance | Invoice creation round trip under 2 seconds on a normal 4G connection |
| Cost | Operating cost as close to zero as possible (see Section 5.2) |
| Security | Hashed passwords, HTTP-only session cookies, role checks on every server action, unguessable public invoice tokens |
| Data integrity | Money stored as exact decimals, invoice numbers sequential and never reused, issued invoices immutable (void only) |
| Browser support | Latest Chrome and Safari on Android and iOS |
| Availability | Free-tier hosting, no formal SLA; acceptable for this client |
| Backup | Weekly automatic database export (scheduled job) plus an Owner-triggered CSV export; provider backups as a second layer |

---

## 5. Technical Design

### 5.1 Recommended Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js (App Router) + TypeScript** | One codebase for UI, server actions and the public invoice page; you already know it |
| UI | **Tailwind CSS + shadcn/ui** | Fast to build large, clean touch-friendly components |
| Database | **PostgreSQL on Neon (free tier)** | Relational data with exact `numeric` money and transactions, generous free tier |
| ORM | **Drizzle** or **Prisma** | Type-safe queries and migrations; either is fine, use what you prefer |
| Auth | **Auth.js (credentials)** or a small custom session layer | Username/phone + password, two roles |
| Validation | **Zod** | Shared schemas for forms and server actions |
| Hosting | **Free-tier host with Next.js support** (Netlify, or Vercel if its current terms allow commercial use; see caveat below) | Easy Next.js deploys; volume is tiny so any free plan is enough |
| Fonts | **Noto Naskh Arabic** via `next/font` (self-hosted at build) | Simple, readable Urdu. Nastaliq fonts look traditional but are harder to read at small sizes and cause line-height problems |
| PWA | Web manifest + icons | Home-screen install only; no service worker and no data caching, which keeps debugging simple |
| Mobile Packaging | **Capacitor** | Wrap the finished web application into a standalone Android APK after web build completion |

**Alternative if MongoDB is preferred:** it works, but this domain is ledger-style (invoices, payments, balances), so Postgres transactions and constraints are a better fit.

### 5.2 Cost Plan

| Item | Plan | Expected cost |
|---|---|---|
| App hosting | Free tier (Netlify, or Vercel if terms allow) | $0 |
| Database | Neon free tier | $0 |
| WhatsApp | `wa.me` deep links | $0 |
| Domain | Optional; can use the free `*.vercel.app` subdomain at first | $0 (or about $10-15/year for a custom domain) |

> **Please verify before launch:** free-tier limits and terms change. At about 50 invoices per month, usage will be far below any free-tier limit, so the question is terms, not capacity. In particular, Vercel's free (Hobby) plan has been restricted to personal, non-commercial use. Since this is a paying client's business, check the current terms of whichever host you choose. Netlify, Cloudflare (needs a Next.js adapter) or a small VPS are alternatives. The app has no host-specific dependencies, so moving is easy. Also check Neon's current free limits and its behavior when idle (the first request after inactivity can be slower, which is acceptable here).

### 5.3 System Architecture

```
┌──────────────────────────────────────────┐
│ Owner / Staff phone                      │
│ (Capacitor Android APK / PWA in Browser) │
└────────────────────┬─────────────────────┘
            │ HTTPS
            ▼
┌───────────────────────────────────────────┐
│ Next.js app (free-tier host)              │
│  • Authenticated UI  (English)            │
│  • Server Actions / Route Handlers (API)  │
│  • On-Device Urdu PDF Invoice Renderer    │
└───────────┬───────────────────────────────┘
            │ SQL (pooled connection)
            ▼
┌────────────────────────┐
│ PostgreSQL (Neon free) │
└────────────────────────┘

WhatsApp (v1): The phone generates an Urdu PDF on-device and passes it to the
               native Share sheet (via Web Share API or @capacitor/share).
               The owner selects WhatsApp to deliver the PDF directly to the chat.
```

### 5.4 Key Data Flows

**A) Create a per-delivery invoice and send it**

1. Staff selects customer and enters liters in the app.
2. Server action checks the session and role.
3. In **one database transaction**:
   - Resolve the rate (customer special rate, else default).
   - Compute `previous_balance` = opening balance + sum of issued invoice totals − sum of payments for that customer.
   - Allocate the next invoice number.
   - Insert the delivery, invoice and invoice line (snapshotting rate and previous balance).
4. Server returns the created invoice and line items.
5. Client renders the Urdu invoice into a PDF blob on-device.
6. Client invokes native share (`navigator.share` / `@capacitor/share`) with the PDF file attached.
7. Owner picks WhatsApp and selects the customer chat to send the PDF.
8. Client records the invoice as "Sent".

**B) Generate a weekly invoice**

1. Owner picks a week (date range); server lists customers with un-invoiced deliveries in that period.
2. For each selected customer, in one transaction: gather un-invoiced deliveries, create an invoice of type `WEEKLY` with one line per delivery, compute totals and previous balance, allocate the invoice number, link the deliveries to the invoice.
3. The app presents a "Send next" queue that generates each PDF and opens the native Share sheet customer by customer.

**Phone number normalization (Pakistan):** strip spaces, dashes and `+`. If it starts with `0`, replace the leading `0` with `92` (`0300 1234567` becomes `923001234567`). If it starts with `92`, keep it. `wa.me` needs digits only, international format, no `+` and no leading zeros.

**Balance calculation:** the balance is always **computed** from invoices and payments (plus the opening balance), never stored as a mutable number, so it cannot drift out of sync. Each invoice also stores a snapshot of `previous_balance` so old invoices always show what they showed when issued.

### 5.5 Database Schema (PostgreSQL)

```sql
-- Users (Owner and Staff)
CREATE TABLE users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  username      text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  role          text NOT NULL CHECK (role IN ('OWNER', 'STAFF')),
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Single-row shop settings (shown on invoices)
CREATE TABLE shop_settings (
  id            smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  shop_name     text NOT NULL,
  shop_name_ur  text NOT NULL,          -- Urdu name shown on invoices
  phone         text,
  address_ur    text
);

-- Milk types with default rate
CREATE TABLE milk_types (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL UNIQUE,   -- e.g. 'Cow'
  name_ur       text NOT NULL,          -- e.g. 'گائے'
  default_rate  numeric(10,2) NOT NULL CHECK (default_rate >= 0),
  is_active     boolean NOT NULL DEFAULT true
);

-- Customers (bulk buyers)
CREATE TABLE customers (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                 text NOT NULL,   -- can be English or Urdu
  phone                text NOT NULL,   -- stored normalized, e.g. 923001234567
  address              text,
  default_milk_type_id uuid REFERENCES milk_types(id),
  billing_mode         text NOT NULL DEFAULT 'WEEKLY'
                         CHECK (billing_mode IN ('PER_DELIVERY', 'WEEKLY')),
  opening_balance      numeric(12,2) NOT NULL DEFAULT 0,
  is_active            boolean NOT NULL DEFAULT true,
  created_at           timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_customers_name  ON customers (lower(name));
CREATE INDEX idx_customers_phone ON customers (phone);

-- Special per-customer rates
CREATE TABLE customer_rates (
  customer_id   uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  milk_type_id  uuid NOT NULL REFERENCES milk_types(id),
  rate          numeric(10,2) NOT NULL CHECK (rate >= 0),
  PRIMARY KEY (customer_id, milk_type_id)
);

-- Invoice number counter (one row per year, incremented inside the transaction)
CREATE TABLE invoice_counters (
  year          int PRIMARY KEY,
  last_number   int NOT NULL DEFAULT 0
);

-- Invoices
CREATE TABLE invoices (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_no       text NOT NULL UNIQUE,        -- e.g. 'INV-2026-0001'
  customer_id      uuid NOT NULL REFERENCES customers(id),
  type             text NOT NULL CHECK (type IN ('PER_DELIVERY', 'WEEKLY')),
  issue_date       date NOT NULL,
  period_start     date,                        -- weekly bills only
  period_end       date,
  total_liters     numeric(10,2) NOT NULL,
  total_amount     numeric(12,2) NOT NULL,
  previous_balance numeric(12,2) NOT NULL DEFAULT 0,   -- snapshot at issue time
  status           text NOT NULL DEFAULT 'ISSUED' CHECK (status IN ('ISSUED', 'VOID')),
  shared_at        timestamptz,                 -- set when user opens native Share sheet
  created_by       uuid NOT NULL REFERENCES users(id),
  voided_by        uuid REFERENCES users(id),
  voided_at        timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_invoices_customer_date ON invoices (customer_id, issue_date DESC);

-- Deliveries (daily entries; also the line items of every invoice)
CREATE TABLE deliveries (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id   uuid NOT NULL REFERENCES customers(id),
  milk_type_id  uuid NOT NULL REFERENCES milk_types(id),
  delivery_date date NOT NULL,
  liters        numeric(10,2) NOT NULL CHECK (liters > 0),
  rate          numeric(10,2) NOT NULL,         -- snapshot of the rate used
  amount        numeric(12,2) NOT NULL,         -- liters * rate, rounded
  invoice_id    uuid REFERENCES invoices(id),   -- NULL until invoiced
  created_by    uuid NOT NULL REFERENCES users(id),
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_deliveries_customer_date ON deliveries (customer_id, delivery_date);
CREATE INDEX idx_deliveries_date       ON deliveries (delivery_date);

-- Payments (affect balance only; not printed on invoices)
CREATE TABLE payments (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id   uuid NOT NULL REFERENCES customers(id),
  amount        numeric(12,2) NOT NULL CHECK (amount > 0),
  payment_date  date NOT NULL,
  note          text,
  created_by    uuid NOT NULL REFERENCES users(id),
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_payments_customer_date ON payments (customer_id, payment_date DESC);
```

**Design notes**

- A per-delivery invoice is simply an invoice with exactly one delivery row. A monthly invoice links many delivery rows. There is one code path for both.
- **Current balance** for a customer:
  `opening_balance + SUM(total_amount of ISSUED invoices) − SUM(payments)`
- Voiding an invoice sets `status = 'VOID'` and releases its deliveries (`invoice_id = NULL`) so they can be re-billed. Voided invoices are excluded from customer balance calculations.

### 5.6 PDF Invoice Generation (On-Device)

- The Urdu invoice layout is a styled React component rendered inside a hidden `<div>` on the invoice success screen.
- **`html2canvas`** rasterizes the layout into a canvas, then **`jsPDF`** converts it into a PDF blob — all on-device, no server round-trip.
- The resulting PDF file is passed to **`navigator.share({ files: [pdfBlob] })`** (Web Share API Level 2) which triggers the phone's native share sheet.
- When running inside the **Capacitor Android APK**, `@capacitor/share` is used as a drop-in replacement for the same flow.
- The invoice has RTL layout (`dir="rtl"`, `lang="ur"`), Noto Naskh Arabic font embedded at build time, and is sized to A5 for readability on mobile screens.
- **No public URL or server token is required.** The `/i/[token]` public page is not built.

### 5.7 Security Checklist

- Passwords hashed with argon2 or bcrypt.
- HTTP-only, secure, same-site session cookies.
- Role check inside every server action (never trust the UI alone).
- Zod validation on all inputs; parameterized queries via the ORM.
- Login rate limiting.
- Secrets in environment variables only.
- Public tokens are at least 24 random characters.
- Owner-only actions (rates, voiding, staff management, exports) are enforced server-side.

### 5.8 Capacitor Packaging & Android APK Strategy

Once web development is finished, the application will be wrapped into an Android APK using **Capacitor**:
- **Wrapper Architecture:** Since the app utilizes Next.js Server Actions and server components, Capacitor will be configured to load the hosted production web app (via `server.url` in `capacitor.config.ts`), or alternatively bundle an exported shell that speaks to remote API endpoints.
- **Native Share / WhatsApp Integration:** Tapping the Share button invokes the native share dialog (`navigator.share` / `@capacitor/share`), enabling the user to directly share the generated PDF into WhatsApp without relying on external web links.
- **Offline / Connectivity:** Native network monitoring via `@capacitor/network` to trigger the offline alert banner immediately if the phone loses 4G/WiFi.
- **Distribution:** Generate an installable `.apk` file directly for the client/owner's phone without requiring Google Play Store submission for v1.

---

## 6. UX Guidelines

- Big buttons, big numbers, one primary action per screen.
- Use plain words: "New Invoice", "Send on WhatsApp", "Customers", "Reports".
- Live total shown while typing liters.
- Confirmation before anything destructive (void).
- Errors in plain language ("Please enter a phone number that starts with 03").
- Green WhatsApp button only appears after the invoice is saved.
- Keep the layout usable one-handed on a small Android phone.

---

## 7. MVP Implementation Plan

Rough estimate: **1.5 to 2 weeks part-time** (single shop, about 50 invoices per month). Each phase ends with something demoable.

### Phase 0 — Setup (0.5 day)
- Create the Next.js + TypeScript project, Tailwind, shadcn/ui.
- Set up the Neon database, ORM and migrations, environment variables.
- Deploy an empty app to the host to confirm the pipeline works.

### Phase 1 — Auth and Roles (1-2 days)
- Users table, login page, session handling.
- Seed the first Owner account; Owner-only page to add and disable Staff.
- Role-guard helper used by every server action.

### Phase 2 — Master Data (2 days)
- Shop settings (English and Urdu shop name, phone).
- Milk types with default rates (Owner edits).
- Customers: list, search, add, edit, default milk type, billing mode, opening balance.
- Special rates per customer (Owner only).

### Phase 3 — Delivery and Per-Delivery Invoice (3 days)
- Quick "New Invoice" form: customer search, milk type, liters keypad, rate resolution, live total.
- Transactional creation: delivery, invoice, invoice number, previous-balance snapshot.
- Success screen with invoice summary.

### Phase 4 — Urdu Invoice PDF and Native WhatsApp Share (2 days)
- Build the hidden Urdu invoice React component (RTL, Noto Naskh Arabic font, A5 layout).
- Integrate `html2canvas` + `jsPDF` to render the component to a PDF blob on-device.
- Wire the PDF blob to `navigator.share()` / `@capacitor/share` — **native Share sheet → WhatsApp**.
- Mark invoice as "Sent" after share sheet opens; always show a **Resend** button.
- Test on real Android (Capacitor WebView) and Chrome mobile, verifying the PDF arrives in WhatsApp.

### Phase 5 — Payments and Balances (1-2 days)
- Record payment screen.
- Customer detail page with computed balance, invoice list and payment list.

### Phase 6 — Weekly Billing (2-3 days)
- Log-only delivery entry (no invoice) for weekly customers.
- Week-end screen: select a week range, list customers with un-invoiced deliveries, preview, generate.
- Consolidated invoice PDF rendering (one line per delivery, Urdu, A5).
- "Send next" queue with native Share button per customer.

### Phase 7 — Reports (2 days)
- Customer balances list with reminder deep link.
- Monthly sales per customer.
- Daily deliveries summary.
- Customer statement over a date range.

### Phase 8 — Polish, PWA, Capacitor APK and Safety Nets (1-2 days)
- Manifest and icons so the app installs to the home screen.
- Wrap application with Capacitor: add Android platform, configure `capacitor.config.ts`, app icon, and splash screen.
- Verify WhatsApp deep-link breakout from inside the Capacitor WebView.
- Build and test the release/debug Android APK on target devices.
- Offline banner and disabled save buttons; preserve form state.
- Void invoice flow (Owner) with confirmation.
- Owner data export (CSV).
- Weekly automatic database backup (for example a scheduled GitHub Action running `pg_dump` to private storage), and a tested restore.
- Empty states, error messages, loading states.

### Phase 9 — Client Trial and Launch (2-3 days, overlaps others)
- Load the real customer list and rates.
- Sit with the owner and one employee for a real day of use.
- Fix friction points, then go live and check in after the first week-end billing.
- Write a one-page handover note: how to reset a password, how to restore a backup, and who to contact for help.

---

## 8. MVP Acceptance Criteria

1. Staff can create a per-delivery invoice in about 30 seconds or less.
2. The correct rate is applied (special rate over default), and changing rates never alters old invoices.
3. Tapping **Share on WhatsApp** generates a PDF and opens the phone's native Share sheet; the PDF arrives in the customer's WhatsApp chat on Android and iPhone.
4. The PDF invoice is a readable Urdu document showing liters, rate, total, previous balance and total payable — no internet link required for the customer to view it.
5. Weekly billing generates one consolidated PDF invoice per customer and never bills the same delivery twice.
6. Previous balance is correct after payments are recorded.
7. Staff cannot change rates, void invoices or manage users.
8. With no internet, the app shows a clear message and does not lose the typed data.
9. The Owner can see a customer list with balances and a weekly sales report.
10. The finished web app can be compiled into an Android APK via Capacitor, installed on an Android device, and successfully shares the PDF invoice into WhatsApp via the native share sheet.

---

## 9. Out of Scope for v1 (Later)

- Automatic sending via **WhatsApp Cloud API** (would allow fully automated PDF sending with no manual share tap; requires a Meta business account, verification and template approval).
- Offline mode with sync.
- PDF file generation on the server.
- Payment reminders sent automatically.
- Charts and analytics dashboards.
- Multi-shop or multi-branch support.
- Tax handling, discounts and credit notes.

---

## 10. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Owner forgets to tap Send after the Share sheet opens | Invoice shows "Sent" versus "Not sent yet" and the list can be filtered to unsent invoices; a Resend button is always visible |
| Web Share API not supported on older Android browsers | Detect support; fall back to a "Download PDF" button so the owner can share manually |
| Free-tier limits or terms change | Keep the app portable (standard Next.js and Postgres); document the move to another host |
| Urdu text renders badly in the PDF | Self-host Noto Naskh Arabic, embed the font in the PDF via jsPDF, test on low-end Android |
| Balance mistakes from edited history | Invoices are immutable (void and re-issue only), balances are computed, previous balance is snapshotted |
| Staff mistakes | Confirmation on save, Owner can void, daily entries report for review |
| `navigator.share` opens inside WebView without triggering native WhatsApp | Use `@capacitor/share` plugin inside the APK, which calls the Android native share intent directly |

---

## 11. Open Questions for the Client

1. Should staff be allowed to record payments, or only the owner?
2. Should the invoice show the shop logo?
3. Monthly bills: one line per delivery, or one line per day, or a single total line?
4. Are there any customers who need a per-delivery invoice for some milk types and monthly billing for others?
5. Preferred invoice number format (for example `INV-2026-0001`)?