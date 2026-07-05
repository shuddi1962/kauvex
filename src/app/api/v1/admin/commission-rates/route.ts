import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        commissionRate: true,
        parentId: true,
        parent: { select: { name: true } },
        _count: { select: { products: true } },
        subcategories: {
          select: {
            id: true,
            name: true,
            slug: true,
            commissionRate: true,
            _count: { select: { category: true } },
          },
          orderBy: { name: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });

    const flatList: any[] = [];

    for (const cat of categories) {
      flatList.push({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        type: "category",
        commissionRate: cat.commissionRate ? Number(cat.commissionRate) : null,
        parentId: cat.parentId,
        parentName: cat.parent?.name ?? null,
        productCount: cat._count.products,
      });

      for (const sub of cat.subcategories) {
        flatList.push({
          id: sub.id,
          name: sub.name,
          slug: sub.slug,
          type: "subcategory",
          commissionRate: sub.commissionRate ? Number(sub.commissionRate) : null,
          parentId: cat.id,
          parentName: cat.name,
          productCount: 0,
        });
      }
    }

    return NextResponse.json({ items: flatList });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, type, commissionRate } = body;

    if (!id || !type) {
      return NextResponse.json(
        { error: "id and type are required" },
        { status: 400 }
      );
    }

    if (commissionRate === null || commissionRate === undefined || commissionRate < 0 || commissionRate > 100) {
      return NextResponse.json(
        { error: "commissionRate must be between 0 and 100" },
        { status: 400 }
      );
    }

    if (type === "category") {
      const updated = await prisma.category.update({
        where: { id },
        data: { commissionRate },
        select: { id: true, name: true, commissionRate: true },
      });
      return NextResponse.json({
        success: true,
        item: { id: updated.id, name: updated.name, type: "category", commissionRate: Number(updated.commissionRate) },
      });
    }

    if (type === "subcategory") {
      const updated = await prisma.subcategory.update({
        where: { id },
        data: { commissionRate },
        select: { id: true, name: true, commissionRate: true },
      });
      return NextResponse.json({
        success: true,
        item: { id: updated.id, name: updated.name, type: "subcategory", commissionRate: Number(updated.commissionRate) },
      });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update commission rate" },
      { status: 500 }
    );
  }
}
