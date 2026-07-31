# EC-039 — Cost Estimation

> **Status:** Active
> **Phase:** E — Manufacturing Engine
> **Canonical code:** src/app/manufacturers/landed-cost/page.tsx, src/app/api/v1/manufacturers/ai-quote-draft/route.ts, src/lib/manufacturers/inquiries.ts (createQuote, acceptQuote), src/lib/manufacturers/escrow.ts (DEFAULT_MILESTONES, releaseEscrowMilestone)
> **Overrides:** Any description of the landed cost calculator that claims a server-side cost engine; today it is a client-side calculator.

## Purpose

Governs how manufacturing costs are estimated and priced on Kauvex: the landed cost formula a buyer sees, how AI-assisted quote drafting produces pricing tiers, how quotes are compared, and how escrow milestone math derives from order totals. It fixes the cost model (materials + labor + tooling + logistics + customs + margin) as the target and documents the automated cost engine as an evolution, not a current feature.

## Current Truth (in this repo today)

### Landed cost calculator (client-side)

`src/app/manufacturers/landed-cost/page.tsx` is a "use client" calculator. Verified mechanics:

- Inputs: unit price, quantity, shipping cost, duty rate (%), HS code (8 hard-coded codes, e.g. 8544.42 USB cables at 5%, 6109.10 cotton T-shirts at 15%), currency (10 currencies, USD base), convert-to currency, target margin %
- Formula (lines 66–71): subtotal = price * qty; totalDuty = subtotal * (duty/100); commission = subtotal * 5% (kauvexCommission constant); totalLanded = subtotal + shipping + totalDuty + commission; landedPerUnit = totalLanded / qty; retailPrice = landedPerUnit * (1 + margin/100)
- Auto-shipping: fetches GET /api/v1/shipping/rates?from=CN&to=NG&qty=&weight=, falls back to `max(500, qty * 0.85)`; auto-duty fills the rate from the selected HS code
- Currency conversion uses a static exchangeRates table (line 22): USD 1, NGN 1550, GBP 0.79, EUR 0.92, AED 3.67, INR 83.5, CAD 1.36, AUD 1.53, ZAR 18.2, JPY 149.5
- No persistence: results are not saved to any table or API

### AI-assisted quote drafting

`src/app/api/v1/manufacturers/ai-quote-draft/route.ts` (POST):

- Input: `inquiry` object or `inquiryId` (loads inquiry + manufacturer capabilities/certifications/categories from DB), optional `manufacturerCapabilities`
- Primary path: OpenRouter client via `createOpenRouterClient()` from src/lib/ai/openrouter; prompt asks for 3 volume-based pricing tiers, MOQ, lead time, sample cost, payment terms (prompt defaults to "30% escrow deposit, 70% on delivery"), Incoterm FOB, valid-until 14 days, notes; response parsed as JSON with `generateJSON`
- Fallback path (OpenRouter unavailable): local calculation — tiers at 115% / 100% / 92% of base price (target price or $3.00 default) across quantity bands, sampleCost = basePrice * 10, paymentTerms "30% deposit via Kauvex Escrow, 70% on delivery confirmation"
- Response shape: `{ data: { pricingTiers, moq, leadTimeDays, sampleCost, paymentTerms, incoterm, validUntil, notes }, source: "ai" | "local" }`
- The draft is NOT persisted; it is a starting point the manufacturer pastes into a real quote

### Quote creation and comparison

- POST /api/v1/manufacturers/quotes persists a real quote (pricingTiers with minQty/maxQty/unitPrice, moq, leadTimeDays, sampleCost, paymentTerms, incoterm, validUntil, notes) via `createQuote`; sets inquiry status `quoted`
- GET /api/v1/manufacturers/quotes?inquiryId= returns all quotes with manufacturer companyName, verificationTier and trustScore for side-by-side comparison
- `acceptQuote` estimates the order total from the first pricing tier: `tiers[0].unitPrice * moq` (src/lib/manufacturers/inquiries.ts line 160)

### Escrow math

`src/lib/manufacturers/escrow.ts` DEFAULT_MILESTONES: 30% Order Confirmed (Deposit), 40% Production Complete, 30% Shipped / Delivered — percentages sum to 100. `releaseEscrowMilestone` computes each release as `round(totalAmount * percent / 100, 2)` and refuses a second release of the same milestoneIndex. Order creation (POST /api/v1/manufacturers/orders) funds escrow with `depositPercent` (default 30) of totalValue. Wallet movement is commented-out TODO (escrow.ts lines 76–78, 101–102) — ledger only today.

### Verified absence

No server-side cost engine exists. No material price feeds, labor-rate tables, or tooling cost data exist anywhere in the repo. The landed-cost duty tables are the category defaults on the page (lines 27–33) and the 8 HS codes — there is no customs-database lookup. The commission constant 5% and exchange rates are hard-coded on the page.

## Rules

1. The cost model for any estimate or quote must be decomposable into: materials + labor + tooling + logistics + customs + margin. Where a current component is missing (tooling, labor), mark it explicitly rather than folding it silently into another line.
2. The 5% Kauvex commission and the exchange rate table on the landed-cost page are presentation constants only; any server-side pricing must source these from configuration, never re-imported from the page.
3. AI draft output must never be persisted as an accepted quote without passing through POST /api/v1/manufacturers/quotes validation; the `source` field (`ai` | `local`) must be shown or logged when the draft is used.
4. Escrow milestone percentages must sum to exactly 100; per-milestone release is `round(totalAmount * percent / 100, 2)`; cumulative releases may never exceed totalAmount.
5. Order value for quote-accepted orders is derived from the first pricing tier (unitPrice * moq); if tier logic changes, acceptQuote and this doc change together.
6. Exchange rates on the page are static and dated; never use them for money movement or invoice amounts.
7. Cost estimates from the configurator sessions (costEstimateMin/Max) and BOM data (EC-038) must flow into the same cost model once the automated engine lands.

## Evolution Targets

> **Evolution target — NOT in the repo today.**
> An automated cost engine (lib module) that computes the full model — materials via BOM (EC-038), labor, tooling amortization, logistics, customs, margin — and produces quotes and landed-cost figures server-side.
> Material price feeds: live material/commodity price ingestion with per-country factory pricing, replacing static rates.
> Persisting landed-cost calculations (table or API) so buyers can save, compare and share them.
> Live exchange-rate integration replacing the static table.
> Commission and margin as configurable platform parameters rather than page constants.
> Cost-history analytics: quote win rates vs. landed-cost estimates, price-trend warnings.

## Checklist — Definition of Done for this area

- [ ] Landed cost formula on the page matches this doc: subtotal + shipping + duty + 5% commission
- [ ] Escrow math 30/40/30 verified against escrow.ts constants
- [ ] AI quote drafts carry source and pass quote API validation before persistence
- [ ] No server route depends on page constants for pricing
- [ ] Static exchange rates never used in financial records
- [ ] Evolution engine, when built, consumes BOM + logistics + customs via the shared cost model
