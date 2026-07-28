import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, requireAdmin, validateBody, paginatedResponse } from "@/lib/api-helpers";
import { z } from "zod";

const createCourseSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200),
  description: z.string().optional(),
  category: z.string().min(1).max(50),
  level: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
  thumbnailUrl: z.string().optional(),
  durationMinutes: z.number().int().default(0),
  sortOrder: z.number().int().default(0),
  status: z.enum(["published", "draft", "archived"]).default("published"),
});

export async function GET(request: NextRequest) {
  const { error: authErr } = await requireAdmin(request);
  if (authErr) return authErr;

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50")));
    const offset = (page - 1) * limit;
    const status = searchParams.get("status") || undefined;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const [courses, total] = await Promise.all([
      prisma.uniCourse.findMany({
        where: where as any,
        orderBy: { sortOrder: "asc" },
        skip: offset,
        take: limit,
        include: {
          _count: { select: { lessons: true, enrollments: true } },
        },
      }),
      prisma.uniCourse.count({ where: where as any }),
    ]);

    const coursesWithStats = courses.map((c) => ({
      ...c,
      lessonCount: c._count.lessons,
      enrollmentCount: c._count.enrollments,
      _count: undefined,
    }));

    return paginatedResponse(coursesWithStats, total, page, limit);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}

export async function POST(request: NextRequest) {
  const { error: authErr } = await requireAdmin(request);
  if (authErr) return authErr;

  const { data: body, error: valErr } = await validateBody(request, createCourseSchema);
  if (valErr) return valErr;

  try {
    const course = await prisma.uniCourse.create({ data: body! });
    return successResponse(course, 201);
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}
