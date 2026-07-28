"use client";

import { useEffect, useState } from "react";
import { Search, Eye, ChevronLeft, ChevronRight, DollarSign, Package, Star, AlertTriangle } from "lucide-react";

interface DigitalTwin {
  id: string;
  assetName: string;
  assetType: string;
  manufacturer: string | null;
  model: string | null;
  serialNumber: string | null;
  currentCondition: string;
  isForSale: boolean;
  askingPrice: number | null;
  purchasePrice: number | null;
  currencyCode: string;
  createdAt: string;
  installer?: { companyName: string | null } | null;
  _count?: { maintenanceSched: number };
}

export default function DigitalTwinsPage() {
  const [twins, setTwins] = useState<DigitalTwin[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTwins = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("query", search);
    params.set("page", String(page));
    params.set("limit", "15");

    fetch(`/api/v1/kpn/digital-twins?${params.toString()}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setTwins(res.data.data || res.data || []);
          setTotalPages(res.data.totalPages || 1);
        }
      })
      .catch(() => setTwins([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTwins(); }, [page]);

  useEffect(() => {
    const timer = setTimeout(() => { if (page !== 1) setPage(1); else fetchTwins(); }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const stats = {
    total: twins.length,
    forSale: twins.filter((t) => t.isForSale).length,
    avgCondition: twins.length > 0
      ? (() => {
          const scores: Record<string, number> = { excellent: 5, good: 4, fair: 3, poor: 2 };
          const avg = twins.reduce((a, t) => a + (scores[t.currentCondition] || 3), 0) / twins.length;
          return avg.toFixed(1);
        })()
      : "—",
  };

  const conditionBadge = (condition: string) => {
    const styles: Record<string, string> = {
      excellent: "bg-green-50 text-green-700",
      good: "bg-blue-50 text-blue-700",
      fair: "bg-amber-50 text-amber-700",
      poor: "bg-red-50 text-red-700",
    };
    return <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${styles[condition] || "bg-gray-50 text-gray-600"}`}>{condition}</span>;
  };

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Package size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-kauvex-navy">{stats.total}</p>
              <p className="text-xs text-gray-500">Total Digital Twins</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <DollarSign size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-kauvex-navy">{stats.forSale}</p>
              <p className="text-xs text-gray-500">For Sale</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <Star size={18} className="text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-kauvex-navy">{stats.avgCondition}</p>
              <p className="text-xs text-gray-500">Average Condition</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by asset name, manufacturer..."
            className="w-full h-10 pl-9 pr-4 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-kauvex-orange"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Asset</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Manufacturer</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Condition</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">For Sale</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Installer</th>
                <th className="text-right px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-4 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse w-16" /></td>
                    ))}
                  </tr>
                ))
              ) : twins.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400 text-sm">
                    <Package size={32} className="mx-auto text-gray-300 mb-2" />
                    No digital twins found
                  </td>
                </tr>
              ) : (
                twins.map((twin) => (
                  <tr key={twin.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-kauvex-navy text-sm">{twin.assetName}</p>
                      {twin.serialNumber && (
                        <p className="text-[11px] text-gray-400 font-mono">SN: {twin.serialNumber}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{twin.assetType}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {twin.manufacturer || "—"}
                      {twin.model && <span className="text-gray-400"> / {twin.model}</span>}
                    </td>
                    <td className="px-4 py-3">{conditionBadge(twin.currentCondition)}</td>
                    <td className="px-4 py-3">
                      {twin.isForSale ? (
                        <span className="flex items-center gap-1 text-sm font-medium text-green-600">
                          <DollarSign size={13} />
                          {twin.currencyCode} {twin.askingPrice?.toLocaleString() || "—"}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">Not listed</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {twin.installer?.companyName || "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-kauvex-navy" title="View details">
                          <Eye size={14} />
                        </button>
                        {twin.isForSale && (
                          <button className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600" title="Flag dispute">
                            <AlertTriangle size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <span className="text-xs text-gray-400">Page {page} of {totalPages}</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 hover:bg-gray-100 rounded-lg disabled:opacity-30">
              <ChevronLeft size={15} className="text-gray-500" />
            </button>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 hover:bg-gray-100 rounded-lg disabled:opacity-30">
              <ChevronRight size={15} className="text-gray-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
