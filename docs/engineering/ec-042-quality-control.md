# EC-042 — Quality Control

> **Status:** Active
> **Phase:** E — Manufacturing Engine
> **Canonical code:** `src/lib/manufacturers/verification.ts`, `src/lib/manufacturers/samples.ts`, `src/lib/manufacturers/disputes.ts`, `src/app/admin/manufacturers/disputes/`
> **Overrides:** nothing

## Purpose

Defines how KCC keeps manufacturing quality trustworthy: factory verification tiers, sample discipline, dispute resolution, and reviews.

## Current Truth (in this repo today)

- **Verification tiers** (`src/lib/manufacturers/verification.ts`): 4-tier system — unverified → document → factory → gold. Each tier requires specific evidence (verify exact requirements in the engine before referencing them in code).
- **Sample orders** (`src/lib/manufacturers/samples.ts`): sample flow before bulk production; sample API `/api/v1/manufacturers/samples`.
- **Disputes** (`src/lib/manufacturers/disputes.ts`): buyer/manufacturer disputes; admin resolution at `/admin/manufacturers/disputes` via `/api/v1/admin/manufacturers/disputes`.
- **Reviews:** manufacturer reviews in portal (`/manufacturers/dashboard/reviews`, reviews API `/api/v1/manufacturers/reviews`).
- **Escrow linkage:** quality failures hold escrow milestones (EC-039) — disputed stages don't release funds.
- **Demo factory:** `manufacturer@kauvex.com` (Shenzhen Precision Electronics, gold-path demo) via `scripts/setup-demo-accounts.js`.

## Rules

1. Verification is evidence-based and admin-approved: tier upgrades require documented proof; the tier is displayed on the public manufacturer profile.
2. Gold/factory tiers may skip samples for repeat orders; unverified factories always go through samples before bulk (enforced in engine).
3. Dispute flow: any party can open; escrow holds the affected milestone; admin resolves with a written decision; resolution is recorded and reflected in review scores.
4. Reviews are only allowed for completed, non-disputed orders (or after dispute resolution) — no review-shopping on open disputes.
5. QC evidence (photos, test reports) attaches to production stages as documents (EC-019 private bucket).
6. Verification revocations are possible (fraud, repeated disputes) and automatically downgrade the profile tier.

## Evolution Targets

> **Evolution target — NOT in the repo today.**
- Inspection checklist templates per category (ISO-style stage gates).
- Third-party inspection integration (booking + reports).
- QC photo upload flow per production stage with buyer sign-off.
- Quality score formula (verification tier × on-time × dispute ratio × reviews).

## Checklist (Definition of Done for this area)

- [ ] Verification evidence-based, admin-approved
- [ ] Sample gate for low-tier factories
- [ ] Dispute holds escrow; resolution recorded
- [ ] Reviews restricted to resolved orders
- [ ] Tier revocations possible
