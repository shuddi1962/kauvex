import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, requireAdmin, validateBody, paginatedResponse } from "@/lib/api-helpers";
import { z } from "zod";

const createLessonSchema = z.object({
  courseId: z.string().uuid(),
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200),
  content: z.string().optional(),
  videoUrl: z.string().optional(),
  contentType: z.enum(["article", "video"]).default("article"),
  durationMinutes: z.number().int().default(0),
  sortOrder: z.number().int().default(0),
  status: z.enum(["published", "draft", "archived"]).default("published"),
});

export async function GET(request: NextRequest) {
  const { error: authErr } = await requireAdmin(request);
  if (authErr) return authErr;

  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId") || undefined;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "100")));
    const offset = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (courseId) where.courseId = courseId;

    const [lessons, total] = await Promise.all([
      prisma.uniLesson.findMany({
        where: where as any,
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        skip: offset,
        take: limit,
        include: {
          _count: { select: { completions: true, quizzes: true } },
        },
      }),
      prisma.uniLesson.count({ where: where as any }),
    ]);

    return paginatedResponse(lessons, total, page, limit);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}

export async function POST(request: NextRequest) {
  const { error: authErr } = await requireAdmin(request);
  if (authErr) return authErr;

  const { data: body, error: valErr } = await validateBody(request, createLessonSchema);
  if (valErr) return valErr;

  try {
    const lesson = await prisma.uniLesson.create({ data: body! });

    await prisma.uniCourse.update({
      where: { id: body!.courseId },
      data: { lessonCount: { increment: 1 }, updatedAt: new Date() },
    });

    return successResponse(lesson, 201);
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}
