---
description: Instructions building apps with MCP
globs: *
alwaysApply: true
---

# KAUVEX COMMERCE CLOUD (KCC)
# Version: 2.0

## Platform
- Name: KAUVEX — "Everything. Everywhere. Delivered."
- Framework: Next.js 14 App Router + TypeScript
- Styling: Tailwind CSS + shadcn/ui
- ORM: Prisma
- Database: PostgreSQL (Supabase)
- Auth: Supabase Auth
- Storage: Supabase Storage
- Hosting: Vercel
- Colors: Navy #0A1628 | Orange #FF6B00
- Font: Inter

## Architecture
- Multi-storefront: path | subdomain | custom domain
- Multi-vendor: unlimited vendors with plan tiers
- Multi-warehouse: FBK + merchant fulfilled
- Centralized: one DB, one admin, one vendor login

## Key Directories
- /prisma/schema.prisma — Full database schema (150+ models)
- /prisma/seeds/roles.ts — RBAC seed script
- /lib/permissions.ts — RBAC permission system
- /lib/storefront-context.tsx — Storefront context provider
- /lib/storefront-resolver.ts — Server-side storefront resolution
- /lib/buybox.ts — Buy box engine with weighted scoring
- /lib/search-engine.ts — Client search utilities
- /lib/security.ts — Rate limiting, 2FA, audit logging, validation
- /lib/ai/ — AI feature modules (descriptions, SEO, recommendations)
- /lib/shipping/ — Carrier integrations
- /lib/cart-recovery.ts — Abandoned cart recovery engine
- /lib/bundles.ts — Product bundle management
- /lib/catalog-mode.ts — Catalog mode for B2B storefronts
- /lib/vendor-metrics.ts — Vendor health scoring
- /lib/api-helpers.ts — REST API response utilities
- /lib/validators/ — Zod validation schemas
- /components/home/ — Homepage section components (8 sections)
- /components/search/ — Voice search + barcode scanner
- /app/admin/ — Admin panel routes (warehouses, FBK, ads, mobile, audit log)
- /app/admin/analytics/ — Analytics dashboards (realtime, search, BI)
- /app/vendor/ — Vendor panel routes
- /app/vendor/store-builder/ — Store builder with plan-gated features
- /app/vendor/fbk/ — FBK enrollment and management
- /app/vendor/advertising/ — Ad campaign manager
- /app/api/v1/ — REST API v1 (17 route groups)

## Default Storefronts
1. kauvex.com — Global USD (DEFAULT)
2. kauvex.com/uk — UK GBP
3. kauvex.com/ca — Canada CAD
4. kauvex.com/au — Australia AUD
5. kauvex.com/ng — Nigeria NGN

## New Database Tables (via Supabase migration)
All new tables are defined in supabase/migrations/00002_kcc_phase1_new_tables.sql.
Run `supabase migration up` to apply.

Key tables: vendor_stores, warehouses, warehouse_inventory, shipments, shipping_carriers,
ad_campaigns, ad_metrics, shared_catalog_products, vendor_offers, buy_box_winners,
roles, permissions, api_keys, webhooks, analytics_events, daily_metrics, homepage_sections,
loyalty_programs, white_label_clients, vendor_plans, vendor_payouts, abandoned_carts,
product_bundles, gift_certificates, call_requests, consent_logs, audit_logs

## CS-Cart Addon Equivalents (Native Builds)
- Live Search: PostgreSQL full-text search + autocomplete
- Abandoned Cart Recovery: 3-stage email sequence
- Product Bundles: Discounted multi-product bundles
- Catalog Mode: View-only storefronts for B2B
- Back-in-Stock Notifications: Email alerts on restock
- Product Comparison: Side-by-side (max 4)
- Gift Certificates: Digital gift codes
- Call Requests: Customer callback system
- Vendor Payouts: Batch payout processing
- Google Merchant Feed: XML export
- Digital Downloads: Expiring download links
- Seller Performance: Account health scoring (ODR, cancellation, late shipment)
- Reward Points: Loyalty program with tiers
- Product Video: Gallery video support
- Age Verification: Modal for restricted products
- Vendor Staff Management: Role-based staff access
- API Keys: Full REST API with key auth
- Webhooks: Event-driven integrations

## Build Status
- [x] Phase 0 (Pre-flight): Complete
- [x] Phase 1 (MVP Core): Complete
- [x] Phase 2 (Homepage+): Complete
- [x] Phase 3 (Search+AI): Complete
- [x] Phase 4 (Logistics): Complete
- [x] Phase 5 (Platform): Complete

## Database Migration Instructions
1. Apply SQL migration: `cd supabase && supabase migration up`
2. Generate Prisma client: `npx prisma generate`
3. Seed roles: POST to `/api/setup/seed-roles` with Bearer token matching SEED_SECRET env var
