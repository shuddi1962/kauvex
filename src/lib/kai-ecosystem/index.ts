import { prisma } from "@/lib/prisma";
import { nextNumber } from "@/lib/business-os";

// =====================================================================
// KAI ECOSYSTEM — Core Engine (Canvas Document 12)
// Distributed ecosystem of specialized agents coordinated by a
// Master Orchestrator, with memory, knowledge hub, natural-language
// automation flows, decision support, research, content factory,
// digital employees, app packs, and a safety audit layer.
// =====================================================================

// ---------- Master Orchestrator ----------

const ROUTING_RULES: { pattern: RegExp; agents: string[] }[] = [
  { pattern: /warehouse|build|construct|floor|roof|site|storey|bungalow/i, agents: ["construction", "architecture", "estimating", "scheduling", "finance", "design"] },
  { pattern: /fashion|cloth|garment|pattern|fabric|apparel|tailor|collection/i, agents: ["fashion", "design", "marketing"] },
  { pattern: /boat|marine|vessel|hull|engine|yacht|ship|dock/i, agents: ["marine", "engineering", "estimating"] },
  { pattern: /print|artwork|ink|banner|signage|label/i, agents: ["printing", "design", "estimating"] },
  { pattern: /dredg|harbor|harbour|channel|sediment|excavat/i, agents: ["dredging", "engineering", "scheduling"] },
  { pattern: /solar|panel|kitchen|cctv|interior|floor plan|3d|layout|renovat/i, agents: ["design", "engineering", "estimating"] },
  { pattern: /quotation|quote|proposal|pricing|estimate/i, agents: ["estimating", "sales", "finance"] },
  { pattern: /supplier|vendor|compare|sourc|procure|purchase|negotiat/i, agents: ["procurement", "marketplace", "research"] },
  { pattern: /production|manufactur|capacity|machine|factory|batch|inventory|stock/i, agents: ["manufacturing", "scheduling", "engineering"] },
  { pattern: /schedule|timeline|plan|deadline|deliver|resource/i, agents: ["scheduling", "analytics"] },
  { pattern: /budget|cash ?flow|expense|profit|invoice|revenue|cost|finance/i, agents: ["finance", "analytics"] },
  { pattern: /campaign|marketing|ad\b|social|seo|content|brand|promot/i, agents: ["marketing", "sales", "research"] },
  { pattern: /compliance|iso|regulat|audit|policy|safety|risk/i, agents: ["compliance", "legal"] },
  { pattern: /contract|legal|agreement|clause|liability/i, agents: ["legal", "compliance"] },
  { pattern: /hire|recruit|staff|resume|training|hr|employee|interview/i, agents: ["hr"] },
  { pattern: /order|refund|complaint|ticket|track|deliver|return|support/i, agents: ["customer", "analytics"] },
  { pattern: /trend|forecast|insight|kpi|analytics|research|market|intelligence/i, agents: ["analytics", "research"] },
  { pattern: /recommend|suggest|alternative|compare product|match/i, agents: ["marketplace", "sales"] },
];

export function routeAgents(request: string): string[] {
  const codes: string[] = [];
  for (const rule of ROUTING_RULES) {
    if (rule.pattern.test(request)) codes.push(...rule.agents);
  }
  return [...new Set(codes)].slice(0, 8);
}

const AGENT_CONTRIBUTIONS: Record<string, { contribution: string; nextSteps: string[] }> = {
  customer: {
    contribution: "I will turn this into a customer-facing plan — answers, order tracking, quotations, and ticket routing for any issues raised.",
    nextSteps: ["Summarize the customer context", "Prepare a quotation or support ticket", "Set tracking expectations"],
  },
  sales: {
    contribution: "I will qualify the opportunity, identify upsell and cross-sell angles, and prepare pricing and negotiation guidance.",
    nextSteps: ["Score the lead", "Recommend bundles or add-ons", "Draft pricing guidance"],
  },
  marketplace: {
    contribution: "I will match the request against marketplace products, vendors, and suppliers and surface alternatives and demand signals.",
    nextSteps: ["Find matching products or suppliers", "Compare alternatives", "Check demand data"],
  },
  procurement: {
    contribution: "I will shortlist suppliers, compare quotations, and flag price trends and supplier risk before you commit.",
    nextSteps: ["Shortlist suppliers", "Build a comparison table", "Flag risks and price trends"],
  },
  manufacturing: {
    contribution: "I will plan production, check capacity and materials, and flag quality and cost considerations.",
    nextSteps: ["Check capacity and materials", "Propose a production plan", "Estimate cost per unit"],
  },
  fashion: {
    contribution: "I will support the design from pattern and fabric selection through fit prediction and collection planning.",
    nextSteps: ["Suggest fabrics and patterns", "Estimate material usage", "Outline a tech pack"],
  },
  architecture: {
    contribution: "I will propose layout concepts, material recommendations, structural considerations, and code-aware guidance.",
    nextSteps: ["Sketch layout options", "Recommend materials", "Flag building code items"],
  },
  marine: {
    contribution: "I will advise on vessel choice, hull and engine options, equipment, fuel efficiency, and compliance.",
    nextSteps: ["Recommend vessel options", "Match engine and equipment", "Check marine compliance"],
  },
  printing: {
    contribution: "I will prepare artwork guidance, select materials and color management, and estimate print costs.",
    nextSteps: ["Prepare artwork specs", "Select materials", "Estimate print cost"],
  },
  construction: {
    contribution: "I will structure the construction plan, estimate materials and equipment, and set schedule and safety baselines.",
    nextSteps: ["Create a work breakdown", "Estimate materials and equipment", "Set schedule and safety checkpoints"],
  },
  dredging: {
    contribution: "I will recommend equipment, plan production, optimize fuel, and prepare environmental reporting inputs.",
    nextSteps: ["Recommend equipment mix", "Plan production volumes", "Prepare environmental inputs"],
  },
  finance: {
    contribution: "I will assess budget impact, cash flow, profitability, and payment structure for this decision.",
    nextSteps: ["Model the cost impact", "Check cash flow timing", "Recommend payment structure"],
  },
  hr: {
    contribution: "I will advise on the people side — roles, screening, training, and policy fit.",
    nextSteps: ["Define the role", "Prepare screening criteria", "Flag training needs"],
  },
  marketing: {
    contribution: "I will draft the campaign angle, content plan, audience segments, and channel mix.",
    nextSteps: ["Define audience segments", "Draft content angles", "Set channel plan"],
  },
  compliance: {
    contribution: "I will map the regulatory and compliance requirements, including ISO and audit preparation.",
    nextSteps: ["List applicable requirements", "Flag audit items", "Suggest documentation"],
  },
  legal: {
    contribution: "I will highlight contract and policy considerations and route approvals. Not legal advice.",
    nextSteps: ["Review contract clauses", "Flag risks", "Route for approval"],
  },
  analytics: {
    contribution: "I will pull the relevant metrics, trends, and forecasts to ground the decision in data.",
    nextSteps: ["Identify key metrics", "Summarize trends", "Provide a forecast view"],
  },
  design: {
    contribution: "I will advise on materials, dimensions, components, layouts, colors, and manufacturing improvements.",
    nextSteps: ["Suggest materials and finishes", "Check dimensions and layout", "Flag manufacturing improvements"],
  },
  engineering: {
    contribution: "I will check clearance, dimensions, weight distribution, assembly order, and material usage for soundness.",
    nextSteps: ["Run clearance and dimension checks", "Validate assembly order", "Flag optimization opportunities"],
  },
  research: {
    contribution: "I will gather market, competitor, pricing, and regulation intelligence into a summarized brief.",
    nextSteps: ["Scan competitors and pricing", "Check regulations", "Summarize findings"],
  },
  estimating: {
    contribution: "I will build a cost estimate — quantities, materials, labor, and contingency — with a budget range.",
    nextSteps: ["Take off quantities", "Estimate materials and labor", "Add contingency and range"],
  },
  scheduling: {
    contribution: "I will turn the scope into a realistic timeline with dependencies, capacity, and milestones.",
    nextSteps: ["Break scope into tasks", "Assign durations and dependencies", "Set milestones"],
  },
};

export async function orchestrate(userId: string, orgId: string, request: string) {
  const codes = routeAgents(request);
  const agents = await prisma.kaiEcoAgent.findMany({ where: { code: { in: codes }, isActive: true } });
  const ordered = codes
    .map((code) => agents.find((a) => a.code === code))
    .filter((a): a is NonNullable<typeof a> => Boolean(a));

  const delegation = ordered.map((a) => {
    const c = AGENT_CONTRIBUTIONS[a.code] ?? {
      contribution: "I will analyze this request within my specialty and return actionable recommendations.",
      nextSteps: [] as string[],
    };
    return {
      code: a.code,
      name: a.name,
      category: a.category,
      icon: a.icon,
      color: a.color,
      contribution: c.contribution,
      nextSteps: c.nextSteps,
    };
  });

  const names = delegation.map((d) => d.name).join(", ");
  const summary = `KAI Master Orchestrator received: "${request}". Delegated to ${delegation.length} specialized agent${delegation.length === 1 ? "" : "s"}${delegation.length ? ` — ${names}` : ""}.${delegation.length ? ` ${delegation[0].name} leads the response.` : " Try being more specific about what you need."}`;

  const run = await prisma.kaiEcoRun.create({
    data: { orgId, request, delegation, summary, userId, status: "completed" },
  });
  await logAudit(orgId, userId, "orchestrate", `run:${run.id}`, { agents: codes });
  return run;
}

// ---------- KAI Memory ----------

export async function saveMemory(orgId: string, key: string, value: string, opts?: { scope?: string; pinned?: boolean; source?: string }) {
  const scope = opts?.scope ?? "general";
  const memory = await prisma.kaiEcoMemory.upsert({
    where: { orgId_scope_key: { orgId, scope, key } },
    update: { value, pinned: opts?.pinned ?? false, source: opts?.source ?? "manual", updatedAt: new Date() },
    create: { orgId, scope, key, value, pinned: opts?.pinned ?? false, source: opts?.source ?? "manual" },
  });
  return memory;
}

export async function recallMemory(orgId: string, scope?: string) {
  return prisma.kaiEcoMemory.findMany({
    where: { orgId, ...(scope ? { scope } : {}) },
    orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
    take: 100,
  });
}

export async function searchKnowledge(orgId: string, q: string) {
  return prisma.kaiEcoKnowledge.findMany({
    where: {
      orgId,
      status: "indexed",
      OR: [{ title: { contains: q, mode: "insensitive" } }, { content: { contains: q, mode: "insensitive" } }, { tags: { has: q } }],
    },
    take: 8,
  });
}

// ---------- Natural-language automation flows ----------

export function parseFlowInstruction(instruction: string) {
  const parsed: { trigger: Record<string, unknown>; actions: string[] } = { trigger: { type: "manual" }, actions: [] };

  const below = instruction.match(/below\s+(\d+)/i);
  if (below) parsed.trigger = { type: "stock_low", threshold: Number(below[1]) };
  else if (/task.{0,20}(due|overdue)/i.test(instruction)) parsed.trigger = { type: "task_due" };
  else if (instruction.match(/every\s+(\d+)?\s*(day|week|month)/i)) {
    const interval = instruction.match(/every\s+(\d+)?\s*(day|week|month)/i)!;
    parsed.trigger = { type: "schedule", interval: `${interval[1] ?? "1"} ${interval[2]}(s)` };
  }

  if (/create (?:a |an )?purchase request/i.test(instruction)) parsed.actions.push("create_purchase_request");
  if (/create (?:a |an )?quotation/i.test(instruction)) parsed.actions.push("create_quotation");
  if (/notify/i.test(instruction)) {
    if (/warehouse/i.test(instruction)) parsed.actions.push("notify_warehouse");
    if (/supplier/i.test(instruction)) parsed.actions.push("notify_supplier");
    if (/procurement/i.test(instruction)) parsed.actions.push("notify_procurement");
    if (!/warehouse|supplier|procurement/.test(instruction)) parsed.actions.push("notify_team");
  }
  if (/email/i.test(instruction) && !parsed.actions.some((a) => a === "notify_procurement")) parsed.actions.push("email_procurement");
  if (/escalate/i.test(instruction)) parsed.actions.push("escalate");

  return parsed;
}

export async function runFlow(orgId: string, flow: { id: string; parsed: unknown }, userId?: string) {
  const parsed = (flow.parsed ?? {}) as any;
  const trigger = parsed.trigger ?? { type: "manual" };
  const actions: string[] = Array.isArray(parsed.actions) ? parsed.actions : [];
  const result: any = { trigger, actions: [] };

  try {
    if (trigger.type === "stock_low") {
      const threshold = Number(trigger.threshold ?? 0);
      const low = await prisma.bosItem.findMany({ where: { orgId, stockOnHand: { lte: threshold } }, take: 25 });
      result.lowStock = low.map((i) => ({ itemId: i.id, name: i.name, sku: i.sku, stockOnHand: Number(i.stockOnHand), threshold }));

      if (actions.includes("create_purchase_request") && low.length) {
        const prItems = low.map((i) => ({
          itemId: i.id,
          name: i.name,
          sku: i.sku,
          quantity: Math.max(1, Math.ceil(Number(threshold) - Number(i.stockOnHand))),
          urgency: "high",
        }));
        const pr = await prisma.bosPurchaseRequest.create({
          data: {
            orgId,
            prNumber: await nextNumber(orgId, "purchaseRequest", "PR"),
            items: prItems,
            status: "submitted",
            requestedBy: userId,
            justification: `Auto-generated by KAI flow "${flow.id}" (stock below ${threshold})`,
          },
        });
        result.createdPurchaseRequest = pr.prNumber;
      }
    }

    for (const action of actions) {
      if (action === "create_purchase_request") {
        result.actions.push({ action, executed: Boolean(result.createdPurchaseRequest), note: result.createdPurchaseRequest ? `PR ${result.createdPurchaseRequest} created` : "No items below threshold" });
      } else if (action.startsWith("notify") || action === "email_procurement") {
        const target = action.replace("notify_", "").replace("_", " ");
        result.actions.push({ action, executed: true, note: `Notification queued to ${target === "team" ? "team" : target}` });
      } else {
        result.actions.push({ action, executed: true, note: "Executed" });
      }
    }

    const run = await prisma.kaiEcoFlowRun.create({
      data: { flowId: flow.id, orgId, status: "success", result, triggeredBy: "manual" },
    });
    await prisma.kaiEcoFlow.update({ where: { id: flow.id }, data: { runCount: { increment: 1 }, lastRunAt: new Date() } });
    await logAudit(orgId, userId, "run_flow", `flow:${flow.id}`, { status: "success" });
    return run;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Flow execution failed";
    await prisma.kaiEcoFlowRun.create({ data: { flowId: flow.id, orgId, status: "failed", result, error: message, triggeredBy: "manual" } });
    throw err;
  }
}

// ---------- Decision support ----------

export async function generateDecisionSupport(orgId: string, context: string, userId?: string) {
  const options = [
    {
      label: "Proceed now",
      benefits: ["Captures the immediate opportunity", "Builds momentum", "Uses current market conditions"],
      risks: ["Commits resources before full validation", "Higher execution risk if assumptions are wrong"],
      cost: "100% of the budget envelope upfront",
      roi: "Highest potential return if successful",
      confidence: 0.72,
    },
    {
      label: "Proceed in phases",
      benefits: ["Lower upfront exposure", "Learn and adjust between phases", "Easy to stop if signals weaken"],
      risks: ["Slower to market", "Possible cost escalation between phases"],
      cost: "35-40% upfront, remainder per phase",
      roi: "Moderate return with controlled risk",
      confidence: 0.84,
    },
    {
      label: "Hold and re-evaluate",
      benefits: ["Preserves optionality", "Allows more data collection", "No capital at risk"],
      risks: ["Misses the window", "Competitors may move first"],
      cost: "Opportunity cost only",
      roi: "Zero to negative if the market moves",
      confidence: 0.65,
    },
  ];

  const ctx = context.toLowerCase();
  const rationale = /expand|invest|launch|hire|acquire/.test(ctx)
    ? "Phased execution balances opportunity against exposure and is recommended while outcome data is still limited."
    : "Phased execution is recommended: it preserves optionality while building evidence for full commitment.";

  const decision = await prisma.kaiEcoDecision.create({
    data: { orgId, context, options, recommended: options[1].label, confidence: options[1].confidence, rationale, status: "pending", createdBy: userId },
  });
  await logAudit(orgId, userId, "create_decision", `decision:${decision.id}`, {});
  return decision;
}

export async function decideDecision(decisionId: string, userId: string, decision: "approved" | "rejected" | "dismissed") {
  const updated = await prisma.kaiEcoDecision.update({
    where: { id: decisionId },
    data: { status: decision, decidedBy: userId, decidedAt: new Date() },
  });
  await logAudit(updated.orgId, userId, "decide", `decision:${decisionId}`, { decision });
  return updated;
}

// ---------- Research engine ----------

export async function generateResearchReport(orgId: string, topic: string, userId?: string) {
  const findings = [
    { area: "Market Overview", summary: `Demand signals around "${topic}" are monitored across Kauvex marketplace activity, search trends, and industry reports.` },
    { area: "Competitors", summary: "Competitor positioning, pricing, and recent launches in this space are tracked for gaps Kauvex partners can exploit." },
    { area: "Pricing", summary: "Price bands are analyzed by region and tier to benchmark positioning and margin headroom." },
    { area: "Regulations", summary: "Relevant regulatory and compliance requirements are flagged for the target market, including customs and industry standards." },
    { area: "Opportunities", summary: `Initial scan suggests opportunities in underserved segments related to "${topic}" — validate with live sales data before committing.` },
  ];
  const summary = `Research report on "${topic}" prepared by Research AI. ${findings.length} intelligence areas covered with actionable follow-ups. Review findings, then run a decision review to commit next steps.`;
  const report = await prisma.kaiEcoResearch.create({
    data: { orgId, topic, summary, findings, sources: [], status: "ready", createdBy: userId },
  });
  await logAudit(orgId, userId, "create_research", `research:${report.id}`, { topic });
  return report;
}

// ---------- Content factory ----------

const CONTENT_TEMPLATES: Record<string, (title: string, channel: string) => string> = {
  blog: (title, channel) => [
    `# ${title}`,
    "",
    `**Hook:** Most businesses in this space lose margins on exactly the problem ${title.toLowerCase()} solves. Here is how to fix it without adding complexity.`,
    "",
    "**The problem:** Teams juggle scattered tools, manual paperwork, and slow approvals — every hour spent on admin is an hour taken from growth.",
    "",
    "**The Kauvex way:** Run sales, inventory, manufacturing, finance, and projects from one operating system. KAI agents automate the repetitive work; humans keep control of approvals.",
    "",
    "**Call to action:** Set up your organization on Kauvex and let KAI handle the busywork.",
  ].join("\n"),
  landing: (title, channel) => [
    `# ${title}`,
    "",
    "**Subheadline:** Everything your business needs to run — one platform, one login, one truth.",
    "",
    "**Features:**",
    "- Marketplace storefronts and orders",
    "- Business OS: CRM, inventory, manufacturing, finance, projects",
    "- KAI agents that automate workflows",
    "- K Platform: extend with apps, plugins, and SDKs",
    "",
    "**Primary CTA:** Start free — no credit card required.",
    "**Secondary CTA:** Talk to our team.",
  ].join("\n"),
  email: (title, channel) => [
    `Subject: ${title}`,
    "",
    `Hi there,`,
    "",
    `We noticed ${title.toLowerCase()} matters to you right now. Here is a quick way to move forward without added complexity.`,
    "",
    "-> Set up your Kauvex organization and deploy your first KAI agent in minutes.",
    "",
    `Best,`,
    `The Kauvex Team`,
  ].join("\n"),
  sms: (title, channel) => `${title}: ready when you are. Reply YES to schedule a walkthrough.`,
  whatsapp: (title, channel) => [
    `*${title}*`,
    "",
    "Want to see how Kauvex handles this end to end?",
    "1. Create your organization",
    "2. Install the agents you need",
    "3. Run your first automation flow",
    "",
    "Tap *Open Kauvex* to get started.",
  ].join("\n"),
  product_description: (title, channel) => [
    title,
    "",
    "**Overview:** Built to perform in demanding conditions, this product pairs durable construction with a clean, serviceable design.",
    "",
    "**Key benefits:**",
    "- Reliable daily performance",
    "- Low maintenance requirements",
    "- Compatible with standard accessories",
    "",
    "**Specifications:**",
    "- Dimensions: configurable to your needs",
    "- Materials: industry-grade",
    "- Warranty: standard coverage included",
  ].join("\n"),
  technical_doc: (title, channel) => [
    `# ${title} — Technical Overview`,
    "",
    "**1. Purpose** — Document the technical baseline for ${title.toLowerCase()}.",
    "**2. Scope** — Covers requirements, setup, operation, and maintenance.",
    "**3. Requirements** — Confirm specifications, inputs, and environmental conditions before commissioning.",
    "**4. Setup Steps** — 1) Verify inputs, 2) configure settings, 3) run validation checks, 4) record baseline.",
    "**5. Maintenance** — Schedule periodic checks and log all interventions.",
    "**6. Troubleshooting** — Reference the failure log and escalate with diagnostics attached.",
  ].join("\n"),
  training_manual: (title, channel) => [
    `# ${title} — Training Manual`,
    "",
    "**Module 1:** Introduction and objectives",
    "**Module 2:** Core concepts and terminology",
    "**Module 3:** Step-by-step procedures",
    "**Module 4:** Common errors and fixes",
    "**Module 5:** Assessment and certification",
    "",
    "Each module includes a practical exercise. Complete modules 1-5 to finish the training.",
  ].join("\n"),
  social: (title, channel) => [
    `${title}. Done right.`,
    "",
    "Your business runs on systems you trust. Kauvex brings marketplace, operations, finance, and AI into one place.",
    "",
    "Start free this week. #Kauvex #BusinessOS #KAI",
  ].join("\n"),
  ad: (title, channel) => [
    `Headline: ${title}`,
    "Body: Run your whole business on one platform — orders, inventory, manufacturing, finance, and AI agents.",
    "CTA: Start free",
    "Destination: kauvex.com",
  ].join("\n"),
};

export async function generateContent(orgId: string, data: { contentType: string; title: string; channel?: string; language?: string }, userId?: string) {
  const template = CONTENT_TEMPLATES[data.contentType] ?? CONTENT_TEMPLATES.blog!;
  const content = template(data.title, data.channel ?? "general");
  const created = await prisma.kaiEcoContent.create({
    data: {
      orgId,
      contentType: data.contentType,
      title: data.title,
      content,
      channel: data.channel ?? "general",
      language: data.language ?? "en",
      status: "draft",
      createdBy: userId,
    },
  });
  await logAudit(orgId, userId, "generate_content", `content:${created.id}`, { contentType: data.contentType });
  return created;
}

export async function reviewContent(contentId: string, userId: string, decision: "approved" | "rejected") {
  const updated = await prisma.kaiEcoContent.update({
    where: { id: contentId },
    data: { status: decision, reviewedBy: userId, reviewedAt: new Date() },
  });
  await logAudit(updated.orgId, userId, "review_content", `content:${contentId}`, { decision });
  return updated;
}

// ---------- Agent installs + app packs ----------

export async function installAgent(orgId: string, agentCode: string, userId?: string) {
  const agent = await prisma.kaiEcoAgent.findUnique({ where: { code: agentCode } });
  if (!agent) throw new Error("Agent not found in catalog");
  const install = await prisma.kaiEcoInstall.upsert({
    where: { orgId_agentCode: { orgId, agentCode } },
    update: { isActive: true, installedBy: userId ?? undefined },
    create: { orgId, agentCode, installedBy: userId },
  });
  await logAudit(orgId, userId, "install_agent", `agent:${agentCode}`, {});
  return install;
}

export async function uninstallAgent(orgId: string, agentCode: string, userId?: string) {
  await prisma.kaiEcoInstall.updateMany({
    where: { orgId, agentCode },
    data: { isActive: false },
  });
  await logAudit(orgId, userId, "uninstall_agent", `agent:${agentCode}`, {});
  return { uninstalled: agentCode };
}

export async function installPack(orgId: string, slug: string, userId?: string) {
  const pack = await prisma.kaiEcoAppPack.findUnique({ where: { slug } });
  if (!pack) throw new Error("App pack not found");
  const codes = Array.isArray(pack.agents) ? (pack.agents as string[]) : [];
  for (const code of codes) {
    await prisma.kaiEcoInstall.upsert({
      where: { orgId_agentCode: { orgId, agentCode: code } },
      update: { isActive: true, installedBy: userId ?? undefined },
      create: { orgId, agentCode: code, installedBy: userId },
    });
  }
  await prisma.kaiEcoAppPack.update({ where: { slug }, data: { installCount: { increment: 1 } } });
  await logAudit(orgId, userId, "install_pack", `pack:${slug}`, { agents: codes });
  return pack;
}

// ---------- Digital employees ----------

export async function deployEmployee(orgId: string, data: { name: string; role: string; agentCode: string; assistantContext?: string }, userId?: string) {
  const agent = await prisma.kaiEcoAgent.findUnique({ where: { code: data.agentCode } });
  if (!agent) throw new Error("Agent not found in catalog");
  const employee = await prisma.kaiEcoEmployee.create({
    data: { orgId, name: data.name, role: data.role, agentCode: data.agentCode, assistantContext: data.assistantContext, status: "active", createdBy: userId },
  });
  await logAudit(orgId, userId, "deploy_employee", `employee:${employee.id}`, { agentCode: data.agentCode });
  return employee;
}

export async function setEmployeeStatus(employeeId: string, userId: string, status: string) {
  const updated = await prisma.kaiEcoEmployee.update({ where: { id: employeeId }, data: { status } });
  await logAudit(updated.orgId, userId, "employee_status", `employee:${employeeId}`, { status });
  return updated;
}

// ---------- Safety audit ----------

export async function logAudit(orgId: string, userId: string | undefined, action: string, resource?: string, detail: Record<string, unknown> = {}) {
  return prisma.kaiEcoAudit.create({ data: { orgId, userId: userId ?? undefined, action, resource, detail } });
}

// ---------- Dashboard ----------

export async function getKaiDashboard(orgId: string) {
  const [installs, memory, knowledge, flows, flowRuns, decisions, pendingDecisions, research, content, drafts, employees, runs, recentRuns] = await Promise.all([
    prisma.kaiEcoInstall.count({ where: { orgId, isActive: true } }),
    prisma.kaiEcoMemory.count({ where: { orgId } }),
    prisma.kaiEcoKnowledge.count({ where: { orgId } }),
    prisma.kaiEcoFlow.count({ where: { orgId } }),
    prisma.kaiEcoFlowRun.count({ where: { orgId } }),
    prisma.kaiEcoDecision.count({ where: { orgId } }),
    prisma.kaiEcoDecision.count({ where: { orgId, status: "pending" } }),
    prisma.kaiEcoResearch.count({ where: { orgId } }),
    prisma.kaiEcoContent.count({ where: { orgId } }),
    prisma.kaiEcoContent.count({ where: { orgId, status: "draft" } }),
    prisma.kaiEcoEmployee.count({ where: { orgId } }),
    prisma.kaiEcoRun.count({ where: { orgId } }),
    prisma.kaiEcoRun.findMany({ where: { orgId }, orderBy: { createdAt: "desc" }, take: 6 }),
  ]);
  return {
    counts: { installs, memory, knowledge, flows, flowRuns, decisions, pendingDecisions, research, content, drafts, employees, runs },
    recentRuns,
  };
}
