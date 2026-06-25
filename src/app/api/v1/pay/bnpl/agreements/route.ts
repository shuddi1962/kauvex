import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser, validateBody } from "@/lib/api-helpers";
import { createBnplAgreement, getCustomerAgreements } from "@/lib/pay/bnpl";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createAgreementSchema = z.object({
  orderId: z.string().uuid(),
  totalAmount: z.number().positive(),
  paymentMethodType: z.enum(["card", "wallet"]),
  paymentMethodId: z.string(),
  creditPartner: z.string().optional(),
  creditPartnerReference: z.string().optional(),
  creditScore: z.number().optional(),
});

export async function GET(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  const url = new URL(request.url);
  const status = url.searchParams.get("status") || undefined;
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
  const limit = Math.min(50, parseInt(url.searchParams.get("limit") || "20"));
  const offset = (page - 1) * limit;

  try {
    const result = await getCustomerAgreements(user!.id, { limit, offset, status: status || undefined });
    return successResponse(result);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}

export async function POST(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  const { data: body, error: valErr } = await validateBody(request, createAgreementSchema);
  if (valErr) return valErr;

  try {
    const agreement = await createBnplAgreement({
      customerId: user!.id,
      orderId: body!.orderId,
      totalAmount: body!.totalAmount,
      paymentMethodType: body!.paymentMethodType,
      paymentMethodId: body!.paymentMethodId,
      creditPartner: body!.creditPartner,
      creditPartnerReference: body!.creditPartnerReference,
      creditScore: body!.creditScore,
    });
    return successResponse(agreement, 201);
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}
