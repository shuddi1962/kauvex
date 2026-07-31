import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import { getKaiBusiness, ensureKaiBusiness, getBusinessBrain, trainBusinessDocument } from "@/lib/kai/business-intelligence";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { user, error: authErr } = await getAuthUser(req);
  if (authErr) return authErr;
  const business = await getKaiBusiness(user!.id);
  if (!business) return successResponse({ business: null, brain: null });
  const brain = await getBusinessBrain(business.id);
  return successResponse({ business, brain });
}

export async function POST(req: Request) {
  const { user, error: authErr } = await getAuthUser(req);
  if (authErr) return authErr;
  let body: any;
  try { body = await req.json(); } catch { return errorResponse("Invalid JSON body", 400); }

  const business = await ensureKaiBusiness(user!.id, body.business);
  if (!body.name || !body.content) return errorResponse("name and content are required", 400);

  try {
    const result = await trainBusinessDocument(business.id, {
      name: body.name,
      content: body.content,
      type: body.type,
      fileUrl: body.fileUrl,
      mimeType: body.mimeType,
    });
    return successResponse(result, 201);
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}
