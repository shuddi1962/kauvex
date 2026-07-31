import { prisma } from "@/lib/prisma";
import { createHash, createHmac, randomBytes, randomUUID } from "crypto";

// =====================================================================
// K PLATFORM — SDK & Developer Ecosystem Engine (Canvas Document 13)
// Module registry, app marketplace, API keys, OAuth apps, webhooks,
// event bus, module reviews, and developer earnings.
// =====================================================================

const KEY_PREFIX = "kvx_";
const WEBHOOK_SIGNING_SECRET = createHash("sha256").update(randomBytes(32)).digest("hex");

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function hmacSha256(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function generateClientId(): string {
  return `kv_${randomBytes(16).toString("hex")}`;
}

export function generateClientSecret(): string {
  return randomBytes(32).toString("hex");
}

// ---------- API keys ----------

export async function createApiKey(userId: string, orgId: string | null, name: string, scopes: string[], expiresAt?: Date) {
  const raw = `${KEY_PREFIX}${randomBytes(24).toString("hex")}`;
  const key = await prisma.kpApiKey.create({
    data: {
      userId,
      orgId,
      name,
      keyPrefix: raw.slice(0, 12),
      keyHash: sha256(raw),
      scopes,
      expiresAt,
    },
  });
  return { ...key, raw };
}

export function verifyApiKey(raw: string) {
  const hash = sha256(raw);
  return hash;
}

export async function rotateApiKey(userId: string, id: string) {
  const existing = await prisma.kpApiKey.findFirst({ where: { id, userId } });
  if (!existing) throw new Error("API key not found");
  await prisma.kpApiKey.update({ where: { id }, data: { revoked: true } });
  const raw = `${KEY_PREFIX}${randomBytes(24).toString("hex")}`;
  const key = await prisma.kpApiKey.create({
    data: {
      userId,
      orgId: existing.orgId,
      name: `${existing.name} (rotated)`,
      keyPrefix: raw.slice(0, 12),
      keyHash: sha256(raw),
      scopes: existing.scopes,
    },
  });
  return { ...key, raw };
}

// ---------- OAuth apps ----------

export async function createOauthApp(developerId: string, data: { name: string; description?: string; redirectUris: string[]; scopes: string[] }) {
  return prisma.kpOauthApp.create({
    data: {
      developerId,
      name: data.name,
      description: data.description,
      clientId: generateClientId(),
      clientSecretHash: sha256(generateClientSecret()),
      redirectUris: data.redirectUris,
      scopes: data.scopes,
    },
  });
}

// ---------- Webhooks ----------

export async function createWebhook(orgId: string, data: { name: string; eventTypes: string[]; url: string; createdBy?: string }) {
  const secret = randomBytes(24).toString("hex");
  return prisma.kpWebhook.create({
    data: { orgId, name: data.name, eventTypes: data.eventTypes, url: data.url, secret, createdBy: data.createdBy },
  });
}

export async function testWebhook(webhook: { id: string; url: string; secret: string | null }) {
  const payload = JSON.stringify({ id: randomUUID(), event_type: "webhook.test", payload: { message: "Kauvex webhook test" }, created_at: new Date().toISOString() });
  const signature = hmacSha256(payload, webhook.secret ?? WEBHOOK_SIGNING_SECRET);
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(webhook.url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Kauvex-Signature": `sha256=${signature}` },
      body: payload,
      signal: controller.signal,
    });
    clearTimeout(timer);
    return { ok: res.ok, status: res.status };
  } catch (err) {
    return { ok: false, status: 0, error: (err as Error).message };
  }
}

export async function deliverWebhook(webhookId: string) {
  const webhook = await prisma.kpWebhook.findUnique({ where: { id: webhookId } });
  if (!webhook || !webhook.isActive) return { ok: false, reason: "inactive" };
  const payload = JSON.stringify({ id: randomUUID(), event_type: "webhook.delivery", payload: {}, created_at: new Date().toISOString() });
  const signature = hmacSha256(payload, webhook.secret ?? WEBHOOK_SIGNING_SECRET);
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(webhook.url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Kauvex-Signature": `sha256=${signature}` },
      body: payload,
      signal: controller.signal,
    });
    clearTimeout(timer);
    await prisma.kpWebhook.update({
      where: { id: webhookId },
      data: { lastDeliveredAt: new Date(), failureCount: res.ok ? 0 : { increment: 1 } },
    });
    return { ok: res.ok, status: res.status };
  } catch {
    await prisma.kpWebhook.update({ where: { id: webhookId }, data: { failureCount: { increment: 1 } } });
    return { ok: false, status: 0 };
  }
}

// ---------- Event bus ----------

export async function emitEvent(orgId: string | null, eventType: string, payload: Record<string, unknown>, source?: string) {
  const event = await prisma.kpEvent.create({ data: { orgId, eventType, payload, source } });

  if (orgId) {
    const webhooks = await prisma.kpWebhook.findMany({ where: { orgId, isActive: true } });
    const matching = webhooks.filter((w) => (w.eventTypes as string[]).includes(eventType) || (w.eventTypes as string[]).includes("*"));
    for (const webhook of matching) {
      try {
        const signature = hmacSha256(JSON.stringify({ id: event.id, event_type: event.eventType, payload: event.payload }), webhook.secret ?? "");
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(webhook.url, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Kauvex-Signature": `sha256=${signature}` },
          body: JSON.stringify({ id: event.id, event_type: event.eventType, payload: event.payload }),
          signal: controller.signal,
        });
        clearTimeout(timer);
        await prisma.kpWebhook.update({
          where: { id: webhook.id },
          data: { lastDeliveredAt: new Date(), failureCount: res.ok ? 0 : { increment: 1 } },
        });
      } catch {
        await prisma.kpWebhook.update({ where: { id: webhook.id }, data: { failureCount: { increment: 1 } } });
      }
    }
  }

  await prisma.kpEvent.update({
    where: { id: event.id },
    data: { status: "delivered", attempts: 1, deliveredAt: new Date() },
  });
  return event;
}

// ---------- Module marketplace ----------

export async function getModulesCatalog(orgId?: string | null) {
  const modules = await prisma.kpModule.findMany({ orderBy: [{ status: "asc" }, { installCount: "desc" }] });
  let installed: Record<string, { id: string; version: string; status: string }> = {};
  if (orgId) {
    const installs = await prisma.kpInstall.findMany({ where: { orgId } });
    installed = Object.fromEntries(installs.map((i) => [i.moduleId, { id: i.id, version: i.version, status: i.status }]));
  }
  return { modules, installed, orgId };
}

export async function installModule(orgId: string, moduleId: string, userId: string, config?: Record<string, unknown>) {
  const module = await prisma.kpModule.findUnique({ where: { id: moduleId } });
  if (!module) throw new Error("Module not found");
  if (module.status !== "published") throw new Error("Module is not published");

  const existing = await prisma.kpInstall.findUnique({ where: { orgId_moduleId: { orgId, moduleId } } });
  if (existing) throw new Error("Module already installed");

  const install = await prisma.kpInstall.create({
    data: { orgId, moduleId, version: module.version, config: config ?? {}, installedBy: userId },
  });
  await prisma.kpModule.update({ where: { id: moduleId }, data: { installCount: { increment: 1 } } });

  if (module.developerId && Number(module.priceMonthly) > 0) {
    const commission = (Number(module.priceMonthly) * Number(module.commissionRate)) / 100;
    await prisma.kpEarning.create({
      data: { developerId: module.developerId, moduleId, amount: commission, earningType: "sale", status: "pending", period: new Date().toISOString().slice(0, 7) },
    });
  }

  await emitEvent(orgId, "module.installed", { moduleId, moduleName: module.name, slug: module.slug }, "k-platform");
  return install;
}

export async function uninstallModule(orgId: string, moduleId: string) {
  const existing = await prisma.kpInstall.findUnique({ where: { orgId_moduleId: { orgId, moduleId } } });
  if (!existing) throw new Error("Module is not installed");
  await prisma.kpInstall.delete({ where: { id: existing.id } });
  await prisma.kpModule.update({ where: { id: moduleId }, data: { installCount: { decrement: 1 } } });
  return { uninstalled: true };
}

// ---------- Reviews ----------

export async function reviewModule(orgId: string, moduleId: string, rating: number, comment?: string) {
  if (rating < 1 || rating > 5) throw new Error("Rating must be between 1 and 5");
  const module = await prisma.kpModule.findUnique({ where: { id: moduleId } });
  if (!module) throw new Error("Module not found");

  const existing = await prisma.kpReview.findFirst({ where: { moduleId, orgId } });
  const review = existing
    ? await prisma.kpReview.update({ where: { id: existing.id }, data: { rating, comment } })
    : await prisma.kpReview.create({ data: { moduleId, orgId, rating, comment } });

  const reviews = await prisma.kpReview.findMany({ where: { moduleId } });
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / (reviews.length || 1);
  await prisma.kpModule.update({ where: { id: moduleId }, data: { rating: Math.round(avg * 100) / 100 } });
  return review;
}

// ---------- Developer earnings ----------

export async function getDeveloperEarnings(developerId: string) {
  const earnings = await prisma.kpEarning.findMany({
    where: { developerId },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  const summary = {
    total: earnings.reduce((s, e) => s + Number(e.amount), 0),
    pending: earnings.filter((e) => e.status === "pending").reduce((s, e) => s + Number(e.amount), 0),
    paid: earnings.filter((e) => e.status === "paid").reduce((s, e) => s + Number(e.amount), 0),
    byType: Object.fromEntries(
      [...new Set(earnings.map((e) => e.earningType))].map((t) => [t, earnings.filter((e) => e.earningType === t).length])
    ),
  };
  return { earnings, summary };
}

// ---------- Dashboard ----------

export async function getPlatformDashboard(orgId?: string | null, userId?: string) {
  const [modules, installs, events, webhooks, keys] = await Promise.all([
    prisma.kpModule.findMany({ orderBy: { installCount: "desc" }, take: 8 }),
    orgId ? prisma.kpInstall.findMany({ where: { orgId } }) : Promise.resolve([]),
    orgId ? prisma.kpEvent.count({ where: { orgId } }) : prisma.kpEvent.count(),
    orgId ? prisma.kpWebhook.findMany({ where: { orgId } }) : Promise.resolve([]),
    userId ? prisma.kpApiKey.findMany({ where: { userId } }) : Promise.resolve([]),
  ]);

  const published = modules.filter((m) => m.status === "published");
  const earningsSummary = userId ? (await getDeveloperEarnings(userId)).summary : null;
  const recentEvents = orgId
    ? await prisma.kpEvent.findMany({ where: { orgId }, orderBy: { createdAt: "desc" }, take: 10 })
    : await prisma.kpEvent.findMany({ orderBy: { createdAt: "desc" }, take: 10 });

  return {
    stats: {
      publishedModules: published.length,
      totalInstalls: installs.length,
      totalEvents: events,
      webhooks: webhooks.length,
      apiKeys: keys.length,
      installCount: modules.reduce((s, m) => s + m.installCount, 0),
    },
    modules,
    installs,
    webhooks,
    keys,
    recentEvents,
    earningsSummary,
  };
}
