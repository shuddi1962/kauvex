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
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      categories: categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        commissionRate: cat.commissionRate ? Number(cat.commissionRate) : null,
        parentName: cat.parent?.name ?? null,
        productCount: cat._count.products,
      })),
    });
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
    const { categoryId, commissionRate } = body;

    if (!categoryId) {
      return NextResponse.json(
        { error: "categoryId is required" },
        { status: 400 }
      );
    }

    if (commissionRate === null || commissionRate === undefined || commissionRate < 0 || commissionRate > 100) {
      return NextResponse.json(
        { error: "commissionRate must be between 0 and 100" },
        { status: 400 }
      );
    }

    const updated = await prisma.category.update({
      where: { id: categoryId },
      data: { commissionRate },
      select: { id: true, name: true, commissionRate: true },
    });

    return NextResponse.json({
      success: true,
      category: {
        id: updated.id,
        name: updated.name,
        commissionRate: Number(updated.commissionRate),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update commission rate" },
      { status: 500 }
    );
  }
}
