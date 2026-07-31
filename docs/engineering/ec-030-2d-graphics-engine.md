# EC-030 — 2D Graphics Engine

> **Status:** Active
> **Phase:** D — Universal Design Engine
> **Canonical code:** `src/app/vendor/pod/design-studio/page.tsx`, `src/app/pod-marketplace/page.tsx`, `src/app/art-marketplace/page.tsx`, `package.json` (verified: no 2D canvas library present)
> **Overrides:** `docs/canvas/10-k3d-engine.md` on conflict — the canvas vision (browser-native 2D/3D engine powering every studio) is an evolution target; this file records the verified 2D truth.

## Purpose

Define the 2D graphics layer: how canvas-based design surfaces must be built, constrained, and evolved across Kauvex — the POD Design Studio being the first surface. The document states plainly what exists today (a static studio shell and image-based marketplaces, with no drawing library in the dependency tree) and sets enforceable rules for when a real 2D engine arrives, so canvas code is never reintroduced as server-rendered code or ad-hoc DOM painting.

## Current Truth (in this repo today)

- **POD Design Studio** — `src/app/vendor/pod/design-studio/page.tsx` (`"use client"`): a full-height studio shell with a tool rail (text, images, shapes, AI generate, layers via lucide-react icons), toolbar buttons (undo, redo, zoom out/in, preview, save), and a center "T-Shirt Canvas" placeholder — a plain `div` with a caption "Printable Area: 12 x 14 inches". Tool panels (text font/color/size, image upload dropzone, AI description box) are present but only toggle visibility; nothing is drawn, moved, or persisted.
- **POD marketplace** — `src/app/pod-marketplace/page.tsx` renders design cards with external thumbnail images; no canvas rendering is involved.
- **Art marketplace** — `src/app/art-marketplace/page.tsx` is a storefront page for digital art (buy/sell, commercial licensing) with no editor or rendering surface.
- **Dependency truth (verified)** — `package.json` contains no canvas or drawing library. `fabric`, `konva`, `pixi.js`, `paper.js`, and `three` do not appear in `dependencies` or `devDependencies`, and a repo-wide grep of `src/` finds zero references to `fabric`, `konva`, or `pixi`. The repo's browser-facing graphics stack today is: `lucide-react` (icons), `framer-motion` (animation), `recharts` (charts), `leaflet` (maps), and plain Tailwind CSS. Any documentation or code comment claiming "Fabric.js canvas" is incorrect and must be treated as vision text, not implementation fact.
- **Session persistence target** — the schema model `KpnConfiguratorSession` (`prisma/schema.prisma:7109`, table `kv_kpn_configurator_sessions`) provides a `configuration` JSON column that is the designated home for serialized 2D design documents (layers, text, images, transforms), though no code writes it yet.

## Rules

1. Every 2D design surface must be a client-only component (`"use client"`); canvas contexts, hit-testing, and rasterization must never run in a Server Component or server-side render path.
2. Any canvas library added later must be imported dynamically (`dynamic(() => import(...), { ssr: false })` or equivalent) so no SSR/edge runtime tries to construct a canvas; static imports of canvas libraries in server bundles are a lint violation.
3. Design state must be serializable: the full document (layers, object properties, canvas dimensions, printable area) must round-trip through JSON, and the canonical copy lives in `configuration` on `KpnConfiguratorSession` — not in browser memory.
4. Undo/redo must be a command history over the serialized document (each command is a JSON diff), not DOM mutation snapshots; the studio shell's existing undo/redo buttons must be wired to that history once a canvas exists.
5. A layer model is mandatory: every drawn object belongs to exactly one layer with an order index, visibility, and lock flag; the studio shell's "Layers" tool must control that model.
6. The printable area is part of the document: a design is always authored against its product's printable dimensions (the shell hardcodes "12 x 14 inches" today) and that constraint is enforced at render time, not post-hoc.
7. Do not introduce a second canvas library without a written decision; the engine choice (see Evolution Targets) must be shared by all 2D surfaces, including any future POD, art, or packaging editors.

## Evolution Targets

> **Evolution target — NOT in the repo today.**

- **Fabric.js or Konva-based canvas editor**: an interactive object canvas (select/move/scale/rotate objects, text objects, image placement with clipping, shape primitives) replacing the placeholder "T-Shirt Canvas" div. Not present — no canvas dependency exists in `package.json`.
- **PixiJS high-performance rendering**: WebGL-accelerated 2D for large documents (thousands of objects, pattern fills) where DOM/canvas-2d redraw costs dominate. Not present; only relevant once interactive object counts justify it.
- **AI-assisted design flows**: the studio shell's "AI Generate" panel (prompt + style dropdown) currently has no backend — generation must integrate with the KAI ecosystem (see `docs/canvas/05-kai-ai-module.md` and the KAI Chat surface) and land generated images as canvas objects with licensing metadata.
- **Design object model shared across surfaces**: one document format for the POD studio, the art marketplace, and print production so a licensed art-marketplace file can be placed into a POD design without conversion.
- **Thumbnails for marketplaces**: `src/app/pod-marketplace/page.tsx` uses external image URLs today; a design rendering service must produce marketplace thumbnails from the serialized document (see EC-035).

## Checklist

- [ ] Canvas library decision documented and dependency added only with the design decision.
- [ ] POD studio renders an interactive canvas with at least: add text, add image, select/move, delete.
- [ ] Undo/redo buttons operate on a command history.
- [ ] Layer panel operates a real layer model.
- [ ] Design documents serialize to `configuration` on `KpnConfiguratorSession` and reload from it.
- [ ] Canvas component verified client-only and dynamically imported (no SSR construction).
- [ ] Printable-area constraint enforced by the renderer.
- [ ] Grep audit: no static imports of canvas libraries in server components.
