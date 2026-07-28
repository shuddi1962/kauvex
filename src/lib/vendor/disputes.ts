import prisma from "@/lib/prisma";

export async function getVendorDisputes(vendorId: string) {
  return prisma.dispute.findMany({
    where: { vendorId },
    orderBy: { openedAt: "desc" },
    include: { messages: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
}

export async function getDisputeDetail(disputeId: string) {
  return prisma.dispute.findUnique({
    where: { id: disputeId },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      order: true,
    },
  });
}

export async function respondToDispute(disputeId: string, vendorId: string, message: string) {
  return prisma.dispute.update({
    where: { id: disputeId },
    data: {
      vendorResponse: message,
    },
  });
}

export async function acceptDispute(disputeId: string) {
  return prisma.dispute.update({
    where: { id: disputeId },
    data: { status: "resolved", adminDecision: "accepted" },
  });
}

export async function getDisputeStats(vendorId: string) {
  const [total, open, resolved, inFavor] = await Promise.all([
    prisma.dispute.count({ where: { vendorId } }),
    prisma.dispute.count({ where: { vendorId, status: "open" } }),
    prisma.dispute.count({ where: { vendorId, status: "resolved" } }),
    prisma.dispute.count({ where: { vendorId, adminDecision: "vendor" } }),
  ]);
  return { total, open, resolved, inFavor, atRisk: open };
}