import { NextRequest } from "next/server";
import { successResponse, errorResponse, requireAdmin } from "@/lib/api-helpers";
import {
  getFraudStats,
  getBlacklistedItems,
  addToBlacklist,
  removeFromBlacklist,
} from "@/lib/security/fraud-rules";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await requireAdmin(request);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || undefined;

    const [stats, blacklist] = await Promise.all([
      getFraudStats(),
      getBlacklistedItems(type),
    ]);

    return successResponse({
      stats,
      blacklist,
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
    const { action, type, value, reason, expiresAt } = body as {
      action: "add" | "remove";
      type: string;
      value: string;
      reason?: string;
      expiresAt?: string;
    };

    if (!action || !type || !value) {
      return errorResponse("action, type, and value are required", 422);
    }

    if (action === "add") {
      if (!reason) return errorResponse("reason is required for blacklist add", 422);
      await addToBlacklist(type, value, reason, user!.id, expiresAt ? new Date(expiresAt) : undefined);
      return successResponse({ added: true, type, value });
    }

    if (action === "remove") {
      await removeFromBlacklist(type, value);
      return successResponse({ removed: true, type, value });
    }

    return errorResponse("Invalid action. Use 'add' or 'remove'.", 422);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal server error";
    return errorResponse(message, 500);
  }
}
