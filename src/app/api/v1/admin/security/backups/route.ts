import { NextRequest } from "next/server";
import { successResponse, errorResponse, requireAdmin } from "@/lib/api-helpers";
import {
  getBackupStats,
  getBackupHistory,
  createBackupRecord,
} from "@/lib/security/backups";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await requireAdmin(request);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get("limit") || "50"), 200);

    const [stats, history] = await Promise.all([
      getBackupStats(),
      getBackupHistory(limit),
    ]);

    return successResponse({
      stats,
      history,
      requestedBy: user!.id,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal server error";
    return errorResponse(message, 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await requireAdmin(request);
    if (authError) return authError;

    const body = await request.json();
    const { type, storageLocation, fileName } = body as {
      type: "daily" | "weekly" | "monthly";
      storageLocation: string;
      fileName: string;
    };

    if (!type || !storageLocation || !fileName) {
      return errorResponse("type, storageLocation, and fileName are required", 422);
    }

    if (!["daily", "weekly", "monthly"].includes(type)) {
      return errorResponse("type must be 'daily', 'weekly', or 'monthly'", 422);
    }

    const backup = await createBackupRecord(type, storageLocation, fileName);

    return successResponse({
      backupId: backup.id,
      status: backup.status,
      backupType: backup.backupType,
      fileName: backup.fileName,
      triggeredBy: user!.id,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal server error";
    return errorResponse(message, 500);
  }
}
