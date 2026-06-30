import prisma from "@/lib/db";

export type DisputeType =
  | 'quality'
  | 'quantity'
  | 'late_delivery'
  | 'wrong_spec'
  | 'customization_mismatch';

export type DisputeResolution =
  | 'full_refund'
  | 'partial_refund'
  | 'rework'
  | 'rejected';

export interface CreateDisputeInput {
  orderId: string;
  raisedBy: string;
  disputeType: DisputeType;
  description: string;
  evidenceUrls?: string[];
}

export async function createDispute(input: CreateDisputeInput) {
  return prisma.mfgDispute.create({
    data: {
      orderId: input.orderId,
      raisedBy: input.raisedBy,
      disputeType: input.disputeType,
      description: input.description,
      evidenceUrls: input.evidenceUrls ?? [],
    },
  });
}

export async function resolveDispute(
  disputeId: string,
  resolution: DisputeResolution,
  resolvedBy: string,
  notes?: string
) {
  return prisma.mfgDispute.update({
    where: { id: disputeId },
    data: {
      resolution,
      resolvedBy,
      resolutionNotes: notes ?? null,
      resolvedAt: new Date(),
    },
  });
}

export async function listDisputes(orderId?: string, status?: string) {
  const where: any = {};
  if (orderId) where.orderId = orderId;
  if (status) where.resolution = status === "resolved" ? { not: null } : null;

  return prisma.mfgDispute.findMany({
    where,
    include: {
      order: {
        select: {
          id: true,
          milestoneStructure: true,
          buyerId: true,
          manufacturerId: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
