import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const business = await prisma.kv_kai_businesses.findUnique({
      where: { userId: user!.id },
      select: { id: true },
    });
    if (!business) return errorResponse("Business not found", 404);

    const agentIds = await prisma.kv_kai_agents.findMany({
      where: { businessId: business.id },
      select: { id: true },
    });
    const agentIdList = agentIds.map((a) => a.id);

    const where: Record<string, unknown> = {
      receiverAgentId: { in: agentIdList },
    };
    if (status) where.status = status;

    const messages = await prisma.kv_kai_agent_messages.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        sender: { select: { id: true, name: true, role: true, avatar: true, color: true } },
        receiver: { select: { id: true, name: true, role: true, avatar: true, color: true } },
        workflow: { select: { id: true, name: true } },
      },
    });

    return successResponse(messages);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}

export async function POST(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const body = await request.json();
    const { senderAgentId, receiverAgentId, subject, message, context, workflowId } = body;

    if (!senderAgentId || !receiverAgentId || !message) {
      return errorResponse("senderAgentId, receiverAgentId, and message are required", 400);
    }

    const business = await prisma.kv_kai_businesses.findUnique({
      where: { userId: user!.id },
      select: { id: true },
    });
    if (!business) return errorResponse("Business not found", 404);

    const sender = await prisma.kv_kai_agents.findUnique({
      where: { id: senderAgentId },
      select: { id: true, businessId: true },
    });
    if (!sender || sender.businessId !== business.id) {
      return errorResponse("Sender agent not found or not part of your business", 404);
    }

    const receiver = await prisma.kv_kai_agents.findUnique({
      where: { id: receiverAgentId },
      select: { id: true, businessId: true },
    });
    if (!receiver || receiver.businessId !== business.id) {
      return errorResponse("Receiver agent not found or not part of your business", 404);
    }

    if (workflowId) {
      const workflow = await prisma.kv_kai_workflows.findUnique({
        where: { id: workflowId },
        select: { id: true, businessId: true },
      });
      if (!workflow || workflow.businessId !== business.id) {
        return errorResponse("Workflow not found or not part of your business", 404);
      }
    }

    const record = await prisma.kv_kai_agent_messages.create({
      data: {
        senderAgentId,
        receiverAgentId,
        subject: subject || null,
        message,
        context: context || {},
        workflowId: workflowId || null,
        status: "pending",
      },
      include: {
        sender: { select: { id: true, name: true, role: true } },
        receiver: { select: { id: true, name: true, role: true } },
      },
    });

    return successResponse(record, 201);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
