# EC-038 — BOM Engine

> **Status:** Active
> **Phase:** E — Manufacturing Engine
> **Canonical code:** prisma/schema.prisma (model BosBom line 8119, model BosProductionOrder line 8139, KpnConfiguratorSession.billOfMaterials line 7115, MfgOrder.milestoneStructure line 6464), src/lib/manufacturers/production.ts, src/lib/manufacturers/inquiries.ts
> **Overrides:** Any description of a manufacturing BOM that assumes a dedicated Mfg-domain BOM model. A real BOM model exists in the Business OS (EC-045) domain, not in the manufacturer domain.

## Purpose

Defines how a bill of materials is represented, generated, versioned and consumed inside KCC, and how it will evolve from the current JSON-embedded structures into a first-class manufacturing BOM engine. This document distinguishes what exists today (Business OS BosBom model, configurator BOM JSON, order milestone structures) from the staged build-out that will attach BOMs to the manufacturer workflow.

## Current Truth (in this repo today)

### A BOM model exists — in Business OS, not in the Mfg domain

`model BosBom` (prisma/schema.prisma line 8119, table `kv_bos_boms`) is the only dedicated BOM entity in the schema:

- orgId, productId (both UUID, indexed)
- bomName (VarChar 200)
- components (Json, default `[]`) — free-form component list
- scrapPercent (Decimal 5,2, default 0)
- laborHours (Decimal 8,2, default 0)
- machineHours (Decimal 8,2, default 0)
- version (Int, default 1) — manual versioning field, not an auto-incrementing revision table
- isActive (Boolean, default true) — active-version flag

### Production orders reference BOMs

`model BosProductionOrder` (prisma/schema.prisma line 8139) carries `bomId` (nullable FK-style reference to BosBom), quantity, quantityProduced, scrapQuantity, workCenter, routing (Json), plannedStart/plannedEnd, actualStart/actualEnd, and status with the documented values `planned | released | in_progress | on_hold | completed | cancelled` (schema comment, line 8150). This is the Business OS production order — distinct from `MfgOrder` in the manufacturer domain.

### Configurator BOMs (JSON only)

`KpnConfiguratorSession` (prisma/schema.prisma line 7109, `kv_kpn_configurator_sessions`) stores `billOfMaterials Json? @map("bill_of_materials")` (line 7115) plus costEstimateMin/costEstimateMax, status `draft | quoted | ordered | in_production`. AI Design Studio configurators (boat, solar, CCTV, house, kitchen, dredging) write BOM-shaped JSON here. It is unstructured and per-session.

### Order-level product structure in the Mfg domain

`MfgOrder.milestoneStructure Json?` (schema line 6464) is written by `acceptQuote` (src/lib/manufacturers/inquiries.ts) as `{ productDescription, quantity, unitPrice }` — a pricing/spec snapshot, not a component BOM. There is no materials/quantities/costs breakdown anywhere in the manufacturer domain.

### Verified absence

No BOM fields exist on MfgProduct, MfgOrder, or any Mfg* model. No nested-BOM support exists (BosBom.components is a JSON blob with no parent/child relation). No API route reads or writes BosBom or BosProductionOrder in the manufacturer API groups. There is no UI for BOM editing in the manufacturer portal.

## Rules

1. Do not create a second BOM model in the Mfg domain while BosBom exists — the staged build must extend BosBom (or add revision models under the BOS prefix) and reference it from MfgOrder via an added `bomId` field.
2. BOM data shape: components must remain JSON but with a fixed contract once written from the BOM engine: `{ sku/partId, description, quantityPerUnit, unitCost, wasteFactor, supplierId?, sourcingMode }`. Never write arbitrary shapes into BosBom.components.
3. BOM versioning: never mutate an in-use BOM in place. Increment `version` (or add a revision table) and flip `isActive`; production orders must store the bomId + version they were released against.
4. Nested BOMs: a sub-assembly is itself a BosBom row; parent components reference child by bomId. Cyclic references are forbidden — validate before persist.
5. BOM on product listing: when the engine lands, a product's active BOM is the one surfaced on the listing and used for cost estimation (EC-039); the MfgOrder.milestoneStructure snapshot stays the order-time record and is never overwritten by later BOM edits.
6. Unit cost math inside a BOM must be material cost per unit * (1 + wasteFactor/scrapPercent), plus allocated laborHours and machineHours — do not invent other cost line items without updating EC-039.
7. Configurator `billOfMaterials` JSON must be convertible into a BosBom row (same field contract) before it can feed production; the conversion is a one-way import with a new version.
8. No new code may read `components` assuming it is anything other than the JSON contract in rule 2.

## Evolution Targets

> **Evolution target — NOT in the repo today.**
> A BOM engine module (lib-level) that generates a bill of materials from a product listing: materials, quantities, per-unit costs, and supplier parts, persisted as BosBom rows.
> BOM versioning workflow: edit -> revision -> approve -> activate, with active-version enforcement at quote and production time.
> Nested BOM support: sub-assembly rows, recursive roll-up of quantity and cost, and cycle detection.
> BOM-driven procurement: component shortages flagged against supplier catalogs (Phase 24 supplier landscape) before production starts.
> BOM cost roll-up into the automated cost engine of EC-039 (materials + labor + tooling + logistics + customs + margin) with material price feeds.
> Attaching a BOM to MfgOrder (new bomId field) and to production stages so stage advancement can be checked against component availability.
> UI in the manufacturer dashboard for BOM editing and version history.

## Checklist — Definition of Done for this area

- [ ] BosBom and BosProductionOrder remain the canonical BOM/production-order models; no duplicate Mfg BOM model created
- [ ] components JSON contract documented in one place and enforced by validation
- [ ] Version increments are immutable once referenced by an order
- [ ] Nested BOM roll-up math tested (quantity and cost) with cycle detection
- [ ] Configurator BOM JSON imports cleanly into BosBom
- [ ] EC-039 cost model consumes BOM data without hard-coded magic numbers
- [ ] MfgOrder stores bomId + version snapshot at order creation
