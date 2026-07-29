import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, error: authErr } = await getAuthUser(_request);
  if (authErr) return authErr;

  try {
    const { id } = params;

    const business = await prisma.kv_kai_businesses.findUnique({
      where: { userId: user!.id },
      select: { id: true },
    });
    if (!business) return errorResponse("Business not found", 404);

    const message = await prisma.kv_kai_agent_messages.findUnique({
      where: { id },
      include: {
        sender: { select: { id: true, name: true, role: true, avatar: true, color: true } },
        receiver: { select: { id: true, name: true, role: true, avatar: true, color: true } },
        workflow: { select: { id: true, name: true } },
      },
    });

    if (!message) return errorResponse("Message not found", 404);

    const receiverAgent = await prisma.kv_kai_agents.findUnique({
      where: { id: message.receiverAgentId },
      select: { businessId: true },
    });
    if (!receiverAgent || receiverAgent.businessId !== business.id) {
      return errorResponse("Access denied", 403);
    }

    return successResponse(message);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const { id } = params;
    const body = await request.json();
    const { status } = body;

    if (!status || !["read", "acted"].includes(status)) {
      return errorResponse("Status must be 'read' or 'acted'", 400);
    }

    const business = await prisma.kv_kai_businesses.findUnique({
      where: { userId: user!.id },
      select: { id: true },
    });
    if (!business) return errorResponse("Business not found", 404);

    const message = await prisma.kv_kai_agent_messages.findUnique({
      where: { id },
    });
    if (!message) return errorResponse("Message not found", 404);

    const receiverAgent = await prisma.kv_kai_agents.findUnique({
      where: { id: message.receiverAgentId },
      select: { businessId: true },
    });
    if (!receiverAgent || receiverAgent.businessId !== business.id) {
      return errorResponse("Access denied", 403);
    }

    const updateData: Record<string, unknown> = { status };
    if (status === "read") updateData.readAt = new Date();
    if (status === "acted") updateData.actedAt = new Date();

    const updated = await prisma.kv_kai_agent_messages.update({
      where: { id },
      data: updateData,
      include: {
        sender: { select: { id: true, name: true, role: true } },
        receiver: { select: { id: true, name: true, role: true } },
      },
    });

    return successResponse(updated);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
