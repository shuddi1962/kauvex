const SESSION_KEY = "kv_pers_session_id";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let sid = sessionStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
}

function sendBeacon(url: string, data: Record<string, unknown>) {
  const body = JSON.stringify(data);
  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, body);
  } else {
    fetch(url, { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true });
  }
}

export function trackEvent(eventType: string, data: Record<string, unknown> = {}) {
  const payload: Record<string, unknown> = {
    eventType,
    eventData: data,
    sessionId: getSessionId(),
    pageUrl: window.location.href,
    referrer: document.referrer || undefined,
  };

  if (data.productId) payload.productId = data.productId;
  if (data.categoryId) payload.categoryId = data.categoryId;

  sendBeacon("/api/v1/personalization/events", payload);
}

export function trackProductView(productId: string, productData?: Record<string, unknown>) {
  trackEvent("product_view", { productId, ...productData });
}

export function trackSearch(query: string, results?: unknown[]) {
  trackEvent("search", { query, resultCount: results?.length || 0 });
}
