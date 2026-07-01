import prisma from "@/lib/db";

export type RiskLevel = "low" | "medium" | "high";
export type FraudOutcome = "proceeded" | "flagged" | "held" | "declined";

export interface FraudSignal {
  name: string;
  score: number;
  description: string;
}

export interface FraudCheckResult {
  riskScore: number;
  riskLevel: RiskLevel;
  signals: FraudSignal[];
  outcome: FraudOutcome;
}

const BLACKLIST_CACHE = new Map<string, number>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function isBlacklisted(type: string, value: string): Promise<boolean> {
  const cacheKey = `${type}:${value}`;
  const cached = BLACKLIST_CACHE.get(cacheKey);
  if (cached && Date.now() < cached) return true;

  const record = await prisma.kv_sec_blacklist.findFirst({
    where: { listType: type, value, isActive: true },
  });

  if (record) {
    if (record.expiresAt && record.expiresAt < new Date()) return false;
    BLACKLIST_CACHE.set(cacheKey, Date.now() + CACHE_TTL);
    return true;
  }
  return false;
}

async function getRecentOrderCount(userId: string, hours: number): Promise<number> {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  return prisma.mfgOrder.count({
    where: { buyerId: userId, createdAt: { gte: since } },
  });
}

async function getRecentFailedPayments(userId: string, hours: number): Promise<number> {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  return prisma.kv_sec_fraud_scores.count({
    where: {
      userId,
      createdAt: { gte: since },
      riskScore: { gte: 71 },
    },
  });
}

async function getAccountAge(userId: string): Promise<number> {
  const profile = await prisma.profiles.findUnique({
    where: { id: userId },
    select: { createdAt: true },
  });
  if (!profile) return 0;
  return Math.floor((Date.now() - profile.createdAt.getTime()) / (1000 * 60 * 60 * 24));
}

export async function evaluateFraud(
  userId: string,
  orderValue: number,
  context: {
    shippingAddress?: string;
    billingAddress?: string;
    ip?: string;
    deviceFingerprint?: string;
    email?: string;
    paymentMethodBin?: string;
  }
): Promise<FraudCheckResult> {
  const signals: FraudSignal[] = [];
  let totalScore = 0;

  // 1. Blacklist checks
  if (context.ip && await isBlacklisted("ip", context.ip)) {
    signals.push({ name: "blacklisted_ip", score: 40, description: "IP address is on the blacklist" });
    totalScore += 40;
  }
  if (context.email && await isBlacklisted("email", context.email)) {
    signals.push({ name: "blacklisted_email", score: 40, description: "Email is on the blacklist" });
    totalScore += 40;
  }
  if (context.paymentMethodBin && await isBlacklisted("card_bin", context.paymentMethodBin)) {
    signals.push({ name: "blacklisted_card_bin", score: 35, description: "Card BIN is on the blacklist" });
    totalScore += 35;
  }
  if (context.deviceFingerprint && await isBlacklisted("device", context.deviceFingerprint)) {
    signals.push({ name: "blacklisted_device", score: 35, description: "Device fingerprint is on the blacklist" });
    totalScore += 35;
  }

  // 2. New account + high-value first order
  const accountAge = await getAccountAge(userId);
  if (accountAge <= 7 && orderValue > 500) {
    signals.push({ name: "new_account_high_value", score: 25, description: `New account (${accountAge}d) with high-value order ($${orderValue})` });
    totalScore += 25;
  } else if (accountAge <= 30 && orderValue > 2000) {
    signals.push({ name: "young_account_large_order", score: 15, description: `Young account (${accountAge}d) with large order ($${orderValue})` });
    totalScore += 15;
  }

  // 3. Multiple failed payment attempts
  const failedPayments = await getRecentFailedPayments(userId, 24);
  if (failedPayments >= 3) {
    signals.push({ name: "multiple_failed_payments", score: 30, description: `${failedPayments} failed payment attempts in 24h` });
    totalScore += 30;
  } else if (failedPayments >= 2) {
    signals.push({ name: "repeated_payment_failures", score: 15, description: `${failedPayments} failed payment attempts in 24h` });
    totalScore += 15;
  }

  // 4. Shipping ≠ billing address + new account
  if (context.shippingAddress && context.billingAddress && context.shippingAddress !== context.billingAddress) {
    if (accountAge <= 30) {
      signals.push({ name: "address_mismatch_new_account", score: 20, description: "Shipping ≠ billing address on new account" });
      totalScore += 20;
    } else {
      signals.push({ name: "address_mismatch", score: 5, description: "Shipping ≠ billing address" });
      totalScore += 5;
    }
  }

  // 5. Velocity check: too many orders in short window
  const recentOrders24h = await getRecentOrderCount(userId, 24);
  if (recentOrders24h >= 10) {
    signals.push({ name: "high_velocity_orders", score: 25, description: `${recentOrders24h} orders in 24h` });
    totalScore += 25;
  } else if (recentOrders24h >= 5) {
    signals.push({ name: "moderate_velocity", score: 10, description: `${recentOrders24h} orders in 24h` });
    totalScore += 10;
  }

  // 6. High-value order without account history
  if (orderValue > 10000 && accountAge <= 30) {
    signals.push({ name: "very_high_value_new_account", score: 30, description: `$${orderValue} order from account less than 30 days old` });
    totalScore += 30;
  }

  // Cap at 100
  totalScore = Math.min(totalScore, 100);

  // Determine outcome
  let outcome: FraudOutcome;
  let riskLevel: RiskLevel;
  if (totalScore <= 30) {
    outcome = "proceeded";
    riskLevel = "low";
  } else if (totalScore <= 70) {
    outcome = "flagged";
    riskLevel = "medium";
  } else {
    outcome = "held";
    riskLevel = "high";
  }

  return { riskScore: totalScore, riskLevel, signals, outcome };
}

export async function recordFraudScore(
  orderId: string | null,
  userId: string,
  result: FraudCheckResult
) {
  return prisma.kv_sec_fraud_score.create({
    data: {
      orderId,
      userId,
      riskScore: result.riskScore,
      riskSignals: result.signals as any,
      outcome: result.outcome,
    },
  });
}

export async function addToBlacklist(
  type: string,
  value: string,
  reason: string,
  addedBy: string,
  expiresAt?: Date
) {
  return prisma.kv_sec_blacklist.upsert({
    where: { listType_value: { listType: type, value } },
    create: { listType: type, value, reason, addedBy, expiresAt },
    update: { reason, isActive: true, expiresAt },
  });
}

export async function removeFromBlacklist(type: string, value: string) {
  return prisma.kv_sec_blacklist.updateMany({
    where: { listType: type, value },
    data: { isActive: false },
  });
}

export async function getBlacklistedItems(type?: string, activeOnly = true) {
  const where: any = {};
  if (type) where.listType = type;
  if (activeOnly) where.isActive = true;
  return prisma.kv_sec_blacklist.findMany({ where, orderBy: { createdAt: "desc" } });
}

export async function getFraudStats() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [totalToday, flaggedToday, heldToday, declinedToday] = await Promise.all([
    prisma.kv_sec_fraud_score.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.kv_sec_fraud_score.count({ where: { createdAt: { gte: todayStart }, outcome: "flagged" } }),
    prisma.kv_sec_fraud_score.count({ where: { createdAt: { gte: todayStart }, outcome: "held" } }),
    prisma.kv_sec_fraud_score.count({ where: { createdAt: { gte: todayStart }, outcome: "declined" } }),
  ]);

  return { totalToday, flaggedToday, heldToday, declinedToday };
}
