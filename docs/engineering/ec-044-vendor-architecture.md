# EC-044 — Vendor Architecture

> **Status:** Active
> **Phase:** F — Marketplace & Business OS
> **Canonical code:** `src/app/vendor/**`, `src/lib/vendor-metrics.ts`, `src/lib/permissions.ts`, `src/lib/domains/`
> **Overrides:** nothing

## Purpose

Defines the vendor tenant: lifecycle, plan tiers, permissions, health scoring, and the surfaces every seller uses. Vendors are the supply side of the marketplace — their UX determines marketplace quality.

## Current Truth (in this repo today)

- **Lifecycle:** registration → approval → onboarding → active → (account-health gates). Storefront builder at `/vendor/store-builder` (plan-gated features).
- **Plan tiers:** store-builder features gated by vendor plan; vendor domain settings `/vendor/settings/domain` (subdomain + custom domain, Phase 22).
- **Catalog & inventory:** products (add, bulk CSV, tabbed editor `/vendor/products/[id]/edit`, offers `/vendor/products/[id]/offer`, approval requests), inventory `/vendor/inventory` (FBK + merchant) + replenishment alerts; FBK enrollment `/vendor/fbk` + packaging config.
- **Orders & fulfilment:** `/vendor/orders` (returns/claims/RMA), reports `/vendor/orders/reports`, shipping profiles `/vendor/shipping/profiles`, drop-off manifests `/vendor/shipping/dropoff`, logistics `/vendor/logistics`.
- **Growth tools:** advertising campaign manager `/vendor/advertising` (6-step wizard), B2B Central `/vendor/b2b`, brand registry `/vendor/brand-registry`, A+ content `/vendor/a-plus-content`, channels hub `/vendor/channels` (eBay/Etsy sync), University `/vendor/university`, POD `/vendor/pod`, dropshipping `/vendor/dropshipping`.
- **Trust & compliance:** account health `/vendor/account-health` (ODR, cancellation, late shipment — `src/lib/vendor-metrics.ts` health scoring with deactivation warnings), permissions grid `/vendor/settings/permissions` (granular staff can_view/create/edit/delete per resource) + audit history, API access `/vendor/settings/api-access` (keys + third-party apps), wallet `/vendor/wallet` (earnings, withdrawal).
- **RBAC:** staff roles via permissions.ts + seeded roles (EC-013); vendor guard `requireVendor` in `src/lib/api-helpers.ts`.

## Rules

1. Every vendor-owned row carries `vendor_id`; all vendor queries filter on it (EC-014).
2. Staff permissions are granular and server-side enforced; permission changes are audit-logged (`/vendor/settings/permissions/history`).
3. Health score (ODR, cancellations, late shipments) gates: search rank, buybox weight, and ultimately account standing — computed by `src/lib/vendor-metrics.ts`, never client-side.
4. Plan-gated features check entitlement server-side (store-builder, advanced reporting).
5. Account deactivation warnings are automatic per health thresholds and reversible on improvement.
6. API keys for third-party apps are scoped + rotatable (`/vendor/settings/api-access`); key material server-side only.
7. Vendor data (products, orders, earnings) is never visible to other vendors; admin sees all with audit context.

## Evolution Targets

> **Evolution target — NOT in the repo today.**
- Vendor app store (third-party integrations beyond the channels hub).
- Subscription products for vendors (recurring billing rails).
- Vendor marketplace feedback threads (public responses to reviews).

## Checklist (Definition of Done for this area)

- [ ] vendor_id scoping on all vendor tables/queries
- [ ] Server-side permission checks
- [ ] Health score integrated where it matters (rank/buybox)
- [ ] Plan gating server-side
- [ ] API keys scoped + rotatable
