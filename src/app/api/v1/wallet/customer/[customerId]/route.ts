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
  getCustomerBalance,
  getCustomerTransactions,
  creditCustomerWallet,
  debitCustomerWallet,
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
  { params }: { params: { customerId: string } },
) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  const { customerId } = params;
  if (customerId !== user!.id) return errorResponse("Access denied", 403);

  try {
    const { searchParams } = new URL(request.url);
    const includeTxns = searchParams.get("transactions") !== "false";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10")));
    const offset = (page - 1) * limit;

    const balance = await getCustomerBalance(customerId);

    if (!includeTxns) {
      return successResponse({ customerId, balance });
    }

    const txns = await getCustomerTransactions(customerId, limit, offset);

    return paginatedResponse(txns.transactions, txns.total, page, limit);
  } catch {
    return errorResponse("Failed to fetch customer wallet", 500);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { customerId: string } },
) {
  const { user, profile, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  const { customerId } = params;
  const isAdmin = profile?.role && ["super-admin", "finance-admin"].includes(profile.role);
  const isOwner = customerId === user!.id;
  if (!isOwner && !isAdmin) return errorResponse("Access denied", 403);

  if (isOwner && !isAdmin) {
    return errorResponse("Customers cannot directly modify wallet balance", 403);
  }

  const { data: body, error: valErr } = await validateBody(request, walletTransactionSchema);
  if (valErr) return valErr;

  try {
    const profile_rec = await prisma.profile.findUnique({ where: { id: customerId } });
    if (!profile_rec) return errorResponse("Customer not found", 404);

    let result;
    if (body!.type === "credit") {
      result = await creditCustomerWallet(
        customerId,
        body!.amount,
        "admin_adjustment",
        body!.referenceType,
        body!.referenceId,
        body!.description,
      );
    } else {
      result = await debitCustomerWallet(
        customerId,
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
