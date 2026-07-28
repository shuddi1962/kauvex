import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const course = await prisma.uniCourse.findUnique({
      where: { slug: params.slug },
    });

    if (!course) return errorResponse("Course not found", 404);
    if (course.status !== "published") return errorResponse("Course is not available", 400);

    const existing = await prisma.uniEnrollment.findUnique({
      where: { userId_courseId: { userId: user!.id, courseId: course.id } },
    });

    if (existing) return successResponse(existing);

    const enrollment = await prisma.uniEnrollment.create({
      data: { userId: user!.id, courseId: course.id },
    });

    return successResponse(enrollment, 201);
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}
