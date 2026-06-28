"use client";

import { useState, useEffect } from "react";
import AdminShell from "@/components/admin/admin-shell";
import {
  Save, Clock, Globe, Zap, Percent, Loader2, Truck, Users,
  MapPin, AlertTriangle, Radio, RefreshCw, ArrowRight, ChevronDown,
  CheckCircle2, XCircle, Package, Navigation, BarChart3, Settings,
  Eye, Phone, RotateCcw, Shield, Wifi, WifiOff,
} from "lucide-react";

type DispatchMode = "job_board" | "sequential" | "auto_assign";

interface DispatchConfig {
  tier1AcceptanceWindow: number;
  tier1RadiusDefault: number;
  tier1RadiusPerCountry: Record<string, number>;
  surgeEnabled: boolean;
  surgeMultiplier: number;
  fallbackCarrierOrder: string[];
  autoDispatchEnabled: boolean;
  partnerFallbackAttempts: number;
}

interface DispatchJob {
  id: string;
  waybill: string;
  pickup: string;
  dropoff: string;
  tier: string;
  partner: string | null;
  status: string;
  country: string;
  createdAt: string;
  eligiblePartners: number;
}

interface PartnerCandidate {
  id: string;
  name: string;
  tier: string;
  distance: number;
  rating: number;
  activeJobs: number;
  maxJobs: number;
  status: "available" | "busy" | "offline";
}

interface DispatchFeedEvent {
  id: string;
  time: string;
  type: "assigned" | "fallback" | "failed" | "completed" | "alert";
  message: string;
  country: string;
}

const defaultConfig: DispatchConfig = {
  tier1AcceptanceWindow: 15,
  tier1RadiusDefault: 60,
  tier1RadiusPerCountry: { NG: 60, GH: 50, KE: 50, ZA: 80, US: 40, GB: 50, AE: 45, IN: 55, DE: 40, AU: 70 },
  surgeEnabled: false,
  surgeMultiplier: 1.5,
  fallbackCarrierOrder: ["gig-logistics", "kwik-delivery", "dhl", "fedex"],
  autoDispatchEnabled: true,
  partnerFallbackAttempts: 3,
};

const unassignedJobs: DispatchJob[] = [];
const _MOCK_ASSIGNED_JOBS: DispatchJob[] = [];
const MOCK_CANDIDATES: PartnerCandidate[] = [];
const MOCK_FEED: DispatchFeedEvent[] = [];

const REGION_DISPATCH_MODES: Record<string, DispatchMode> = {
  NG: "auto_assign",
  GH: "job_board",
  KE: "sequential",
  US: "auto_assign",
  GB: "auto_assign",
  AE: "sequential",
  IN: "job_board",
  DE: "auto_assign",
  AU: "sequential",
  ZA: "auto_assign",
};

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  pending: { label: "Pending", color: "bg-gray-100 text-gray-600", dot: "bg-gray-400" },
  offered: { label: "Offered", color: "bg-blue-50 text-blue-700", dot: "bg-blue-400" },
  heading_to_pickup: { label: "En Route", color: "bg-yellow-50 text-yellow-700", dot: "bg-yellow-400" },
  picked_up: { label: "Picked Up", color: "bg-orange-50 text-[#FF6B00]", dot: "bg-[#FF6B00]" },
  in_transit: { label: "In Transit", color: "bg-purple-50 text-purple-700", dot: "bg-purple-400" },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-800", dot: "bg-green-500" },
  failed: { label: "Failed", color: "bg-red-50 text-red-700", dot: "bg-red-400" },
};

const FEED_TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string }> = {
  assigned: { icon: CheckCircle2, color: "text-green-600" },
  fallback: { icon: ArrowRight, color: "text-yellow-600" },
  failed: { icon: XCircle, color: "text-red-600" },
  completed: { icon: CheckCircle2, color: "text-green-600" },
  alert: { icon: AlertTriangle, color: "text-[#FF6B00]" },
};

export default function AdminDispatchPage() {
  const [config, setConfig] = useState<DispatchConfig>(defaultConfig);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [regionModes, setRegionModes] = useState<Record<string, DispatchMode>>(REGION_DISPATCH_MODES);
  const [activeTab, setActiveTab] = useState<"queue" | "matching" | "fallback" | "config" | "feed">("queue");
  const [unassignedJobs, setUnassignedJobs] = useState<DispatchJob[]>([]);
  const [assignedJobs, setAssignedJobs] = useState<DispatchJob[]>([]);
  const [candidates, setCandidates] = useState<PartnerCandidate[]>([]);
  const [feedEvents, setFeedEvents] = useState<DispatchFeedEvent[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [configRes, jobsRes, partnersRes] = await Promise.all([
          fetch("/api/v1/logistics/dispatch"),
          fetch("/api/v1/logistics/jobs?status=pending,offered,assigned,in_transit,picked_up&limit=20"),
          fetch("/api/v1/logistics/partners?status=active&limit=10"),
        ]);

        const configJson = await configRes.json();
        if (configJson.success && configJson.data) {
          setConfig({ ...defaultConfig, ...configJson.data });
        }

        const jobsJson = await jobsRes.json();
        const allJobs = (jobsJson.data || []) as Record<string, unknown>[];
        const unassigned = allJobs
          .filter((j) => ["pending", "offered"].includes(String(j.status)))
          .map((j) => ({
            id: String(j.id || j.job_id),
            waybill: String(j.waybill_number || j.id || "KVX-WB-000"),
            pickup: String(j.pickup_address || j.pickup || "Pickup"),
            dropoff: String(j.delivery_address || j.dropoff || "Drop-off"),
            tier: String(j.tier || "Tier 1"),
            partner: j.partner_name || j.assigned_partner || null,
            status: String(j.status),
            country: String(j.country || "NG"),
            createdAt: j.created_at ? new Date(j.created_at as string).toLocaleTimeString() : "Just now",
            eligiblePartners: Number(j.eligible_partners || 3),
          }));
        const assigned = allJobs
          .filter((j) => ["assigned", "in_transit", "picked_up"].includes(String(j.status)))
          .map((j) => ({
            id: String(j.id || j.job_id),
            waybill: String(j.waybill_number || j.id || "KVX-WB-000"),
            pickup: String(j.pickup_address || j.pickup || "Pickup"),
            dropoff: String(j.delivery_address || j.dropoff || "Drop-off"),
            tier: String(j.tier || "Tier 1"),
            partner: j.partner_name || j.assigned_partner || "Unassigned",
            status: String(j.status),
            country: String(j.country || "NG"),
            createdAt: j.created_at ? new Date(j.created_at as string).toLocaleTimeString() : "Just now",
            eligiblePartners: 0,
          }));

        setUnassignedJobs(unassigned.length > 0 ? unassigned : [
          { id: "J1", waybill: "KVX-WB-2026-089", pickup: "Lagos, Victoria Island", dropoff: "Lagos, Lekki Phase 1", tier: "Tier 1", partner: null, status: "pending", country: "NG", createdAt: "2 min ago", eligiblePartners: 4 },
          { id: "J2", waybill: "KVX-WB-2026-090", pickup: "Abuja, Wuse 2", dropoff: "Abuja, Maitama", tier: "Tier 1", partner: null, status: "pending", country: "NG", createdAt: "5 min ago", eligiblePartners: 2 },
        ]);
        setAssignedJobs(assigned.length > 0 ? assigned : [
          { id: "J10", waybill: "KVX-WB-2026-078", pickup: "Lagos, Surulere", dropoff: "Lagos, Yaba", tier: "Tier 1", partner: "Emeka O.", status: "heading_to_pickup", country: "NG", createdAt: "25 min ago", eligiblePartners: 0 },
        ]);

        const partnersJson = await partnersRes.json();
        const partnerData = (partnersJson.data || []) as Record<string, unknown>[];
        const partnerList = partnerData.map((p) => ({
          id: String(p.id),
          name: String(p.name || p.company_name || "Partner"),
          tier: String(p.tier || "Tier 1"),
          distance: Number(p.distance_km || Math.random() * 10 + 1),
          rating: Number(p.rating || 4.5),
          activeJobs: Number(p.active_jobs || 0),
          maxJobs: Number(p.max_jobs || 5),
          status: (p.status === "active" ? "available" : "offline") as "available" | "busy" | "offline",
        }));
        setCandidates(partnerList.length > 0 ? partnerList : [
          { id: "P1", name: "Emeka Okonkwo", tier: "Tier 1", distance: 2.3, rating: 4.8, activeJobs: 2, maxJobs: 5, status: "available" },
        ]);

        setFeedEvents([
          { id: "F1", time: new Date().toLocaleTimeString(), type: "assigned", message: "System loaded — dispatch engine ready", country: "ALL" },
        ]);
      } catch {
        // Use defaults on error
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const updateRadius = (country: string, value: number) => {
    setConfig(prev => ({ ...prev, tier1RadiusPerCountry: { ...prev.tier1RadiusPerCountry, [country]: value } }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/v1/logistics/dispatch", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch { /* fallback */ }
    finally { setSaving(false); }
  };

  if (loading) {
    return (
      <AdminShell title="Dispatch Engine" subtitle="Real-time job matching and partner assignment">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-[#FF6B00]" />
        </div>
      </AdminShell>
    );
  }

  const selectedJobData = unassignedJobs.find((j) => j.id === selectedJob);

  return (
    <AdminShell title="Dispatch Engine" subtitle="Real-time job matching and partner assignment">
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Unassigned", value: unassignedJobs.length.toString(), icon: Package, color: "text-yellow-600 bg-yellow-50", pulse: true },
            { label: "In Progress", value: assignedJobs.length.toString(), icon: Truck, color: "text-blue-600 bg-blue-50", pulse: false },
            { label: "Partners Online", value: "4", icon: Users, color: "text-green-600 bg-green-50", pulse: false },
            { label: "Auto-Assign", value: config.autoDispatchEnabled ? "ON" : "OFF", icon: Zap, color: config.autoDispatchEnabled ? "text-green-600 bg-green-50" : "text-gray-600 bg-gray-50", pulse: false },
            { label: "Surge Active", value: config.surgeEnabled ? "YES" : "NO", icon: Percent, color: config.surgeEnabled ? "text-red-600 bg-red-50" : "text-gray-600 bg-gray-50", pulse: config.surgeEnabled },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-3.5 h-3.5" />
                </div>
                {stat.pulse && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
              </div>
              <p className="text-lg font-bold text-[#0A1628]">{stat.value}</p>
              <p className="text-[10px] text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tab Bar */}
        <div className="flex gap-2">
          {[
            { id: "queue" as const, label: "Job Queue", count: unassignedJobs.length },
            { id: "matching" as const, label: "Partner Matching", count: candidates.filter((c) => c.status === "available").length },
            { id: "fallback" as const, label: "Fallback Chain", count: null },
            { id: "config" as const, label: "Configuration", count: null },
            { id: "feed" as const, label: "Live Feed", count: feedEvents.length },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                activeTab === t.id
                  ? "bg-[#0A1628] text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {t.label}
              {t.count !== null && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeTab === t.id ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                }`}>{t.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* JOB QUEUE TAB */}
        {activeTab === "queue" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Job List */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-[#0A1628] text-sm">Unassigned Jobs</h3>
                <div className="flex gap-2">
                  <button className="h-8 px-3 bg-[#FF6B00] text-white rounded-lg text-xs font-medium hover:bg-orange-600 flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Auto-Assign All
                  </button>
                  <button className="h-8 px-3 border border-gray-300 rounded-lg text-xs hover:bg-gray-50 flex items-center gap-1">
                    <RefreshCw className="w-3 h-3" /> Refresh
                  </button>
                </div>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-[10px] text-gray-500 uppercase">
                  <tr>
                    {["Waybill", "Pickup → Dropoff", "Tier", "Country", "Wait", "Partners", ""].map((h) => (
                      <th key={h} className="text-left px-4 py-2 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {unassignedJobs.map((job) => {
                    const st = STATUS_CONFIG[job.status] || STATUS_CONFIG.pending;
                    const isSelected = selectedJob === job.id;
                    return (
                      <tr
                        key={job.id}
                        onClick={() => setSelectedJob(job.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? "bg-orange-50" : "hover:bg-gray-50"
                        }`}
                      >
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs font-medium text-[#0A1628]">{job.waybill}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs">
                            <span className="text-gray-600">{job.pickup}</span>
                            <ArrowRight className="w-3 h-3 text-gray-400 inline mx-1" />
                            <span className="text-[#0A1628] font-medium">{job.dropoff}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                            job.tier === "Tier 1" ? "bg-green-50 text-green-700" :
                            job.tier === "Tier 2" ? "bg-blue-50 text-blue-700" :
                            "bg-purple-50 text-purple-700"
                          }`}>{job.tier}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">{job.country}</td>
                        <td className="px-4 py-3 text-xs text-gray-500">{job.createdAt}</td>
                        <td className="px-4 py-3 text-xs font-medium text-[#0A1628]">{job.eligiblePartners}</td>
                        <td className="px-4 py-3">
                          <button className="h-7 px-2 bg-[#FF6B00] text-white rounded text-[10px] font-medium hover:bg-orange-600">
                            Assign
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {unassignedJobs.length === 0 && (
                <div className="py-12 text-center text-gray-400">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-300" />
                  <p className="text-sm">All jobs are assigned. Great work!</p>
                </div>
              )}
            </div>

            {/* Job Detail Panel */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              {selectedJobData ? (
                <>
                  <h3 className="font-semibold text-[#0A1628] text-sm mb-4">Job Detail</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-[10px] text-gray-400 uppercase">Waybill</p>
                      <p className="font-mono font-medium text-[#0A1628]">{selectedJobData.waybill}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-[10px] text-gray-400 uppercase">Pickup</p>
                        <p className="text-xs font-medium text-[#0A1628]">{selectedJobData.pickup}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-[10px] text-gray-400 uppercase">Dropoff</p>
                        <p className="text-xs font-medium text-[#0A1628]">{selectedJobData.dropoff}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-[10px] text-gray-400 uppercase">Tier</p>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                          selectedJobData.tier === "Tier 1" ? "bg-green-50 text-green-700" :
                          selectedJobData.tier === "Tier 2" ? "bg-blue-50 text-blue-700" :
                          "bg-purple-50 text-purple-700"
                        }`}>{selectedJobData.tier}</span>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-[10px] text-gray-400 uppercase">Status</p>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                          STATUS_CONFIG[selectedJobData.status]?.color || "bg-gray-100 text-gray-600"
                        }`}>{STATUS_CONFIG[selectedJobData.status]?.label || selectedJobData.status}</span>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-[10px] text-gray-400 uppercase">Eligible Partners</p>
                      <p className="text-lg font-bold text-[#0A1628]">{selectedJobData.eligiblePartners}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 h-9 bg-[#FF6B00] text-white rounded-lg text-xs font-medium hover:bg-orange-600 flex items-center justify-center gap-1">
                        <Zap className="w-3 h-3" /> Auto-Assign
                      </button>
                      <button className="flex-1 h-9 border border-gray-300 rounded-lg text-xs hover:bg-gray-50 flex items-center justify-center gap-1">
                        <Users className="w-3 h-3" /> View Partners
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <Package className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                  <p className="text-xs">Select a job to view details</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PARTNER MATCHING TAB */}
        {activeTab === "matching" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Candidates */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold text-[#0A1628] text-sm">Eligible Partners — Ranked by Proximity & Rating</h3>
                <p className="text-[10px] text-gray-500 mt-1">
                  For: {selectedJobData?.waybill || "Select a job first"} ({selectedJobData?.pickup || ""})
                </p>
              </div>
              <div className="divide-y divide-gray-100">
                {candidates.sort((a, b) => {
                  if (a.status === "available" && b.status !== "available") return -1;
                  if (a.status !== "available" && b.status === "available") return 1;
                  return a.distance - b.distance;
                }).map((partner, rank) => (
                  <div key={partner.id} className="p-4 flex items-center gap-4 hover:bg-gray-50">
                    <div className="w-8 h-8 bg-[#0A1628] text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                      #{rank + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-[#0A1628] text-sm">{partner.name}</p>
                        <span className={`w-2 h-2 rounded-full ${
                          partner.status === "available" ? "bg-green-500" :
                          partner.status === "busy" ? "bg-yellow-500" : "bg-gray-300"
                        }`} />
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-500">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {partner.distance}km</span>
                        <span className="flex items-center gap-1"><span className="text-[#FF6B00]">★</span> {partner.rating}</span>
                        <span>{partner.activeJobs}/{partner.maxJobs} jobs</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {partner.status === "available" ? (
                        <button className="h-7 px-3 bg-[#FF6B00] text-white rounded text-[10px] font-medium hover:bg-orange-600">
                          Assign
                        </button>
                      ) : partner.status === "busy" ? (
                        <span className="text-[10px] text-yellow-600 font-medium">Busy</span>
                      ) : (
                        <span className="text-[10px] text-gray-400">Offline</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Scoring Explanation */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-[#0A1628] text-sm mb-4">Matching Algorithm</h3>
                <div className="space-y-3">
                  {[
                    { factor: "Proximity", weight: "40%", desc: "Distance from pickup point", icon: MapPin, color: "text-blue-600" },
                    { factor: "Rating", weight: "25%", desc: "Average customer rating", icon: BarChart3, color: "text-[#FF6B00]" },
                    { factor: "Availability", weight: "20%", desc: "Current load vs max capacity", icon: Users, color: "text-green-600" },
                    { factor: "Tier Match", weight: "15%", desc: "Partner tier matches job tier", icon: Shield, color: "text-purple-600" },
                  ].map((f) => (
                    <div key={f.factor} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-white ${f.color}`}>
                        <f.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-[#0A1628]">{f.factor}</p>
                          <span className="text-xs font-bold text-[#FF6B00]">{f.weight}</span>
                        </div>
                        <p className="text-[10px] text-gray-500">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Region Dispatch Mode */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-[#0A1628] text-sm mb-3 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-[#FF6B00]" /> Dispatch Mode per Region
                </h3>
                <div className="space-y-2">
                  {Object.entries(regionModes).map(([country, mode]) => (
                    <div key={country} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-[#0A1628]">{country}</span>
                      <select
                        value={mode}
                        onChange={(e) => setRegionModes((prev) => ({ ...prev, [country]: e.target.value as DispatchMode }))}
                        className="h-8 px-2 border border-gray-300 rounded-lg text-xs bg-white"
                      >
                        <option value="job_board">Job Board</option>
                        <option value="sequential">Sequential</option>
                        <option value="auto_assign">Auto-Assign</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FALLBACK CHAIN TAB */}
        {activeTab === "fallback" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-[#0A1628] text-sm mb-6 flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-[#FF6B00]" /> Fallback Chain Visualization
              </h3>
              <div className="flex items-center gap-0 overflow-x-auto pb-4">
                {/* Step 1: Kauvex Network */}
                <div className="flex-shrink-0 text-center">
                  <div className="w-48 bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-2">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                    <p className="font-bold text-green-700 text-sm">Kauvex Network</p>
                    <p className="text-[10px] text-green-600 mt-1">Tier 1 Partners</p>
                    <p className="text-lg font-bold text-green-700 mt-2">4 eligible</p>
                    <p className="text-[10px] text-green-600">within 60km radius</p>
                  </div>
                  <p className="text-[10px] text-gray-500">Step 1: Auto-offer to nearest partners</p>
                </div>

                <ArrowRight className="w-8 h-8 text-gray-300 mx-2 flex-shrink-0" />

                {/* Step 2: Local Carrier */}
                <div className="flex-shrink-0 text-center">
                  <div className="w-48 bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-2">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Truck className="w-6 h-6 text-yellow-600" />
                    </div>
                    <p className="font-bold text-yellow-700 text-sm">Local Carrier</p>
                    <p className="text-[10px] text-yellow-600 mt-1">GIG Logistics / Kwik Delivery / etc.</p>
                    <p className="text-lg font-bold text-yellow-700 mt-2">2 carriers</p>
                    <p className="text-[10px] text-yellow-600">API integration</p>
                  </div>
                  <p className="text-[10px] text-gray-500">Step 2: After {config.partnerFallbackAttempts} failed attempts</p>
                </div>

                <ArrowRight className="w-8 h-8 text-gray-300 mx-2 flex-shrink-0" />

                {/* Step 3: International Carrier */}
                <div className="flex-shrink-0 text-center">
                  <div className="w-48 bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-2">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Globe className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="font-bold text-blue-700 text-sm">International Carrier</p>
                    <p className="text-[10px] text-blue-600 mt-1">DHL / FedEx / Aramex</p>
                    <p className="text-lg font-bold text-blue-700 mt-2">3 carriers</p>
                    <p className="text-[10px] text-blue-600">Tier 3 only</p>
                  </div>
                  <p className="text-[10px] text-gray-500">Step 3: International shipments</p>
                </div>

                <ArrowRight className="w-8 h-8 text-gray-300 mx-2 flex-shrink-0" />

                {/* Step 4: Admin Alert */}
                <div className="flex-shrink-0 text-center">
                  <div className="w-48 bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-2">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <p className="font-bold text-red-700 text-sm">Admin Alert</p>
                    <p className="text-[10px] text-red-600 mt-1">Manual intervention</p>
                    <p className="text-lg font-bold text-red-700 mt-2">Escalate</p>
                    <p className="text-[10px] text-red-600">Email + Slack + SMS</p>
                  </div>
                  <p className="text-[10px] text-gray-500">Step 4: All options exhausted</p>
                </div>
              </div>
            </div>

            {/* Fallback Config */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-[#0A1628] text-sm mb-4">Fallback Carrier Order</h3>
              <div className="flex gap-2 flex-wrap">
                {config.fallbackCarrierOrder.map((carrier, i) => (
                  <div key={carrier} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                    <span className="w-5 h-5 bg-[#FF6B00] text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium text-[#0A1628]">{carrier}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CONFIGURATION TAB */}
        {activeTab === "config" && (
          <div className="max-w-3xl space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
              <h3 className="font-bold text-[#0A1628] flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-[#FF6B00]" /> Tier 1 Settings
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Acceptance Window (minutes)</label>
                  <input
                    type="number"
                    value={config.tier1AcceptanceWindow}
                    onChange={(e) => setConfig((prev) => ({ ...prev, tier1AcceptanceWindow: +e.target.value }))}
                    className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Job offer expires after X minutes</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Default Radius (km)</label>
                  <input
                    type="number"
                    value={config.tier1RadiusDefault}
                    onChange={(e) => setConfig((prev) => ({ ...prev, tier1RadiusDefault: +e.target.value }))}
                    className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-2">Radius Per Country (km)</label>
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(config.tier1RadiusPerCountry).map(([country, radius]) => (
                    <div key={country} className="flex items-center gap-2">
                      <span className="text-xs font-medium text-[#0A1628] w-8">{country}</span>
                      <input
                        type="number"
                        value={radius}
                        onChange={(e) => updateRadius(country, +e.target.value)}
                        className="flex-1 h-9 px-2 border border-gray-300 rounded-lg text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
              <h3 className="font-bold text-[#0A1628] flex items-center gap-2 text-sm">
                <Zap className="w-4 h-4 text-[#FF6B00]" /> Auto-Dispatch
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#0A1628]">Auto-Dispatch Mode</p>
                  <p className="text-xs text-gray-500">Jobs are automatically offered to matching partners</p>
                </div>
                <button
                  onClick={() => setConfig((prev) => ({ ...prev, autoDispatchEnabled: !prev.autoDispatchEnabled }))}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    config.autoDispatchEnabled ? "bg-[#FF6B00]" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      config.autoDispatchEnabled ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Partner Fallback Attempts</label>
                  <input
                    type="number"
                    value={config.partnerFallbackAttempts}
                    onChange={(e) => setConfig((prev) => ({ ...prev, partnerFallbackAttempts: +e.target.value }))}
                    className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Number of partners offered before carrier fallback</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Fallback Carrier Order</label>
                  <div className="flex gap-1 flex-wrap">
                    {config.fallbackCarrierOrder.map((c, i) => (
                      <span key={c} className="text-xs px-2 py-1 bg-gray-100 rounded-lg">{i + 1}. {c}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
              <h3 className="font-bold text-[#0A1628] flex items-center gap-2 text-sm">
                <Zap className="w-4 h-4 text-[#FF6B00]" /> Surge Pricing
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#0A1628]">Enable Surge Pricing</p>
                  <p className="text-xs text-gray-500">Multiplier applied during peak periods</p>
                </div>
                <button
                  onClick={() => setConfig((prev) => ({ ...prev, surgeEnabled: !prev.surgeEnabled }))}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    config.surgeEnabled ? "bg-[#FF6B00]" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      config.surgeEnabled ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
              {config.surgeEnabled && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">
                    <Percent className="w-3 h-3 inline" /> Surge Multiplier
                  </label>
                  <input
                    type="number"
                    step={0.1}
                    value={config.surgeMultiplier}
                    onChange={(e) => setConfig((prev) => ({ ...prev, surgeMultiplier: +e.target.value }))}
                    className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm max-w-[200px]"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">1.5 = 50% above base rate</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="h-10 px-6 bg-[#FF6B00] text-white font-bold rounded-lg hover:bg-orange-600 disabled:opacity-40 flex items-center gap-2 text-sm"
              >
                <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Settings"}
              </button>
              {saved && <span className="text-sm text-green-600 font-medium">Settings saved!</span>}
            </div>
          </div>
        )}

        {/* LIVE FEED TAB */}
        {activeTab === "feed" && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-[#0A1628] text-sm">Real-Time Dispatch Feed</h3>
                <span className="flex items-center gap-1 text-[10px] text-green-600">
                  <Radio className="w-3 h-3 animate-pulse" /> Live
                </span>
              </div>
              <button className="h-8 px-3 border border-gray-300 rounded-lg text-xs hover:bg-gray-50 flex items-center gap-1">
                <RefreshCw className="w-3 h-3" /> Refresh
              </button>
            </div>
            <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
              {feedEvents.map((event) => {
                const config = FEED_TYPE_CONFIG[event.type];
                const Icon = config.icon;
                return (
                  <div key={event.id} className="p-4 flex items-start gap-3 hover:bg-gray-50">
                    <div className={`mt-0.5 ${config.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#0A1628]">{event.message}</p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400">
                        <span>{event.time}</span>
                        <span>·</span>
                        <span>{event.country}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
