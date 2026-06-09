"use client";

import { useState } from "react";
import AdminShell from "@/components/admin/admin-shell";
import {
  Package, RefreshCw, AlertTriangle, DollarSign, TrendingUp,
  Search, Truck, FileText, SlidersHorizontal, ExternalLink, Clock,
  CheckCircle2, XCircle, Loader2, ArrowUpRight,
} from "lucide-react";
import Link from "next/link";

const recentActivity = [
  { date: "2026-06-09 14:32", product: "Wireless Bluetooth Earbuds Pro", action: "Import", status: "Completed" },
  { date: "2026-06-09 12:15", product: "Smart Watch Series 5", action: "Sync Price", status: "Completed" },
  { date: "2026-06-08 22:40", product: "USB-C Fast Charger 65W", action: "Order Submit", status: "Pending" },
  { date: "2026-06-08 16:10", product: "LED Desk Lamp Touch Control", action: "Import", status: "Failed" },
  { date: "2026-06-07 09:00", product: "Ergonomic Office Chair Mesh", action: "Sync Inventory", status: "Completed" },
];

export default function AdminCJDropshippingPage() {
  const [syncing, setSyncing] = useState(false);
  const [retrying, setRetrying] = useState(false);

  const handleSyncNow = async () => {
    setSyncing(true);
    await new Promise((r) => setTimeout(r, 1500));
    setSyncing(false);
  };

  const handleRetryAll = async () => {
    setRetrying(true);
    await new Promise((r) => setTimeout(r, 2000));
    setRetrying(false);
  };

  return (
    <AdminShell title="CJ Dropshipping" subtitle="Manage dropshipped products and orders from CJ">
      <div>
        {/* Dashboard Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-border p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-text-3 font-medium">Total CJ Products Imported</p>
              <Package className="w-4 h-4 text-blue" />
            </div>
            <p className="font-syne font-700 text-2xl text-text-1">0</p>
          </div>
          <div className="bg-white rounded-xl border border-border p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-text-3 font-medium">CJ Orders This Month</p>
              <Truck className="w-4 h-4 text-blue" />
            </div>
            <p className="font-syne font-700 text-2xl text-text-1">0</p>
          </div>
          <div className="bg-white rounded-xl border border-border p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-text-3 font-medium">Revenue from CJ Products</p>
              <DollarSign className="w-4 h-4 text-green-600" />
            </div>
            <p className="font-syne font-700 text-2xl text-text-1">$0.00</p>
          </div>
          <div className="bg-white rounded-xl border border-border p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-text-3 font-medium">Profit from CJ Orders</p>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <p className="font-syne font-700 text-2xl text-text-1">$0.00</p>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-border p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-text-3 font-medium">Pending Submissions</p>
              <p className="font-syne font-700 text-2xl text-warning mt-1">0</p>
            </div>
            <button
              onClick={handleSyncNow}
              disabled={syncing}
              className="h-8 px-3 bg-blue text-white text-xs font-semibold rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-1.5"
            >
              {syncing ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
              Sync Now
            </button>
          </div>
          <div className="bg-white rounded-xl border border-border p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-text-3 font-medium">Failed Submissions</p>
              <p className="font-syne font-700 text-2xl text-red mt-1">0</p>
            </div>
            <button
              onClick={handleRetryAll}
              disabled={retrying}
              className="h-8 px-3 bg-red text-white text-xs font-semibold rounded-lg hover:bg-red/90 disabled:opacity-50 flex items-center gap-1.5"
            >
              {retrying ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
              Retry All
            </button>
          </div>
          <div className="bg-white rounded-xl border border-border p-4">
            <p className="text-xs text-text-3 font-medium">Products Needing Price Review</p>
            <p className="font-syne font-700 text-2xl text-warning mt-1">0</p>
          </div>
          <div className="bg-white rounded-xl border border-border p-4">
            <p className="text-xs text-text-3 font-medium">Out of Stock CJ Products</p>
            <p className="font-syne font-700 text-2xl text-red mt-1">0</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h2 className="font-syne font-600 text-sm text-text-2 mb-3">Quick Actions</h2>
          <div className="grid grid-cols-4 gap-4">
            <Link href="/admin/cj-dropshipping/import"
              className="bg-white rounded-xl border border-border p-4 hover:border-blue/30 hover:shadow-sm transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue/10 flex items-center justify-center group-hover:bg-blue/20 transition-colors">
                  <Search className="w-4 h-4 text-blue" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text-1">Search & Import Products</p>
                  <p className="text-[10px] text-text-4 mt-0.5">Browse CJ catalog and import</p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-text-4 ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
            <Link href="/admin/cj-dropshipping/orders"
              className="bg-white rounded-xl border border-border p-4 hover:border-blue/30 hover:shadow-sm transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue/10 flex items-center justify-center group-hover:bg-blue/20 transition-colors">
                  <Truck className="w-4 h-4 text-blue" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text-1">View CJ Orders</p>
                  <p className="text-[10px] text-text-4 mt-0.5">Track and manage orders</p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-text-4 ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
            <Link href="/admin/cj-dropshipping/sync-log"
              className="bg-white rounded-xl border border-border p-4 hover:border-blue/30 hover:shadow-sm transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue/10 flex items-center justify-center group-hover:bg-blue/20 transition-colors">
                  <FileText className="w-4 h-4 text-blue" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text-1">Sync Log</p>
                  <p className="text-[10px] text-text-4 mt-0.5">View sync history</p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-text-4 ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
            <Link href="/admin/cj-dropshipping/markup-rules"
              className="bg-white rounded-xl border border-border p-4 hover:border-blue/30 hover:shadow-sm transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue/10 flex items-center justify-center group-hover:bg-blue/20 transition-colors">
                  <SlidersHorizontal className="w-4 h-4 text-blue" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text-1">Markup Rules</p>
                  <p className="text-[10px] text-text-4 mt-0.5">Configure pricing rules</p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-text-4 ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-text-4" />
              <h3 className="text-sm font-syne font-600 text-text-1">Recent Activity</h3>
            </div>
            <span className="text-[10px] text-text-4">Last 7 days</span>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-off-white border-b border-border">
                <th className="p-3 text-left text-xs font-syne font-600 text-text-3 uppercase">Date / Time</th>
                <th className="p-3 text-left text-xs font-syne font-600 text-text-3 uppercase">Product</th>
                <th className="p-3 text-left text-xs font-syne font-600 text-text-3 uppercase">Action</th>
                <th className="p-3 text-left text-xs font-syne font-600 text-text-3 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.map((row, i) => (
                <tr key={i} className="border-b border-border hover:bg-off-white/50">
                  <td className="p-3 text-xs text-text-4 font-mono">{row.date}</td>
                  <td className="p-3 text-sm text-text-1 font-medium">{row.product}</td>
                  <td className="p-3">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue/10 text-blue font-medium">
                      {row.action}
                    </span>
                  </td>
                  <td className="p-3">
                    {row.status === "Completed" ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
                        <CheckCircle2 className="w-3 h-3" /> Completed
                      </span>
                    ) : row.status === "Pending" ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-warning">
                        <Clock className="w-3 h-3" /> Pending
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-red">
                        <XCircle className="w-3 h-3" /> Failed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 border-t border-border flex items-center justify-between">
            <p className="text-[10px] text-text-4">Showing {recentActivity.length} recent entries</p>
            <button className="text-xs text-blue font-semibold flex items-center gap-1 hover:underline">
              View Full Log <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
