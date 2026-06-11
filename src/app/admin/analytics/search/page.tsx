"use client";

import { useState, useMemo } from "react";
import AdminShell from "@/components/admin/admin-shell";
import { Search, ArrowUpDown, TrendingUp, XCircle, ShoppingCart, Filter } from "lucide-react";

interface SearchQuery {
  query: string;
  count: number;
  zeroResults: boolean;
  conversionRate: number;
  purchases: number;
  suggestedProduct?: string;
}

const SEED_DATA: SearchQuery[] = [
  { query: "hikvision camera", count: 1240, zeroResults: false, conversionRate: 8.2, purchases: 102 },
  { query: "yamaha outboard motor", count: 892, zeroResults: false, conversionRate: 6.5, purchases: 58 },
  { query: "fire alarm system", count: 756, zeroResults: false, conversionRate: 5.8, purchases: 44 },
  { query: "solar panel", count: 678, zeroResults: false, conversionRate: 7.1, purchases: 48 },
  { query: "life jacket", count: 567, zeroResults: false, conversionRate: 9.3, purchases: 53 },
  { query: "cctv camera", count: 534, zeroResults: false, conversionRate: 4.9, purchases: 26 },
  { query: "access control", count: 498, zeroResults: false, conversionRate: 12.4, purchases: 62 },
  { query: "marine battery", count: 445, zeroResults: false, conversionRate: 5.6, purchases: 25 },
  { query: "led floodlight", count: 423, zeroResults: false, conversionRate: 3.8, purchases: 16 },
  { query: "boat propeller", count: 389, zeroResults: false, conversionRate: 4.2, purchases: 16 },
  { query: "inverter", count: 356, zeroResults: false, conversionRate: 6.7, purchases: 24 },
  { query: "navigation light", count: 312, zeroResults: false, conversionRate: 5.1, purchases: 16 },
  { query: "gangway", count: 298, zeroResults: true, conversionRate: 0, purchases: 0, suggestedProduct: "Aluminium Gangway 4m" },
  { query: "bilge pump", count: 267, zeroResults: false, conversionRate: 7.8, purchases: 21 },
  { query: "fender", count: 234, zeroResults: true, conversionRate: 0, purchases: 0, suggestedProduct: "Marine Fender 50cm" },
  { query: "deep cycle battery", count: 221, zeroResults: false, conversionRate: 8.6, purchases: 19 },
  { query: "horn", count: 198, zeroResults: true, conversionRate: 0, purchases: 0, suggestedProduct: "Marine Horn 12V" },
  { query: "anchor chain", count: 187, zeroResults: false, conversionRate: 4.3, purchases: 8 },
  { query: "winch", count: 165, zeroResults: false, conversionRate: 3.6, purchases: 6 },
  { query: "varnish", count: 142, zeroResults: true, conversionRate: 0, purchases: 0, suggestedProduct: "Marine Varnish 1L" },
  { query: "gps tracker", count: 134, zeroResults: false, conversionRate: 5.9, purchases: 8 },
  { query: "radar", count: 123, zeroResults: false, conversionRate: 4.1, purchases: 5 },
  { query: "searchlight", count: 98, zeroResults: true, conversionRate: 0, purchases: 0, suggestedProduct: "LED Searchlight 12V" },
  { query: "boat seat", count: 87, zeroResults: false, conversionRate: 6.9, purchases: 6 },
  { query: "epoxy paint", count: 76, zeroResults: true, conversionRate: 0, purchases: 0, suggestedProduct: "Marine Epoxy Paint 5L" },
];

export default function SearchAnalyticsPage() {
  const [period, setPeriod] = useState<"week" | "month">("month");
  const [searchFilter, setSearchFilter] = useState("");
  const [sortField, setSortField] = useState<keyof SearchQuery>("count");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [filterZeroResults, setFilterZeroResults] = useState(false);

  const filtered = useMemo(() => {
    let data = [...SEED_DATA];
    if (searchFilter) {
      data = data.filter((s) => s.query.toLowerCase().includes(searchFilter.toLowerCase()));
    }
    if (filterZeroResults) {
      data = data.filter((s) => s.zeroResults);
    }
    data.sort((a, b) => {
      const aVal = a[sortField] as number;
      const bVal = b[sortField] as number;
      return sortDir === "desc" ? bVal - aVal : aVal - bVal;
    });
    return data;
  }, [searchFilter, sortField, sortDir, filterZeroResults]);

  const toggleSort = (field: keyof SearchQuery) => {
    if (sortField === field) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const totalSearches = SEED_DATA.reduce((sum, s) => sum + s.count, 0);
  const zeroResultCount = SEED_DATA.filter((s) => s.zeroResults).length;
  const avgConversion = SEED_DATA.filter((s) => !s.zeroResults).reduce((sum, s) => sum + s.conversionRate, 0) / SEED_DATA.filter((s) => !s.zeroResults).length;

  return (
    <AdminShell title="Search Analytics" subtitle="Track what customers are searching for">
      <div className="space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <Search size={14} className="text-blue" />
              <span className="text-[10px] text-text-4 uppercase font-semibold">Total Searches</span>
            </div>
            <p className="text-2xl font-bold text-text-1">{totalSearches.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <XCircle size={14} className="text-red" />
              <span className="text-[10px] text-text-4 uppercase font-semibold">Zero-Result Queries</span>
            </div>
            <p className="text-2xl font-bold text-text-1">{zeroResultCount}</p>
            <p className="text-[10px] text-text-4 mt-0.5">Consider adding these products</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={14} className="text-green-600" />
              <span className="text-[10px] text-text-4 uppercase font-semibold">Avg. Conversion</span>
            </div>
            <p className="text-2xl font-bold text-text-1">{avgConversion.toFixed(1)}%</p>
            <p className="text-[10px] text-text-4 mt-0.5">Search → Purchase</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {[{ key: "week", label: "This Week" }, { key: "month", label: "This Month" }].map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key as "week" | "month")}
                className={`px-3 py-1.5 text-xs rounded-md transition-colors ${period === p.key ? "bg-white text-text-1 font-medium shadow-sm" : "text-text-4 hover:text-text-2"}`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
            <input
              type="text"
              placeholder="Filter queries..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-sm rounded-lg bg-white border border-gray-200 focus:outline-none focus:border-blue"
            />
          </div>
          <label className="flex items-center gap-2 text-xs text-text-3 cursor-pointer">
            <input type="checkbox" checked={filterZeroResults} onChange={(e) => setFilterZeroResults(e.target.checked)} className="rounded border-gray-300" />
            Zero-result only
          </label>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-3 text-left text-xs font-semibold text-text-4 uppercase">#</th>
                  <th className="p-3 text-left text-xs font-semibold text-text-4 uppercase cursor-pointer select-none" onClick={() => toggleSort("query")}>
                    <span className="flex items-center gap-1">Query <ArrowUpDown size={12} /></span>
                  </th>
                  <th className="p-3 text-right text-xs font-semibold text-text-4 uppercase cursor-pointer select-none" onClick={() => toggleSort("count")}>
                    <span className="flex items-center gap-1 justify-end">Searches <ArrowUpDown size={12} /></span>
                  </th>
                  <th className="p-3 text-right text-xs font-semibold text-text-4 uppercase cursor-pointer select-none" onClick={() => toggleSort("purchases")}>
                    <span className="flex items-center gap-1 justify-end">Purchases <ArrowUpDown size={12} /></span>
                  </th>
                  <th className="p-3 text-right text-xs font-semibold text-text-4 uppercase cursor-pointer select-none" onClick={() => toggleSort("conversionRate")}>
                    <span className="flex items-center gap-1 justify-end">Conversion <ArrowUpDown size={12} /></span>
                  </th>
                  <th className="p-3 text-left text-xs font-semibold text-text-4 uppercase">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <tr key={row.query} className={`border-b border-gray-50 hover:bg-gray-50/50 ${row.zeroResults ? "bg-red-50/30" : ""}`}>
                    <td className="p-3 text-xs text-text-4">{i + 1}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-text-1">{row.query}</span>
                        {row.zeroResults && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-red-100 text-red uppercase">No results</span>
                        )}
                      </div>
                      {row.suggestedProduct && (
                        <p className="text-[10px] text-text-4 mt-0.5">Suggest: {row.suggestedProduct}</p>
                      )}
                    </td>
                    <td className="p-3 text-right text-sm font-medium text-text-1">{row.count.toLocaleString()}</td>
                    <td className="p-3 text-right text-sm text-text-2">{row.purchases > 0 ? row.purchases.toLocaleString() : "—"}</td>
                    <td className="p-3 text-right">
                      {row.zeroResults ? (
                        <span className="text-xs text-text-4">—</span>
                      ) : (
                        <span className="text-sm font-semibold text-green-600">{row.conversionRate}%</span>
                      )}
                    </td>
                    <td className="p-3">
                      {row.zeroResults ? (
                        <button className="text-xs text-blue hover:text-blue-600 font-medium flex items-center gap-1">
                          <ShoppingCart size={12} /> Add Product
                        </button>
                      ) : (
                        <span className="text-xs text-text-4">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-3 border-t border-gray-100 text-xs text-text-4 text-center">
            Showing {filtered.length} of {SEED_DATA.length} search queries
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
