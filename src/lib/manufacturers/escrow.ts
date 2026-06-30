import prisma from "@/lib/db";

export type EscrowStatus = 'funded' | 'partial_release' | 'released' | 'disputed' | 'refunded';

export interface EscrowRelease {
  milestoneIndex: number;
  amount: number;
  releasedAt: Date;
  reason: string;
}

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
  });

  if (!escrow) throw new Error("Escrow not found");

  const releases = (escrow.milestoneReleases as EscrowRelease[]) ?? [];
  const alreadyReleased = releases.some((r) => r.milestoneIndex === milestoneIndex);
  if (alreadyReleased) throw new Error("Milestone already released");

  // Calculate release amount: divide total equally across milestones (assume 3 milestones)
  const totalMilestones = 3;
  const perMilestoneAmount = Math.round((Number(escrow.totalAmount) / totalMilestones) * 100) / 100;

  const newRelease: EscrowRelease = {
    milestoneIndex,
    amount: perMilestoneAmount,
    releasedAt: new Date(),
    reason,
  };

  const updatedReleases = [...releases, newRelease];
  const totalReleased = Number(escrow.releasedAmount) + perMilestoneAmount;
  const allReleased = updatedReleases.length >= totalMilestones;

  return prisma.mfgEscrow.update({
    where: { orderId },
    data: {
      releasedAmount: totalReleased,
      milestoneReleases: updatedReleases,
      status: allReleased ? "released" : "partial_release",
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
