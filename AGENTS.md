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
- /prisma/schema.prisma — Full database schema (3030 lines, 110+ models)
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
- /app/admin/ — Admin panel routes (60+ pages: commerce, sales, marketing, marketplace, operations, system)
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

## Database Migrations
- 00001_kcc_core.sql — Core schema (users, products, orders, etc.)
- 00002_kcc_phase1_new_tables.sql — Phase 1 tables
- 00003_kcc_phase2_homepage.sql — Homepage sections
- 00004_kcc_phase3_search_ai.sql — Search + AI features
- 00005_kcc_phase4_logistics.sql — Logistics tables
- 00006_kcc_phase5_platform.sql — Platform features
- 00007_kcc_phase5b.sql — Phase 5b additions
- 00008_kcc_v4.sql — V4 migration
- 00009_kcc_v2_enterprise.sql — V2 Enterprise+ (ERP, Procurement, Suppliers, RFQ, B2B, BNPL, Vendor Financing, Affiliates, Social Commerce, Live Shopping, Auctions, Subscriptions, Digital Products, Email Marketing, AI Assistant, Chat, Multi-Language, Franchise, Reputation, Authenticity, Tax, Accounting, Insurance, Credit, Forecasting, Fraud Detection) — ~60 tables, 60+ indexes

Key V2 Enterprise+ tables: erp_accounts, journal_entries, cost_centers, budgets, procurement_suppliers, supplier_products, purchase_orders, po_items, rfqs, rfq_responses, b2b_companies, b2b_users, b2b_price_tiers, b2b_quotes, b2b_invoices, bnpl_plans, bnpl_credit_scores, bnpl_contracts, bnpl_payments, vendor_financing_applications, vendor_financing_repayments, affiliate_groups, affiliate_commissions, affiliate_payouts, social_creators, social_content, social_content_products, live_streams, live_stream_products, auctions, auction_bids, auction_watchlists, subscription_plans, customer_subscriptions, subscription_orders, digital_products, license_keys, email_templates, email_campaigns, email_campaign_logs, email_lists, email_subscribers, crm_tickets, crm_messages, crm_pipelines, crm_deals, crm_tasks, ai_conversations, demand_forecasts, fraud_checks, conversations, conversation_participants, messages, languages, translation_keys, translations, pos_terminals, pos_sessions, franchise_agents, franchise_mini_stores, product_geo_visibility, vendor_reputation_scores, product_authenticity_codes, accounting_invoices, accounting_invoice_items, general_ledger, insurance_policies, insurance_claims, credit_applications, credit_lines

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
- [x] V2 Enterprise+ (Sections 86-116): Complete
- [x] V3 Local Supplier Portal (Part 11): Complete
- [x] V3 Sourcing Module (Part 12): Complete
- [x] V3 POD System (Part 18): Complete
- [x] V3 Unique Features (Part 19): Complete
- [x] V3 Vendor Dropshipping (Part 29): Complete
- [x] V3 Art Marketplace (Part 30): Complete
- [x] Navigation integration (header, footer, homepage, dashboards): Complete
- [x] Admin pages for POD, Art Marketplace, Group Buy: Complete

## Recent Enhancements (July 2026)
- **V3 Database**: 40+ new Prisma models (local suppliers, sourcing, POD, dropshipping, art/NFT, group buy, price alerts, live commerce, mentorship, carbon offsets, competition intel, Kauvex Originals, subscription boxes)
- **Local Supplier Portal** (`/supplier/`): Registration, login, dashboard, products, orders, earnings, coverage management
- **Product Sourcing Module**: Admin sourcing dashboard, product research pipeline, customer product requests (`/request-product/`), AI sourcing agent foundation, landed cost calculator
- **Print on Demand (POD) System** (`/vendor/pod/`): Design studio with Fabric.js canvas (text/image/AI tools), POD products management, orders, analytics dashboard
- **POD Design Marketplace** (`/pod-marketplace/`): Browse & license designs from creators, apply to POD products
- **Vendor Dropshipping Marketplace** (`/vendor/dropshipping/`): Multi-source product import (CJ, AliExpress, eBay, Etsy), per-vendor OAuth for eBay/Etsy, shared catalog integration
- **Live Commerce** (`/live/`): Active live streams grid, upcoming streams, one-tap purchase
- **Group Buy** (`/group-buy/`): Social shopping deals, invite friends, unlock lower prices
- **Concierge Shopping Assistant** (`/concierge/`): AI-powered personal shopping assistant chat
- **Digital Art Marketplace** (`/art-marketplace/`): Buy/sell digital art & illustrations, commercial licenses, instant download
- **Kauvex Originals tracker**: Admin product sourcing pipeline for private label
- **Vendor Mentorship marketplace**: Peer-to-peer paid mentorship sessions
- **Carbon footprint tracker**: Per-order CO2 estimates with tree planting offsets
- **Price history & deal alerts**: 90-day price charts, target price notifications
- **Supabase Cron Jobs**: `supabase/migrations/00010_kcc_v3_cron_jobs.sql` — 5 automated functions for supplier escalation, price alerts, group buy expiry, price history recording, daily cleanup

## Navigation & UI Links
- **Footer**: All V3 features linked under "Explore" section
- **Mega Menu**: "Explore" category added with links to Live, Group Buy, POD, Art, Concierge, Request Product
- **Homepage**: "Explore Kauvex" feature card section showing all V3 features
- **Admin Sidebar**: POD, Art Marketplace, Group Buy, Sourcing under "Sourcing & Products" in Marketplace section
- **Vendor Sidebar**: POD section (Dashboard, Design Studio, Products, Orders, Design Marketplace) and Dropshipping section under Products
- **Admin Pages**: `/admin/pod`, `/admin/art-marketplace`, `/admin/group-buy` created with management tables

## Database Migration Instructions
1. Apply SQL migration: `cd supabase && supabase migration up`
2. Generate Prisma client: `npx prisma generate`
3. Seed roles: POST to `/api/setup/seed-roles` with Bearer token matching SEED_SECRET env var
4. V2 Enterprise+ (migration 00009) must be applied manually via Supabase Dashboard SQL Editor — copy contents of `supabase/migrations/00009_kcc_v2_enterprise.sql` and paste into project `stbgamqenraauqpgtbkv`
