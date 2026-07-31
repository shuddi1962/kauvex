import { prisma } from "@/lib/prisma";

// =====================================================================
// K BUSINESS OS — Core Engine
// =====================================================================

// ---------- Organization helpers ----------

export async function getUserOrganizations(userId: string) {
  const memberships = await prisma.bosOrgMember.findMany({
    where: { userId, status: "active" },
    include: { org: true },
    orderBy: { isDefaultOrg: "desc" },
  });
  return memberships.map((m) => ({ ...m, org: undefined, membership: m }));
}

export async function getDefaultOrg(userId: string) {
  const membership = await prisma.bosOrgMember.findFirst({
    where: { userId, status: "active" },
    include: { org: true },
    orderBy: [{ isDefaultOrg: "desc" }, { createdAt: "asc" }],
  });
  return membership ?? null;
}

export async function createOrganization(userId: string, data: {
  name: string;
  legalName?: string;
  orgType?: string;
  industry?: string;
  registrationNumber?: string;
  taxId?: string;
  country?: string;
  currencyCode?: string;
  address?: any;
  contactEmail?: string;
  contactPhone?: string;
  plan?: string;
}) {
  const org = await prisma.$transaction(async (tx) => {
    const created = await tx.bosOrganization.create({
      data: {
        name: data.name,
        legalName: data.legalName,
        orgType: data.orgType || "company",
        industry: data.industry,
        registrationNumber: data.registrationNumber,
        taxId: data.taxId,
        country: data.country || "NG",
        currencyCode: data.currencyCode || "NGN",
        address: data.address || {},
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        plan: data.plan || "starter",
      },
    });
    await tx.bosOrgMember.create({
      data: { orgId: created.id, userId, memberRole: "owner", isDefaultOrg: true },
    });
    await tx.bosOrgSetting.create({ data: { orgId: created.id } });
    return created;
  });
  return org;
}

export async function ensureOrgAccess(orgId: string, userId: string) {
  const membership = await prisma.bosOrgMember.findFirst({
    where: { orgId, userId, status: "active" },
  });
  return membership;
}

export async function resolveOrg(userId: string, orgId?: string | null) {
  if (orgId) {
    const membership = await ensureOrgAccess(orgId, userId);
    return membership ? orgId : null;
  }
  const membership = await getDefaultOrg(userId);
  return membership?.orgId ?? null;
}

// ---------- Number generators ----------

export function generateNumber(prefix: string, counter: number, pad = 5) {
  return `${prefix}-${String(counter + 1).padStart(pad, "0")}`;
}

export async function nextNumber(orgId: string, model: "quotation" | "salesOrder" | "purchaseRequest" | "purchaseOrder" | "productionOrder" | "workOrder" | "approval" | "ncr" | "incident" | "invoice", prefix: string) {
  const tableMap = {
    quotation: prisma.bosQuotation, salesOrder: prisma.bosSalesOrder,
    purchaseRequest: prisma.bosPurchaseRequest, purchaseOrder: prisma.bosPurchaseOrder,
    productionOrder: prisma.bosProductionOrder, workOrder: prisma.bosWorkOrder,
    approval: prisma.bosApproval, ncr: prisma.bosNcr, incident: prisma.bosIncident,
    invoice: prisma.bosInvoice,
  } as const;
  const count = await (tableMap[model] as any).count({ where: { orgId } });
  return generateNumber(prefix, count);
}

// ---------- Dashboard aggregator ----------

export async function getBusinessDashboard(orgId: string) {
  const [customers, leads, deals, quotations, salesOrders, suppliers, prs, pos, items, warehouses,
    productionOrders, projects, tasks, workOrders, employees, assets, documents, approvals,
    ncrs, incidents, invoices, journalEntries, announcements, pendingApprovals, lowStock, activeProduction,
    openProjects, openWorkOrders] = await Promise.all([
    prisma.bosCustomer.count({ where: { orgId } }),
    prisma.bosLead.count({ where: { orgId } }),
    prisma.bosDeal.count({ where: { orgId, stage: { not: { in: ["won", "lost"] } } } }),
    prisma.bosQuotation.count({ where: { orgId } }),
    prisma.bosSalesOrder.count({ where: { orgId } }),
    prisma.bosSupplier.count({ where: { orgId } }),
    prisma.bosPurchaseRequest.count({ where: { orgId } }),
    prisma.bosPurchaseOrder.count({ where: { orgId } }),
    prisma.bosItem.count({ where: { orgId } }),
    prisma.bosWarehouse.count({ where: { orgId } }),
    prisma.bosProductionOrder.count({ where: { orgId } }),
    prisma.bosProject.count({ where: { orgId } }),
    prisma.bosTask.count({ where: { orgId } }),
    prisma.bosWorkOrder.count({ where: { orgId } }),
    prisma.bosEmployee.count({ where: { orgId } }),
    prisma.bosAsset.count({ where: { orgId } }),
    prisma.bosDocument.count({ where: { orgId } }),
    prisma.bosApproval.count({ where: { orgId } }),
    prisma.bosNcr.count({ where: { orgId } }),
    prisma.bosIncident.count({ where: { orgId } }),
    prisma.bosInvoice.count({ where: { orgId } }),
    prisma.bosJournalEntry.count({ where: { orgId } }),
    prisma.bosAnnouncement.count({ where: { orgId } }),
    prisma.bosApproval.findMany({ where: { orgId, status: "pending" }, orderBy: { createdAt: "asc" }, take: 10 }),
    prisma.bosItem.findMany({ where: { orgId, status: "active" }, orderBy: { stockOnHand: "asc" }, take: 10 }),
    prisma.bosProductionOrder.findMany({ where: { orgId, status: { in: ["released", "in_progress"] } }, orderBy: { createdAt: "desc" }, take: 10 }),
    prisma.bosProject.findMany({ where: { orgId, status: "in_progress" }, orderBy: { updatedAt: "desc" }, take: 10 }),
    prisma.bosWorkOrder.findMany({ where: { orgId, status: { in: ["assigned", "en_route", "on_site", "in_progress"] } }, orderBy: { scheduledDate: "asc" }, take: 10 }),
  ]);

  const revenue = await prisma.bosInvoice.aggregate({ where: { orgId, direction: "receivable", status: { in: ["paid", "partial"] } }, _sum: { total: true } });
  const spend = await prisma.bosInvoice.aggregate({ where: { orgId, direction: "payable", status: { in: ["paid", "partial"] } }, _sum: { total: true } });
  const pipeline = await prisma.bosDeal.aggregate({ where: { orgId, stage: { not: { in: ["won", "lost"] } } }, _sum: { amount: true } });
  const quotesOpen = await prisma.bosQuotation.aggregate({ where: { orgId, status: { in: ["draft", "sent"] } }, _sum: { total: true } });
  const ordersOpen = await prisma.bosSalesOrder.aggregate({ where: { orgId, status: { notIn: ["cancelled", "completed"] } }, _sum: { total: true } });
  const inventoryValue = await prisma.bosItem.aggregate({ where: { orgId }, _sum: { stockOnHand: true } });
  const inventoryCost = await prisma.bosItem.aggregate({ where: { orgId }, _sum: { costPrice: true } });
  const journal = await prisma.bosJournalEntry.groupBy({ by: ["entryType"], where: { orgId }, _sum: { amount: true } });

  return {
    counts: {
      customers, leads, deals, quotations, salesOrders, suppliers, purchaseRequests: prs,
      purchaseOrders: pos, items, warehouses, productionOrders, projects, tasks, workOrders,
      employees, assets, documents, approvals, ncrs, incidents, invoices, journalEntries, announcements,
    },
    finance: {
      revenue: revenue._sum.total ?? 0,
      spend: spend._sum.total ?? 0,
      pipeline: pipeline._sum.amount ?? 0,
      quotesOpen: quotesOpen._sum.total ?? 0,
      ordersOpen: ordersOpen._sum.total ?? 0,
      inventoryUnits: inventoryValue._sum.stockOnHand ?? 0,
      inventoryCost: inventoryCost._sum.costPrice ?? 0,
      debits: journal.find((j) => j.entryType === "debit")?._sum.amount ?? 0,
      credits: journal.find((j) => j.entryType === "credit")?._sum.amount ?? 0,
    },
    pendingApprovals,
    lowStock,
    activeProduction: activeProduction,
    openProjects,
    openWorkOrders,
  };
}

// ---------- Automation evaluation (runs rule checks) ----------

export async function runAutomationRules(orgId: string, userId?: string) {
  const rules = await prisma.bosAutomationRule.findMany({ where: { orgId, active: true } });
  const triggered: { rule: string; message: string }[] = [];

  for (const rule of rules) {
    let fired = false;
    let message = "";
    const cond = (rule.conditions as any) || {};

    if (rule.triggerType === "stock_low") {
      const threshold = cond.threshold ?? 0;
      const low = await prisma.bosItem.findMany({ where: { orgId, status: "active", stockOnHand: { lte: threshold } }, take: 5 });
      if (low.length) {
        fired = true;
        message = `${low.length} item(s) below stock threshold: ${low.map((i) => i.name).join(", ")}`;
      }
    } else if (rule.triggerType === "approval_pending") {
      const count = await prisma.bosApproval.count({ where: { orgId, status: "pending" } });
      if (count > 0) { fired = true; message = `${count} approval request(s) awaiting decision`; }
    } else if (rule.triggerType === "task_due") {
      const today = new Date();
      const due = await prisma.bosTask.count({ where: { orgId, status: { notIn: ["done", "cancelled"] }, dueDate: { lte: today } } });
      if (due > 0) { fired = true; message = `${due} overdue task(s)`; }
    } else if (rule.triggerType === "payment_due") {
      const today = new Date();
      const due = await prisma.bosInvoice.count({ where: { orgId, status: { in: ["sent", "partial"] }, dueDate: { lte: today } } });
      if (due > 0) { fired = true; message = `${due} invoice(s) past due`; }
    } else if (rule.triggerType === "contract_renewal") {
      const soon = new Date();
      soon.setDate(soon.getDate() + (cond.days ?? 30));
      const exp = await prisma.bosSupplier.count({ where: { orgId, contractEnd: { lte: soon }, contractEnd: { gte: new Date() } } });
      if (exp > 0) { fired = true; message = `${exp} supplier contract(s) expiring soon`; }
    } else if (rule.triggerType === "document_expiry") {
      const exp = await prisma.bosDocument.count({ where: { orgId, status: "active" } });
      if (exp > 0) { fired = true; message = `${exp} active document(s) — review expiry status`; }
    }

    if (fired) {
      await prisma.bosAutomationRule.update({
        where: { id: rule.id },
        data: { runCount: { increment: 1 }, lastRunAt: new Date() },
      });
      triggered.push({ rule: rule.name, message });
    }
  }
  return triggered;
}

// ---------- Approval workflow decision ----------

export async function decideApproval(approvalId: string, userId: string, decision: "approved" | "rejected", comment?: string) {
  const approval = await prisma.bosApproval.findUnique({ where: { id: approvalId } });
  if (!approval) throw new Error("Approval not found");
  if (approval.status !== "pending") throw new Error("Approval already decided");

  const approvers = (approval.approvers as any[]) || [];
  const level = approval.currentLevel;
  const levelApprovers = approvers.filter((a: any) => a.level === level) ?? [];
  const isApprover = approvers.some((a: any) => a.userId === userId && a.level === level);
  if (!isApprover) throw new Error("You are not an approver for the current level");

  const chain = (approval.decisionChain as any[]) || [];
  chain.push({ level, approverId: userId, decision, comment, at: new Date().toISOString() });

  const nextLevel = level + 1;
  const hasNext = approvers.some((a: any) => a.level === nextLevel);
  const finalStatus = decision === "approved" ? (hasNext ? "pending" : "approved") : "rejected";

  return prisma.bosApproval.update({
    where: { id: approvalId },
    data: {
      decisionChain: chain,
      currentLevel: decision === "approved" && hasNext ? nextLevel : approval.currentLevel,
      status: finalStatus,
      decidedAt: finalStatus !== "pending" ? new Date() : undefined,
    },
  });
}

// ---------- Stock movement (updates item stock) ----------

export async function recordStockMovement(data: {
  orgId: string;
  itemId: string;
  warehouseId?: string;
  movementType: string;
  quantity: number;
  unitCost?: number;
  referenceType?: string;
  referenceId?: string;
  notes?: string;
  performedBy?: string;
}) {
  const item = await prisma.bosItem.findUnique({ where: { id: data.itemId } });
  if (!item || item.orgId !== data.orgId) throw new Error("Item not found");

  const sign = ["receipt", "transfer_in", "return_in", "production_in", "purchase"].includes(data.movementType) ? 1 : -1;
  const newStock = Number(item.stockOnHand) + sign * data.quantity;
  if (newStock < 0) throw new Error("Insufficient stock");

  await prisma.$transaction([
    prisma.bosStockMovement.create({ data: { ...data, quantity: data.quantity } as any }),
    prisma.bosItem.update({ where: { id: data.itemId }, data: { stockOnHand: newStock, costPrice: data.unitCost ?? item.costPrice } }),
  ]);
  return newStock;
}

// ---------- Status + style maps for UI ----------

export const BOS_STATUS_STYLES: Record<string, { label: string; cls: string }> = {
  active: { label: "Active", cls: "bg-emerald-100 text-emerald-700" },
  inactive: { label: "Inactive", cls: "bg-gray-100 text-gray-600" },
  draft: { label: "Draft", cls: "bg-gray-100 text-gray-600" },
  pending: { label: "Pending", cls: "bg-amber-100 text-amber-700" },
  sent: { label: "Sent", cls: "bg-blue-100 text-blue-700" },
  submitted: { label: "Submitted", cls: "bg-blue-100 text-blue-700" },
  approved: { label: "Approved", cls: "bg-emerald-100 text-emerald-700" },
  rejected: { label: "Rejected", cls: "bg-red-100 text-red-600" },
  open: { label: "Open", cls: "bg-amber-100 text-amber-700" },
  closed: { label: "Closed", cls: "bg-gray-100 text-gray-600" },
  completed: { label: "Completed", cls: "bg-emerald-100 text-emerald-700" },
  cancelled: { label: "Cancelled", cls: "bg-gray-100 text-gray-600" },
  accepted: { label: "Accepted", cls: "bg-emerald-100 text-emerald-700" },
  converted: { label: "Converted", cls: "bg-emerald-100 text-emerald-700" },
  expired: { label: "Expired", cls: "bg-gray-100 text-gray-600" },
  revised: { label: "Revised", cls: "bg-violet-100 text-violet-700" },
  confirmed: { label: "Confirmed", cls: "bg-blue-100 text-blue-700" },
  fulfilled: { label: "Fulfilled", cls: "bg-emerald-100 text-emerald-700" },
  invoiced: { label: "Invoiced", cls: "bg-violet-100 text-violet-700" },
  paid: { label: "Paid", cls: "bg-emerald-100 text-emerald-700" },
  partial: { label: "Partial", cls: "bg-amber-100 text-amber-700" },
  unpaid: { label: "Unpaid", cls: "bg-red-100 text-red-600" },
  overdue: { label: "Overdue", cls: "bg-red-100 text-red-600" },
  planned: { label: "Planned", cls: "bg-gray-100 text-gray-600" },
  released: { label: "Released", cls: "bg-blue-100 text-blue-700" },
  in_progress: { label: "In Progress", cls: "bg-blue-100 text-blue-700" },
  on_hold: { label: "On Hold", cls: "bg-amber-100 text-amber-700" },
  todo: { label: "To Do", cls: "bg-gray-100 text-gray-600" },
  review: { label: "In Review", cls: "bg-violet-100 text-violet-700" },
  done: { label: "Done", cls: "bg-emerald-100 text-emerald-700" },
  blocked: { label: "Blocked", cls: "bg-red-100 text-red-600" },
  scheduled: { label: "Scheduled", cls: "bg-gray-100 text-gray-600" },
  assigned: { label: "Assigned", cls: "bg-blue-100 text-blue-700" },
  en_route: { label: "En Route", cls: "bg-violet-100 text-violet-700" },
  on_site: { label: "On Site", cls: "bg-amber-100 text-amber-700" },
  disputed: { label: "Disputed", cls: "bg-red-100 text-red-600" },
  won: { label: "Won", cls: "bg-emerald-100 text-emerald-700" },
  lost: { label: "Lost", cls: "bg-red-100 text-red-600" },
  qualification: { label: "Qualification", cls: "bg-gray-100 text-gray-600" },
  discovery: { label: "Discovery", cls: "bg-blue-100 text-blue-700" },
  proposal: { label: "Proposal", cls: "bg-violet-100 text-violet-700" },
  negotiation: { label: "Negotiation", cls: "bg-amber-100 text-amber-700" },
  new: { label: "New", cls: "bg-blue-100 text-blue-700" },
  contacted: { label: "Contacted", cls: "bg-violet-100 text-violet-700" },
  qualified: { label: "Qualified", cls: "bg-emerald-100 text-emerald-700" },
  ordered: { label: "Ordered", cls: "bg-blue-100 text-blue-700" },
  partially_received: { label: "Partially Received", cls: "bg-amber-100 text-amber-700" },
  received: { label: "Received", cls: "bg-emerald-100 text-emerald-700" },
  investigating: { label: "Investigating", cls: "bg-amber-100 text-amber-700" },
  corrective_action: { label: "Corrective Action", cls: "bg-violet-100 text-violet-700" },
  action_taken: { label: "Action Taken", cls: "bg-emerald-100 text-emerald-700" },
  low: { label: "Low", cls: "bg-emerald-100 text-emerald-700" },
  medium: { label: "Medium", cls: "bg-amber-100 text-amber-700" },
  high: { label: "High", cls: "bg-red-100 text-red-600" },
  critical: { label: "Critical", cls: "bg-red-100 text-red-600" },
  published: { label: "Published", cls: "bg-emerald-100 text-emerald-700" },
  archived: { label: "Archived", cls: "bg-gray-100 text-gray-600" },
  escalated: { label: "Escalated", cls: "bg-red-100 text-red-600" },
  void: { label: "Void", cls: "bg-gray-100 text-gray-600" },
  on_leave: { label: "On Leave", cls: "bg-amber-100 text-amber-700" },
  probation: { label: "Probation", cls: "bg-blue-100 text-blue-700" },
  terminated: { label: "Terminated", cls: "bg-gray-100 text-gray-600" },
  in_service: { label: "In Service", cls: "bg-emerald-100 text-emerald-700" },
  maintenance: { label: "Maintenance", cls: "bg-amber-100 text-amber-700" },
  idle: { label: "Idle", cls: "bg-gray-100 text-gray-600" },
  retired: { label: "Retired", cls: "bg-gray-100 text-gray-600" },
  transferred: { label: "Transferred", cls: "bg-blue-100 text-blue-700" },
  planning: { label: "Planning", cls: "bg-gray-100 text-gray-600" },
  suspended: { label: "Suspended", cls: "bg-amber-100 text-amber-700" },
  blacklisted: { label: "Blacklisted", cls: "bg-red-100 text-red-600" },
  discontinued: { label: "Discontinued", cls: "bg-gray-100 text-gray-600" },
  blocked_c: { label: "Blocked", cls: "bg-red-100 text-red-600" },
};
