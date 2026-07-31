import { prisma } from "@/lib/prisma";
import { resolveOrg } from "@/lib/business-os";
import { generateEmbedding } from "@/lib/kai/rag";

// =====================================================================
// KAI COMPANY BRAIN — Business Intelligence (Canvas Document 9)
// KAI that knows everything happening in the business:
// live Business OS data (orders, sales, inventory, finance, customers)
// + business-trained RAG over uploaded documents (Company Brain).
// =====================================================================

// ---------- Business resolution ----------

export async function getKaiBusiness(userId: string) {
  return prisma.kaiBusiness.findUnique({ where: { userId } });
}

export async function ensureKaiBusiness(userId: string, data?: { companyName?: string; industry?: string; description?: string; products?: string; services?: string }) {
  const existing = await prisma.kaiBusiness.findUnique({ where: { userId } });
  if (existing) return existing;
  return prisma.kaiBusiness.create({
    data: {
      userId,
      companyName: data?.companyName ?? "My Business",
      industry: data?.industry,
      description: data?.description,
      products: data?.products,
      services: data?.services,
      onboarded: true,
    },
  });
}

// ---------- Live business facts (Business OS) ----------

export interface BusinessFacts {
  orgId: string | null;
  sales: { total: number; count: number; thisWeekCount: number; thisWeekTotal: number; byStatus: Record<string, number>; recent: { orderNumber: string; total: number; status: string; orderDate: string }[] };
  inventory: { itemCount: number; lowStockCount: number; lowStock: { name: string; stockOnHand: number; reorderPoint: number }[] };
  finance: { receivables: number; overdueCount: number; invoicesByStatus: Record<string, number> };
  customers: { count: number };
  tasks: { openCount: number };
  leads: { openCount: number; dealValue: number };
  production: { activeCount: number };
  generatedAt: string;
}

export async function getBusinessFacts(orgId: string | null): Promise<BusinessFacts> {
  const empty: BusinessFacts = {
    orgId: null,
    sales: { total: 0, count: 0, thisWeekCount: 0, thisWeekTotal: 0, byStatus: {}, recent: [] },
    inventory: { itemCount: 0, lowStockCount: 0, lowStock: [] },
    finance: { receivables: 0, overdueCount: 0, invoicesByStatus: {} },
    customers: { count: 0 },
    tasks: { openCount: 0 },
    leads: { openCount: 0, dealValue: 0 },
    production: { activeCount: 0 },
    generatedAt: new Date().toISOString(),
  };
  if (!orgId) return empty;

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);

  try {
    const [orders, items, invoices, customers, tasks, leads, deals, production] = await Promise.all([
      prisma.bosSalesOrder.findMany({ where: { orgId, status: { notIn: ["draft", "cancelled"] } }, select: { orderNumber: true, total: true, status: true, orderDate: true }, take: 200 }),
      prisma.bosItem.findMany({ where: { orgId }, select: { name: true, stockOnHand: true, reorderPoint: true }, take: 500 }),
      prisma.bosInvoice.findMany({ where: { orgId, direction: "receivable" }, select: { total: true, amountPaid: true, status: true, dueDate: true }, take: 300 }),
      prisma.bosCustomer.count({ where: { orgId, status: "active" } }).catch(() => 0),
      prisma.bosTask.count({ where: { orgId, status: { in: ["open", "in_progress", "pending"] } } }).catch(() => 0),
      prisma.bosLead.count({ where: { orgId, status: { in: ["new", "contacted", "qualified"] } } }).catch(() => 0),
      prisma.bosDeal.findMany({ where: { orgId, status: { in: ["open", "won"] } }, select: { value: true }, take: 200 }).catch(() => []),
      prisma.bosProductionOrder.count({ where: { orgId, status: { in: ["planned", "in_progress"] } } }).catch(() => 0),
    ]);

    const byStatus: Record<string, number> = {};
    let total = 0;
    let thisWeekCount = 0;
    let thisWeekTotal = 0;
    for (const o of orders) {
      byStatus[o.status] = (byStatus[o.status] ?? 0) + 1;
      const amt = Number(o.total);
      total += amt;
      if (o.orderDate >= weekStart) {
        thisWeekCount += 1;
        thisWeekTotal += amt;
      }
    }

    const lowStock = items
      .filter((i) => Number(i.stockOnHand) <= Number(i.reorderPoint))
      .slice(0, 10)
      .map((i) => ({ name: i.name, stockOnHand: Number(i.stockOnHand), reorderPoint: Number(i.reorderPoint) }));

    const invoicesByStatus: Record<string, number> = {};
    let receivables = 0;
    let overdueCount = 0;
    for (const inv of invoices) {
      invoicesByStatus[inv.status] = (invoicesByStatus[inv.status] ?? 0) + 1;
      const outstanding = Number(inv.total) - Number(inv.amountPaid);
      if (outstanding > 0 && ["sent", "partial"].includes(inv.status)) {
        receivables += outstanding;
        if (inv.dueDate && inv.dueDate < new Date()) overdueCount += 1;
      }
    }

    return {
      orgId,
      sales: {
        total,
        count: orders.length,
        thisWeekCount,
        thisWeekTotal,
        byStatus,
        recent: orders
          .sort((a, b) => b.orderDate.getTime() - a.orderDate.getTime())
          .slice(0, 5)
          .map((o) => ({ orderNumber: o.orderNumber, total: Number(o.total), status: o.status, orderDate: o.orderDate.toISOString() })),
      },
      inventory: { itemCount: items.length, lowStockCount: lowStock.length, lowStock },
      finance: { receivables, overdueCount, invoicesByStatus },
      customers: { count: customers },
      tasks: { openCount: tasks },
      leads: { openCount: leads, dealValue: deals.reduce((s, d) => s + Number(d.value ?? 0), 0) },
      production: { activeCount: production },
      generatedAt: new Date().toISOString(),
    };
  } catch {
    return empty;
  }
}

// ---------- Intent routing ----------

export function routeBusinessQuestion(question: string): { type: string; label: string } {
  const q = question.toLowerCase();
  if (/(order|sale|sold|sell|buy|purchase order|po\b)/.test(q)) return { type: "sales", label: "Sales & Orders" };
  if (/(revenue|income|earned|made|sales total|profit|gmv|turnover)/.test(q)) return { type: "revenue", label: "Revenue" };
  if (/(stock|inventory|low stock|out of stock|reorder|quantity left|product count)/.test(q)) return { type: "inventory", label: "Inventory" };
  if (/(invoice|payment|paid|receivable|overdue|owes|debt|outstanding|cash flow|finance|money in)/.test(q)) return { type: "finance", label: "Finance & Payments" };
  if (/(customer|client|account|contact)/.test(q)) return { type: "customers", label: "Customers" };
  if (/(task|project|milestone|todo|deadline)/.test(q)) return { type: "tasks", label: "Tasks & Projects" };
  if (/(lead|deal|opportunit|pipeline|prospect)/.test(q)) return { type: "leads", label: "Leads & Pipeline" };
  if (/(production|manufactur|work order|batch|capacity|machine)/.test(q)) return { type: "production", label: "Production" };
  return { type: "overview", label: "Business Overview" };
}

export function summarizeFacts(facts: BusinessFacts, label: string): string {
  const s = facts.sales;
  const inv = facts.inventory;
  const fin = facts.finance;
  const parts = [`Live snapshot: ${s.count} orders (${s.byStatus.confirmed ?? 0} confirmed, ${s.byStatus.fulfilled ?? 0} fulfilled, ${s.byStatus.completed ?? 0} completed), total ${fmtN(s.total)}. ${s.thisWeekCount} orders worth ${fmtN(s.thisWeekTotal)} in the last 7 days.`, `${inv.itemCount} products in inventory, ${inv.lowStockCount} low on stock${inv.lowStock.length ? ` (e.g. ${inv.lowStock.slice(0, 3).map((i) => i.name).join(", ")})` : ""}.`, `${fin.receivables > 0 ? `${fmtN(fin.receivables)} outstanding receivables, ${fin.overdueCount} overdue invoices` : "No outstanding receivables"}. ${facts.customers.count} active customers, ${facts.tasks.openCount} open tasks, ${facts.leads.openCount} open leads (${fmtN(facts.leads.dealValue)} in pipeline).`];
  return `${label} — ${parts.join(" ")}`;
}

function fmtN(v: number): string {
  return v.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

// ---------- Business RAG ----------

export async function searchBusinessChunks(businessId: string, question: string, limit = 5) {
  const sources: { id: string; title: string; content: string; similarity: number }[] = [];

  try {
    const embedding = await generateEmbedding(question);
    const { supabase } = await import("@/lib/insforge");
    const { data, error } = await supabase.rpc("kv_kai_search_business_embeddings", {
      query_embedding: embedding,
      business_id: businessId,
      match_limit: limit,
    });
    if (!error && Array.isArray(data)) {
      for (const row of data) {
        sources.push({ id: row.id, title: row.title, content: row.content, similarity: Number(row.similarity ?? 0) });
      }
      return sources;
    }
  } catch {
    // fall through to keyword search
  }

  const rows = await prisma.kaiKnowledgeChunk.findMany({
    where: { businessId, isActive: true, OR: [{ title: { contains: question, mode: "insensitive" } }, { content: { contains: question, mode: "insensitive" } }] },
    take: limit,
    orderBy: { createdAt: "desc" },
  });
  return rows.map((r) => ({ id: r.id, title: r.title, content: r.content, similarity: 0 }));
}

// ---------- Training (Company Brain documents) ----------

export function chunkText(text: string, size = 800): string[] {
  const cleaned = text.replace(/\r\n/g, "\n").trim();
  if (!cleaned) return [];
  const paragraphs = cleaned.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  const chunks: string[] = [];
  let current = "";
  for (const p of paragraphs) {
    if (current.length + p.length + 2 > size && current) {
      chunks.push(current);
      current = p;
    } else {
      current = current ? `${current}\n\n${p}` : p;
    }
  }
  if (current) chunks.push(current);
  return chunks.length ? chunks : [cleaned.slice(0, size)];
}

export async function trainBusinessDocument(businessId: string, data: { name: string; content: string; type?: string; fileUrl?: string; mimeType?: string }) {
  const name = data.name || "Untitled document";
  const type = data.type || "manual";
  const chunks = chunkText(data.content);

  const document = await prisma.kaiDocument.create({
    data: {
      businessId,
      name,
      type,
      fileUrl: data.fileUrl,
      mimeType: data.mimeType,
      fileSize: data.content.length,
      source: "upload",
      isIndexed: true,
      metadata: { chunkCount: chunks.length },
    },
  });

  let embedded = 0;
  for (let i = 0; i < chunks.length; i++) {
    let embedding: number[] | undefined;
    try {
      embedding = await generateEmbedding(chunks[i]);
      embedded += 1;
    } catch {
      embedding = undefined;
    }
    await prisma.kaiKnowledgeChunk.create({
      data: {
        category: "business",
        subcategory: type,
        title: chunks.length > 1 ? `${name} — part ${i + 1}` : name,
        content: chunks[i],
        businessId,
        chunkIndex: i,
        metadata: { source: "upload", documentId: document.id, documentName: name },
        sourceUrl: data.fileUrl,
      },
    });
  }

  return { document, chunks: chunks.length, embedded };
}

export async function getBusinessBrain(businessId: string) {
  const [documents, chunkStats, questions] = await Promise.all([
    prisma.kaiDocument.findMany({ where: { businessId }, orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.kaiKnowledgeChunk.groupBy({ by: ["businessId"], where: { businessId }, _count: { id: true }, _sum: { chunkIndex: true } }),
    prisma.kaiBusinessQuestion.findMany({ where: { businessId }, orderBy: { createdAt: "desc" }, take: 10 }),
  ]);
  return {
    documents,
    chunkCount: chunkStats[0]?._count.id ?? 0,
    questions,
  };
}

// ---------- Ask ----------

export async function answerBusinessQuestion(userId: string, question: string, orgIdParam?: string | null) {
  const start = Date.now();
  const business = await getKaiBusiness(userId);
  const orgId = await resolveOrg(userId, orgIdParam);
  const facts = await getBusinessFacts(orgId);

  const routed = routeBusinessQuestion(question);
  const liveData: Record<string, unknown> = { orgId, facts: orgId ? facts : null };
  const liveSummary = orgId ? summarizeFacts(facts, routed.label) : null;

  let sources: { id: string; title: string; content: string; similarity: number }[] = [];
  if (business) {
    sources = await searchBusinessChunks(business.id, question, 4);
  }

  const mode = orgId && business ? "hybrid" : business ? "rag" : orgId ? "live" : "fallback";
  const chunkContext = sources.length
    ? sources.map((s, i) => `[${i + 1}] TITLE: ${s.title}\n${s.content.slice(0, 900)}`).join("\n\n")
    : null;

  let answer: string;
  const llmKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;

  if (llmKey) {
    const contextLines = [
      business ? `COMPANY: ${business.companyName}${business.industry ? ` (${business.industry})` : ""}${business.description ? ` — ${business.description}` : ""}` : null,
      liveSummary ? `LIVE BUSINESS DATA (from Business OS):\n${liveSummary}` : null,
      chunkContext ? `COMPANY DOCUMENTS (from your knowledge base):\n${chunkContext}` : null,
    ].filter(Boolean);

    const systemPrompt = `You are KAI, the intelligence layer of this company. You answer questions about the company's own business — its sales, orders, inventory, finance, customers, and its own documents. Be direct and precise. Use only the provided live data and documents; if the data does not cover the question, say what data would answer it.

${contextLines.join("\n\n") || "No company data connected yet. Guide the user to connect Business OS or upload documents in the Company Brain."}

QUESTION: ${question}`;

    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${llmKey}` },
        body: JSON.stringify({ model: "openai/gpt-4o-mini", messages: [{ role: "system", content: systemPrompt }], temperature: 0.4, max_tokens: 700 }),
      });
      const data = await res.json();
      answer = data.choices?.[0]?.message?.content?.trim() || liveSummary || "KAI could not generate a response.";
    } catch {
      answer = liveSummary ?? "KAI could not reach the language model. Connect Business OS data or upload documents to get answers.";
    }
  } else {
    answer =
      liveSummary ??
      (chunkContext
        ? `From your company documents:\n\n${sources.map((s) => `• ${s.title}`).join("\n")}\n\nAsk me to search your documents for details.`
        : "Connect your Business OS organization and train KAI with company documents in the Company Brain, then ask me anything about your business.");
  }

  const latencyMs = Date.now() - start;
  const record = await prisma.kaiBusinessQuestion.create({
    data: {
      businessId: business?.id ?? null,
      orgId,
      userId,
      question,
      answer,
      mode,
      liveData,
      sources,
      latencyMs,
    },
  });

  return { answer, mode, sources, liveData: { summary: liveSummary, routed: routed.label }, questionId: record.id, latencyMs };
}

export async function getBusinessQuestions(userId: string, limit = 50) {
  const business = await getKaiBusiness(userId);
  const where = business ? { businessId: business.id } : { userId };
  return prisma.kaiBusinessQuestion.findMany({ where, orderBy: { createdAt: "desc" }, take: limit });
}
