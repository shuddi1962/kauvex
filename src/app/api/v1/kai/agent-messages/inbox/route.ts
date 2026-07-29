import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const business = await prisma.kv_kai_businesses.findUnique({
      where: { userId: user!.id },
      select: { id: true },
    });
    if (!business) return errorResponse("Business not found", 404);

    const agents = await prisma.kv_kai_agents.findMany({
      where: { businessId: business.id },
      select: {
        id: true,
        name: true,
        role: true,
        avatar: true,
        color: true,
        receivedMessages: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            sender: { select: { id: true, name: true, role: true, avatar: true, color: true } },
          },
        },
      },
    });

    const inbox = agents.map((agent) => {
      const unreadCount = agent.receivedMessages.filter((m) => m.status === "pending").length;
      return {
        agentId: agent.id,
        agentName: agent.name,
        agentRole: agent.role,
        agentAvatar: agent.avatar,
        agentColor: agent.color,
        unreadCount,
        recentMessages: agent.receivedMessages,
      };
    });

    return successResponse(inbox);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
