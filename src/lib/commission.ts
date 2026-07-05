import prisma from "@/lib/db";

export const DEFAULT_COMMISSION_RATE = 12;

export async function getCategoryCommissionRate(categoryId: string): Promise<number> {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { commissionRate: true, parentId: true },
  });

  if (category?.commissionRate !== null && category?.commissionRate !== undefined) {
    return Number(category.commissionRate);
  }

  if (category?.parentId) {
    const parent = await prisma.category.findUnique({
      where: { id: category.parentId },
      select: { commissionRate: true },
    });
    if (parent?.commissionRate !== null && parent?.commissionRate !== undefined) {
      return Number(parent.commissionRate);
    }
  }

  return DEFAULT_COMMISSION_RATE;
}

export async function resolveCommissionRate(params: {
  productId?: string;
  categoryId?: string;
  subcategoryId?: string;
  vendorCommission?: number | null;
}): Promise<number> {
  if (params.subcategoryId) {
    const sub = await prisma.subcategory.findUnique({
      where: { id: params.subcategoryId },
      select: { commissionRate: true, categoryId: true },
    });
    if (sub?.commissionRate !== null && sub?.commissionRate !== undefined) {
      return Number(sub.commissionRate);
    }
    if (sub?.categoryId) {
      return getCategoryCommissionRate(sub.categoryId);
    }
  }

  let categoryId = params.categoryId;

  if (!categoryId && params.productId) {
    const product = await prisma.product.findUnique({
      where: { id: params.productId },
      select: { categoryId: true },
    });
    categoryId = product?.categoryId ?? undefined;
  }

  if (categoryId) {
    const categoryRate = await getCategoryCommissionRate(categoryId);
    if (categoryRate > 0) return categoryRate;
  }

  return Number(params.vendorCommission ?? DEFAULT_COMMISSION_RATE);
}
