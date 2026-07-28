import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser, validateBody } from "@/lib/api-helpers";
import { createMaintenanceSchedule, getMaintenanceSchedules } from "@/lib/kpn";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createScheduleSchema = z.object({
  digitalTwinId: z.string().min(1),
  maintenanceType: z.string().min(1).max(100),
  frequencyDays: z.number().int().min(1),
  nextDue: z.string().optional(),
  reminderDaysBefore: z.number().int().min(0).optional(),
  autoBook: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const schedules = await getMaintenanceSchedules(user!.id);
    return successResponse(schedules);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}

export async function POST(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  const { data: body, error: valErr } = await validateBody(request, createScheduleSchema);
  if (valErr) return valErr;

  try {
    const schedule = await createMaintenanceSchedule({
      ...body!,
      nextDue: body!.nextDue ? new Date(body!.nextDue) : undefined,
    });
    return successResponse(schedule, 201);
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}
