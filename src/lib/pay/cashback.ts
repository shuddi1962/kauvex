import prisma from "@/lib/db";

// ============================================================
// KAUVEX PAY — Cashback Rules Engine + Queue
// ============================================================

export interface CashbackRule {
  id: string;
  ruleName: string;
  categoryId: string | null;
  storefrontId: string | null;
  cashbackPercent: number;
  fundedBy: string;
  vendorId: string | null;
  minOrderValue: number;
  startDate: Date | null;
  endDate: Date | null;
  isActive: boolean;
}

export interface CashbackQueueItem {
  id: string;
  walletId: string;
  orderId: string;
  amount: number;
  ruleId: string | null;
  status: string;
  eligibleFrom: Date | null;
  creditedAt: Date | null;
  createdAt: Date;
}

export interface CalculateCashbackInput {
  orderId: string;
  orderTotal: number;
  categoryId?: string;
  storefrontId?: string;
  vendorId?: string;
}

export interface CashbackResult {
  eligible: boolean;
  amount: number;
  ruleId: string | null;
  ruleName: string | null;
  fundedBy: string;
  eligibleFrom: Date;
}

// ---- Calculate Cashback for an Order ----

export async function calculateCashback(input: CalculateCashbackInput): Promise<CashbackResult> {
  const now = new Date();

  const rules = await prisma.payCashbackRule.findMany({
    where: {
      isActive: true,
      startDate: { lte: now },
      OR: [
        { endDate: null },
        { endDate: { gte: now } },
      ],
    },
    orderBy: { cashbackPercent: "desc" },
  });

  let bestRule: CashbackRule | null = null;
  let bestAmount = 0;

  for (const rule of rules) {
    if (Number(rule.minOrderValue) > input.orderTotal) continue;

    if (rule.categoryId && rule.categoryId !== input.categoryId) continue;
    if (rule.storefrontId && rule.storefrontId !== input.storefrontId) continue;
    if (rule.vendorId && rule.fundedBy === "vendor" && rule.vendorId !== input.vendorId) continue;

    const amount = Math.round(input.orderTotal * (Number(rule.cashbackPercent) / 100) * 100) / 100;
    if (amount > bestAmount) {
      bestAmount = amount;
      bestRule = rule as CashbackRule;
    }
  }

  const eligibleFrom = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

  return {
    eligible: bestAmount > 0,
    amount: bestAmount,
    ruleId: bestRule?.id || null,
    ruleName: bestRule?.ruleName || null,
    fundedBy: bestRule?.fundedBy || "kauvex",
    eligibleFrom,
  };
}

// ---- Enqueue Cashback (after order placed) ----

export async function enqueueCashback(input: CalculateCashbackInput & { walletId: string }): Promise<CashbackQueueItem | null> {
  const cashback = await calculateCashback(input);
  if (!cashback.eligible) return null;

  const item = await prisma.payCashbackQueue.create({
    data: {
      walletId: input.walletId,
      orderId: input.orderId,
      amount: cashback.amount,
      ruleId: cashback.ruleId,
      status: "pending",
      eligibleFrom: cashback.eligibleFrom,
    },
  });

  return {
    id: item.id,
    walletId: item.walletId,
    orderId: item.orderId,
    amount: Number(item.amount),
    ruleId: item.ruleId,
    status: item.status,
    eligibleFrom: item.eligibleFrom,
    creditedAt: item.creditedAt,
    createdAt: item.createdAt,
  };
}

// ---- Process Matured Cashback (run daily via cron) ----

export async function processMaturedCashback(): Promise<number> {
  const now = new Date();

  const maturedItems = await prisma.payCashbackQueue.findMany({
    where: {
      status: "pending",
      eligibleFrom: { lte: now },
    },
  });

  let creditedCount = 0;

  for (const item of maturedItems) {
    try {
      const wallet = await prisma.payWallet.findUnique({ where: { id: item.walletId } });
      if (!wallet || wallet.status !== "active") continue;

      const currentBalance = Number(wallet.balance);
      const cashbackAmount = Number(item.amount);
      const newBalance = currentBalance + cashbackAmount;

      await prisma.$transaction([
        prisma.payWallet.update({
          where: { id: item.walletId },
          data: { balance: newBalance },
        }),
        prisma.payTransaction.create({
          data: {
            walletId: item.walletId,
            transactionType: "cashback",
            amount: cashbackAmount,
            direction: "credit",
            balanceBefore: currentBalance,
            balanceAfter: newBalance,
            referenceType: "order",
            referenceId: item.orderId,
            description: `Cashback credited for order`,
            gateway: "internal",
            status: "completed",
          },
        }),
        prisma.payCashbackQueue.update({
          where: { id: item.id },
          data: { status: "credited", creditedAt: now },
        }),
      ]);

      creditedCount++;
    } catch {
      // Skip failed items, will retry next run
    }
  }

  return creditedCount;
}

// ---- Get Cashback for Customer ----

export async function getCustomerCashback(
  walletId: string,
  options: { limit?: number; offset?: number; status?: string } = {}
): Promise<{ items: CashbackQueueItem[]; total: number; pendingAmount: number; creditedAmount: number }> {
  const { limit = 20, offset = 0, status } = options;

  const where: Record<string, unknown> = { walletId };
  if (status) where.status = status;

  const [items, total, pendingAgg, creditedAgg] = await Promise.all([
    prisma.payCashbackQueue.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.payCashbackQueue.count({ where }),
    prisma.payCashbackQueue.aggregate({
      where: { walletId, status: "pending" },
      _sum: { amount: true },
    }),
    prisma.payCashbackQueue.aggregate({
      where: { walletId, status: "credited" },
      _sum: { amount: true },
    }),
  ]);

  return {
    items: items.map((i) => ({
      id: i.id,
      walletId: i.walletId,
      orderId: i.orderId,
      amount: Number(i.amount),
      ruleId: i.ruleId,
      status: i.status,
      eligibleFrom: i.eligibleFrom,
      creditedAt: i.creditedAt,
      createdAt: i.createdAt,
    })),
    total,
    pendingAmount: Number(pendingAgg._sum.amount || 0),
    creditedAmount: Number(creditedAgg._sum.amount || 0),
  };
}

// ---- Admin: Manage Cashback Rules ----

export async function createCashbackRule(data: {
  ruleName: string;
  categoryId?: string;
  storefrontId?: string;
  cashbackPercent: number;
  fundedBy?: string;
  vendorId?: string;
  minOrderValue?: number;
  startDate?: Date;
  endDate?: Date;
}): Promise<CashbackRule> {
  const rule = await prisma.payCashbackRule.create({
    data: {
      ruleName: data.ruleName,
      categoryId: data.categoryId || null,
      storefrontId: data.storefrontId || null,
      cashbackPercent: data.cashbackPercent,
      fundedBy: data.fundedBy || "kauvex",
      vendorId: data.vendorId || null,
      minOrderValue: data.minOrderValue || 0,
      startDate: data.startDate || null,
      endDate: data.endDate || null,
    },
  });

  return {
    id: rule.id,
    ruleName: rule.ruleName,
    categoryId: rule.categoryId,
    storefrontId: rule.storefrontId,
    cashbackPercent: Number(rule.cashbackPercent),
    fundedBy: rule.fundedBy,
    vendorId: rule.vendorId,
    minOrderValue: Number(rule.minOrderValue),
    startDate: rule.startDate,
    endDate: rule.endDate,
    isActive: rule.isActive,
  };
}

export async function getAllCashbackRules(): Promise<CashbackRule[]> {
  const rules = await prisma.payCashbackRule.findMany({ orderBy: { createdAt: "desc" } });
  return rules.map((r) => ({
    id: r.id,
    ruleName: r.ruleName,
    categoryId: r.categoryId,
    storefrontId: r.storefrontId,
    cashbackPercent: Number(r.cashbackPercent),
    fundedBy: r.fundedBy,
    vendorId: r.vendorId,
    minOrderValue: Number(r.minOrderValue),
    startDate: r.startDate,
    endDate: r.endDate,
    isActive: r.isActive,
  }));
}

export async function toggleCashbackRule(ruleId: string, isActive: boolean): Promise<void> {
  await prisma.payCashbackRule.update({
    where: { id: ruleId },
    data: { isActive },
  });
}
