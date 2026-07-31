import { prisma } from "@/lib/prisma";
import { createListHandler } from "@/lib/business-os/crud";

export const dynamic = "force-dynamic";

export const GET = createListHandler(prisma.kaiEcoAudit, { orderBy: { createdAt: "desc" } });
