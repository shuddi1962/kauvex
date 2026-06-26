"use client";

import { useState, useEffect } from "react";
import {
  History,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  Package,
  MapPin,
  Clock,
  CheckCircle,
  Truck,
  AlertCircle,
  ArrowUpDown,
  RefreshCw,
  Filter,
  X,
} from "lucide-react";

interface ShipmentRecord {
  id: string;
  waybill: string;
  date: string;
  origin: string;
  destination: string;
  status: "delivered" | "in_transit" | "processing" | "failed" | "returned";
  service: string;
  amount: number;
  weight: string;
  carrier: string;
}

export default function ExpressHistoryPage() {
  const [records, setRecords] = useState<ShipmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: "", end: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<"date" | "amount">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [showFilters, setShowFilters] = useState(false);
  const perPage = 10;

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/express/history", { method: "POST" });
      const data = await res.json();
      setRecords(data.records || []);
    } catch {
      setRecords(getMockData());
    } finally {
      setLoading(false);
    }
  };

  const getMockData = (): ShipmentRecord[] => [
    { id: "1", waybill: "KVE-2026-000001", date: "2026-06-26", origin: "Lagos, NG", destination: "London, UK", status: "in_transit", service: "Express International", amount: 42.5, weight: "2.3 kg", carrier: "DHL Express" },
    { id: "2", waybill: "KVE-2026-000002", date: "2026-06-25", origin: "Lagos, NG", destination: "Dubai, AE", status: "delivered", service: "Express Priority", amount: 38.0, weight: "1.1 kg", carrier: "Aramex" },
    { id: "3", waybill: "KVE-2026-000003", date: "2026-06-24", origin: "Abuja, NG", destination: "Accra, GH", status: "delivered", service: "Express Standard", amount: 15.75, weight: "0.8 kg", carrier: "GIG Logistics" },
    { id: "4", waybill: "KVE-2026-000004", date: "2026-06-23", origin: "Lagos, NG", destination: "New York, US", status: "in_transit", service: "Express International", amount: 55.0, weight: "4.5 kg", carrier: "FedEx" },
    { id: "5", waybill: "KVE-2026-000005", date: "2026-06-22", origin: "Lagos, NG", destination: "Nairobi, KE", status: "processing", service: "Express Standard", amount: 22.3, weight: "1.7 kg", carrier: "Aramex" },
    { id: "6", waybill: "KVE-2026-000006", date: "2026-06-21", origin: "Port Harcourt, NG", destination: "Lagos, NG", status: "delivered", service: "Express Domestic", amount: 8.5, weight: "0.5 kg", carrier: "Kwik Delivery" },
    { id: "7", waybill: "KVE-2026-000007", date: "2026-06-20", origin: "Lagos, NG", destination: "Johannesburg, ZA", status: "delivered", service: "Express International", amount: 48.2, weight: "3.2 kg", carrier: "DHL Express" },
    { id: "8", waybill: "KVE-2026-000008", date: "2026-06-19", origin: "Lagos, NG", destination: "London, UK", status: "returned", service: "Express International", amount: 42.5, weight: "1.9 kg", carrier: "DHL Express" },
    { id: "9", waybill: "KVE-2026-000009", date: "2026-06-18", origin: "Abuja, NG", destination: "Kano, NG", status: "delivered", service: "Express Domestic", amount: 6.0, weight: "0.3 kg", carrier: "GIG Logistics" },
    { id: "10", waybill: "KVE-2026-000010", date: "2026-06-17", origin: "Lagos, NG", destination: "Sao Paulo, BR", status: "failed", service: "Express International", amount: 65.0, weight: "5.0 kg", carrier: "DHL Express" },
    { id: "11", waybill: "KVE-2026-000011", date: "2026-06-16", origin: "Lagos, NG", destination: "Paris, FR", status: "delivered", service: "Express International", amount: 39.8, weight: "2.0 kg", carrier: "FedEx" },
    { id: "12", waybill: "KVE-2026-000012", date: "2026-06-15", origin: "Lagos, NG", destination: "Lekki, NG", status: "delivered", service: "Express Same Day", amount: 4.5, weight: "0.2 kg", carrier: "Kwik Delivery" },
  ];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "delivered":
        return { label: "Delivered", color: "text-emerald-400", bg: "bg-emerald-500/20", border: "border-emerald-500/30", icon: <CheckCircle size={12} /> };
      case "in_transit":
        return { label: "In Transit", color: "text-blue-400", bg: "bg-blue-500/20", border: "border-blue-500/30", icon: <Truck size={12} /> };
      case "processing":
        return { label: "Processing", color: "text-amber-400", bg: "bg-amber-500/20", border: "border-amber-500/30", icon: <Clock size={12} /> };
      case "failed":
        return { label: "Failed", color: "text-red-400", bg: "bg-red-500/20", border: "border-red-500/30", icon: <AlertCircle size={12} /> };
      case "returned":
        return { label: "Returned", color: "text-orange-400", bg: "bg-orange-500/20", border: "border-orange-500/30", icon: <Package size={12} /> };
      default:
        return { label: status, color: "text-white/50", bg: "bg-white/10", border: "border-white/20", icon: null };
    }
  };

  const filtered = records
    .filter((r) => {
      const matchSearch =
        r.waybill.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.destination.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === "all" || r.status === statusFilter;
      const matchDate =
        (!dateRange.start || r.date >= dateRange.start) &&
        (!dateRange.end || r.date <= dateRange.end);
      return matchSearch && matchStatus && matchDate;
    })
    .sort((a, b) => {
      const multiplier = sortDir === "asc" ? 1 : -1;
      if (sortField === "date") return multiplier * a.date.localeCompare(b.date);
      return multiplier * (a.amount - b.amount);
    });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const toggleSort = (field: "date" | "amount") => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const exportCSV = () => {
    const headers = ["Waybill", "Date", "Origin", "Destination", "Status", "Service", "Amount", "Carrier", "Weight"];
    const rows = filtered.map((r) => [
      r.waybill,
      r.date,
      r.origin,
      r.destination,
      r.status,
      r.service,
      `$${r.amount.toFixed(2)}`,
      r.carrier,
      r.weight,
    ]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `express-history-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const statusFilters = ["all", "delivered", "in_transit", "processing", "failed", "returned"];

  const statusLabels: Record<string, string> = {
    all: "All",
    delivered: "Delivered",
    in_transit: "In Transit",
    processing: "Processing",
    failed: "Failed",
    returned: "Returned",
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0A1628" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin" />
          <p className="text-white/60 text-sm">Loading shipment history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0A1628" }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#FF6B00]/10 flex items-center justify-center">
                <History className="text-[#FF6B00]" size={22} />
              </div>
              <h1 className="text-2xl font-bold text-white">Shipment History</h1>
            </div>
            <p className="text-white/50 text-sm">
              {filtered.length} shipment{filtered.length !== 1 ? "s" : ""} found
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchHistory}
              className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white/70 hover:bg-white/10 transition-colors text-sm"
            >
              <RefreshCw size={14} /> Refresh
            </button>
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-[#FF6B00] hover:bg-[#FF6B00]/80 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Download size={14} /> Export CSV
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="Search by waybill, origin, or destination..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              showFilters
                ? "bg-[#FF6B00] text-white"
                : "bg-white/5 border border-white/10 text-white/50 hover:bg-white/10"
            }`}
          >
            <Filter size={14} /> Filters
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="text-white/40 text-xs block mb-1.5">Date Range</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => {
                      setDateRange({ ...dateRange, start: e.target.value });
                      setCurrentPage(1);
                    }}
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                  <span className="text-white/30 self-center text-sm">to</span>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => {
                      setDateRange({ ...dateRange, end: e.target.value });
                      setCurrentPage(1);
                    }}
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>
              </div>
              <div className="sm:w-48">
                <label className="text-white/40 text-xs block mb-1.5">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                >
                  {statusFilters.map((s) => (
                    <option key={s} value={s}>
                      {statusLabels[s]}
                    </option>
                  ))}
                </select>
              </div>
              {(dateRange.start || dateRange.end || statusFilter !== "all") && (
                <button
                  onClick={() => {
                    setDateRange({ start: "", end: "" });
                    setStatusFilter("all");
                    setCurrentPage(1);
                  }}
                  className="self-end flex items-center gap-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white/50 text-sm hover:bg-white/10"
                >
                  <X size={12} /> Clear
                </button>
              )}
            </div>
          </div>
        )}

        {/* Status Filter Pills */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {statusFilters.map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatusFilter(s);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === s
                  ? "bg-[#FF6B00] text-white"
                  : "bg-white/5 text-white/50 hover:bg-white/10 border border-white/10"
              }`}
            >
              {statusLabels[s]}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-white/40 font-medium py-3 px-4">Waybill</th>
                  <th
                    className="text-left text-white/40 font-medium py-3 px-4 cursor-pointer hover:text-white/60 select-none"
                    onClick={() => toggleSort("date")}
                  >
                    <span className="flex items-center gap-1">
                      Date
                      <ArrowUpDown size={12} />
                    </span>
                  </th>
                  <th className="text-left text-white/40 font-medium py-3 px-4">Origin</th>
                  <th className="text-left text-white/40 font-medium py-3 px-4">Destination</th>
                  <th className="text-left text-white/40 font-medium py-3 px-4">Status</th>
                  <th className="text-left text-white/40 font-medium py-3 px-4">Service</th>
                  <th
                    className="text-right text-white/40 font-medium py-3 px-4 cursor-pointer hover:text-white/60 select-none"
                    onClick={() => toggleSort("amount")}
                  >
                    <span className="flex items-center justify-end gap-1">
                      Amount
                      <ArrowUpDown size={12} />
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((record) => {
                  const statusCfg = getStatusConfig(record.status);
                  return (
                    <tr key={record.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono text-xs bg-white/5 px-2 py-1 rounded text-white/80">
                          {record.waybill}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-white/70">
                        {new Date(record.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="py-3 px-4 text-white/60">{record.origin}</td>
                      <td className="py-3 px-4 text-white/60">{record.destination}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${statusCfg.bg} ${statusCfg.color} border ${statusCfg.border}`}>
                          {statusCfg.icon}
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-white/50 text-xs">{record.service}</td>
                      <td className="py-3 px-4 text-white font-semibold text-right">${record.amount.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-white/5">
            {paginated.map((record) => {
              const statusCfg = getStatusConfig(record.status);
              return (
                <div key={record.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs bg-white/5 px-2 py-1 rounded text-white/80">{record.waybill}</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${statusCfg.bg} ${statusCfg.color} border ${statusCfg.border}`}>
                      {statusCfg.icon}
                      {statusCfg.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/60 mb-1">
                    <MapPin size={12} className="text-white/30" />
                    {record.origin} → {record.destination}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/40">
                      {new Date(record.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} &bull; {record.service}
                    </span>
                    <span className="text-white font-semibold">${record.amount.toFixed(2)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {paginated.length === 0 && (
            <div className="text-center py-16">
              <Package size={48} className="text-white/20 mx-auto mb-4" />
              <h3 className="text-white text-lg font-semibold mb-2">No Shipments Found</h3>
              <p className="text-white/50 text-sm">Try adjusting your search or filters.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-white/40 text-sm">
              Showing {(currentPage - 1) * perPage + 1} to {Math.min(currentPage * perPage, filtered.length)} of{" "}
              {filtered.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 bg-white/5 border border-white/10 rounded-lg text-white/50 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let page: number;
                if (totalPages <= 5) {
                  page = i + 1;
                } else if (currentPage <= 3) {
                  page = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  page = totalPages - 4 + i;
                } else {
                  page = currentPage - 2 + i;
                }
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === page
                        ? "bg-[#FF6B00] text-white"
                        : "bg-white/5 border border-white/10 text-white/50 hover:bg-white/10"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 bg-white/5 border border-white/10 rounded-lg text-white/50 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
