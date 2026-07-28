import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const post = await prisma.blogPost.findFirst({
      where: {
        OR: [
          { id: params.id },
          { slug: params.id },
        ],
      },
    });
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const data: any = {};
    if (body.title !== undefined) data.title = body.title;
    if (body.slug !== undefined) data.slug = body.slug;
    if (body.excerpt !== undefined) data.excerpt = body.excerpt;
    if (body.content !== undefined) data.content = body.content;
    if (body.category !== undefined) data.category = body.category;
    if (body.author !== undefined) data.author = body.author;
    if (body.authorRole !== undefined) data.authorRole = body.authorRole;
    if (body.coverImage !== undefined) data.coverImage = body.coverImage;
    if (body.tags !== undefined) data.tags = body.tags;
    if (body.featured !== undefined) data.featured = body.featured;
    if (body.readTime !== undefined) data.readTime = body.readTime;
    if (body.published !== undefined) {
      data.published = body.published;
      data.publishedAt = body.published ? new Date() : null;
    }

    const post = await prisma.blogPost.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.blogPost.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}