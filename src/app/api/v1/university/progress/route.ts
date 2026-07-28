import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const enrollments = await prisma.uniEnrollment.findMany({
      where: { userId: user!.id },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            category: true,
            lessonCount: true,
            thumbnailUrl: true,
          },
        },
      },
      orderBy: { startedAt: "desc" },
    });

    const completedLessonsCount = await prisma.uniLessonCompletion.count({
      where: { userId: user!.id },
    });

    const totalPublishedLessons = await prisma.uniLesson.count({
      where: { status: "published" },
    });

    const enrolledCourseIds = enrollments.map((e) => e.courseId);
    const completedCourses = enrollments.filter((e) => e.completedAt).length;

    return successResponse({
      enrollments,
      stats: {
        completedLessons: completedLessonsCount,
        totalLessons: totalPublishedLessons,
        enrolledCourses: enrollments.length,
        completedCourses,
        overallProgress:
          totalPublishedLessons > 0
            ? Math.round((completedLessonsCount / totalPublishedLessons) * 100)
            : 0,
      },
    });
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
