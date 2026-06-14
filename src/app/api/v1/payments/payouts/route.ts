import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import {
  successResponse,
  errorResponse,
  paginatedResponse,
  getAuthUser,
  requireAdmin,
  validateBody,
} from "@/lib/api-helpers";
import { schedulePayout, processPayoutBatch, getPayoutHistory } from "@/lib/payments/payouts";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schedulePayoutSchema = z.object({
  vendorId: z.string().uuid(),
  amount: z.number().positive(),
  method: z.enum(["bank_transfer", "paystack", "flutterwave"]),
  accountDetails: z.object({
    bankName: z.string().optional(),
    accountNumber: z.string().optional(),
    accountName: z.string().optional(),
    routingNumber: z.string().optional(),
    swiftCode: z.string().optional(),
    paystackRecipientCode: z.string().optional(),
    flutterwaveRecipientId: z.string().optional(),
  }),
});

const processBatchSchema = z.object({
  scheduleType: z.enum(["manual", "scheduled", "auto"]).default("manual"),
});

export async function GET(request: NextRequest) {
  const { user, profile, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get("vendorId") || profile?.vendorId || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10")));
    const offset = (page - 1) * limit;

    if (!vendorId) return errorResponse("vendorId is required", 400);

    const isOwner = profile?.vendorId === vendorId;
    const isAdmin = profile?.role && ["super-admin", "finance-admin"].includes(profile.role);
    if (!isOwner && !isAdmin) return errorResponse("Access denied", 403);

    const history = await getPayoutHistory(vendorId, limit, offset);
    return paginatedResponse(history.payouts, history.total, page, limit);
  } catch {
    return errorResponse("Failed to fetch payouts", 500);
  }
}

export async function POST(request: NextRequest) {
  const { user, profile, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  const contentType = request.headers.get("content-type") || "";
  const isBatch = request.nextUrl.searchParams.get("batch") === "true";

  if (isBatch) {
    const { error: adminErr } = await requireAdmin(request);
    if (adminErr) return adminErr;

    const { data: body, error: valErr } = await validateBody(request, processBatchSchema);
    if (valErr) return valErr;

    try {
      const batch = await processPayoutBatch(body!.scheduleType);
      if (!batch) return successResponse({ message: "No pending payouts to process" });
      return successResponse(batch as unknown as Record<string, unknown>);
    } catch (err) {
      return errorResponse((err as Error).message, 400);
    }
  }

  const { data: body, error: valErr } = await validateBody(request, schedulePayoutSchema);
  if (valErr) return valErr;

  try {
    const { vendorId } = body!;

    const isOwner = profile?.vendorId === vendorId;
    const isAdmin = profile?.role && ["super-admin", "finance-admin"].includes(profile.role);
    if (!isOwner && !isAdmin) return errorResponse("Access denied", 403);

    const payout = await schedulePayout(
      vendorId,
      body!.amount,
      body!.method,
      body!.accountDetails,
    );

    return successResponse(payout as unknown as Record<string, unknown>, 201);
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}
