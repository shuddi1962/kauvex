# EC-025 — KAI Tool-Calling Framework

> **Status:** Active
> **Phase:** C — KAI Architecture
> **Canonical code:** src/lib/kai/business-intelligence.ts (routeBusinessQuestion), prisma/schema.prisma (models KaiSkill, KaiSkillInstall, KaiWorkflow, KaiWorkflowStep, KaiAgentMessage), src/app/business/studio/page.tsx, src/app/business/skills/page.tsx
> **Overrides:** Supersedes any claim that KAI "uses tools" natively. Today KAI routes intents deterministically; skills and workflows are declarative data; native function calling is not implemented.

## Purpose

This document states plainly how KAI "does things" today — deterministic intent routing instead of LLM-chosen tool calls — and how skills, installs, workflows, and steps are modeled as the declarative substrate that a future native tool-calling runtime will execute.

## Current Truth (in this repo today)

### Deterministic intent routing (the current "tool selection")
- `routeBusinessQuestion(question)` in src/lib/kai/business-intelligence.ts (lines 136-147) selects one of 9 intents by regex: sales, revenue, inventory, finance, customers, tasks, leads, production, overview (fallback). See EC-024 for the exact patterns.
- The chosen intent only influences labeling and which live summary is built — the LLM call itself receives the full context (facts + documents) regardless of intent. There is no tool invocation, no function schema, and no model-authored action.
- Implication: business Q&A is grounded by construction (only live Business OS facts and business documents enter the prompt), at the cost of flexibility — the model cannot query arbitrary resources on demand.

### Skills (kv_kai_skills)
`KaiSkill` (prisma/schema.prisma lines 7482-7508): id, name, slug (unique), description, category, industry, priceMonthly (Decimal), capabilities (Json array), systemPrompt (Text, nullable — a skill carries its own prompt), icon, color, isActive, isOfficial (default true), developerId (nullable — third-party skills), installCount (Int), rating (Decimal). Indexed by category, industry, isActive.
- A skill is a reusable capability bundle: description + capabilities + system prompt + optional price. Official skills ship with the platform; developerId allows marketplace-style third-party skills.

### Skill installs (kv_kai_skill_installs)
`KaiSkillInstall` (lines 7510-7524): skillId, agentId, businessId, isActive, installedAt. Unique on (skillId, agentId); cascades with skill/agent/business. Installing a skill binds it to one agent within one business — the bridge between the marketplace (src/app/business/skills/page.tsx) and the agent workforce (EC-022).

### Workflows (kv_kai_workflows + kv_kai_workflow_steps)
- `KaiWorkflow` (lines 7443-7464): businessId (cascade), name, description, triggerType (varchar 50), triggerConfig (Json), isActive, version (Int, default 1), metadata. Indexed by businessId, isActive.
- `KaiWorkflowStep` (lines 7466-7480): workflowId (cascade), stepOrder (Int), stepType (varchar 50), stepConfig (Json), nextOnSuccess (nullable uuid), nextOnFailure (nullable uuid). Indexed by (workflowId, stepOrder).
- Workflow Studio UI: src/app/business/studio/page.tsx (694 lines) — business-facing builder for triggerConfig/stepConfig.
- The schema expresses execution structure (success/failure branches) but no executor exists in src/lib/ today; workflows are configuration awaiting a runtime.

### Agent-to-agent channel
- `KaiAgentMessage` (kv_kai_agent_messages, lines 7545-7566) links sender/receiver agents with an optional workflowId and a status lifecycle (pending, readAt, actedAt). It is the messaging substrate a workflow runtime would use — see EC-022.

### Administration
- Admin console tabs: "workflows" and "skills" in src/app/admin/kai/page.tsx (tab keys at lines 189-190). Business surfaces: Workflow Studio (/business/studio) and Skills Marketplace (/business/skills), both in the business nav shell (src/app/business/layout.tsx).

## Rules

1. Keep intent routing deterministic until native tool calling exists; a regex route must never block on an LLM round-trip.
2. Skills must carry a systemPrompt or explicit capabilities; a skill with neither is not ready for marketplace listing.
3. Skill installs must always include businessId and agentId; the unique (skillId, agentId) constraint is the install contract.
4. Workflow steps must set stepOrder and (when branching) nextOnSuccess/nextOnFailure; dangling branch pointers are a bug.
5. No code may claim "the agent called a tool" — the runtime for that does not exist. Executing workflows or driving agent actions without a documented executor is out of scope.
6. New workflow stepType values must be documented here before use so the future executor has a typed registry.
7. Keep agent permissions (EC-022) aligned with what steps/skills claim to do — the permission matrix is the enforcement surface when tools land.

## Evolution Targets

> **Evolution target — NOT in the repo today.** Native function calling: OpenRouter chat completions `tools` parameter, where KAI chooses tools from a schema and the server executes them.

> **Evolution target — NOT in the repo today.** A workflow executor that walks KaiWorkflowStep rows (stepOrder, nextOnSuccess/nextOnFailure) and records runs; today the rows are inert.

> **Evolution target — NOT in the repo today.** Agent-to-tool permission enforcement: gating tool invocation against KaiAgentPermission rows (can_view/can_create/can_edit/can_delete per resourceType).

> **Evolution target — NOT in the repo today.** Tool result persistence and replay for audit (e.g. a workflow run log mirroring KaiEcoFlowRun in the ecosystem tables).

## Checklist

- [ ] routeBusinessQuestion remains the only intent selector for business Q&A.
- [ ] Skills carry description + capabilities/systemPrompt and are listed via installs per business/agent.
- [ ] Workflow steps are ordered and branch pointers are consistent.
- [ ] No executor or native `tools` parameter exists anywhere in src/ (if it appears, update this doc and EC-022).
- [ ] Admin workflows/skills tabs and business Studio/Marketplace pages match the documented models.
