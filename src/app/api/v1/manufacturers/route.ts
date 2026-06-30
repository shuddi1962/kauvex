import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser, validateBody, paginatedResponse } from "@/lib/api-helpers";
import { createManufacturer, listManufacturers } from "@/lib/manufacturers/registration";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createManufacturerSchema = z.object({
  companyName: z.string().min(2).max(200),
  slug: z.string().min(2).max(100),
  countryCode: z.string().min(2).max(10),
  city: z.string().max(100).optional(),
  manufacturingHub: z.string().max(100).optional(),
  registrationNumber: z.string().max(100).optional(),
  businessType: z.enum(["manufacturer", "trading_company", "agent"]),
  yearEstablished: z.number().int().min(1800).max(2100).optional(),
  employeeCountRange: z.string().max(30).optional(),
  factorySizeSqm: z.number().int().positive().optional(),
  website: z.string().url().optional(),
  categories: z.array(z.object({
    category: z.string(),
    isPrimary: z.boolean(),
    productTypes: z.array(z.string()),
  })).min(1),
  capability: z.object({
    monthlyCapacity: z.number().int().positive().optional(),
    capacityUnit: z.string().optional(),
    currentUtilizationPercent: z.number().min(0).max(100).optional(),
    defaultMoq: z.number().int().positive().optional(),
    defaultLeadTimeDays: z.number().int().positive().optional(),
    sampleLeadTimeDays: z.number().int().positive().optional(),
    allowsPrivateLabel: z.boolean().optional(),
    allowsCustomPackaging: z.boolean().optional(),
    allowsOem: z.boolean().optional(),
    allowsOdm: z.boolean().optional(),
  }).optional(),
  certifications: z.array(z.object({
    certificationType: z.string(),
    certificateUrl: z.string().url().optional(),
    issuedBy: z.string().optional(),
    validUntil: z.string().optional(),
  })).optional(),
}).strict();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const result = await listManufacturers({
      countryCode: searchParams.get("country") || undefined,
      category: searchParams.get("category") || undefined,
      verificationTier: searchParams.get("verification") || undefined,
      status: searchParams.get("status") || undefined,
      search: searchParams.get("q") || undefined,
      page,
      limit,
    });

    return paginatedResponse(result.manufacturers, result.total, result.page, result.limit);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}

export async function POST(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  const { data: body, error: valErr } = await validateBody(request, createManufacturerSchema);
  if (valErr) return valErr;

  try {
    const manufacturer = await createManufacturer({
      companyName: body!.companyName,
      slug: body!.slug,
      countryCode: body!.countryCode,
      city: body!.city,
      manufacturingHub: body!.manufacturingHub,
      registrationNumber: body!.registrationNumber,
      businessType: body!.businessType,
      yearEstablished: body!.yearEstablished,
      employeeCountRange: body!.employeeCountRange,
      factorySizeSqm: body!.factorySizeSqm,
      website: body!.website,
      userId: user!.id,
      categories: body!.categories,
      capability: body!.capability,
      certifications: body!.certifications?.map((c) => ({
        ...c,
        validUntil: c.validUntil ? new Date(c.validUntil) : undefined,
      })),
    });
    return successResponse(manufacturer, 201);
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}
