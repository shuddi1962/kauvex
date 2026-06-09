// CJ Dropshipping API Service
// CJ API credentials are read from environment variables:
//   CJ_API_KEY - API key for CJ Dropshipping
//   CJ_EMAIL   - Email address for CJ API authentication
//
// Future: Move credentials to API key vault (storefront_api_keys table)

export interface CJProduct {
  cjProductId: string;
  name: string;
  image: string;
  supplierPrice: number;
  processingTime: string;
  shippingMethods: CJShippingMethod[];
  category: string;
  rating: number;
}

export interface CJShippingMethod {
  name: string;
  cost: number;
  estimatedDays: string;
}

export interface CJOrder {
  cjOrderId: string;
  truvexOrderId: string;
  status: string;
  trackingNumber: string;
  trackingUrl: string;
}

const CJ_API_BASE = "https://api.cjdropshipping.com/v1";
let cachedToken: { token: string; expiresAt: number } | null = null;

function getApiKey(): string {
  return process.env.CJ_API_KEY || "";
}

function getEmail(): string {
  return process.env.CJ_EMAIL || "";
}

async function cjFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${CJ_API_BASE}${endpoint}`;
  const token = await cjAuth();

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "CJ-Authorization": `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const errBody = await res.text();
    console.error(`[CJDropshipping] ${options.method || "GET"} ${endpoint} failed:`, res.status, errBody);
    throw new Error(`CJ API error ${res.status}: ${errBody}`);
  }

  const data = await res.json();
  console.log(`[CJDropshipping] ${options.method || "GET"} ${endpoint} → ${res.status}`);
  return data as T;
}

export async function cjAuth(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const apiKey = getApiKey();
  const email = getEmail();

  if (!apiKey || !email) {
    throw new Error("CJ Dropshipping credentials not configured. Set CJ_API_KEY and CJ_EMAIL env vars.");
  }

  const res = await fetch(`${CJ_API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, apiKey }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    console.error("[CJDropshipping] Auth failed:", res.status, errBody);
    throw new Error(`CJ auth error ${res.status}: ${errBody}`);
  }

  const data = await res.json();
  const token: string = data.token || data.accessToken || data.data?.token;
  const expiresIn = 23 * 60 * 60 * 1000;

  cachedToken = { token, expiresAt: Date.now() + expiresIn };
  console.log("[CJDropshipping] Authenticated successfully, token cached for 23h");
  return token;
}

export async function searchProducts(
  query: string,
  category?: string,
  page: number = 1,
  pageSize: number = 20
): Promise<{ products: CJProduct[]; total: number }> {
  console.log(`[CJDropshipping] Searching products: query="${query}" category="${category || ""}" page=${page}`);

  const body: Record<string, unknown> = { keyword: query, page, pageSize };
  if (category) body.categoryId = category;

  const res = await fetch(`${CJ_API_BASE}/product/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    console.error("[CJDropshipping] searchProducts failed:", res.status);
    return { products: [], total: 0 };
  }

  const data = await res.json();
  const items: unknown[] = data.data?.list || data.data?.products || data.list || [];
  const total: number = data.data?.total || data.total || items.length;

  const products: CJProduct[] = items.map((item: any) => ({
    cjProductId: String(item.id || item.productId || item.pid || ""),
    name: item.name || item.productName || "",
    image: item.image || item.mainImage || item.images?.[0] || "",
    supplierPrice: Number(item.price || item.supplierPrice || item.wholesalePrice || 0),
    processingTime: item.processingTime || item.deliveryTime || "3-7 days",
    shippingMethods: [],
    category: item.category || item.categoryName || "",
    rating: Number(item.rating || item.star || 0),
  }));

  return { products, total };
}

export async function getProductDetails(cjProductId: string): Promise<CJProduct> {
  console.log(`[CJDropshipping] Getting product details: ${cjProductId}`);

  const res = await fetch(`${CJ_API_BASE}/product/detail`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId: cjProductId }),
  });

  if (!res.ok) {
    console.error("[CJDropshipping] getProductDetails failed:", res.status);
    throw new Error(`Failed to get CJ product ${cjProductId}`);
  }

  const data = await res.json();
  const p = data.data || data;

  return {
    cjProductId: String(p.id || p.productId || cjProductId),
    name: p.name || p.productName || "",
    image: p.image || p.mainImage || p.images?.[0] || "",
    supplierPrice: Number(p.price || p.supplierPrice || 0),
    processingTime: p.processingTime || p.deliveryTime || "3-7 days",
    shippingMethods: (p.shippingMethods || p.shippingList || []).map((s: any) => ({
      name: s.name || s.shippingName || s.methodName || "",
      cost: Number(s.cost || s.price || s.shippingCost || 0),
      estimatedDays: s.estimatedDays || s.deliveryTime || s.days || "5-10",
    })),
    category: p.category || p.categoryName || "",
    rating: Number(p.rating || p.star || 0),
  };
}

export async function getProductVariants(cjProductId: string): Promise<any[]> {
  console.log(`[CJDropshipping] Getting variants for product: ${cjProductId}`);

  const res = await fetch(`${CJ_API_BASE}/product/variants`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId: cjProductId }),
  });

  if (!res.ok) {
    console.error("[CJDropshipping] getProductVariants failed:", res.status);
    return [];
  }

  const data = await res.json();
  const variants: unknown[] = data.data?.variants || data.data?.skuList || data.variants || [];
  console.log(`[CJDropshipping] Found ${variants.length} variants for ${cjProductId}`);
  return variants;
}

export async function importProduct(
  cjProductId: string,
  markupPercent: number = 30
): Promise<{ success: boolean; productId: string }> {
  console.log(`[CJDropshipping] Importing product ${cjProductId} with ${markupPercent}% markup`);

  const res = await fetch(`${CJ_API_BASE}/product/import`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId: cjProductId, markupPercent }),
  });

  if (!res.ok) {
    console.error("[CJDropshipping] importProduct failed:", res.status);
    return { success: false, productId: "" };
  }

  const data = await res.json();
  const productId: string = data.data?.productId || data.productId || data.data?.id || "";
  console.log(`[CJDropshipping] Imported product ${cjProductId} → local ID ${productId}`);
  return { success: true, productId };
}

export async function createCJOrder(
  truvexOrderId: string,
  shippingMethod: string
): Promise<CJOrder> {
  console.log(`[CJDropshipping] Creating CJ order for local order ${truvexOrderId}, shipping: ${shippingMethod}`);

  const res = await fetch(`${CJ_API_BASE}/order/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId: truvexOrderId, shippingMethod }),
  });

  if (!res.ok) {
    console.error("[CJDropshipping] createCJOrder failed:", res.status);
    throw new Error(`Failed to create CJ order for ${truvexOrderId}`);
  }

  const data = await res.json();
  const o = data.data || data;

  return {
    cjOrderId: String(o.cjOrderId || o.orderId || o.id || ""),
    truvexOrderId,
    status: o.status || o.orderStatus || "pending",
    trackingNumber: o.trackingNumber || o.tracking || "",
    trackingUrl: o.trackingUrl || o.trackingLink || "",
  };
}

export async function getCJOrderStatus(cjOrderId: string): Promise<CJOrder> {
  console.log(`[CJDropshipping] Getting order status: ${cjOrderId}`);

  const res = await fetch(`${CJ_API_BASE}/order/status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId: cjOrderId }),
  });

  if (!res.ok) {
    console.error("[CJDropshipping] getCJOrderStatus failed:", res.status);
    throw new Error(`Failed to get CJ order status for ${cjOrderId}`);
  }

  const data = await res.json();
  const o = data.data || data;

  return {
    cjOrderId: String(o.cjOrderId || o.orderId || o.id || cjOrderId),
    truvexOrderId: o.truvexOrderId || o.localOrderId || o.referenceOrderId || "",
    status: o.status || o.orderStatus || "unknown",
    trackingNumber: o.trackingNumber || o.tracking || "",
    trackingUrl: o.trackingUrl || o.trackingLink || "",
  };
}

export async function syncInventory(productIds: string[]): Promise<{ checked: number; updated: number }> {
  console.log(`[CJDropshipping] Syncing inventory for ${productIds.length} products`);

  let updated = 0;
  for (const pid of productIds) {
    try {
      const res = await fetch(`${CJ_API_BASE}/product/inventory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: pid }),
      });

      if (res.ok) {
        updated++;
      }
    } catch (err) {
      console.error(`[CJDropshipping] Failed to sync inventory for ${pid}:`, err);
    }
  }

  console.log(`[CJDropshipping] Inventory sync complete: ${productIds.length} checked, ${updated} updated`);
  return { checked: productIds.length, updated };
}

export async function syncPrices(productIds: string[]): Promise<{ checked: number; updated: number }> {
  console.log(`[CJDropshipping] Syncing prices for ${productIds.length} products`);

  let updated = 0;
  for (const pid of productIds) {
    try {
      const res = await fetch(`${CJ_API_BASE}/product/price`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: pid }),
      });

      if (res.ok) {
        updated++;
      }
    } catch (err) {
      console.error(`[CJDropshipping] Failed to sync price for ${pid}:`, err);
    }
  }

  console.log(`[CJDropshipping] Price sync complete: ${productIds.length} checked, ${updated} updated`);
  return { checked: productIds.length, updated };
}

export async function getShippingMethods(
  cjProductId: string,
  countryCode: string
): Promise<CJShippingMethod[]> {
  console.log(`[CJDropshipping] Getting shipping methods for ${cjProductId} to ${countryCode}`);

  const res = await fetch(`${CJ_API_BASE}/product/shipping`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId: cjProductId, countryCode }),
  });

  if (!res.ok) {
    console.error("[CJDropshipping] getShippingMethods failed:", res.status);
    return [];
  }

  const data = await res.json();
  const methods: unknown[] = data.data?.shippingMethods || data.data?.list || data.shippingMethods || [];

  return methods.map((s: any) => ({
    name: s.name || s.shippingName || s.methodName || "",
    cost: Number(s.cost || s.price || s.shippingCost || 0),
    estimatedDays: s.estimatedDays || s.deliveryTime || s.days || "5-10",
  }));
}
