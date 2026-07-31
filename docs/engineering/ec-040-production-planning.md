# EC-040 — Production Planning

> **Status:** Active
> **Phase:** E — Manufacturing Engine
> **Canonical code:** `src/lib/manufacturers/production.ts`, `src/app/api/v1/manufacturers/production/`, `src/app/manufacturers/dashboard/production/`, `src/app/admin/manufacturers/`
> **Overrides:** nothing

## Purpose

Defines how production orders move through the manufacturer portal: the 8-stage pipeline, status transitions, milestone releases, and notifications.

## Current Truth (in this repo today)

- **Production tracker:** 8-stage pipeline implemented in `src/lib/manufacturers/production.ts` (verify exact stage names in that file before referencing them in code — read it first).
- **API:** `/api/v1/manufacturers/production` (list/update production orders; stage transitions validated server-side).
- **Portal:** `/manufacturers/dashboard/production` — manufacturer production management; admin sees production activity in `/admin/manufacturers/`.
- **Milestone escrow:** production milestones release funds from escrow (Kauvex Pay wallet integration via `src/lib/pay/wallet.ts`) — see EC-039; releases happen only on confirmed stage completion.
- **DB:** `kv_mfg_*` tables (production order statuses, quantities, dates) — verify exact model names in `prisma/schema.prisma` (grep `kv_mfg_`).
- Related: sample orders (`src/lib/manufacturers/samples.ts`), disputes (`disputes.ts`), inquiries → quotes → orders flow (`inquiries.ts`, EC-037).

## Rules

1. Stage transitions are validated server-side in the engine — a stage may only advance to its defined next stage; no client-driven skips.
2. Milestone escrow releases happen only after the buyer/manufacturer confirms the stage (per EC-039 escrow rules) — never auto-release without confirmation.
3. Every transition is recorded (status + timestamp); production history is visible to buyer and admin.
4. Notifications on stage change use the notification engine (EC-017).
5. Production quantities/prices are Decimal; no float arithmetic on money (EC-011 Rule 6).
6. Admin can intervene (force-advance, hold) via the admin API with audit trail — regular users cannot.
7. Batch scheduling/planning stays out of request handlers; long calculations are evolution targets.

## Evolution Targets

> **Evolution target — NOT in the repo today.**
- Capacity planning: factory calendars, machine load, lead-time estimation.
- Automated scheduling (production date assignment by capacity).
- Production analytics (on-time rate, WIP aging) dashboards.
- Buyer production-timeline subscription (email/notification updates per stage).

## Checklist (Definition of Done for this area)

- [ ] Transition rules enforced in engine
- [ ] Escrow release gated on confirmation
- [ ] Transitions logged with timestamps
- [ ] Notifications on stage change
- [ ] Admin override path with audit
