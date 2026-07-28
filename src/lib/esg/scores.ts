import prisma from "@/lib/prisma";

interface ScoreInput {
  vendorId?: string;
  productId?: string;
  packagingScore?: number;
  carbonScore?: number;
  materialsScore?: number;
  laborScore?: number;
  energyScore?: number;
  waterScore?: number;
  wasteScore?: number;
  data?: Record<string, unknown>;
}

export async function calculateSustainabilityScore(input: ScoreInput) {
  const subScores = [
    input.packagingScore || 0,
    input.carbonScore || 0,
    input.materialsScore || 0,
    input.laborScore || 0,
    input.energyScore || 0,
    input.waterScore || 0,
    input.wasteScore || 0,
  ];

  const filledScores = subScores.filter((s) => s > 0);
  const total = filledScores.reduce((a, b) => a + b, 0);
  const score = filledScores.length > 0 ? total / filledScores.length : 0;

  return prisma.sustainabilityScore.create({
    data: {
      vendorId: input.vendorId || null,
      productId: input.productId || null,
      score,
      maxScore: 100,
      packagingScore: input.packagingScore || null,
      carbonScore: input.carbonScore || null,
      materialsScore: input.materialsScore || null,
      laborScore: input.laborScore || null,
      energyScore: input.energyScore || null,
      waterScore: input.waterScore || null,
      wasteScore: input.wasteScore || null,
      data: (input.data || {}) as any,
    },
  });
}

export async function getVendorSustainability(vendorId: string) {
  return prisma.sustainabilityScore.findFirst({
    where: { vendorId },
    orderBy: { calculatedAt: "desc" },
  });
}

export async function getProductSustainability(productId: string) {
  return prisma.sustainabilityScore.findFirst({
    where: { productId },
    orderBy: { calculatedAt: "desc" },
  });
}

export async function getLeaderboard(limit = 20) {
  return prisma.sustainabilityScore.findMany({
    where: { vendorId: { not: null } },
    orderBy: { score: "desc" },
    take: limit,
  });
}

export async function getDashboardStats() {
  const [total, avg, top, carbonOffsets] = await Promise.all([
    prisma.sustainabilityScore.count(),
    prisma.sustainabilityScore.aggregate({ _avg: { score: true } }),
    prisma.sustainabilityScore.findFirst({ orderBy: { score: "desc" }, select: { score: true } }),
    prisma.carbonOffset.count(),
  ]);

  return {
    totalScores: total,
    averageScore: avg._avg.score ? Number(avg._avg.score).toFixed(1) : 0,
    topScore: top?.score || 0,
    totalCarbonOffsets: carbonOffsets,
  };
}