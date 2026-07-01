import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";

export interface CreateManufacturerInput {
  companyName: string;
  slug: string;
  countryCode: string;
  city?: string;
  manufacturingHub?: string;
  registrationNumber?: string;
  businessType: 'manufacturer' | 'trading_company' | 'agent';
  yearEstablished?: number;
  employeeCountRange?: string;
  factorySizeSqm?: number;
  website?: string;
  userId?: string;
  categories: { category: string; isPrimary: boolean; productTypes: string[] }[];
  capability?: CreateCapabilityInput;
  certifications?: CreateCertificationInput[];
  factoryMedia?: CreateFactoryMediaInput[];
}

export interface CreateCapabilityInput {
  monthlyCapacity?: number;
  capacityUnit?: string;
  currentUtilizationPercent?: number;
  defaultMoq?: number;
  defaultLeadTimeDays?: number;
  sampleLeadTimeDays?: number;
  allowsPrivateLabel?: boolean;
  allowsCustomPackaging?: boolean;
  allowsOem?: boolean;
  allowsOdm?: boolean;
}

export interface CreateCertificationInput {
  certificationType: string;
  certificateUrl?: string;
  issuedBy?: string;
  validUntil?: Date;
}

export interface CreateFactoryMediaInput {
  mediaType: 'photo' | 'video';
  url: string;
  caption?: string;
  sortOrder?: number;
}

export interface ManufacturerListFilters {
  countryCode?: string;
  category?: string;
  verificationTier?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export async function createManufacturer(data: CreateManufacturerInput) {
  return prisma.$transaction(async (tx) => {
    const manufacturer = await tx.mfgManufacturer.create({
      data: {
        companyName: data.companyName,
        slug: data.slug,
        countryCode: data.countryCode,
        city: data.city ?? null,
        manufacturingHub: data.manufacturingHub ?? null,
        registrationNumber: data.registrationNumber ?? null,
        businessType: data.businessType,
        yearEstablished: data.yearEstablished ?? null,
        employeeCountRange: data.employeeCountRange ?? null,
        factorySizeSqm: data.factorySizeSqm ?? null,
        website: data.website ?? null,
        userId: data.userId ?? null,
      },
    });

    if (data.categories.length > 0) {
      await tx.mfgCategory.createMany({
        data: data.categories.map((c) => ({
          manufacturerId: manufacturer.id,
          category: c.category,
          isPrimary: c.isPrimary,
          productTypes: c.productTypes,
        })),
      });
    }

    if (data.capability) {
      await tx.mfgCapability.create({
        data: {
          manufacturerId: manufacturer.id,
          monthlyCapacity: data.capability.monthlyCapacity ?? null,
          capacityUnit: data.capability.capacityUnit ?? null,
          currentUtilizationPercent: data.capability.currentUtilizationPercent ?? null,
          defaultMoq: data.capability.defaultMoq ?? null,
          defaultLeadTimeDays: data.capability.defaultLeadTimeDays ?? null,
          sampleLeadTimeDays: data.capability.sampleLeadTimeDays ?? null,
          allowsPrivateLabel: data.capability.allowsPrivateLabel ?? false,
          allowsCustomPackaging: data.capability.allowsCustomPackaging ?? false,
          allowsOem: data.capability.allowsOem ?? false,
          allowsOdm: data.capability.allowsOdm ?? false,
        },
      });
    }

    if (data.certifications && data.certifications.length > 0) {
      await tx.mfgCertification.createMany({
        data: data.certifications.map((c) => ({
          manufacturerId: manufacturer.id,
          certificationType: c.certificationType,
          certificateUrl: c.certificateUrl ?? null,
          issuedBy: c.issuedBy ?? null,
          validUntil: c.validUntil ?? null,
        })),
      });
    }

    if (data.factoryMedia && data.factoryMedia.length > 0) {
      await tx.mfgFactoryMedia.createMany({
        data: data.factoryMedia.map((m, idx) => ({
          manufacturerId: manufacturer.id,
          mediaType: m.mediaType,
          url: m.url,
          caption: m.caption ?? null,
          sortOrder: m.sortOrder ?? idx,
        })),
      });
    }

    return manufacturer;
  });
}

export async function getManufacturerBySlug(slug: string) {
  return prisma.mfgManufacturer.findUnique({
    where: { slug },
    include: {
      categories: true,
      capabilities: true,
      certifications: true,
      factoryMedia: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function getManufacturerById(id: string) {
  return prisma.mfgManufacturer.findUnique({
    where: { id },
    include: {
      categories: true,
      capabilities: true,
      certifications: true,
      factoryMedia: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function updateManufacturer(id: string, data: Partial<CreateManufacturerInput>) {
  return prisma.$transaction(async (tx) => {
    const updateData: Prisma.MfgManufacturerUpdateInput = {};

    if (data.companyName !== undefined) updateData.companyName = data.companyName;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.countryCode !== undefined) updateData.countryCode = data.countryCode;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.manufacturingHub !== undefined) updateData.manufacturingHub = data.manufacturingHub;
    if (data.registrationNumber !== undefined) updateData.registrationNumber = data.registrationNumber;
    if (data.businessType !== undefined) updateData.businessType = data.businessType;
    if (data.yearEstablished !== undefined) updateData.yearEstablished = data.yearEstablished;
    if (data.employeeCountRange !== undefined) updateData.employeeCountRange = data.employeeCountRange;
    if (data.factorySizeSqm !== undefined) updateData.factorySizeSqm = data.factorySizeSqm;
    if (data.website !== undefined) updateData.website = data.website;

    const manufacturer = await tx.mfgManufacturer.update({
      where: { id },
      data: updateData,
    });

    if (data.categories) {
      await tx.mfgCategory.deleteMany({ where: { manufacturerId: id } });
      if (data.categories.length > 0) {
        await tx.mfgCategory.createMany({
          data: data.categories.map((c) => ({
            manufacturerId: id,
            category: c.category,
            isPrimary: c.isPrimary,
            productTypes: c.productTypes,
          })),
        });
      }
    }

    if (data.capability) {
      const existingCap = await tx.mfgCapability.findFirst({
        where: { manufacturerId: id },
      });

      const capData = {
        monthlyCapacity: data.capability.monthlyCapacity ?? null,
        capacityUnit: data.capability.capacityUnit ?? null,
        currentUtilizationPercent: data.capability.currentUtilizationPercent ?? null,
        defaultMoq: data.capability.defaultMoq ?? null,
        defaultLeadTimeDays: data.capability.defaultLeadTimeDays ?? null,
        sampleLeadTimeDays: data.capability.sampleLeadTimeDays ?? null,
        allowsPrivateLabel: data.capability.allowsPrivateLabel ?? false,
        allowsCustomPackaging: data.capability.allowsCustomPackaging ?? false,
        allowsOem: data.capability.allowsOem ?? false,
        allowsOdm: data.capability.allowsOdm ?? false,
      };

      if (existingCap) {
        await tx.mfgCapability.update({
          where: { id: existingCap.id },
          data: capData,
        });
      } else {
        await tx.mfgCapability.create({
          data: { manufacturerId: id, ...capData },
        });
      }
    }

    return manufacturer;
  });
}

export async function listManufacturers(filters: ManufacturerListFilters) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;
  const skip = (page - 1) * limit;

  const where: Prisma.MfgManufacturerWhereInput = {};

  if (filters.countryCode) {
    where.countryCode = filters.countryCode;
  }

  if (filters.verificationTier) {
    where.verificationTier = filters.verificationTier as any;
  }

  if (filters.status) {
    where.status = filters.status as any;
  }

  if (filters.search) {
    where.OR = [
      { companyName: { contains: filters.search, mode: "insensitive" } },
      { slug: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  if (filters.category) {
    where.categories = {
      some: { category: filters.category },
    };
  }

  const [manufacturers, total] = await Promise.all([
    prisma.mfgManufacturer.findMany({
      where,
      include: {
        categories: true,
        capabilities: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.mfgManufacturer.count({ where }),
  ]);

  return {
    manufacturers,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
