import { NextRequest } from "next/server";
import { successResponse, errorResponse, requireAdmin } from "@/lib/api-helpers";
import {
  getCredentialStatuses,
  getCredentialAuditLog,
  logCredentialAction,
} from "@/lib/security/credentials";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await requireAdmin(request);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const credentialName = searchParams.get("credential") || undefined;
    const limit = Math.min(Number(searchParams.get("limit") || "50"), 200);

    const [statuses, auditLog] = await Promise.all([
      getCredentialStatuses(),
      getCredentialAuditLog(credentialName, limit),
    ]);

    const summary = {
      total: statuses.length,
      ok: statuses.filter((s) => s.rotationStatus === "ok").length,
      warning: statuses.filter((s) => s.rotationStatus === "warning").length,
      overdue: statuses.filter((s) => s.rotationStatus === "overdue").length,
    };

    return successResponse({
      statuses,
      auditLog,
      summary,
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
    const { credentialName, action, notes } = body as {
      credentialName: string;
      action: "rotated" | "viewed" | "revoked";
      notes?: string;
    };

    if (!credentialName || !action) {
      return errorResponse("credentialName and action are required", 422);
    }

    if (!["rotated", "viewed", "revoked"].includes(action)) {
      return errorResponse("action must be 'rotated', 'viewed', or 'revoked'", 422);
    }

    const log = await logCredentialAction(credentialName, action, user!.id, notes);

    return successResponse({
      logId: log.id,
      credentialName: log.credentialName,
      action: log.action,
      performedBy: log.performedBy,
      createdAt: log.createdAt,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal server error";
    return errorResponse(message, 500);
  }
}
