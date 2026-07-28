import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const search = searchParams.get("search");

    const where: any = { published: true };

    if (category && category !== "all") {
      where.category = category;
    }
    if (featured === "true") {
      where.featured = true;
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
        { tags: { hasSome: [search] } },
      ];
    }

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
        take: limit,
        skip: offset,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          category: true,
          author: true,
          coverImage: true,
          tags: true,
          featured: true,
          publishedAt: true,
          readTime: true,
        },
      }),
      prisma.blogPost.count({ where }),
    ]);

    return NextResponse.json({ posts, total, limit, offset });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const post = await prisma.blogPost.create({
      data: {
        title: body.title,
        slug: body.slug,
        excerpt: body.excerpt || null,
        content: body.content || null,
        category: body.category || "General",
        author: body.author || "KAUVEX Team",
        authorRole: body.authorRole || null,
        coverImage: body.coverImage || null,
        tags: body.tags || [],
        featured: body.featured || false,
        published: body.published || false,
        publishedAt: body.published ? new Date() : null,
        readTime: body.readTime || null,
        createdBy: body.createdBy || null,
      },
    });
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}