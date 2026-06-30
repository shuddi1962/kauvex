import prisma from "@/lib/db";

export interface RequestSampleInput {
  inquiryId?: string;
  manufacturerId: string;
  buyerId: string;
  productDescription?: string;
  sampleCost: number;
  shippingFee: number;
}

export async function requestSample(input: RequestSampleInput) {
  return prisma.mfgSample.create({
    data: {
      inquiryId: input.inquiryId ?? null,
      manufacturerId: input.manufacturerId,
      buyerId: input.buyerId,
      productDescription: input.productDescription ?? null,
      sampleCost: input.sampleCost,
      shippingFee: input.shippingFee,
      totalCost: input.sampleCost + input.shippingFee,
      status: "requested",
    },
  });
}

export async function updateSampleStatus(
  sampleId: string,
  status: string,
  shipmentId?: string
) {
  return prisma.mfgSample.update({
    where: { id: sampleId },
    data: {
      status,
      shipmentId: shipmentId ?? null,
    },
  });
}

export async function listSamplesForBuyer(buyerId: string) {
  return prisma.mfgSample.findMany({
    where: { buyerId },
    include: {
      manufacturer: {
        select: {
          id: true,
          companyName: true,
          slug: true,
          countryCode: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function listSamplesForManufacturer(manufacturerId: string) {
  return prisma.mfgSample.findMany({
    where: { manufacturerId },
    orderBy: { createdAt: "desc" },
  });
}
