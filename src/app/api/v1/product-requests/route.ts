import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-helpers";
import {
  createProductRequest,
  getProductRequests,
  getProductRequestById,
  submitVendorOffer,
  addRequestUpdate,
} from "@/lib/sourcing";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const status = searchParams.get("status");

    if (id) {
      const request_ = await getProductRequestById(id);
      if (!request_) return errorResponse("Product request not found", 404);
      return successResponse(request_);
    }

    const requests = await getProductRequests(status || undefined);
    return successResponse(requests);
  } catch (error) {
    return errorResponse("Failed to fetch product requests", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;

    if (action === "create" || !action) {
      if (!body.productName) return errorResponse("Missing required field: productName", 400);
      const productRequest = await createProductRequest(body);
      return successResponse(productRequest, 201);
    }

    if (action === "submit-offer") {
      if (!body.requestId || !body.vendorId || !body.price) {
        return errorResponse("Missing required fields: requestId, vendorId, price", 400);
      }
      const offer = await submitVendorOffer(body);
      return successResponse(offer, 201);
    }

    if (action === "add-update") {
      if (!body.requestId || !body.updateType || !body.message) {
        return errorResponse("Missing required fields: requestId, updateType, message", 400);
      }
      const update = await addRequestUpdate(body.requestId, body.updateType, body.message);
      return successResponse(update, 201);
    }

    return errorResponse("Unknown action", 400);
  } catch (error) {
    return errorResponse("Failed to process product request", 500);
  }
}
