import { prisma } from "@/lib/prisma";

export async function createReturn(data: {
  originalWaybill: string;
  originalShipmentId: string;
  reason?: string;
  returnAddress?: string;
  returnCity?: string;
  returnCountry?: string;
}) {
  const returnWaybill = `KVX-RET-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const originalShipment = await (prisma as any).expressShipment.findUnique({
    where: { id: data.originalShipmentId },
  });

  const coveredByOriginal = originalShipment?.insurancePurchased || false;
  const returnFee = coveredByOriginal ? 0 : 2500;

  const record = await (prisma as any).kspShipmentReturn.create({
    data: {
      originalWaybill: data.originalWaybill,
      originalShipmentId: data.originalShipmentId,
      reason: data.reason,
      returnWaybill,
      returnAddress: data.returnAddress,
      returnCity: data.returnCity,
      returnCountry: data.returnCountry,
      status: "label_created",
      returnFee,
      coveredByOriginal,
    },
  });

  await (prisma as any).kspPlatformEvent.create({
    data: {
      eventType: "express_booking",
      eventData: { returnWaybill, originalWaybill: data.originalWaybill, action: "return_created" },
      countryCode: data.returnCountry,
      city: data.returnCity,
    },
  });

  return record;
}

export async function getReturns(accountId?: string, status?: string) {
  const where: any = {};
  if (status) where.status = status;

  const returns = await (prisma as any).kspShipmentReturn.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return returns;
}

export async function updateReturnStatus(id: string, status: string) {
  return (prisma as any).kspShipmentReturn.update({
    where: { id },
    data: { status },
  });
}

export async function getReturnStats(accountId?: string) {
  const where: any = {};
  const returns = await (prisma as any).kspShipmentReturn.findMany({ where });

  const total = returns.length;
  const completed = returns.filter((r: any) => r.status === "completed").length;
  const totalFees = returns.reduce((sum: number, r: any) => sum + Number(r.returnFee || 0), 0);

  return {
    totalReturns: total,
    completed,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    totalReturnFees: totalFees,
  };
}
