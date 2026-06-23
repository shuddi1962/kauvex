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
- /lib/shipping/ — Carrier integrations (dhl, fedex, aramex, local, gig, kwik, dhl-express-international, fedex-international, aramex-international, freight-forwarder)
- /lib/logistics/ — Logistics engine (dispatch.ts, shipping-engine.ts, partner-tiers.ts, delivery-tiers.ts, fbk-debt.ts, terminology.ts)
- /components/logistics/ShipmentTimeline.tsx — Unified cross-tier tracking display
- /app/express/ — Kauvex Express public courier (landing, book, track, business)
- /app/logistics/ — Partner portal (register, login, dashboard)
- /app/admin/logistics/ — Full admin control panel (rates, payouts, packaging, map, insurance, gaps, fbk, express)
- /app/admin/shipping/ — Admin shipping management (zones, surge-pricing, restrictions, hs-codes, business-accounts)
- /app/vendor/shipping/profiles/ — Profile builder for vendor shipping rules
- /app/vendor/shipping/dropoff/ — Drop-off manifest system
- /app/api/v1/express/ — Express API routes (waybills, pricing, tracking)
- /app/api/v1/logistics/ — Logistics API routes (tracking, partners, jobs, payouts)
- /app/api/v1/shipping/insurance/ — Insurance reserve API
- /app/api/v1/shipping/packaging/ — Packaging elements API
- /app/api/v1/shipping/customs/ — Customs document generation API
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
- /app/vendor/inventory/ — Full inventory management (FBK + merchant)
- /app/vendor/inventory/replenishment-alerts/ — Reorder threshold alerts
- /app/vendor/products/add/ — Catalog matching entry point
- /app/vendor/products/bulk-upload/ — CSV bulk product upload
- /app/vendor/products/approval-request/ — Gated category approval requests
- /app/vendor/products/[id]/edit/ — Tabbed listing editor
- /app/vendor/products/[id]/offer/ — Multi-storefront offer management
- /app/vendor/orders/reports/ — Order reports & exports
- /app/vendor/advertising/campaigns/new/ — Campaign creation wizard
- /app/vendor/advertising/campaigns/[id]/ — Campaign performance detail
- /app/vendor/settings/permissions/ — Granular user permission grid
- /app/vendor/settings/permissions/history/ — Permission change audit log
- /app/vendor/settings/api-access/ — API key & third-party app management
- /app/vendor/university/ — Kauvex Seller University
- /app/vendor/b2b/ — B2B Central (wholesale, quotes, volume tiers)
- /app/vendor/brand-registry/ — Brand Registry enrollment & counterfeit reporting
- /app/vendor/a-plus-content/ — A+ Content module-based page builder
- /app/vendor/account-health/ — Account health dashboard & notifications
- /app/vendor/channels/ — Multi-Channel Integration Hub (eBay/Etsy sync)
- /app/vendor/reports/ — Reports Repository & custom report builder
- /app/admin/catalog/restricted-categories/ — Category/brand gating management
- /app/admin/catalog/approval-requests/ — Vendor approval queue
- /app/admin/university/ — University lesson content management
- /app/admin/brand-registry/ — Brand application review & approval

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
- [x] Phase 11 (Seller Central Full): Complete
- [x] Phase 14 (Complete Shipping & Logistics): Complete

## Recent Enhancements (August 2026)
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
- **NFT Marketplace** (`/nft-marketplace/`): Buy, sell & collect NFTs on Ethereum & Polygon with wallet support
- **Kauvex Originals tracker**: Admin product sourcing pipeline for private label
- **Vendor Mentorship marketplace**: Peer-to-peer paid mentorship sessions
- **Carbon footprint tracker**: Per-order CO2 estimates with tree planting offsets
- **NFT Marketplace**: Full blockchain-ready NFT support with Prisma models, API routes, lib functions, and admin/frontend pages
- **Price history & deal alerts**: 90-day price charts, target price notifications
- **Supabase Cron Jobs**: `supabase/migrations/00010_kcc_v3_cron_jobs.sql` — 5 automated functions for supplier escalation, price alerts, group buy expiry, price history recording, daily cleanup
- **Seller Central (Phase 11)**: `supabase/migrations/00011_kcc_seller_central.sql` — 9 new tables for restricted categories, approval requests, university lessons/progress, business customers, B2B volume tiers, brand registry, authorized sellers, counterfeit reports, A+ content, and multi-channel product sync

- **Phase 11 (Seller Central Full Replication)**: Amazon-style vendor dashboard with enhanced widgets, catalog matching with gated categories, multi-storefront offer management, bulk CSV upload, tabbed listing editor (8 tabs), full inventory management with FBK tools, orders with returns/claims/RMA, full Campaign Manager with 6-step wizard, granular user permissions matrix, Kauvex Seller University, B2B Central (quotes/volume tiers), Reports Repository (custom reports builder), Brand Registry (enrollment/counterfeit reporting), A+ Content module builder, Account Health dashboard with deactivation warnings, and Multi-Channel Integration Hub (eBay/Etsy product sync)

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

## Phase 14 Shipping & Logistics Knowledge Base

**Terminology Reference:**
  Marketplace orders → Shipping Label
  Kauvex Express courier → Waybill
  Intercity road freight → Consignment Note
  International air freight → Air Waybill (AWB)
  International sea freight → Bill of Lading (BOL)
  Multi-item shipments → Packing List
  International commercial sales → Commercial Invoice
  Below $300 customs → CN22
  Above $300 customs → CN23

**Carriers available:**
  Domestic: dhl, fedex, aramex, local, gig, kwik
  International: dhl-international, fedex-international, aramex-international
  Aggregator: freight-forwarder (routes not covered by single carrier)

**Tier routing (determineTier):**
  TIER_1_LOCAL → independent partners (riders/drivers) + GIG/Kwik
  TIER_2_DOMESTIC_FREIGHT → freight partners + domestic carrier fallback
  TIER_3_INTERNATIONAL → carrier APIs ONLY (never independent partners)

**FBK Fee Triggers:**
  Inbound handling → on warehouse receipt confirmation
  Storage fee → monthly per unsold unit (from vendor wallet)
  Pick & pack → deducted from sale earnings
  Sales commission → deducted from sale earnings
  Removal fee → on vendor stock removal request
  Long-term surcharge → after 180 days unsold
  Debt interest → after 30 days outstanding (2% monthly)

**Key API Endpoints:**
  POST /api/v1/express/waybills — Create express waybill
  POST /api/v1/express/pricing — Get instant pricing quote
  GET /api/v1/express/tracking?waybillNumber= — Track express shipment
  GET /api/v1/logistics/tracking?shipmentId= — Get tracking timeline
  GET /api/v1/logistics/partners — List/filter logistics partners
  GET/POST/PATCH /api/v1/logistics/jobs — Manage delivery jobs
  GET/POST/PATCH /api/v1/logistics/payouts — Manage partner payouts
  GET/POST/PATCH /api/v1/shipping/insurance — Insurance reserve management
  GET/POST /api/v1/shipping/packaging — Packaging elements & add-ons
  POST /api/v1/shipping/customs — Generate customs documents
  POST /api/v1/shipping/rates — Get shipping rates
  POST /api/v1/shipping/labels — Create shipping label
  POST /api/v1/shipping/auto-route — Auto-route shipment

**Asset Ownership Milestones:**
  Launch: zero vehicles — asset light, pure technology
  500+ orders/day: 2-3 branded vans per major city (warehouse only)
  2,000+ orders/day: own trucks on Lagos-Abuja + Lagos-PHC routes
  3+ countries: lease airline cargo space
  Dominant Nigerian market: lease first cargo aircraft
  Pan-African: port terminal + vessel strategy
