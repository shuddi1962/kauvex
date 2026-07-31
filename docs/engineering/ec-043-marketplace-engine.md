# EC-043 — Marketplace Engine

> **Status:** Active
> **Phase:** F — Marketplace & Business OS
> **Canonical code:** `src/lib/buybox.ts`, `src/lib/search-engine.ts`, `src/lib/bundles.ts`, `src/lib/catalog-mode.ts`, `src/lib/cart-recovery.ts`, `src/lib/storefront-resolver.ts`
> **Overrides:** nothing

## Purpose

Defines the core commerce engine: catalog, offers per storefront, buybox selection, cart, and the selling rules that keep multi-vendor commerce fair and consistent.

## Current Truth (in this repo today)

- **Catalog:** products + variants + per-storefront offers (`/vendor/products/[id]/offer`); vendor products added via catalog-matching entry (`/vendor/products/add`), bulk CSV (`/vendor/products/bulk-upload`), gated categories (`/admin/catalog/restricted-categories`, approval queue `/admin/catalog/approval-requests`).
- **Buybox:** weighted scoring engine `src/lib/buybox.ts` — winner per product/storefront computed server-side (price, fulfillment, health score inputs).
- **Pricing:** Decimal per storefront/currency; country storefronts (kauvex.com USD default; /uk /ca /au /ng; 15 country TLDs).
- **Search:** PostgreSQL FTS + `src/lib/search-engine.ts` (EC-018); voice search + barcode scanner in `src/components/search/`.
- **Cart & conversion:** cart recovery engine `src/lib/cart-recovery.ts` (3-stage email sequence); bundles `src/lib/bundles.ts`; catalog mode `src/lib/catalog-mode.ts` (view-only B2B storefronts); gift certificates, back-in-stock notifications, product comparison (CS-Cart-equivalent native builds).
- **Extra markets:** POD (`/vendor/pod`, `/pod-marketplace`), art marketplace (`/art-marketplace`), NFT marketplace (`/nft-marketplace`), group buy (`/group-buy`), live commerce (`/live`), used equipment/rentals/auctions/procurement (`/marketplace/*`).
- **Selling rules:** buybox winner = the offer served; warehouse tiers FBK + merchant; shipping labels via `src/lib/shipping/` + `src/lib/logistics/`.

## Rules

1. Buybox winner is computed server-side per request — never client-side or cached across changing inputs (EC-008/EC-020).
2. Prices are Decimal(10,2) per storefront/currency; conversion happens at checkout with recorded rates, not floating point.
3. Gated categories: listing requires approval (`kv_restricted_*` tables) — enforcement is server-side, not UI.
4. Offers are per storefront; a product without a valid offer for the current storefront never appears in results (EC-014).
5. Inventory checks happen at cart-add and checkout (FBK + merchant); overselling is prevented by atomic stock decrement.
6. Promotions (bundles, group buy, coupons, affiliate links) compose server-side with a defined precedence; no double-dipping without explicit rules.
7. Marketplace variants (art, NFT, used equipment, rentals, auctions) reuse the core order/payment rails — never fork the checkout.

## Evolution Targets

> **Evolution target — NOT in the repo today.**
- Dynamic pricing/A/B price experiments.
- Real-time inventory sync APIs for external channels beyond the Multi-Channel Hub (`/vendor/channels`).
- Marketplace-wide promo engine with admin campaign rules.

## Checklist (Definition of Done for this area)

- [ ] Buybox computed server-side
- [ ] Decimal pricing + storefront scoping
- [ ] Server-side gating enforcement
- [ ] Atomic inventory decrement
- [ ] Promo precedence defined
