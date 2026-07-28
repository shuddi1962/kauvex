import { prisma } from "@/lib/prisma";

interface Recommendation {
  productId: string;
  score: number;
  reason: string;
  product?: Record<string, unknown>;
}

export async function getRecommendedProducts(
  userId: string,
  type: string,
  limit = 12,
  currentProductId?: string
): Promise<Recommendation[]> {
  const events = await prisma.$queryRaw<Array<{ category_id: string; cnt: bigint }>>`
    SELECT category_id, COUNT(*) as cnt
    FROM kv_pers_user_events
    WHERE user_id = ${userId}::uuid
      AND category_id IS NOT NULL
      AND event_type IN ('product_view', 'add_to_cart', 'purchase')
    GROUP BY category_id
    ORDER BY cnt DESC
    LIMIT 5
  `;

  if (events.length === 0) return [];

  const categoryIds = events.map((e) => e.category_id);

  const products = await prisma.product.findMany({
    where: {
      categoryId: { in: categoryIds },
      status: "published",
      id: currentProductId ? { not: currentProductId } : undefined,
    },
    orderBy: { rating: "desc" },
    take: limit,
    select: {
      id: true,
      name: true,
      slug: true,
      regularPrice: true,
      salePrice: true,
      images: true,
      rating: true,
      categoryId: true,
    },
  });

  return products.map((p) => ({
    productId: p.id,
    score: Number(p.rating) / 5,
    reason: `Based on your browsing history`,
    product: p as unknown as Record<string, unknown>,
  }));
}

export async function getTrendingProducts(
  categoryId?: string | null,
  limit = 12
): Promise<Recommendation[]> {
  const products = await prisma.product.findMany({
    where: {
      status: "published",
      ...(categoryId ? { categoryId } : {}),
    },
    orderBy: [{ rating: "desc" }, { reviewCount: "desc" }],
    take: limit,
    select: {
      id: true,
      name: true,
      slug: true,
      regularPrice: true,
      salePrice: true,
      images: true,
      rating: true,
      reviewCount: true,
      categoryId: true,
    },
  });

  return products.map((p) => ({
    productId: p.id,
    score: Number(p.rating) / 5,
    reason: "Trending now",
    product: p as unknown as Record<string, unknown>,
  }));
}

export async function getRelatedProducts(
  productId: string,
  limit = 12
): Promise<Recommendation[]> {
  const related = await prisma.$queryRaw<Array<{ product_id: string; cnt: bigint }>>`
    SELECT oi2.product_id, COUNT(*) as cnt
    FROM order_items oi1
    JOIN order_items oi2 ON oi1.order_id = oi2.order_id AND oi2.product_id != oi1.product_id
    WHERE oi1.product_id = ${productId}::uuid
      AND oi2.product_id IS NOT NULL
    GROUP BY oi2.product_id
    ORDER BY cnt DESC
    LIMIT ${limit}
  `;

  if (related.length === 0) {
    return getTrendingProducts(null, limit);
  }

  const productIds = related.map((r) => r.product_id);

  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, status: "published" },
    select: {
      id: true,
      name: true,
      slug: true,
      regularPrice: true,
      salePrice: true,
      images: true,
      rating: true,
      categoryId: true,
    },
  });

  const productMap = new Map(products.map((p) => [p.id, p]));

  return related
    .map((r) => {
      const product = productMap.get(r.product_id);
      if (!product) return null;
      return {
        productId: r.product_id,
        score: Math.min(Number(r.cnt) / 10, 1),
        reason: "Frequently bought together",
        product: product as unknown as Record<string, unknown>,
      };
    })
    .filter(Boolean) as Recommendation[];
}

export async function getCategoryAffinities(
  userId: string
): Promise<Array<{ categoryId: string; categoryName: string; score: number; interactionCount: number }>> {
  const affinities = await prisma.$queryRaw<
    Array<{ entity_id: string; affinity_score: number; interaction_count: number }>
  >`
    SELECT entity_id, affinity_score, interaction_count
    FROM kv_pers_user_affinities
    WHERE user_id = ${userId}::uuid AND entity_type = 'category'
    ORDER BY affinity_score DESC
  `;

  if (affinities.length === 0) {
    const catEvents = await prisma.$queryRaw<
      Array<{ category_id: string; cnt: bigint }>
    >`
      SELECT category_id, COUNT(*) as cnt
      FROM kv_pers_user_events
      WHERE user_id = ${userId}::uuid AND category_id IS NOT NULL
      GROUP BY category_id
      ORDER BY cnt DESC
    `;

    const categoryIds = catEvents.map((e) => e.category_id);
    if (categoryIds.length === 0) return [];

    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true },
    });

    const catMap = new Map(categories.map((c) => [c.id, c.name]));

    return catEvents.map((e) => ({
      categoryId: e.category_id,
      categoryName: catMap.get(e.category_id) || "Unknown",
      score: Math.min(Number(e.cnt) / 10, 1),
      interactionCount: Number(e.cnt),
    }));
  }

  const categoryIds = affinities.map((a) => a.entity_id);
  const categories = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true, name: true },
  });

  const catMap = new Map(categories.map((c) => [c.id, c.name]));

  return affinities.map((a) => ({
    categoryId: a.entity_id,
    categoryName: catMap.get(a.entity_id) || "Unknown",
    score: Number(a.affinity_score),
    interactionCount: Number(a.interaction_count),
  }));
}
