import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-helpers";

const returnReasons: Record<string, string[]> = {
  electronics: [
    "Defective product",
    "Wrong item received",
    "Damaged in transit",
    "Not as described",
    "Compatibility issue",
    "Missing accessories",
  ],
  fashion: [
    "Wrong size",
    "Wrong color",
    "Defective stitching",
    "Not as pictured",
    "Uncomfortable fit",
    "Changed mind",
  ],
  home: [
    "Damaged in transit",
    "Wrong item received",
    "Not as described",
    "Assembly issue",
    "Missing parts",
    "Quality not as expected",
  ],
  beauty: [
    "Allergic reaction",
    "Expired product",
    "Wrong shade",
    "Damaged packaging",
    "Counterfeit concern",
    "Not as described",
  ],
  sports: [
    "Wrong size",
    "Defective product",
    "Not as described",
    "Damaged in transit",
    "Wrong item received",
  ],
  books: [
    "Wrong edition",
    "Damaged cover",
    "Missing pages",
    "Wrong item received",
    "Not as described",
  ],
  default: [
    "Defective product",
    "Wrong item received",
    "Damaged in transit",
    "Not as described",
    "Changed mind",
    "Better price found",
    "No longer needed",
    "Quality not as expected",
  ],
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category")?.toLowerCase() || "default";
    const reasons = returnReasons[category] || returnReasons.default;
    return successResponse(reasons);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}