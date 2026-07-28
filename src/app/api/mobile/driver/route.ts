import { NextRequest } from "next/server";
import { formatMobileResponse, formatMobileError, authenticateMobileRequest } from "@/lib/mobile-api-helpers";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const auth = authenticateMobileRequest(request);
  if (!auth) {
    return formatMobileError("Unauthorized", 401);
  }

  try {
    const driverId = auth.userId;
    const { searchParams } = new URL(request.url);
    const section = searchParams.get("section") || "deliveries";

    switch (section) {
      case "deliveries": {
        const jobs = await prisma.kv_ship_delivery_job.findMany({
          where: { partnerId: driverId },
          orderBy: { createdAt: "desc" },
          take: 20,
        }).catch(() => []);
        return formatMobileResponse({
          deliveries: jobs.map((j: any) => ({
            id: j.id,
            status: j.status,
            pickupAddress: j.pickupAddress,
            dropoffAddress: j.dropoffAddress,
            scheduledAt: j.scheduledAt,
            earnings: Number(j.payoutAmount || 0),
          })),
          stats: {
            active: jobs.filter((j: any) => j.status === "assigned" || j.status === "in_transit").length,
            completed: jobs.filter((j: any) => j.status === "delivered").length,
            totalEarnings: jobs.reduce((s: number, j: any) => s + Number(j.payoutAmount || 0), 0),
          },
        });
      }

      case "earnings": {
        const jobs = await prisma.kv_ship_delivery_job.findMany({
          where: { partnerId: driverId, status: "delivered" },
        }).catch(() => []);
        const totalEarnings = jobs.reduce((s: number, j: any) => s + Number(j.payoutAmount || 0), 0);
        return formatMobileResponse({ totalEarnings, completedJobs: jobs.length, jobs });
      }

      default:
        return formatMobileError(`Unknown section: ${section}`);
    }
  } catch (error) {
    return formatMobileError("Failed to load driver data");
  }
}

export async function PUT(request: NextRequest) {
  const auth = authenticateMobileRequest(request);
  if (!auth) {
    return formatMobileError("Unauthorized", 401);
  }

  try {
    const body = await request.json();
    const { action, jobId } = body;

    if (action === "accept_job") {
      await prisma.kv_ship_delivery_job.update({ where: { id: jobId }, data: { status: "assigned" as any } }).catch(() => {});
      return formatMobileResponse({ accepted: true, jobId });
    }

    if (action === "update_status") {
      await prisma.kv_ship_delivery_job.update({ where: { id: jobId }, data: { status: body.status as any } }).catch(() => {});
      return formatMobileResponse({ updated: true, jobId, status: body.status });
    }

    return formatMobileError(`Unknown action: ${action}`);
  } catch {
    return formatMobileError("Invalid request body");
  }
}