import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser, validateBody } from "@/lib/api-helpers";
import { getOrCreateWallet, setWalletPin, verifyWalletPin } from "@/lib/pay/wallet";
import { z } from "zod";
import crypto from "crypto";

export const dynamic = "force-dynamic";

function hashPin(pin: string): string {
  return crypto.createHash("sha256").update(pin).digest("hex");
}

const setPinSchema = z.object({
  pin: z.string().length(4, "PIN must be 4 digits"),
});

const verifyPinSchema = z.object({
  pin: z.string().length(4, "PIN must be 4 digits"),
});

export async function POST(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  const { data: body, error: valErr } = await validateBody(request, setPinSchema);
  if (valErr) return valErr;

  try {
    const wallet = await getOrCreateWallet({ ownerId: user!.id, ownerType: "customer" });
    const pinHash = hashPin(body!.pin);
    await setWalletPin(wallet.id, pinHash);
    return successResponse({ message: "PIN set successfully" });
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}

export async function PUT(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  const { data: body, error: valErr } = await validateBody(request, verifyPinSchema);
  if (valErr) return valErr;

  try {
    const wallet = await getOrCreateWallet({ ownerId: user!.id, ownerType: "customer" });
    const valid = await verifyWalletPin(wallet.id, hashPin(body!.pin));
    return successResponse({ valid });
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}
