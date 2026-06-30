import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser, validateBody } from "@/lib/api-helpers";
import {
  getOrderProductionTimeline,
  updateProductionStage,
  requestInspection,
  PRODUCTION_STAGES,
} from "@/lib/manufacturers/production";
import prisma from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const INSPECTION_PARTNERS = [
  { id: "sgs", name: "SGS", description: "World's leading inspection, verification, testing and certification company" },
  { id: "bureau-veritas", name: "Bureau Veritas", description: "Global leader in testing, inspection and certification" },
  { id: "intertek", name: "Intertek", description: "Total quality assurance provider with worldwide reach" },
  { id: "tuv", name: "TÜV", description: "Technical inspection and certification services" },
  { id: "kauvex-internal", name: "Kauvex Internal Team", description: "Kauvex regional inspection team" },
];

const updateProductionSchema = z.object({
  stage: z.enum([
    "confirmed",
    "sourcing",
    "in_production",
    "quality_control",
    "ready_inspection",
    "packed",
    "dispatched",
    "delivered",
  ]),
  photos: z.array(z.string()).optional(),
  videoUrl: z.string().optional(),
  notes: z.string().max(1000).optional(),
}).strict();

const requestInspectionSchema = z.object({
  action: z.literal("request_inspection"),
  partner: z.string().min(1, "Inspection partner is required"),
  notes: z.string().max(1000).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const { id } = await params;
    const timeline = await getOrderProductionTimeline(id);

    const order = await prisma.mfgOrder.findUnique({
      where: { id },
      select: {
        currentStage: true,
        status: true,
        inspectionRequested: true,
        inspectionPartner: true,
        inspectionStatus: true,
        inspectionResult: true,
        inspectionReportUrl: true,
      },
    });

    return successResponse({
      currentStage: order?.currentStage,
      status: order?.status,
      inspection: {
        requested: order?.inspectionRequested ?? false,
        partner: order?.inspectionPartner,
        status: order?.inspectionStatus,
        result: order?.inspectionResult,
        reportUrl: order?.inspectionReportUrl,
      },
      stages: PRODUCTION_STAGES,
      inspectionPartners: INSPECTION_PARTNERS,
      timeline,
    });
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  const { data: body, error: valErr } = await validateBody(request, requestInspectionSchema);
  if (valErr) return valErr;

  try {
    const { id } = await params;

    // Verify user owns this order's manufacturer
    const profile = await prisma.profiles.findUnique({
      where: { id: user!.id },
      select: { vendorId: true },
    });

    const manufacturerId = profile?.vendorId;
    if (!manufacturerId) {
      return errorResponse("No manufacturer profile linked to this account", 403);
    }

    const order = await prisma.mfgOrder.findUnique({
      where: { id },
      select: { manufacturerId: true, inspectionRequested: true },
    });

    if (!order) return errorResponse("Order not found", 404);
    if (order.manufacturerId !== manufacturerId) {
      return errorResponse("You do not have access to this order", 403);
    }

    if (order.inspectionRequested) {
      return errorResponse("Inspection already requested for this order", 400);
    }

    // Validate partner is from known list
    const validPartner = INSPECTION_PARTNERS.find((p) => p.id === body!.partner);
    if (!validPartner) {
      return errorResponse("Invalid inspection partner", 400);
    }

    const updated = await requestInspection(id, validPartner.name);

    return successResponse({
      ...updated,
      message: `Inspection request sent to ${validPartner.name}. They will contact you within 24-48 hours to schedule the inspection.`,
    });
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  const { data: body, error: valErr } = await validateBody(request, updateProductionSchema);
  if (valErr) return valErr;

  try {
    const { id } = await params;

    // Verify user owns this order's manufacturer
    const profile = await prisma.profiles.findUnique({
      where: { id: user!.id },
      select: { vendorId: true },
    });

    const manufacturerId = profile?.vendorId;
    if (!manufacturerId) {
      return errorResponse("No manufacturer profile linked to this account", 403);
    }

    const order = await prisma.mfgOrder.findUnique({
      where: { id },
      select: { manufacturerId: true },
    });

    if (!order) return errorResponse("Order not found", 404);
    if (order.manufacturerId !== manufacturerId) {
      return errorResponse("You do not have access to this order", 403);
    }

    const updated = await updateProductionStage(id, {
      stage: body!.stage,
      photos: body!.photos,
      videoUrl: body!.videoUrl,
      notes: body!.notes,
    });

    return successResponse(updated);
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}
