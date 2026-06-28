import { NextRequest, NextResponse } from "next/server";
import {
  registerIncomingPackage,
  getReceivedPackages,
  confirmPackageReceipt,
  requestForwarding,
  consolidatePackages,
} from "@/lib/logistics/virtual-address";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    const packages = await getReceivedPackages(userId);
    return NextResponse.json({ packages, total: packages.length });
  } catch (error) {
    console.error("[Packages GET]", error);
    return NextResponse.json({ error: "Failed to fetch packages" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === "register") {
      const { virtualAddressId, userId, storeName, trackingNumber, packageDescription, declaredValue, currency } = body;
      if (!virtualAddressId || !userId || !trackingNumber) {
        return NextResponse.json({ error: "virtualAddressId, userId, and trackingNumber required" }, { status: 400 });
      }
      const pkg = await registerIncomingPackage(virtualAddressId, {
        userId, storeName, trackingNumber, packageDescription, declaredValue, currency,
      });
      return NextResponse.json({ package: pkg }, { status: 201 });
    }

    if (action === "confirm-receipt") {
      const { packageId, weightKg, dimensions } = body;
      if (!packageId || !weightKg) {
        return NextResponse.json({ error: "packageId and weightKg required" }, { status: 400 });
      }
      const pkg = await confirmPackageReceipt(packageId, weightKg, dimensions);
      return NextResponse.json({ package: pkg });
    }

    if (action === "forward") {
      const { packageIds, userId, destinationAddress, destinationCountry } = body;
      if (!packageIds?.length || !userId) {
        return NextResponse.json({ error: "packageIds and userId required" }, { status: 400 });
      }
      const result = await requestForwarding(packageIds, userId, destinationAddress, destinationCountry);
      return NextResponse.json(result);
    }

    if (action === "consolidate") {
      const { packageIds, userId } = body;
      if (!packageIds?.length || !userId) {
        return NextResponse.json({ error: "packageIds and userId required" }, { status: 400 });
      }
      const result = await consolidatePackages(packageIds, userId);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("[Packages POST]", error);
    return NextResponse.json({ error: "Failed to process package action" }, { status: 500 });
  }
}
