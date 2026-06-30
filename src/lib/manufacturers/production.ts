import prisma from "@/lib/db";

export type ProductionStage =
  | 'confirmed'
  | 'sourcing'
  | 'in_production'
  | 'quality_control'
  | 'ready_inspection'
  | 'packed'
  | 'dispatched'
  | 'delivered';

export interface ProductionUpdate {
  stage: ProductionStage;
  photos?: string[];
  videoUrl?: string;
  notes?: string;
}

export const PRODUCTION_STAGES: { key: ProductionStage; label: string; description: string }[] = [
  { key: "confirmed", label: "Confirmed", description: "Order confirmed by manufacturer" },
  { key: "sourcing", label: "Sourcing", description: "Raw materials being sourced" },
  { key: "in_production", label: "In Production", description: "Manufacturing in progress" },
  { key: "quality_control", label: "Quality Control", description: "QC inspection underway" },
  { key: "ready_inspection", label: "Ready for Inspection", description: "Awaiting buyer or third-party inspection" },
  { key: "packed", label: "Packed", description: "Goods packed and ready for shipment" },
  { key: "dispatched", label: "Dispatched", description: "Shipped from factory" },
  { key: "delivered", label: "Delivered", description: "Received by buyer" },
];

export async function updateProductionStage(orderId: string, update: ProductionUpdate) {
  const timelineEntry = {
    stage: update.stage,
    updatedAt: new Date(),
    photos: update.photos ?? [],
    videoUrl: update.videoUrl ?? null,
    notes: update.notes ?? null,
  };

  const order = await prisma.mfgOrder.findUnique({
    where: { id: orderId },
    select: { productionTimeline: true },
  });

  const existingTimeline = (order?.productionTimeline as any[]) ?? [];

  return prisma.mfgOrder.update({
    where: { id: orderId },
    data: {
      currentStage: update.stage,
      productionTimeline: [...existingTimeline, timelineEntry],
      status: update.stage === "delivered" ? "completed" : "active",
    },
  });
}

export async function getOrderProductionTimeline(orderId: string) {
  const order = await prisma.mfgOrder.findUnique({
    where: { id: orderId },
    select: { productionTimeline: true },
  });

  if (!order) return [];

  const timeline = (order.productionTimeline as any[]) ?? [];
  return timeline.map((entry) => ({
    stage: entry.stage,
    updatedAt: new Date(entry.updatedAt),
    photos: entry.photos ?? [],
  }));
}

export async function requestInspection(orderId: string, partner: string) {
  return prisma.mfgOrder.update({
    where: { id: orderId },
    data: {
      currentStage: "ready_inspection",
      inspectionRequested: true,
      inspectionPartner: partner,
      inspectionStatus: "pending",
    },
  });
}

export async function submitInspectionResult(
  orderId: string,
  result: "passed" | "failed",
  reportUrl?: string
) {
  return prisma.mfgOrder.update({
    where: { id: orderId },
    data: {
      inspectionStatus: result,
      inspectionResult: result,
      inspectionReportUrl: reportUrl ?? null,
      currentStage: result === "passed" ? "packed" : "quality_control",
    },
  });
}
