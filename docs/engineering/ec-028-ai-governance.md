# EC-028 — AI Governance

> **Status:** Active
> **Phase:** C — KAI Architecture
> **Canonical code:** `src/app/admin/kai/**`, `src/app/admin/kai/business-intelligence/`, `src/lib/kai/business-intelligence.ts`, `kv_kai_*` tables
> **Overrides:** nothing

## Purpose

Defines how KAI is governed: tenant isolation of knowledge, auditability of answers, cost control, brand compliance, and admin oversight. KAI is a paid platform feature — governance is what makes it safe to sell.

## Current Truth (in this repo today)

- **Tenant isolation:** business knowledge is scoped by `business_id` (chunks, documents, questions); embedding search filters by business (EC-027 Rule 1). Platform-global chunks (NULL business_id) are admin-managed.
- **Audit trail:** every business answer persists to `kv_kai_business_questions` with question, answer, mode, live_data snapshot, sources, latency_ms — reviewable in `/admin/kai/business-intelligence` (recent questions across all businesses).
- **Admin oversight:** KAI console `/admin/kai` (11 tabs: dashboard, knowledge, conversations, config, plans, subscriptions, businesses, agents, workflows, skills, passport-templates) + Business Intelligence overview page.
- **Subscriptions:** `kv_kai_plans` + `kv_kai_subscriptions` (per-business plans; status active/cancelled; billing cycle). Business tiering gates agent counts and KB size.
- **Feedback:** `kv_kai_feedback` for answer feedback.
- **Cost guardrails:** model choice per feature (EC-026 — gpt-4o-mini default), latency tracking per answer, fallback mode avoids LLM cost when facts suffice.
- **Brand compliance:** KAI voice enforced in system prompts ("KAI knows.", short warm sentences, no jargon to customers — AGENTS.md voice rules).

## Rules

1. No cross-tenant leakage: business-scoped retrieval and RLS on question rows; admin-only access to cross-business views.
2. Every LLM answer is persisted with mode + latency; delete/retention of question history follows platform data policy (keep by default — it's the audit trail).
3. Usage is metered per business (questions + modes); billing integration uses `kv_kai_subscriptions` — new metering must land there, not ad-hoc.
4. Model calls respect cost tiers: default cheap model; upgrade only per feature spec (EC-026).
5. KAI outputs follow brand voice; system prompts are versioned in `kv_kai_config` or the engine — changes are reviewed before shipping.
6. Harmful-content moderation applies to training documents (file scans via EC-019) and is an evolution target for answers (see below).
7. Admin can inspect any business's questions/answers; vendor/end-user sees only their own (EC-013, EC-014).

## Evolution Targets

> **Evolution target — NOT in the repo today.**
- Answer moderation (input/output filtering before delivery).
- Usage-based billing metering (per-question pricing on top of plan limits).
- PII redaction pipeline in training documents.
- Fine-tuned KAI 2.0 models per industry (Phase C roadmap) with model governance gates.
- Customer-controlled data retention windows.

## Checklist (Definition of Done for this area)

- [ ] Business-scoped isolation verified in retrieval + RLS
- [ ] Answers persisted (question, mode, latency, sources)
- [ ] Admin overview page wired
- [ ] Model cost tier applied
- [ ] Brand voice in prompts
- [ ] No cross-tenant read paths
