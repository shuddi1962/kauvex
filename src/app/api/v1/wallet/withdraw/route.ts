import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import {
  successResponse,
  errorResponse,
  getAuthUser,
  validateBody,
} from "@/lib/api-helpers";
import { debitVendorWallet } from "@/lib/payments/wallet";
import { z } from "zod";

export const dynamic = "force-dynamic";

const withdrawalSchema = z.object({
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

export async function POST(request: NextRequest) {
  const { user, profile, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  const { data: body, error: valErr } = await validateBody(request, withdrawalSchema);
  if (valErr) return valErr;

  try {
    const { vendorId, amount, method, accountDetails } = body!;

    const isOwner = profile?.vendorId === vendorId;
    if (!isOwner) return errorResponse("Access denied", 403);

    const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
    if (!vendor) return errorResponse("Vendor not found", 404);

    const currentBalance = await prisma.profile.findFirst({
      where: { vendorId },
      select: { walletBalance: true },
    });

    const balance = Number(currentBalance?.walletBalance ?? 0);
    if (balance < amount) {
      return errorResponse("Insufficient wallet balance", 422);
    }

    const commissionRate = Number(vendor.commission ?? 10);
    const commission = Math.round(amount * (commissionRate / 100) * 100) / 100;
    const netAmount = amount - commission;

    const payout = await prisma.vendorPayout.create({
      data: {
        vendorId,
        amount,
        commission,
        netAmount,
        method,
        accountDetails: accountDetails as Prisma.InputJsonValue,
        status: "pending",
      },
    });

    await debitVendorWallet(
      vendorId,
      amount,
      "withdrawal",
      "payout",
      payout.id,
      `Withdrawal of ${amount} via ${method}`,
    );

    return successResponse(payout as unknown as Record<string, unknown>, 201);
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}
