import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const lesson = await prisma.uniLesson.findUnique({
      where: { id: params.id },
      include: { course: { include: { lessons: { where: { status: "published" }, select: { id: true } } } } },
    });

    if (!lesson) return errorResponse("Lesson not found", 404);

    const existing = await prisma.uniLessonCompletion.findUnique({
      where: { userId_lessonId: { userId: user!.id, lessonId: params.id } },
    });

    if (existing) return successResponse(existing);

    const completion = await prisma.uniLessonCompletion.create({
      data: { userId: user!.id, lessonId: params.id },
    });

    const totalLessons = lesson.course.lessons.length;
    const completedCount = await prisma.uniLessonCompletion.count({
      where: { userId: user!.id, lesson: { courseId: lesson.courseId } },
    });

    const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 10000) / 100 : 100;
    const completedAt = progress >= 100 ? new Date() : null;

    await prisma.uniEnrollment.upsert({
      where: { userId_courseId: { userId: user!.id, courseId: lesson.courseId } },
      create: { userId: user!.id, courseId: lesson.courseId, progress, completedAt },
      update: { progress, completedAt },
    });

    return successResponse(completion, 201);
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}
