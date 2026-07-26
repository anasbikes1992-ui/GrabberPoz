# GRABBER POS Studio — Complete Feature & Build Plan

**Goal:** rebuild the full "Easy POS v5.32" system as GRABBER POS Studio — a
multi-vertical business-management + POS platform — with a cleaner UI, and
package it for **reselling to clients** (build docs + user docs + licensing).

## Source of truth

This revision is built from **direct observation of the live authenticated
system** (screens shared 2026-07-22): the home launcher (`index2.php`), the
business-management menu (`options.php`), the products list (`products.php`), and
the billing screen (`add-sale-newm`). Everything below is **confirmed**, not
inferred, unless marked ⚠.

Status: ✅ built · 🟡 partial · ⬜ planned

---

## 1. Operation / Sale modes (home launcher)

The legacy home is a tile launcher of **sale modes** — the same catalog + billing
engine specialized per vertical. This is the platform's defining feature.

| Mode | Purpose | Vertical | Status |
|------|---------|----------|--------|
| Retail Mode | Standard barcode retail billing | shops | 🟡 |
| Sale Mode | Generic quick sale | any | 🟡 |
| Category Sale Mode (CAT MOD) | Sell by category grid (no barcodes) | cafes, apparel | ⬜ |
| Restaurant Mode (Rest MOD) | Tables, KOT/BOT, courses | food & beverage | ⬜ |
| Delivery Mode | Orders for delivery + driver assign | food, retail | ⬜ |
| Repair Mode | Item repair intake → job → billing | electronics, phones | ⬜ |
| Vehicle Service Mode (Service MOD) | Vehicle service jobs + parts + labour | garages | ⬜ |
| Reloads | Mobile top-ups / reload sales | comms shops | ⬜ |
| Room Management | Hotel/guesthouse room booking + billing | hospitality | ⬜ |
| Rent Mode | Rental items, periods, returns, deposits | equipment rental | ⬜ |
| Hire Purchase | Installment sales + schedules | appliances, furniture | ⬜ |
| Play Area | Time-based play sessions billing | kids play centres | ⬜ |
| Register / Other Mode (Reg MOD) | Misc/other sale | any | ⬜ |
| Digital Mode | Digital-goods sale | any | ⬜ |
| **Offline Mode** | Bill without internet, sync later | all | 🟡 (mobile) |

> The **billing engine** (below) is shared; each mode adds its own entities and
> pre/post steps (a table, a room, a repair job, an installment plan…).

---

## 2. The billing engine (add-sale-newm) — confirmed spec

The core screen every mode reuses. Fields observed:

**Cashier bar** — cashier name, date, back/home/history.
**Item entry** — searchable barcode dropdown (`code – variant – name – Rs.price –
QTY`); "Add none-stock items"; Retail⇄Wholesale toggle; per-line: Name, Quantity,
Sale Price, **Maximum Discount**, Your Discount Rs, Your Discount %, New Price →
**Add (CTRL)**.
**Cart / Billed items** — line list, Sub-total, Total (LKR).
**Charges & discount** — Service charge, Final Discount (Rs), Final Discount (%).
**Payment** — Payment Type (F1: cash/card/…), Customer (F2: Random/select),
Customer Name, Customer Mobile, Employee (F3), Customer paid (F4), Balance.
**Actions** — Cancel · **Proceed (INSERT)**. Keyboard: F1–F4, CTRL, INSERT.

Status vs GRABBER today: cart, per-unit discount cap, cash/change ✅ · service
charge, final discount Rs/%, customer capture, employee, split/change, F-key
shortcuts, none-stock items, wholesale toggle ⬜ (next).

---

## 3. Product management (products.php) — confirmed spec

Toolbar: **Add** (New · Quick · Excel · Global · GRN) · **Manage** · filter tabs
(All · Pending · Stock · Brands) · **Barcode · Print · Settings · P.Settings ·
Package**. Body: name/barcode filter + category dropdown, **Download Products**,
product cards (image, name, code e.g. `CL10262`, `Stock – 1.00`, price
`Rs..4,500.00/=`, In/Out-Stock badge) with per-card actions: **print label ·
print · view · edit · delete**.

Status: list + search + category filter ✅ · add/edit/delete, Excel in/out,
barcode/label print, packages, pending, brands ⬜.

---

## 4. Management modules (options.php) — confirmed full list

Grouped for delivery. All are org/branch-scoped with RLS + audit.

**Catalog & stock**
Products 🟡 · Category 🟡 · Brands ⬜ · Suppliers 🟡 · GRN (Goods Received Note) 🟡 ·
Purchasing Orders ⬜ · Damages ⬜ · Returns ⬜ · Packages ⬜.

**Sales & billing**
Sales Bills ✅ · Bills ⬜ · Quotations ⬜ · Manual Payments ⬜ · Digital Mode ⬜ ·
Gift Vouchers ⬜ · Points (loyalty) ⬜.

**Customers**
Customers ⬜ · Points ⬜ · Appointments ⬜ · SMS (service) ⬜.

**Staff / HR**
Employees ⬜ · Attendance ⬜ · Salary ⬜ · Admins (users/roles) 🟡 · Add Jobs ⬜.

**Money**
Accounts (income) ⬜ · Expenses ⬜ · Cash In ⬜ · Cash Out ⬜ · Add Currency Rate ⬜.

**Operations**
Tables ⬜ · Rooms ⬜ · Delivery Vehicles ⬜ · Play Area ⬜ · Repair/Service jobs ⬜ ·
Hire Purchase ⬜ · Rent ⬜.

**Reports & system**
Dashboard 🟡 · Reports ⬜ · Alerts/Notifications ⬜ · Settings ⬜ · Your Updates ⬜ ·
Videos (help) ⬜ · Drivers & Softwares ⬜ · Agreement (license) ⬜ · Clear Data ⬜.

---

## 5. Data-model additions (beyond the current schema)

Current schema already covers: organizations, branches, profiles, products,
barcodes, categories, suppliers, branch_stock, stock_movements, purchases(=GRN)
+ lines, registers, shifts, sales + lines, payments, audit.

New tables to add (grouped; each gets RLS + definer RPCs where it moves money/stock):

- **Catalog**: `brands`, `units`, `packages` (bundle), `product_variants`.
- **Stock**: `sale_returns(+lines)`, `damages(+lines)`, `purchase_orders(+lines)`.
- **Customers**: `customers`, `loyalty_points`(ledger), `gift_vouchers`,
  `appointments`, `sms_log`.
- **HR**: `employees`, `attendance`, `salaries`, `employee_jobs`.
- **Money**: `expenses(+categories)`, `income_accounts`, `cash_movements`
  (in/out), `currency_rates`, `manual_payments`.
- **Verticals**: `tables`, `rooms(+bookings)`, `delivery_vehicles(+deliveries)`,
  `play_sessions`, `repair_jobs(+parts/labour)`, `service_jobs`,
  `hire_purchase(+installments)`, `rentals(+returns)`.
- **System**: `settings`(kv per org/branch), `quotations(+lines)`, `bills`,
  `notifications`, `licenses`(for reselling).

---

## 6. Reselling / white-label (new requirement)

To sell to clients, the platform needs:

- **Tenant provisioning** — self-serve or admin-created org per client.
- **White-label** — per-org business name, logo, colors, receipt branding,
  optional custom domain.
- **Licensing** — plan tiers, feature flags per module/vertical, expiry, the
  in-app **Agreement** screen; a `licenses` table + enforcement.
- **Super-admin console** — manage client orgs, plans, billing, broadcast
  updates (the legacy "Your Updates"/"Videos").
- **Client onboarding** — import catalog (Excel), create branches/registers,
  add staff — packaged as a wizard + the build/use docs.

Decision needed — see the questions I'm asking alongside this plan
(multi-tenant SaaS vs per-client white-label deploys vs both).

---

## 7. Delivery roadmap (revised for the real scope)

**P0 Foundation** ✅ — multi-tenant schema, atomic sales, RLS, web POS +
inventory + sales + dashboard, Flutter offline POS, docs, tests.

**P1 Core billing parity** — upgrade the billing engine to the confirmed spec
(service charge, final discount Rs/%, customer capture, employee, wholesale
toggle, none-stock items, F-key shortcuts, change/split) + full Products CRUD
(add/edit/delete, Excel in/out, barcode/label print, brands, packages).

**P2 Commerce core** — Customers, Points/loyalty, Gift vouchers, Returns,
Damages, Quotations, GRN + Purchase Orders, Suppliers CRUD.

**P3 Money & HR** — Expenses, Accounts/income, Cash in/out, Currency rates;
Employees, Attendance, Salary, Admins/roles UI.

**P4 Reports & dashboard** — full report catalog + charts + exports.

**P5 Verticals (per priority)** — Restaurant (tables/KOT), Delivery, Repair &
Vehicle service, Rooms/hotel, Reloads, Rent, Hire purchase, Play area,
Category mode.

**P6 Reselling** — white-label branding, licensing + feature flags, super-admin
console, onboarding wizard, Agreement.

**P7 Settings, notifications, SMS, help (videos), updates.**

**P8 Hardening & launch** — CI, e2e, backups, move into Jarvis 2 as `apps/pos`,
deploy, client rollout + training materials.

**Documentation (parallel):** BUILD guide (developers) + USER guide (per module,
per vertical) + RESELLER guide (provisioning, branding, licensing) — all in
`docs/`.

---

## 8. Confirmed by the screens (previously ⚠, now resolved)

- Restaurant/table mode **yes** (Rest MOD + Tables). KOT/BOT confirmed.
- Customer credit/loyalty **yes** (Customers, Points, Customer paid/Balance).
- Discounts: per-line max + Your Rs/% **and** final Rs/% + service charge.
- Multi-branch, multi-vertical, wholesale toggle, employee-on-sale — all yes.
- Roles: **Admins** module (staff/roles). Exact permission granularity ⚠ (need
  the Admins + Settings screens).

## 9. Still worth a look (optional, to refine)

Admins/roles screen, Settings screen contents, one report layout, a receipt
print sample, and one vertical flow end-to-end (e.g. Restaurant or Rooms). Not
blocking — I can build from the standard behavior and you correct as we go.
