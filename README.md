# GRABBER POS Studio

**By Grabber Mobility Solutions (Pvt) Ltd**

A modern, multi-tenant point-of-sale platform — a complete rebuild of the legacy
"Easy POS" system (hosted PHP + Electron shell) on a durable, scalable stack.

The solution has three parts that share one backend:

| Part | Path | Stack | Role |
|------|------|-------|------|
| **Web app** | [`grabber-pos/`](grabber-pos/) | Next.js 16, React 19, TypeScript, Tailwind v4, Framer Motion | Back-office + desktop POS terminal |
| **Mobile app** | [`grabber-pos-mobile/`](grabber-pos-mobile/) | Flutter 3, Riverpod, Supabase | Handheld/tablet POS, offline-first |
| **Backend** | [`grabber-pos/supabase/`](grabber-pos/supabase/) | Supabase (Postgres, Auth, Storage, RLS) | Single source of truth for both apps |

```
                 ┌──────────────────────────┐
   Web (Next.js) │                          │  Flutter (Android/iOS)
   ───────────►  │        Supabase          │  ◄───────────
   RLS + RPC     │  Postgres · Auth · RLS   │  RLS + RPC + offline queue
                 │  create_sale() (atomic)  │
                 └──────────────────────────┘
```

## Why this stack

- **Supabase / Postgres** — one durable system-of-record for every terminal and
  device, with row-level security for true multi-tenant (organization → branch)
  isolation. Matches the conventions already used in the Grabber AI Studio
  monorepo (`D:\Jarvis 2`), so this can drop in as `apps/pos`.
- **Atomic sales** — every sale posts through a single Postgres function
  (`create_sale`) that validates prices/discounts, checks stock, decrements
  inventory and writes an audit movement in one transaction. Prices are never
  trusted from the client.
- **Offline-first mobile** — the Flutter POS keeps billing when the network
  drops, queuing sales locally and syncing them idempotently when back online.
- **Framer Motion** — polished, intentional motion throughout the web UI.
- **Zero-config demo** — with no Supabase env set, the web app runs on a bundled
  JSON store seeded from real catalog data (2,509 products, 87 categories).

## Quick start

```bash
# Web (demo mode — no backend needed)
cd grabber-pos && npm install && npm run dev      # http://localhost:3000

# Mobile (needs a Supabase project)
cd grabber-pos-mobile && flutter pub get
flutter run --dart-define=SUPABASE_URL=... --dart-define=SUPABASE_ANON_KEY=...
```

## Documentation

- [**Feature & Build Plan**](grabber-pos/docs/FEATURE-PLAN.md) — every module, tile,
  setting, and CRUD screen to reach full legacy parity (visual version:
  `grabber-pos/docs/build-plan.html`)
- [Architecture](grabber-pos/docs/ARCHITECTURE.md) — how the pieces fit
- [Setup](grabber-pos/docs/SETUP.md) — provisioning Supabase + running both apps
- [Data model](grabber-pos/docs/DATA-MODEL.md) — schema, RLS, and RPCs
- [Deployment](grabber-pos/docs/DEPLOYMENT.md) — production checklist
- [**User Guide**](grabber-pos/docs/USER-GUIDE.md) — how to use the app (cashiers/owners)
- [**Reseller Guide**](grabber-pos/docs/RESELLER-GUIDE.md) — provisioning clients, white-label, licensing
- [Web app README](grabber-pos/README.md)
- [Mobile app README](grabber-pos-mobile/README.md)

## Status

- Web app: builds clean, sale flow verified end-to-end, 7 unit tests passing.
- Mobile app: analyzes clean, 4 unit tests passing.
- Backend: four SQL migrations + seed script (apply to a Supabase project to go
  from demo to durable).

## Legacy migration

The old system stored catalog data in Excel/CSV exports (grocery, pharmacy,
bookshop, hardware). The normalized grocery dataset is already seeded; the seed
script (`grabber-pos/scripts/seed.mjs`) loads it into Supabase. Remaining legacy
modules (suppliers, purchase orders, reports, user management) are modeled in the
schema and awaiting the original PHP business rules to port their exact behavior.
