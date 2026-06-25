import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser, validateBody } from "@/lib/api-helpers";
import { getOrCreateWallet, requestWithdrawal } from "@/lib/pay/wallet";
import { z } from "zod";

export const dynamic = "force-dynamic";

const withdrawSchema = z.object({
  amount: z.number().positive().min(1000),
  bankAccountCode: z.string().min(1),
  description: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  const { data: body, error: valErr } = await validateBody(request, withdrawSchema);
  if (valErr) return valErr;

  try {
    const wallet = await getOrCreateWallet({ ownerId: user!.id, ownerType: "customer" });
    const txn = await requestWithdrawal({
      walletId: wallet.id,
      amount: body!.amount,
      bankAccountCode: body!.bankAccountCode,
      description: body!.description,
    });
    return successResponse(txn, 201);
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}
