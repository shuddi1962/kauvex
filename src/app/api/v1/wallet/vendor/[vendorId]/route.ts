import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import {
  successResponse,
  errorResponse,
  paginatedResponse,
  getAuthUser,
  validateBody,
} from "@/lib/api-helpers";
import {
  getVendorBalance,
  getVendorTransactions,
  creditVendorWallet,
  debitVendorWallet,
} from "@/lib/payments/wallet";
import { z } from "zod";

export const dynamic = "force-dynamic";

const walletTransactionSchema = z.object({
  type: z.enum(["credit", "debit"]),
  amount: z.number().positive(),
  referenceType: z.string().min(1),
  referenceId: z.string().min(1),
  description: z.string().min(1),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { vendorId: string } },
) {
  const { user, profile, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  const { vendorId } = params;
  const isOwner = profile?.vendorId === vendorId;
  const isAdmin = profile?.role && ["super-admin", "finance-admin"].includes(profile.role);
  if (!isOwner && !isAdmin) return errorResponse("Access denied", 403);

  try {
    const { searchParams } = new URL(request.url);
    const includeTxns = searchParams.get("transactions") !== "false";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10")));
    const offset = (page - 1) * limit;

    const balance = await getVendorBalance(vendorId);

    if (!includeTxns) {
      return successResponse({ vendorId, balance });
    }

    const txns = await getVendorTransactions(vendorId, limit, offset);

    return paginatedResponse(txns.transactions, txns.total, page, limit);
  } catch {
    return errorResponse("Failed to fetch vendor wallet", 500);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { vendorId: string } },
) {
  const { user, profile, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  const isAdmin = profile?.role && ["super-admin", "finance-admin"].includes(profile.role);
  if (!isAdmin) return errorResponse("Admin access required", 403);

  const { data: body, error: valErr } = await validateBody(request, walletTransactionSchema);
  if (valErr) return valErr;

  try {
    const { vendorId } = params;

    const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
    if (!vendor) return errorResponse("Vendor not found", 404);

    let result;
    if (body!.type === "credit") {
      result = await creditVendorWallet(
        vendorId,
        body!.amount,
        "admin_adjustment",
        body!.referenceType,
        body!.referenceId,
        body!.description,
      );
    } else {
      result = await debitVendorWallet(
        vendorId,
        body!.amount,
        "admin_adjustment",
        body!.referenceType,
        body!.referenceId,
        body!.description,
      );
    }

    return successResponse(result as unknown as Record<string, unknown>, 201);
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}
