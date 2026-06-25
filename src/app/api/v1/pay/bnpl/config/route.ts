import { NextRequest } from "next/server";
import { successResponse, errorResponse, requireAdmin, validateBody } from "@/lib/api-helpers";
import { getBnplConfig, updateBnplConfig } from "@/lib/pay/bnpl";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateConfigSchema = z.object({
  key: z.string(),
  value: z.string(),
});

export async function GET() {
  try {
    const config = await getBnplConfig();
    return successResponse(config);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}

export async function PUT(request: NextRequest) {
  const { user, error: authErr } = await requireAdmin(request);
  if (authErr) return authErr;

  const { data: body, error: valErr } = await validateBody(request, updateConfigSchema);
  if (valErr) return valErr;

  try {
    await updateBnplConfig(body!.key, body!.value, user!.id);
    return successResponse({ message: "Config updated" });
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}
