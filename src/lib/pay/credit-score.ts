import prisma from "@/lib/db";

// ============================================================
// KAUVEX PAY — Credit Partner Integration (Carbon/FairMoney/Lenco)
// ============================================================

export interface CreditCheckResult {
  eligible: boolean;
  score: number;
  limit: number;
  partner: string;
  reference: string;
  reason?: string;
}

export interface CreditPartnerConfig {
  partner: "carbon" | "fairmoney" | "lenco";
  apiKey: string;
  baseUrl: string;
  enabled: boolean;
}

// ---- Check BNPL Eligibility ----

export async function checkBnplEligibility(
  customerId: string,
  orderAmount: number
): Promise<{
  eligible: boolean;
  limit: number;
  reason?: string;
  needsExternalCheck: boolean;
}> {
  const config = await getPartnerConfig();
  const bnplConfig = await import("./bnpl").then((m) => m.getBnplConfig());

  // Check existing eligibility record
  let eligibility = await prisma.payBnplEligibility.findUnique({
    where: { customerId },
  });

  if (!eligibility) {
    eligibility = await prisma.payBnplEligibility.create({
      data: {
        customerId,
        isEligible: false,
        currentLimit: bnplConfig.newCustomerLimit,
        availableLimit: bnplConfig.newCustomerLimit,
        status: "not_evaluated",
      },
    });
  }

  // Check if banned or suspended
  if (eligibility.status === "banned") {
    return { eligible: false, limit: 0, reason: "Account banned from BNPL", needsExternalCheck: false };
  }
  if (eligibility.status === "suspended") {
    return {
      eligible: false,
      limit: 0,
      reason: eligibility.suspendedReason || "Account suspended",
      needsExternalCheck: false,
    };
  }

  // Check account requirements
  const profile = await prisma.profile.findUnique({ where: { id: customerId } });
  if (!profile) {
    return { eligible: false, limit: 0, reason: "Account not found", needsExternalCheck: false };
  }

  // Account age check (3+ months)
  const accountAge = Date.now() - new Date(profile.createdAt).getTime();
  const threeMonths = 90 * 24 * 60 * 60 * 1000;
  if (accountAge < threeMonths) {
    return {
      eligible: false,
      limit: 0,
      reason: "Account must be at least 3 months old",
      needsExternalCheck: false,
    };
  }

  // Order history check (2+ completed orders)
  const completedOrders = await prisma.order.count({
    where: {
      customerId,
      status: { in: ["delivered", "completed"] },
    },
  });
  if (completedOrders < 2) {
    return {
      eligible: false,
      limit: 0,
      reason: "At least 2 completed orders required",
      needsExternalCheck: false,
    };
  }

  // Check if payment method exists
  if (!eligibility.isEligible && eligibility.status === "not_evaluated") {
    await prisma.payBnplEligibility.update({
      where: { customerId },
      data: {
        isEligible: true,
        status: "eligible",
        lastEvaluated: new Date(),
      },
    });
    eligibility.isEligible = true;
  }

  // Check available limit
  const availableLimit = Number(eligibility.availableLimit);
  if (orderAmount > availableLimit) {
    return {
      eligible: false,
      limit: availableLimit,
      reason: `Order amount exceeds available BNPL limit of ₦${availableLimit.toLocaleString()}`,
      needsExternalCheck: false,
    };
  }

  // External credit check for large orders
  const needsExternalCheck = orderAmount >= bnplConfig.creditCheckThreshold;

  if (needsExternalCheck && config) {
    try {
      const creditResult = await performExternalCreditCheck(customerId, orderAmount, config);
      if (!creditResult.eligible) {
        return {
          eligible: false,
          limit: creditResult.limit,
          reason: creditResult.reason || "Credit check failed",
          needsExternalCheck: true,
        };
      }

      // Update eligibility with partner score
      await prisma.payBnplEligibility.update({
        where: { customerId },
        data: {
          creditPartnerScore: creditResult.score,
          currentLimit: Math.max(availableLimit, creditResult.limit),
          availableLimit: Math.max(availableLimit, creditResult.limit) - Number(eligibility.usedLimit),
          lastEvaluated: new Date(),
        },
      });
    } catch {
      // If external check fails, fall back to internal scoring
    }
  }

  return {
    eligible: true,
    limit: availableLimit,
    needsExternalCheck,
  };
}

// ---- Perform External Credit Check ----

async function performExternalCreditCheck(
  customerId: string,
  orderAmount: number,
  config: CreditPartnerConfig
): Promise<CreditCheckResult> {
  const profile = await prisma.profile.findUnique({ where: { id: customerId } });
  if (!profile) throw new Error("Customer not found");

  const baseUrl = config.baseUrl;
  const headers = {
    Authorization: `Bearer ${config.apiKey}`,
    "Content-Type": "application/json",
  };

  if (config.partner === "carbon") {
    const res = await fetch(`${baseUrl}/v1/sessions`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        email: profile.email,
        phone: profile.phone,
        first_name: profile.fullName?.split(" ")[0],
        last_name: profile.fullName?.split(" ").slice(1).join(" "),
        amount: orderAmount,
      }),
    });

    const data = await res.json();
    return {
      eligible: data.status === "approved",
      score: data.credit_score || 0,
      limit: data.approved_limit || 0,
      partner: "carbon",
      reference: data.session_id || "",
      reason: data.decline_reason,
    };
  }

  if (config.partner === "fairmoney") {
    const res = await fetch(`${baseUrl}/api/v1/loan/apply`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        email: profile.email,
        phone: profile.phone,
        amount: orderAmount,
        purpose: "bnpl_checkout",
      }),
    });

    const data = await res.json();
    return {
      eligible: data.status === "approved",
      score: data.score || 0,
      limit: data.approved_amount || 0,
      partner: "fairmoney",
      reference: data.loan_id || "",
      reason: data.decline_reason,
    };
  }

  if (config.partner === "lenco") {
    const res = await fetch(`${baseUrl}/v1/credit/assess`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        customer_id: customerId,
        email: profile.email,
        phone: profile.phone,
        amount: orderAmount,
      }),
    });

    const data = await res.json();
    return {
      eligible: data.approved,
      score: data.score || 0,
      limit: data.credit_limit || 0,
      partner: "lenco",
      reference: data.assessment_id || "",
      reason: data.reason,
    };
  }

  throw new Error(`Unknown credit partner: ${config.partner}`);
}

// ---- Transfer Debt to Credit Partner ----

export async function transferDebtToPartner(
  agreementId: string
): Promise<{ success: boolean; partnerReference: string }> {
  const agreement = await prisma.payBnplAgreement.findUnique({
    where: { id: agreementId },
  });

  if (!agreement) throw new Error("Agreement not found");
  if (agreement.status !== "overdue" && agreement.status !== "defaulted") {
    throw new Error("Agreement must be overdue or defaulted");
  }

  const config = await getPartnerConfig();
  if (!config) throw new Error("No credit partner configured");

  const outstanding = Number(agreement.totalOutstanding);

  try {
    const result = await performExternalCreditCheck(
      agreement.customerId,
      outstanding,
      config
    );

    await prisma.payBnplAgreement.update({
      where: { id: agreementId },
      data: {
        creditPartner: config.partner,
        creditPartnerReference: result.reference,
      },
    });

    return { success: true, partnerReference: result.reference };
  } catch {
    return { success: false, partnerReference: "" };
  }
}

// ---- Get Partner Config ----

async function getPartnerConfig(): Promise<CreditPartnerConfig | null> {
  const partner = process.env.CREDIT_PARTNER || "carbon";
  const apiKey = process.env.CREDIT_PARTNER_API_KEY;
  const baseUrl = process.env.CREDIT_PARTNER_BASE_URL;

  if (!apiKey || !baseUrl) return null;

  return {
    partner: partner as "carbon" | "fairmoney" | "lenco",
    apiKey,
    baseUrl,
    enabled: true,
  };
}

// ---- Get Eligibility for Customer ----

export async function getCustomerEligibility(customerId: string) {
  let eligibility = await prisma.payBnplEligibility.findUnique({
    where: { customerId },
  });

  if (!eligibility) {
    const bnplConfig = await import("./bnpl").then((m) => m.getBnplConfig());
    eligibility = await prisma.payBnplEligibility.create({
      data: {
        customerId,
        isEligible: false,
        currentLimit: bnplConfig.newCustomerLimit,
        availableLimit: bnplConfig.newCustomerLimit,
        status: "not_evaluated",
      },
    });
  }

  return {
    isEligible: eligibility.isEligible,
    currentLimit: Number(eligibility.currentLimit),
    usedLimit: Number(eligibility.usedLimit),
    availableLimit: Number(eligibility.availableLimit),
    eligibilityScore: eligibility.eligibilityScore,
    creditPartnerScore: eligibility.creditPartnerScore,
    successfulRepayments: eligibility.successfulRepayments,
    missedPayments: eligibility.missedPayments,
    status: eligibility.status,
    lastEvaluated: eligibility.lastEvaluated,
  };
}

// ---- Update Eligibility After Repayment ----

export async function updateEligibilityAfterRepayment(
  customerId: string,
  successful: boolean
): Promise<void> {
  const eligibility = await prisma.payBnplEligibility.findUnique({
    where: { customerId },
  });

  if (!eligibility) return;

  if (successful) {
    const newSuccessful = eligibility.successfulRepayments + 1;
    const bnplConfig = await import("./bnpl").then((m) => m.getBnplConfig());

    let newLimit = bnplConfig.newCustomerLimit;
    if (newSuccessful >= 10) newLimit = bnplConfig.limitAfter10;
    else if (newSuccessful >= 5) newLimit = bnplConfig.limitAfter5;
    else if (newSuccessful >= 2) newLimit = bnplConfig.limitAfter2;

    await prisma.payBnplEligibility.update({
      where: { customerId },
      data: {
        successfulRepayments: newSuccessful,
        currentLimit: newLimit,
        availableLimit: newLimit - Number(eligibility.usedLimit),
        status: "eligible",
        lastEvaluated: new Date(),
      },
    });
  } else {
    const newMissed = eligibility.missedPayments + 1;

    let newStatus = "eligible";
    if (newMissed >= 5) newStatus = "banned";
    else if (newMissed >= 2) newStatus = "suspended";

    await prisma.payBnplEligibility.update({
      where: { customerId },
      data: {
        missedPayments: newMissed,
        status: newStatus,
        suspendedReason: newStatus === "suspended" ? "Multiple missed payments" : undefined,
        lastEvaluated: new Date(),
      },
    });
  }
}
