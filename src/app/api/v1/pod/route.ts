import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-helpers";
import {
  createPodDesign,
  getVendorPodDesigns,
  getPodDesignById,
  createPodProduct,
  getVendorPodProducts,
  getMarketplaceDesigns,
  purchaseDesignLicense,
  createPodOrder,
  updatePodOrderStatus,
  getVendorPodAnalytics,
} from "@/lib/pod";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const vendorId = searchParams.get("vendorId");
    const category = searchParams.get("category");
    const include = searchParams.get("include");
    const marketplace = searchParams.get("marketplace");

    if (id) {
      const design = await getPodDesignById(id);
      if (!design) return errorResponse("POD design not found", 404);
      return successResponse(design);
    }

    if (vendorId && include === "analytics") {
      const analytics = await getVendorPodAnalytics(vendorId);
      return successResponse(analytics);
    }

    if (vendorId && include === "products") {
      const products = await getVendorPodProducts(vendorId);
      return successResponse(products);
    }

    if (vendorId) {
      const designs = await getVendorPodDesigns(vendorId);
      return successResponse(designs);
    }

    if (marketplace === "true") {
      const designs = await getMarketplaceDesigns(category || undefined);
      return successResponse(designs);
    }

    return errorResponse("Missing required parameter: vendorId, id, or marketplace=true", 400);
  } catch (error) {
    return errorResponse("Failed to fetch POD data", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;

    if (action === "create-design" || !action) {
      if (!body.vendorId || !body.name) {
        return errorResponse("Missing required fields: vendorId, name", 400);
      }
      const design = await createPodDesign(body);
      return successResponse(design, 201);
    }

    if (action === "create-product") {
      if (!body.vendorId || !body.productType || !body.retailPrice || !body.baseCost) {
        return errorResponse("Missing required fields: vendorId, productType, retailPrice, baseCost", 400);
      }
      const product = await createPodProduct(body);
      return successResponse(product, 201);
    }

    if (action === "purchase-license") {
      if (!body.designId || !body.buyerVendorId) {
        return errorResponse("Missing required fields: designId, buyerVendorId", 400);
      }
      const license = await purchaseDesignLicense(body.designId, body.buyerVendorId);
      return successResponse(license, 201);
    }

    if (action === "create-order") {
      if (!body.orderId || !body.podProductId || !body.fulfillmentPartner) {
        return errorResponse("Missing required fields: orderId, podProductId, fulfillmentPartner", 400);
      }
      const order = await createPodOrder(body);
      return successResponse(order, 201);
    }

    return errorResponse("Unknown action", 400);
  } catch (error: any) {
    return errorResponse(error.message || "Failed to process POD request", 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;

    if (action === "update-order-status") {
      if (!body.id || !body.status) {
        return errorResponse("Missing required fields: id, status", 400);
      }
      const order = await updatePodOrderStatus(body.id, body.status, body.trackingNumber);
      return successResponse(order);
    }

    return errorResponse("Unknown action", 400);
  } catch (error) {
    return errorResponse("Failed to update POD order", 500);
  }
}
