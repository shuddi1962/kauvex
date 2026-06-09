---
description: Instructions building apps with MCP
globs: *
alwaysApply: true
---

# KAUVEX GLOBAL MARKETPLACE

## Project Identity
- Platform: Next.js 14 + TypeScript + Tailwind CSS
- Brand: KAUVEX — "Everything. Everywhere. Delivered."
- Primary: #0A1628 (navy) | Accent: #FF6B00 (orange)
- Font: Inter

## Architecture
- Frontend: Next.js 14 App Router (src/ directory)
- Backend: Supabase (PostgreSQL)
- Auth: Supabase Auth
- Storage: Supabase Storage
- Realtime: Supabase Realtime
- Hosting: Vercel (frontend)

## Multi-Storefront
- Storefronts configured in admin panel
- Domain type: subdomain OR custom domain (admin choice)
- Storefront context set by middleware on each request
- Default storefront: kauvex.com

## Dropshipping
- Provider: CJDropshipping (planned)
- API credentials: stored in API key vault
- New DB tables prefix: cj_

## Build Status
- [x] Part 1: Rebrand complete (Roshanal → KAUVEX)
- [x] Part 2: Categories replaced (10 general categories, 60+ subcategories)
- [x] Part 3: Homepage redesigned (8 new components)
- [x] Part 4: Product page redesigned (image gallery, variants, shipping, reviews, Q&A, related products)
- [x] Part 5: CJDropshipping integrated (API client + admin dashboard, schema ready)
- [x] Part 6: Multi-storefront built (context provider, 6 seed storefronts, admin pages, domain detection)
- [x] Part 7: Vendor system enhanced (multi-step registration, public storefront, tier badges)
- [x] Part 8: Buyer protection built (customer dispute flow + admin dispute centre, schema ready)
- [x] Part 9: Search upgraded (dedicated /search route, autocomplete, advanced filters)
- [x] Part 10: Currency engine updated (Price.tsx component, storefront-aware conversion)
- [x] Part 11: Admin panel updated (all sections present: Marketplace, Analytics, Marketing)
- [x] Part 12: SEO updated (layout, OG tags, Twitter card, JSON-LD structured data)
- [x] Part 13: Affiliate updated (rebranded page, commission table, schema)

## Supabase
- Project URL: https://xkhvojjogoeuvrifekwr.supabase.co
- Client files: /src/lib/supabase/client.ts (browser)
                /src/lib/supabase/server.ts (server)
                /src/lib/supabase/admin.ts (admin ops)
                /src/lib/supabase/middleware.ts (session)
- Schema: supabase/migrations/00001_initial_schema.sql
- Tables: profiles, categories, subcategories, brands, products, product_inventory, vendors, orders, order_items, reviews, storefronts, cj_products, disputes, exchange_rates, storefront_banners, affiliate_links

## Future AWS Migration Note
When ready to migrate from Supabase to AWS:
- Supabase PostgreSQL → AWS RDS PostgreSQL (same SQL dialect)
- Supabase Storage → AWS S3 (update bucket URLs and SDK calls)
- Supabase Auth → AWS Cognito or NextAuth with RDS
- Frontend stays on Vercel OR moves to AWS Amplify

## Important Notes
- Tailwind CSS 3.4 (do not upgrade to v4)
- All product prices stored in USD internally
- Display prices use storefront currency
- localStorage keys use "kauvex-" prefix
