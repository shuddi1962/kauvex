import { NextRequest, NextResponse } from "next/server";
import { lookupHsCode, validateHsCode, saveHsCode, searchHsCodes } from "@/lib/hs-codes";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const lookup = searchParams.get("lookup");
    const productTitle = searchParams.get("title");
    const category = searchParams.get("category");

    if (lookup || productTitle) {
      const result = lookupHsCode(
        productTitle || lookup || "",
        category || undefined
      );
      return NextResponse.json(result);
    }

    if (query) {
      const results = await searchHsCodes(query);
      return NextResponse.json({ results, total: results.length });
    }

    const results = await searchHsCodes("", 100);
    return NextResponse.json({ results, total: results.length });
  } catch (error) {
    console.error("[HS Codes GET]", error);
    return NextResponse.json({ error: "Failed to fetch HS codes" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hs_code, description, category_id, product_id, notes, validate_only } = body;

    if (!hs_code) {
      return NextResponse.json({ error: "hs_code is required" }, { status: 400 });
    }

    const validation = validateHsCode(hs_code);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.message }, { status: 400 });
    }

    if (validate_only) {
      return NextResponse.json({ validation });
    }

    const saved = await saveHsCode(hs_code, description, category_id, product_id, notes);
    return NextResponse.json({ hsCode: saved }, { status: 201 });
  } catch (error) {
    console.error("[HS Codes POST]", error);
    return NextResponse.json({ error: "Failed to create HS code" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { hs_code, description, category_id, product_id, notes } = body;
    if (!hs_code) return NextResponse.json({ error: "hs_code is required" }, { status: 400 });

    const updated = await saveHsCode(hs_code, description, category_id, product_id, notes);
    return NextResponse.json({ hsCode: updated });
  } catch (error) {
    console.error("[HS Codes PATCH]", error);
    return NextResponse.json({ error: "Failed to update HS code" }, { status: 500 });
  }
}
