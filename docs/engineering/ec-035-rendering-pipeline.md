# EC-035 — Rendering Pipeline

> **Status:** Active
> **Phase:** D — Universal Design Engine
> **Canonical code:** `src/app/vendor/pod/design-studio/page.tsx`, `src/app/pod-marketplace/page.tsx`, `src/lib/documents/templates.ts`, `src/lib/logistics/customs.ts`, `src/app/api/v1/shipping/customs/route.ts`, `src/components/ui/brand-tokens.ts`
> **Overrides:** `docs/canvas/10-k3d-engine.md` on conflict — the vision of a unified browser-native rendering engine (2D/3D, AR/VR) is an evolution target; this file records the verified rendering pipeline today (browser compositing, static image optimization, server-generated HTML documents).

## Purpose

Define how Kauvex renders design work from document to delivered artifact: canvas output in the browser, static image delivery, server-generated print/document output, and the future pipeline (render services for thumbnails and high-resolution exports, WebGL rendering). The document establishes the current pipeline as the baseline, sets budgets that any future rendering stage must meet, and gates new rendering work behind those budgets.

## Current Truth (in this repo today)

- **Browser-side rendering is HTML/CSS only** — the POD Design Studio (`src/app/vendor/pod/design-studio/page.tsx`, `"use client"`) renders its "T-Shirt Canvas" as a styled `div`; there is no canvas element, no 2D context, and no drawing library (verified: `package.json` has no fabric/konva/pixi; `src/` contains no canvas usage). Configurator wizards (`src/app/configure/`) are the same: form UIs, nothing rendered.
- **Static image optimization** — `next/image` is used for fixed visual assets, e.g., POD marketplace design cards in `src/app/pod-marketplace/page.tsx` serve external image URLs sized via `?w=200&h=200&fit=crop`. There is no dynamic image generation; all visuals are static or external.
- **Server-generated documents (verified)** — `src/lib/documents/templates.ts` exports HTML generators: `generateShippingLabelHtml`, `generateWaybillHtml`, `generateCommercialInvoiceHtml`, `generatePackingListHtml`, `generateFbkStorageStatementHtml`. These are string templates (interfaces at the top of the file define the data shapes) consumed wherever labels/waybills/invoices are needed.
- **Customs documents (verified)** — `src/lib/logistics/customs.ts` exports `estimateDuties`, `generateCommercialInvoice`, `generateCN22`, `generatePackingList` (formulas and HTML/table text generation), exposed via the API route `src/app/api/v1/shipping/customs/route.ts` (POST to generate customs documents). International documentation rules (CN22 below/CN23 above the USD 300 threshold, commercial invoice for commercial sales) are documented in the Phase 14 knowledge base.
- **Styling baseline** — all rendered UI follows `src/components/ui/brand-tokens.ts` (navy `#0A1628`, orange `#FF6B00`, Inter, `rounded-lg`/`rounded-xl`, dark mode disabled).

## Rules

1. Canvas-based rendering must be client-only (`"use client"` + dynamic import) — no canvas construction in server components, API routes, or middleware (see EC-030).
2. Every server-generated document must be produced by a pure function over typed data (the existing `templates.ts` pattern): no document HTML may be assembled inside page components.
3. Document generators must be deterministic: the same inputs produce byte-identical output, because labels/waybills are re-printed on demand.
4. Static imagery uses `next/image` optimization; dynamic render output (evolution target) must flow through a render service with caching keyed by the design document hash.
5. The marketplace critical path may not depend on render services: order/checkout pages must never block on a render; any design thumbnail required at checkout must already exist (rendered and cached at design-save time).
6. Performance budgets below apply to any rendering stage added to the platform; a stage that exceeds budget on the reference device cannot ship.
7. Customs/document output must always be generated server-side with the platform's duty/currency logic (`src/lib/logistics/customs.ts`), never client-computed.

## Evolution Targets

> **Evolution target — NOT in the repo today.**

- **Design thumbnail service**: server-side rendering of POD design documents to PNG/WebP thumbnails (for `src/app/pod-marketplace/page.tsx` and product listing pages), replacing external stock image URLs. Requires the canvas document format from EC-030; service caches by document hash; renders at design-save time.
- **High-resolution export service**: render design documents at print resolution (300 DPI class) off the interactive path — queued, async, with status; see EC-036 for output formats.
- **Server-side canvas renderer**: a headless rendering step (for thumbnail/export services) that consumes the same serialized document JSON as the browser editor, guaranteeing editor-preview-print parity; no such renderer exists.
- **WebGL pipeline**: GPU rendering for 3D scenes (EC-031) and, later, for 2D documents exceeding canvas-2d performance budgets; no WebGL code exists today.
- **Render farms for industry studios**: per the `docs/canvas/08-universal-design-studio.md` vision, industry configurators (boat, house, kitchen) render photorealistic previews of parameters via the `aiRenderUrl` field on `KpnConfiguratorSession` — the field exists, no producer exists.

**Performance budgets (apply to all new rendering stages):**
- Thumbnail render: <= 1.5 s median, 3 s p95 per design document, cached indefinitely by hash.
- High-res export: queued job, target <= 60 s per document at 300 DPI; progress surfaced via job status, not synchronous HTTP.
- Thumbnail payload: <= 120 KB per image; WebP preferred over PNG except when transparency requires it.
- Editor render tick (when a canvas editor ships): <= 16 ms at rest, <= 50 ms during object drag, on a mid-range reference device.
- Render service must scale to 0 instances when idle (serverless) — no always-on GPU fleet.

## Checklist

- [ ] All document generation flows through pure typed generators in `src/lib/documents/templates.ts` (pattern verified).
- [ ] Deterministic re-print verified (same input -> identical output).
- [ ] Design-save triggers thumbnail render + cache (when canvas editor ships).
- [ ] Checkout/order path has no render-service dependency (verified by review).
- [ ] Render service caching keyed by document hash.
- [ ] Budgets enforced at CI for any new rendering stage.
- [ ] `aiRenderUrl` producer exists for configurator sessions (evolution stage gate).
