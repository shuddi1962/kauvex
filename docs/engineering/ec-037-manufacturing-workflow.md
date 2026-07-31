# EC-037 — Manufacturing Workflow

> **Status:** Active
> **Phase:** E — Manufacturing Engine
> **Canonical code:** src/lib/manufacturers/ (registration.ts, verification.ts, categories.ts, inquiries.ts, production.ts, escrow.ts, disputes.ts, samples.ts, hubs.ts, originals.ts), src/app/manufacturers/, src/app/admin/manufacturers/, src/app/api/v1/manufacturers/, src/app/api/v1/admin/manufacturers/, prisma/schema.prisma (Mfg* models, lines 6298–6582), supabase/migrations/00024_kcc_phase24_manufacturers.sql, supabase/migrations/00025_kcc_phase24_reviews_and_fixes.sql
> **Overrides:** AGENTS.md "Phase 24" section where details conflict; supersedes all earlier ad-hoc descriptions of the manufacturer flow.

## Purpose

Governs the complete buyer-to-factory workflow of the Global Manufacturer Portal: how a factory registers and gets verified, how a buyer issues an inquiry or RFQ, how quotes are created and accepted, how orders move through the 8-stage production tracker with milestone escrow, and how disputes and reviews close the loop. This document is the state-machine reference for every Mfg* status field and the canonical map of pages and API routes in this area.

## Current Truth (in this repo today)

### Database models (prisma/schema.prisma, lines 6298–6582)

13 `Mfg*` models mapped to `kv_mfg_*` tables:

- MfgManufacturer (`kv_mfg_manufacturers`) — company identity, slug, country, businessType (`manufacturer` | `trading_company` | `agent`), verificationTier (default `unverified`), trustScore, responseRate, ratingAverage, status (default `pending`)
- MfgCategory, MfgCertification, MfgCapability, MfgFactoryMedia — profile sub-records
- MfgInquiry (`kv_mfg_inquiries`) — status default `open`
- MfgQuote (`kv_mfg_quotes`) — pricingTiers JSON, moq, leadTimeDays, sampleCost, incoterm, validUntil, status default `pending`
- MfgOrder (`kv_mfg_orders`) — totalValue, currencyCode (default USD), depositPercent (default 30), milestoneStructure JSON, currentStage (default `confirmed`), productionTimeline JSON, inspection* fields, trackingNumber, status default `active`
- MfgEscrow (`kv_mfg_escrow`) — totalAmount, depositedAmount, releasedAmount, milestoneReleases JSON, status default `funded`
- MfgDispute (`kv_mfg_disputes`) — disputeType, evidenceUrls, resolution nullable
- MfgSample (`kv_mfg_samples`) — sampleCost, shippingFee, totalCost, shipmentId, status default `pending`
- MfgHub (`kv_mfg_hubs`) — hubName, city, countryCode, primaryCategories
- MfgReview (`kv_mfg_reviews`) — rating, comment, helpful (added in migration 00025)

### Registration (7 steps)

`src/app/manufacturers/register/page.tsx` implements a 7-step wizard: 1 Business Identity, 2 Category, 3 Capability, 4 Quality, 5 Pricing, 6 Logistics, 7 Review. Steps 5 and 6 are wizard-only (payment terms and incoterms are captured there: FOB/CIF/EXW/DDP/DAP/FCA and 6 payment-term options); the API contract only persists the core profile. `createManufacturer` in `src/lib/manufacturers/registration.ts` creates the manufacturer plus categories, capability, certifications and factory media in a single transaction. A manufacturer links to the auth user via `userId`; the profiles table `vendor_id` is what the API routes use to resolve "this user owns this manufacturer" (see POST /api/v1/manufacturers/quotes).

### Verification (4 tiers)

`src/lib/manufacturers/verification.ts` defines `unverified | document_verified | factory_verified | gold`. `getVerificationStatus` computes eligibility; `upgradeVerificationTier` writes the tier (used by admin PATCH /api/v1/admin/manufacturers); `recalculateTrustScore` scores 0–100 (completed orders max 40 + rating max 30 + certifications max 15 + inquiry response rate max 15). Gold requires >= 10 completed orders, avg rating >= 4.5, zero unresolved disputes, plus document/audit/certification uploads per TIER_REQUIREMENTS.

### Inquiry → RFQ → Quote → Order

- Direct inquiry: POST /api/v1/manufacturers/inquiries (createInquiry, status `open`)
- RFQ broadcast: POST /api/v1/manufacturers/rfq with `type: "broadcast"` fans one request out to up to 50 active manufacturers matching an optional category; `type: "direct"` requires manufacturerId (src/app/api/v1/manufacturers/rfq/route.ts)
- Quote creation: POST /api/v1/manufacturers/quotes (manufacturer-owned only, verified via profiles.vendor_id) sets inquiry status to `quoted`
- Quote comparison: GET /api/v1/manufacturers/quotes?inquiryId= returns all quotes with manufacturer, verificationTier and trustScore
- Quote acceptance: `acceptQuote` (src/lib/manufacturers/inquiries.ts) rejects all sibling quotes, marks the chosen one `accepted`, sets inquiry `quoted`, creates an MfgOrder (status `active`, depositPercent 30) and an MfgEscrow (status `funded`) in one transaction
- Order creation without a quote: POST /api/v1/manufacturers/orders creates order with status `pending` and calls `fundEscrow(order.id, depositAmount)` where deposit = totalValue * depositPercent / 100

### Sample orders

`src/lib/manufacturers/samples.ts`: `requestSample` creates an MfgSample with status `requested` and totalCost = sampleCost + shippingFee; `updateSampleStatus` moves status and optionally attaches shipmentId. Pages: buyer-facing sample request at src/app/manufacturers/[slug]/sample/page.tsx, dashboard list at src/app/manufacturers/dashboard/samples/page.tsx.

### Production tracker (8 stages)

`src/lib/manufacturers/production.ts` PRODUCTION_STAGES: `confirmed`, `sourcing`, `in_production`, `quality_control`, `ready_inspection`, `packed`, `dispatched`, `delivered`. `updateProductionStage` appends to productionTimeline JSON, sets currentStage, and sets order status to `completed` when the stage is `delivered`, otherwise `active`. `requestInspection` moves to `ready_inspection` with inspectionPartner/inspectionStatus `pending`; `submitInspectionResult` sets `passed` -> `packed` or `failed` -> `quality_control`. Inspection partners are SGS, Bureau Veritas, Intertek, TÜV, Kauvex Internal Team (src/app/api/v1/manufacturers/orders/[id]/production/route.ts).

### Milestone escrow

`src/lib/manufacturers/escrow.ts` DEFAULT_MILESTONES: Order Confirmed (Deposit) 30%, Production Complete 40%, Shipped / Delivered 30%. `releaseEscrowMilestone` computes per-milestone amount as round(totalAmount * percent / 100), rejects double release of the same milestoneIndex, and flips status to `released` when all milestones released, else `partial_release`. Escrow statuses: `funded | partial_release | released | disputed | refunded`. NOTE: the wallet moves are present only as commented TODO stubs (lines 76–78, 101–102) — escrow is a ledger record today, not a money movement.

### Disputes and reviews

- Dispute types: `quality | quantity | late_delivery | wrong_spec | customization_mismatch`; resolutions: `full_refund | partial_refund | rework | rejected` (src/lib/manufacturers/disputes.ts)
- POST /api/v1/manufacturers/disputes verifies the user is buyer or manufacturer of the order; GET filters to the caller's orders
- Admin resolution: POST /api/v1/admin/manufacturers/disputes/[id]/resolve — `full_refund` or `partial_refund` also marks the order escrow `disputed` via `disputeEscrow`
- Reviews: GET/POST /api/v1/manufacturers/reviews; POST re-aggregates and writes MfgManufacturer.ratingAverage

### Page map

Portal (public/authenticated): /manufacturers (landing), /manufacturers/register, /manufacturers/login, /manufacturers/search, /manufacturers/request-quote, /manufacturers/landed-cost, /manufacturers/quotes, /manufacturers/[slug] (profile), /manufacturers/[slug]/quote, /manufacturers/[slug]/sample, /manufacturers/[slug]/contact.
Dashboard: /manufacturers/dashboard (overview, stats API), storefront, inquiries, quotes, orders, samples, production, escrow, disputes, reviews, analytics, settings.
Admin: /admin/manufacturers (directory), /admin/manufacturers/[id], /admin/manufacturers/hubs, /admin/manufacturers/disputes.

### API map

Manufacturer-facing: POST/GET /api/v1/manufacturers (register/list), GET /api/v1/manufacturers/[slug], POST /api/v1/manufacturers/rfq, GET /api/v1/manufacturers/rfq/[id]/quotes, POST/GET /api/v1/manufacturers/inquiries, POST/GET /api/v1/manufacturers/quotes, POST/GET /api/v1/manufacturers/orders, GET/POST/PATCH /api/v1/manufacturers/orders/[id]/production, POST/GET /api/v1/manufacturers/samples, GET /api/v1/manufacturers/escrow (summary), GET/POST /api/v1/manufacturers/escrow/[orderId], POST/GET /api/v1/manufacturers/disputes, POST/GET /api/v1/manufacturers/reviews, POST /api/v1/manufacturers/ai-quote-draft, GET /api/v1/manufacturers/dashboard/stats, POST /api/v1/manufacturers/media.
Admin: GET/PATCH /api/v1/admin/manufacturers (list; status `active | suspended | pending_review`, verificationTier), GET/PATCH /api/v1/admin/manufacturers/[id], GET/POST /api/v1/admin/manufacturers/hubs, GET/PATCH /api/v1/admin/manufacturers/hubs/[id], GET /api/v1/admin/manufacturers/disputes, POST /api/v1/admin/manufacturers/disputes/[id]/resolve.

### State machines (verified from lib and routes)

Inquiry: `open` -> `quoted` (on quote creation or acceptance). Quote: `pending` -> `accepted` (acceptQuote) | `rejected` (all siblings when one is accepted). Order: `pending` (API-created) -> `active` (acceptQuote path; stage moves) -> `completed` (stage `delivered`). Production stage: any of the 8 stages can be written by PATCH (enum-validated only, no sequencing check). Escrow: `funded` -> `partial_release` -> `released` | `disputed` (admin dispute resolution) | `refunded` (refundEscrow; blocked when already `released`). Sample: `pending` (schema default) -> `requested` (requestSample) -> manufacturer-controlled status updates. Dispute: `resolution` null (open) -> one of the 4 resolutions, `resolvedAt` set.

### Demo accounts

`scripts/setup-demo-accounts.js` and POST /api/setup/demo-accounts seed manufacturer@kauvex.com / Manufacturer1! (role vendor with manufacturer profile, Shenzhen Precision Electronics) and wholesale@kauvex.com / Wholesale1! (customer).

## Rules

1. The registration API contract is the single source of truth for what can be persisted; wizard-only fields (steps 5–6) must never be silently dropped when a future API version adds them — extend `createManufacturerSchema` and `CreateManufacturerInput` together.
2. Every quote, order, production update, escrow action and dispute must be authorized against the caller's manufacturer identity via `profiles.vendor_id`; never trust a manufacturerId in the body alone.
3. Accepting a quote is transactional: sibling quotes rejected, inquiry set to `quoted`, MfgOrder + MfgEscrow created in one `prisma.$transaction` — no partial states.
4. Order status is derived: only `delivered` stage sets `completed`; all other stage writes set `active`. Do not store a status that contradicts currentStage.
5. Escrow release must guard against double release of the same milestoneIndex and must not release more than 100% of totalAmount; milestone percentages must sum to 100.
6. Escrow money movement stays a TODO until EC-046 wallet integration lands; never present `releaseEscrowMilestone` as a real payment.
7. A dispute on an order whose escrow is fully `released` cannot be auto-refunded; mark `disputed` and require manual admin resolution.
8. Broadcast RFQ caps at 50 manufacturers and only targets `status: "active"` factories.
9. Reviews POST recalculates ratingAverage; do not persist per-review rating adjustments anywhere else.
10. New production stages must be added to the Zod enum, PRODUCTION_STAGES, and the schema comment in the same change.

## Evolution Targets

> **Evolution target — NOT in the repo today.**
> Automatic tier promotion: `getVerificationStatus` computes eligibility but nothing in the repo upgrades a tier automatically on threshold crossing — promotion is admin-only today.
> Notifications on stage change, inquiry response reminders, and quote expiry enforcement (`validUntil` is stored but never enforced).
> End-to-end sample fulfillment workflow with sample approval/rejection gates before bulk production is triggered.
> Forward-only production stage validation (see EC-040) and buyer-side confirmation of `delivered` before order completion.

## Checklist — Definition of Done for this area

- [ ] Every status write in the Mfg domain is documented against this doc's state machines
- [ ] All page and API paths above exist in the repo (verified at time of writing)
- [ ] Escrow milestone math matches DEFAULT_MILESTONES 30/40/30 and the rules above
- [ ] No route trusts a body manufacturerId without the profiles.vendor_id check
- [ ] acceptQuote remains a single transaction with all four side effects
- [ ] Order status always derivable from currentStage
- [ ] Demo account flow still seeds a working manufacturer profile
