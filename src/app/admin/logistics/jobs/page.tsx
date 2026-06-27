"use client";

import { useState, useEffect } from "react";
import AdminShell from "@/components/admin/admin-shell";
import { Truck, Package, CheckCircle2, XCircle, Clock, AlertTriangle, RefreshCw, Loader2, Phone } from "lucide-react";

interface LogisticsJob {
  id: string;
  jobNumber: string;
  type: string;
  pickupCity: string;
  dropoffCity: string;
  tier: string;
  partner: string;
  status: string;
  timeElapsed: string;
  customer: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-gray-100 text-gray-600" },
  offered: { label: "Offered", color: "bg-blue-50 text-blue-700" },
  accepted: { label: "Accepted", color: "bg-indigo-50 text-indigo-700" },
  heading_to_pickup: { label: "Heading to Pickup", color: "bg-yellow-50 text-yellow-700" },
  arrived_at_pickup: { label: "Arrived at Pickup", color: "bg-amber-50 text-amber-700" },
  picked_up: { label: "Picked Up", color: "bg-orange-50 text-orange" },
  in_transit: { label: "In Transit", color: "bg-purple-50 text-purple-700" },
  out_for_delivery: { label: "Out for Delivery", color: "bg-green-50 text-green-700" },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-800" },
  failed: { label: "Failed", color: "bg-red-50 text-red-700" },
};

export default function AdminJobsPage() {
  const [tab, setTab] = useState<"active" | "available" | "failed" | "escalations">("active");
  const [jobs, setJobs] = useState<LogisticsJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/logistics/jobs")
      .then((r) => r.json())
      .then((json) => {
        const raw = json.data || json.jobs || [];
        const mapped: LogisticsJob[] = raw.map((j: Record<string, unknown>) => ({
          id: String(j.id ?? ""),
          jobNumber: String(j.jobNumber ?? j.job_number ?? ""),
          type: String(j.type ?? "Parcel"),
          pickupCity: String(j.pickupCity ?? j.pickup_city ?? ""),
          dropoffCity: String(j.dropoffCity ?? j.dropoff_city ?? ""),
          tier: String(j.tier ?? "Tier 1"),
          partner: String(j.partner ?? "—"),
          status: String(j.status ?? "pending"),
          timeElapsed: String(j.timeElapsed ?? j.time_elapsed ?? ""),
          customer: String(j.customer ?? ""),
        }));
        setJobs(mapped);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const tabs = [
    { id: "active" as const, label: "Active Jobs", count: jobs.filter(j => !["delivered", "failed"].includes(j.status)).length },
    { id: "available" as const, label: "Available", count: jobs.filter(j => j.status === "pending" || j.status === "offered").length },
    { id: "failed" as const, label: "Failed", count: jobs.filter(j => j.status === "failed").length },
    { id: "escalations" as const, label: "Escalations", count: 2 },
  ];

  const filteredJobs = tab === "active" ? jobs.filter(j => !["delivered", "failed"].includes(j.status)) :
    tab === "available" ? jobs.filter(j => j.status === "pending" || j.status === "offered") :
    tab === "failed" ? jobs.filter(j => j.status === "failed") : jobs;

  return (
    <AdminShell title="Logistics Jobs" subtitle="Manage all delivery jobs across the network">
      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-blue" size={32} /></div>
      ) : (
      <div className="space-y-4">
        {/* Tab Bar */}
        <div className="flex gap-2">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t.id ? "bg-navy text-white" : "bg-white text-text-3 border border-border hover:bg-gray-50"
              }`}>
              {t.label}
              <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${
                tab === t.id ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
              }`}>{t.count}</span>
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-[10px] text-gray-500 uppercase">
              <tr>
                {["Job ID", "Type", "Pickup", "Dropoff", "Tier", "Partner", "Status", "Time", "Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-2 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredJobs.map((job) => {
                const status = statusConfig[job.status] || { label: job.status, color: "bg-gray-100 text-gray-600" };
                return (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-[#0A1628]">{job.jobNumber}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        job.type === "Fragile" ? "bg-red-50 text-red-700" :
                        job.type === "Food" ? "bg-green-50 text-green-700" :
                        job.type === "Document" ? "bg-blue-50 text-blue-700" : "bg-gray-50 text-gray-600"
                      }`}>{job.type}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{job.pickupCity}</td>
                    <td className="px-4 py-3 text-gray-600">{job.dropoffCity}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        job.tier === "Tier 1" ? "bg-green-50 text-green-700" :
                        job.tier === "Tier 2" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"
                      }`}>{job.tier}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{job.partner}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${status.color}`}>{status.label}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{job.timeElapsed}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button className="p-1 hover:bg-gray-100 rounded" title="Force Reassign"><RefreshCw size={12} /></button>
                        <button className="p-1 hover:bg-gray-100 rounded" title="Contact"><Phone size={12} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Available Jobs Actions */}
        {tab === "available" && (
          <div className="flex gap-3">
            <button className="bg-[#FF6B00] text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-600">Auto-Assign Best Partner</button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">Fallback to Carrier (DHL/GIG)</button>
          </div>
        )}

        {/* Failed Jobs Detail */}
        {tab === "failed" && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-sm text-[#0A1628] mb-3">Failure Reason Breakdown</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { reason: "Customer not home", count: 5 },
                { reason: "Wrong address", count: 2 },
                { reason: "Access denied", count: 1 },
                { reason: "Package damaged", count: 1 },
                { reason: "Partner cancelled", count: 3 },
                { reason: "Other", count: 2 },
              ].map((r) => (
                <div key={r.reason} className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-[#0A1628]">{r.count}</p>
                  <p className="text-xs text-gray-500">{r.reason}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <button className="text-xs bg-orange text-white px-3 py-1.5 rounded-lg">Reschedule</button>
              <button className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg">Reassign</button>
              <button className="text-xs bg-gray-600 text-white px-3 py-1.5 rounded-lg">Refund</button>
            </div>
          </div>
        )}
      </div>
      )}
    </AdminShell>
  );
}
