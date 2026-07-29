import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const business = await prisma.kaiBusiness.findUnique({
      where: { userId: user!.id },
    });

    if (!business) {
      return errorResponse("Business not found", 404);
    }

    return successResponse(business);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}

export async function POST(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const body = await request.json();
    const { companyName, industry, staffCount, description, products, services, locations, website, logoUrl, contactEmail, contactPhone, onboarded, metadata } = body;

    if (!companyName) {
      return errorResponse("companyName is required", 400);
    }

    const business = await prisma.kaiBusiness.upsert({
      where: { userId: user!.id },
      update: {
        companyName,
        industry: industry ?? null,
        staffCount: staffCount ?? null,
        description: description ?? null,
        products: products ?? null,
        services: services ?? null,
        locations: locations ?? [],
        website: website ?? null,
        logoUrl: logoUrl ?? null,
        contactEmail: contactEmail ?? null,
        contactPhone: contactPhone ?? null,
        onboarded: onboarded ?? false,
        metadata: metadata ?? {},
      },
      create: {
        userId: user!.id,
        companyName,
        industry: industry ?? null,
        staffCount: staffCount ?? null,
        description: description ?? null,
        products: products ?? null,
        services: services ?? null,
        locations: locations ?? [],
        website: website ?? null,
        logoUrl: logoUrl ?? null,
        contactEmail: contactEmail ?? null,
        contactPhone: contactPhone ?? null,
        onboarded: onboarded ?? false,
        metadata: metadata ?? {},
      },
    });

    return successResponse(business, 201);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
