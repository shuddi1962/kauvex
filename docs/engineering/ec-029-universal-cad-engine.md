# EC-029 — Universal CAD Engine

> **Status:** Active
> **Phase:** D — Universal Design Engine
> **Canonical code:** `src/app/configure/`, `src/app/vendor/pod/`, `src/app/pod-marketplace/`, `src/app/admin/pod/`, `src/app/assets/`, `prisma/schema.prisma` (`KpnConfiguratorSession`, line 7109; `KpnDigitalTwin`, line 7071)
> **Overrides:** `docs/canvas/02-universal-design-engine.md`, `docs/canvas/04-3d-engine.md`, `docs/canvas/07-product-configurator-pod.md`, `docs/canvas/08-universal-design-studio.md` on conflict — those are vision documents; this file records what exists in the repo today.

## Purpose

Define the scope, current reality, and staged evolution path for the Kauvex Universal CAD Engine — the system that lets buyers configure, customize, and design products across every industry (fashion, boats, buildings, furniture, packaging, printing, solar, kitchens, warehouses) and turn those designs into manufactured or printed goods. This document is the engineering source of truth: it separates what ships today (configurator sessions, POD studio shell, digital twin registry) from what remains an evolution target (parametric core, scene graph, measurement and constraints, CAD export).

## Current Truth (in this repo today)

- **AI Design Studio configurators** — `src/app/configure/` contains a landing page (`page.tsx`) plus eight client-side configurator wizards: `boat/`, `solar/`, `security/`, `kitchen/`, `house/`, `farm/`, `dredging/`, `cctv/`. Each is a multi-step form UI (for example `src/app/configure/boat/page.tsx` is a 10-step wizard: vessel type, purpose, dimensions, hull, propulsion, superstructure, navigation, safety, deck/exterior, review) using client-side state only. No rendering or CAD kernel is involved.
- **Configurator session table** — `prisma/schema.prisma:7109` defines `KpnConfiguratorSession` mapped to `kv_kpn_configurator_sessions`. Fields: `configuratorType` (`VarChar(30)`; schema comment lists `boat | solar | cctv | house | kitchen | dredging | security | farm | factory`), `configuration` (`Json`), `aiRenderUrl` (`Text`), `billOfMaterials` (`Json`), `costEstimateMin` / `costEstimateMax` (`Decimal(14,2)`), `currencyCode` (default `NGN`), `status` (`draft | quoted | ordered | in_production`), `quotesReceived`, `selectedBuilderId`, timestamps. Indexed on `userId`, `configuratorType`, `status`. Verified: no code in `src/` currently reads or writes this table (grep for `KpnConfiguratorSession` in `src/` returns nothing) — it is the persistence target, not yet wired to the wizard UIs.
- **POD Design Studio shell** — `src/app/vendor/pod/design-studio/page.tsx` is a `"use client"` UI shell only. Tool rail (text, images, shapes, AI generate, layers), a placeholder "T-Shirt Canvas" area with a "Printable Area: 12 x 14 inches" caption, and toolbar actions (undo, redo, zoom, preview, save) that do not yet operate on a canvas. Verified: `package.json` contains no canvas library (no fabric, konva, pixi, three) and no `src/` file references `fabric`, `konva`, `pixi`, or `three`.
- **POD marketplace** — `src/app/pod-marketplace/page.tsx` lists licensable designs (name, creator, price, sales, rating, thumbnail images) as static UI with local state.
- **POD admin** — `src/app/admin/pod/page.tsx` manages designs and POD products (design, productType, retailPrice, baseCost, orders, status) as a UI table with local mock data.
- **Digital Twin and Asset Registry** — `src/app/assets/page.tsx` exists; `prisma/schema.prisma:7071` defines `KpnDigitalTwin` mapped to `kv_kpn_digital_twins` (fields include `ownerId`, `assetType`, `isForSale`; the twin model is the data anchor for asset lifecycle records).
- **Art marketplace** — `src/app/art-marketplace/page.tsx` provides buy/sell of digital art with commercial licensing as a storefront page.
- **Vision documents** — `docs/canvas/02-universal-design-engine.md` (UDE), `docs/canvas/07-product-configurator-pod.md` (KPC), `docs/canvas/08-universal-design-studio.md` (KDS), `docs/canvas/04-3d-engine.md` (K3D) define the full vision: every studio (fashion, boats, architecture, furniture, dredging, solar, CCTV, printing, packaging) powered by one engine.

## Rules

1. Every design/configurator session must be persistable to `kv_kpn_configurator_sessions` (model `KpnConfiguratorSession`) — session state is a JSON document in `configuration`; never hold design state only in server memory or a component-local `useState`.
2. Parameter values and the bill of materials are the source of truth for cost; price must be recalculated from persisted parameters server-side at quote time, never trusted from the client.
3. New configurator wizards must set `configuratorType` to one of the values the schema comment documents (`boat | solar | cctv | house | kitchen | dredging | security | farm | factory`) — extend the enum comment in the schema before adding a new type.
4. No CAD engine, 3D viewport, or physics dependency may be added to `package.json` until a corresponding design decision records the integration point (see Evolution Targets); nothing in this phase may block the marketplace critical path.
5. Digital twin data (`kv_kpn_digital_twins`) is the registry anchor for any asset a configurator produces — a configured product that becomes a physical asset must reference the twin.
6. All studio UI follows brand tokens from `src/components/ui/brand-tokens.ts` (navy `#0A1628`, orange `#FF6B00`, Inter; dark mode disabled; `rounded-lg` buttons, `rounded-xl` cards).

## Evolution Targets

> **Evolution target — NOT in the repo today.**

- **Parametric core**: a parametric model definition (dimensions, constraints, rules) that any configurator or studio can instantiate; today configurators are hand-written step wizards and no parametric engine exists.
- **Scene graph**: a unified object tree (layers, groups, transforms) shared by 2D studios, 3D viewports, and previews; today there is no scene graph of any kind in `src/`.
- **Measurement and constraint system**: dimension-driven design where changing one parameter re-derives dependent geometry; today the boat wizard collects dimensions as form fields with no geometry.
- **CAD kernel integration**: solid modeling / B-rep operations (booleans, extrusions, lofts) or a hosted kernel service; explicitly NOT in the repo — no `opencascade` or equivalent is a dependency of `package.json`.
- **Unified studio platform**: one design engine serving fashion, boats, buildings, furniture, packaging, printing, solar, kitchens, warehouses per `docs/canvas/08-universal-design-studio.md`; today only the POD shell and eight wizard stubs exist.
- **Staged evolution order**: (1) wire existing wizards to `kv_kpn_configurator_sessions` persistence and server-side pricing; (2) add a real 2D canvas editor for POD (see EC-030); (3) add a 3D preview viewport (see EC-031); (4) introduce parametric constraints; (5) full CAD kernel only after 2D and 3D layers prove out in production.
- **Marketplace integration**: custom products become catalog variants — a configured product produces a variant with a snapshot of the parameter JSON, the BOM, and a render thumbnail; order line items reference the snapshot so re-printing is deterministic.

## Checklist

- [ ] All eight existing configurator wizards (`boat`, `solar`, `security`, `kitchen`, `house`, `farm`, `dredging`, `cctv`) persist sessions to `kv_kpn_configurator_sessions`.
- [ ] Server-side quote calculation consumes `configuration` + `billOfMaterials` and writes `costEstimateMin` / `costEstimateMax`.
- [ ] Session resume works: a `draft` session can be reopened from its JSON.
- [ ] POD studio renders a real canvas editor (see EC-030) instead of the placeholder "T-Shirt Canvas" div.
- [ ] Digital twin creation flow exists for configured physical assets.
- [ ] Custom-product variants can be added to the cart with a stored parameter snapshot.
- [ ] No CAD/3D/physics dependencies added to `package.json` without a design decision.
