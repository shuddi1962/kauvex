import { NextRequest, NextResponse } from "next/server";

export interface MobileApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    timestamp: string;
  };
}

export interface AuthenticatedRequest {
  userId: string;
  userType: "customer" | "vendor" | "warehouse" | "driver" | "admin";
}

export function formatMobileResponse<T>(
  data: T,
  meta?: { page?: number; limit?: number; total?: number }
): NextResponse<MobileApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    meta: {
      ...meta,
      timestamp: new Date().toISOString(),
    },
  });
}

export function formatMobileError(
  error: string,
  status: number = 400
): NextResponse<MobileApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
      meta: { timestamp: new Date().toISOString() },
    },
    { status }
  );
}

export function paginateMobileQuery<T>(
  items: T[],
  page: number = 1,
  limit: number = 20
): { items: T[]; page: number; limit: number; total: number } {
  const start = (page - 1) * limit;
  const end = start + limit;
  return {
    items: items.slice(start, end),
    page,
    limit,
    total: items.length,
  };
}

export function getBearerToken(request: NextRequest): string | null {
  const auth = request.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) return null;
  return auth.slice(7);
}

export function authenticateMobileRequest(
  request: NextRequest
): AuthenticatedRequest | null {
  const token = getBearerToken(request);
  if (!token) return null;

  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const parts = decoded.split(":");
    if (parts.length !== 2) return null;

    return {
      userId: parts[0],
      userType: parts[1] as AuthenticatedRequest["userType"],
    };
  } catch {
    return null;
  }
}

export function generatePushNotification(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, unknown>
) {
  return {
    userId,
    title,
    body,
    data: data || {},
    read: false,
    createdAt: new Date().toISOString(),
  };
}

export const MOBILE_ENDPOINTS = {
  customer: {
    dashboard: "/api/mobile/customer",
    products: "/api/mobile/customer/products",
    orders: "/api/mobile/customer/orders",
    cart: "/api/mobile/customer/cart",
    wallet: "/api/mobile/customer/wallet",
    wishlist: "/api/mobile/customer/wishlist",
    notifications: "/api/mobile/customer/notifications",
    profile: "/api/mobile/customer/profile",
    addresses: "/api/mobile/customer/addresses",
  },
  vendor: {
    dashboard: "/api/mobile/vendor",
    products: "/api/mobile/vendor/products",
    orders: "/api/mobile/vendor/orders",
    inventory: "/api/mobile/vendor/inventory",
    analytics: "/api/mobile/vendor/analytics",
    ads: "/api/mobile/vendor/ads",
    wallet: "/api/mobile/vendor/wallet",
    notifications: "/api/mobile/vendor/notifications",
  },
  warehouse: {
    dashboard: "/api/mobile/warehouse",
    inventory: "/api/mobile/warehouse/inventory",
    receive: "/api/mobile/warehouse/receive",
    transfer: "/api/mobile/warehouse/transfer",
    shipments: "/api/mobile/warehouse/shipments",
    scan: "/api/mobile/warehouse/scan",
  },
  driver: {
    deliveries: "/api/mobile/driver/deliveries",
    location: "/api/mobile/driver/location",
    proof: "/api/mobile/driver/proof",
    otp: "/api/mobile/driver/otp",
    earnings: "/api/mobile/driver/earnings",
  },
  admin: {
    dashboard: "/api/mobile/admin",
    vendors: "/api/mobile/admin/vendors",
    orders: "/api/mobile/admin/orders",
    analytics: "/api/mobile/admin/analytics",
    customers: "/api/mobile/admin/customers",
    warehouses: "/api/mobile/admin/warehouses",
  },
} as const;

export const MOBILE_APP_TYPES = ["customer", "vendor", "warehouse", "driver", "admin"] as const;
export type MobileAppType = (typeof MOBILE_APP_TYPES)[number];
