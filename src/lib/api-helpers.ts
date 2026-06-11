import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

type ApiData = Record<string, unknown> | unknown[] | null;

export function successResponse(data: ApiData, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function errorResponse(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: message, ...(details !== undefined ? { details } : {}) }, { status });
}

export function paginatedResponse(data: unknown[], total: number, page: number, limit: number) {
  return NextResponse.json({
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function getAuthUser(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return { user: null, error: errorResponse("Missing or invalid Authorization header", 401) };

  const token = authHeader.slice(7);
  const sb = getSupabaseClient();
  const { data, error } = await sb.auth.getUser(token);

  if (error || !data.user) return { user: null, error: errorResponse("Invalid or expired token", 401) };

  return { user: data.user, error: null };
}

export async function requireAdmin(request: Request) {
  const { user, error } = await getAuthUser(request);
  if (error) return { user: null, profile: null, error };

  const sb = getSupabaseClient();
  const { data: profile } = await sb.from("profiles").select("role").eq("id", user!.id).single();

  if (!profile || !["super-admin", "store-manager"].includes(profile.role)) {
    return { user: null, profile: null, error: errorResponse("Admin access required", 403) };
  }

  return { user, profile, error: null };
}

export async function requireVendor(request: Request) {
  const { user, error } = await getAuthUser(request);
  if (error) return { user: null, profile: null, vendor: null, error };

  const sb = getSupabaseClient();
  const { data: profile } = await sb.from("profiles").select("role, vendor_id").eq("id", user!.id).single();

  if (!profile || profile.role !== "vendor") {
    return { user: null, profile: null, vendor: null, error: errorResponse("Vendor access required", 403) };
  }

  const { data: vendor } = profile.vendor_id
    ? await sb.from("vendors").select("*").eq("id", profile.vendor_id).single()
    : { data: null };

  return { user, profile, vendor, error: null };
}

export async function validateBody<T extends z.ZodType>(
  request: Request,
  schema: T
): Promise<{ data: z.infer<T> | null; error: NextResponse | null }> {
  try {
    const body = await request.json();
    const parsed = schema.parse(body);
    return { data: parsed, error: null };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { data: null, error: errorResponse("Validation failed", 422, err.errors) };
    }
    return { data: null, error: errorResponse("Invalid JSON body", 400) };
  }
}
