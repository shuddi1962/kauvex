import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";

export type EscrowStatus = 'funded' | 'partial_release' | 'released' | 'disputed' | 'refunded';

export interface EscrowRelease {
  milestoneIndex: number;
  amount: number;
  releasedAt: Date;
  reason: string;
}

export interface MilestoneConfig {
  label: string;
  percent: number;
}

const DEFAULT_MILESTONES: MilestoneConfig[] = [
  { label: "Order Confirmed (Deposit)", percent: 30 },
  { label: "Production Complete", percent: 40 },
  { label: "Shipped / Delivered", percent: 30 },
];

export async function fundEscrow(orderId: string, amount: number) {
  return prisma.mfgEscrow.upsert({
    where: { orderId },
    create: {
      orderId,
      totalAmount: amount,
      depositedAmount: amount,
      releasedAmount: 0,
      status: "funded",
      milestoneReleases: [],
    },
    update: {
      totalAmount: amount,
      depositedAmount: amount,
    },
  });
}

export async function releaseEscrowMilestone(
  orderId: string,
  milestoneIndex: number,
  reason: string
) {
  const escrow = await prisma.mfgEscrow.findUnique({
    where: { orderId },
    include: { order: { select: { milestoneStructure: true } } },
  });

  if (!escrow) throw new Error("Escrow not found");

  const releases = (escrow.milestoneReleases as unknown as EscrowRelease[]) ?? [];
  const alreadyReleased = releases.some((r) => r.milestoneIndex === milestoneIndex);
  if (alreadyReleased) throw new Error("Milestone already released");

  const milestones = (escrow.order.milestoneStructure as unknown as MilestoneConfig[]) ?? DEFAULT_MILESTONES;
  if (milestoneIndex < 0 || milestoneIndex >= milestones.length) {
    throw new Error("Invalid milestone index");
  }

  const perMilestoneAmount = Math.round((Number(escrow.totalAmount) * milestones[milestoneIndex].percent / 100) * 100) / 100;

  const newRelease: EscrowRelease = {
    milestoneIndex,
    amount: perMilestoneAmount,
    releasedAt: new Date(),
    reason,
  };

  const updatedReleases = [...releases, newRelease];
  const totalReleased = Number(escrow.releasedAmount) + perMilestoneAmount;
  const allReleased = updatedReleases.length >= milestones.length;

  // TODO: Integrate with Kauvex Pay wallet — debit escrow reserve, credit manufacturer wallet
  // await debitEscrowReserve(orderId, perMilestoneAmount);
  // await creditManufacturerWallet(manufacturerId, perMilestoneAmount);

  return prisma.mfgEscrow.update({
    where: { orderId },
    data: {
      releasedAmount: totalReleased,
      milestoneReleases: updatedReleases as unknown as Prisma.InputJsonValue,
      status: allReleased ? "released" : "partial_release",
    },
  });
}

export async function refundEscrow(orderId: string, reason: string) {
  const escrow = await prisma.mfgEscrow.findUnique({
    where: { orderId },
  });

  if (!escrow) throw new Error("Escrow not found");
  if (escrow.status === "refunded") throw new Error("Already refunded");
  if (escrow.status === "released") throw new Error("Cannot refund fully released escrow");

  const unreleased = Number(escrow.totalAmount) - Number(escrow.releasedAmount);

  // TODO: Integrate with Kauvex Pay wallet — refund unreleased amount to buyer wallet
  // await creditBuyerWallet(buyerId, unreleased);

  return prisma.mfgEscrow.update({
    where: { orderId },
    data: {
      status: "refunded",
      releasedAmount: escrow.totalAmount,
    },
  });
}

export async function getEscrowByOrder(orderId: string) {
  return prisma.mfgEscrow.findUnique({
    where: { orderId },
    include: {
      order: {
        select: {
          id: true,
          milestoneStructure: true,
          totalValue: true,
          status: true,
          manufacturerId: true,
        },
      },
    },
  });
}

export async function getEscrowSummary(manufacturerId: string) {
  const escrows = await prisma.mfgEscrow.findMany({
    where: {
      order: {
        manufacturerId,
      },
    },
    select: {
      totalAmount: true,
      releasedAmount: true,
      status: true,
    },
  });

  const activeStatuses = ["funded", "partial_release"];
  const totalHeld = escrows
    .filter((e) => activeStatuses.includes(e.status))
    .reduce((sum, e) => sum + (Number(e.totalAmount) - Number(e.releasedAmount)), 0);
  const totalReleased = escrows.reduce((sum, e) => sum + Number(e.releasedAmount), 0);
  const activeCount = escrows.filter((e) => activeStatuses.includes(e.status)).length;

  return { totalHeld, totalReleased, activeCount };
}

export async function disputeEscrow(orderId: string, disputeId: string) {
  return prisma.mfgEscrow.update({
    where: { orderId },
    data: { status: "disputed" },
  });
}
