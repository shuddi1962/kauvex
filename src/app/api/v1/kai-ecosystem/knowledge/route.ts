import { prisma } from "@/lib/prisma";
import { createListHandler, createCreateHandler, createPatchHandler, createDeleteHandler } from "@/lib/business-os/crud";

export const dynamic = "force-dynamic";

export const GET = createListHandler(prisma.kaiEcoKnowledge, { searchFields: ["title", "content"], orderBy: { updatedAt: "desc" } });

export const POST = createCreateHandler(prisma.kaiEcoKnowledge);

export const PATCH = createPatchHandler(prisma.kaiEcoKnowledge);

export const DELETE = createDeleteHandler(prisma.kaiEcoKnowledge);
