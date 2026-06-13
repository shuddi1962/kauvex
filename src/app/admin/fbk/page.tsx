"use client";

import { useState, useEffect } from "react";
import AdminShell from "@/components/admin/admin-shell";
import { insforge } from "@/lib/insforge";
import {
  Package,
  ArrowDown,
  ArrowUp,
  Store,
  Loader2,
  Search,
  Check,
  X,
  AlertTriangle,
  Building2,
  Clock,
  Filter,
} from "lucide-react";

interface Vendor {
  id: string;
  shop_name: string;
  vendor_tier: string;
}

interface FbkEnrollment {
  id: string;
  vendor_id: string;
  status: string;
  storage_limit: number | null;
  created_at: string;
  approved_at: string | null;
  vendor: Vendor | null;
}

interface InboundPlan {
  id: string;
  vendor_id: string;
  status: string;
  notes: string | null;
  estimated_arrival: string | null;
  created_at: string;
  warehouse_id: string;
  items: { id: string; quantity_shipped: number }[] | null;
}

const statusStyles: Record<string, string> = {
  active: "bg-green-50 text-green-700",
  pending: "bg-amber-50 text-amber-700",
  rejected: "bg-red-50 text-red-600",
  approved: "bg-blue-50 text-blue-600",
  processing: "bg-blue-100 text-blue-600",
  in_transit: "bg-purple-100 text-purple-600",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-gray-100 text-text-4",
  draft: "bg-gray-100 text-text-4",
};

export default function AdminFbkPage() {
  const [enrollments, setEnrollments] = useState<FbkEnrollment[]>([]);
  const [inbounds, setInbounds] = useState<InboundPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"enrollments" | "inbounds">("enrollments");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [eRes, iRes] = await Promise.all([
        insforge.database
          .from("fbk_enrollments")
          .select("*, vendor:vendors(id, shop_name, vendor_tier)"),
        insforge.database
          .from("fbk_inbound_plans")
          .select("*, items:fbk_inbound_items(id, quantity_shipped)"),
      ]);

      if (eRes.data) setEnrollments(eRes.data as unknown as FbkEnrollment[]);
      if (iRes.data) setInbounds(iRes.data as unknown as InboundPlan[]);
    } catch {
      setError("Failed to load FBK data");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (enrollmentId: string, newStatus: string) => {
    setActionLoading(enrollmentId);
    setError("");
    try {
      const tokenRes = await fetch("/api/auth/session-token");
      const { token } = await tokenRes.json();
      if (!token) { setError("Authentication failed"); setActionLoading(null); return; }

      const res = await fetch("/api/v1/fbk/enroll", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: enrollmentId, status: newStatus }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Failed to update enrollment");
        setActionLoading(null);
        return;
      }

      setEnrollments((prev) =>
        prev.map((e) =>
          e.id === enrollmentId
            ? { ...e, status: newStatus, approved_at: newStatus === "approved" ? new Date().toISOString() : null }
            : e
        )
      );
    } catch {
      setError("Network error");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredEnrollments = search
    ? enrollments.filter(
        (e) =>
          e.vendor?.shop_name?.toLowerCase().includes(search.toLowerCase()) ||
          e.status.toLowerCase().includes(search.toLowerCase())
      )
    : enrollments;

  const filteredInbounds = search
    ? inbounds.filter(
        (p) =>
          p.id.toLowerCase().includes(search.toLowerCase()) ||
          p.status.toLowerCase().includes(search.toLowerCase())
      )
    : inbounds;

  const totalEnrolled = enrollments.filter((e) => e.status === "active").length;
  const pendingEnrollments = enrollments.filter((e) => e.status === "pending").length;
  const totalInbounds = inbounds.length;
  const pendingInbounds = inbounds.filter((p) => p.status === "pending" || p.status === "processing").length;

  if (loading) {
    return (
      <AdminShell title="FBK Management" subtitle="Fulfillment by KAUVEX">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-orange" size={32} />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="FBK Management" subtitle="Fulfillment by KAUVEX">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Enrollments", value: enrollments.length, icon: Store, color: "text-orange" },
          { label: "Active Vendors", value: totalEnrolled, icon: Building2, color: "text-green-600" },
          { label: "Pending Approval", value: pendingEnrollments, icon: Clock, color: "text-amber-600" },
          { label: "Pending Inbounds", value: pendingInbounds, icon: ArrowDown, color: "text-blue-600" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon size={16} className={s.color} />
                <p className="text-xs text-text-4">{s.label}</p>
              </div>
              <p className={`font-bold text-2xl ${s.color}`}>{s.value}</p>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 mb-4 rounded-lg border bg-red-50 border-red-200 text-red-800 text-xs">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-1">
            <button
              onClick={() => { setTab("enrollments"); setSearch(""); }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                tab === "enrollments" ? "bg-orange text-white" : "bg-gray-100 text-text-4 hover:bg-gray-200"
              }`}
            >
              Enrollments ({enrollments.length})
            </button>
            <button
              onClick={() => { setTab("inbounds"); setSearch(""); }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                tab === "inbounds" ? "bg-orange text-white" : "bg-gray-100 text-text-4 hover:bg-gray-200"
              }`}
            >
              Inbound Plans ({inbounds.length})
            </button>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${tab}...`}
              className="w-48 h-8 pl-9 pr-3 text-xs rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-orange"
            />
          </div>
        </div>

        {tab === "enrollments" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2.5 px-3 text-[10px] text-gray-400 font-semibold uppercase">Vendor</th>
                  <th className="text-left py-2.5 px-3 text-[10px] text-gray-400 font-semibold uppercase">Status</th>
                  <th className="text-left py-2.5 px-3 text-[10px] text-gray-400 font-semibold uppercase">Tier</th>
                  <th className="text-left py-2.5 px-3 text-[10px] text-gray-400 font-semibold uppercase">Date</th>
                  <th className="text-right py-2.5 px-3 text-[10px] text-gray-400 font-semibold uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEnrollments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-text-4">
                      No enrollments found
                    </td>
                  </tr>
                ) : (
                  filteredEnrollments.map((e) => (
                    <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="py-2.5 px-3">
                        <p className="text-xs font-semibold text-text-1">
                          {e.vendor?.shop_name || "Unknown Vendor"}
                        </p>
                        <p className="text-[9px] text-text-4 font-mono">{e.vendor_id.slice(0, 8)}...</p>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${
                            statusStyles[e.status] || "bg-gray-100 text-text-4"
                          }`}
                        >
                          {e.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-xs text-text-3">
                          {e.vendor?.vendor_tier || "—"}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-xs text-text-4">
                          {new Date(e.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {e.status === "pending" ? (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleStatusUpdate(e.id, "approved")}
                              disabled={actionLoading === e.id}
                              className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors disabled:opacity-50"
                              title="Approve"
                            >
                              {actionLoading === e.id ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                <Check size={12} />
                              )}
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(e.id, "rejected")}
                              disabled={actionLoading === e.id}
                              className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                              title="Reject"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[9px] text-text-4 italic">Done</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2.5 px-3 text-[10px] text-gray-400 font-semibold uppercase">Plan ID</th>
                  <th className="text-left py-2.5 px-3 text-[10px] text-gray-400 font-semibold uppercase">Status</th>
                  <th className="text-left py-2.5 px-3 text-[10px] text-gray-400 font-semibold uppercase">Items</th>
                  <th className="text-left py-2.5 px-3 text-[10px] text-gray-400 font-semibold uppercase">Est. Arrival</th>
                  <th className="text-left py-2.5 px-3 text-[10px] text-gray-400 font-semibold uppercase">Created</th>
                </tr>
              </thead>
              <tbody>
                {filteredInbounds.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-text-4">
                      No inbound plans found
                    </td>
                  </tr>
                ) : (
                  filteredInbounds.map((p) => (
                    <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="py-2.5 px-3">
                        <span className="text-xs font-mono font-semibold text-text-1">
                          {p.id.slice(0, 8)}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${
                            statusStyles[p.status] || "bg-gray-100 text-text-4"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-xs text-text-3">
                          {(p.items || []).length} products
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-xs text-text-4">
                          {p.estimated_arrival
                            ? new Date(p.estimated_arrival).toLocaleDateString()
                            : "—"}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-xs text-text-4">
                          {new Date(p.created_at).toLocaleDateString()}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
