import { NextRequest } from "next/server"
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers"
import { createPassport, getOwnerPassports } from "@/lib/kai/digital-passport"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getAuthUser(request)
    if (error || !user) {
      return errorResponse("Authentication required", 401)
    }

    const passports = await getOwnerPassports(user.id)
    return successResponse(passports)
  } catch (err) {
    return errorResponse((err as Error).message, 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await getAuthUser(request)
    if (error || !user) {
      return errorResponse("Authentication required", 401)
    }

    const body = await request.json()
    const { entityType, entityId, title, passportData } = body

    if (!entityType || !entityId || !title) {
      return errorResponse("entityType, entityId, and title are required", 400)
    }

    const passport = await createPassport({
      entityType,
      entityId,
      title,
      ownerId: user.id,
      passportData,
    })

    return successResponse(passport, 201)
  } catch (err) {
    return errorResponse((err as Error).message, 500)
  }
}