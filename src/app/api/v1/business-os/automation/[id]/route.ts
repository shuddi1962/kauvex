import { prisma } from "@/lib/prisma";
import { createPatchHandler, createDeleteHandler } from "@/lib/business-os/crud";

export const dynamic = "force-dynamic";

export const PATCH = createPatchHandler(prisma.bosAutomationRule);
export const DELETE = createDeleteHandler(prisma.bosAutomationRule);
