# EC-004 — Coding Standards

> **Status:** Active
> **Phase:** A — Engineering Foundation
> **Canonical code:** `tsconfig.json`, `.eslintrc.json`, `src/lib/api-helpers.ts`, `src/components/ui/brand-tokens.ts`, `src/components/ui/button.tsx`, `src/middleware.ts`
> **Overrides:** any earlier style guidance in AGENTS.md on conflict.

## Purpose

This document defines how code is written in the Kauvex Commerce Cloud: TypeScript strictness, React component conventions, database access rules, naming, branding, accessibility, and error handling. The goal is a codebase where a solo founder and an AI agent can produce consistent, reviewable code without style debates — and where every new file looks like it belongs.

## Current Truth (in this repo today)

- `tsconfig.json`: `strict: true`, `target es2017`, `moduleResolution: "bundler"`, `jsx: "preserve"`, path alias `@/*` -> `./src/*`.
- `.eslintrc.json`: extends `next/core-web-vitals` and `next/typescript`; `@typescript-eslint/no-explicit-any` is OFF, `no-unused-vars` is a warning, `@next/next/no-img-element` is a warning. `next.config.mjs` sets `eslint.ignoreDuringBuilds: true` and `typescript.ignoreBuildErrors: true`, so lint and typecheck are separate gates (see EC-009).
- API helpers in `src/lib/api-helpers.ts`: `successResponse(data, status)`, `errorResponse(message, status, details)`, `paginatedResponse(data, total, page, limit)`, `getAuthUser(request)`, `requireAdmin(request)` (roles `super-admin`, `admin`, `finance-admin`, `support-admin`), `requireVendor(request)`, `validateBody(request, zodSchema)`.
- Brand tokens in `src/components/ui/brand-tokens.ts`: navy `#0A1628`, orange `#FF6B00` (plus tints and sub-brands); fonts Inter (sans) and JetBrains Mono (mono); no dark mode.
- `src/components/ui/button.tsx` exports `Button` + `buttonVariants` (cva): variants `default`/`primary`/`cta`/`orange` (orange bg, white text), `secondary`/`navy` (navy bg, white text), `outline`, `ghost`, `link`, `destructive`, `success`, `outline-orange`, `outline-navy`, `ghost-orange`, `ghost-navy`; sizes `sm`/`default`/`lg`/`xl`/`icon`; radius `rounded-lg`; focus ring `kauvex-orange`.
- Components in `src/components/ui/`: `button.tsx`, `input.tsx`, `badge.tsx`, `Price.tsx`, `brand-tokens.ts`.
- Prisma client generated to `src/generated/prisma`; app DB access via `src/lib/prisma.ts` / `src/lib/db.ts`. SQL lives only in `supabase/migrations/`.

## Rules

### TypeScript

1. Write strict TypeScript; no `any` in new code (the ESLint exemption exists for legacy files — do not widen it). Prefer precise types, Zod-inferred types for payloads, and Prisma-generated types from `src/generated/prisma`.
2. Use `@/` path alias for all internal imports. Relative imports only within the same directory when clearer.
3. Type props of components; prefer exported prop types on the component (see `ButtonProps` in `src/components/ui/button.tsx`).
4. `npx tsc --noEmit` must pass before a task is Done.

### React and Server Components

5. Server components by default: fetch data in server pages/route handlers, render markup, and add `"use client"` ONLY when the component needs hooks, event handlers, or browser APIs.
6. Interactive pieces are small client islands. Do not make whole pages client components to save a few props.
7. Components render from props or server-fetched data; client components fetch via API routes (`/api/v1/...`) or receive data as props.
8. Use the existing component library: `Button`, `Input`, `Badge` from `src/components/ui/`, brand tokens from `brand-tokens.ts`. Do NOT rebuild buttons, inputs, or badges inline.

### Database Access

9. Application code queries the database through Prisma only. No raw SQL strings in `src/` (raw SQL is allowed exclusively in `supabase/migrations/` and `scripts/` tooling).
10. Model changes are appends to `prisma/schema.prisma` paired with a new migration in `supabase/migrations/` (EC-003, EC-010).
11. Avoid N+1: use Prisma `include`/`select` for relations. Fetch lists with pagination (`paginatedResponse` from `src/lib/api-helpers.ts`).

### Naming

12. Files and directories: kebab-case (`route.ts`, `shipping-automation.ts`). Functions and variables: camelCase. Components and types: PascalCase. Constants: SCREAMING_SNAKE or `as const` objects (see `BRAND` in `brand-tokens.ts`).
13. Route handler files are named `route.ts`; page files `page.tsx`; layouts `layout.tsx`. API groups under `src/app/api/v1/<group>/`.
14. Prisma models are PascalCase singular (`Profile`, `KaiBusiness`); DB tables are snake_case (`kv_kai_businesses`); fields map via `@map` where needed.
15. No code comments unless the user asks for them. Comments that do exist must explain WHY, never what.

### Styling and Brand

16. Use Tailwind utility classes with brand tokens: `bg-kauvex-navy`, `bg-kauvex-orange`, text on navy must be white. Primary CTA: orange background + white text. Secondary: navy background + white text.
17. Radii: buttons `rounded-lg` (8px), cards `rounded-xl` (12px). Fonts: Inter for UI, JetBrains Mono for tracking numbers. Dark mode is disabled — never add dark-mode variants.
18. Icons come from `lucide-react`. Charts come from `recharts`. Do not inline SVG charts or icon sets beyond small decorative glyphs.

### Accessibility and Responsiveness

19. Every interactive element has an accessible name (visible text or `aria-label`); focus states visible (the `Button` already provides a `focus-visible:ring` in `kauvex-orange`).
20. Color is never the only signal (errors include text/icons; success states are labeled).
21. Mobile-first layouts: all new pages must render and be usable at 360px width and up. Test at 360px, 768px, 1440px.
22. Respect `prefers-reduced-motion` when adding animation (framer-motion usage should be minimal).

### API and Error Handling

23. Every API route uses the helpers from `src/lib/api-helpers.ts`: `successResponse` / `errorResponse` / `paginatedResponse`; auth guards `getAuthUser` / `requireAdmin` / `requireVendor` as appropriate; body validation via `validateBody` with a Zod schema from `src/lib/validators/`.
24. Error responses carry a message (and details when useful), never stack traces or internal state. Log server errors via Sentry; never log tokens, keys, or PII.
25. Client components surface errors from `errorResponse` messages; loading and empty states are mandatory for async UIs.

## Evolution Targets

> **Evolution target — NOT in the repo today.**
- A form library (react-hook-form or similar) — forms currently use controlled state/Zod validation manually.
- Storybook or a component catalog for `src/components/ui/`.
- ESLint 9 flat config migration.

## Checklist

- [ ] `npx tsc --noEmit` passes.
- [ ] `npm run lint` passes (next lint).
- [ ] Server components by default; `"use client"` only when needed.
- [ ] No inline SQL in `src/`; Prisma only.
- [ ] Reused `src/components/ui/` primitives; no duplicated UI.
- [ ] Naming conventions followed; no comments added unless asked.
- [ ] Brand tokens used; no dark mode; radii/fonts per brand.
- [ ] API routes use api-helpers + Zod validation.
- [ ] Responsive at 360px/768px/1440px; accessible names and focus states present.
