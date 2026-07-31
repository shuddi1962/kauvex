# EC-005 — Git Branching

> **Status:** Active
> **Phase:** A — Engineering Foundation
> **Canonical code:** repo git history — `git log --oneline`, `git branch -a`
> **Overrides:** no earlier conventions existed; this document defines them (previously undocumented).

## Purpose

This document defines how the Kauvex repository is versioned and branched. The reality is a solo founder working with an AI agent: no team, no CI reviewers, one source of truth. The workflow must therefore be simple enough to run every day, safe enough that main is always deployable, and structured enough that work can be reverted or reviewed after the fact.

## Current Truth (in this repo today)

- Single branch: `main` (tracked against `origin/main`). No other local or remote branches exist.
- No branching, commit, or PR conventions are documented anywhere yet; this document is the first.
- Commit history style (from `git log`): descriptive, phase-prefixed sentences, e.g. `Phase 28: KAI Studio + Skills Marketplace + Company Brain + Passport Expansion`, `Phase 27b: KAI Workforce + Digital Passport + Subscriptions`, `Fix Prisma relation: add missing feedback reverse field on KaiMessage`.
- Commits are made directly to `main` today. `.gitignore` protects secrets: `.env`, `.env*.local`, `.vercel`, `/src/generated/prisma`, `*.tsbuildinfo` are ignored.

## Rules

1. `main` is the single source of truth and must remain deployable at all times. The build gate is `npm run build` (which runs `prisma generate && next build`); before any commit that touches code, the change must at least typecheck (`npx tsc --noEmit`) and build.
2. Small, focused work (a bug fix, a single page, a small feature) may be committed directly to `main` with a short commit message. This keeps the solo workflow fast.
3. Big work (a full phase, multi-file features, schema changes, anything that could leave main broken mid-way) uses a short-lived feature branch off `main`, named `phase<NN>-<short-slug>` or `<topic>-<short-slug>`, e.g. `phase33-kai-business-intel`, `fix-buybox-weighting`. Merge back to `main` when the work is complete and green.
4. Commit message style: imperative, short, prefixed by phase when applicable, e.g. `phase33: add business_id scoping to knowledge chunks`, `fix: handle missing vendor in requireVendor`. This matches the existing "Phase NN: ..." history while staying one line. No emojis, no trailing periods.
5. Commit related files together; avoid mixing unrelated changes in one commit. Stage only intended files (`git add <files>`), never `git add -A` blindly.
6. NEVER commit secrets: `.env`, `.env*.local`, `.vercel` are ignored — if a secret file is ever staged, stop, remove it from the index, and rotate the secret. Do not paste tokens in commit messages.
7. NEVER force-push to `main` or to any shared remote branch. If history needs repair, prefer new commits or ask the user.
8. The AI agent commits ONLY when the user explicitly asks. After a commit, report the commit hash and message. Never push without being asked; never open PRs without being asked.
9. Before committing, review with `git status`, `git diff`, and `git log --oneline -10` to match style and confirm nothing unintended is staged.
10. If a commit fails or a hook rejects it, fix the problem and make a new commit; do not amend failed commits or rewrite history.
11. Large phases may be broken into multiple logical commits (schema first, then engine, then UI) — each must build independently where feasible.

## Evolution Targets

> **Evolution target — NOT in the repo today.**
- Protected-branch rules on `main` enforced by GitHub (requires CI to be meaningful; no CI pipeline exists yet — see EC-049 planning in `docs/engineering/README.md`).
- Conventional Commits or semantic-release automation.
- Pull-request review workflow (only when a second human engineer joins).
- GitHub Actions CI running `npx tsc --noEmit`, `npm run lint`, and `npm run build` on every push (see EC-009 and EC-049).

## Checklist

- [ ] `git status` clean of secrets; only intended files staged.
- [ ] Typecheck (and build where feasible) passed before commit.
- [ ] Commit message: short, imperative, phase-prefixed, one line.
- [ ] Big work on `phase<NN>-...` branch; small work on `main`.
- [ ] No force-push, no history rewrite, no secret in any commit.
- [ ] AI agent committed only after explicit user request; hash reported.
