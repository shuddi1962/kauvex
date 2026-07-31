# EC-034 — Parametric Modeling

> **Status:** Active
> **Phase:** D — Universal Design Engine
> **Canonical code:** `src/app/configure/` (wizards: `boat`, `solar`, `security`, `kitchen`, `house`, `farm`, `dredging`, `cctv`), `prisma/schema.prisma:7109` (`KpnConfiguratorSession` / `kv_kpn_configurator_sessions`)
> **Overrides:** `docs/canvas/07-product-configurator-pod.md` and `docs/canvas/02-universal-design-engine.md` on conflict — those define the vision parametric engine; this file records the current, verified parametric reality (form-based wizard state and a persistence table).

## Purpose

Define how parametric design works on Kauvex today and how it will evolve: a design is a set of parameters (dimensions, options, material IDs) captured by a configurator, persisted per session, and priced server-side from those parameters. The rules in this document are binding now — session persistence and server-side pricing are the two non-negotiable properties of every configurator — while the parametric CAD engine (dimension constraints, derived geometry) is an explicitly flagged evolution target.

## Current Truth (in this repo today)

- **Eight configurator wizards** — `src/app/configure/` contains `page.tsx` (index) plus `boat/`, `solar/`, `security/`, `kitchen/`, `house/`, `farm/`, `dredging/`, `cctv/`. All are `"use client"` multi-step forms driven by local `useState`. Example (`src/app/configure/boat/page.tsx`): 10 steps — vessel type, purpose, dimensions, hull, propulsion, superstructure, navigation, safety, deck/exterior, review — with parameter option sets (vessel types, hull materials: steel/aluminum/fiberglass/wood/composite/HDPE, hull types, propulsion types, engine brands). The wizards are client-side mockups: they collect parameters, compute nothing, render nothing, and persist nothing.
- **Session model (verified)** — `prisma/schema.prisma:7109` defines `KpnConfiguratorSession`, mapped to `kv_kpn_configurator_sessions`:
  - `configuratorType` (`VarChar(30)`; comment enumerates `boat | solar | cctv | house | kitchen | dredging | security | farm | factory`)
  - `configuration` (`Json`) — the parametric document
  - `aiRenderUrl` (`Text`) — preview render URL
  - `billOfMaterials` (`Json`) — derived BOM
  - `costEstimateMin` / `costEstimateMax` (`Decimal(14,2)`), `currencyCode` (default `NGN`)
  - `status` (`draft | quoted | ordered | in_production`), `quotesReceived`, `selectedBuilderId`
  - Indexes on `userId`, `configuratorType`, `status`.
  - Verified: no code in `src/` reads or writes this table today (grep returns zero references); it is the designated persistence contract the wizards must be wired to.
- **No parametric engine** — no constraint solver, no dimension-driven geometry, no CAD model definition exists in `src/`; `package.json` has no geometry/CAD dependency (verified).

## Rules

1. Configurator state must be persisted per session: every wizard writes its parameter document to `configuration` on `KpnConfiguratorSession` before the user leaves the flow (auto-save on step change is the required minimum), and a saved `draft` session must be resumable from that JSON.
2. The `configuration` JSON is the single source of truth for the design: parameters (dimensions, options, material IDs) with a schema version field. Any derived artifact (BOM, cost, render, validation report) is regenerable from it.
3. Price must be recalculated server-side from persisted parameters: the client may send parameters, never a subtotal or total; `costEstimateMin`/`costEstimateMax` and `billOfMaterials` are written server-side only.
4. Status transitions are guarded: `draft` -> `quoted` -> `ordered` -> `in_production` per the schema's documented values; a session cannot reach `quoted` without a server-side cost estimate, and cannot reach `ordered` without a validated configuration (see EC-033).
5. Every configurator declares its `configuratorType` from the schema enum comment (`boat | solar | cctv | house | kitchen | dredging | security | farm | factory`); adding a type requires updating the schema comment first.
6. Parameter sets are versioned: old sessions must remain interpretable by recording a schema version inside `configuration`, so a saved draft made with an older wizard version still resumes.
7. Currency is explicit per session (`currencyCode`); cost estimates are always written in the session's currency, and cross-currency conversion uses the platform's exchange-rate logic, not a client-supplied rate.

## Evolution Targets

> **Evolution target — NOT in the repo today.**

- **Wizard-to-session wiring**: the eight wizards persist and resume real sessions (the table already exists; the code does not). This is the first evolution step and is fully within current schema.
- **Parameterized pricing service**: a server module that takes `configuration` + material registry (see EC-032) and returns `billOfMaterials`, `costEstimateMin`, `costEstimateMax`; today the schema fields exist but nothing computes them.
- **Dimension constraints**: parametric relationships (e.g., "length >= 4 x beam", "hull draft derived from length and hull type") enforced by the rule layer of EC-033, so changing one parameter re-derives dependents instead of accepting independent form values.
- **Parametric CAD model**: a model definition format (parameters, constraints, derivation rules, export recipes) separate from any given wizard — the foundation of the Universal Design Engine vision in `docs/canvas/02-universal-design-engine.md`.
- **Variant generation**: from a validated session, generate product variants (custom product with parameter snapshot, BOM, render) for the marketplace per EC-029.
- **Factory type**: the schema comment lists `factory` as a configurator type with no page yet — a potential first integration for the manufacturer portal.

## Checklist

- [ ] At least the boat and kitchen wizards persist and resume sessions.
- [ ] Auto-save on step change writes `configuration` (versioned JSON).
- [ ] Server-side quote endpoint consumes `configuration` and writes BOM + cost estimates.
- [ ] Client-submitted totals rejected by the quote path.
- [ ] Status transition guards implemented (`draft` -> `quoted` -> `ordered` -> `in_production`).
- [ ] `configuratorType` values validated against the schema enum comment.
- [ ] Older saved sessions resume under a versioned parameter schema.
- [ ] Currency handling verified per session.
