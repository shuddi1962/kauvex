import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { successResponse, errorResponse, getAuthUser, validateBody } from "@/lib/api-helpers";
import { creditVendorWallet, getVendorBalance, getVendorTransactions, debitVendorWallet } from "@/lib/payments/wallet";
import { z } from "zod";

export const dynamic = "force-dynamic";

const depositSchema = z.object({
  amount: z.number().positive(),
  paymentMethod: z.enum(["card", "bank_transfer", "paystack", "flutterwave"]).default("bank_transfer"),
});

export async function GET(request: NextRequest) {
  const { user, profile, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;
  const vendorId = profile?.vendorId;
  if (!vendorId) return errorResponse("Vendor profile not found", 404);
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10")));
    const offset = (page - 1) * limit;
    const balance = await getVendorBalance(vendorId);
    const txns = await getVendorTransactions(vendorId, limit, offset);
    return successResponse({ vendorId, balance, transactions: txns.transactions, total: txns.total, page, limit });
  } catch {
    return errorResponse("Failed to fetch wallet", 500);
  }
}

export async function POST(request: NextRequest) {
  const { user, profile, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;
  const vendorId = profile?.vendorId;
  if (!vendorId) return errorResponse("Vendor profile not found", 404);
  const { data: body, error: valErr } = await validateBody(request, depositSchema);
  if (valErr) return valErr;
  try {
    const result = await creditVendorWallet(
      vendorId, body!.amount, "deposit", "wallet_deposit",
      `deposit_${Date.now()}`, `Wallet top-up of $${body!.amount.toFixed(2)} via ${body!.paymentMethod}`
    );
    return successResponse(result as unknown as Record<string, unknown>, 201);
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}
