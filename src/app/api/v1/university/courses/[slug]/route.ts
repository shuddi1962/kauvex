import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, getAuthUser, requireAdmin, validateBody } from "@/lib/api-helpers";
import { z } from "zod";

const updateCourseSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  slug: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  category: z.string().min(1).max(50).optional(),
  level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  thumbnailUrl: z.string().optional(),
  durationMinutes: z.number().int().optional(),
  sortOrder: z.number().int().optional(),
  status: z.enum(["published", "draft", "archived"]).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const course = await prisma.uniCourse.findUnique({
      where: { slug: params.slug },
      include: {
        lessons: {
          where: { status: "published" },
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            title: true,
            slug: true,
            contentType: true,
            durationMinutes: true,
            sortOrder: true,
          },
        },
      },
    });

    if (!course) return errorResponse("Course not found", 404);

    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const { user } = await getAuthUser(request);
      if (user) {
        const enrollment = await prisma.uniEnrollment.findUnique({
          where: { userId_courseId: { userId: user.id, courseId: course.id } },
        });
        const completedLessons = await prisma.uniLessonCompletion.findMany({
          where: { userId: user.id, lesson: { courseId: course.id } },
          select: { lessonId: true },
        });
        const completedIds = new Set(completedLessons.map((c) => c.lessonId));
        const lessonsWithProgress = course.lessons.map((l) => ({
          ...l,
          completed: completedIds.has(l.id),
        }));
        return successResponse({ ...course, lessons: lessonsWithProgress, enrollment });
      }
    }

    return successResponse({ ...course, enrollment: null });
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { error: authErr } = await requireAdmin(request);
  if (authErr) return authErr;

  const { data: body, error: valErr } = await validateBody(request, updateCourseSchema);
  if (valErr) return valErr;

  try {
    const course = await prisma.uniCourse.update({
      where: { slug: params.slug },
      data: { ...body!, updatedAt: new Date() },
    });
    return successResponse(course);
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { error: authErr } = await requireAdmin(_request);
  if (authErr) return authErr;

  try {
    await prisma.uniCourse.delete({ where: { slug: params.slug } });
    return successResponse(null, 204);
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}
