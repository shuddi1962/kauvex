import { prisma } from "@/lib/prisma";

export interface CreateAccountInput {
  userId?: string;
  accountType?: string;
  businessName?: string;
  companyName?: string;
  companyEmail?: string;
  companyPhone?: string;
  businessType?: string;
  taxId?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  plan?: string;
}

export interface UpdateAccountInput {
  tier?: string;
  monthlyVolume?: number;
  monthlySpend?: number;
  volumeDiscountPercent?: number;
  billingType?: string;
  walletBalance?: number;
  customWaybillBranding?: boolean;
  apiAccess?: boolean;
  teamApprovalThreshold?: number;
  carbonOffsetEnabled?: boolean;
  status?: string;
}

const TIER_THRESHOLDS = {
  bronze: { volume: 0, spend: 0, discount: 0 },
  silver: { volume: 50, spend: 500000, discount: 5 },
  gold: { volume: 200, spend: 2000000, discount: 10 },
  platinum: { volume: 500, spend: 5000000, discount: 15 },
  enterprise: { volume: 1000, spend: 10000000, discount: 20 },
};

export async function createExpressAccount(input: CreateAccountInput) {
  const account = await (prisma as any).kspExpressAccount.create({
    data: {
      userId: input.userId,
      accountType: input.accountType || "personal",
      businessName: input.businessName || input.companyName,
      companyName: input.companyName,
      companyEmail: input.companyEmail,
      companyPhone: input.companyPhone,
      businessType: input.businessType,
      taxId: input.taxId,
      address: input.address,
      city: input.city,
      state: input.state,
      country: input.country,
      postalCode: input.postalCode,
      plan: input.plan || "pay_per_use",
      tier: "bronze",
      monthlyVolume: 0,
      monthlySpend: 0,
      volumeDiscountPercent: 0,
      billingType: "per_shipment",
      walletBalance: 0,
      customWaybillBranding: false,
      apiAccess: false,
      carbonOffsetEnabled: false,
      status: "active",
    },
  });

  return account;
}

export async function getExpressAccount(accountId: string) {
  return (prisma as any).kspExpressAccount.findUnique({
    where: { id: accountId },
    include: { teamMembers: true },
  });
}

export async function getAccountByUser(userId: string) {
  return (prisma as any).kspExpressAccount.findFirst({
    where: { userId },
  });
}

export async function updateExpressAccount(accountId: string, input: UpdateAccountInput) {
  return (prisma as any).kspExpressAccount.update({
    where: { id: accountId },
    data: input,
  });
}

export async function calculateTier(volume: number, spend: number) {
  if (volume >= 1000 || spend >= 10000000) return "enterprise";
  if (volume >= 500 || spend >= 5000000) return "platinum";
  if (volume >= 200 || spend >= 2000000) return "gold";
  if (volume >= 50 || spend >= 500000) return "silver";
  return "bronze";
}

export async function applyVolumeDiscount(accountId: string) {
  const account = await (prisma as any).kspExpressAccount.findUnique({
    where: { id: accountId },
  });
  if (!account) return;

  const tier = await calculateTier(account.monthlyVolume, Number(account.monthlySpend));
  const threshold = TIER_THRESHOLDS[tier as keyof typeof TIER_THRESHOLDS];

  if (tier !== account.tier) {
    await (prisma as any).kspExpressAccount.update({
      where: { id: accountId },
      data: { tier, volumeDiscountPercent: threshold.discount },
    });
  }
}

export async function addTeamMember(accountId: string, data: {
  userId?: string;
  role: string;
  spendingLimit?: number;
  department?: string;
}) {
  return (prisma as any).kspTeamMember.create({
    data: {
      accountId,
      userId: data.userId,
      role: data.role,
      spendingLimit: data.spendingLimit,
      department: data.department,
      isActive: true,
    },
  });
}

export async function getTeamMembers(accountId: string) {
  return (prisma as any).kspTeamMember.findMany({
    where: { accountId, isActive: true },
  });
}

export async function removeTeamMember(memberId: string) {
  return (prisma as any).kspTeamMember.update({
    where: { id: memberId },
    data: { isActive: false },
  });
}

export async function checkApprovalRequired(accountId: string, shipmentValue: number): Promise<boolean> {
  const account = await (prisma as any).kspExpressAccount.findUnique({
    where: { id: accountId },
  });
  if (!account?.teamApprovalThreshold) return false;
  return shipmentValue > Number(account.teamApprovalThreshold);
}

export async function getAccountStats(accountId: string) {
  const account = await (prisma as any).kspExpressAccount.findUnique({
    where: { id: accountId },
  });
  if (!account) return null;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalShipments, activeShipments, deliveredThisMonth, totalSpend] = await Promise.all([
    (prisma as any).expressShipment.count({ where: { accountId } }),
    (prisma as any).expressShipment.count({ where: { accountId, status: { in: ["picked_up", "in_transit", "out_for_delivery"] } } }),
    (prisma as any).expressShipment.count({ where: { accountId, status: "delivered", createdAt: { gte: monthStart } } }),
    (prisma as any).expressShipment.aggregate({ where: { accountId, createdAt: { gte: monthStart } }, _sum: { pricePaid: true } }),
  ]);

  return {
    account,
    totalShipments,
    activeShipments,
    deliveredThisMonth,
    monthlySpend: Number(totalSpend._sum.pricePaid ?? 0),
  };
}
