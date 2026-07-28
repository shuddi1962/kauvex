import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser, validateBody } from "@/lib/api-helpers";
import { submitBid, getProject } from "@/lib/kpn";
import prisma from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const submitBidSchema = z.object({
  bidAmount: z.number().min(0),
  proposedStart: z.string().optional(),
  proposedEnd: z.string().optional(),
  methodology: z.string().max(5000).optional(),
  teamComposition: z.array(z.any()).optional(),
  equipmentList: z.array(z.any()).optional(),
  paymentSchedule: z.array(z.any()).optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bids = await prisma.kpnProjectBid.findMany({
      where: { projectId: id },
      include: { professional: true },
      orderBy: { bidAmount: "asc" },
    });
    return successResponse(bids);
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

  const { data: body, error: valErr } = await validateBody(request, submitBidSchema);
  if (valErr) return valErr;

  try {
    const { id } = await params;
    const professional = await import("@/lib/kpn").then(m => m.getProfessional(user!.id));
    if (!professional) return errorResponse("Professional profile not found", 404);

    const project = await getProject(id);
    if (!project) return errorResponse("Project not found", 404);

    const bid = await submitBid({
      ...body!,
      projectId: id,
      professionalId: professional.id,
    });
    return successResponse(bid, 201);
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}
