# SYSTEM ARCHITECTURE — KAUVEX UNIVERSAL DESIGN STUDIO

> Supplement (unnumbered) — The proposed module architecture, derived from a full audit of the existing Kauvex codebase. This is the blueprint the coding agent follows. Nothing in here may break existing functionality. Complements Canvas 2 (Universal Design Engine) and Canvas 3 (Workspace UI).

---

## 1. AUDIT SUMMARY (WHAT ACTUALLY EXISTS)

### 1.1 Reality check vs the vision

The vision (Canvas 01) is huge. The audit shows:

| Area | Reality today |
|---|---|
| POD backend | **Real** — `src/lib/pod.ts` + `/api/v1/pod` (designs, products, orders, licenses, analytics). `PodDesign.artworkData` JSON field exists, never written |
| POD Design Studio UI | **Static shell** — toolbar with no handlers, gray div as canvas, no state, no save |
| Configurators (`/configure/*`) | **Static step wizards** with inline math duplicated 8×; only boat calls an API (compute only). No 3D anywhere (kitchen shows placeholder text) |
| Canvas/3D libraries | **None installed** — no fabric, konva, three, R3F |
| AI | **Text-only** — OpenRouter (gpt-4o-mini) with `generateJSON<T>`; embeddings via OpenAI. **No image generation, no vision** |
| Uploads | **base64 data-URLs stored in DB** — no Supabase Storage usage anywhere in src/ |
| Manufacturer network (Phase 24) | **Real and deep** — RFQ broadcast, quotes, AI quote drafting, 8-stage production pipeline, milestone escrow, samples, disputes, hubs, reviews |
| Session model | `KpnConfiguratorSession` was clearly designed for studio→builder flow (BOM, cost min/max, status draft→quoted→ordered→in_production, selectedBuilderId) — **barely used, save endpoint broken** |
| Projects/bookings | Real lib + APIs; checkout not wired; project hub demo-heavy |
| Notifications | Template registries exist (email/SMS/push) but **no send dispatcher** |
| RBAC | `src/lib/permissions.ts` exists but is **not wired** into pages/APIs |

### 1.2 Pre-existing bugs to fix (blockers for this module)

1. `POST /api/v1/kpn/configurators/save` writes non-existent `result`/`name` fields — **fails at runtime**. Must persist `billOfMaterials`, `costEstimateMin/Max`, `status`.
2. `/configure/boat/quote` — **404**, but boat page links to it.
3. `acceptQuote()` exists in lib but **no API route** — buyers cannot accept quotes via API.
4. `MfgEscrow` release is ledger-less — no wallet debit/credit (TODO in `escrow.ts`); `PayWallet.reservedBalance` never used.
5. `kv_mfg_orders` ↔ `orders`/`shipments` disconnected — production handoff to shipping needs the glue.
6. No notification dispatcher — templates are dead code.

---

## 2. MODULE NAME & CONVENTIONS

- **Module name:** `DesignStudio` — Prisma models `Usd*` (Universal Studio) mapped to `kv_usd_*`
- **Filesystem:** `src/lib/studio/` (engine, tools, materials, templates, sessions, production-handoff), `src/components/studio/` (shared editor UI), `src/app/studio/` (public entry + each studio)
- **API:** `/api/v1/studio/*` (+ `/api/v1/admin/studio/*` guarded by `requireAdmin`)
- **State:** zustand stores in `src/store/` (`design-editor-store.ts`, `studio-ui-store.ts`)
- **Migration:** `supabase/migrations/000NN_kcc_phaseNN_universal_design_studio.sql`

Platform conventions (from audit) are law:
- Prisma: PascalCase models, `@@map("kv_usd_*")`, camelCase fields with `@map`, `String` statuses + CHECK constraints (no enums), `idx_kv_usd_*` indexes, `@db.Decimal`, `Json @default("{}")`
- Lib: feature-folder modules, plain `async function verbNoun(input)` exports, input interfaces, `prisma.$transaction` for multi-writes, no internal try/catch, barrel `index.ts`
- API: `export const dynamic = "force-dynamic"`, helpers from `@/lib/api-helpers` (`getAuthUser`, `requireAdmin`, `requireVendor`, `validateBody`, `successResponse`, `errorResponse`, `paginatedResponse`), inline zod schemas with `.strict()`, action-suffix sub-routes
- Pages: `"use client"`, `useState`/`useEffect` fetch with mock fallback, `Loader2` loading, lucide icons, brand classes
- Prisma client: `import prisma from "@/lib/db"`
- New models are added to the single `prisma/schema.prisma`; `npx prisma generate` outputs to `src/generated/prisma`

---

## 3. NEW DEPENDENCIES (justified, minimal)

| Package | Purpose | Loading |
|---|---|---|
| `fabric` (v6) | 2D vector/raster design engine (tools, layers, history, export) | `next/dynamic` client-only, lazy |
| `three` + `@react-three/fiber` + `@react-three/drei` | 3D engine (orbit, materials, environment, previews) | `next/dynamic` client-only, lazy |
| `@supabase/ssr` storage (already a dep) | Supabase Storage uploads for print-res assets | server helper + signed URLs |
| `sharp` (optional, server) | Image processing for mockups/resizing | server-only |

No AI-image SDK in the client. KAI image generation goes through our own `/api/v1/studio/ai/*` routes (provider-agnostic: Replicate/OpenAI images/Stability behind one lib module).

CSP (`next.config.mjs`) already allows `img-src 'self' data: blob: https:` and `images.remotePatterns` allows all https — canvas exports and generated images work. Verified.

---

## 4. DATA MODEL (NEW — `kv_usd_*`)

```
kv_usd_designs          — universal design document (one row per saved design)
  id, userId, vendorId?, designType (pod|fashion|print|boat|architecture|furniture|marine|dredging|solar|cctv),
  name, description, thumbnailUrl, preview3dUrl?, artworkData Json, layers Json,
  dimensions Json (width/height/unit), canvasVersion Int,
  productTemplateId?, printAreas Json, materialAssignments Json,
  status (draft|published|archived), isPublic, licenseType, price?, licenseCount Int,
  versionCount Int, currentVersion Int, sharedWith Json?, createdAt, updatedAt

kv_usd_design_versions   — version control (undo/redo beyond history stack)
  id, designId FK, version Int, snapshot Json, note, createdBy, createdAt

kv_usd_materials         — Material Engine registry (seed ~30 materials)
  id, name, category (wood|steel|glass|plastic|leather|fabric|carbon|fiberglass|concrete|tile|marble|granite|paint|metal|rubber|ceramic|composite|other),
  textureUrl, colorHex, density Decimal (kg/m3), costPerUnit Decimal, costUnit, weightPerUnit,
  strengthScore Int, finish, sustainabilityScore Int, supplierId?, manufacturerId?, status

kv_usd_product_templates — POD/print product definitions with print areas
  id, name, category (apparel|accessories|drinkware|stationery|packaging|signage|vehicle|home|electronics),
  basePrice Decimal, baseCost Decimal, fulfillmentPartner?, mockupData Json, printAreas Json
  [{key, label, x,y,width,height,unit,image, isRequired, maxSizeMb}],
  placements Json [{surface, 3dMesh?}], variants Json, image, status

kv_usd_sessions          — studio session (replaces reliance on KpnConfiguratorSession for studios)
  id, userId, studioType, designId?, configuration Json, billOfMaterials Json,
  costEstimateMin/Max Decimal, currencyCode, status (draft|quoted|ordered|in_production|completed),
  quotesReceived Int, selectedBuilderId?, selectedManufacturerId?, createdAt, updatedAt

kv_usd_simulations       — simulation runs (log)
  id, sessionId/designId, simulationType (drape|buoyancy|sunlight|energy|coverage|weight|bleed|resolution),
  parameters Json, results Json, createdAt

kv_usd_production_requests — studio → manufacturing network handoff
  id, userId, sessionId?, designId?, studioType, productTemplateId?, quantity,
  manufacturerIds Json, status (draft|sent|quoted|selected|in_production|quality_control|shipped|delivered|cancelled),
  inquiryIds Json (links kv_mfg_inquiries), selectedQuoteId?, orderId?, mfgOrderId?, createdAt, updatedAt
```

Plus indexes on `(userId, designType)`, `(userId, status)`, `(designId, version)`, `(sessionId)`, `(userId, studioType)`.

### Reused as-is (NO new tables)
- `KpnConfiguratorSession` — keep for legacy; new studios use `kv_usd_sessions`
- `PodDesign`, `PodProduct`, `PodOrder`, `DesignLicense` — POD commerce stays
- `MfgInquiry`, `MfgQuote`, `MfgOrder`, `MfgEscrow`, `MfgSample`, `MfgDispute`, `MfgReview`, `MfgHub` — manufacturing network
- `KpnProject`, `KpnProjectBid`, `KpsServiceBooking`, `KpnDigitalTwin` — builders/installers/projects
- `PayWallet`, `PayTransaction` — escrow money movement (to be wired)
- `Order`, `OrderItem`, `Shipment` — production → shipping handoff
- `Review`, `StoreReview`, `MfgReview` — ratings patterns

---

## 5. MODULE ARCHITECTURE (LAYERS)

### Layer 1 — Universal Design Engine (`src/lib/studio/` + `src/components/studio/`)

```
src/components/studio/
  canvas/          StudioCanvas (fabric wrapper), Toolbar, PropertiesPanel, LayersPanel, ColorPicker, ExportMenu
  three/           StudioViewport (R3F scene), MaterialPicker, CameraControls, EnvironmentPreset
  shared/          StudioShell (workspace layout), ToolButton, SwatchGrid, UploadDropzone, AiPanel, BOMPanel, CostEstimatePanel
src/lib/studio/
  engine.ts        createDesign, openDesign, exportDesign (PNG/SVG/PDF), version snapshot/restore
  tools.ts         tool registry (select, pen, pencil, shapes, text, gradient, pattern, align, distribute, guides, snapping)
  history.ts       undo/redo stacks (command pattern), persisted to kv_usd_design_versions
  layers.ts        layer model ops (add/group/duplicate/reorder/visibility/lock)
  materials.ts     material CRUD + catalog (kv_usd_materials), suggestion engine by category
  simulations.ts   simulation dispatcher (bleed/safe-zone/resolution for print; stub API for 3D sims)
  session.ts       kv_usd_sessions CRUD + status transitions
  export.ts        canvas export pipeline (fabric → blob → storage → URL)
```

Rules:
- The 2D engine is one component (`StudioCanvas`) — studios configure it (toolset, guides, aspect) via props, never fork it
- The 3D engine is one component (`StudioViewport`) — studios provide scene data, not code
- Every studio = `StudioShell + StudioCanvas/StudioViewport + studio-specific panels + BOM config`
- Editor state in `src/store/design-editor-store.ts` (zustand): objects, selection, history, tool, zoom, activeStudio

### Layer 2 — KAI (`src/lib/studio/ai.ts` + `/api/v1/studio/ai/*`)

All calls server-side. Provider-agnostic lib `src/lib/ai/image.ts` (new):
- `generateImage(prompt, size)` — Replicate (Flux/SD) with OpenRouter/OpenAI fallback
- `removeBackground(imageUrl)` — Replicate/rembg-style
- `vectorizeImage(imageUrl)` — tracing (potrace-style service)
- `generatePattern(texturePrompt)` / `generateTexture(prompt)`
- `generateMockup(designUrl, productTemplateId)` — compose layers server-side
- `generateVariants(designId, count)` — prompt variations on a base design
- `analyzeDesign(designId)` — print-error/manufacturing-issue detection (vision model; fallback = rule checks on bleed/DPI/margins)
- `estimateCost(designId, qty)` — rules + BOM + material catalog
- `generateBom(configuration, studioType)` — wrap existing `lib/kpn` configurator math + materials catalog
- `recommendManufacturers(configuration)` — score `MfgManufacturer` rows by category/capability/trustScore
- `recommendBuilders(configuration)` — score `KpnProfessional` rows by serviceType/verificationTier/coverageArea

The existing `/api/v1/kpn/configurators` compute endpoint and `lib/kpn` calculators are **not** replaced — KAI cost/BOM wraps them.

### Layer 3 — Studios (`src/app/studio/<studio>/`)

Each studio page is a thin composition:

| Studio | Route | 2D/3D | Unique panels | BOM source |
|---|---|---|---|---|
| Print | `/studio/print` | 2D | artboards, CMYK guide, bleed guides | template catalog |
| POD | `/studio/pod` (replaces `/vendor/pod/design-studio`) | 2D + 3D mockup | print-area picker, mockup preview, variant generator | `PodProduct` baseCost |
| Fashion | `/studio/fashion` | 2D (pattern) + 3D | pattern pieces, fabric swatches, stitch types | fabric × qty |
| Boat | `/studio/boat` | 3D | hull/cabin/deck/engine/seat/nav/paint configurators | `boatConfigurator` |
| Architecture | `/studio/architecture` | 2D floor plan + 3D walkthrough | rooms, roof, windows, doors, materials | `houseConfigurator` + takeoff |
| Furniture | `/studio/furniture` | 2D + 3D | cabinets, cutting list, CNC export | `kitchenConfigurator` |
| Marine | `/studio/marine` | 3D | equipment/accessories/safety/nav catalogs | equipment BOM |
| Dredging | `/studio/dredging` | 2D schematic | pipeline layout, pump selection, production | `dredgingConfigurator` |
| Solar | `/studio/solar` | 2D roof layout + 3D | panel/battery/inverter placement | `solarConfigurator` |
| CCTV | `/studio/cctv` | 2D map + coverage overlay | camera placement, blind-spot sim, cable routing | `cctvConfigurator` |

The existing `/configure/*` pages stay untouched (legacy); new `/studio/*` pages supersede them. The 3 legacy configurators for security/farm stay as-is.

### Layer 4 — Manufacturing Network handoff (`src/lib/studio/production.ts` + `/api/v1/studio/production/*`)

Flow: `kv_usd_sessions (draft)` → user clicks "Get quotes" → `kv_usd_production_requests (sent)` → creates `MfgInquiry` rows (broadcast, reusing `/api/v1/manufacturers/rfq` logic) → manufacturer quotes → user picks → **fix + expose `acceptQuote` API route** → `MfgOrder` + `MfgEscrow` (deposit 30%) → production stages → QC → pack → **new glue:** create `Shipment` via `/api/v1/shipping/labels` and link `MfgOrder.trackingNumber` + `shipmentId` → mark delivered → **new glue:** escrow release credits manufacturer `PayWallet` via `transferBetweenWallets` and debits buyer (fix the ledger-less TODO).

Production request progress mirrors on the design page (status pill + timeline).

### Layer 5 — Marketplace & Commerce

- Designers/printers/POD providers/makers can publish designs: `kv_usd_designs.isPublic = true` + `licenseType` + `price`
- Public marketplace: `/studio/marketplace` (filter by studioType/category/price; purchase via `DesignLicense`-style flow — reuse `lib/pod.ts` `purchaseDesignLicense` pattern or generalize)
- Licenses flow into POD products (`PodProduct.designId`)
- Reviews: reuse `MfgReview` for makers; product reviews via existing `Review` once a design becomes a product

### Layer 6 — Admin (`/admin/studio/*` + `/api/v1/admin/studio/*`)

- `/admin/studio/designs` — all designs, status management, takedown
- `/admin/studio/materials` — material catalog CRUD, supplier/manufacturer links
- `/admin/studio/templates` — POD/print product templates + print areas CRUD
- `/admin/studio/sessions` — session oversight (reuse admin `configurators` page pattern)
- `/admin/studio/production` — production request oversight, dispute escalation (reuse mfg disputes)
- `/admin/studio/ai` — AI job log, credits/limits, provider status

### Layer 7 — Cross-cutting

- **Notifications:** build `src/lib/notifications/dispatch.ts` (`sendEmail` via Resend — pattern exists in `cart-recovery.ts`; `sendSms`; push later). New templates: quoteReceived, quoteAccepted, productionStageUpdate, escrowRelease, designLicensed, mockupReady
- **Permissions:** add `studio` resource to `RESOURCES` + `ROLE_DEFINITIONS` in `src/lib/permissions.ts`, seed via `/api/setup/seed-roles`
- **Uploads:** new `src/lib/studio/storage.ts` — Supabase Storage bucket `studio-assets` (public read, private write via signed URLs), scan with `lib/security/file-scan.ts` (VirusTotal/Sightengine) before accepting; store URLs not base64
- **Navigation:** header mega-menu "Create" dropdown; footer "Explore" links; admin sidebar "Design Studio" section; vendor sidebar "Studio" group; sitemap entries
- **SEO:** `generateBrandPageHead` + new sub-brand `studio` in `brand-tokens.ts`
- **Performance:** all canvas/3D/AI components behind `next/dynamic` + `ssr: false`; design documents versioned (snapshot on save) so open operations are cheap; paginated lists everywhere

---

## 6. IMPLEMENTATION ORDER (INCREMENTAL, TESTED AT EACH STEP)

**Step 0 — Foundation**
- Install `fabric`, `three`, `@react-three/fiber`, `@react-three/drei` (+ `@types`)
- Migration `000NN` (all `kv_usd_*` tables + RLS + seeds for ~30 materials + 6 product templates)
- `npx prisma generate`; `src/lib/studio/` skeleton (storage, materials, sessions)
- Supabase bucket `studio-assets` + upload API
- Verify: `npm run build` passes; nothing else touched

**Step 1 — Fix pre-existing blockers**
- Fix `/api/v1/kpn/configurators/save` (persist BOM/cost/status), fix `/configure/boat/quote` link, expose `acceptQuote` route, wire escrow→wallet movement (behind feature flag), add notification dispatcher
- Verify: configurator save works end-to-end; mfg quote acceptance creates funded escrow + wallet debits

**Step 2 — Universal 2D Engine (core canvas)**
- `StudioCanvas`, tool registry, layers, history, export (PNG/SVG), version snapshot
- Replace POD Design Studio shell with real editor; save/load via `kv_usd_designs` + keep `PodDesign.artworkData` sync
- Verify: draw → save → reopen → export; undo/redo; versions

**Step 3 — POD Studio v1**
- Product templates + print-area guides (bleed/safe zones), mockup panel (front/back/sleeve), variant generator, uploads via storage
- Verify: full POD flow from template → design → product → order

**Step 4 — 3D Engine + previews**
- `StudioViewport` (orbit/pan/zoom/materials/environment), garment & boat scene templates, 360 mockup renders, solar/cctv 3D overlays
- Verify: 3D preview renders from a design document

**Step 5 — KAI**
- `lib/ai/image.ts` (generate, remove bg, vectorize, pattern/texture, mockup, variants, analyze)
- KAI panel wired in every studio; cost/BOM via wrapped configurator math
- Verify: generate → place → save → export; analyze flags bleed/DPI issues

**Step 6 — Studios (one by one, in order):** Print → Fashion → Boat → Architecture → Furniture → Marine → Dredging → Solar → CCTV. Each: page composition + studio panels + BOM + simulation + session persistence + quote handoff button.

**Step 7 — Manufacturing handoff**
- `production.ts`, production request UI, quote selection, order+escrow creation, production timeline mirror, shipment handoff, wallet release, notifications
- Verify: full loop design → RFQ → quote → order → production → QC → ship → pay

**Step 8 — Marketplace + licensing**
- `/studio/marketplace`, publish/license/purchase, designer profiles (reuse partner/creator patterns)

**Step 9 — Admin + nav + SEO + performance pass**

**Step 10 — Docs:** update AGENTS.md (Key Directories, Build Status, Knowledge Base for the new phase), add remaining canvas documents as each subsystem lands (03 engine, 04 KAI, 05 studios, 06 production-handoff, 07 admin).

---

## 7. RISKS & GUARDRAILS

1. **fabric/three bundle size** — must be `next/dynamic`, client-only, never imported in server components or API routes
2. **Escrow wallet changes** — gate behind feature flag; run on existing mfg escrow routes, never reorder money without transaction wrapper
3. **Existing pages must not change behavior** — `/configure/*` untouched; POD pages only gain functionality (the design-studio page is replaced by the real editor)
4. **Migration numbering** — next free slot per `supabase/migrations/` (highest is 00041); use `00042_kcc_phase29_universal_design_studio.sql` or next gap per convention
5. **Storage vs base64** — new uploads go to storage; existing base64 flows untouched
6. **RLS** — every new table gets `ENABLE ROW LEVEL SECURITY` + owner/admin policies, matching `00038` patterns
