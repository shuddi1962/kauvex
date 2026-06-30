import prisma from "@/lib/db";

export type VerificationTier = 'unverified' | 'document_verified' | 'factory_verified' | 'gold';

export interface VerificationCheck {
  tier: VerificationTier;
  requirements: string[];
  isEligible: boolean;
}

const TIER_REQUIREMENTS: Record<VerificationTier, string[]> = {
  unverified: [],
  document_verified: [
    "Business registration document uploaded",
    "Tax identification number provided",
  ],
  factory_verified: [
    "Business registration document uploaded",
    "Tax identification number provided",
    "Factory audit report submitted",
    "ISO or equivalent certification uploaded",
    "At least 1 completed order with positive feedback",
  ],
  gold: [
    "Business registration document uploaded",
    "Tax identification number provided",
    "Factory audit report submitted",
    "ISO or equivalent certification uploaded",
    "At least 10 completed orders",
    "Average rating of 4.5 or higher",
    "On-time delivery rate above 90%",
    "Zero unresolved disputes in last 6 months",
    "Trust score above 75",
  ],
};

const TIER_HIERARCHY: VerificationTier[] = [
  "unverified",
  "document_verified",
  "factory_verified",
  "gold",
];

export async function getVerificationStatus(manufacturerId: string): Promise<VerificationCheck> {
  const manufacturer = await prisma.mfgManufacturer.findUnique({
    where: { id: manufacturerId },
    include: {
      certifications: true,
      orders: {
        select: { status: true, ratingAverage: true, id: true },
      },
    },
  });

  if (!manufacturer) {
    return { tier: "unverified", requirements: TIER_REQUIREMENTS.unverified, isEligible: false };
  }

  const currentTier = (manufacturer.verificationTier as VerificationTier) ?? "unverified";
  const completedOrders = manufacturer.orders.filter(
    (o) => o.status === "completed"
  );
  const avgRating =
    completedOrders.length > 0
      ? completedOrders.reduce((sum, o) => sum + Number(o.ratingAverage ?? 0), 0) / completedOrders.length
      : 0;

  // Count unresolved disputes through orders
  const orderIds = manufacturer.orders.map((o) => o.id);
  const unresolvedDisputes = orderIds.length > 0
    ? await prisma.mfgDispute.count({
        where: {
          orderId: { in: orderIds },
          resolution: null,
        },
      })
    : 0;
  const hasCertification = manufacturer.certifications.length > 0;

  const checks: Record<VerificationTier, boolean> = {
    unverified: true,
    document_verified: true,
    factory_verified:
      hasCertification &&
      completedOrders.length >= 1 &&
      avgRating > 0,
    gold:
      completedOrders.length >= 10 &&
      avgRating >= 4.5 &&
      unresolvedDisputes === 0,
  };

  let eligibleTier: VerificationTier = "unverified";
  for (const tier of [...TIER_HIERARCHY].reverse()) {
    if (checks[tier]) {
      eligibleTier = tier;
      break;
    }
  }

  const currentTierIndex = TIER_HIERARCHY.indexOf(currentTier);
  const eligibleTierIndex = TIER_HIERARCHY.indexOf(eligibleTier);

  return {
    tier: currentTier,
    requirements: TIER_REQUIREMENTS[currentTier],
    isEligible: eligibleTierIndex > currentTierIndex,
  };
}

export async function upgradeVerificationTier(
  manufacturerId: string,
  tier: VerificationTier
): Promise<void> {
  await prisma.mfgManufacturer.update({
    where: { id: manufacturerId },
    data: { verificationTier: tier },
  });
}

export async function recalculateTrustScore(manufacturerId: string): Promise<number> {
  const manufacturer = await prisma.mfgManufacturer.findUnique({
    where: { id: manufacturerId },
    include: {
      certifications: true,
      orders: {
        select: {
          status: true,
          ratingAverage: true,
        },
      },
      inquiries: {
        select: { respondedAt: true },
      },
    },
  });

  if (!manufacturer) return 0;

  let score = 0;

  // Completed orders: max 40 pts
  const completedOrders = manufacturer.orders.filter((o) => o.status === "completed");
  const orderScore = Math.min(completedOrders.length * 4, 40);
  score += orderScore;

  // Average rating: max 30 pts
  if (completedOrders.length > 0) {
    const avgRating =
      completedOrders.reduce((sum, o) => sum + Number(o.ratingAverage ?? 0), 0) /
      completedOrders.length;
    const ratingScore = Math.round((avgRating / 5) * 30);
    score += ratingScore;
  }

  // Certifications: max 15 pts
  const certScore = Math.min(manufacturer.certifications.length * 5, 15);
  score += certScore;

  // Response rate: max 15 pts
  const totalInquiries = manufacturer.inquiries.length;
  const respondedInquiries = manufacturer.inquiries.filter(
    (i) => i.respondedAt !== null
  ).length;
  if (totalInquiries > 0) {
    const responseRate = respondedInquiries / totalInquiries;
    const responseScore = Math.round(responseRate * 15);
    score += responseScore;
  }

  await prisma.mfgManufacturer.update({
    where: { id: manufacturerId },
    data: { trust_score: score },
  });

  return score;
}
