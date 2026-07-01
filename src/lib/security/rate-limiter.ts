import { NextRequest } from "next/server";

interface RateLimitConfig {
  maxAttempts: number;
  windowMinutes: number;
}

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  "/api/auth/login": { maxAttempts: 5, windowMinutes: 15 },
  "/api/auth/signup": { maxAttempts: 3, windowMinutes: 60 },
  "/api/v1/checkout": { maxAttempts: 10, windowMinutes: 10 },
  default: { maxAttempts: 60, windowMinutes: 1 },
};

const rateLimitStore = new Map<string, RateLimitEntry>();

let lastCleanup = Date.now();
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

function cleanupExpiredEntries(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;

  for (const [key, entry] of rateLimitStore) {
    const config = RATE_LIMITS[key.split(":")[0]] ?? RATE_LIMITS.default;
    const windowMs = config.windowMinutes * 60 * 1000;
    if (now - entry.windowStart > windowMs) {
      rateLimitStore.delete(key);
    }
  }

  lastCleanup = now;
}

function matchRoute(pathname: string): RateLimitConfig {
  for (const [route, config] of Object.entries(RATE_LIMITS)) {
    if (route === "default") continue;
    if (pathname.startsWith(route)) return config;
  }
  return RATE_LIMITS.default;
}

export function getClientIp(request: NextRequest): string {
  const xForwardedFor = request.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    const first = xForwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }

  const xRealIp = request.headers.get("x-real-ip");
  if (xRealIp) return xRealIp.trim();

  return "unknown";
}

export async function checkRateLimit(
  ip: string,
  route: string
): Promise<{ allowed: boolean; retryAfterSeconds: number }> {
  cleanupExpiredEntries();

  const config = matchRoute(route);
  const key = `${ip}:${route}`;
  const now = Date.now();
  const windowMs = config.windowMinutes * 60 * 1000;

  const existing = rateLimitStore.get(key);

  if (!existing || now - existing.windowStart > windowMs) {
    rateLimitStore.set(key, { count: 1, windowStart: now });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  existing.count += 1;

  if (existing.count > config.maxAttempts) {
    const retryAfterSeconds = Math.ceil(
      (existing.windowStart + windowMs - now) / 1000
    );
    return { allowed: false, retryAfterSeconds: Math.max(retryAfterSeconds, 1) };
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

export function getRateLimitConfig(): Record<string, RateLimitConfig> {
  return { ...RATE_LIMITS };
}
