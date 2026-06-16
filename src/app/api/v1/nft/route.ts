import { NextRequest, NextResponse } from 'next/server'
import { errorResponse, successResponse } from '@/lib/api-helpers'
import { getAllNftTokens, mintNftToken } from '@/lib/nft'

export async function GET() {
  try {
    const tokens = await getAllNftTokens()
    return successResponse(tokens)
  } catch (error: any) {
    return errorResponse(error.message, 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const token = await mintNftToken(body)
    return successResponse(token, 201)
  } catch (error: any) {
    return errorResponse(error.message, 500)
  }
}
