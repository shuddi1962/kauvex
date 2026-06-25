import prisma from "@/lib/db";

// ============================================================
// KAUVEX PAY — BNPL Agreement Management
// ============================================================

export interface BnplAgreement {
  id: string;
  customerId: string;
  orderId: string;
  totalAmount: number;
  currency: string;
  installmentCount: number;
  installmentAmount: number;
  firstPaymentPercent: number;
  firstPaymentAmount: number;
  interestRate: number;
  flatFee: number;
  promotionalPeriodEnd: Date | null;
  paymentMethodType: string | null;
  paymentMethodId: string | null;
  creditPartner: string | null;
  creditPartnerReference: string | null;
  creditScore: number | null;
  status: string;
  totalPaid: number;
  totalOutstanding: number;
  missedPaymentCount: number;
  lateFeesAccrued: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BnplPaymentSchedule {
  id: string;
  agreementId: string;
  installmentNumber: number;
  amount: number;
  lateFee: number;
  totalCharged: number;
  dueDate: Date;
  status: string;
  paidAt: Date | null;
  paymentMethod: string | null;
  gatewayReference: string | null;
  retryCount: number;
}

export interface BnplConfig {
  minOrderValue: number;
  installmentCount: number;
  installmentIntervalDays: number;
  firstPaymentPercent: number;
  promoPeriodEnd: string;
  postPromoFlatFee: number;
  postPromoInterestRate: number;
  lateFeeAmount: number;
  lateFeeGraceDays: number;
  maxRetryCount: number;
  newCustomerLimit: number;
  limitAfter2: number;
  limitAfter5: number;
  limitAfter10: number;
  creditCheckThreshold: number;
  eligibleCategories: string[];
}

export interface CreateAgreementInput {
  customerId: string;
  orderId: string;
  totalAmount: number;
  paymentMethodType: "card" | "wallet";
  paymentMethodId: string;
  creditPartner?: string;
  creditPartnerReference?: string;
  creditScore?: number;
}

// ---- Get BNPL Config ----

export async function getBnplConfig(): Promise<BnplConfig> {
  const configs = await prisma.payBnplConfig.findMany();
  const map: Record<string, string> = {};
  for (const c of configs) {
    map[c.configKey] = c.configValue;
  }

  return {
    minOrderValue: Number(map.min_order_value || 5000),
    installmentCount: Number(map.installment_count || 4),
    installmentIntervalDays: Number(map.installment_interval_days || 21),
    firstPaymentPercent: Number(map.first_payment_percent || 25),
    promoPeriodEnd: map.promo_0_percent_end_date || "",
    postPromoFlatFee: Number(map.post_promo_flat_fee || 0),
    postPromoInterestRate: Number(map.post_promo_interest_rate || 0),
    lateFeeAmount: Number(map.late_fee_amount || 500),
    lateFeeGraceDays: Number(map.late_fee_grace_days || 7),
    maxRetryCount: Number(map.max_retry_count || 3),
    newCustomerLimit: Number(map.new_customer_limit || 20000),
    limitAfter2: Number(map.limit_after_2_agreements || 50000),
    limitAfter5: Number(map.limit_after_5_agreements || 100000),
    limitAfter10: Number(map.limit_after_10_agreements || 200000),
    creditCheckThreshold: Number(map.credit_check_threshold || 50000),
    eligibleCategories: JSON.parse(map.eligible_categories || "[]"),
  };
}

export async function updateBnplConfig(key: string, value: string, updatedBy?: string): Promise<void> {
  await prisma.payBnplConfig.upsert({
    where: { configKey: key },
    update: { configValue: value, updatedBy: updatedBy || null },
    create: { configKey: key, configValue: value, updatedBy: updatedBy || null },
  });
}

// ---- Create BNPL Agreement ----

export async function createBnplAgreement(input: CreateAgreementInput): Promise<BnplAgreement> {
  const config = await getBnplConfig();
  const now = new Date();

  const installmentCount = config.installmentCount;
  const firstPaymentPercent = config.firstPaymentPercent;
  const firstPaymentAmount = Math.round(input.totalAmount * (firstPaymentPercent / 100) * 100) / 100;
  const remainingAmount = input.totalAmount - firstPaymentAmount;
  const installmentAmount = Math.round((remainingAmount / (installmentCount - 1)) * 100) / 100;

  const promoEnd = config.promoPeriodEnd ? new Date(config.promoPeriodEnd) : null;
  const isPromoActive = promoEnd ? promoEnd > now : false;
  const interestRate = isPromoActive ? 0 : config.postPromoInterestRate;
  const flatFee = isPromoActive ? 0 : config.postPromoFlatFee;

  const agreement = await prisma.payBnplAgreement.create({
    data: {
      customerId: input.customerId,
      orderId: input.orderId,
      totalAmount: input.totalAmount,
      installmentCount,
      installmentAmount,
      firstPaymentPercent,
      firstPaymentAmount,
      interestRate,
      flatFee,
      promotionalPeriodEnd: promoEnd,
      paymentMethodType: input.paymentMethodType,
      paymentMethodId: input.paymentMethodId,
      creditPartner: input.creditPartner || null,
      creditPartnerReference: input.creditPartnerReference || null,
      creditScore: input.creditScore || null,
      status: "active",
      totalPaid: firstPaymentAmount,
      totalOutstanding: remainingAmount + flatFee,
    },
  });

  // Create installment schedule
  const payments = [];
  for (let i = 1; i <= installmentCount; i++) {
    const dueDate = new Date(now);
    if (i === 1) {
      dueDate.setDate(dueDate.getDate()); // Due today
    } else {
      dueDate.setDate(dueDate.getDate() + config.installmentIntervalDays * (i - 1));
    }

    payments.push({
      agreementId: agreement.id,
      installmentNumber: i,
      amount: i === 1 ? firstPaymentAmount : installmentAmount,
      lateFee: 0,
      totalCharged: i === 1 ? firstPaymentAmount : installmentAmount,
      dueDate,
      status: i === 1 ? "paid" : "pending",
      paidAt: i === 1 ? now : null,
      paymentMethod: i === 1 ? input.paymentMethodType : null,
    });
  }

  await prisma.payBnplPayment.createMany({ data: payments });

  return formatAgreement(agreement);
}

// ---- Get Agreement Details ----

export async function getAgreement(agreementId: string): Promise<BnplAgreement | null> {
  const agreement = await prisma.payBnplAgreement.findUnique({ where: { id: agreementId } });
  return agreement ? formatAgreement(agreement) : null;
}

export async function getAgreementWithPayments(agreementId: string): Promise<{
  agreement: BnplAgreement;
  payments: BnplPaymentSchedule[];
} | null> {
  const agreement = await prisma.payBnplAgreement.findUnique({
    where: { id: agreementId },
    include: { payments: { orderBy: { installmentNumber: "asc" } } },
  });
  if (!agreement) return null;

  return {
    agreement: formatAgreement(agreement),
    payments: agreement.payments.map(formatPayment),
  };
}

export async function getCustomerAgreements(
  customerId: string,
  options: { limit?: number; offset?: number; status?: string } = {}
): Promise<{ agreements: BnplAgreement[]; total: number }> {
  const { limit = 20, offset = 0, status } = options;
  const where: Record<string, unknown> = { customerId };
  if (status) where.status = status;

  const [agreements, total] = await Promise.all([
    prisma.payBnplAgreement.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.payBnplAgreement.count({ where }),
  ]);

  return {
    agreements: agreements.map(formatAgreement),
    total,
  };
}

// ---- Process Auto-Charge (daily cron at 9AM) ----

export async function processBnplAutoCharge(): Promise<{
  charged: number;
  failed: number;
  skipped: number;
}> {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const duePayments = await prisma.payBnplPayment.findMany({
    where: {
      status: "pending",
      installmentNumber: { gt: 1 }, // Skip first (paid at checkout)
      dueDate: { lte: today },
    },
    include: { agreement: true },
  });

  let charged = 0;
  let failed = 0;
  let skipped = 0;

  for (const payment of duePayments) {
    if (payment.agreement.status === "cancelled" || payment.agreement.status === "completed") {
      skipped++;
      continue;
    }

    const config = await getBnplConfig();
    if (payment.retryCount >= config.maxRetryCount) {
      // Mark as failed, handle missed payment
      await handleMissedPayment(payment.id, payment.agreementId);
      failed++;
      continue;
    }

    // Attempt charge (in real implementation, this calls Paystack/Flutterwave)
    // For now, we mark as charged if wallet has sufficient funds
    try {
      const wallet = await prisma.payWallet.findFirst({
        where: { ownerId: payment.agreement.customerId },
      });

      if (wallet && Number(wallet.balance) >= Number(payment.amount)) {
        const currentBalance = Number(wallet.balance);
        const chargeAmount = Number(payment.amount) + Number(payment.lateFee);
        const newBalance = currentBalance - chargeAmount;

        await prisma.$transaction([
          prisma.payWallet.update({
            where: { id: wallet.id },
            data: { balance: newBalance },
          }),
          prisma.payTransaction.create({
            data: {
              walletId: wallet.id,
              transactionType: "bnpl_charge",
              amount: chargeAmount,
              direction: "debit",
              balanceBefore: currentBalance,
              balanceAfter: newBalance,
              referenceType: "bnpl_payment",
              referenceId: payment.id,
              description: `BNPL installment #${payment.installmentNumber} payment`,
              gateway: "internal",
              status: "completed",
            },
          }),
          prisma.payBnplPayment.update({
            where: { id: payment.id },
            data: {
              status: "paid",
              paidAt: now,
              paymentMethod: "wallet",
              totalCharged: chargeAmount,
              retryCount: payment.retryCount + 1,
            },
          }),
          prisma.payBnplAgreement.update({
            where: { id: payment.agreementId },
            data: {
              totalPaid: { increment: chargeAmount },
              totalOutstanding: { decrement: chargeAmount },
            },
          }),
        ]);

        charged++;
      } else {
        // Retry later
        await prisma.payBnplPayment.update({
          where: { id: payment.id },
          data: {
            retryCount: payment.retryCount + 1,
            lastRetryAt: now,
          },
        });
        failed++;
      }
    } catch {
      await prisma.payBnplPayment.update({
        where: { id: payment.id },
        data: {
          retryCount: payment.retryCount + 1,
          lastRetryAt: now,
        },
      });
      failed++;
    }
  }

  // Check if any agreements are now complete
  await completeAgreements();

  return { charged, failed, skipped };
}

// ---- Handle Missed Payment ----

export async function handleMissedPayment(paymentId: string, agreementId: string): Promise<void> {
  const config = await getBnplConfig();
  const now = new Date();

  const payment = await prisma.payBnplPayment.findUnique({ where: { id: paymentId } });
  if (!payment) return;

  const daysSinceDue = Math.floor((now.getTime() - payment.dueDate.getTime()) / (1000 * 60 * 60 * 24));

  let newStatus = "overdue";
  let lateFee = 0;

  if (daysSinceDue > config.lateFeeGraceDays) {
    lateFee = config.lateFeeAmount;
    newStatus = "overdue";
  }

  if (daysSinceDue > 30) {
    newStatus = "failed";
  }

  await prisma.$transaction([
    prisma.payBnplPayment.update({
      where: { id: paymentId },
      data: { status: newStatus, lateFee },
    }),
    prisma.payBnplAgreement.update({
      where: { id: agreementId },
      data: {
        missedPaymentCount: { increment: 1 },
        lateFeesAccrued: { increment: lateFee },
        totalOutstanding: { increment: lateFee },
        status: daysSinceDue > 30 ? "defaulted" : daysSinceDue > 14 ? "overdue" : "active",
      },
    }),
  ]);

  // If all retries exhausted and 7+ days overdue, suspend BNPL access
  if (daysSinceDue >= 7) {
    await prisma.payBnplEligibility.updateMany({
      where: { customerId: payment.agreementId },
      data: { status: "suspended", suspendedReason: `Overdue payment on agreement ${agreementId}` },
    });
  }
}

// ---- Early Repayment ----

export async function earlyRepayAgreement(
  agreementId: string,
  option: "next_installment" | "full_balance"
): Promise<{ success: boolean; amountPaid: number; remainingBalance: number }> {
  const agreement = await prisma.payBnplAgreement.findUnique({
    where: { id: agreementId },
    include: { payments: { where: { status: "pending" }, orderBy: { installmentNumber: "asc" } } },
  });

  if (!agreement || agreement.status === "completed" || agreement.status === "cancelled") {
    throw new Error("Agreement not found or not active");
  }

  let amountToPay: number;
  let paymentsToUpdate: string[];

  if (option === "next_installment") {
    const nextPayment = agreement.payments[0];
    if (!nextPayment) throw new Error("No pending payments");
    amountToPay = Number(nextPayment.amount) + Number(nextPayment.lateFee);
    paymentsToUpdate = [nextPayment.id];
  } else {
    amountToPay = Number(agreement.totalOutstanding);
    paymentsToUpdate = agreement.payments.map((p) => p.id);
  }

  // Deduct from wallet
  const wallet = await prisma.payWallet.findFirst({
    where: { ownerId: agreement.customerId },
  });

  if (!wallet || Number(wallet.balance) < amountToPay) {
    throw new Error("Insufficient wallet balance for early repayment");
  }

  const currentBalance = Number(wallet.balance);
  const newBalance = currentBalance - amountToPay;

  await prisma.$transaction([
    prisma.payWallet.update({
      where: { id: wallet.id },
      data: { balance: newBalance },
    }),
    prisma.payTransaction.create({
      data: {
        walletId: wallet.id,
        transactionType: "bnpl_charge",
        amount: amountToPay,
        direction: "debit",
        balanceBefore: currentBalance,
        balanceAfter: newBalance,
        referenceType: "bnpl_payment",
        referenceId: agreementId,
        description: `BNPL early repayment (${option === "full_balance" ? "full balance" : "next installment"})`,
        gateway: "internal",
        status: "completed",
      },
    }),
    prisma.payBnplPayment.updateMany({
      where: { id: { in: paymentsToUpdate } },
      data: { status: "paid", paidAt: new Date(), paymentMethod: "wallet" },
    }),
    prisma.payBnplAgreement.update({
      where: { id: agreementId },
      data: {
        totalPaid: { increment: amountToPay },
        totalOutstanding: { decrement: amountToPay },
        status: option === "full_balance" ? "completed" : "active",
        completedAt: option === "full_balance" ? new Date() : null,
      },
    }),
  ]);

  return {
    success: true,
    amountPaid: amountToPay,
    remainingBalance: Math.max(0, Number(agreement.totalOutstanding) - amountToPay),
  };
}

// ---- Complete Agreements ----

async function completeAgreements(): Promise<void> {
  const completedAgreements = await prisma.payBnplAgreement.findMany({
    where: {
      status: "active",
      totalOutstanding: { lte: 0 },
    },
  });

  for (const agreement of completedAgreements) {
    await prisma.payBnplAgreement.update({
      where: { id: agreement.id },
      data: { status: "completed", completedAt: new Date() },
    });

    // Update eligibility
    const eligibility = await prisma.payBnplEligibility.findUnique({
      where: { customerId: agreement.customerId },
    });

    if (eligibility) {
      const config = await getBnplConfig();
      const newSuccessful = eligibility.successfulRepayments + 1;
      let newLimit = config.newCustomerLimit;

      if (newSuccessful >= 10) newLimit = config.limitAfter10;
      else if (newSuccessful >= 5) newLimit = config.limitAfter5;
      else if (newSuccessful >= 2) newLimit = config.limitAfter2;

      await prisma.payBnplEligibility.update({
        where: { customerId: agreement.customerId },
        data: {
          successfulRepayments: newSuccessful,
          currentLimit: newLimit,
          availableLimit: newLimit - Number(eligibility.usedLimit),
          status: "eligible",
        },
      });
    }
  }
}

// ---- Send Reminders ----

export async function sendBnplReminders(): Promise<number> {
  const now = new Date();
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  const upcomingPayments = await prisma.payBnplPayment.findMany({
    where: {
      status: "pending",
      installmentNumber: { gt: 1 },
      dueDate: { lte: threeDaysFromNow, gte: now },
      reminderSent: false,
    },
    include: { agreement: true },
  });

  let sent = 0;
  for (const payment of upcomingPayments) {
    // In production, this sends SMS + email notification
    await prisma.payBnplPayment.update({
      where: { id: payment.id },
      data: { reminderSent: true, reminderSentAt: now },
    });
    sent++;
  }

  return sent;
}

// ---- Admin: Get All Agreements ----

export async function getAllAgreements(
  options: { limit?: number; offset?: number; status?: string } = {}
): Promise<{ agreements: BnplAgreement[]; total: number }> {
  const { limit = 50, offset = 0, status } = options;
  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  const [agreements, total] = await Promise.all([
    prisma.payBnplAgreement.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.payBnplAgreement.count({ where }),
  ]);

  return {
    agreements: agreements.map(formatAgreement),
    total,
  };
}

// ---- Admin: Get BNPL Metrics ----

export async function getBnplMetrics(): Promise<{
  totalActive: number;
  totalOutstanding: number;
  overdueCount: number;
  overdueAmount: number;
  completedThisMonth: number;
  lateFeesCollected: number;
  averageRepaymentRate: number;
}> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalActive,
    outstandingAgg,
    overdueData,
    completedThisMonth,
    lateFeesAgg,
    onTimeCount,
    totalCount,
  ] = await Promise.all([
    prisma.payBnplAgreement.count({ where: { status: "active" } }),
    prisma.payBnplAgreement.aggregate({ where: { status: "active" }, _sum: { totalOutstanding: true } }),
    prisma.payBnplAgreement.findMany({
      where: { status: { in: ["overdue", "defaulted"] } },
      select: { totalOutstanding: true },
    }),
    prisma.payBnplAgreement.count({
      where: { status: "completed", completedAt: { gte: monthStart } },
    }),
    prisma.payBnplAgreement.aggregate({ _sum: { lateFeesAccrued: true } }),
    prisma.payBnplPayment.count({ where: { status: "paid", installmentNumber: { gt: 1 } } }),
    prisma.payBnplPayment.count({ where: { installmentNumber: { gt: 1 } } }),
  ]);

  return {
    totalActive,
    totalOutstanding: Number(outstandingAgg._sum.totalOutstanding || 0),
    overdueCount: overdueData.length,
    overdueAmount: overdueData.reduce((sum, a) => sum + Number(a.totalOutstanding), 0),
    completedThisMonth,
    lateFeesCollected: Number(lateFeesAgg._sum.lateFeesAccrued || 0),
    averageRepaymentRate: totalCount > 0 ? Math.round((onTimeCount / totalCount) * 100) : 100,
  };
}

// ---- Helpers ----

function formatAgreement(a: Record<string, unknown>): BnplAgreement {
  return {
    id: a.id as string,
    customerId: a.customerId as string,
    orderId: a.orderId as string,
    totalAmount: Number(a.totalAmount),
    currency: a.currency as string,
    installmentCount: a.installmentCount as number,
    installmentAmount: Number(a.installmentAmount),
    firstPaymentPercent: Number(a.firstPaymentPercent),
    firstPaymentAmount: Number(a.firstPaymentAmount),
    interestRate: Number(a.interestRate),
    flatFee: Number(a.flatFee),
    promotionalPeriodEnd: a.promotionalPeriodEnd as Date | null,
    paymentMethodType: a.paymentMethodType as string | null,
    paymentMethodId: a.paymentMethodId as string | null,
    creditPartner: a.creditPartner as string | null,
    creditPartnerReference: a.creditPartnerReference as string | null,
    creditScore: a.creditScore as number | null,
    status: a.status as string,
    totalPaid: Number(a.totalPaid),
    totalOutstanding: Number(a.totalOutstanding),
    missedPaymentCount: a.missedPaymentCount as number,
    lateFeesAccrued: Number(a.lateFeesAccrued),
    createdAt: a.createdAt as Date,
    updatedAt: a.updatedAt as Date,
  };
}

function formatPayment(p: Record<string, unknown>): BnplPaymentSchedule {
  return {
    id: p.id as string,
    agreementId: p.agreementId as string,
    installmentNumber: p.installmentNumber as number,
    amount: Number(p.amount),
    lateFee: Number(p.lateFee),
    totalCharged: Number(p.totalCharged),
    dueDate: p.dueDate as Date,
    status: p.status as string,
    paidAt: p.paidAt as Date | null,
    paymentMethod: p.paymentMethod as string | null,
    gatewayReference: p.gatewayReference as string | null,
    retryCount: p.retryCount as number,
  };
}
