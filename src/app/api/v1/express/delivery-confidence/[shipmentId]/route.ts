import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shipmentId: string }> }
) {
  try {
    const { shipmentId } = await params;

    const waybill = await (prisma as any).ksp_express_waybills.findUnique({
      where: { id: shipmentId },
    });

    if (!waybill) {
      return NextResponse.json(
        { error: "Shipment not found" },
        { status: 404 }
      );
    }

    let confidenceScore = 70;
    const factors: string[] = [];
    const risks: string[] = [];

    const now = new Date();
    const created = new Date(waybill.createdAt);
    const hoursSinceCreated = (now.getTime() - created.getTime()) / (1000 * 60 * 60);

    if (hoursSinceCreated < 2) {
      confidenceScore += 10;
      factors.push("Recently created shipment");
    }

    if (waybill.serviceTier === "express") {
      confidenceScore += 8;
      factors.push("Express service tier with priority handling");
    } else if (waybill.serviceTier === "same-day") {
      confidenceScore += 12;
      factors.push("Same-day delivery with dedicated courier");
    }

    if (waybill.status === "in_transit") {
      confidenceScore += 5;
      factors.push("Currently in transit");
    } else if (waybill.status === "delivered") {
      confidenceScore = 100;
      factors.push("Already delivered");
    } else if (waybill.status === "out_for_delivery") {
      confidenceScore += 15;
      factors.push("Out for delivery - final mile");
    }

    if (!waybill.lockerId && !waybill.deliveryMethod?.includes("locker")) {
      confidenceScore -= 3;
      risks.push("Door delivery may face access issues");
    }

    if (waybill.specialInstructions) {
      confidenceScore += 2;
      factors.push("Special instructions provided");
    }

    if (waybill.insuranceValue && waybill.insuranceValue > 0) {
      factors.push("Insurance coverage active");
    }

    const history = await (prisma as any).ksp_express_tracking.findMany({
      where: { waybillId: shipmentId },
      orderBy: { timestamp: "asc" },
    });

    const hasDelays = history.some((h: any) =>
      h.status?.includes("delay") || h.status?.includes("held")
    );

    if (hasDelays) {
      confidenceScore -= 15;
      risks.push("Delay detected in tracking history");
    }

    if (history.length < 2 && hoursSinceCreated > 6) {
      confidenceScore -= 10;
      risks.push("Limited tracking updates");
    }

    confidenceScore = Math.max(0, Math.min(100, confidenceScore));

    let confidenceLevel: string;
    if (confidenceScore >= 90) confidenceLevel = "very_high";
    else if (confidenceScore >= 75) confidenceLevel = "high";
    else if (confidenceScore >= 60) confidenceLevel = "medium";
    else if (confidenceScore >= 40) confidenceLevel = "low";
    else confidenceLevel = "very_low";

    const estimatedDelivery = waybill.estimatedDelivery
      ? new Date(waybill.estimatedDelivery)
      : new Date(created.getTime() + (waybill.serviceTier === "express" ? 24 : waybill.serviceTier === "same-day" ? 6 : 72) * 60 * 60 * 1000);

    const confidence = await (prisma as any).ksp_delivery_confidence.upsert({
      where: { waybillId: shipmentId },
      update: {
        score: confidenceScore,
        level: confidenceLevel,
        factors,
        risks,
        updatedAt: now,
      },
      create: {
        waybillId: shipmentId,
        score: confidenceScore,
        level: confidenceLevel,
        factors,
        risks,
      },
    });

    return NextResponse.json({
      shipmentId,
      waybillNumber: waybill.waybillNumber,
      confidence: {
        score: confidenceScore,
        level: confidenceLevel,
        factors,
        risks,
      },
      estimatedDelivery: estimatedDelivery.toISOString(),
      status: waybill.status,
      serviceTier: waybill.serviceTier,
      lastUpdate: history.length > 0 ? history[history.length - 1].timestamp : created,
      trackingUpdates: history.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to calculate delivery confidence" },
      { status: 500 }
    );
  }
}
