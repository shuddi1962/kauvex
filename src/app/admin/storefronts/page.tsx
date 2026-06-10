"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/admin-shell";
import { Plus, Edit2, Globe, ExternalLink, ToggleLeft, ToggleRight, Search, X } from "lucide-react";
import { insforge } from "@/lib/insforge";

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

const flags: Record<string, string> = { US: "🇺🇸", GB: "🇬🇧", CA: "🇨🇦", AU: "🇦🇺", NG: "🇳🇬", DE: "🇩🇪" };

export default function AdminStorefrontsPage() {
  const [storefronts, setStorefronts] = useState<Storefront[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newSf, setNewSf] = useState({ name: "", slug: "", currencyCode: "USD", currencySymbol: "$", languageCode: "en", countryCode: "US", taxRate: 0 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadStorefronts();
  }, []);

  const loadStorefronts = async () => {
    const { data, error } = await insforge.database
      .from("storefronts")
      .select("*")
      .order("is_default", { ascending: false })
      .order("name");
    if (!error && data) {
      setStorefronts(data.map((s: any) => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        domainType: s.domain_type,
        activeDomain: s.active_domain,
        currencyCode: s.currency_code,
        currencySymbol: s.currency_symbol,
        languageCode: s.language_code,
        countryCode: s.country_code || "",
        taxRate: s.tax_rate,
        isDefault: s.is_default,
        active: s.status === "active",
        metaTitle: s.meta_title,
      })));
    }
  };

  const toggleActive = async (id: string) => {
    const sf = storefronts.find(s => s.id === id);
    if (!sf) return;
    const newStatus = sf.active ? "inactive" : "active";
    await insforge.database.from("storefronts").update({ status: newStatus }).eq("id", id);
    setStorefronts(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  const createStorefront = async () => {
    if (!newSf.name || !newSf.slug) return;
    setSaving(true);
    const domain = `${newSf.slug}.kauvex.com`;
    const { error } = await insforge.database.from("storefronts").insert([{
      name: newSf.name,
      slug: newSf.slug,
      domain_type: "subdomain",
      subdomain: newSf.slug,
      active_domain: domain,
      currency_code: newSf.currencyCode,
      currency_symbol: newSf.currencySymbol,
      language_code: newSf.languageCode,
      country_code: newSf.countryCode,
      tax_rate: newSf.taxRate,
      status: "active",
    }]);
    setSaving(false);
    if (!error) {
      setShowModal(false);
      setNewSf({ name: "", slug: "", currencyCode: "USD", currencySymbol: "$", languageCode: "en", countryCode: "US", taxRate: 0 });
      loadStorefronts();
    }
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
          <button onClick={() => setShowModal(true)} className="h-9 px-4 bg-blue text-white text-sm font-semibold rounded-lg hover:bg-blue-600 flex items-center gap-2">
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
      {/* Add Storefront Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-text-1">New Storefront</h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-text-2 block mb-1">Name *</label>
                <input value={newSf.name} onChange={e => setNewSf({ ...newSf, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") })} className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm" placeholder="e.g. France" />
              </div>
              <div>
                <label className="text-xs font-semibold text-text-2 block mb-1">Slug *</label>
                <input value={newSf.slug} onChange={e => setNewSf({ ...newSf, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "") })} className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm" placeholder="e.g. fr" />
                <p className="text-[10px] text-text-4 mt-1">Will become: <strong>{newSf.slug || "?"}.kauvex.com</strong></p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-text-2 block mb-1">Currency</label>
                  <select value={newSf.currencyCode} onChange={e => setNewSf({ ...newSf, currencyCode: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm bg-white">
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CAD">CAD (CA$)</option>
                    <option value="AUD">AUD (A$)</option>
                    <option value="NGN">NGN (₦)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-2 block mb-1">Country</label>
                  <select value={newSf.countryCode} onChange={e => setNewSf({ ...newSf, countryCode: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm bg-white">
                    <option value="US">United States</option>
                    <option value="GB">United Kingdom</option>
                    <option value="CA">Canada</option>
                    <option value="AU">Australia</option>
                    <option value="NG">Nigeria</option>
                    <option value="DE">Germany</option>
                    <option value="FR">France</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="h-10 px-5 text-sm font-medium text-text-3 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button onClick={createStorefront} disabled={saving || !newSf.name || !newSf.slug} className="h-10 px-5 bg-blue text-white text-sm font-semibold rounded-lg hover:bg-blue-600 disabled:opacity-50">
                  {saving ? "Creating..." : "Create Storefront"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
