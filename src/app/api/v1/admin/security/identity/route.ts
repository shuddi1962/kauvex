import { NextRequest } from "next/server";
import { successResponse, errorResponse, requireAdmin } from "@/lib/api-helpers";
import {
  getPendingVerifications,
  getVerificationStats,
  reviewVerification,
} from "@/lib/security/identity-verification";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await requireAdmin(request);
    if (authError) return authError;

    const [stats, pendingVerifications] = await Promise.all([
      getVerificationStats(),
      getPendingVerifications(),
    ]);

    return successResponse({
      stats,
      pendingVerifications,
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
    const { verificationId, decision, notes } = body as {
      verificationId: string;
      decision: "passed" | "failed";
      notes?: string;
    };

    if (!verificationId || !decision) {
      return errorResponse("verificationId and decision are required", 422);
    }

    if (!["passed", "failed"].includes(decision)) {
      return errorResponse("decision must be 'passed' or 'failed'", 422);
    }

    const result = await reviewVerification(verificationId, user!.id, decision, notes);

    return successResponse({
      verificationId: result.id,
      status: result.status,
      reviewedBy: result.reviewedBy,
      reviewedAt: result.reviewedAt,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal server error";
    return errorResponse(message, 500);
  }
}
