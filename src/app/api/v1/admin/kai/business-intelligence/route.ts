import { NextRequest } from "next/server";
import { successResponse, errorResponse, requireAdmin } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await requireAdmin(request);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get("limit") || "20"), 100);

    const businesses = await prisma.kaiBusiness.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        subscriptions: { include: { plan: true }, orderBy: { createdAt: "desc" } },
      },
    });

    const [docCounts, questionCounts, questionRows, chunkRows, agentRows] = await Promise.all([
      prisma.kaiDocument.groupBy({ by: ["businessId"], _count: { id: true } }),
      prisma.kaiBusinessQuestion.groupBy({ by: ["businessId"], _count: { id: true } }),
      prisma.kaiBusinessQuestion.findMany({ orderBy: { createdAt: "desc" }, take: 15 }),
      prisma.kaiKnowledgeChunk.groupBy({ by: ["businessId"], _count: { id: true } }),
      prisma.kaiAgent.groupBy({ by: ["businessId"], _count: { id: true } }),
    ]);

    const docMap = Object.fromEntries(docCounts.map((d) => [d.businessId, d._count.id]));
    const qMap = Object.fromEntries(questionCounts.map((q) => [q.businessId, q._count.id]));
    const chunkMap = Object.fromEntries(chunkRows.map((c) => [c.businessId, c._count.id]));
    const agentMap = Object.fromEntries(agentRows.map((a) => [a.businessId, a._count.id]));

    const stats = {
      totalBusinesses: businesses.length,
      totalQuestions: questionRows.length ? Object.values(qMap).reduce((s, v) => s + v, 0) : 0,
      totalChunks: chunkRows.length ? Object.values(chunkMap).reduce((s, v) => s + v, 0) : 0,
      activeSubscriptions: businesses.filter((b) => b.subscriptions.some((s) => s.status === "active")).length,
    };

    const rows = businesses.map((b) => ({
      id: b.id,
      companyName: b.companyName,
      industry: b.industry,
      onboarded: b.onboarded,
      userId: b.userId,
      createdAt: b.createdAt,
      subscription: b.subscriptions[0] ?? null,
      docCount: docMap[b.id] ?? 0,
      questionCount: qMap[b.id] ?? 0,
      chunkCount: chunkMap[b.id] ?? 0,
      agentCount: agentMap[b.id] ?? 0,
    }));

    return successResponse({ stats, businesses: rows, recentQuestions: questionRows });
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
