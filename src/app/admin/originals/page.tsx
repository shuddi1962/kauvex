"use client";

import { useState, useEffect } from "react";
import {
  Package, TrendingUp, DollarSign, BarChart3,
  Search, Plus, CheckCircle2, XCircle, ExternalLink,
  Loader2, Filter, ArrowUpDown,
} from "lucide-react";

interface Original {
  id: string;
  status: string;
  originalCost: number;
  retailPrice: number;
  marginPercent: number;
  monthlySales: number | null;
  launchedAt: string | null;
  product: { id: string; name: string; slug: string; images: string[] } | null;
  manufacturer: { id: string; companyName: string; slug: string; countryCode: string; verificationTier: string } | null;
}

interface Stats {
  candidates: number;
  active: number;
  discontinued: number;
  totalRevenue: number;
  avgMargin: number;
}

const DEMO_ORIGINALS: Original[] = [
  { id: "orig-1", status: "active", originalCost: 12.50, retailPrice: 34.99, marginPercent: 64.3, monthlySales: 1200, launchedAt: "2026-03-15", product: { id: "p1", name: "Premium Wireless Earbuds", slug: "premium-earbuds", images: [] }, manufacturer: { id: "m1", companyName: "Shenzhen TechParts Co.", slug: "shenzhen-techparts", countryCode: "CN", verificationTier: "factory_verified" } },
  { id: "orig-2", status: "active", originalCost: 3.20, retailPrice: 14.99, marginPercent: 78.7, monthlySales: 3500, launchedAt: "2026-01-20", product: { id: "p2", name: "USB-C Fast Charging Cable 2m", slug: "usb-c-cable", images: [] }, manufacturer: { id: "m2", companyName: "Dongguan CableWorks", slug: "dongguan-cableworks", countryCode: "CN", verificationTier: "gold" } },
  { id: "orig-3", status: "candidate", originalCost: 8.00, retailPrice: 29.99, marginPercent: 73.3, monthlySales: null, launchedAt: null, product: { id: "p3", name: "Eco-Friendly Phone Case", slug: "eco-phone-case", images: [] }, manufacturer: { id: "m3", companyName: "Aba Leather & Textiles", slug: "aba-leather", countryCode: "NG", verificationTier: "document_verified" } },
];

export default function AdminOriginalsPage() {
  const [originals, setOriginals] = useState<Original[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    // Use demo data for now
    setTimeout(() => {
      setOriginals(DEMO_ORIGINALS);
      setStats({
        candidates: 1,
        active: 2,
        discontinued: 0,
        totalRevenue: 65988,
        avgMargin: 71.5,
      });
      setLoading(false);
    }, 500);
  }, []);

  const filtered = originals.filter((o) => {
    if (filter !== "all" && o.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        o.product?.name.toLowerCase().includes(q) ||
        o.manufacturer?.companyName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const statusColor = (s: string) => {
    if (s === "active") return "bg-green-100 text-green-700";
    if (s === "candidate") return "bg-amber-100 text-amber-700";
    return "bg-gray-100 text-gray-500";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Kauvex Originals</h1>
          <p className="text-sm text-gray-500">Private-label sourcing pipeline — manage candidate products and active Originals</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#FF6B00] text-white rounded-lg text-sm font-semibold hover:bg-[#FF6B00]/90">
          <Plus size={16} /> Add Candidate
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Candidates", value: stats?.candidates ?? 0, icon: Package, color: "text-amber-500" },
          { label: "Active Originals", value: stats?.active ?? 0, icon: CheckCircle2, color: "text-green-500" },
          { label: "Discontinued", value: stats?.discontinued ?? 0, icon: XCircle, color: "text-gray-400" },
          { label: "Monthly Revenue", value: `$${(stats?.totalRevenue ?? 0).toLocaleString()}`, icon: DollarSign, color: "text-[#FF6B00]" },
          { label: "Avg Margin", value: `${(stats?.avgMargin ?? 0).toFixed(1)}%`, icon: TrendingUp, color: "text-blue-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <s.icon size={14} className={s.color} />
              <span className="text-[10px] text-gray-400 uppercase">{s.label}</span>
            </div>
            <p className="text-xl font-bold text-gray-900">{loading ? <Loader2 size={16} className="animate-spin" /> : s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products or manufacturers..."
              className="w-full h-9 pl-9 pr-3 text-sm border border-gray-200 rounded-lg"
            />
          </div>
          <div className="flex gap-1">
            {["all", "candidate", "active", "discontinued"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium ${
                  filter === f ? "bg-[#0A1628] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left py-3 px-4 text-[10px] text-gray-400 font-semibold uppercase">Product</th>
              <th className="text-left py-3 px-4 text-[10px] text-gray-400 font-semibold uppercase">Manufacturer</th>
              <th className="text-right py-3 px-4 text-[10px] text-gray-400 font-semibold uppercase">Cost</th>
              <th className="text-right py-3 px-4 text-[10px] text-gray-400 font-semibold uppercase">Retail</th>
              <th className="text-right py-3 px-4 text-[10px] text-gray-400 font-semibold uppercase">Margin</th>
              <th className="text-right py-3 px-4 text-[10px] text-gray-400 font-semibold uppercase">Monthly Sales</th>
              <th className="text-center py-3 px-4 text-[10px] text-gray-400 font-semibold uppercase">Status</th>
              <th className="text-center py-3 px-4 text-[10px] text-gray-400 font-semibold uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="py-12 text-center"><Loader2 size={20} className="animate-spin text-gray-400 mx-auto" /></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="py-12 text-center text-gray-400 text-sm">No Originals found</td></tr>
            ) : filtered.map((o) => (
              <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-3 px-4">
                  <p className="text-xs font-semibold text-gray-900">{o.product?.name ?? "—"}</p>
                  <p className="text-[10px] text-gray-400">{o.product?.slug}</p>
                </td>
                <td className="py-3 px-4">
                  <p className="text-xs font-medium">{o.manufacturer?.companyName ?? "—"}</p>
                  <p className="text-[10px] text-gray-400">{o.manufacturer?.countryCode} · {o.manufacturer?.verificationTier}</p>
                </td>
                <td className="py-3 px-4 text-right text-xs">${Number(o.originalCost).toFixed(2)}</td>
                <td className="py-3 px-4 text-right text-xs font-semibold">${Number(o.retailPrice).toFixed(2)}</td>
                <td className="py-3 px-4 text-right text-xs font-bold text-green-600">{Number(o.marginPercent).toFixed(1)}%</td>
                <td className="py-3 px-4 text-right text-xs">{o.monthlySales?.toLocaleString() ?? "—"}</td>
                <td className="py-3 px-4 text-center">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColor(o.status)}`}>
                    {o.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  {o.status === "candidate" ? (
                    <button className="text-[10px] text-green-600 font-semibold hover:underline">Activate</button>
                  ) : o.status === "active" ? (
                    <button className="text-[10px] text-amber-600 font-semibold hover:underline">Discontinue</button>
                  ) : (
                    <span className="text-[10px] text-gray-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
