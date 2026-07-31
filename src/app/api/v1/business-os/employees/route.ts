import { prisma } from "@/lib/prisma";
import { createListHandler, createCreateHandler } from "@/lib/business-os/crud";

export const dynamic = "force-dynamic";

export const GET = createListHandler(prisma.bosEmployee, { searchFields: ["firstName", "lastName", "email", "employeeCode", "jobTitle"] });
export const POST = createCreateHandler(prisma.bosEmployee);
