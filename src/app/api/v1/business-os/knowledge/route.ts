import { prisma } from "@/lib/prisma";
import { createListHandler, createCreateHandler } from "@/lib/business-os/crud";

export const dynamic = "force-dynamic";

export const GET = createListHandler(prisma.bosKnowledgeArticle, { searchFields: ["title", "content", "tags", "category"] });
export const POST = createCreateHandler(prisma.bosKnowledgeArticle);
