"use client";

import { useState } from "react";
import {
  Building2, Search, ChevronDown, ChevronLeft, ChevronRight,
  CheckCircle, XCircle, AlertTriangle, Ban, Eye, MoreHorizontal,
  DollarSign, ShoppingCart, Users, Filter, Loader2,
} from "lucide-react";
import AdminShell from "@/components/admin/admin-shell";

interface WholesaleAccount {
  id: string;
  companyName: string;
  contactPerson: string;
  contactEmail: string;
  industry: string;
  status: "active" | "pending" | "suspended" | "rejected";
  creditLimit: string;
  outstanding: string;
  totalOrders: number;
  totalSpent: string;
  netTerms: string;
  joinDate: string;
}

const seedAccounts: WholesaleAccount[] = [
  { id: "ws-001", companyName: "Acme Enterprises Ltd", contactPerson: "John Adeyemi", contactEmail: "john@acme-ent.com", industry: "Electronics & Security", status: "active", creditLimit: "$50,000", outstanding: "$12,300", totalOrders: 47, totalSpent: "$128,450", netTerms: "NET 30", joinDate: "2025-08-15" },
  { id: "ws-002", companyName: "Global Imports GmbH", contactPerson: "Hans Mueller", contactEmail: "hans@global-imports.de", industry: "Industrial Equipment", status: "active", creditLimit: "$100,000", outstanding: "$28,500", totalOrders: 23, totalSpent: "$245,800", netTerms: "NET 30", joinDate: "2025-03-20" },
  { id: "ws-003", companyName: "Lagos Mega Stores", contactPerson: "Chidi Okonkwo", contactEmail: "chidi@lagosmega.ng", industry: "General Merchandise", status: "pending", creditLimit: "$25,000", outstanding: "$0", totalOrders: 0, totalSpent: "$0", netTerms: "Prepaid", joinDate: "2026-06-25" },
  { id: "ws-004", companyName: "Nairobi Tech Solutions", contactPerson: "Wanjiku Kamau", contactEmail: "wanjiku@nairobitech.co.ke", industry: "IT & Networking", status: "active", creditLimit: "$35,000", outstanding: "$8,200", totalOrders: 18, totalSpent: "$67,300", netTerms: "NET 30", joinDate: "2025-11-10" },
  { id: "ws-005", companyName: "Dubai Wholesale Trading", contactPerson: "Ahmed Al-Rashid", contactEmail: "ahmed@dww.ae", industry: "Construction Materials", status: "suspended", creditLimit: "$75,000", outstanding: "$42,000", totalOrders: 31, totalSpent: "$312,500", netTerms: "NET 60", joinDate: "2025-01-08" },
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

export default function AdminWholesalePage() {
  const [accounts] = useState<WholesaleAccount[]>(seedAccounts);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);

  const filtered = accounts.filter((a) => {
    const matchSearch = a.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.contactPerson.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: accounts.length,
    active: accounts.filter((a) => a.status === "active").length,
    pending: accounts.filter((a) => a.status === "pending").length,
    totalRevenue: accounts.reduce((s, a) => s + parseFloat(a.totalSpent.replace(/[$,]/g, "")), 0),
    totalOutstanding: accounts.reduce((s, a) => s + parseFloat(a.outstanding.replace(/[$,]/g, "")), 0),
  };

  return (
    <AdminShell title="Wholesale Accounts" subtitle="B2B wholesale account management">
      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Accounts", value: String(stats.total), icon: Building2, color: "bg-blue-50 text-blue" },
          { label: "Active Accounts", value: String(stats.active), icon: CheckCircle, color: "bg-green-50 text-green-700" },
          { label: "Pending Approval", value: String(stats.pending), icon: AlertTriangle, color: "bg-amber-50 text-amber-700" },
          { label: "Total Revenue", value: `$${(stats.totalRevenue / 1000).toFixed(0)}K`, icon: DollarSign, color: "bg-purple-50 text-purple-700" },
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
              placeholder="Search accounts..."
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
            </select>
            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === filtered.length && filtered.length > 0}
                    onChange={(e) => setSelectedRows(e.target.checked ? filtered.map((a) => a.id) : [])}
                    className="w-4 h-4 rounded border-gray-300 text-[#FF6B00] focus:ring-[#FF6B00]"
                  />
                </th>
                <th className="text-left text-[11px] text-gray-500 font-semibold uppercase tracking-wider px-4 py-3">Company</th>
                <th className="text-left text-[11px] text-gray-500 font-semibold uppercase tracking-wider px-4 py-3">Industry</th>
                <th className="text-left text-[11px] text-gray-500 font-semibold uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-left text-[11px] text-gray-500 font-semibold uppercase tracking-wider px-4 py-3">Credit Limit</th>
                <th className="text-left text-[11px] text-gray-500 font-semibold uppercase tracking-wider px-4 py-3">Outstanding</th>
                <th className="text-left text-[11px] text-gray-500 font-semibold uppercase tracking-wider px-4 py-3">Orders</th>
                <th className="text-left text-[11px] text-gray-500 font-semibold uppercase tracking-wider px-4 py-3">Terms</th>
                <th className="text-right text-[11px] text-gray-500 font-semibold uppercase tracking-wider px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => {
                const StatusIcon = statusIcons[a.status] || CheckCircle;
                return (
                  <tr key={a.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(a.id)}
                        onChange={() => setSelectedRows((prev) => prev.includes(a.id) ? prev.filter((r) => r !== a.id) : [...prev, a.id])}
                        className="w-4 h-4 rounded border-gray-300 text-[#FF6B00] focus:ring-[#FF6B00]"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{a.companyName}</p>
                        <p className="text-[10px] text-gray-500">{a.contactPerson} · {a.contactEmail}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">{a.industry}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusColors[a.status]}`}>
                        <StatusIcon size={10} /> {a.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-medium text-gray-900">{a.creditLimit}</td>
                    <td className="px-4 py-3 text-xs font-medium text-amber-600">{a.outstanding}</td>
                    <td className="px-4 py-3 text-xs text-gray-700">{a.totalOrders}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{a.netTerms}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="relative inline-block">
                        <button
                          onClick={() => setOpenActionMenu(openActionMenu === a.id ? null : a.id)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                        >
                          <MoreHorizontal size={16} />
                        </button>
                        {openActionMenu === a.id && (
                          <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-10 py-1">
                            <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50">
                              <Eye size={13} /> View Details
                            </button>
                            {a.status === "pending" && (
                              <>
                                <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-green-700 hover:bg-green-50">
                                  <CheckCircle size={13} /> Approve
                                </button>
                                <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50">
                                  <XCircle size={13} /> Reject
                                </button>
                              </>
                            )}
                            {a.status === "active" && (
                              <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-amber-700 hover:bg-amber-50">
                                <Ban size={13} /> Suspend
                              </button>
                            )}
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
            <h3 className="font-semibold text-gray-700 mb-1">No accounts found</h3>
            <p className="text-sm text-gray-500">Try adjusting your filters</p>
          </div>
        )}

        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/30">
          <p className="text-xs text-gray-500">Showing {filtered.length} of {accounts.length} accounts</p>
          <div className="flex items-center gap-1">
            <button className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"><ChevronLeft size={14} className="text-gray-400" /></button>
            <button className="w-7 h-7 bg-[#0A1628] text-white rounded-lg text-xs font-medium">1</button>
            <button className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"><ChevronRight size={14} className="text-gray-400" /></button>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
