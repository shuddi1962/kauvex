"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface BrandAsset {
  id: string;
  name: string;
  assetType: string;
  subBrand: string;
  fileFormat: string;
  fileUrl: string;
  version: string;
  isPartnerAccessible: boolean;
  isPublic: boolean;
  createdAt: string;
}

const assetTypes = [
  { value: "all", label: "All Types" },
  { value: "logo", label: "Logos" },
  { value: "color", label: "Colors" },
  { value: "typography", label: "Typography" },
  { value: "template", label: "Templates" },
  { value: "guideline", label: "Guidelines" },
  { value: "social", label: "Social Media" },
  { value: "packaging", label: "Packaging" },
  { value: "email", label: "Email" },
];

const subBrands = [
  { value: "all", label: "All Brands" },
  { value: "kauvex", label: "Kauvex" },
  { value: "express", label: "Express" },
  { value: "logistics", label: "Logistics" },
  { value: "fbk", label: "FBK" },
  { value: "pay", label: "Pay" },
  { value: "live", label: "Live" },
  { value: "partners", label: "Partners" },
  { value: "originals", label: "Originals" },
];

const mockAssets: BrandAsset[] = [
  {
    id: "1",
    name: "Primary Logo (Navy + White)",
    assetType: "logo",
    subBrand: "kauvex",
    fileFormat: "svg",
    fileUrl: "/brand-assets/logos/primary-navy-white.svg",
    version: "1.0",
    isPartnerAccessible: true,
    isPublic: true,
    createdAt: "2026-01-15",
  },
  {
    id: "2",
    name: "Reversed Logo (White + Orange)",
    assetType: "logo",
    subBrand: "kauvex",
    fileFormat: "svg",
    fileUrl: "/brand-assets/logos/reversed-white-orange.svg",
    version: "1.0",
    isPartnerAccessible: true,
    isPublic: true,
    createdAt: "2026-01-15",
  },
  {
    id: "3",
    name: "Express Sub-brand Logo",
    assetType: "logo",
    subBrand: "express",
    fileFormat: "png",
    fileUrl: "/brand-assets/sub-brands/express/logo.png",
    version: "1.0",
    isPartnerAccessible: false,
    isPublic: false,
    createdAt: "2026-01-15",
  },
  {
    id: "4",
    name: "Brand Guidelines PDF",
    assetType: "guideline",
    subBrand: "kauvex",
    fileFormat: "pdf",
    fileUrl: "/brand-assets/guidelines/kauvex-brand-guidelines-v1.pdf",
    version: "1.0",
    isPartnerAccessible: false,
    isPublic: false,
    createdAt: "2026-01-15",
  },
  {
    id: "5",
    name: "Email Master Template",
    assetType: "email",
    subBrand: "kauvex",
    fileFormat: "html",
    fileUrl: "/brand-assets/templates/email/master.html",
    version: "1.0",
    isPartnerAccessible: false,
    isPublic: false,
    createdAt: "2026-01-15",
  },
  {
    id: "6",
    name: "Social Media Banner Kit",
    assetType: "social",
    subBrand: "kauvex",
    fileFormat: "zip",
    fileUrl: "/brand-assets/templates/social-media/banner-kit.zip",
    version: "1.0",
    isPartnerAccessible: true,
    isPublic: false,
    createdAt: "2026-01-15",
  },
];

export function BrandAssetPortal({ className }: { className?: string }) {
  const [assets] = React.useState<BrandAsset[]>(mockAssets);
  const [typeFilter, setTypeFilter] = React.useState("all");
  const [brandFilter, setBrandFilter] = React.useState("all");
  const [searchQuery, setSearchQuery] = React.useState("");

  const filtered = assets.filter((a) => {
    if (typeFilter !== "all" && a.assetType !== typeFilter) return false;
    if (brandFilter !== "all" && a.subBrand !== brandFilter) return false;
    if (
      searchQuery &&
      !a.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-kauvex-navy">
            Brand Assets
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and distribute all Kauvex brand assets
          </p>
        </div>
        <Button>
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          Upload Asset
        </Button>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Search assets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-kauvex-orange focus:border-kauvex-orange w-64"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-kauvex-orange"
        >
          {assetTypes.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <select
          value={brandFilter}
          onChange={(e) => setBrandFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-kauvex-orange"
        >
          {subBrands.map((b) => (
            <option key={b.value} value={b.value}>
              {b.label}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">
                Asset
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">
                Type
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">
                Sub-brand
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">
                Format
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">
                Access
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((asset) => (
              <tr
                key={asset.id}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-kauvex-navy">
                    {asset.name}
                  </div>
                  <div className="text-xs text-gray-400">
                    v{asset.version} • {asset.createdAt}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className="capitalize">
                    {asset.assetType}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 capitalize">
                  {asset.subBrand}
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                    {asset.fileFormat.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {asset.isPartnerAccessible ? (
                    <Badge variant="success">Partner</Badge>
                  ) : (
                    <Badge variant="navy">Admin Only</Badge>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm">
                      Download
                    </Button>
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">
            No assets found matching your filters.
          </div>
        )}
      </div>
    </div>
  );
}
