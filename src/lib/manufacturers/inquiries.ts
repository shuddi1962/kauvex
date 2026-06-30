import prisma from "@/lib/db";

export interface CreateInquiryInput {
  manufacturerId: string;
  buyerId: string;
  buyerType?: string;
  productDescription: string;
  referenceImages?: string[];
  desiredQuantity?: number;
  customizationDetails?: string;
  targetPrice?: number;
  destinationCountry?: string;
}

export interface CreateQuoteInput {
  inquiryId: string;
  manufacturerId: string;
  pricingTiers: { minQty: number; maxQty: number; unitPrice: number }[];
  moq: number;
  leadTimeDays: number;
  sampleCost?: number;
  sampleAvailable?: boolean;
  paymentTerms?: string;
  incoterm?: string;
  validUntil?: Date;
  notes?: string;
}

export async function createInquiry(input: CreateInquiryInput) {
  return prisma.mfgInquiry.create({
    data: {
      manufacturer_id: input.manufacturerId,
      buyer_id: input.buyerId,
      buyer_type: input.buyerType ?? "customer",
      product_description: input.productDescription,
      reference_images: input.referenceImages ?? [],
      desired_quantity: input.desiredQuantity ?? null,
      customization_details: input.customizationDetails ?? null,
      target_price: input.targetPrice ?? null,
      destination_country: input.destinationCountry ?? null,
    },
  });
}

export async function getInquiryById(id: string) {
  return prisma.mfgInquiry.findUnique({
    where: { id },
    include: {
      quotes: true,
      manufacturer: {
        select: {
          id: true,
          company_name: true,
          slug: true,
          country_code: true,
          verification_tier: true,
        },
      },
    },
  });
}

export async function listInquiriesForManufacturer(manufacturerId: string, status?: string) {
  const where: any = { manufacturer_id: manufacturerId };
  if (status) where.status = status;

  return prisma.mfgInquiry.findMany({
    where,
    include: { quotes: true },
    orderBy: { created_at: "desc" },
  });
}

export async function listInquiriesForBuyer(buyerId: string) {
  return prisma.mfgInquiry.findMany({
    where: { buyer_id: buyerId },
    include: {
      quotes: true,
      manufacturer: {
        select: {
          id: true,
          company_name: true,
          slug: true,
          country_code: true,
        },
      },
    },
    orderBy: { created_at: "desc" },
  });
}

export async function createQuote(input: CreateQuoteInput) {
  return prisma.mfgQuote.create({
    data: {
      inquiry_id: input.inquiryId,
      manufacturer_id: input.manufacturerId,
      pricing_tiers: input.pricingTiers,
      moq: input.moq,
      lead_time_days: input.leadTimeDays,
      sample_cost: input.sampleCost ?? null,
      sample_available: input.sampleAvailable ?? false,
      payment_terms: input.paymentTerms ?? null,
      incoterm: input.incoterm ?? null,
      valid_until: input.validUntil ?? null,
      notes: input.notes ?? null,
    },
  });
}

export async function getQuotesForInquiry(inquiryId: string) {
  return prisma.mfgQuote.findMany({
    where: { inquiry_id: inquiryId },
    include: {
      manufacturer: {
        select: {
          id: true,
          company_name: true,
          slug: true,
          verification_tier: true,
          trust_score: true,
        },
      },
    },
    orderBy: { created_at: "desc" },
  });
}

export async function acceptQuote(quoteId: string) {
  return prisma.$transaction(async (tx) => {
    const quote = await tx.mfgQuote.findUnique({
      where: { id: quoteId },
      include: { inquiry: true },
    });

    if (!quote) throw new Error("Quote not found");

    // Reject other quotes for the same inquiry
    await tx.mfgQuote.updateMany({
      where: {
        inquiry_id: quote.inquiry_id,
        id: { not: quoteId },
      },
      data: { status: "rejected" },
    });

    // Mark accepted quote
    await tx.mfgQuote.update({
      where: { id: quoteId },
      data: { status: "accepted" },
    });

    // Update inquiry status
    await tx.mfgInquiry.update({
      where: { id: quote.inquiry_id },
      data: { status: "quoted" },
    });

    // Calculate total from first pricing tier (or use unitPrice * moq as estimate)
    const tiers = (quote.pricingTiers as any[]) ?? [];
    const estimatedTotal = tiers.length > 0 ? Number(tiers[0].unitPrice) * (quote.moq ?? 1) : 0;

    // Create order
    const order = await tx.mfgOrder.create({
      data: {
        quoteId: quoteId,
        manufacturerId: quote.manufacturerId,
        buyerId: quote.inquiry.buyerId ?? "",
        totalValue: estimatedTotal,
        depositPercent: 30,
        milestoneStructure: {
          productDescription: quote.inquiry.productDescription,
          quantity: quote.moq,
          unitPrice: tiers.length > 0 ? Number(tiers[0].unitPrice) : 0,
        },
        status: "active",
      },
    });

    // Create escrow
    await tx.mfgEscrow.create({
      data: {
        orderId: order.id,
        totalAmount: estimatedTotal,
        depositedAmount: 0,
        releasedAmount: 0,
        status: "funded",
        milestoneReleases: [],
      },
    });

    return order;
  });
}
