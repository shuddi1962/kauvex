import prisma from "@/lib/prisma";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "";
const PAYSTACK_API = "https://api.paystack.co";

interface InitiateUssdParams {
  accountId: string;
  amount: number;
  currency?: string;
  purpose?: string;
  metadata?: Record<string, unknown>;
}

interface PaystackUssdResponse {
  status: boolean;
  message: string;
  data?: {
    reference: string;
    ussd_code?: string;
    transaction_reference?: string;
    amount: number;
    currency: string;
    status: string;
    paid_at?: string;
  };
}

export async function initiateUssdPayment(params: InitiateUssdParams) {
  const reference = `USS-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const existing = await prisma.ussdTransaction.findUnique({ where: { reference } });
  if (existing) throw new Error("Duplicate reference");

  const metadata = {
    ...params.metadata,
    purpose: params.purpose || "wallet_topup",
    account_id: params.accountId,
  };

  // Call Paystack charge API with USSD channel
  const paystackRes = await fetch(`${PAYSTACK_API}/charge`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: `ussd-${params.accountId}@kauvex.com`,
      amount: Math.round(params.amount * 100),
      currency: params.currency || "NGN",
      reference,
      metadata,
      channels: ["ussd"],
      ussd: { type: "737" },
    }),
  });

  const paystackData: PaystackUssdResponse = await paystackRes.json();

  if (!paystackData.status || !paystackData.data) {
    throw new Error(paystackData.message || "Paystack USSD charge failed");
  }

  const transaction = await prisma.ussdTransaction.create({
    data: {
      accountId: params.accountId,
      reference,
      amount: params.amount,
      currency: params.currency || "NGN",
      ussdCode: paystackData.data.ussd_code || null,
      bank: null,
      provider: "paystack",
      status: "pending",
      purpose: params.purpose || "wallet_topup",
      metadata: metadata as any,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    },
  });

  return transaction;
}

export async function verifyUssdPayment(reference: string) {
  const res = await fetch(`${PAYSTACK_API}/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
  });

  const data = await res.json();

  if (!data.status) {
    throw new Error(data.message || "Paystack verification failed");
  }

  const txData = data.data;
  const newStatus = txData.status === "success" ? "completed" : txData.status === "failed" ? "failed" : "pending";

  await prisma.ussdTransaction.update({
    where: { reference },
    data: {
      status: newStatus,
      paidAt: newStatus === "completed" ? new Date() : null,
    },
  });

  return { status: newStatus, paystackData: txData };
}

export async function handleWebhook(payload: any) {
  const event = payload.event;
  const txRef = payload?.data?.reference;

  if (!txRef) return { handled: false, reason: "No reference" };

  const newStatus = event === "charge.success" ? "completed" : event === "charge.failed" ? "failed" : "pending";

  await prisma.ussdTransaction.update({
    where: { reference: txRef },
    data: {
      status: newStatus,
      paidAt: newStatus === "completed" ? new Date() : null,
      metadata: payload as any,
    },
  });

  return { handled: true, reference: txRef, status: newStatus };
}

export async function getUssdTransactions(accountId?: string, limit = 20) {
  const where = accountId ? { accountId } : {};
  return prisma.ussdTransaction.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getUssdStats() {
  const [total, pending, completed, failed, totalAmount] = await Promise.all([
    prisma.ussdTransaction.count(),
    prisma.ussdTransaction.count({ where: { status: "pending" } }),
    prisma.ussdTransaction.count({ where: { status: "completed" } }),
    prisma.ussdTransaction.count({ where: { status: "failed" } }),
    prisma.ussdTransaction.aggregate({ _sum: { amount: true }, where: { status: "completed" } }),
  ]);

  return { total, pending, completed, failed, totalAmount: totalAmount._sum.amount || 0 };
}