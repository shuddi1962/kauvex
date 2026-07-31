# EC-041 — Machine Integrations

> **Status:** Active
> **Phase:** E — Manufacturing Engine
> **Canonical code:** (none in repo today — see Evolution Targets)
> **Overrides:** nothing

## Purpose

Defines the (future) bridge between Kauvex design/order data and physical production machines: CNC, laser cutting, nesting, fabric markers, and print files. Today this is entirely an evolution target; this document sets the principles so future implementations land consistently.

## Current Truth (in this repo today)

- No machine integrations exist in the repo (verified — no CNC/laser/nesting/print-integration code).
- Adjacent foundations that future integrations build on:
  - Export/document generation: `src/lib/documents/templates.ts` (labels, waybills, invoices, packing lists).
  - Customs/print documents: `/api/v1/shipping/customs` (CN22/CN23, commercial invoice) via `src/lib/logistics/customs.ts`.
  - POD design data: Fabric.js canvas in `/vendor/pod` (design state is client-side today).
  - Event surface for machine callbacks: K Platform webhooks (`src/lib/k-platform/index.ts`, HMAC-signed) — the intended delivery channel.
  - Manufacturing orders: `kv_mfg_*` tables + production tracker (EC-040).

## Rules

1. Machines are never controlled directly from the browser. Integration is: server generates an export file → file delivered to the machine's service (webhook/API) → status callbacks return via webhook (verified HMAC).
2. Export formats are standardized per EC-036 (PDF/SVG/PNG/vector; print specs with DPI/color profile defined at spec time).
3. Machine capabilities are modeled in DB (machine type, supported materials, tolerances, status) before any live integration — never hardcode in UI.
4. Every machine event (job accepted, started, completed, failed, rejected) is logged and surfaced in the production tracker (EC-040).
5. Integrations are opt-in per factory and gated by verification tier (EC-042) — unverified factories don't get live machine links.
6. Failure modes are explicit: timeouts, rejected files, and retry policies are defined per integration spec.

## Evolution Targets

> **Evolution target — NOT in the repo today.** (This entire document is forward-looking.)
- CNC file generation (G-code export) from parametric designs (EC-029/EC-036).
- Laser cutting: vector export + material parameter profiles.
- Nesting engines (part packing, fabric markers with grain direction).
- Print file delivery service (PDF prepress with bleeds/color profiles) for POD.
- Machine status API + job queue with BullMQ (EC-015/EC-016 evolution).

## Checklist (Definition of Done for this area — applies only when an integration ships)

- [ ] Server-side export pipeline, no browser-direct control
- [ ] Machine capability modeled in DB
- [ ] Webhook callbacks with HMAC verification
- [ ] Events logged to production tracker
- [ ] Factory verification tier gate
