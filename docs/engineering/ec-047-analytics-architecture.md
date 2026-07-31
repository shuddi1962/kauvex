# EC-047 — Analytics Architecture

> **Status:** Active
> **Phase:** F — Marketplace & Business OS
> **Canonical code:** `src/app/admin/analytics/**`, `src/app/vendor/reports/**`, `src/lib/vendor-metrics.ts`, `src/lib/affiliates/`, `src/app/admin/kai/business-intelligence/`
> **Overrides:** EC-008 on aggregation rules

## Purpose

Defines how KCC measures itself: dashboards, reports, and the rules for aggregation — server-side SQL aggregates over Prisma, never client-side sums of unbounded lists.

## Current Truth (in this repo today)

- **Admin analytics:** `src/app/admin/analytics/` — realtime, search, BI dashboards (Recharts v3 charts).
- **Vendor analytics:** Reports Repository + custom report builder `/vendor/reports`; order reports/exports `/vendor/orders/reports`; account health `src/lib/vendor-metrics.ts` (ODR, cancellation, late shipment scores); ad campaign performance `/vendor/advertising/campaigns/[id]`.
- **Partner/affiliate analytics:** `src/lib/affiliates/` (clicks, conversions, commissions); payout charts in `src/components/partners/`.
- **Manufacturer analytics:** stats API `/api/v1/manufacturers/stats`; dashboard analytics tab.
- **Fuel/cost analytics:** `/admin/fuel/cost-analysis`, fuel history.
- **KAI analytics:** `/admin/kai/business-intelligence` (questions per business, modes, latency) + KAI console dashboard.
- **Demand forecasting:** demand_forecasts table exists in V2 migration (erp-era) — verify current usage before building on it.
- **Charts:** Recharts (v3) is the approved chart library (EC-002).

## Rules

1. Aggregates run in SQL via Prisma `aggregate`/`groupBy` — never fetch-all-then-reduce in the server or client (EC-008 Rule 7).
2. Dashboard queries are bounded: date ranges, limits, and pagination on list views.
3. Time series (7-day, 30-day, YTD) are computed server-side with consistent date logic (UTC storage, display in storefront/local tz).
4. Money in analytics is Decimal; totals formatted with currency per storefront (EC-011).
5. Charts use Recharts and existing card/stat components — no new chart libraries without EC-002 approval.
6. Tenant scoping in analytics: vendors see own data, partners own, admin sees all (EC-013/EC-014).
7. Heavy BI (large joins, rollups) is an evolution target — never build slow ad-hoc SQL into dashboard routes.

## Evolution Targets

> **Evolution target — NOT in the repo today.**
- Materialized views / rollup tables for large-scale BI.
- Scheduled report emails (digest via EC-017).
- CSV/Excel export service with async job status (current exports are synchronous).
- External BI tool export (Metabase/Superset) or warehouse sync.

## Checklist (Definition of Done for this area)

- [ ] Aggregates via Prisma groupBy/aggregate
- [ ] Queries bounded (dates/limits)
- [ ] Decimal money formatting
- [ ] Recharts only
- [ ] Tenant-scoped visibility
