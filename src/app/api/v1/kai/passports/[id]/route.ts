import { NextRequest, NextResponse } from "next/server"
import { getPassportById } from "@/lib/kai/digital-passport"

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const passport = await getPassportById(params.id)
    if (!passport) {
      return NextResponse.json({ error: "Passport not found" }, { status: 404 })
    }
    return NextResponse.json({ data: passport })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
