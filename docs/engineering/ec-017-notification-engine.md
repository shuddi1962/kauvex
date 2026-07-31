# EC-017 — Notification Engine

> **Status:** Active
> **Phase:** B — Platform Architecture
> **Canonical code:** `src/lib/email/templates.ts`, `src/lib/notifications/`, `src/components/notifications/in-app-notification.tsx`, `src/lib/documents/templates.ts`
> **Overrides:** nothing

## Purpose

Defines how KCC reaches users: transactional email, SMS, push, and in-app notifications — one template system, one sending path, per-channel preference control.

## Current Truth (in this repo today)

- **Email:** `src/lib/email/templates.ts` — email master + transactional templates (order confirmations, shipping updates, BNPL schedules, cashback, affiliate payouts, recovery sequences like the 3-stage abandoned-cart sequence).
- **SMS:** `src/lib/notifications/sms-templates.ts` — SMS templates (delivery alerts, OTPs, payment confirmations).
- **Push:** `src/lib/notifications/push-templates.ts` — push template definitions.
- **In-app:** notification centre component `src/components/notifications/in-app-notification.tsx`; in-app feed surfaces in dashboards.
- **Document notifications:** labels, waybills, invoices, packing lists, FBK statements via `src/lib/documents/templates.ts`.
- Sending providers are configured via server env vars (server-side only); templates live in code, not in the database, so they're versioned with the app.

## Rules

1. All notifications use the template modules — never inline email/SMS copy in route handlers.
2. Sending is server-side; provider keys live in Vercel env vars (EC-007).
3. Transactional notifications (orders, payments, BNPL) are mandatory; marketing/promotional sends must respect user preferences where such toggles exist.
4. Templates keep the KAI/brand voice: direct, warm, short sentences, no all-caps in body text, no vague errors (AGENTS.md voice rules).
5. New notification types = new template entry + template test (render + send smoke test before merge).
6. Document generation (labels/waybills/invoices) reuses `src/lib/documents/templates.ts`; do not duplicate document markup in notification code.
7. Channel selection is explicit in the call site (email/SMS/push/in-app), never ambient.

## Evolution Targets

> **Evolution target — NOT in the repo today.**
- Notification preferences centre (per-channel opt-in/out per category).
- Template A/B testing and template localization beyond the fixed storefront languages.
- Webhook-based notification delivery to third parties (use K Platform webhooks, EC-015).

## Checklist (Definition of Done for this area)

- [ ] Template added to the right module (email/sms/push)
- [ ] Provider keys server-side only
- [ ] Brand voice respected
- [ ] Smoke-tested send
