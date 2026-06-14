import { NextRequest } from "next/server";
import { formatMobileResponse, formatMobileError, authenticateMobileRequest } from "@/lib/mobile-api-helpers";

const demoDashboard = {
  activeOrders: 2,
  pendingOrders: 1,
  wishlistCount: 8,
  walletBalance: 62500,
  loyaltyPoints: 2450,
  loyaltyTier: "Gold",
  recentOrders: [
    { id: "ORD-8842", status: "in_transit", total: 85000, items: 3, eta: "30 min" },
    { id: "ORD-8841", status: "delivered", total: 195000, items: 1, deliveredAt: "2026-04-04" },
  ],
  recommendedProducts: [
    { id: "PROD-001", name: "Marine GPS Device", price: 450000, image: null, rating: 4.5 },
    { id: "PROD-002", name: "Wireless Mouse", price: 15000, image: null, rating: 4.2 },
    { id: "PROD-003", name: "Laptop Cooling Pad", price: 25000, image: null, rating: 4.0 },
  ],
  notifications: [
    { id: "N-001", title: "Order Delivered", body: "Your order #ORD-8841 has been delivered", read: false, createdAt: "2026-04-04T14:30:00Z" },
    { id: "N-002", title: "Flash Sale", body: "50% off on marine equipment today!", read: false, createdAt: "2026-04-05T09:00:00Z" },
  ],
};

export async function GET(request: NextRequest) {
  const auth = authenticateMobileRequest(request);
  if (!auth) {
    return formatMobileError("Unauthorized - valid Bearer token required", 401);
  }
  return formatMobileResponse(demoDashboard);
}

export async function POST(request: NextRequest) {
  const auth = authenticateMobileRequest(request);
  if (!auth) {
    return formatMobileError("Unauthorized", 401);
  }

  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "register_device":
        return formatMobileResponse({
          registered: true,
          deviceToken: body.deviceToken,
          platform: body.platform,
        });

      case "update_profile":
        return formatMobileResponse({
          updated: true,
          profile: { ...body.profile, id: auth.userId },
        });

      default:
        return formatMobileError(`Unknown action: ${action}`);
    }
  } catch {
    return formatMobileError("Invalid request body");
  }
}
