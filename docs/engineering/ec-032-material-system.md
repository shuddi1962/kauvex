# EC-032 — Material System

> **Status:** Active
> **Phase:** D — Universal Design Engine
> **Canonical code:** `src/lib/packaging-engine.ts`, `src/lib/logistics/packaging-options.ts`, `src/components/admin/brand-asset-portal.tsx`, `src/app/admin/pod/page.tsx`, `src/lib/manufacturers/categories.ts`
> **Overrides:** `docs/canvas/02-universal-design-engine.md` and `docs/canvas/07-product-configurator-pod.md` on conflict — the vision of a unified cross-industry material catalog (colors, fabrics, materials, finishes) is an evolution target; this file records the material-adjacent code that exists today.

## Purpose

Define the material system for Kauvex: a single conceptual registry of materials (colors, fabrics, raw materials, finishes) with pricing, availability, and compliance metadata, shared by configurators, POD products, packaging, and manufacturing. Today there is no dedicated material engine; instead, material-like data lives in several unrelated modules. This document names each of those modules as the seeds the future registry must absorb, and sets the rule that material pricing is always a server-side function of the registry, never client-supplied.

## Current Truth (in this repo today)

- **No material engine exists.** Verified: there is no `material` model in `prisma/schema.prisma` (no table for a material catalog) and no `src/lib/material*` module. All of the following are material-adjacent systems, not a material registry.
- **Packaging materials** — `src/lib/packaging-engine.ts` (`"use server"`) is the closest thing to a material engine: it selects packaging materials for orders (inputs include product dimensions, weight, fragility, battery/liquid/food/electronics flags, gift mode, international status), tracks inner materials (`InnerMaterial { materialId, quantity }`), runs compliance checks with violations and severity (`ComplianceResult`), and produces packaging records and checklists. A secondary static catalog lives in `src/lib/logistics/packaging-options.ts` (`PACKAGING_OPTIONS`, `getPackagingByType`, `suggestPackaging`, `calculateDimWeight`) with per-type sizes and fees.
- **Brand asset types include materials** — `src/components/admin/brand-asset-portal.tsx` (admin brand asset portal UI, used by `src/app/admin/brand/assets/page.tsx`) manages asset types that include `color`, `packaging`, and `typography` across sub-brands (kauvex, express, logistics, fbk, pay, live) — the brand-side home of color/material/finish assets today.
- **POD product types** — `src/app/admin/pod/page.tsx` manages POD products with a `productType` field (e.g., t-shirt) and `baseCost`; the POD studio shell (`src/app/vendor/pod/design-studio/page.tsx`) hardcodes a "T-Shirt Canvas" with a 12 x 14 inch printable area. Product surface material/color are not modeled yet.
- **Manufacturing categories reference materials** — `src/lib/manufacturers/categories.ts` includes manufacturing categories such as "Curtain/upholstery fabric producers" and "Embroidery/print-on-fabric", anchoring material producers to the manufacturer portal.

## Rules

1. Material data must live in one canonical registry (single source of truth) once a registry exists; no new feature may introduce a second material catalog in its own module.
2. Material pricing must be computed server-side from the registry (base price, per-unit surcharge, finish multiplier); client requests must supply material IDs only, never prices.
3. Material choices in any configurator or POD design must serialize by material ID into the session `configuration` JSON (`KpnConfiguratorSession`, `prisma/schema.prisma:7109`) so quotes and reorders are deterministic.
4. Compliance attributes attach to materials: `src/lib/packaging-engine.ts` already models compliance results for packaging; any material registry must carry the same compliance shape (compliant, violations, severity) for food-contact, battery, liquid, and international-shipping cases.
5. Brand-owned material definitions (colors, finishes, packaging templates) must reconcile with the brand asset portal (`brand-asset-portal.tsx` asset types) — the registry absorbs those, it does not replace the portal's approval workflow.
6. A material is not referenceable by a marketplace product, POD product, or configurator until it has: ID, display name, unit of measure, price, currency, availability status, and compliance record.

## Evolution Targets

> **Evolution target — NOT in the repo today.**

- **Unified material registry**: a Prisma model set (e.g., `Material`, `MaterialVariant`, `MaterialPrice`, `MaterialCompliance`) spanning colors, fabrics, finishes, raw materials, and packaging materials with per-material pricing per storefront currency. No such models exist in `prisma/schema.prisma`.
- **Pricing per material**: cost impact of a material choice flows into the configurator's `billOfMaterials` and `costEstimateMin` / `costEstimateMax` (fields that exist on `KpnConfiguratorSession` today but are never populated).
- **Fabric and finish libraries** for the fashion/boat/kitchen studios: catalogs with swatch assets (brand assets), physical properties (weight, weave, fire rating), and supplier links into the manufacturer portal.
- **POD surface catalog**: POD product types become material-bearing (garment color, fabric weight, print surface) so `baseCost` in `src/app/admin/pod/page.tsx` derives from material cost plus print cost instead of a flat value.
- **Material substitution engine**: given a design and a target price, propose alternative materials that keep compliance; consumers the packaging `suggestPackaging` pattern from `src/lib/logistics/packaging-options.ts`.

## Checklist

- [ ] Registry decision recorded; single source of truth named.
- [ ] All material-adjacent data inventoried (packaging-engine, packaging-options, brand assets, POD product types, manufacturer categories) with migration plan into the registry.
- [ ] Server-side material pricing verified (client never sends prices).
- [ ] Material IDs serialized into configurator session `configuration`.
- [ ] Compliance record attached to every material reference.
- [ ] Brand asset portal reconciliation defined for colors/finishes/packaging.
- [ ] POD `baseCost` derivable from material + print cost.
