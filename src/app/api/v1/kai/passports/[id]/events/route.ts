import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error: authErr } = await getAuthUser(_request);
  if (authErr) return authErr;

  try {
    const { id } = await params;

    const passport = await prisma.digitalPassport.findUnique({
      where: { id },
      select: { id: true, ownerId: true },
    });

    if (!passport) {
      return errorResponse("Passport not found", 404);
    }

    if (passport.ownerId !== user!.id) {
      return errorResponse("Unauthorized", 403);
    }

    const events = await prisma.digitalPassportEvent.findMany({
      where: { passportId: id },
      orderBy: { eventDate: "desc" },
    });

    return successResponse(events);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const { id } = await params;

    const passport = await prisma.digitalPassport.findUnique({
      where: { id },
      select: { id: true, ownerId: true },
    });

    if (!passport) {
      return errorResponse("Passport not found", 404);
    }

    if (passport.ownerId !== user!.id) {
      return errorResponse("Unauthorized", 403);
    }

    const body = await request.json();
    const { eventType, title, description, performedBy, documents, metadata } = body;

    if (!eventType || !title) {
      return errorResponse("eventType and title are required", 400);
    }

    const event = await prisma.digitalPassportEvent.create({
      data: {
        passportId: id,
        eventType,
        title,
        description: description ?? null,
        performedBy: performedBy ?? null,
        documents: documents ?? [],
        metadata: metadata ?? {},
      },
    });

    return successResponse(event, 201);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
