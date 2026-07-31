# EC-036 — Export System

> **Status:** Active
> **Phase:** D — Universal Design Engine
> **Canonical code:** `src/lib/documents/templates.ts`, `src/lib/logistics/customs.ts`, `src/app/api/v1/shipping/customs/route.ts`
> **Overrides:** `docs/canvas/07-product-configurator-pod.md` and `docs/canvas/08-universal-design-studio.md` on conflict — print-ready POD export and studio multi-format export are evolution targets; this file records the verified export truth (HTML document templates and customs document generation).

## Purpose

Define the export system for Kauvex: every artifact the platform produces for external consumption — shipping labels, waybills, invoices, packing lists, customs documents, and eventually print-ready design files — must be generated through one deterministic, server-side export layer with defined formats, DPI, and color standards. The document records the export functions that exist today and sets the evolution path for design exports (print-ready POD files, multi-format studio export, manufacturing print specs).

## Current Truth (in this repo today)

- **Document templates (verified)** — `src/lib/documents/templates.ts` exports five HTML generator functions over typed inputs:
  - `generateShippingLabelHtml(data: ShippingLabelData)` (line 26) — marketplace shipping labels
  - `generateWaybillHtml(data: WaybillData)` (line 98) — Express courier waybills
  - `generateCommercialInvoiceHtml(data: CommercialInvoiceData)` (line 242)
  - `generatePackingListHtml(data: PackingListData)` (line 361)
  - `generateFbkStorageStatementHtml(data: FbkStorageStatementData)` (line 462)
  The file defines data interfaces (e.g., `ShippingLabelData`, `WaybillData`, `PackingListData`) at the top and returns HTML strings; all outputs are deterministic functions of their inputs.
- **Customs document generation (verified)** — `src/lib/logistics/customs.ts` exports `estimateDuties` (duty estimation), `generateCommercialInvoice`, `generateCN22`, and `generatePackingList` — the CN22 (under USD 300) / CN23 (over USD 300) and commercial invoice rules per the Phase 14 knowledge base. Exposed via POST `src/app/api/v1/shipping/customs/route.ts` (`/api/v1/shipping/customs`).
- **Document terminology (platform rule)** — marketplace orders use shipping labels, Express courier uses waybills, intercity road freight uses consignment notes, air freight uses AWBs, sea freight uses BOLs (Phase 14 terminology in `src/lib/logistics/terminology.ts`). Export functions must respect this naming.
- **No design export exists** — there is no code that exports a design document (POD or configurator) to PDF, SVG, PNG, or any vector format; no print-file generator exists; verified: no canvas/design export module in `src/lib/` and no PDF/vector library in `package.json`.

## Rules

1. All exports are generated server-side by pure functions over typed data (the `templates.ts` pattern); no export HTML/string is assembled inside page components or client code.
2. Exports must be deterministic: identical inputs produce byte-identical output — labels and waybills are re-printed on demand and must match the original.
3. Document type naming follows the platform terminology (`src/lib/logistics/terminology.ts`): shipping label vs waybill vs consignment note vs AWB vs BOL; never interchange them.
4. Customs exports must use the platform's logic in `src/lib/logistics/customs.ts` (duty estimation, CN22/CN23 threshold at USD 300, commercial invoice data) — client-supplied duty amounts or document contents are rejected.
5. Design exports (evolution target) must render from the serialized design document (EC-030/EC-035), never from screen pixels: no screenshot-based export of studio content.
6. Every new export format must declare: MIME type, DPI, color profile, intended device, and size limits — before implementation (see standards below).
7. Export jobs are async when they take longer than ~2 s: queued job with status, not a synchronous HTTP wait.

## Evolution Targets

> **Evolution target — NOT in the repo today. Design-file export does not exist anywhere in the codebase.**

- **Print-ready POD files**: export of POD designs to PDF (300 DPI), PNG (transparency preserved), SVG, and vector formats, generated from the serialized design document by the render service (EC-035); no generator exists today.
- **Multi-format export from studios**: the POD Design Studio (and future configurator previews) offer download/export actions producing the formats above with per-format fidelity guarantees (text-to-outline for print, color profile embedding).
- **Manufacturing print specs**: for POD and packaging printing — nesting/marking output (placeable repeats, registration and trim marks), spot/CMYK separation, and bleed/trim-safe-area metadata derived from the design's printable area (the studio shell hardcodes a 12 x 14 inch printable area today).
- **DPI and color-profile standards**: a written standard (e.g., 300 DPI print export; sRGB for web; CMYK conversion only at the printer integration boundary) — to be published before the first print export ships.
- **Batch export**: export a set of designs (a collection or an order's multiple custom items) as one job with a single archive — for vendors and POD order fulfillment.
- **HTML-to-PDF for documents**: the existing HTML document generators (labels, waybills, invoices, packing lists) may gain a PDF output stage; the HTML generators remain the single source of document content, with PDF as a presentation layer only.

**Standards to publish with the first design export:**
- Raster exports: 300 DPI at target print size; PNG for transparency, JPEG/WebP for photo content.
- Vector exports: SVG with text converted to outlines for print; embed color profile.
- Color: sRGB authored; CMYK conversion deferred to the printer integration; verify-proof required before shipping.
- Size caps: single design export <= 50 MB; batch archive <= 500 MB.

## Checklist

- [ ] All five `templates.ts` generators consumed by their document flows (label, waybill, invoice, packing list, FBK statement).
- [ ] Customs exports flow through `/api/v1/shipping/customs` with server-side duty logic.
- [ ] Terminology respected across all document outputs.
- [ ] Determinism verified (same input -> identical bytes).
- [ ] Print-export standard (DPI, color profile, formats, caps) published.
- [ ] POD design export exists in at least PDF + PNG, rendered from serialized document.
- [ ] Text-to-outline and bleed/trim metadata implemented for print formats.
- [ ] Async export job pattern in place for jobs over 2 s.
