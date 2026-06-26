import { NextResponse } from "next/server";
import { getCountryCustomsInfo, estimateDuties, generateCommercialInvoice, generateCN22, generatePackingList } from "@/lib/logistics/customs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { countryCode, items, currency } = body;

    const customsInfo = await getCountryCustomsInfo(countryCode);
    if (!customsInfo) {
      return NextResponse.json({ error: "Country not configured" }, { status: 404 });
    }

    const totalDeclaredValue = items.reduce((sum: number, item: any) => sum + item.unitPrice * item.qty, 0);
    const duties = estimateDuties(totalDeclaredValue, customsInfo.vatRate, customsInfo.importDutyGeneral, customsInfo.deMinimisValue);
    const invoice = generateCommercialInvoice(items, currency || customsInfo.countryCode === "NG" ? "NGN" : "USD");
    const cn22 = generateCN22(totalDeclaredValue, currency || "USD", "goods");
    const packingList = generatePackingList(items);

    return NextResponse.json({
      data: {
        customsInfo,
        duties,
        invoice,
        customsDeclaration: cn22,
        packingList,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to generate customs data" }, { status: 500 });
  }
}
