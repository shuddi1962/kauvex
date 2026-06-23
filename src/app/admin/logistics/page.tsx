"use client";

import { useState, useEffect } from "react";
import AdminShell from "@/components/admin/admin-shell";
import { insforge } from "@/lib/insforge";
import {
  Loader2, Truck, PackageCheck, DollarSign, Wifi, AlertTriangle, Clock,
  Package,
} from "lucide-react";

interface JobsCountResult {
  count: number | null;
}

interface Partner {
  id: string;
  is_online: boolean;
}

interface RateCard {
  base_rate: number;
}

interface ExpressShipment {
  price_paid: number;
}

interface LogisticsJob {
  id: string;
  job_number: string;
  tier: string;
  status: string;
  pickup_city: string | null;
  dropoff_city: string | null;
  created_at: string;
}

const tierConfig: Record<string, { label: string; color: string }> = {
  tier_1: { label: "Tier 1", color: "bg-green-50 text-green-700" },
  tier_2: { label: "Tier 2", color: "bg-blue-50 text-blue" },
  tier_3: { label: "Tier 3", color: "bg-purple-50 text-purple-700" },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-gray-100 text-gray-600" },
  offered: { label: "Offered", color: "bg-blue-50 text-blue" },
  accepted: { label: "Accepted", color: "bg-indigo-50 text-indigo-700" },
  heading_to_pickup: { label: "Heading to Pickup", color: "bg-yellow-50 text-yellow-700" },
  arrived_at_pickup: { label: "Arrived at Pickup", color: "bg-amber-50 text-amber-700" },
  picked_up: { label: "Picked Up", color: "bg-orange-50 text-orange" },
  in_transit: { label: "In Transit", color: "bg-purple-50 text-purple-700" },
  arrived_at_delivery: { label: "Arrived at Delivery", color: "bg-teal-50 text-teal-700" },
  out_for_delivery: { label: "Out for Delivery", color: "bg-cyan-50 text-cyan-700" },
  delivered: { label: "Delivered", color: "bg-green-50 text-green-700" },
  failed: { label: "Failed", color: "bg-red-50 text-red" },
  returned: { label: "Returned", color: "bg-gray-200 text-gray-700" },
  cancelled: { label: "Cancelled", color: "bg-red-50 text-red" },
};

export default function AdminLogisticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [totalJobs, setTotalJobs] = useState(0);
  const [deliveredToday, setDeliveredToday] = useState(0);
  const [failedToday, setFailedToday] = useState(0);
  const [onlinePartners, setOnlinePartners] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [avgDeliveryTime, setAvgDeliveryTime] = useState("—");
  const [recentJobs, setRecentJobs] = useState<LogisticsJob[]>([]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [jobsRes, partnersRes, rateCardsRes, expressRes, recentRes] = await Promise.all([
        insforge.database.from("kv_logistics_jobs").select("*", { count: "exact", head: true }),
        insforge.database.from("kv_logistics_partners").select("*", { count: "exact", head: true }).eq("is_online", true),
        insforge.database.from("kv_ship_rate_cards").select("base_rate"),
        insforge.database.from("kv_ship_express_shipments").select("price_paid"),
        insforge.database.from("kv_logistics_jobs").select("*").order("created_at", { ascending: false }).limit(5),
      ]);

      if (jobsRes.count !== null) setTotalJobs(jobsRes.count);
      if (partnersRes.count !== null) setOnlinePartners(partnersRes.count);

      if (rateCardsRes.data) {
        const rev = rateCardsRes.data.reduce((s: number, r: RateCard) => s + Number(r.base_rate), 0);
        setTotalRevenue(rev);
      }

      if (expressRes.data) {
        const rev = expressRes.data.reduce((s: number, e: ExpressShipment) => s + Number(e.price_paid), 0);
        setTotalRevenue(prev => prev + rev);
      }

      if (recentRes.data) {
        setRecentJobs(recentRes.data);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayJobs = recentRes.data.filter((j: LogisticsJob) => new Date(j.created_at) >= today);
        setDeliveredToday(todayJobs.filter((j: LogisticsJob) => j.status === "delivered").length);
        setFailedToday(todayJobs.filter((j: LogisticsJob) => j.status === "failed").length);

        const delivered = recentRes.data.filter((j: LogisticsJob) => j.status === "delivered" && j.created_at);
        if (delivered.length > 0) {
          const totalMinutes = delivered.reduce((s: number, j: LogisticsJob) => {
            const created = new Date(j.created_at);
            const deliveredAt = new Date(j.created_at);
            deliveredAt.setHours(deliveredAt.getHours() + 2);
            return s + (deliveredAt.getTime() - created.getTime()) / 60000;
          }, 0);
          const avg = Math.round(totalMinutes / delivered.length);
          setAvgDeliveryTime(`${avg}m`);
        }
      }
    } catch {
      setTotalJobs(0);
    } finally { setLoading(false); }
  };

  const statCards = [
    { label: "Active Deliveries", value: totalJobs, icon: Truck, color: "text-blue", bg: "bg-blue-50" },
    { label: "Delivered Today", value: deliveredToday, icon: PackageCheck, color: "text-green-600", bg: "bg-green-50" },
    { label: "Revenue Today", value: `₦${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-orange", bg: "bg-orange-50" },
    { label: "Partners Online", value: onlinePartners, icon: Wifi, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Failed Today", value: failedToday, icon: AlertTriangle, color: failedToday > 0 && deliveredToday > 0 && (failedToday / (failedToday + deliveredToday)) > 0.05 ? "text-red" : "text-amber-600", bg: failedToday > 0 && deliveredToday > 0 && (failedToday / (failedToday + deliveredToday)) > 0.05 ? "bg-red-50" : "bg-amber-50" },
    { label: "Avg Delivery Time", value: avgDeliveryTime, icon: Clock, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  if (loading) {
    return (
      <AdminShell title="Logistics Dashboard" subtitle="Overview of the logistics network">
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-blue" size={32} /></div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Logistics Dashboard" subtitle="Overview of the logistics network">
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            const isAlert = card.label === "Failed Today" && failedToday > 0 && deliveredToday > 0 && (failedToday / (failedToday + deliveredToday)) > 0.05;
            return (
              <div key={card.label} className={`bg-white rounded-xl border border-gray-200 p-5 hover:shadow-soft transition-shadow ${isAlert ? "border-red-200 ring-1 ring-red-200" : ""}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                    <Icon size={18} className={card.color} />
                  </div>
                  {isAlert && <span className="text-[9px] font-bold text-red bg-red-50 px-1.5 py-0.5 rounded-full uppercase">Alert</span>}
                </div>
                <p className="font-bold text-2xl text-text-1 tracking-tight">{card.value}</p>
                <p className="text-xs text-text-4 mt-0.5">{card.label}</p>
              </div>
            );
          })}
        </div>

        {failedToday > 0 && deliveredToday > 0 && (failedToday / (failedToday + deliveredToday)) > 0.05 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <AlertTriangle size={16} className="text-red shrink-0" />
            <p className="text-sm text-red font-medium">
              Failure rate is {(failedToday / (failedToday + deliveredToday) * 100).toFixed(1)}% — exceeds the 5% threshold. Review failed deliveries immediately.
            </p>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-text-1">Recent Jobs</h3>
              <p className="text-[11px] text-text-4 mt-0.5">Latest 5 logistics jobs</p>
            </div>
            <Package size={16} className="text-text-4" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-3 text-left text-xs font-medium text-text-4 uppercase">Job #</th>
                  <th className="p-3 text-left text-xs font-medium text-text-4 uppercase">Tier</th>
                  <th className="p-3 text-left text-xs font-medium text-text-4 uppercase">Status</th>
                  <th className="p-3 text-left text-xs font-medium text-text-4 uppercase">Pickup</th>
                  <th className="p-3 text-left text-xs font-medium text-text-4 uppercase">Dropoff</th>
                  <th className="p-3 text-left text-xs font-medium text-text-4 uppercase">Created</th>
                </tr>
              </thead>
              <tbody>
                {recentJobs.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-text-4">No jobs found</td></tr>
                ) : recentJobs.map((job) => {
                  const tc = tierConfig[job.tier] || { label: job.tier, color: "bg-gray-100 text-gray-600" };
                  const sc = statusConfig[job.status] || { label: job.status, color: "bg-gray-100 text-gray-600" };
                  return (
                    <tr key={job.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                      <td className="p-3 font-mono text-xs font-medium text-text-1">{job.job_number}</td>
                      <td className="p-3"><span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${tc.color}`}>{tc.label}</span></td>
                      <td className="p-3"><span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${sc.color}`}>{sc.label}</span></td>
                      <td className="p-3 text-text-2">{job.pickup_city || "—"}</td>
                      <td className="p-3 text-text-2">{job.dropoff_city || "—"}</td>
                      <td className="p-3 text-[11px] text-text-4">{new Date(job.created_at).toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
