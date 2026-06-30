"use client";

import { useState } from "react";
import {
  Building2, Globe, Star, Shield, Plus, Search, ChevronDown,
  ChevronLeft, ChevronRight, CheckCircle, XCircle, AlertTriangle,
  Ban, Eye, Filter, DollarSign, Package, Loader2, MoreHorizontal,
  FileText, TrendingUp,
} from "lucide-react";
import AdminShell from "@/components/admin/admin-shell";

const countryFlags: Record<string, string> = {
  "China": "🇨🇳", "India": "🇮🇳", "Nigeria": "🇳🇬", "USA": "🇺🇸",
  "UK": "🇬🇧", "Germany": "🇩🇪", "UAE": "🇦🇪", "Ghana": "🇬🇭",
  "South Africa": "🇿🇦", "Japan": "🇯🇵", "Turkey": "🇹🇷", "Vietnam": "🇻🇳",
  "Bangladesh": "🇧🇩", "Brazil": "🇧🇷", "France": "🇫🇷",
};

const categories = [
  "Textiles & Apparel", "Electronics & Components", "Machinery & Industrial",
  "Automotive Parts", "Food & Beverage", "Pharmaceuticals",
  "Chemicals & Plastics", "Building Materials", "Furniture & Woodwork",
  "Metals & Alloys", "Ceramics & Glass", "Footwear & Leather",
];

interface Manufacturer {
  id: string;
  name: string;
  country: string;
  category: string;
  verified: boolean;
  status: "active" | "pending" | "suspended" | "rejected";
  rating: number;
  orders: number;
  revenue: number;
  joinDate: string;
  contactPerson: string;
  contactEmail: string;
  certifications: string[];
}

const seedManufacturers: Manufacturer[] = [
  { id: "m1", name: "Shenzhen Electronics Co", country: "China", category: "Electronics & Components", verified: true, status: "active", rating: 4.8, orders: 342, revenue: 45200000, joinDate: "2024-03-15", contactPerson: "Li Wei", contactEmail: "liwei@sz-electronics.cn", certifications: ["ISO 9001", "CE", "RoHS"] },
  { id: "m2", name: "Tiruppur Textiles Ltd", country: "India", category: "Textiles & Apparel", verified: true, status: "active", rating: 4.6, orders: 218, revenue: 28900000, joinDate: "2024-06-22", contactPerson: "Priya Sharma", contactEmail: "priya@tiruppur-textiles.in", certifications: ["ISO 9001", "OEKO-TEX"] },
  { id: "m3", name: "Lagos Industrial Corp", country: "Nigeria", category: "Machinery & Industrial", verified: false, status: "pending", rating: 0, orders: 0, revenue: 0, joinDate: "2026-06-10", contactPerson: "Chidi Okonkwo", contactEmail: "chidi@lagosindustrial.ng", certifications: [] },
  { id: "m4", name: "Istanbul Ceramics GmbH", country: "Germany", category: "Ceramics & Glass", verified: true, status: "active", rating: 4.9, orders: 156, revenue: 37500000, joinDate: "2024-01-08", contactPerson: "Hans Mueller", contactEmail: "hans@istanbulceramics.de", certifications: ["ISO 9001", "TÜV", "DIN"] },
  { id: "m5", name: "Guangzhou Plastics Ltd", country: "China", category: "Chemicals & Plastics", verified: true, status: "active", rating: 4.3, orders: 89, revenue: 12800000, joinDate: "2025-02-14", contactPerson: "Zhang Mei", contactEmail: "mei@gzplastics.cn", certifications: ["ISO 9001", "RoHS"] },
  { id: "m6", name: "Dhaka Garments Corp", country: "Bangladesh", category: "Textiles & Apparel", verified: false, status: "pending", rating: 0, orders: 0, revenue: 0, joinDate: "2026-06-15", contactPerson: "Rashid Ahmed", contactEmail: "rashid@dhakagarments.bd", certifications: [] },
  { id: "m7", name: "Ho Chi Minh Footwear", country: "Vietnam", category: "Footwear & Leather", verified: true, status: "active", rating: 4.5, orders: 167, revenue: 23500000, joinDate: "2024-09-01", contactPerson: "Nguyen Van", contactEmail: "nguyen@hcmfootwear.vn", certifications: ["ISO 9001", "BSCI"] },
  { id: "m8", name: "Mumbai Pharma Industries", country: "India", category: "Pharmaceuticals", verified: true, status: "active", rating: 4.7, orders: 94, revenue: 18900000, joinDate: "2024-11-20", contactPerson: "Amit Patel", contactEmail: "amit@mumbaipharma.in", certifications: ["GMP", "WHO-GMP", "ISO 9001"] },
  { id: "m9", name: "Johannesburg Steel Mills", country: "South Africa", category: "Metals & Alloys", verified: true, status: "suspended", rating: 3.2, orders: 45, revenue: 8500000, joinDate: "2025-05-10", contactPerson: "Thabo Nkosi", contactEmail: "thabo@jhbsteel.co.za", certifications: ["ISO 9001", "SABS"] },
  { id: "m10", name: "Tokyo Components Inc", country: "Japan", category: "Electronics & Components", verified: true, status: "active", rating: 4.9, orders: 78, revenue: 15200000, joinDate: "2025-01-05", contactPerson: "Yuki Tanaka", contactEmail: "yuki@tokyocomponents.jp", certifications: ["JIS", "ISO 9001"] },
  { id: "m11", name: "Milan Fashion House SRL", country: "France", category: "Textiles & Apparel", verified: true, status: "active", rating: 4.4, orders: 52, revenue: 9500000, joinDate: "2025-08-12", contactPerson: "Marco Rossi", contactEmail: "marco@milanfashion.it", certifications: ["ISO 9001", "OEKO-TEX"] },
  { id: "m12", name: "Sao Paulo Agro Export", country: "Brazil", category: "Food & Beverage", verified: false, status: "rejected", rating: 3.1, orders: 12, revenue: 2100000, joinDate: "2025-12-01", contactPerson: "Ana Silva", contactEmail: "ana@spagroexport.br", certifications: ["MAPA"] },
];

const statusColors: Record<string, string> = {
  active: "bg-green-50 text-green-700 border-green-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  suspended: "bg-red-50 text-red-700 border-red-200",
  rejected: "bg-gray-100 text-gray-600 border-gray-200",
};

const statusIcons: Record<string, typeof CheckCircle> = {
  active: CheckCircle, pending: AlertTriangle, suspended: Ban, rejected: XCircle,
};

const formatCurrency = (val: number) => `₦${(val / 1000000).toFixed(1)}M`;

export default function AdminManufacturersPage() {
  const [manufacturers] = useState<Manufacturer[]>(seedManufacturers);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);

  const filtered = manufacturers.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.contactPerson.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === "all" || m.status === statusFilter;
    const matchCategory = categoryFilter === "all" || m.category === categoryFilter;
    const matchCountry = countryFilter === "all" || m.country === countryFilter;
    return matchSearch && matchStatus && matchCategory && matchCountry;
  });

  const stats = {
    total: manufacturers.length,
    byCountry: new Set(manufacturers.map((m) => m.country)).size,
    byCategory: new Set(manufacturers.map((m) => m.category)).size,
    pendingVerifications: manufacturers.filter((m) => m.status === "pending").length,
    activeEscrow: manufacturers.filter((m) => m.status === "active").reduce((s, m) => s + m.revenue, 0),
    transactionsMonth: manufacturers.reduce((s, m) => s + m.orders, 0),
    disputes: 3,
  };

  const toggleRow = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  return (
    <AdminShell title="Manufacturers" subtitle="Global manufacturer directory & management">
      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Manufacturers", value: String(stats.total), icon: Building2, color: "bg-blue-50 text-blue" },
          { label: "Countries", value: String(stats.byCountry), icon: Globe, color: "bg-purple-50 text-purple-700" },
          { label: "Pending Verifications", value: String(stats.pendingVerifications), icon: Shield, color: "bg-amber-50 text-amber-700" },
          { label: "Active Escrow Value", value: formatCurrency(stats.activeEscrow), icon: DollarSign, color: "bg-green-50 text-green-700" },
          { label: "Categories", value: String(stats.byCategory), icon: Package, color: "bg-orange-50 text-orange" },
          { label: "Total Orders", value: String(stats.transactionsMonth), icon: TrendingUp, color: "bg-teal-50 text-teal-700" },
          { label: "Open Disputes", value: String(stats.disputes), icon: AlertTriangle, color: "bg-red-50 text-red" },
          { label: "Avg Rating", value: (manufacturers.filter((m) => m.rating > 0).reduce((s, m) => s + m.rating, 0) / manufacturers.filter((m) => m.rating > 0).length).toFixed(1), icon: Star, color: "bg-yellow-50 text-yellow-700" },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-500 font-medium">{kpi.label}</p>
                <div className={`w-8 h-8 rounded-lg ${kpi.color} flex items-center justify-center`}>
                  <Icon size={16} />
                </div>
              </div>
              <p className="font-bold text-xl text-gray-900">{kpi.value}</p>
            </div>
          );
        })}
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search manufacturers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
            />
          </div>
          <div className="relative">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-9 pr-8 py-2 border border-gray-200 rounded-lg text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
              <option value="rejected">Rejected</option>
            </select>
            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20"
            >
              <option value="all">All Countries</option>
              {Object.keys(countryFlags).map((c) => <option key={c} value={c}>{countryFlags[c]} {c}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
        {selectedRows.length > 0 && (
          <div className="mt-3 flex items-center gap-3 pt-3 border-t border-gray-100">
            <span className="text-xs text-gray-500">{selectedRows.length} selected</span>
            <div className="relative">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#0A1628] text-white hover:bg-[#0A1628]/90">
                Bulk Actions <ChevronDown size={12} />
              </button>
            </div>
            <button
              onClick={() => setSelectedRows([])}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Clear selection
            </button>
          </div>
        )}
      </div>

      {/* Manufacturers Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === filtered.length && filtered.length > 0}
                    onChange={(e) => setSelectedRows(e.target.checked ? filtered.map((m) => m.id) : [])}
                    className="w-4 h-4 rounded border-gray-300 text-[#FF6B00] focus:ring-[#FF6B00]"
                  />
                </th>
                <th className="text-left text-[11px] text-gray-500 font-semibold uppercase tracking-wider px-4 py-3">Manufacturer</th>
                <th className="text-left text-[11px] text-gray-500 font-semibold uppercase tracking-wider px-4 py-3">Country</th>
                <th className="text-left text-[11px] text-gray-500 font-semibold uppercase tracking-wider px-4 py-3">Category</th>
                <th className="text-left text-[11px] text-gray-500 font-semibold uppercase tracking-wider px-4 py-3">Verification</th>
                <th className="text-left text-[11px] text-gray-500 font-semibold uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-left text-[11px] text-gray-500 font-semibold uppercase tracking-wider px-4 py-3">Rating</th>
                <th className="text-left text-[11px] text-gray-500 font-semibold uppercase tracking-wider px-4 py-3">Orders</th>
                <th className="text-right text-[11px] text-gray-500 font-semibold uppercase tracking-wider px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => {
                const StatusIcon = statusIcons[m.status] || CheckCircle;
                return (
                  <tr key={m.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(m.id)}
                        onChange={() => toggleRow(m.id)}
                        className="w-4 h-4 rounded border-gray-300 text-[#FF6B00] focus:ring-[#FF6B00]"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{m.name}</p>
                        <p className="text-[10px] text-gray-500">{m.contactPerson} · {m.contactEmail}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg">{countryFlags[m.country] || "🌍"}</span>
                        <span className="text-xs text-gray-600">{m.country}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-600">{m.category}</span>
                    </td>
                    <td className="px-4 py-3">
                      {m.verified ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-50 text-green-700 border border-green-200">
                          <Shield size={10} /> Verified
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-400">Unverified</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusColors[m.status]}`}>
                        <StatusIcon size={10} /> {m.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {m.rating > 0 ? (
                          <>
                            <Star size={12} className="text-yellow-500 fill-yellow-500" />
                            <span className="text-xs font-medium text-gray-700">{m.rating}</span>
                          </>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium text-gray-700">{m.orders}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="relative inline-block">
                        <button
                          onClick={() => setOpenActionMenu(openActionMenu === m.id ? null : m.id)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                        >
                          <MoreHorizontal size={16} />
                        </button>
                        {openActionMenu === m.id && (
                          <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-10 py-1">
                            <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50">
                              <Eye size={13} /> View Details
                            </button>
                            {m.status === "pending" && (
                              <>
                                <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-green-700 hover:bg-green-50">
                                  <CheckCircle size={13} /> Approve
                                </button>
                                <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50">
                                  <XCircle size={13} /> Reject
                                </button>
                              </>
                            )}
                            {m.status === "active" && (
                              <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-amber-700 hover:bg-amber-50">
                                <Ban size={13} /> Suspend
                              </button>
                            )}
                            <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50">
                              <FileText size={13} /> View Orders
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-700 mb-1">No manufacturers found</h3>
            <p className="text-sm text-gray-500">Try adjusting your filters</p>
          </div>
        )}

        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/30">
          <p className="text-xs text-gray-500">Showing {filtered.length} of {manufacturers.length} manufacturers</p>
          <div className="flex items-center gap-1">
            <button className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors">
              <ChevronLeft size={14} className="text-gray-400" />
            </button>
            <button className="w-7 h-7 bg-[#0A1628] text-white rounded-lg text-xs font-medium">1</button>
            <button className="w-7 h-7 hover:bg-gray-200 rounded-lg text-xs text-gray-600 font-medium">2</button>
            <button className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors">
              <ChevronRight size={14} className="text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
