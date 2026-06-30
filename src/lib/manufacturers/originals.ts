import prisma from "@/lib/db";

export interface CreateOriginalInput {
  productId: string;
  manufacturerId: string;
  originalCost: number;
  retailPrice: number;
  monthlySales?: number;
}

export async function listOriginals(status?: string) {
  const where = status ? { status } : {};
  return prisma.kauvexOriginal.findMany({
    where,
    include: {
      product: { select: { id: true, name: true, slug: true, images: true } },
      manufacturer: { select: { id: true, companyName: true, slug: true, countryCode: true, verificationTier: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createOriginal(data: CreateOriginalInput) {
  const marginPercent = data.retailPrice > 0
    ? ((data.retailPrice - data.originalCost) / data.retailPrice) * 100
    : 0;

  return prisma.kauvexOriginal.create({
    data: {
      productId: data.productId,
      manufacturerId: data.manufacturerId,
      originalCost: data.originalCost,
      retailPrice: data.retailPrice,
      marginPercent: Math.round(marginPercent * 100) / 100,
      monthlySales: data.monthlySales ?? 0,
      status: "candidate",
    },
  });
}

export async function activateOriginal(id: string) {
  return prisma.kauvexOriginal.update({
    where: { id },
    data: { status: "active", launchedAt: new Date() },
  });
}

export async function discontinueOriginal(id: string) {
  return prisma.kauvexOriginal.update({
    where: { id },
    data: { status: "discontinued" },
  });
}

export async function getOriginalsStats() {
  const [candidates, active, discontinued] = await Promise.all([
    prisma.kauvexOriginal.count({ where: { status: "candidate" } }),
    prisma.kauvexOriginal.count({ where: { status: "active" } }),
    prisma.kauvexOriginal.count({ where: { status: "discontinued" } }),
  ]);

  const activeProducts = await prisma.kauvexOriginal.findMany({
    where: { status: "active" },
    select: { marginPercent: true, monthlySales: true, originalCost: true, retailPrice: true },
  });

  const totalRevenue = activeProducts.reduce((sum, p) => sum + (Number(p.retailPrice) * (p.monthlySales ?? 0)), 0);
  const avgMargin = activeProducts.length > 0
    ? activeProducts.reduce((sum, p) => sum + Number(p.marginPercent), 0) / activeProducts.length
    : 0;

  return { candidates, active, discontinued, totalRevenue, avgMargin };
}
