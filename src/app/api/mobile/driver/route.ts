import { NextRequest } from "next/server";
import { formatMobileResponse, formatMobileError, authenticateMobileRequest } from "@/lib/mobile-api-helpers";

const demoDeliveries = [
  { id: "DEL-001", orderId: "ORD-8842", customer: "John Doe", address: "42 Marina Road, Lagos", items: 3, status: "in_transit", eta: "25 min", distance: "3.2 km", priority: "normal", note: "Call before delivery" },
  { id: "DEL-002", orderId: "ORD-8841", customer: "Amara Obi", address: "15 Bourdillon, Ikoyi", items: 1, status: "picked_up", eta: "15 min", distance: "1.8 km", priority: "express", note: "Leave at gate" },
  { id: "DEL-003", orderId: "ORD-8840", customer: "Chidi Eze", address: "7 Bola Street, Surulere", items: 2, status: "pending", eta: "40 min", distance: "5.1 km", priority: "normal", note: "" },
  { id: "DEL-004", orderId: "ORD-8839", customer: "Fatima Ali", address: "23 Awolowo Road, VI", items: 4, status: "pending", eta: "55 min", distance: "7.3 km", priority: "normal", note: "Ring bell twice" },
  { id: "DEL-005", orderId: "ORD-8838", customer: "Emeka Nwa", address: "10 Isaac John, Ikeja", items: 1, status: "delivered", eta: "0", distance: "12 km", priority: "express", note: "Delivered at 14:30" },
];

export async function GET(request: NextRequest) {
  const auth = authenticateMobileRequest(request);
  if (!auth) {
    return formatMobileError("Unauthorized", 401);
  }

  const { searchParams } = new URL(request.url);
  const section = searchParams.get("section") || "deliveries";
  const status = searchParams.get("status");

  switch (section) {
    case "deliveries": {
      let filtered = demoDeliveries;
      if (status) {
        filtered = demoDeliveries.filter((d) => d.status === status);
      }
      return formatMobileResponse({
        total: filtered.length,
        deliveries: filtered,
        stats: {
          todayDelivered: filtered.filter((d) => d.status === "delivered").length,
          inProgress: filtered.filter((d) => d.status === "in_transit" || d.status === "picked_up").length,
          pending: filtered.filter((d) => d.status === "pending").length,
        },
      });
    }

    case "earnings": {
      return formatMobileResponse({
        todayEarnings: 12500,
        weeklyEarnings: 72500,
        monthlyEarnings: 285000,
        totalDeliveries: 340,
        todayDeliveries: 8,
        averagePerDelivery: 1500,
        rating: 4.8,
      });
    }

    default:
      return formatMobileError(`Unknown section: ${section}`);
  }
}

export async function PUT(request: NextRequest) {
  const auth = authenticateMobileRequest(request);
  if (!auth) {
    return formatMobileError("Unauthorized", 401);
  }

  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "update_status": {
        return formatMobileResponse({
          updated: true,
          deliveryId: body.deliveryId,
          status: body.status,
          timestamp: new Date().toISOString(),
        });
      }

      case "upload_proof": {
        return formatMobileResponse({
          uploaded: true,
          deliveryId: body.deliveryId,
          imageUrl: body.imageUrl,
          timestamp: new Date().toISOString(),
        });
      }

      case "verify_otp": {
        const otpValid = body.otp === "1234";
        return formatMobileResponse({
          verified: otpValid,
          deliveryId: body.deliveryId,
          message: otpValid ? "OTP verified successfully" : "Invalid OTP",
        });
      }

      case "update_location": {
        return formatMobileResponse({
          updated: true,
          latitude: body.latitude,
          longitude: body.longitude,
          timestamp: new Date().toISOString(),
        });
      }

      default:
        return formatMobileError(`Unknown action: ${action}`);
    }
  } catch {
    return formatMobileError("Invalid request body");
  }
}
