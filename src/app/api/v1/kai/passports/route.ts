import { NextRequest, NextResponse } from "next/server"
import { getOwnerPassports } from "@/lib/kai/digital-passport"
import { getAuthUser } from "@/lib/api-helpers"

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getAuthUser(request)
    if (error || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const passports = await getOwnerPassports(user.id)
    return NextResponse.json({ data: passports })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
