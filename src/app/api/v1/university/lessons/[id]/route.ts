import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lesson = await prisma.uniLesson.findUnique({
      where: { id: params.id },
      include: {
        course: { select: { id: true, title: true, slug: true } },
      },
    });

    if (!lesson) return errorResponse("Lesson not found", 404);

    const authHeader = _request.headers.get("authorization");
    let completed = false;
    if (authHeader?.startsWith("Bearer ")) {
      const { user } = await getAuthUser(_request);
      if (user) {
        const comp = await prisma.uniLessonCompletion.findUnique({
          where: { userId_lessonId: { userId: user.id, lessonId: params.id } },
        });
        completed = !!comp;
      }
    }

    return successResponse({ ...lesson, completed });
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
