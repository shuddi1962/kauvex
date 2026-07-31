# EC-022 — KAI Agent System (Multi-Agent Workforce)

> **Status:** Active
> **Phase:** C — KAI Architecture
> **Canonical code:** prisma/schema.prisma (models KaiAgent, KaiAgentPermission, KaiAgentMessage), src/app/admin/kai/page.tsx (agents tab), src/app/business/layout.tsx (AI Employee nav), src/app/business/skills/page.tsx
> **Overrides:** Supersedes any "agents are chatbots" framing. Agents are business-scoped AI employees with declared permissions, skills, and message channels — execution is config-driven, not autonomous.

## Purpose

The KAI Agent System lets a business define AI employees (agents) that hold a role, a system prompt, a knowledge scope, a model, a temperature, and an explicit permission matrix over business resources. Agents install skills and communicate with each other through a message table. Today the system is declarative (agents are defined and configured); autonomous tool-calling execution is an evolution target.

## Current Truth (in this repo today)

### Data model (prisma/schema.prisma)
- `KaiAgent` (kv_kai_agents, lines 7350-7376): id, businessId (required, cascade), name, role, avatar (varchar 10), color, description, systemPrompt, knowledgeScope (default `"business"`, varchar 20), model (default `"openai/gpt-4o-mini"`, varchar 100), temperature (Decimal default 0.7, 3,2), isActive, metadata (Json). Indexed by businessId and role. Agents belong to exactly one business — there is no global agent row.
- `KaiAgentPermission` (kv_kai_agent_permissions, lines 7378-7392): agentId, resourceType (varchar 50), canView, canCreate, canEdit, canDelete (all Boolean default false). Unique on (agentId, resourceType). Cascade-deletes with the agent.
- `KaiAgentMessage` (kv_kai_agent_messages, lines 7545-7566): senderAgentId, receiverAgentId, workflowId (nullable, SetNull on workflow delete), subject, message (Text), context (Json), status (default `"pending"`, varchar 20), readAt, actedAt, createdAt. Indexed by sender, receiver, status.
- Related: `KaiSkillInstall` (kv_kai_skill_installs) links skills to agents per business, unique (skillId, agentId). See EC-025 for skills/workflows.

### Permission matrix semantics
- A permission row is the union of resource_type + four booleans: can_view, can_create, can_edit, can_delete. Absence of a row means no permissions for that resource type. All booleans default false, so permissions are explicitly granted, never implicit.
- resourceType is a free-form string (varchar 50) — the schema does not enumerate valid values today; the convention is a resource name such as "sales_order", "inventory", "customer" (no validation exists in code; enforcement is the evolution target).

### Agent creation and management
- Admin console: src/app/admin/kai/page.tsx, tab key `"agents"` (tab list at lines 181-191; `activeTab` state at line 195). This is the same page that hosts the AI Employee entry point in the business nav (`/admin/kai?tab=agents`).
- Business portal: src/app/business/skills/page.tsx is the Skills Marketplace surface; agent/skill installation flows operate on KaiAgent + KaiSkillInstall records.
- There is no dedicated agent CRUD API route group in src/app/api/v1 today — agent records are managed through the admin console page and general Prisma access; verify before relying on an endpoint that does not exist.

### Knowledge scope
- `KaiAgent.knowledgeScope` defaults to `"business"` (varchar 20). The schema allows other values (e.g. platform/global), but the default and the surrounding Company Brain system scope knowledge retrieval to the business (see EC-023): retrieval runs `kv_kai_search_business_embeddings` with the business id, and document training writes chunks with businessId set.
- Business scope is enforced at the data layer: `KaiKnowledgeChunk.businessId`, `KaiDocument.businessId`, and the business RPC filter (`k.business_id = business_id`) in supabase/migrations/00046_kcc_phase33_kai_business_intel.sql lines 18-53.

### Model and temperature fields
- Each agent carries its own `model` (default `"openai/gpt-4o-mini"`) and `temperature` (Decimal 0.7). These are stored and admin-configurable; the shared LLM call sites in src/lib/ai/openrouter.ts use the same default model constant. No per-agent execution loop exists yet — the fields describe the agent that a future runtime will run.

### Agent messaging
- `KaiAgentMessage` supports structured agent-to-agent communication: sender, receiver, optional workflow context, subject, message body, JSON context, lifecycle status (pending/read/acted via readAt/actedAt), all within a business because both agents belong to the same business row.
- Messages are declarative records; nothing in src/lib/ today consumes them to drive autonomous agent-to-agent action.

## Rules

1. Every agent must have a businessId — global/tenant-less agents are not allowed by the schema.
2. Every permission on an agent must be granted explicitly via a KaiAgentPermission row; default-deny when no row exists.
3. `knowledgeScope` must stay `"business"` unless a deliberate platform-knowledge scope is built; business retrieval must always pass the business id to the RPC.
4. Agent model and temperature fields must respect the cost bounds in EC-021 (default model, temperature <= 0.7 unless a feature justifies higher).
5. Any code that creates KaiAgentMessage rows must set both senderAgentId and receiverAgentId and keep them within one business.
6. Do not build autonomous agent execution on top of KaiAgentMessage until the tool-calling framework (EC-025) lands; today the message table is an inbox/ledger, not a scheduler.
7. New resource types used in KaiAgentPermission must be documented in this file before production use, so enforcement tooling can reference one registry.

## Evolution Targets

> **Evolution target — NOT in the repo today.** Enforcement of the permission matrix: a runtime that checks can_view/can_create/can_edit/can_delete against actual Business OS operations before an agent acts.

> **Evolution target — NOT in the repo today.** Tool-calling agents: native function calling via the OpenRouter `tools` parameter, where agent-permission rows gate which tools an agent may invoke (see EC-025).

> **Evolution target — NOT in the repo today.** Autonomous multi-agent workflows driven by KaiAgentMessage status transitions (pending → read → acted) with timers and retries.

> **Evolution target — NOT in the repo today.** A dedicated agent CRUD + execution API route group under src/app/api/v1.

## Checklist

- [ ] KaiAgent rows always carry a businessId and a knowledgeScope value.
- [ ] Permission matrix covers view/create/edit/delete as booleans and is default-deny.
- [ ] Agent model/temperature defaults match the shared LLM defaults in src/lib/ai/openrouter.ts.
- [ ] Agent messaging table is used only for intra-business sender/receiver pairs.
- [ ] Admin console agents tab (src/app/admin/kai/page.tsx) is the documented management surface.
- [ ] Any new resource type added to the permission matrix is listed in this doc.
