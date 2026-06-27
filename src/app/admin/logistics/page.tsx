"use client";

import { useState, useEffect } from "react";
import AdminShell from "@/components/admin/admin-shell";
import { insforge } from "@/lib/insforge";
import Link from "next/link";
import {
  Loader2, Truck, PackageCheck, DollarSign, Wifi, AlertTriangle, Clock,
  Package, Globe, TrendingUp, BarChart3, Send, ArrowRight,
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

const ROUTE_PERFORMANCE = [
  { route: "Lagos → Abuja", percentage: 87, color: "#FF6B00" },
  { route: "PHC → Lagos", percentage: 74, color: "#0A1628" },
  { route: "Nigeria → UK", percentage: 65, color: "#FF6B00" },
  { route: "Nigeria → USA", percentage: 52, color: "#FF6B00" },
  { route: "China → NG", percentage: 48, color: "#10B981" },
];

const MONTHLY_VOLUME = [
  { month: "Jan", value: 60 },
  { month: "Feb", value: 80 },
  { month: "Mar", value: 55 },
  { month: "Apr", value: 90 },
  { month: "May", value: 70 },
  { month: "Jun", value: 95 },
  { month: "Jul", value: 75 },
  { month: "Aug", value: 85 },
  { month: "Sep", value: 65, accent: true },
  { month: "Oct", value: 100, accent: true },
  { month: "Nov", value: 88, accent: true },
  { month: "Dec", value: 92, accent: true },
];

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
    { label: "Total Shipments", value: totalJobs.toLocaleString(), sub: "All time", icon: Package, iconBg: "bg-[#EEF2FF]", iconColor: "text-[#0A1628]" },
    { label: "Delivered Today", value: deliveredToday, sub: "Completed", icon: PackageCheck, iconBg: "bg-green-50", iconColor: "text-green-600" },
    { label: "In Transit", value: totalJobs - deliveredToday - failedToday, sub: "Moving now", icon: Truck, iconBg: "bg-orange-50", iconColor: "text-[#FF6B00]" },
    { label: "Partners Online", value: onlinePartners, sub: "Active now", icon: Wifi, iconBg: "bg-blue-50", iconColor: "text-blue-600" },
    { label: "Revenue", value: `₦${totalRevenue.toLocaleString()}`, sub: "Total earned", icon: DollarSign, iconBg: "bg-green-50", iconColor: "text-green-600" },
    { label: "Avg Delivery", value: avgDeliveryTime, sub: "Time", icon: Clock, iconBg: "bg-purple-50", iconColor: "text-purple-600" },
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0A1628]">Logistics Overview</h1>
            <p className="text-sm text-gray-500 mt-1">Network performance at a glance</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/logistics/jobs"
              className="inline-flex items-center gap-2 bg-[#FF6B00] hover:bg-[#e55f00] text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-colors"
            >
              <Send className="w-4 h-4" />
              View All Jobs
            </Link>
          </div>
        </div>

        {/* Stat Cards - Roshana Style */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
            >
              <div className={`w-10 h-10 rounded-lg ${card.iconBg} flex items-center justify-center mb-3`}>
                <card.icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
              <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">{card.label}</p>
              <p className="text-2xl font-bold text-[#0A1628]">{card.value}</p>
              <p className="text-[11px] text-gray-500 mt-1">{card.sub}</p>
            </div>
          ))}
        </div>

        {/* Failure Rate Alert */}
        {failedToday > 0 && deliveredToday > 0 && (failedToday / (failedToday + deliveredToday)) > 0.05 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <AlertTriangle size={16} className="text-red shrink-0" />
            <p className="text-sm text-red font-medium">
              Failure rate is {(failedToday / (failedToday + deliveredToday) * 100).toFixed(1)}% — exceeds the 5% threshold. Review failed deliveries immediately.
            </p>
          </div>
        )}

        {/* Two Column: Chart + Performance */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Shipment Volume Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-semibold text-[#0A1628]">Shipment Volume</h3>
                <p className="text-xs text-gray-500 mt-0.5">Monthly volume over last 12 months</p>
              </div>
            </div>
            <div className="flex items-end gap-2 h-44 px-2">
              {MONTHLY_VOLUME.map((bar) => (
                <div key={bar.month} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-md transition-all duration-300"
                    style={{
                      height: `${bar.value}%`,
                      backgroundColor: bar.accent ? "#FF6B00" : "#0A1628",
                      opacity: bar.accent ? 1 : 0.85,
                    }}
                  />
                  <span className="text-[10px] text-gray-400">{bar.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Route Performance */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-semibold text-[#0A1628]">Route Performance</h3>
                <p className="text-xs text-gray-500 mt-0.5">Top shipping routes</p>
              </div>
              <Link href="/admin/logistics/rates" className="text-xs text-[#FF6B00] hover:underline font-medium">
                View all →
              </Link>
            </div>
            <div className="space-y-4">
              {ROUTE_PERFORMANCE.map((route) => (
                <div key={route.route} className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 w-28 shrink-0">{route.route}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${route.percentage}%`, backgroundColor: route.color }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 w-10 text-right">{route.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Jobs Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[#0A1628]">Recent Jobs</h3>
              <p className="text-xs text-gray-500 mt-0.5">Latest 5 logistics jobs</p>
            </div>
            <Link href="/admin/logistics/jobs" className="text-xs text-[#FF6B00] hover:underline font-medium">
              View all →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-3 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wider">Job #</th>
                  <th className="px-6 py-3 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wider">Tier</th>
                  <th className="px-6 py-3 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wider">Pickup</th>
                  <th className="px-6 py-3 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wider">Dropoff</th>
                  <th className="px-6 py-3 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody>
                {recentJobs.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-gray-400">No jobs found</td></tr>
                ) : recentJobs.map((job) => {
                  const tc = tierConfig[job.tier] || { label: job.tier, color: "bg-gray-100 text-gray-600" };
                  const sc = statusConfig[job.status] || { label: job.status, color: "bg-gray-100 text-gray-600" };
                  return (
                    <tr key={job.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-3 font-mono text-xs font-medium text-[#0A1628]">{job.job_number}</td>
                      <td className="px-6 py-3">
                        <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium ${tc.color}`}>{tc.label}</span>
                      </td>
                      <td className="px-6 py-3">
                        <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium ${sc.color}`}>{sc.label}</span>
                      </td>
                      <td className="px-6 py-3 text-gray-600">{job.pickup_city || "—"}</td>
                      <td className="px-6 py-3 text-gray-600">{job.dropoff_city || "—"}</td>
                      <td className="px-6 py-3 text-[11px] text-gray-400">{new Date(job.created_at).toLocaleString()}</td>
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
