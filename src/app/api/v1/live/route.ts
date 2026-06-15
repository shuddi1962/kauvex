import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-helpers";
import {
  createLiveStream,
  getActiveLiveStreams,
  getUpcomingLiveStreams,
  getVendorLiveStreams,
  getLiveStreamById,
  pinProductToStream,
  addLiveComment,
  sendLiveGift,
  endLiveStream,
  updateLiveViewerCount,
  getLiveAnalytics,
} from "@/lib/live";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const vendorId = searchParams.get("vendorId");
    const filter = searchParams.get("filter");
    const include = searchParams.get("include");

    if (id) {
      const stream = await getLiveStreamById(id);
      if (!stream) return errorResponse("Live stream not found", 404);
      return successResponse(stream);
    }

    if (id && include === "analytics") {
      const analytics = await getLiveAnalytics(id);
      if (!analytics) return errorResponse("Analytics not found", 404);
      return successResponse(analytics);
    }

    if (vendorId) {
      const streams = await getVendorLiveStreams(vendorId);
      return successResponse(streams);
    }

    if (filter === "upcoming") {
      const streams = await getUpcomingLiveStreams();
      return successResponse(streams);
    }

    const streams = await getActiveLiveStreams();
    return successResponse(streams);
  } catch (error) {
    return errorResponse("Failed to fetch live streams", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;

    if (action === "create" || !action) {
      if (!body.vendorId || !body.title || !body.creatorId) {
        return errorResponse("Missing required fields: vendorId, title, creatorId", 400);
      }
      const stream = await createLiveStream({
        creatorId: body.creatorId,
        vendorId: body.vendorId,
        title: body.title,
        description: body.description,
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
        products: body.products,
      });
      return successResponse(stream, 201);
    }

    if (action === "pin-product") {
      if (!body.streamId || !body.productId) {
        return errorResponse("Missing required fields: streamId, productId", 400);
      }
      const result = await pinProductToStream(body.streamId, body.productId);
      return successResponse(result, 201);
    }

    if (action === "comment") {
      if (!body.streamId || !body.userId || !body.message) {
        return errorResponse("Missing required fields: streamId, userId, message", 400);
      }
      const comment = await addLiveComment(body.streamId, body.userId, body.message);
      return successResponse(comment, 201);
    }

    if (action === "gift") {
      if (!body.streamId || !body.senderId || !body.giftType || !body.giftValue) {
        return errorResponse("Missing required fields: streamId, senderId, giftType, giftValue", 400);
      }
      const gift = await sendLiveGift(body.streamId, body.senderId, body.giftType, body.giftValue);
      return successResponse(gift, 201);
    }

    if (action === "end") {
      if (!body.streamId) return errorResponse("Missing required field: streamId", 400);
      const result = await endLiveStream(body.streamId);
      return successResponse(result);
    }

    if (action === "update-viewers") {
      if (!body.streamId || body.count === undefined) {
        return errorResponse("Missing required fields: streamId, count", 400);
      }
      const result = await updateLiveViewerCount(body.streamId, body.count);
      return successResponse(result);
    }

    return errorResponse("Unknown action", 400);
  } catch (error: any) {
    return errorResponse(error.message || "Failed to process live stream request", 500);
  }
}
