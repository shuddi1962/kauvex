# EC-045 — Business OS Modules

> **Status:** Active
> **Phase:** F — Marketplace & Business OS
> **Canonical code:** `src/lib/business-os/`, `src/app/business-os/`, `src/lib/kai/business-intelligence.ts`, `prisma/schema.prisma` (Bos* models)
> **Overrides:** nothing

## Purpose

Defines the Business OS (Phase 29/32): the org-scoped operational data layer — sales, inventory, finance, customers, tasks, projects, production — and the rule that KAI (and future modules) read it as the single source of business truth.

## Current Truth (in this repo today)

- **Org model:** `BosOrganization` + `BosOrgMember` (org membership), `BosDepartment`, `BosOrgSetting`. Every Bos* row is `org_id`-scoped (EC-014).
- **Sales & CRM:** `BosCustomer`, `BosContact`, `BosLead`, `BosDeal`, `BosQuotation`, `BosSalesOrder`, `BosInvoice` (direction receivable, total, amountPaid, status, dueDate).
- **Inventory & supply:** `BosItem` (name, stockOnHand, reorderPoint), `BosWarehouse`, `BosStockMovement`, `BosSupplier`, `BosPurchaseRequest`, `BosPurchaseOrder`.
- **Production & projects:** `BosBom`, `BosProductionOrder`, `BosProject`, `BosWorkOrder`, `BosTask`, `BosAsset`, `BosDocument`, `BosApproval`, `BosAutomationRule`.
- **Quality & ops:** `BosNcr`, `BosIncident`, `BosKnowledgeArticle`, `BosAnnouncement`.
- **Finance:** `BosGlAccount`, `BosJournalEntry`.
- **Industry modules:** `BosIndustryModule` (15 industry hubs per Phase 26).
- **Portals:** `src/app/business-os/` (Business OS portal) + `/api/v1/business-os/` APIs; engine `src/lib/business-os/`.
- **KAI reads it live:** `getBusinessFacts(orgId)` in `src/lib/kai/business-intelligence.ts` pulls parallel, time-bounded aggregates (7-day windows) over sales orders, items, invoices, customers, tasks, leads, deals, production orders → facts for Ask KAI (EC-027). Workflows (`kv_kai_workflows`, `/business/studio`) orchestrate around these modules.

## Rules

1. All Bos* tables are org-scoped; membership checks via BosOrgMember before reads/writes.
2. KAI facts queries are parallel, bounded (windows + limits), and degrade to empty on error — never block the answer (EC-027 Rule 3).
3. Money in Bos tables is Decimal(10,2) (EC-011); journal entries balance (EC-046).
4. New business modules extend the Bos* family with the same conventions (org_id, indexes, RLS) — no ad-hoc scoping.
5. Workflows read/write Bos* data through the same engines the UI uses — no bypass paths.
6. Automation rules (BosAutomationRule) are evaluated server-side, in cron-safe jobs (EC-016).

## Evolution Targets

> **Evolution target — NOT in the repo today.**
- Full ERP breadth (erp_* tables from V2 migration exist as foundation — verify and build on them deliberately).
- Payroll/HR module.
- Multi-currency GL with FX revaluation.
- Industry-specific module packs activated via BosIndustryModule.

## Checklist (Definition of Done for this area)

- [ ] org_id scoping + membership checks
- [ ] Bos conventions (indexes, RLS, Decimal)
- [ ] KAI facts reads parallel + bounded
- [ ] No bypass paths (workflows use engines)
