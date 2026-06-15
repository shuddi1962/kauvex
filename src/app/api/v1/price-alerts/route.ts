import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-helpers";
import {
  recordPrice,
  getPriceHistory,
  getPriceStats,
  createPriceAlert,
  getUserPriceAlerts,
  checkPriceAlerts,
  cancelPriceAlert,
} from "@/lib/price-alerts";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const customerId = searchParams.get("customerId");
    const days = parseInt(searchParams.get("days") || "90");
    const include = searchParams.get("include");

    if (productId && include === "stats") {
      const stats = await getPriceStats(productId, days);
      if (!stats) return errorResponse("No price data found", 404);
      return successResponse(stats);
    }

    if (productId) {
      const history = await getPriceHistory(productId, days);
      return successResponse(history);
    }

    if (customerId) {
      const alerts = await getUserPriceAlerts(customerId);
      return successResponse(alerts);
    }

    return errorResponse("Missing required parameter: productId or customerId", 400);
  } catch (error) {
    return errorResponse("Failed to fetch price data", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;

    if (action === "record-price" || (!action && body.productId && body.price)) {
      const record = await recordPrice(body.productId, body.price, body.variantId, body.currency);
      return successResponse(record, 201);
    }

    if (action === "create-alert" || (!action && body.customerId && body.productId && body.targetPrice)) {
      if (!body.customerId || !body.productId || !body.targetPrice) {
        return errorResponse("Missing required fields: customerId, productId, targetPrice", 400);
      }
      const alert = await createPriceAlert(body);
      return successResponse(alert, 201);
    }

    if (action === "check-alerts") {
      const result = await checkPriceAlerts();
      return successResponse(result);
    }

    return errorResponse("Unknown action or missing required fields", 400);
  } catch (error) {
    return errorResponse("Failed to process price alert request", 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.id) return errorResponse("Missing required field: id", 400);
    const result = await cancelPriceAlert(body.id);
    return successResponse(result);
  } catch (error) {
    return errorResponse("Failed to cancel price alert", 500);
  }
}
