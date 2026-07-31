# EC-002 — Technology Stack Bible

> **Status:** Active
> **Phase:** A — Engineering Foundation
> **Canonical code:** `package.json`, `next.config.mjs`, `tsconfig.json`, `tailwind.config.ts`, `prisma.config.ts`, `prisma/schema.prisma`, `src/components/ui/brand-tokens.ts`
> **Overrides:** any earlier ad-hoc technology notes; on conflict with AGENTS.md, this document's verified list wins.

## Purpose

This is the single source of truth for what technology the Kauvex Commerce Cloud is allowed to use. Every dependency in `package.json` is classified as Approved, Used Carefully, or an Evolution Target. Nothing enters the codebase unless it is listed here — and adding anything to this list requires updating this document first. The intent: a solo founder plus an AI agent must never drift into a zoo of libraries that the platform does not need.

## Current Truth (in this repo today)

- Framework: Next.js `14.2.35` (App Router), React 18. Build script: `prisma generate && next build`. Dev: `next dev`.
- Language: TypeScript 5, `strict: true` in `tsconfig.json`, path alias `@/*` -> `./src/*`.
- Styling: Tailwind CSS `^3.4.1` (dark mode disabled), shadcn/ui-style primitives in `src/components/ui/` (`button.tsx`, `input.tsx`, `badge.tsx`, `Price.tsx`, `brand-tokens.ts`) built on `class-variance-authority`, `clsx`, `tailwind-merge`, `tailwindcss-animate`.
- Brand: navy `#0A1628` (`kauvex-navy`), orange `#FF6B00` (`kauvex-orange`) defined in `src/components/ui/brand-tokens.ts`; fonts Inter (sans) and JetBrains Mono (mono, tracking numbers); button radius `rounded-lg` (8px), card radius `rounded-xl` (12px).
- ORM: Prisma `^7.8.0` + `@prisma/client` + `@prisma/adapter-pg`; schema `prisma/schema.prisma`; config `prisma.config.ts` (reads `DATABASE_URL`); client output `src/generated/prisma`.
- Database: PostgreSQL on Supabase (project `stbgamqenraauqpgtbkv`); migrations in `supabase/migrations/00001..00046`.
- Auth: Supabase Auth via `@supabase/supabase-js` `^2.108.0` and `@supabase/ssr` `^0.12.0`; clients in `src/lib/supabase/` (`client.ts`, `server.ts`, `admin.ts`, `middleware.ts`).
- Hosting: Vercel (`vercel.json`, `.vercel/`); image optimization via `next/image` with `images.remotePatterns` allowing all `https` hosts.
- Monitoring: Sentry `@sentry/nextjs` `^9.47.1` with `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`.
- Validation: Zod `^4.4.3`; schemas in `src/lib/validators/index.ts`; `validateBody` helper in `src/lib/api-helpers.ts`.
- Icons: `lucide-react` `^1.7.0`. Charts: `recharts` `^3.8.1` (both present in `package.json`, verified).
- Rate limiting: `@upstash/ratelimit` + `@upstash/redis` (present; used via `src/lib/security/rate-limiter.ts`).
- Payments: `stripe` `^22.2.1` (server-side). 2FA TOTP: `otplib`. QR: `qrcode`. Barcodes: `@zxing/browser`, `@zxing/library`. Maps: `leaflet` + `@types/leaflet`. Drag-and-drop: `@dnd-kit/core`, `@dnd-kit/sortable`. Motion: `framer-motion`. State: `zustand`. API docs: `swagger-ui-react`. PWA: `next-pwa`. Direct Postgres tooling: `pg` (+ `@types/pg`).

## Rules

1. No library, package, service, or framework enters the repo unless it is listed in the Approved or Used Carefully table below AND this document has been updated to include it. This is the EC-002 gate; it applies to the AI agent and to the human alike.
2. A library is "Approved" when it is a stable, widely-used building block that we use in its default role. A library is "Used Carefully" when it is present for a specific feature, carries operational weight (external API keys, server-only usage), or has an obvious replacement — use it only where it already is used.
3. Anything in "Evolution Target" must NOT be installed or written today. It is a marker for approved future direction only.
4. Banned items never enter the repo: additional ORMs, alternative auth providers, additional CSS frameworks, dark-mode UI, jQuery or similar legacy helpers, and unmaintained or single-purpose forks.
5. Do not add `NEXT_PUBLIC_` variables for secrets. Client-visible env vars are for public configuration only (e.g. `NEXT_PUBLIC_SUPABASE_URL`).
6. Before citing any package in docs or code review, verify it exists in `package.json`. The tables below were verified against `package.json` at the time of writing.
7. Version drift: minor/patch upgrades of approved packages are allowed when required for security or build health; major upgrades of Next.js, Prisma, or Supabase libraries require user approval and an EC-002 update.
8. The build chain stays: `npm run dev` (dev), `npx prisma generate` (client regen), `npm run build` (Vercel gate). `npm run lint` uses `next lint` (ESLint 8, `next/core-web-vitals` + `next/typescript`); `next.config.mjs` sets `eslint.ignoreDuringBuilds` and `typescript.ignoreBuildErrors` to true, so type validation is done separately with `npx tsc --noEmit` (see EC-009).

## Approved

| Layer | Technology | Where it lives |
|---|---|---|
| Framework | Next.js 14 App Router + React 18 | `src/app/`, `src/middleware.ts` |
| Language | TypeScript 5 (strict) | `tsconfig.json` |
| Styling | Tailwind CSS 3.4 + shadcn/ui-style primitives | `src/components/ui/`, `tailwind.config.ts` |
| ORM | Prisma 7.8 + `@prisma/adapter-pg` | `prisma/schema.prisma`, `prisma.config.ts`, `src/generated/prisma` |
| Database | PostgreSQL (Supabase, project `stbgamqenraauqpgtbkv`) | `supabase/migrations/` |
| Auth | Supabase Auth | `src/lib/supabase/` |
| Storage | Supabase Storage; Cloudflare R2 for backups | `src/lib/security/backups.ts` |
| Hosting | Vercel | `vercel.json` |
| Monitoring | Sentry | `sentry.*.config.ts` |
| Validation | Zod 4 | `src/lib/validators/index.ts` |
| Icons | lucide-react | throughout `src/` |
| Charts | Recharts | analytics dashboards |
| Utility | clsx, tailwind-merge, class-variance-authority | `src/lib/utils.ts`, `src/components/ui/` |
| Styling helper | tailwindcss-animate | `tailwind.config.ts` |

## Used Carefully

| Package | Purpose | Caution |
|---|---|---|
| `@upstash/ratelimit` + `@upstash/redis` | API rate limiting via `src/lib/security/rate-limiter.ts` | Server-side only; external account needed |
| `stripe` | Card payments | Server-side only; keys via Vercel env vars |
| `pg` | Direct Postgres access in scripts/tooling | Never for app queries; Prisma is the app ORM |
| `otplib`, `qrcode` | 2FA TOTP setup | Server-side only |
| `@zxing/browser`, `@zxing/library` | Barcode scanning | Client-side feature module |
| `leaflet` | Maps (fuel stations, tracking) | Client-side; lazy-load |
| `framer-motion` | Motion/animations | Use sparingly; respect reduced-motion |
| `zustand` | Client state | Only for genuinely shared client state |
| `@dnd-kit/core`, `@dnd-kit/sortable` | Drag-and-drop UIs | Used in A+ Content / builder UIs |
| `next-pwa` | PWA service worker (`/sw.js`) | Watch build-size impact |
| `swagger-ui-react` | API documentation page | `src/app/api/docs` style usage |
| `@supabase/ssr` | SSR cookie sessions | Used by `src/lib/supabase/server.ts` + `src/lib/supabase/middleware.ts` |

## Banned

- Any ORM other than Prisma; raw SQL in application code (SQL lives only in `supabase/migrations/`).
- Any auth provider other than Supabase Auth (Clerk, Auth0, Kinde, etc. — integration skills exist but the platform stays on Supabase).
- Any CSS framework beside Tailwind (no Bootstrap, no Material UI).
- Dark mode / theme toggling (explicitly disabled at launch per AGENTS.md).
- jQuery, Lodash-style kitchen sinks, unmaintained forks.

## Evolution Targets

> **Evolution target — NOT in the repo today.**
- NestJS (or equivalent) service layer for background processing.
- Redis + BullMQ queue infrastructure.
- Monorepo/multi-package structure (e.g. Turborepo or pnpm workspaces).
- Vitest unit test framework (see EC-009).
- Playwright end-to-end testing.
- Dedicated LLM provider SDKs beyond the OpenRouter integration in `src/lib/ai/openrouter.ts`.

## Checklist

- [ ] Every dependency cited in docs, code review, or planning is in `package.json`.
- [ ] New packages went through the EC-002 gate (doc updated, user approved).
- [ ] No banned item in dependencies or imports.
- [ ] Secrets are never `NEXT_PUBLIC_`; server-side only.
- [ ] Build, typecheck, and lint commands run clean before a feature is Done.
