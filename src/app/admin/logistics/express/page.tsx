"use client";

import { useState, useEffect } from "react";
import AdminShell from "@/components/admin/admin-shell";
import { Loader2, Package, DollarSign, TrendingUp, Zap, Eye } from "lucide-react";

interface ExpressShipment {
  id: string;
  waybill_number: string;
  sender_name: string;
  receiver_name: string;
  pickup_city: string;
  dropoff_city: string;
  service_level: string;
  status: string;
  price_paid: number;
  created_at: string;
}

const serviceConfig: Record<string, { label: string; color: string }> = {
  economy: { label: "Economy", color: "bg-gray-100 text-gray-600" },
  standard: { label: "Standard", color: "bg-blue-50 text-blue" },
  express: { label: "Express", color: "bg-orange-50 text-orange" },
  same_day: { label: "Same Day", color: "bg-green-50 text-green-700" },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-gray-100 text-gray-600" },
  picked_up: { label: "Picked Up", color: "bg-blue-50 text-blue" },
  in_transit: { label: "In Transit", color: "bg-yellow-50 text-yellow-700" },
  out_for_delivery: { label: "Out for Delivery", color: "bg-orange-50 text-orange" },
  delivered: { label: "Delivered", color: "bg-green-50 text-green-700" },
  cancelled: { label: "Cancelled", color: "bg-red-50 text-red" },
};

export default function AdminExpressPage() {
  const [shipments, setShipments] = useState<ExpressShipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterService, setFilterService] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetch("/api/v1/express/waybills")
      .then((r) => r.json())
      .then((json) => {
        const raw = json.data || json.waybills || [];
        const mapped: ExpressShipment[] = raw.map((s: Record<string, unknown>) => ({
          id: String(s.id ?? ""),
          waybill_number: String(s.waybill_number ?? s.waybillNumber ?? ""),
          sender_name: String(s.sender_name ?? s.senderName ?? ""),
          receiver_name: String(s.receiver_name ?? s.receiverName ?? ""),
          pickup_city: String(s.pickup_city ?? s.pickupCity ?? ""),
          dropoff_city: String(s.dropoff_city ?? s.dropoffCity ?? ""),
          service_level: String(s.service_level ?? s.serviceLevel ?? "standard"),
          status: String(s.status ?? "pending"),
          price_paid: Number(s.price_paid ?? s.pricePaid ?? 0),
          created_at: String(s.created_at ?? s.createdAt ?? new Date().toISOString()),
        }));
        setShipments(mapped);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const totalRevenue = shipments.reduce((sum, s) => sum + s.price_paid, 0);
  const thisMonth = shipments.filter(s => {
    const d = new Date(s.created_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const revenueThisMonth = thisMonth.reduce((sum, s) => sum + s.price_paid, 0);
  const serviceBreakdown = shipments.reduce<Record<string, number>>((acc, s) => {
    acc[s.service_level] = (acc[s.service_level] || 0) + 1;
    return acc;
  }, {});

  const filtered = shipments.filter(s => {
    if (filterService !== "all" && s.service_level !== filterService) return false;
    if (filterStatus !== "all" && s.status !== filterStatus) return false;
    return true;
  });

  const serviceLevels = ["all", ...new Set(shipments.map(s => s.service_level))];
  const statuses = ["all", ...new Set(shipments.map(s => s.status))];

  return (
    <AdminShell title="Express Analytics" subtitle="Track express shipping performance and revenue">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Shipments", value: shipments.length, icon: Package, color: "text-blue" },
            { label: "Total Revenue", value: `₦${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-green-600" },
            { label: "Revenue This Month", value: `₦${revenueThisMonth.toLocaleString()}`, icon: TrendingUp, color: "text-orange" },
            { label: "Avg Per Shipment", value: `₦${Math.round(totalRevenue / Math.max(shipments.length, 1)).toLocaleString()}`, icon: Zap, color: "text-purple-600" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-1">
                <s.icon size={16} className={s.color} />
                <p className="text-xl font-bold text-text-1">{s.value}</p>
              </div>
              <p className="text-[11px] text-text-4">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Service Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(serviceBreakdown).map(([level, count]) => {
            const cfg = serviceConfig[level] || { label: level, color: "bg-gray-100 text-gray-600" };
            return (
              <div key={level} className="bg-white rounded-xl border border-gray-200 p-3 flex items-center justify-between">
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>{cfg.label}</span>
                <span className="font-bold text-text-1">{count}</span>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-4 font-medium">Service Level:</span>
            <select value={filterService} onChange={e => setFilterService(e.target.value)}
              className="h-9 px-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-blue">
              {serviceLevels.map(l => (
                <option key={l} value={l}>{l === "all" ? "All" : (serviceConfig[l]?.label || l)}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-4 font-medium">Status:</span>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="h-9 px-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-blue">
              {statuses.map(s => (
                <option key={s} value={s}>{s === "all" ? "All" : (statusConfig[s]?.label || s)}</option>
              ))}
            </select>
          </div>
          <p className="text-xs text-text-4 ml-auto">{filtered.length} of {shipments.length} shipments</p>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-blue" size={32} /></div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {["Waybill", "Sender", "Receiver", "Pickup", "Dropoff", "Service", "Status", "Price", "Date", ""].map(h => (
                    <th key={h} className="p-3 text-left text-xs font-medium text-text-4 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={10} className="p-8 text-center text-text-4">No shipments found</td></tr>
                ) : (
                  filtered.map(s => {
                    const sc = serviceConfig[s.service_level] || { label: s.service_level, color: "bg-gray-100 text-gray-600" };
                    const st = statusConfig[s.status] || { label: s.status, color: "bg-gray-100 text-gray-600" };
                    return (
                      <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                        <td className="p-3 font-mono text-xs font-medium text-text-1">{s.waybill_number}</td>
                        <td className="p-3 text-text-2">{s.sender_name}</td>
                        <td className="p-3 text-text-2">{s.receiver_name}</td>
                        <td className="p-3 text-text-4">{s.pickup_city}</td>
                        <td className="p-3 text-text-4">{s.dropoff_city}</td>
                        <td className="p-3"><span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${sc.color}`}>{sc.label}</span></td>
                        <td className="p-3"><span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${st.color}`}>{st.label}</span></td>
                        <td className="p-3 font-semibold text-text-1">₦{s.price_paid.toLocaleString()}</td>
                        <td className="p-3 text-[11px] text-text-4">{new Date(s.created_at).toLocaleDateString()}</td>
                        <td className="p-3"><button className="p-1 hover:bg-gray-100 rounded"><Eye size={14} className="text-text-4" /></button></td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
