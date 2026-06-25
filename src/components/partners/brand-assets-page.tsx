"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PartnerBrandAsset {
  id: string;
  name: string;
  assetType: string;
  fileFormat: string;
  fileUrl: string;
  description: string;
}

const partnerAssets: PartnerBrandAsset[] = [
  {
    id: "1",
    name: "Kauvex Logo — Light Background",
    assetType: "logo",
    fileFormat: "PNG",
    fileUrl: "/brand-assets/logos/primary-navy-white.png",
    description: "Use on white or light backgrounds",
  },
  {
    id: "2",
    name: "Kauvex Logo — Dark Background",
    assetType: "logo",
    fileFormat: "PNG",
    fileUrl: "/brand-assets/logos/reversed-white-orange.png",
    description: "Use on navy or dark backgrounds",
  },
  {
    id: "3",
    name: '"Available on Kauvex" Badge — Small',
    assetType: "badge",
    fileFormat: "PNG",
    fileUrl: "/brand-assets/badges/available-small.png",
    description: "120x40px for sidebar/widget placement",
  },
  {
    id: "4",
    name: '"Available on Kauvex" Badge — Medium',
    assetType: "badge",
    fileFormat: "PNG",
    fileUrl: "/brand-assets/badges/available-medium.png",
    description: "240x80px for blog posts and websites",
  },
  {
    id: "5",
    name: '"Kauvex Affiliate Partner" Badge',
    assetType: "badge",
    fileFormat: "PNG",
    fileUrl: "/brand-assets/badges/affiliate-partner.png",
    description: "Official affiliate partner badge",
  },
  {
    id: "6",
    name: "Social Media Banner — Instagram",
    assetType: "social",
    fileFormat: "PNG",
    fileUrl: "/brand-assets/social/instagram-banner.png",
    description: "1080x1080px Instagram post template",
  },
  {
    id: "7",
    name: "Social Media Banner — YouTube",
    assetType: "social",
    fileFormat: "PNG",
    fileUrl: "/brand-assets/social/youtube-banner.png",
    description: "2560x1440px YouTube channel art",
  },
  {
    id: "8",
    name: "Product Image Pack — Electronics",
    assetType: "product",
    fileFormat: "ZIP",
    fileUrl: "/brand-assets/products/electronics.zip",
    description: "High-res product images for promotion",
  },
];

export function PartnerBrandAssets({
  className,
}: {
  className?: string;
}) {
  const [assets] = React.useState<PartnerBrandAsset[]>(partnerAssets);
  const [filter, setFilter] = React.useState("all");

  const types = ["all", "logo", "badge", "social", "product"];

  const filtered =
    filter === "all" ? assets : assets.filter((a) => a.assetType === filter);

  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <h1 className="text-2xl font-bold text-kauvex-navy">Brand Assets</h1>
        <p className="text-sm text-gray-500 mt-1">
          Download approved Kauvex brand assets for your promotions. Do not
          modify logos or brand elements.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-sm text-amber-800">
          <strong>Brand usage reminder:</strong> Do not modify, recolor, or
          distort Kauvex logos. Always maintain clear space around logo marks.
          Use only approved assets from this portal.
        </p>
      </div>

      <div className="flex gap-2">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-colors capitalize",
              filter === t
                ? "bg-kauvex-navy text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {t === "all" ? "All Assets" : t + "s"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((asset) => (
          <div
            key={asset.id}
            className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-card-hover transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <Badge variant="outline" className="text-xs">
                {asset.fileFormat}
              </Badge>
            </div>
            <h3 className="text-sm font-semibold text-kauvex-navy mb-1">
              {asset.name}
            </h3>
            <p className="text-xs text-gray-500 mb-4">{asset.description}</p>
            <Button variant="outline" size="sm" className="w-full">
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Download
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
