import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, getAuthUser, validateBody } from "@/lib/api-helpers";
import { z } from "zod";

const submitAnswerSchema = z.object({
  quizId: z.string().uuid(),
  selectedAnswer: z.string().length(1),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lesson = await prisma.uniLesson.findUnique({
      where: { id: params.id },
      select: { id: true },
    });

    if (!lesson) return errorResponse("Lesson not found", 404);

    const quizzes = await prisma.uniQuiz.findMany({
      where: { lessonId: params.id },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        question: true,
        options: true,
        sortOrder: true,
      },
    });

    const authHeader = _request.headers.get("authorization");
    let attempts: { quizId: string; selectedAnswer: string; isCorrect: boolean }[] = [];
    if (authHeader?.startsWith("Bearer ")) {
      const { user } = await getAuthUser(_request);
      if (user) {
        attempts = await prisma.uniQuizAttempt.findMany({
          where: { userId: user.id, quiz: { lessonId: params.id } },
          select: { quizId: true, selectedAnswer: true, isCorrect: true },
        });
      }
    }

    const attemptsMap = new Map(attempts.map((a) => [a.quizId, a]));
    const quizzesWithStatus = quizzes.map((q) => ({
      ...q,
      attempt: attemptsMap.get(q.id) || null,
    }));

    return successResponse(quizzesWithStatus);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  const { data: body, error: valErr } = await validateBody(request, submitAnswerSchema);
  if (valErr) return valErr;

  try {
    const quiz = await prisma.uniQuiz.findUnique({
      where: { id: body!.quizId },
      select: { id: true, lessonId: true, correctAnswer: true },
    });

    if (!quiz || quiz.lessonId !== params.id) {
      return errorResponse("Quiz not found for this lesson", 404);
    }

    const existing = await prisma.uniQuizAttempt.findUnique({
      where: { userId_quizId: { userId: user!.id, quizId: body!.quizId } as any },
    });

    if (existing) {
      return successResponse({
        ...existing,
        message: "Already answered",
      });
    }

    const isCorrect = body!.selectedAnswer === quiz.correctAnswer;

    const attempt = await prisma.uniQuizAttempt.create({
      data: {
        userId: user!.id,
        quizId: body!.quizId,
        selectedAnswer: body!.selectedAnswer,
        isCorrect,
      },
    });

    return successResponse(attempt, 201);
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}
