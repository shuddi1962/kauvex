# EC-019 — File & Asset Storage

> **Status:** Active
> **Phase:** B — Platform Architecture
> **Canonical code:** `src/lib/security/file-scan.ts`, `src/lib/security/backups.ts`, `src/app/admin/brand/`, `src/components/admin/brand-asset-portal.tsx`, `next.config.mjs`
> **Overrides:** nothing

## Purpose

Defines where files live, how they're secured, and how uploads stay safe: Supabase Storage for app assets, Cloudflare R2 for backups, file scanning before persistence, and next/image for delivery.

## Current Truth (in this repo today)

- **Application storage:** Supabase Storage buckets (private/public per use case): product images, brand assets, documents (waybills, invoices), uploads (vendor listings, manufacturer samples, KAI company-brain documents).
- **Upload security:** `src/lib/security/file-scan.ts` — VirusTotal (malware) + Sightengine (content moderation) scanning before files become permanent. Required for all user uploads.
- **Backups:** Cloudflare R2 via `src/lib/security/backups.ts` — backup lifecycle management (create, verify, prune); daily independent backup cron at `/api/cron/independent-backup`; admin dashboard `/admin/security/backups`.
- **Brand assets:** admin portal `/admin/brand/assets` (upload/manage), partner downloads `/partners/dashboard/brand-assets`, download tracking via `kv_brand_asset_downloads` (Phase 17).
- **Image delivery:** `next/image` optimization for public assets; no unoptimized oversized images in pages (EC-008 Rule 6).
- **Generated documents:** shipping labels, waybills, invoices, customs docs generated server-side (`src/lib/documents/templates.ts`, `/api/v1/shipping/customs`).

## Rules

1. All user uploads pass through `file-scan.ts` before being treated as trusted content. Reject on malware; flag on policy violations.
2. Buckets are private by default; only genuinely public assets (product images, brand logos) are exposed publicly.
3. Backup files live in R2 with lifecycle rules; backup status is visible in `/admin/security/backups`; restores are manual + verified.
4. Sensitive documents (identity files, commercial invoices) live in private buckets and are served through guarded routes, not public URLs.
5. Generated documents are produced by `src/lib/documents/templates.ts` — never inline file generation in handlers.
6. Storage keys/URLs follow tenant scoping (vendor/organization/business prefix in object keys).
7. File size/type limits enforced at upload time (validate + scan); oversized uploads rejected before storage.

## Evolution Targets

> **Evolution target — NOT in the repo today.**
- Dedicated CDN (Cloudflare) in front of public buckets.
- Server-side image transformation pipeline (on-the-fly resize variants).
- Asset versioning and watermarking for premium brand assets.

## Checklist (Definition of Done for this area)

- [ ] Uploads scanned (VirusTotal + Sightengine)
- [ ] Bucket privacy matches content sensitivity
- [ ] Tenant prefix on object keys
- [ ] Documents generated via templates module
- [ ] Backups covered by R2 lifecycle
