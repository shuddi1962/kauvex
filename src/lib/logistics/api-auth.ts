import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export interface ApiKeyData {
  id: string;
  name: string;
  ownerId: string;
  ownerType: string;
  scopes: string[];
  rateLimitPerMin: number;
}

export async function validateApiKey(authHeader: string | null): Promise<ApiKeyData | { error: string; status: number }> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: "Missing or invalid Authorization header. Use: Bearer <your-api-key>", status: 401 };
  }

  const key = authHeader.slice(7).trim();
  if (!key) {
    return { error: "API key is empty", status: 401 };
  }

  try {
    const keyHash = crypto.createHash("sha256").update(key).digest("hex");

    const record = await (prisma as any).apiKey.findUnique({
      where: { keyHash },
      select: {
        id: true,
        name: true,
        ownerId: true,
        ownerType: true,
        scopes: true,
        rateLimitPerMin: true,
        isActive: true,
        expiresAt: true,
      },
    });

    if (!record) {
      return { error: "Invalid API key", status: 401 };
    }

    if (!record.isActive) {
      return { error: "API key is deactivated", status: 403 };
    }

    if (record.expiresAt && new Date(record.expiresAt) < new Date()) {
      return { error: "API key has expired", status: 403 };
    }

    return {
      id: record.id,
      name: record.name,
      ownerId: record.ownerId,
      ownerType: record.ownerType,
      scopes: record.scopes || [],
      rateLimitPerMin: record.rateLimitPerMin,
    };
  } catch {
    return { error: "Internal authentication error", status: 500 };
  }
}

export function checkScope(apiKey: ApiKeyData, required: string): boolean {
  if (apiKey.scopes.includes("*")) return true;
  return apiKey.scopes.includes(required);
}
