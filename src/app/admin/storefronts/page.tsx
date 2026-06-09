"use client";

import { useState } from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/admin-shell";
import { Plus, Edit2, Globe, ExternalLink, ToggleLeft, ToggleRight, Search } from "lucide-react";

interface Storefront {
  id: string;
  name: string;
  slug: string;
  domainType?: "subdomain" | "custom_domain";
  activeDomain?: string;
  currencyCode: string;
  currencySymbol: string;
  languageCode: string;
  countryCode: string;
  taxRate: number;
  isDefault: boolean;
  active: boolean;
  metaTitle?: string;
}

const seedStorefronts: Storefront[] = [
  { id: "default", name: "Global", slug: "global", domainType: "subdomain", activeDomain: "kauvex.com", currencyCode: "USD", currencySymbol: "$", languageCode: "en", countryCode: "US", taxRate: 0, isDefault: true, active: true, metaTitle: "KAUVEX" },
  { id: "uk", name: "United Kingdom", slug: "uk", domainType: "subdomain", activeDomain: "uk.kauvex.com", currencyCode: "GBP", currencySymbol: "£", languageCode: "en", countryCode: "GB", taxRate: 20, isDefault: false, active: true, metaTitle: "KAUVEX UK" },
  { id: "ca", name: "Canada", slug: "ca", domainType: "subdomain", activeDomain: "ca.kauvex.com", currencyCode: "CAD", currencySymbol: "CA$", languageCode: "en", countryCode: "CA", taxRate: 13, isDefault: false, active: true, metaTitle: "KAUVEX Canada" },
  { id: "au", name: "Australia", slug: "au", domainType: "subdomain", activeDomain: "au.kauvex.com", currencyCode: "AUD", currencySymbol: "A$", languageCode: "en", countryCode: "AU", taxRate: 10, isDefault: false, active: false, metaTitle: "KAUVEX Australia" },
  { id: "ng", name: "Nigeria", slug: "ng", domainType: "subdomain", activeDomain: "ng.kauvex.com", currencyCode: "NGN", currencySymbol: "₦", languageCode: "en", countryCode: "NG", taxRate: 7.5, isDefault: false, active: true, metaTitle: "KAUVEX Nigeria" },
  { id: "de", name: "Deutschland", slug: "de", domainType: "subdomain", activeDomain: "de.kauvex.com", currencyCode: "EUR", currencySymbol: "€", languageCode: "de", countryCode: "DE", taxRate: 19, isDefault: false, active: true, metaTitle: "KAUVEX Deutschland" },
];

const flags: Record<string, string> = { US: "🇺🇸", GB: "🇬🇧", CA: "🇨🇦", AU: "🇦🇺", NG: "🇳🇬", DE: "🇩🇪" };

export default function AdminStorefrontsPage() {
  const [storefronts, setStorefronts] = useState(seedStorefronts);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleActive = (id: string) => {
    setStorefronts(prev => prev.map(sf => sf.id === id ? { ...sf, active: !sf.active } : sf));
  };

  const filtered = storefronts.filter(sf =>
    sf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sf.activeDomain?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = storefronts.filter(sf => sf.active).length;
  const defaultSf = storefronts.find(sf => sf.isDefault);

  return (
    <AdminShell title="Storefronts" subtitle="Manage multi-storefront configuration">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="font-bold text-2xl text-text-1">{storefronts.length}</p>
          <p className="text-xs text-text-4 mt-1">Total Storefronts</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="font-bold text-2xl text-green-600">{activeCount}</p>
          <p className="text-xs text-text-4 mt-1">Active</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="font-bold text-2xl text-blue">{storefronts.length - activeCount}</p>
          <p className="text-xs text-text-4 mt-1">Inactive</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="font-bold text-2xl text-amber-600">{defaultSf?.name || "—"}</p>
          <p className="text-xs text-text-4 mt-1">Default Storefront</p>
        </div>
      </div>

      {/* Search and Add */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search storefronts by name or domain..."
              className="w-full h-9 pl-9 pr-3 text-sm rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue/20"
            />
          </div>
          <button className="h-9 px-4 bg-blue text-white text-sm font-semibold rounded-lg hover:bg-blue-600 flex items-center gap-2">
            <Plus size={14} /> Add Storefront
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-3 text-left text-xs font-semibold text-text-4 uppercase">Storefront</th>
              <th className="p-3 text-left text-xs font-semibold text-text-4 uppercase">Domain</th>
              <th className="p-3 text-center text-xs font-semibold text-text-4 uppercase">Currency</th>
              <th className="p-3 text-center text-xs font-semibold text-text-4 uppercase">Tax Rate</th>
              <th className="p-3 text-center text-xs font-semibold text-text-4 uppercase">Default</th>
              <th className="p-3 text-center text-xs font-semibold text-text-4 uppercase">Status</th>
              <th className="p-3 text-right text-xs font-semibold text-text-4 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-sm text-text-4">No storefronts found</td></tr>
            ) : filtered.map(sf => (
              <tr key={sf.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue/10 flex items-center justify-center shrink-0">
                      <Globe size={16} className="text-blue" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{flags[sf.countryCode] || "🌐"}</span>
                        <span className="text-sm font-semibold text-text-1">{sf.name}</span>
                        {sf.isDefault && (
                          <span className="text-[9px] bg-blue/10 text-blue font-semibold px-1.5 py-0.5 rounded-full">DEFAULT</span>
                        )}
                      </div>
                      <p className="text-[10px] text-text-4">{sf.slug} · {sf.metaTitle}</p>
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <Link href={`https://${sf.activeDomain}`} target="_blank" className="flex items-center gap-1.5 text-sm text-blue hover:underline">
                    {sf.activeDomain}
                    <ExternalLink size={10} className="shrink-0" />
                  </Link>
                  <p className="text-[10px] text-text-4 mt-0.5 capitalize">{sf.domainType?.replace("_", " ")}</p>
                </td>
                <td className="p-3 text-center">
                  <span className="text-sm font-semibold text-text-1">{sf.currencySymbol}</span>
                  <p className="text-[10px] text-text-4">{sf.currencyCode}</p>
                </td>
                <td className="p-3 text-center text-sm text-text-2">{sf.taxRate > 0 ? `${sf.taxRate}%` : "—"}</td>
                <td className="p-3 text-center">
                  {sf.isDefault ? (
                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Yes</span>
                  ) : (
                    <span className="text-xs text-text-4">No</span>
                  )}
                </td>
                <td className="p-3 text-center">
                  <button onClick={() => toggleActive(sf.id)} className="inline-flex items-center gap-1">
                    {sf.active ? (
                      <ToggleRight size={20} className="text-green-600" />
                    ) : (
                      <ToggleLeft size={20} className="text-text-4" />
                    )}
                    <span className={`text-xs font-medium ${sf.active ? "text-green-600" : "text-text-4"}`}>
                      {sf.active ? "Active" : "Inactive"}
                    </span>
                  </button>
                </td>
                <td className="p-3 text-right">
                  <Link
                    href={`/admin/storefronts/${sf.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue bg-blue/5 hover:bg-blue/10 rounded-lg transition-colors"
                  >
                    <Edit2 size={12} /> Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
