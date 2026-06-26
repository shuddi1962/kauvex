import { prisma } from "@/lib/prisma";

export async function getFbKRoi(vendorId: string, productId?: string, startDate?: string, endDate?: string) {
  const where: any = { vendorId };
  if (productId) where.productId = productId;
  if (startDate || endDate) {
    where.periodStart = {};
    if (startDate) where.periodStart.gte = new Date(startDate);
    if (endDate) where.periodEnd.lte = new Date(endDate);
  }

  const records = await (prisma as any).kspVendorFbkRoi.findMany({
    where,
    orderBy: { periodStart: "desc" },
  });

  return records.map((r: any) => ({
    ...r,
    revenue: Number(r.revenue),
    storageFees: Number(r.storageFees),
    pickPackFees: Number(r.pickPackFees),
    inboundFees: Number(r.inboundFees),
    totalFbkCost: Number(r.totalFbkCost),
    netFbkProfit: Number(r.netFbkProfit),
    fbkRoiPercent: Number(r.fbkRoiPercent),
  }));
}

export async function calculateFbKRoi(vendorId: string, productId: string, periodStart: Date, periodEnd: Date) {
  const shipments = await (prisma as any).expressShipment.findMany({
    where: {
      accountId: vendorId,
      status: "delivered",
      createdAt: { gte: periodStart, lte: periodEnd },
    },
  });

  const revenue = shipments.reduce((sum: number, s: any) => sum + Number(s.declaredValue || 0), 0);
  const storageFees = revenue * 0.05;
  const pickPackFees = shipments.length * 250;
  const inboundFees = shipments.length * 150;
  const totalFbkCost = storageFees + pickPackFees + inboundFees;
  const netFbkProfit = revenue - totalFbkCost;
  const fbkRoiPercent = revenue > 0 ? Math.round((netFbkProfit / revenue) * 100) : 0;

  const record = await (prisma as any).kspVendorFbkRoi.upsert({
    where: { id: `${vendorId}-${productId}-${periodStart.toISOString()}` },
    create: {
      vendorId,
      productId,
      periodStart,
      periodEnd,
      unitsSold: shipments.length,
      revenue,
      storageFees,
      pickPackFees,
      inboundFees,
      totalFbkCost,
      netFbkProfit,
      fbkRoiPercent,
    },
    update: {
      unitsSold: shipments.length,
      revenue,
      storageFees,
      pickPackFees,
      inboundFees,
      totalFbkCost,
      netFbkProfit,
      fbkRoiPercent,
    },
  });

  return record;
}

export async function getBundleSuggestions(vendorId: string) {
  return (prisma as any).kspBundleSuggestion.findMany({
    where: { vendorId },
    orderBy: { coPurchaseRate: "desc" },
  });
}

export async function generateBundleSuggestions(vendorId: string) {
  const suggestions = [
    {
      productAId: "placeholder-a",
      productBId: "placeholder-b",
      coPurchaseRate: 67,
      potentialSavingPerOrder: 180,
    },
  ];

  const results = [];
  for (const s of suggestions) {
    const record = await (prisma as any).kspBundleSuggestion.create({
      data: {
        vendorId,
        productAId: s.productAId,
        productBId: s.productBId,
        coPurchaseRate: s.coPurchaseRate,
        potentialSavingPerOrder: s.potentialSavingPerOrder,
        status: "pending",
      },
    });
    results.push(record);
  }

  return results;
}

export async function updateBundleSuggestion(id: string, status: string) {
  return (prisma as any).kspBundleSuggestion.update({
    where: { id },
    data: { status },
  });
}

export async function getFbKDashboardStats(vendorId: string) {
  const roiRecords = await (prisma as any).kspVendorFbkRoi.findMany({
    where: { vendorId },
    orderBy: { periodStart: "desc" },
    take: 12,
  });

  const totalRevenue = roiRecords.reduce((sum: number, r: any) => sum + Number(r.revenue), 0);
  const totalCost = roiRecords.reduce((sum: number, r: any) => sum + Number(r.totalFbkCost), 0);
  const totalProfit = roiRecords.reduce((sum: number, r: any) => sum + Number(r.netFbkProfit), 0);
  const avgRoi = roiRecords.length > 0
    ? roiRecords.reduce((sum: number, r: any) => sum + Number(r.fbkRoiPercent), 0) / roiRecords.length
    : 0;

  return {
    totalRevenue,
    totalCost,
    totalProfit,
    avgRoiPercent: Math.round(avgRoi),
    periods: roiRecords.length,
  };
}
