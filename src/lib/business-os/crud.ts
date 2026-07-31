import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import { resolveOrg } from "./index";

// =====================================================================
// Generic CRUD route factories for K Business OS
// =====================================================================

type Delegate = any;

export function orgFromQuery(req: NextRequest) {
  const url = new URL(req.url);
  return url.searchParams.get("org_id");
}

export function createListHandler(delegate: Delegate, opts?: {
  searchFields?: string[];
  statusField?: string;
  orderBy?: Record<string, "asc" | "desc">;
  include?: any;
}) {
  return async (req: NextRequest) => {
    const { user, error: authErr } = await getAuthUser(req);
    if (authErr) return authErr;
    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const q = url.searchParams.get("q");
    const limit = Math.min(Number(url.searchParams.get("limit") || 100), 500);

    const orgId = await resolveOrg(user!.id, orgFromQuery(req));
    if (!orgId) return errorResponse("No organization. Create an organization first.", 404);

    const where: any = { orgId };
    if (status && opts?.statusField) where[opts.statusField] = status;
    if (q && opts?.searchFields?.length) {
      where.OR = opts.searchFields.map((f) => ({ [f]: { contains: q, mode: "insensitive" } }));
    }

    try {
      const [rows, total] = await Promise.all([
        delegate.findMany({ where, include: opts?.include, orderBy: opts?.orderBy ?? { createdAt: "desc" }, take: limit }),
        delegate.count({ where }),
      ]);
      return successResponse({ rows, total, orgId });
    } catch (err) {
      return errorResponse((err as Error).message, 500);
    }
  };
}

export function createCreateHandler(delegate: Delegate, opts?: {
  transform?: (body: any, orgId: string) => any;
  after?: (body: any, created: any) => Promise<any>;
}) {
  return async (req: NextRequest) => {
    const { user, error: authErr } = await getAuthUser(req);
    if (authErr) return authErr;

    let body: any;
    try { body = await req.json(); } catch { return errorResponse("Invalid JSON body", 400); }

    const orgId = await resolveOrg(user!.id, body.orgId ?? orgFromQuery(req));
    if (!orgId) return errorResponse("No organization. Create an organization first.", 404);

    try {
      const data = opts?.transform ? await opts.transform(body, orgId) : body;
      delete data.orgId;
      delete data.id;
      const created = await delegate.create({ data: { ...data, orgId } });
      if (opts?.after) await opts.after(body, created);
      return successResponse(created, 201);
    } catch (err) {
      return errorResponse((err as Error).message, 500);
    }
  };
}

export function createPatchHandler(delegate: Delegate) {
  return async (req: NextRequest, { params }: { params: { id: string } }) => {
    const { user, error: authErr } = await getAuthUser(req);
    if (authErr) return authErr;

    const existing = await delegate.findUnique({ where: { id: params.id } });
    if (!existing) return errorResponse("Record not found", 404);
    const orgId = await resolveOrg(user!.id, orgFromQuery(req));
    if (!orgId || existing.orgId !== orgId) return errorResponse("Unauthorized", 403);

    let body: any;
    try { body = await req.json(); } catch { return errorResponse("Invalid JSON body", 400); }

    try {
      const { orgId: _org, id: _id, createdAt: _c, ...update } = body;
      const updated = await delegate.update({ where: { id: params.id }, data: update });
      return successResponse(updated);
    } catch (err) {
      return errorResponse((err as Error).message, 500);
    }
  };
}

export function createDeleteHandler(delegate: Delegate) {
  return async (req: NextRequest, { params }: { params: { id: string } }) => {
    const { user, error: authErr } = await getAuthUser(req);
    if (authErr) return authErr;

    const existing = await delegate.findUnique({ where: { id: params.id } });
    if (!existing) return errorResponse("Record not found", 404);
    const orgId = await resolveOrg(user!.id, orgFromQuery(req));
    if (!orgId || existing.orgId !== orgId) return errorResponse("Unauthorized", 403);

    try {
      await delegate.delete({ where: { id: params.id } });
      return successResponse({ deleted: true });
    } catch (err) {
      return errorResponse((err as Error).message, 500);
    }
  };
}

export function createStatsHandler(delegate: Delegate, groupBy: string[]) {
  return async (req: NextRequest) => {
    const { user, error: authErr } = await getAuthUser(req);
    if (authErr) return authErr;
    const orgId = await resolveOrg(user!.id, orgFromQuery(req));
    if (!orgId) return errorResponse("No organization", 404);
    try {
      const rows = await delegate.groupBy({ by: groupBy, where: { orgId }, _count: { _all: true }, _sum: { total: true, amount: true } });
      return successResponse(rows);
    } catch (err) {
      return errorResponse((err as Error).message, 500);
    }
  };
}
