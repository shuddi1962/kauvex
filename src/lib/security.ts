import { authenticator } from "otplib";
import { z } from "zod";
import { insforge } from "./insforge";

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(
  identifier: string,
  maxAttempts: number = 5,
  windowMs: number = 60_000
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(identifier, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1, resetAt: now + windowMs };
  }

  if (entry.count >= maxAttempts) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: maxAttempts - entry.count, resetAt: entry.resetAt };
}

export function validateRequest<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

const HTML_TAG_RE = /<[^>]*>/g;

export function sanitizeString(input: string, maxLength: number = 1000): string {
  return input
    .trim()
    .replace(HTML_TAG_RE, "")
    .slice(0, maxLength);
}

export function validateFileUpload(
  file: { name: string; size: number; type: string },
  allowedTypes: string[],
  maxSize: number
): { valid: boolean; error?: string } {
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(", ")}` };
  }
  if (file.size > maxSize) {
    return { valid: false, error: `File size ${(file.size / 1024 / 1024).toFixed(1)}MB exceeds maximum of ${(maxSize / 1024 / 1024).toFixed(1)}MB` };
  }
  return { valid: true };
}

export function generateTOTPSecret(): string {
  return authenticator.generateSecret();
}

export function verifyTOTP(token: string, secret: string): boolean {
  try {
    return authenticator.verify({ token, secret });
  } catch {
    return false;
  }
}

export async function logAuditEvent(params: {
  userId?: string;
  userRole?: string;
  action: string;
  resource: string;
  resourceId?: string;
  oldValue?: unknown;
  newValue?: unknown;
  ipAddress?: string;
}): Promise<void> {
  try {
    await insforge.database.from("audit_logs").insert({
      user_id: params.userId || null,
      user_role: params.userRole || null,
      action: params.action,
      resource: params.resource,
      resource_id: params.resourceId || null,
      old_value: params.oldValue ? JSON.parse(JSON.stringify(params.oldValue)) : null,
      new_value: params.newValue ? JSON.parse(JSON.stringify(params.newValue)) : null,
      ip_address: params.ipAddress || null,
    });
  } catch (err) {
    console.error("Failed to log audit event:", err);
  }
}

export function hashApiKey(key: string): string {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    const char = key.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `kv_${Math.abs(hash).toString(36)}`;
}

export function generateApiKey(): { raw: string; hashed: string } {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let raw = "kauvex_";
  for (let i = 0; i < 40; i++) {
    raw += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return { raw, hashed: hashApiKey(raw) };
}
