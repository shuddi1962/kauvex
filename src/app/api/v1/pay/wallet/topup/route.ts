import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser, validateBody } from "@/lib/api-helpers";
import { getOrCreateWallet, topUpWallet } from "@/lib/pay/wallet";
import { z } from "zod";

export const dynamic = "force-dynamic";

const topUpSchema = z.object({
  amount: z.number().positive().min(500),
  method: z.enum(["card", "bank_transfer", "ussd"]).default("card"),
  gatewayReference: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const wallet = await getOrCreateWallet({ ownerId: user!.id, ownerType: "customer" });
    return successResponse(wallet as unknown as Record<string, unknown>);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}

export async function POST(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  const { data: body, error: valErr } = await validateBody(request, topUpSchema);
  if (valErr) return valErr;

  try {
    const wallet = await getOrCreateWallet({ ownerId: user!.id, ownerType: "customer" });
    const txn = await topUpWallet({
      walletId: wallet.id,
      amount: body!.amount,
      method: body!.method,
      gateway: body!.method === "card" ? "paystack" : body!.method,
      gatewayReference: body!.gatewayReference,
    });
    return successResponse({ wallet, transaction: txn }, 201);
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}
