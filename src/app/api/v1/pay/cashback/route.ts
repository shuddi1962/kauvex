import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import { getCustomerCashback } from "@/lib/pay/cashback";
import { getOrCreateWallet } from "@/lib/pay/wallet";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  const url = new URL(request.url);
  const status = url.searchParams.get("status") || undefined;
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
  const limit = Math.min(50, parseInt(url.searchParams.get("limit") || "20"));
  const offset = (page - 1) * limit;

  try {
    const wallet = await getOrCreateWallet({ ownerId: user!.id, ownerType: "customer" });
    const result = await getCustomerCashback(wallet.id, { limit, offset, status: status || undefined });
    return successResponse(result);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
