import { prisma } from "@/lib/prisma";

export interface CODCollection {
  jobId: string;
  partnerId?: string;
  orderId?: string;
  amount: number;
  currencyCode: string;
  status: string;
  collectedAt?: Date;
  remittedAt?: Date;
}

export async function createCODCollection(data: {
  jobId: string;
  partnerId?: string;
  orderId?: string;
  amount: number;
  currencyCode: string;
}) {
  return (prisma as any).glxCodCollection.create({
    data: {
      jobId: data.jobId,
      partnerId: data.partnerId || null,
      orderId: data.orderId || null,
      amount: data.amount,
      currencyCode: data.currencyCode,
      status: "pending",
    },
  });
}

export async function markCODCollected(jobId: string, partnerId: string) {
  return (prisma as any).glxCodCollection.updateMany({
    where: { jobId, status: "pending" },
    data: {
      status: "collected",
      partnerId,
      collectedAt: new Date(),
    },
  });
}

export async function markCODRemitted(jobId: string, remittanceReference: string) {
  return (prisma as any).glxCodCollection.updateMany({
    where: { jobId, status: "collected" },
    data: {
      status: "remitted",
      remittedAt: new Date(),
      remittanceReference,
    },
  });
}

export async function getPendingCODRemittances(countryCode?: string) {
  const where: any = { status: "collected" };
  if (countryCode) {
    where.job = { countryCode };
  }
  return (prisma as any).glxCodCollection.findMany({
    where,
    orderBy: { collectedAt: "asc" },
  });
}

export async function getCODSummary(countryCode?: string) {
  const where: any = {};
  if (countryCode) {
    where.countryCode = countryCode;
  }

  const pending = await (prisma as any).glxCodCollection.count({
    where: { ...where, status: "pending" },
  });
  const collected = await (prisma as any).glxCodCollection.count({
    where: { ...where, status: "collected" },
  });
  const remitted = await (prisma as any).glxCodCollection.count({
    where: { ...where, status: "remitted" },
  });

  return { pending, collected, remitted };
}
