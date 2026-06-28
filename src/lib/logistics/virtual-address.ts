import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

export interface VirtualAddressConfig {
  countryCode: string;
  city: string;
  streetAddress: string;
  hubName: string;
  postalCode: string;
}

export const VIRTUAL_ADDRESS_HUBS: Record<string, VirtualAddressConfig> = {
  GB: {
    countryCode: "GB",
    city: "London",
    streetAddress: "123 Commerce Way",
    hubName: "Kauvex UK Hub",
    postalCode: "E1 8AN",
  },
  US: {
    countryCode: "US",
    city: "Newark",
    streetAddress: "222 Market Street",
    hubName: "Kauvex US Hub",
    postalCode: "07102",
  },
  CN: {
    countryCode: "CN",
    city: "Shenzhen",
    streetAddress: "88 Kauvex Park, Longhua District",
    hubName: "Kauvex Shenzhen Hub",
    postalCode: "518000",
  },
  CA: {
    countryCode: "CA",
    city: "Toronto",
    streetAddress: "45 Commerce Blvd",
    hubName: "Kauvex Canada Hub",
    postalCode: "M5V 2T6",
  },
  AE: {
    countryCode: "AE",
    city: "Dubai",
    streetAddress: "15 Jebel Ali Free Zone",
    hubName: "Kauvex UAE Hub",
    postalCode: "00000",
  },
  DE: {
    countryCode: "DE",
    city: "Frankfurt",
    streetAddress: "12 Logistikring",
    hubName: "Kauvex EU Hub",
    postalCode: "60549",
  },
};

export interface PackageInfo {
  id: string;
  storeName: string;
  trackingNumber: string;
  description: string;
  declaredValue: number;
  currency: string;
  weightKg: number | null;
  status: string;
  receivedAt: Date | null;
  createdAt: Date;
}

export interface VirtualAddressInfo {
  id: string;
  userId: string;
  countryCode: string;
  city: string;
  streetAddress: string;
  unitIdentifier: string;
  isActive: boolean;
  packagesReceived: number;
  packagesForwarded: number;
  createdAt: Date;
  hub?: VirtualAddressConfig;
  fullAddress?: string;
}

function generateUnitId(): string {
  const bytes = randomBytes(3).toString("hex").toUpperCase();
  return `KVX-${bytes}`;
}

export async function assignVirtualAddress(userId: string, countryCode: string): Promise<VirtualAddressInfo> {
  const existing = await (prisma as any).slVirtualAddress.findFirst({
    where: { userId, countryCode, isActive: true },
  });
  if (existing) {
    return formatVirtualAddress(existing);
  }

  const hub = VIRTUAL_ADDRESS_HUBS[countryCode];
  if (!hub) {
    throw new Error(`No Kauvex hub available in country: ${countryCode}`);
  }

  const unitIdentifier = generateUnitId();

  const address = await (prisma as any).slVirtualAddress.create({
    data: {
      userId,
      countryCode,
      city: hub.city,
      streetAddress: hub.streetAddress,
      unitIdentifier,
      isActive: true,
      packagesReceived: 0,
      packagesForwarded: 0,
    },
  });

  return formatVirtualAddress(address);
}

export async function getVirtualAddresses(userId: string): Promise<VirtualAddressInfo[]> {
  const addresses = await (prisma as any).slVirtualAddress.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return addresses.map(formatVirtualAddress);
}

export async function getVirtualAddressById(addressId: string): Promise<VirtualAddressInfo | null> {
  const address = await (prisma as any).slVirtualAddress.findUnique({
    where: { id: addressId },
  });
  return address ? formatVirtualAddress(address) : null;
}

export async function registerIncomingPackage(
  virtualAddressId: string,
  data: {
    userId: string;
    storeName: string;
    trackingNumber: string;
    packageDescription: string;
    declaredValue: number;
    currency?: string;
  }
): Promise<PackageInfo> {
  const address = await (prisma as any).slVirtualAddress.findUnique({
    where: { id: virtualAddressId },
  });
  if (!address) throw new Error("Virtual address not found");

  const pkg = await (prisma as any).slShopAndShip.create({
    data: {
      virtualAddressId,
      userId: data.userId,
      storeName: data.storeName,
      trackingNumberInbound: data.trackingNumber,
      packageDescription: data.packageDescription,
      declaredValue: data.declaredValue,
      currencyCode: data.currency || "NGN",
      status: "awaiting_arrival",
    },
  });

  await (prisma as any).slVirtualAddress.update({
    where: { id: virtualAddressId },
    data: { packagesReceived: { increment: 1 } },
  });

  return formatPackage(pkg);
}

export async function getReceivedPackages(userId: string): Promise<PackageInfo[]> {
  const packages = await (prisma as any).slShopAndShip.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return packages.map(formatPackage);
}

export async function getPackageById(packageId: string): Promise<PackageInfo | null> {
  const pkg = await (prisma as any).slShopAndShip.findUnique({
    where: { id: packageId },
  });
  return pkg ? formatPackage(pkg) : null;
}

export async function confirmPackageReceipt(
  packageId: string,
  weightKg: number,
  dimensions?: { length: number; width: number; height: number }
): Promise<PackageInfo> {
  const pkg = await (prisma as any).slShopAndShip.update({
    where: { id: packageId },
    data: {
      status: "received",
      receivedAt: new Date(),
      weightKg,
      dimensions: dimensions || null,
    },
  });
  return formatPackage(pkg);
}

export async function requestForwarding(
  packageIds: string[],
  userId: string,
  destinationAddress: string,
  destinationCountry: string
): Promise<{ shipmentId: string; packages: PackageInfo[] }> {
  const packages = await Promise.all(
    packageIds.map((id) =>
      (prisma as any).slShopAndShip.findUnique({ where: { id } })
    )
  );

  const invalid = packages.filter((p) => !p || p.userId !== userId || p.status !== "received");
  if (invalid.length > 0) {
    throw new Error("One or more packages are not eligible for forwarding");
  }

  const updated = await Promise.all(
    packageIds.map((id) =>
      (prisma as any).slShopAndShip.update({
        where: { id },
        data: { status: "queued_for_forwarding" },
      })
    )
  );

  const totalWeight = packages.reduce((sum, p) => sum + (Number(p.weightKg) || 0.5), 0);
  const totalValue = packages.reduce((sum, p) => sum + Number(p.declaredValue), 0);

  const shipmentId = `FWD-${Date.now()}-${randomBytes(2).toString("hex").toUpperCase()}`;

  return {
    shipmentId,
    packages: updated.map(formatPackage),
  };
}

export async function consolidatePackages(
  packageIds: string[],
  userId: string
): Promise<{ consolidationId: string; packages: PackageInfo[]; totalWeight: number; estimatedSavings: string }> {
  const packages = await Promise.all(
    packageIds.map((id) =>
      (prisma as any).slShopAndShip.findUnique({ where: { id } })
    )
  );

  const invalid = packages.filter((p) => !p || p.userId !== userId || !["received", "awaiting_arrival"].includes(p.status));
  if (invalid.length < packageIds.length) {
    throw new Error("Some packages are not eligible for consolidation");
  }

  const totalWeight = packages.reduce((sum, p) => sum + (Number(p.weightKg) || 0.5), 0);

  await Promise.all(
    packageIds.map((id) =>
      (prisma as any).slShopAndShip.update({
        where: { id },
        data: { consolidateWith: packageIds.filter((pid) => pid !== id) },
      })
    )
  );

  return {
    consolidationId: `CON-${Date.now()}-${randomBytes(2).toString("hex").toUpperCase()}`,
    packages: packages.map(formatPackage),
    totalWeight: Math.round(totalWeight * 1000) / 1000,
    estimatedSavings: `${Math.round(totalWeight * 2500).toLocaleString()} NGN`,
  };
}

export async function getVirtualAddressStats(userId: string) {
  const addresses = await (prisma as any).slVirtualAddress.findMany({
    where: { userId },
  });

  const packages = await (prisma as any).slShopAndShip.findMany({
    where: { userId },
  });

  const totalReceived = packages.length;
  const totalForwarded = packages.filter((p: any) => p.status === "delivered").length;
  const pendingPackages = packages.filter((p: any) => ["awaiting_arrival", "received", "queued_for_forwarding"].includes(p.status)).length;
  const totalValue = packages.reduce((sum: number, p: any) => sum + Number(p.declaredValue), 0);

  return {
    totalAddresses: addresses.length,
    activeAddresses: addresses.filter((a: any) => a.isActive).length,
    totalReceived,
    totalForwarded,
    pendingPackages,
    totalValue: Math.round(totalValue * 100) / 100,
  };
}

function formatVirtualAddress(addr: any): VirtualAddressInfo {
  const hub = VIRTUAL_ADDRESS_HUBS[addr.countryCode];
  return {
    id: addr.id,
    userId: addr.userId,
    countryCode: addr.countryCode,
    city: addr.city,
    streetAddress: addr.streetAddress,
    unitIdentifier: addr.unitIdentifier,
    isActive: addr.isActive,
    packagesReceived: addr.packagesReceived,
    packagesForwarded: addr.packagesForwarded,
    createdAt: addr.createdAt,
    hub,
    fullAddress: `${addr.unitIdentifier}\n${hub?.hubName || "Kauvex Hub"}\n${addr.streetAddress}\n${addr.city}, ${hub?.postalCode || ""}\n${getCountryName(addr.countryCode)}`,
  };
}

function formatPackage(pkg: any): PackageInfo {
  return {
    id: pkg.id,
    storeName: pkg.storeName,
    trackingNumber: pkg.trackingNumberInbound,
    description: pkg.packageDescription,
    declaredValue: Number(pkg.declaredValue),
    currency: pkg.currencyCode,
    weightKg: pkg.weightKg ? Number(pkg.weightKg) : null,
    status: pkg.status,
    receivedAt: pkg.receivedAt,
    createdAt: pkg.createdAt,
  };
}

function getCountryName(code: string): string {
  const names: Record<string, string> = {
    GB: "United Kingdom",
    US: "United States",
    CN: "China",
    CA: "Canada",
    AE: "United Arab Emirates",
    DE: "Germany",
  };
  return names[code] || code;
}

export { getCountryName };
