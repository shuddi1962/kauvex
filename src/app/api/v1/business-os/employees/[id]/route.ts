import { prisma } from "@/lib/prisma";
import { createPatchHandler, createDeleteHandler } from "@/lib/business-os/crud";

export const dynamic = "force-dynamic";

export const PATCH = createPatchHandler(prisma.bosEmployee);
export const DELETE = createDeleteHandler(prisma.bosEmployee);
