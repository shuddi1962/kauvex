import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-helpers";
import {
  createGroupBuy,
  joinGroupBuy,
  getActiveGroupBuys,
  getGroupBuyById,
  getUserGroupBuys,
  expireStaleGroupBuys,
} from "@/lib/group-buy";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const userId = searchParams.get("userId");

    if (id) {
      const groupBuy = await getGroupBuyById(id);
      if (!groupBuy) return errorResponse("Group buy not found", 404);
      return successResponse(groupBuy);
    }

    if (userId) {
      const groupBuys = await getUserGroupBuys(userId);
      return successResponse(groupBuys);
    }

    const groupBuys = await getActiveGroupBuys();
    return successResponse(groupBuys);
  } catch (error) {
    return errorResponse("Failed to fetch group buys", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;

    if (action === "create" || !action) {
      if (!body.productId || !body.regularPrice || !body.groupPrice || !body.targetCount || !body.expiresInHours || !body.createdBy) {
        return errorResponse("Missing required fields: productId, regularPrice, groupPrice, targetCount, expiresInHours, createdBy", 400);
      }
      const groupBuy = await createGroupBuy(body);
      return successResponse(groupBuy, 201);
    }

    if (action === "join") {
      if (!body.groupBuyId || !body.userId) {
        return errorResponse("Missing required fields: groupBuyId, userId", 400);
      }
      const result = await joinGroupBuy(body.groupBuyId, body.userId);
      return successResponse(result);
    }

    if (action === "expire-stale") {
      const result = await expireStaleGroupBuys();
      return successResponse(result);
    }

    return errorResponse("Unknown action", 400);
  } catch (error: any) {
    return errorResponse(error.message || "Failed to process group buy request", 500);
  }
}
