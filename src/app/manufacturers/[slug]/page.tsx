import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/db";

const COUNTRY_FLAGS: Record<string, string> = {
  NG: "\u{1F1F3}\u{1F1EC}", CN: "\u{1F1E8}\u{1F1F3}", IN: "\u{1F1EE}\u{1F1F3}", TR: "\u{1F1F9}\u{1F1F7}",
  BD: "\u{1F1E7}\u{1F1E9}", VN: "\u{1F1FB}\u{1F1F3}", ID: "\u{1F1EE}\u{1F1E9}", PK: "\u{1F1F5}\u{1F1F0}",
  TH: "\u{1F1F9}\u{1F1ED}", MX: "\u{1F1F2}\u{1F1FD}", BR: "\u{1F1E7}\u{1F1F7}", EG: "\u{1F1EA}\u{1F1EC}",
  ET: "\u{1F1EA}\u{1F1F9}", KE: "\u{1F1F0}\u{1F1EA}", ZA: "\u{1F1FF}\u{1F1E6}", MA: "\u{1F1F2}\u{1F1E6}",
  GH: "\u{1F1EC}\u{1F1ED}", US: "\u{1F1FA}\u{1F1F8}", DE: "\u{1F1E9}\u{1F1EA}", GB: "\u{1F1EC}\u{1F1E7}",
  AE: "\u{1F1E6}\u{1F1EA}", SA: "\u{1F1F8}\u{1F1E6}", JP: "\u{1F1EF}\u{1F1F5}", FR: "\u{1F1EB}\u{1F1F7}",
};

function getCountryCode(country: string): string {
  const map: Record<string, string> = {
    Nigeria: "NG", China: "CN", India: "IN", Turkey: "TR", Bangladesh: "BD",
    Vietnam: "VN", Indonesia: "ID", Pakistan: "PK", Thailand: "TH", Mexico: "MX",
    Brazil: "BR", Egypt: "EG", Ethiopia: "ET", Kenya: "KE", "South Africa": "ZA",
    Morocco: "MA", Ghana: "GH", "United States": "US", Germany: "DE", "United Kingdom": "GB",
    "United Arab Emirates": "AE", "Saudi Arabia": "SA", Japan: "JP", France: "FR",
  };
  return map[country] ?? "";
}

export default async function ManufacturerPage({ params }: { params: { slug: string } }) {
  const { slug } = params;

  const manufacturer = await prisma.mfgManufacturer.findUnique({
    where: { slug },
    include: {
      categories: true,
      capabilities: true,
      certifications: true,
      factoryMedia: true,
    },
  });

  if (!manufacturer) {
    notFound();
  }

  const yearsInBusiness = new Date().getFullYear() - (manufacturer.yearEstablished ?? 2000);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-[#0A1628] text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">{manufacturer.companyName}</h1>
                {manufacturer.isVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#FF6B00] px-3 py-1 text-xs font-semibold text-white">
                    ✓ Verified
                  </span>
                )}
                {manufacturer.verificationTier && manufacturer.verificationTier !== "unverified" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500 px-3 py-1 text-xs font-semibold text-white">
                    {manufacturer.verificationTier === "gold" ? "★ Gold" : manufacturer.verificationTier === "factory_verified" ? "Factory Verified" : "Doc Verified"}
                  </span>
                )}
              </div>
              <p className="mt-2 text-gray-300">
                {COUNTRY_FLAGS[getCountryCode(manufacturer.countryCode)]} {manufacturer.city ? `${manufacturer.city}, ` : ""}{manufacturer.countryCode} &middot; {yearsInBusiness} years in business
              </p>
              {manufacturer.businessType && (
                <span className="mt-3 inline-block rounded-full bg-white/10 px-3 py-1 text-xs text-gray-300">
                  {manufacturer.businessType}
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <Link
                href={`/manufacturers/${slug}/quote`}
                className="rounded-lg bg-[#FF6B00] px-6 py-3 font-semibold text-white hover:bg-[#e55f00]"
              >
                Request a Quote
              </Link>
              <Link
                href={`/manufacturers/${slug}/contact`}
                className="rounded-lg border border-white px-6 py-3 font-semibold text-white hover:bg-white hover:text-[#0A1628]"
              >
                Contact Manufacturer
              </Link>
              <Link
                href={`/manufacturers/${slug}/sample`}
                className="rounded-lg border border-white px-6 py-3 font-semibold text-white hover:bg-white hover:text-[#0A1628]"
              >
                Request Sample
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-8 lg:col-span-2">
            {/* Metrics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100 text-center">
                <p className="text-2xl font-bold text-[#FF6B00]">{manufacturer.responseRate ? Number(manufacturer.responseRate).toFixed(0) : "95"}%</p>
                <p className="mt-1 text-sm text-gray-500">Response Rate</p>
              </div>
              <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100 text-center">
                <p className="text-2xl font-bold text-[#FF6B00]">{manufacturer.avgResponseTimeHours ? Number(manufacturer.avgResponseTimeHours).toFixed(0) : "12"}h</p>
                <p className="mt-1 text-sm text-gray-500">Avg Response Time</p>
              </div>
              <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100 text-center">
                <p className="text-2xl font-bold text-[#FF6B00]">
                  {manufacturer.ratingAverage ? Number(manufacturer.ratingAverage).toFixed(1) : "—"}
                </p>
                <p className="mt-1 text-sm text-gray-500">Rating</p>
              </div>
            </div>

            {/* About */}
            <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-[#0A1628]">About</h2>
              <p className="mt-3 text-gray-600 leading-relaxed">
                {`${manufacturer.companyName} is a ${manufacturer.businessType ?? "manufacturer"} based in ${manufacturer.city ?? ""}, ${manufacturer.countryCode}. Established in ${manufacturer.yearEstablished ?? "—"}, specializing in ${manufacturer.categories?.map((c) => c.category).join(", ") ?? "various products"}.`}
              </p>
            </div>

            {/* Photo Gallery */}
            <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-[#0A1628]">Factory Photos</h2>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {manufacturer.factoryMedia && manufacturer.factoryMedia.length > 0 ? (
                  manufacturer.factoryMedia.map((media: { id: string; url: string; mediaType?: string }) => (
                    <div
                      key={media.id}
                      className="aspect-square rounded-lg bg-gray-100 overflow-hidden"
                    >
                      {media.mediaType === "video" ? (
                        <video src={media.url} className="h-full w-full object-cover" controls />
                      ) : (
                        <img
                          src={media.url}
                          alt="Factory photo"
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                  ))
                ) : (
                  <>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div
                        key={i}
                        className="flex aspect-square items-center justify-center rounded-lg bg-gray-100 text-sm text-gray-400"
                      >
                        Photo {i}
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* Certifications */}
            <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-[#0A1628]">Certifications</h2>
              <div className="mt-4 flex flex-wrap gap-3">
                {manufacturer.certifications && manufacturer.certifications.length > 0 ? (
                  manufacturer.certifications.map(
                    (cert: { id: string; certificationType: string; certificateUrl?: string | null }) => (
                      <span
                        key={cert.id}
                        className="inline-flex items-center gap-1.5 rounded-full bg-green-50 border border-green-200 px-4 py-2 text-sm font-medium text-green-800"
                      >
                        ✓ {cert.certificationType}
                        {cert.certificateUrl && (
                          <a href={cert.certificateUrl} target="_blank" rel="noopener noreferrer" className="ml-1 text-green-600 underline text-xs">
                            View
                          </a>
                        )}
                      </span>
                    )
                  )
                ) : (
                  <p className="text-sm text-gray-500">No certifications listed yet.</p>
                )}
              </div>
            </div>

            {/* Product Capabilities */}
            <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-[#0A1628]">Production Capabilities</h2>
              <div className="mt-4 space-y-4">
                {manufacturer.capabilities && manufacturer.capabilities.length > 0 ? (
                  manufacturer.capabilities.map(
                    (cap: {
                      id: string;
                      monthlyCapacity?: number | null;
                      capacityUnit?: string | null;
                      defaultMoq?: number | null;
                      defaultLeadTimeDays?: number | null;
                      sampleLeadTimeDays?: number | null;
                      allowsOem?: boolean;
                      allowsOdm?: boolean;
                      allowsPrivateLabel?: boolean;
                      allowsCustomPackaging?: boolean;
                    }) => (
                      <div
                        key={cap.id}
                        className="rounded-lg border border-gray-100 p-4"
                      >
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Monthly Capacity:</span>
                            <span className="ml-2 font-semibold text-[#0A1628]">
                              {cap.monthlyCapacity?.toLocaleString() ?? "—"} {cap.capacityUnit ?? "units"}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">MOQ:</span>
                            <span className="ml-2 font-semibold text-[#0A1628]">
                              {cap.defaultMoq?.toLocaleString() ?? "—"}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Lead Time:</span>
                            <span className="ml-2 font-semibold text-[#0A1628]">
                              {cap.defaultLeadTimeDays ?? "—"} days
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Sample Lead Time:</span>
                            <span className="ml-2 font-semibold text-[#0A1628]">
                              {cap.sampleLeadTimeDays ?? "—"} days
                            </span>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {cap.allowsOem && <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">OEM</span>}
                          {cap.allowsOdm && <span className="rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">ODM</span>}
                          {cap.allowsPrivateLabel && <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">Private Label</span>}
                          {cap.allowsCustomPackaging && <span className="rounded-full bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-700">Custom Packaging</span>}
                        </div>
                      </div>
                    )
                  )
                ) : (
                  <p className="text-sm text-gray-500">
                    Contact the manufacturer to inquire about their products.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trust Stats */}
            <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-[#0A1628]">Trust &amp; Performance</h3>
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Orders Completed</span>
                  <span className="font-bold text-[#0A1628]">
                    {manufacturer.totalOrdersCompleted?.toLocaleString() ?? "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Trust Score</span>
                  <span className="font-bold text-[#0A1628]">
                    {manufacturer.trustScore ?? 0}/100
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Member Since</span>
                  <span className="font-bold text-[#0A1628]">
                    {manufacturer.createdAt
                      ? new Date(manufacturer.createdAt).getFullYear()
                      : "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Production Info */}
            <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-[#0A1628]">Production Details</h3>
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Monthly Capacity</span>
                  <span className="font-bold text-[#0A1628]">
                    {manufacturer.capabilities?.[0]?.monthlyCapacity?.toLocaleString() ?? "—"} {manufacturer.capabilities?.[0]?.capacityUnit ?? "units"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">MOQ</span>
                  <span className="font-bold text-[#0A1628]">
                    {manufacturer.capabilities?.[0]?.defaultMoq?.toLocaleString() ?? "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Lead Time</span>
                  <span className="font-bold text-[#0A1628]">
                    {manufacturer.capabilities?.[0]?.defaultLeadTimeDays ?? "—"} days
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Factory Size</span>
                  <span className="font-bold text-[#0A1628]">
                    {manufacturer.factorySizeSqm ? `${manufacturer.factorySizeSqm.toLocaleString()} sqm` : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Employees</span>
                  <span className="font-bold text-[#0A1628]">
                    {manufacturer.employeeCountRange ?? "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-[#0A1628]">Categories</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {manufacturer.categories && manufacturer.categories.length > 0 ? (
                  manufacturer.categories.map(
                    (cat: { id: string; category: string; isPrimary?: boolean }) => (
                      <span
                        key={cat.id}
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          cat.isPrimary
                            ? "bg-[#FF6B00]/10 text-[#FF6B00]"
                            : "bg-[#0A1628]/10 text-[#0A1628]"
                        }`}
                      >
                        {cat.category}
                      </span>
                    )
                  )
                ) : (
                  <p className="text-sm text-gray-500">No categories listed.</p>
                )}
              </div>
            </div>

            {/* Payment Terms */}
            <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-[#0A1628]">Payment &amp; Terms</h3>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Currency</span>
                  <span className="font-bold text-[#0A1628]">{manufacturer.currency ?? "USD"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Deposit Required</span>
                  <span className="font-bold text-[#0A1628]">
                    {manufacturer.depositPercentage ?? 30}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Incoterms</span>
                  <span className="font-bold text-[#0A1628]">{manufacturer.incoterms ?? "FOB"}</span>
                </div>
              </div>
            </div>

            {/* Quick Contact */}
            <div className="rounded-xl bg-[#FF6B00] p-6 text-white">
              <h3 className="font-bold">Ready to Source?</h3>
              <p className="mt-2 text-sm text-white/90">
                Send your requirements directly to {manufacturer.companyName} and receive a quote within 24 hours.
              </p>
              <Link
                href={`/manufacturers/${slug}/quote`}
                className="mt-4 inline-block w-full rounded-lg bg-white text-center py-3 font-semibold text-[#0A1628] hover:bg-gray-100"
              >
                Request a Quote
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
