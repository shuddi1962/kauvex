"use client";

import { useState, useEffect } from "react";
import AdminShell from "@/components/admin/admin-shell";
import { insforge } from "@/lib/insforge";
import {
  Users, Package, ArrowDown, ArrowUp, Store,
  Warehouse, Loader2, Search, Eye, UserPlus,
} from "lucide-react";

interface Vendor {
  id: string;
  shop_name: string;
  vendor_tier: string;
}

interface FbkEnrollment {
  id: string;
  vendor_id: string;
  warehouse_id: string;
  storage_used: number;
  storage_capacity: number;
  status: string;
  vendor?: Vendor;
}

interface InboundPlan {
  id: string;
  vendor_id: string;
  reference: string;
  items: number;
  status: string;
  created_at: string;
  vendor?: Vendor;
}

interface OutboundPlan {
  id: string;
  vendor_id: string;
  reference: string;
  items: number;
  status: string;
  created_at: string;
  vendor?: Vendor;
}

const seedVendors = [
  { id: "1", shop_name: "TechWorld Ltd", vendor_tier: "gold" },
  { id: "2", shop_name: "FashionHub NG", vendor_tier: "silver" },
  { id: "3", shop_name: "Home Essentials Co", vendor_tier: "bronze" },
];

const seedEnrollments: FbkEnrollment[] = [
  { id: "1", vendor_id: "1", warehouse_id: "1", storage_used: 450, storage_capacity: 1000, status: "active", vendor: seedVendors[0] },
  { id: "2", vendor_id: "2", warehouse_id: "1", storage_used: 200, storage_capacity: 500, status: "active", vendor: seedVendors[1] },
  { id: "3", vendor_id: "3", warehouse_id: "2", storage_used: 80, storage_capacity: 300, status: "active", vendor: seedVendors[2] },
];

const seedInbounds: InboundPlan[] = [
  { id: "1", vendor_id: "1", reference: "INB-2024-001", items: 120, status: "pending", created_at: "2024-03-15", vendor: seedVendors[0] },
  { id: "2", vendor_id: "2", reference: "INB-2024-002", items: 45, status: "pending", created_at: "2024-03-14", vendor: seedVendors[1] },
  { id: "3", vendor_id: "3", reference: "INB-2024-003", items: 200, status: "received", created_at: "2024-03-12", vendor: seedVendors[2] },
];

const seedOutbounds: OutboundPlan[] = [
  { id: "1", vendor_id: "1", reference: "OUT-2024-001", items: 30, status: "pending", created_at: "2024-03-15", vendor: seedVendors[0] },
  { id: "2", vendor_id: "1", reference: "OUT-2024-002", items: 15, status: "packed", created_at: "2024-03-14", vendor: seedVendors[0] },
  { id: "3", vendor_id: "2", reference: "OUT-2024-003", items: 8, status: "shipped", created_at: "2024-03-13", vendor: seedVendors[1] },
];

const statusStyles: Record<string, string> = {
  active: "bg-green-50 text-green-700",
  suspended: "bg-amber-50 text-amber-700",
  inactive: "bg-gray-100 text-text-4",
  pending: "bg-amber-50 text-amber-700",
  received: "bg-blue-50 text-blue",
  picked: "bg-purple-50 text-purple-700",
  packed: "bg-indigo-50 text-indigo-700",
  shipped: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red",
};

export default function FbkDashboardPage() {
  const [enrollments, setEnrollments] = useState<FbkEnrollment[]>([]);
  const [inbounds, setInbounds] = useState<InboundPlan[]>([]);
  const [outbounds, setOutbounds] = useState<OutboundPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [eRes, iRes, oRes] = await Promise.all([
        insforge.database.from("fbk_enrollments").select("*, vendor:vendors(id, shop_name, vendor_tier)"),
        insforge.database.from("fbk_inbound_plans").select("*, vendor:vendors(id, shop_name, vendor_tier)"),
        insforge.database.from("fbk_outbound_plans").select("*, vendor:vendors(id, shop_name, vendor_tier)"),
      ]);

      if (eRes.data && eRes.data.length > 0) setEnrollments(eRes.data);
      else {
        for (const e of seedEnrollments) {
          const { vendor, ...rest } = e;
          await insforge.database.from("fbk_enrollments").insert(rest);
        }
        setEnrollments(seedEnrollments);
      }

      if (iRes.data && iRes.data.length > 0) setInbounds(iRes.data);
      else {
        for (const p of seedInbounds) {
          const { vendor, ...rest } = p;
          await insforge.database.from("fbk_inbound_plans").insert(rest);
        }
        setInbounds(seedInbounds);
      }

      if (oRes.data && oRes.data.length > 0) setOutbounds(oRes.data);
      else {
        for (const p of seedOutbounds) {
          const { vendor, ...rest } = p;
          await insforge.database.from("fbk_outbound_plans").insert(rest);
        }
        setOutbounds(seedOutbounds);
      }
    } catch {
      setEnrollments(seedEnrollments);
      setInbounds(seedInbounds);
      setOutbounds(seedOutbounds);
    } finally { setLoading(false); }
  };

  const totalInventory = enrollments.reduce((s, e) => s + e.storage_used, 0);
  const pendingInbounds = inbounds.filter(p => p.status === "pending").length;
  const pendingOutbounds = outbounds.filter(p => p.status === "pending" || p.status === "picked" || p.status === "packed").length;

  const filteredVendors = search
    ? enrollments.filter(e => e.vendor?.shop_name?.toLowerCase().includes(search.toLowerCase()))
    : enrollments;

  if (loading) {
    return (
      <AdminShell title="FBK Management" subtitle="Fulfillment by KAUVEX">
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-blue" size={32} /></div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="FBK Management" subtitle="Fulfillment by KAUVEX">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Enrolled Vendors", value: enrollments.length, icon: Store, color: "text-blue" },
          { label: "Total Inventory Items", value: totalInventory.toLocaleString(), icon: Package, color: "text-purple-600" },
          { label: "Pending Inbounds", value: pendingInbounds, icon: ArrowDown, color: "text-amber-600" },
          { label: "Pending Outbounds", value: pendingOutbounds, icon: ArrowUp, color: "text-rose-600" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-1">
              <s.icon size={16} className={s.color} />
              <p className="text-xs text-text-4">{s.label}</p>
            </div>
            <p className={`font-bold text-2xl ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Enrolled Vendors */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-bold text-sm text-text-1 mb-3">Enrolled Vendors</h3>
            <div className="relative mb-3">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search vendors..." className="w-full h-8 pl-9 pr-3 text-xs rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-blue" />
            </div>
            <div className="space-y-2">
              {filteredVendors.map(e => (
                <div key={e.id} className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-blue/10 flex items-center justify-center text-blue text-xs font-bold">
                      {e.vendor?.shop_name?.charAt(0) || "?"}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-text-1">{e.vendor?.shop_name || "Unknown"}</p>
                      <p className="text-[9px] text-text-4">{e.storage_used} / {e.storage_capacity} units</p>
                    </div>
                  </div>
                  <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${statusStyles[e.status] || "bg-gray-100 text-text-4"}`}>
                    {e.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pending Inbounds */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-bold text-sm text-text-1 mb-3">Pending Inbound Plans</h3>
            {inbounds.filter(p => p.status === "pending").length === 0 ? (
              <p className="text-xs text-text-4 text-center py-8">No pending inbound plans</p>
            ) : (
              <div className="space-y-2">
                {inbounds.filter(p => p.status === "pending").map(p => (
                  <div key={p.id} className="p-2.5 rounded-lg border border-amber-100 bg-amber-50/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono font-semibold text-text-1">{p.reference}</span>
                      <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${statusStyles[p.status] || ""}`}>{p.status}</span>
                    </div>
                    <p className="text-[10px] text-text-4">{p.vendor?.shop_name || "Unknown"} · {p.items} items</p>
                    <p className="text-[9px] text-text-4">{p.created_at}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pending Outbounds */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-bold text-sm text-text-1 mb-3">Pending Outbound Plans</h3>
            {outbounds.filter(p => p.status !== "shipped" && p.status !== "cancelled").length === 0 ? (
              <p className="text-xs text-text-4 text-center py-8">No pending outbound plans</p>
            ) : (
              <div className="space-y-2">
                {outbounds.filter(p => p.status !== "shipped" && p.status !== "cancelled").map(p => (
                  <div key={p.id} className="p-2.5 rounded-lg border border-blue-100 bg-blue-50/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono font-semibold text-text-1">{p.reference}</span>
                      <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${statusStyles[p.status] || ""}`}>{p.status}</span>
                    </div>
                    <p className="text-[10px] text-text-4">{p.vendor?.shop_name || "Unknown"} · {p.items} items</p>
                    <p className="text-[9px] text-text-4">{p.created_at}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="font-bold text-sm text-text-1 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Create Inbound Plan", icon: ArrowDown, color: "text-amber-600", bg: "bg-amber-50" },
            { label: "Create Outbound Plan", icon: ArrowUp, color: "text-rose-600", bg: "bg-rose-50" },
            { label: "Enroll Vendor", icon: UserPlus, color: "text-blue", bg: "bg-blue/5" },
            { label: "View All Plans", icon: Eye, color: "text-purple-600", bg: "bg-purple-50" },
          ].map(a => {
            const Icon = a.icon;
            return (
              <button key={a.label} className={`flex items-center gap-2.5 p-3 rounded-lg ${a.bg} hover:opacity-80 transition-opacity`}>
                <Icon size={16} className={a.color} />
                <span className="text-xs font-semibold text-text-1">{a.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </AdminShell>
  );
}
