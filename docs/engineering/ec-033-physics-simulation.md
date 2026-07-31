# EC-033 — Physics Simulation

> **Status:** Active
> **Phase:** D — Universal Design Engine
> **Canonical code:** none (verified: no simulation code in the repo); anchors: `src/app/configure/`, `prisma/schema.prisma` (`KpnConfiguratorSession`, line 7109)
> **Overrides:** `docs/canvas/04-3d-engine.md` and `docs/canvas/10-k3d-engine.md` on conflict — simulation described in the vision (simulation previews, digital twins, AR/VR) is an evolution target; this file records that no physics exists in the repository today.

## Purpose

Define how physics-based validity checks will enter the design system: constraints, measurements, and validity simulations for parametric designs (boat hull stability, kitchen fit, structural checks) — without ever putting simulation on the server-side critical path. This document's central discipline: validation is a staged capability (static rules first, lightweight simulation second, full physics last), and every stage must be provably safe for the checkout and quote flow. Current truth: none of this exists in the repo.

## Current Truth (in this repo today)

- **No simulation code (verified)** — a review of `src/lib/` and the schema finds no physics, constraint-solver, or validity-check modules. `package.json` contains no physics library (no `rapier`, `cannon`, `matter-js`, `planck`, or similar) and no `src/` file references one.
- **Parametric inputs exist but are unvalidated** — `src/app/configure/` wizards (`boat`, `solar`, `security`, `kitchen`, `house`, `farm`, `dredging`, `cctv`) collect parameters as form steps. For example `src/app/configure/boat/page.tsx` collects vessel type, purpose, dimensions, hull type, hull material, propulsion, and engine brand into client state. Nothing checks whether the parameters are physically coherent (e.g., a 4 m hull with a 300 HP outboard), and nothing persists them.
- **Persistence target** — `KpnConfiguratorSession` (`prisma/schema.prisma:7109`, table `kv_kpn_configurator_sessions`) holds `configuration` (JSON), `billOfMaterials` (JSON), and cost estimates — the natural home for validation results (a validation report can be stored alongside the configuration), though no code writes these today.
- **Validation-adjacent logic elsewhere** — the only "validity" logic in the repo is domain-specific and unrelated to geometry: compliance checks in `src/lib/packaging-engine.ts` (packaging `ComplianceResult` with violations/severity) and fraud/risk scoring in the security engine. These establish the pattern (structured result, severity levels) that design validation should follow.

## Rules

1. Never simulate server-side on the critical path. No physics, solver, or heavy validation step may run inside checkout, order creation, or quote API routes; simulation is a separate, async, cacheable service or a client-side preview.
2. Design validity is a data product: validation results are a structured report (passed/failed, warnings, severity, measured quantities) stored with the session (`configuration` or a dedicated JSON field), and the report is re-derivable from parameters at any time.
3. Validation runs on the persisted parameter snapshot (`configuration`), never on client-claimed derived values; a client may not submit "validated" status — the server re-derives it.
4. Stages are gated: static rule validation may ship standalone; lightweight simulation ships only after rule validation is in production; full physics ships only after lightweight simulation has a published performance and accuracy budget.
5. A design with failed validity checks can be saved as `draft` but cannot progress to `quoted` or `ordered` status on `KpnConfiguratorSession`; warnings (not failures) must be surfaced to the buyer with the quote.
6. Simulation output is always accompanied by its input parameters, version, and timestamp; unversioned simulation results are not acceptable in any persisted record.

## Evolution Targets

> **Evolution target — NOT in the repo today. This entire document is an evolution target except the persistence schema it anchors to.**

- **Static validation rules**: per-configurator rule sets (e.g., boat: length-to-beam ratio bounds, hull-material thickness minimums, engine power-to-displacement ratio; kitchen: cabinet-to-wall clearance, appliance clearance, sink-adjacent-to-drain plumbing assumptions) evaluated from `configuration` JSON. This is the first stage and requires no physics engine.
- **Lightweight simulation**: fast geometric feasibility checks — hull displacement from dimensions and hull type, kitchen fit from room dimensions, solar array fit from roof area — computed with deterministic formulas, cacheable by parameter hash.
- **Full physics**: real-time simulation (hydrostatics for hulls, structural load checks for dredging/house configurators, thermal for solar) integrated with the 3D viewport (see EC-031) and digital twins (`kv_kpn_digital_twins`); future capability, no timeline commitment in this document.
- **Simulation service**: a dedicated, horizontally scalable service (or cached serverless function) for validity reports, with an API separate from the marketplace; results cached by parameter-hash key.
- **Digital-twin lifecycle simulation**: maintenance and wear prediction on `kv_kpn_digital_twins` records extending the existing `KpnMaintenanceSchedule` model — not a design-time validity feature but a downstream consumer of the same physics investment.

**Staged plan (mandatory order):**
1. Static validation rules for at least the boat and kitchen configurators (rule modules in `src/lib/`, reports stored per session).
2. Lightweight simulation for the same configurators with measured accuracy against real-world specs.
3. Full physics only after stages 1 and 2 have operated in production for at least one release cycle.

## Checklist

- [ ] Static rule modules exist for the boat and kitchen configurators.
- [ ] Validation reports persist with sessions and are re-derivable from parameters.
- [ ] `draft` vs `quoted`/`ordered` status transitions enforce the validity gate.
- [ ] Verified: no simulation code in checkout/order/quote API routes.
- [ ] Client cannot assert validation status; server re-derives.
- [ ] Simulation results carry version + parameter hash + timestamp.
- [ ] Lightweight simulation stage has published accuracy measurements.
