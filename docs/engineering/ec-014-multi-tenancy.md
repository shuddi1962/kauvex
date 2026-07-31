# EC-014 — Multi-tenancy

> **Status:** Active
> **Phase:** B — Platform Architecture
> **Canonical code:** `src/middleware.ts`, `src/lib/middleware/helpers.ts`, `src/lib/storefront-resolver.ts`, `src/lib/storefront-context.tsx`, `src/lib/domains/`
> **Overrides:** nothing

## Purpose

KCC is a multi-tenant platform with several independent tenant axes — storefronts (customer-facing), vendors (sellers), organizations (Business OS), businesses (KAI), and portals (admin/logistics/manufacturers/pro). This document defines how each tenant is resolved, scoped, and isolated.

## Current Truth (in this repo today)

- **Storefronts:** default kauvex.com (USD) + path storefronts /uk, /ca, /au, /ng. Country TLDs (15 total, e.g. kauvex.co.uk, kauvex.ng) and vendor subdomains/custom domains resolve via `src/middleware.ts` + `src/lib/middleware/helpers.ts` (`getStorefrontByPath`, `getVendorBySubdomain`, `getVendorByCustomDomain`). Storefront context flows via `x-storefront-*` headers → `src/lib/storefront-context.tsx`.
- **Domain provisioning:** `src/lib/domains/` — `country-domains.ts` (15 country TLDs), `provisioning.ts` (Vercel + Cloudflare API), `vendor-subdomain.ts`, `vendor-custom-domain.ts`, `remove-domain.ts`, `whitelabel-domain.ts`. Tables `kv_dom_domains`, `kv_dom_subdomain_checks`, `kv_dom_ssl_checks`, `kv_dom_dns_events`. Admin: `/admin/domains`; vendor: `/vendor/settings/domain`.
- **Vendors:** seller accounts with `vendor_id` scoping on product/order/inventory rows; plan tiers gate store-builder features.
- **Organizations (Business OS):** `Bos*` models are `org_id`-scoped (34 models: BosOrganization, BosOrgMember, BosSalesOrder, BosItem, BosInvoice, BosCustomer, BosTask, BosLead, BosDeal, BosProductionOrder, ...). Org members via BosOrgMember.
- **KAI businesses:** `kv_kai_businesses` keyed by `user_id` (one per user); knowledge chunks scoped by nullable `business_id` (NULL = platform-global knowledge); `kv_kai_business_questions` scoped per business. Phase 33 added business-scoped embedding search (`kv_kai_search_business_embeddings`).
- **Warehouses/logistics:** FBK + merchant fulfillment, multi-warehouse with staff portal `/warehouse/`; logistics partners per country (EC-019/Phase 19 rules).

## Rules

1. Every tenant row carries its tenant key column (`vendor_id`, `org_id`, `business_id`, `warehouse_id` as applicable) and queries always filter on it — never fetch across tenants.
2. Tenant isolation is enforced server-side in engines AND via RLS policies where the table family has them. Never rely on UI hiding.
3. Storefront resolution happens in middleware (headers), never re-derived per-API-call from the URL.
4. Knowledge/embeddings: business-scoped search must filter `business_id = X`; NULL `business_id` chunks are platform-global and are only editable by admins.
5. Country storefronts own their currency/language/tax config (EC-019 launch-country rules); vendor offers are per-storefront (`/vendor/products/[id]/offer`).
6. Country TLD domains are kept active even if a vendor cancels; vendor subdomains/custom domains are removed on cancellation (Phase 22 rules).
7. New portal types (new tenant axis) must define their scoping column, RLS policy, and route group before code is written.

## Evolution Targets

> **Evolution target — NOT in the repo today.**
- Per-tenant database schema isolation (currently shared-schema multi-tenancy — correct choice at this stage).
- Cross-tenant analytics views (admin-only materialized views).
- Enterprise SSO per tenant.

## Checklist (Definition of Done for this area)

- [ ] Tenant key column on every tenant table
- [ ] All queries filter by tenant key
- [ ] RLS policy for the table family
- [ ] Storefront headers set in middleware
- [ ] No cross-tenant data paths
