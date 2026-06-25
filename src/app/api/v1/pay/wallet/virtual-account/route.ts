import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const wallet = await prisma.payWallet.findUnique({
      where: { ownerId: user!.id },
      include: { virtualAccounts: { where: { isActive: true } } },
    });

    if (!wallet) return errorResponse("Wallet not found", 404);

    return successResponse({
      virtualAccounts: wallet.virtualAccounts.map((va) => ({
        id: va.id,
        bankName: va.bankName,
        accountNumber: va.accountNumber,
        accountName: va.accountName,
        provider: va.provider,
      })),
    });
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}

export async function POST(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const wallet = await prisma.payWallet.findUnique({ where: { ownerId: user!.id } });
    if (!wallet) return errorResponse("Wallet not found", 404);

    // In production, this calls Paystack API to create a dedicated virtual account
    // POST https://api.paystack.co/dedicated_account
    const paystackKey = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackKey) return errorResponse("Payment provider not configured", 500);

    const res = await fetch("https://api.paystack.co/dedicated_account", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customer: user!.email,
        preferred_bank: "wema-bank",
      }),
    });

    const data = await res.json();
    if (!data.status) return errorResponse("Failed to create virtual account", 400);

    const va = await prisma.payVirtualAccount.create({
      data: {
        walletId: wallet.id,
        bankName: data.data.bank.name,
        accountNumber: data.data.account_number,
        accountName: data.data.account_name,
        provider: "paystack",
      },
    });

    return successResponse({
      id: va.id,
      bankName: va.bankName,
      accountNumber: va.accountNumber,
      accountName: va.accountName,
    }, 201);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
