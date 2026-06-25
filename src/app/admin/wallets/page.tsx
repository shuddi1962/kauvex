"use client";

import { useState, useEffect } from "react";
import AdminShell from "@/components/admin/admin-shell";
import {
  Wallet, Search, Eye, DollarSign, TrendingUp, Users,
  Loader2, ArrowUpRight, ArrowDownRight, Download,
} from "lucide-react";

interface WalletData {
  id: string;
  ownerId: string;
  ownerType: string;
  balance: number;
  pendingBalance: number;
  availableBalance: number;
  currency: string;
  status: string;
  lastActivity: string | null;
}

export default function WalletsAdminPage() {
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => { loadWallets(); }, []);

  const loadWallets = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/pay/wallet/admin");
      if (res.ok) {
        const json = await res.json();
        setWallets(json.data?.wallets || []);
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  const filteredWallets = wallets.filter((w) => {
    if (typeFilter !== "all" && w.ownerType !== typeFilter) return false;
    if (statusFilter !== "all" && w.status !== statusFilter) return false;
    if (search && !w.ownerId.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalBalance = wallets.reduce((s, w) => s + w.balance, 0);
  const customerBalance = wallets.filter((w) => w.ownerType === "customer").reduce((s, w) => s + w.balance, 0);
  const vendorBalance = wallets.filter((w) => w.ownerType === "vendor").reduce((s, w) => s + w.balance, 0);

  if (loading) {
    return (
      <AdminShell title="Wallets" subtitle="Manage Kauvex Pay wallets">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-kauvex-orange" size={32} />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Wallets" subtitle="Manage Kauvex Pay wallets">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Balance", value: `₦${(totalBalance / 1e6).toFixed(1)}M`, icon: DollarSign, color: "text-kauvex-orange" },
          { label: "Customer Balances", value: `₦${(customerBalance / 1e6).toFixed(1)}M`, icon: Users, color: "text-blue" },
          { label: "Vendor Balances", value: `₦${(vendorBalance / 1e6).toFixed(1)}M`, icon: TrendingUp, color: "text-green-600" },
          { label: "Total Wallets", value: wallets.length, icon: Wallet, color: "text-purple-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <s.icon size={16} className={s.color} />
              <span className="text-xs text-text-4">{s.label}</span>
            </div>
            <p className="text-xl font-bold text-text-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search wallets..." className="w-full h-10 pl-10 pr-4 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-kauvex-orange" />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
          className="h-10 px-3 rounded-lg border border-gray-200 text-sm bg-white">
          <option value="all">All Types</option>
          <option value="customer">Customer</option>
          <option value="vendor">Vendor</option>
          <option value="logistics_partner">Logistics Partner</option>
          <option value="affiliate">Affiliate</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3 rounded-lg border border-gray-200 text-sm bg-white">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="frozen">Frozen</option>
          <option value="restricted">Restricted</option>
        </select>
        <button className="flex items-center gap-1 px-4 h-10 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
          <Download size={14} /> Export
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {["Owner ID", "Type", "Balance", "Pending", "Reserved", "Available", "Status", "Last Activity", ""].map((h) => (
                  <th key={h} className="text-left p-3 text-text-4 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredWallets.length === 0 ? (
                <tr><td colSpan={9} className="p-8 text-center text-text-4 text-sm">No wallets found.</td></tr>
              ) : filteredWallets.map((w) => (
                <tr key={w.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="p-3 font-mono text-xs">{w.ownerId.slice(0, 8)}...</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      w.ownerType === "customer" ? "bg-blue-50 text-blue" :
                      w.ownerType === "vendor" ? "bg-green-50 text-green-600" :
                      "bg-purple-50 text-purple-600"
                    }`}>
                      {w.ownerType}
                    </span>
                  </td>
                  <td className="p-3 font-semibold">₦{w.balance.toLocaleString()}</td>
                  <td className="p-3 text-text-3">₦{w.pendingBalance.toLocaleString()}</td>
                  <td className="p-3 text-text-3">₦{w.pendingBalance.toLocaleString()}</td>
                  <td className="p-3 font-semibold text-green-600">₦{w.availableBalance.toLocaleString()}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      w.status === "active" ? "bg-green-50 text-green-600" :
                      w.status === "frozen" ? "bg-red-50 text-red" :
                      "bg-yellow-50 text-yellow-700"
                    }`}>
                      {w.status}
                    </span>
                  </td>
                  <td className="p-3 text-xs text-text-3">
                    {w.lastActivity ? new Date(w.lastActivity).toLocaleDateString() : "-"}
                  </td>
                  <td className="p-3">
                    <button className="text-xs text-kauvex-orange hover:underline flex items-center gap-1">
                      <Eye size={12} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
