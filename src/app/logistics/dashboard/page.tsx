"use client";

import { useState, useEffect } from "react";
import {
  MapPin,
  Navigation,
  Package,
  Weight,
  DollarSign,
  Clock,
  Star,
  Camera,
  KeyRound,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronDown,
  Download,
  Filter,
  TrendingUp,
  Award,
  Shield,
  Zap,
  Sun,
  Moon,
  Bell,
  Phone,
  Mail,
  CreditCard,
  Map,
  RotateCcw,
  Truck,
  Timer,
  Check,
  CheckCircle,
  AlertTriangle,
  Briefcase,
  Wifi,
  WifiOff,
  BarChart3,
  Calendar,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  UserCheck,
  ThumbsUp,
  Percent,
  HelpCircle,
  User,
  UserPlus,
} from "lucide-react";
import { useDashboard } from "./dashboard-context";

type TabId = "available" | "active" | "history" | "earnings" | "performance" | "fuel" | "fleet" | "delivery-stats" | "settings";

export default function LogisticsDashboard() {
  const { activeTab, setActiveTab } = useDashboard();
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showProofModal, setShowProofModal] = useState(false);
  const [deliveryPin, setDeliveryPin] = useState("");
  const [partnerInfo, setPartnerInfo] = useState<{ id: string; name: string; status: string } | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("logistics_partner");
    if (!stored) {
      window.location.href = "/logistics/login";
      return;
    }
    try {
      const info = JSON.parse(stored);
      if (info.status === "suspended") {
        window.location.href = "/logistics/login";
        return;
      }
      setPartnerInfo(info);
    } catch {
      localStorage.removeItem("logistics_partner");
      window.location.href = "/logistics/login";
      return;
    }
    setAuthChecked(true);
  }, []);

  const tabs = [
    { id: "available" as TabId, label: "Available Jobs" },
    { id: "active" as TabId, label: "My Active Jobs" },
    { id: "history" as TabId, label: "Job History" },
    { id: "earnings" as TabId, label: "Earnings" },
    { id: "performance" as TabId, label: "Performance" },
    { id: "fuel" as TabId, label: "Fuel & Profitability" },
    { id: "fleet" as TabId, label: "Fleet Management" },
    { id: "delivery-stats" as TabId, label: "Delivery Stats" },
    { id: "settings" as TabId, label: "Settings" },
  ];

  if (!authChecked) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-[#FF6B00] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Partner Welcome */}
      {partnerInfo && (
        <div className="mb-4 bg-white rounded-xl border border-border p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-text-1">Welcome back, {partnerInfo.name}</p>
            <p className="text-xs text-text-4">Partner ID: {partnerInfo.id}</p>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("logistics_partner");
              window.location.href = "/logistics/login";
            }}
            className="text-xs text-red-500 hover:text-red-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar mb-6 pb-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id ? "bg-navy text-white shadow-sm" : "bg-white text-text-3 border border-border hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ============ AVAILABLE JOBS TAB ============ */}
      {activeTab === "available" && <AvailableJobsTab />}

      {/* ============ MY ACTIVE JOBS TAB ============ */}
      {activeTab === "active" && (
        <ActiveJobsTab
          onOpenProof={() => setShowProofModal(true)}
          deliveryPin={deliveryPin}
          setDeliveryPin={setDeliveryPin}
        />
      )}

      {/* ============ JOB HISTORY TAB ============ */}
      {activeTab === "history" && <JobHistoryTab />}

      {/* ============ EARNINGS TAB ============ */}
      {activeTab === "earnings" && (
        <EarningsTab onRequestPayout={() => setShowPayoutModal(true)} />
      )}

      {/* ============ PERFORMANCE TAB ============ */}
      {activeTab === "performance" && <PerformanceTab />}

      {/* ============ FUEL TAB ============ */}
      {activeTab === "fuel" && <FuelTab />}

      {/* ============ FLEET TAB ============ */}
      {activeTab === "fleet" && <FleetManagementTab />}

      {/* ============ DELIVERY STATS TAB ============ */}
      {activeTab === "delivery-stats" && <DeliveryStatsTab />}

      {/* ============ SETTINGS TAB ============ */}
      {activeTab === "settings" && <SettingsTab />}

      {/* Payout Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4" onClick={() => setShowPayoutModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-text-1">Request Early Payout</h3>
              <button onClick={() => setShowPayoutModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><XCircle className="w-5 h-5 text-text-4" /></button>
            </div>
            <p className="text-sm text-text-4 mb-4">Request an early payout for your pending earnings. A 2% processing fee applies.</p>
            <div className="bg-orange-50 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-text-4">Pending Balance</span>
                <span className="font-bold text-text-1">₦23,400</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-4">Processing Fee (2%)</span>
                <span className="text-text-4">-₦468</span>
              </div>
              <div className="border-t border-orange/20 mt-2 pt-2 flex items-center justify-between">
                <span className="font-bold text-text-1">You Receive</span>
                <span className="font-bold text-lg text-orange">₦22,932</span>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-text-2 block mb-1">Bank Account</label>
                <select className="w-full h-10 px-3 border border-border rounded-lg text-sm">
                  <option>GTBank · 0123456789 (John Doe)</option>
                </select>
              </div>
              <button className="w-full h-11 bg-orange text-white font-bold rounded-xl hover:bg-orange/90 transition-colors">Request Payout</button>
              <button onClick={() => setShowPayoutModal(false)} className="w-full h-10 text-sm text-text-4 hover:text-text-2 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Proof of Delivery Modal */}
      {showProofModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4" onClick={() => setShowProofModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-text-1">Proof of Delivery</h3>
              <button onClick={() => setShowProofModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><XCircle className="w-5 h-5 text-text-4" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-text-2 block mb-2">Capture Delivery Photo</label>
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-orange/30 transition-colors cursor-pointer">
                  <Camera className="w-8 h-8 text-text-4 mx-auto mb-2" />
                  <p className="text-sm text-text-4">Tap to take a photo of the delivered package</p>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-text-2 block mb-1">Delivery PIN</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-4" />
                  <input
                    value={deliveryPin}
                    onChange={e => setDeliveryPin(e.target.value)}
                    placeholder="Enter 4-digit PIN from customer"
                    className="w-full h-11 pl-10 pr-3 border border-border rounded-lg text-sm"
                    maxLength={4}
                  />
                </div>
                <p className="text-[10px] text-text-4 mt-1">Ask the customer for their delivery PIN to confirm receipt</p>
              </div>
              <button
                disabled={deliveryPin.length !== 4}
                className="w-full h-11 bg-orange text-white font-bold rounded-xl hover:bg-orange/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Confirm Delivery
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ==================== AVAILABLE JOBS ==================== */
function AvailableJobsTab() {
  const [jobs, setJobs] = useState<{ id: string; pickup: string; dropoff: string; distance: string; weight: string; payout: number; type: string; minTier: string; expiresIn: number; pickupCode: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: "all", minPayout: "", maxDistance: "" });
  const [accepted, setAccepted] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/v1/logistics/jobs?status=open&limit=20")
      .then(r => r.json())
      .then(json => {
        const items = (json.data || []).map((j: Record<string, unknown>) => ({
          id: j.id || j.job_id || `JOB-${Math.floor(Math.random() * 9000 + 1000)}`,
          pickup: j.pickup_address || j.pickup || "Pickup location",
          dropoff: j.delivery_address || j.dropoff || "Drop-off location",
          distance: j.distance_km ? `${j.distance_km} km` : "— km",
          weight: j.weight_category || "Small (< 2 kg)",
          payout: Number(j.payout_amount || j.earnings || j.payout || 2000),
          type: j.shipment_type || j.type || "Standard",
          minTier: j.min_tier || "New",
          expiresIn: j.expires_in || 15,
          pickupCode: j.pickup_code || `PK-${Math.floor(Math.random() * 900 + 100)}`,
        }));
        setJobs(items.length > 0 ? items : [
          { id: "JOB-8742", pickup: "Ikeja City Mall, Lagos", dropoff: "VI, Lagos 106104", distance: "12.5 km", weight: "Small (< 2 kg)", payout: 2500, type: "Express", minTier: "New", expiresIn: 14, pickupCode: "PK-482" },
          { id: "JOB-8741", pickup: "Marina, Lagos Island", dropoff: "Lekki Phase 1", distance: "18.2 km", weight: "Medium (2-10 kg)", payout: 3800, type: "Standard", minTier: "Verified", expiresIn: 8, pickupCode: "PK-481" },
          { id: "JOB-8740", pickup: "Surulere, Lagos", dropoff: "Yaba, Lagos", distance: "6.8 km", weight: "Small (< 2 kg)", payout: 1800, type: "Express", minTier: "New", expiresIn: 3, pickupCode: "PK-480" },
        ]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = jobs.filter(j => {
    if (filters.type !== "all" && j.type.toLowerCase() !== filters.type) return false;
    if (filters.minPayout && j.payout < parseInt(filters.minPayout)) return false;
    if (filters.maxDistance) {
      const dist = parseFloat(j.distance);
      if (dist > parseFloat(filters.maxDistance)) return false;
    }
    return true;
  });

  const acceptJob = (id: string) => setAccepted(prev => [...prev, id]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-xl border border-border p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-text-4" />
          <select value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))} className="h-9 px-3 border border-border rounded-lg text-xs bg-white">
            <option value="all">All Types</option>
            <option value="express">Express</option>
            <option value="standard">Standard</option>
            <option value="heavy">Heavy</option>
          </select>
          <input value={filters.minPayout} onChange={e => setFilters(f => ({ ...f, minPayout: e.target.value }))} placeholder="Min payout" className="h-9 w-24 px-3 border border-border rounded-lg text-xs" />
          <input value={filters.maxDistance} onChange={e => setFilters(f => ({ ...f, maxDistance: e.target.value }))} placeholder="Max km" className="h-9 w-24 px-3 border border-border rounded-lg text-xs" />
          <span className="text-xs text-text-4 ml-auto">{filtered.length} jobs available</span>
        </div>
      </div>

      {/* Job Cards */}
      {filtered.map(job => {
        const isAccepted = accepted.includes(job.id);
        const minutesLeft = job.expiresIn;
        return (
          <div key={job.id} className={`bg-white rounded-xl border transition-all ${isAccepted ? "border-orange/30 bg-orange-50/30" : "border-border hover:shadow-sm"}`}>
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-text-1">{job.id}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    job.type === "Express" ? "bg-orange/10 text-orange" :
                    job.type === "Heavy" ? "bg-purple-100 text-purple-700" :
                    "bg-blue-100 text-blue"
                  }`}>{job.type}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-amber-600">
                  <Timer className="w-3 h-3" />
                  <span className={minutesLeft <= 5 ? "font-bold text-red" : ""}>{minutesLeft} min</span>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 mb-4">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] text-text-4">Pickup</p>
                    <p className="text-xs font-medium text-text-1">{job.pickup}</p>
                    <p className="text-[10px] text-text-4 mt-0.5">Code: <span className="font-mono font-bold text-text-2">{job.pickupCode}</span></p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-orange mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] text-text-4">Drop-off</p>
                    <p className="text-xs font-medium text-text-1">{job.dropoff}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-text-4 mb-4">
                <span className="flex items-center gap-1"><Navigation className="w-3 h-3" /> {job.distance}</span>
                <span className="flex items-center gap-1"><Weight className="w-3 h-3" /> {job.weight}</span>
                <span className="flex items-center gap-1"><Award className="w-3 h-3" /> Min: {job.minTier}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-lg font-bold text-text-1">₦{job.payout.toLocaleString()}</span>
                </div>
                {isAccepted ? (
                  <div className="flex items-center gap-1.5 px-4 py-2 bg-green-100 text-green-700 rounded-lg text-xs font-bold">
                    <CheckCircle className="w-4 h-4" /> Accepted
                  </div>
                ) : (
                  <button onClick={() => acceptJob(job.id)} className="px-5 py-2 bg-orange text-white font-bold rounded-lg hover:bg-orange/90 transition-colors text-sm flex items-center gap-1.5">
                    <Zap className="w-4 h-4" /> Accept Job
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {filtered.length === 0 && (
        <div className="bg-white rounded-xl border border-border p-12 text-center">
          <Package className="w-12 h-12 text-text-4 mx-auto mb-3" />
          <p className="text-text-3 font-medium">No jobs match your filters</p>
          <p className="text-sm text-text-4 mt-1">Try adjusting your criteria or check back soon</p>
        </div>
      )}
    </div>
  );
}

/* ==================== ACTIVE JOBS ==================== */
function ActiveJobsTab({ onOpenProof, deliveryPin, setDeliveryPin }: { onOpenProof: () => void; deliveryPin: string; setDeliveryPin: (v: string) => void }) {
  const [jobs, setJobs] = useState<{ id: string; pickup: string; dropoff: string; status: string; customer: string; customerPhone: string; payout: number; timeline: string[]; currentStage: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/logistics/jobs?status=assigned,in_transit,picked_up&limit=10")
      .then(r => r.json())
      .then(json => {
        const items = (json.data || []).map((j: Record<string, unknown>) => ({
          id: j.id || j.job_id || `JOB-${Math.floor(Math.random() * 9000 + 1000)}`,
          pickup: j.pickup_address || j.pickup || "Pickup",
          dropoff: j.delivery_address || j.dropoff || "Drop-off",
          status: j.status || "assigned",
          customer: j.customer_name || j.recipient_name || "Customer",
          customerPhone: j.customer_phone || j.recipient_phone || "+234 ***",
          payout: Number(j.payout_amount || j.earnings || j.payout || 2500),
          timeline: ["Assigned", "Arrived at Pickup", "Picked Up", "In Transit", "Delivered"],
          currentStage: j.status === "in_transit" ? 3 : j.status === "picked_up" ? 2 : j.status === "arrived_pickup" ? 1 : 0,
        }));
        setJobs(items.length > 0 ? items : [
          { id: "JOB-8742", pickup: "Ikeja City Mall, Lagos", dropoff: "VI, Lagos 106104", status: "picked-up", customer: "Chioma A.", customerPhone: "+234 812 *** 4567", payout: 2500, timeline: ["Assigned", "Arrived at Pickup", "Picked Up", "In Transit", "Delivered"], currentStage: 2 },
          { id: "JOB-8738", pickup: "Victoria Island, Lagos", dropoff: "Ajah, Lagos", status: "assigned", customer: "Emeka O.", customerPhone: "+234 803 *** 7890", payout: 4200, timeline: ["Assigned", "Arrived at Pickup", "Picked Up", "In Transit", "Delivered"], currentStage: 0 },
        ]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);
  const statusColors: Record<string, string> = {
    assigned: "bg-blue-100 text-blue",
    "arrived-pickup": "bg-amber-100 text-amber-700",
    "picked-up": "bg-purple-100 text-purple-700",
    "in-transit": "bg-indigo-100 text-indigo-600",
    delivered: "bg-green-100 text-green-700",
  };

  return (
    <div className="space-y-4">
      {jobs.map(job => {
        const stages = job.timeline;
        const current = job.currentStage;
        return (
          <div key={job.id} className="bg-white rounded-xl border border-border overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-text-1">{job.id}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[job.status] || "bg-gray-100 text-text-4"}`}>
                    {job.status.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>
                <span className="font-bold text-green-700">₦{job.payout.toLocaleString()}</span>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] text-text-4">Pickup</p>
                    <p className="text-xs font-medium text-text-1">{job.pickup}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-orange mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] text-text-4">Drop-off</p>
                    <p className="text-xs font-medium text-text-1">{job.dropoff}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-3 text-xs text-text-4">
                <span className="flex items-center gap-1"><User className="w-3 h-3" /> {job.customer}</span>
                <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {job.customerPhone}</span>
              </div>
            </div>

            {/* Timeline */}
            <div className="px-4 py-3 bg-gray-50">
              <div className="flex items-center gap-0">
                {stages.map((stage, i) => (
                  <div key={stage} className="flex items-center flex-1">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold ${
                        i < current ? "bg-green-500 text-white" :
                        i === current ? "bg-orange text-white" :
                        "bg-gray-200 text-text-4"
                      }`}>
                        {i < current ? <Check className="w-3 h-3" /> : i + 1}
                      </div>
                      <span className={`text-[9px] font-medium hidden sm:inline ${i <= current ? "text-text-1" : "text-text-4"}`}>{stage}</span>
                    </div>
                    {i < stages.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-1 ${i < current ? "bg-green-500" : i === current ? "bg-orange" : "bg-gray-200"}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-4 flex flex-wrap gap-2">
              {current === 0 && (
                <button className="px-4 py-2 bg-amber-500 text-white font-bold rounded-lg hover:bg-amber-600 transition-colors text-xs flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Mark Arrived at Pickup
                </button>
              )}
              {current === 1 && (
                <button className="px-4 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors text-xs flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5" /> Scan Package & Confirm Pickup
                </button>
              )}
              {current === 3 && (
                <button onClick={onOpenProof} className="px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors text-xs flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" /> Mark Delivered
                </button>
              )}
              <button className="px-4 py-2 bg-blue text-white font-bold rounded-lg hover:bg-blue/90 transition-colors text-xs flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5" /> Navigate
              </button>
            </div>
          </div>
        );
      })}

      {jobs.length === 0 && (
        <div className="bg-white rounded-xl border border-border p-12 text-center">
          <Package className="w-12 h-12 text-text-4 mx-auto mb-3" />
          <p className="text-text-3 font-medium">No active jobs</p>
          <p className="text-sm text-text-4 mt-1">Accept available jobs to see them here</p>
        </div>
      )}
    </div>
  );
}

/* ==================== JOB HISTORY ==================== */
function JobHistoryTab() {
  const [jobs, setJobs] = useState<{ id: string; date: string; pickup: string; dropoff: string; payout: number; rating: number; status: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetch("/api/v1/logistics/jobs?status=completed,cancelled&limit=20")
      .then(r => r.json())
      .then(json => {
        const items = (json.data || []).map((j: Record<string, unknown>) => ({
          id: j.id || j.job_id || `JOB-${Math.floor(Math.random() * 9000 + 1000)}`,
          date: j.completed_at || j.created_at || new Date().toISOString().split("T")[0],
          pickup: j.pickup_address || j.pickup || "Pickup",
          dropoff: j.delivery_address || j.dropoff || "Drop-off",
          payout: Number(j.payout_amount || j.earnings || j.payout || 2500),
          rating: Number(j.rating || 0),
          status: j.status || "completed",
        }));
        setJobs(items.length > 0 ? items : [
          { id: "JOB-8730", date: "2026-06-22", pickup: "Ikeja", dropoff: "VI", payout: 2500, rating: 5, status: "completed" },
          { id: "JOB-8728", date: "2026-06-22", pickup: "Surulere", dropoff: "Yaba", payout: 1800, rating: 4, status: "completed" },
          { id: "JOB-8725", date: "2026-06-21", pickup: "Marina", dropoff: "Lekki", payout: 3800, rating: 5, status: "completed" },
        ]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = jobs.filter(j => filterStatus === "all" || j.status === filterStatus);
  const totalPayout = filtered.reduce((sum, j) => sum + j.payout, 0);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-border p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-text-4" />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="h-9 px-3 border border-border rounded-lg text-xs bg-white">
            <option value="all">All Jobs</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <span className="text-xs text-text-4 ml-auto">{filtered.length} jobs · ₦{totalPayout.toLocaleString()} total</span>
          <button className="flex items-center gap-1 px-3 h-9 border border-border rounded-lg text-xs text-text-3 hover:bg-gray-50 transition-colors">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map(job => (
          <div key={job.id} className="bg-white rounded-xl border border-border p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                job.status === "completed" ? "bg-green-100" : "bg-red-100"
              }`}>
                {job.status === "completed" ? <CheckCircle className="w-5 h-5 text-green-700" /> : <XCircle className="w-5 h-5 text-red" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-text-1">{job.id}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    job.status === "completed" ? "bg-green-100 text-green-700" : "bg-red-100 text-red"
                  }`}>{job.status}</span>
                </div>
                <p className="text-xs text-text-4 mt-0.5">{job.pickup} → {job.dropoff}</p>
                <div className="flex items-center gap-3 mt-1 text-[10px] text-text-4">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {job.date}</span>
                  {job.rating > 0 && (
                    <span className="flex items-center gap-1">{Array.from({ length: job.rating }).map((_, i) => <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />)}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-green-700">₦{job.payout.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ==================== EARNINGS ==================== */
function EarningsTab({ onRequestPayout }: { onRequestPayout: () => void }) {
  const [period, setPeriod] = useState<"today" | "week" | "month" | "all">("week");
  const [earningsData, setEarningsData] = useState<Record<string, { earned: number; pending: number; paid: number; jobs: number }>>({
    today: { earned: 0, pending: 0, paid: 0, jobs: 0 },
    week: { earned: 0, pending: 0, paid: 0, jobs: 0 },
    month: { earned: 0, pending: 0, paid: 0, jobs: 0 },
    all: { earned: 0, pending: 0, paid: 0, jobs: 0 },
  });

  useEffect(() => {
    fetch("/api/v1/logistics/payouts?summary=true")
      .then(r => r.json())
      .then(json => {
        if (json.summary) {
          setEarningsData({
            today: { earned: json.summary.today_earned || 12450, pending: json.summary.today_pending || 2500, paid: json.summary.today_paid || 9950, jobs: json.summary.today_jobs || 4 },
            week: { earned: json.summary.week_earned || 78200, pending: json.summary.week_pending || 23400, paid: json.summary.week_paid || 54800, jobs: json.summary.week_jobs || 18 },
            month: { earned: json.summary.month_earned || 285000, pending: json.summary.month_pending || 42000, paid: json.summary.month_paid || 243000, jobs: json.summary.month_jobs || 72 },
            all: { earned: json.summary.total_earned || 1245000, pending: 0, paid: json.summary.total_paid || 1245000, jobs: json.summary.total_jobs || 340 },
          });
        }
      })
      .catch(() => {});
  }, []);

  const data = earningsData[period];

  const earningsBreakdown = [
    { id: "JOB-8742", route: "Ikeja → VI", date: "Today", payout: 2500, status: "pending" },
    { id: "JOB-8738", route: "VI → Ajah", date: "Today", payout: 4200, status: "pending" },
    { id: "JOB-8730", route: "Ikeja → VI", date: "2026-06-22", payout: 2500, status: "paid" },
    { id: "JOB-8728", route: "Surulere → Yaba", date: "2026-06-22", payout: 1800, status: "paid" },
    { id: "JOB-8725", route: "Marina → Lekki", date: "2026-06-21", payout: 3800, status: "paid" },
  ];

  return (
    <div className="space-y-4">
      {/* Period Selector */}
      <div className="flex items-center gap-1 bg-white rounded-xl border border-border p-1 w-fit">
        {(["today", "week", "month", "all"] as const).map(p => (
          <button key={p} onClick={() => setPeriod(p)} className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
            period === p ? "bg-navy text-white" : "text-text-4 hover:text-text-2"
          }`}>
            {p === "today" ? "Today" : p === "week" ? "This Week" : p === "month" ? "This Month" : "All Time"}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="text-[10px] text-text-4">Total Earned</span>
          </div>
          <p className="text-xl font-bold text-text-1">₦{data.earned.toLocaleString()}</p>
          <p className="text-[10px] text-text-4">{data.jobs} jobs</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="w-4 h-4 text-orange" />
            <span className="text-[10px] text-text-4">Pending</span>
          </div>
          <p className="text-xl font-bold text-orange">₦{data.pending.toLocaleString()}</p>
          <p className="text-[10px] text-text-4">Awaiting clearance</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-blue" />
            <span className="text-[10px] text-text-4">Paid Out</span>
          </div>
          <p className="text-xl font-bold text-blue">₦{data.paid.toLocaleString()}</p>
          <p className="text-[10px] text-text-4">Cleared funds</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-4 h-4 text-purple-600" />
            <span className="text-[10px] text-text-4">Avg per Job</span>
          </div>
          <p className="text-xl font-bold text-text-1">₦{data.jobs > 0 ? Math.round(data.earned / data.jobs).toLocaleString() : 0}</p>
          <p className="text-[10px] text-text-4">Across {data.jobs} deliveries</p>
        </div>
      </div>

      {/* Request Payout */}
      <button onClick={onRequestPayout} className="w-full py-3 bg-orange text-white font-bold rounded-xl hover:bg-orange/90 transition-colors flex items-center justify-center gap-2 text-sm">
        <Wallet className="w-4 h-4" /> Request Early Payout (₦{earningsData.week.pending.toLocaleString()} available)
      </button>

      {/* Per-job Breakdown */}
      <div className="bg-white rounded-xl border border-border">
        <div className="p-4 border-b border-border">
          <h3 className="font-bold text-sm text-text-1">Per-Job Breakdown</h3>
        </div>
        <div className="divide-y divide-border">
          {earningsBreakdown.map(job => (
            <div key={job.id} className="px-4 py-3 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-text-1">{job.id}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
                    job.status === "paid" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                  }`}>{job.status}</span>
                </div>
                <p className="text-[10px] text-text-4">{job.route} · {job.date}</p>
              </div>
              <span className="text-sm font-bold text-text-1">₦{job.payout.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ==================== PERFORMANCE ==================== */
function PerformanceTab() {
  const metrics = {
    onTimeRate: 94,
    acceptanceRate: 87,
    rating: 4.9,
    completedJobs: 340,
    tier: "Verified" as const,
    nextTier: "Trusted",
    tierProgress: 65,
  };

  const tierBenefits = {
    New: ["Basic job access", "Standard payout rate", "Email support"],
    Verified: ["Priority job matching", "Higher payout rate", "Phone support", "Weekly payouts"],
    Trusted: ["Premium job access", "Top payout rate", "Priority support", "Daily payouts", "Insurance coverage"],
    Premium: ["Exclusive long-haul jobs", "Highest payout rate", "Dedicated account manager", "Instant payouts", "Full insurance", "Fuel subsidy"],
  };

  const currentTierBenefits = tierBenefits[metrics.tier];

  return (
    <div className="space-y-4">
      {/* Main Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-border p-4 text-center">
          <div className="text-3xl font-bold text-text-1 mb-1">{metrics.onTimeRate}%</div>
          <div className="flex items-center justify-center gap-1 text-xs text-text-4">
            <Clock className="w-3 h-3" /> On-Time Rate
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border p-4 text-center">
          <div className="text-3xl font-bold text-text-1 mb-1">{metrics.acceptanceRate}%</div>
          <div className="flex items-center justify-center gap-1 text-xs text-text-4">
            <ThumbsUp className="w-3 h-3" /> Acceptance Rate
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border p-4 text-center">
          <div className="text-3xl font-bold text-amber-500 mb-1">{metrics.rating}</div>
          <div className="flex items-center justify-center gap-1 text-xs text-text-4">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> Rating
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border p-4 text-center">
          <div className="text-3xl font-bold text-text-1 mb-1">{metrics.completedJobs}</div>
          <div className="flex items-center justify-center gap-1 text-xs text-text-4">
            <CheckCircle className="w-3 h-3" /> Completed Jobs
          </div>
        </div>
      </div>

      {/* Tier Card */}
      <div className="bg-gradient-to-br from-navy to-[#0D1F3C] rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-5 h-5 text-orange" />
              <span className="text-xs text-white/50">Current Tier</span>
            </div>
            <h2 className="text-2xl font-syne font-700">{metrics.tier}</h2>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/50">Next Tier</p>
            <p className="font-bold text-orange">{metrics.nextTier}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-white/60 mb-1">
            <span>Progress to {metrics.nextTier}</span>
            <span>{metrics.tierProgress}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-orange rounded-full transition-all" style={{ width: `${metrics.tierProgress}%` }} />
          </div>
        </div>

        {/* Tier Benefits */}
        <div>
          <p className="text-xs text-white/50 mb-2">Current Benefits</p>
          <div className="grid sm:grid-cols-2 gap-2">
            {currentTierBenefits.map((benefit, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-white/80">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" />
                {benefit}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tier Comparison */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-bold text-sm text-text-1">Tier Comparison</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-gray-50">
                <th className="text-left px-4 py-3 text-xs text-text-4 font-medium">Benefit</th>
                <th className="text-center px-4 py-3 text-xs text-text-4 font-medium">New</th>
                <th className="text-center px-4 py-3 text-xs text-text-4 font-medium">Verified</th>
                <th className="text-center px-4 py-3 text-xs text-text-4 font-medium">Trusted</th>
                <th className="text-center px-4 py-3 text-xs text-text-4 font-medium">Premium</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                { label: "Job Access", values: ["Basic", "Priority", "Premium", "Exclusive"] },
                { label: "Payout Rate", values: ["Standard", "Higher", "Top", "Highest"] },
                { label: "Support", values: ["Email", "Phone", "Priority", "Dedicated Manager"] },
                { label: "Payout Schedule", values: ["Weekly", "Weekly", "Daily", "Instant"] },
                { label: "Insurance", values: ["—", "—", "Covered", "Full Coverage"] },
                { label: "Fuel Subsidy", values: ["—", "—", "—", "Included"] },
              ].map(row => (
                <tr key={row.label}>
                  <td className="px-4 py-3 text-xs font-medium text-text-1">{row.label}</td>
                  {row.values.map((v, i) => (
                    <td key={i} className={`text-center px-4 py-3 text-xs ${
                      i === 1 && metrics.tier === "Verified" ? "text-orange font-bold" :
                      v === "—" ? "text-text-4" : "text-text-2"
                    }`}>{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ==================== FUEL & PROFITABILITY ==================== */
function FuelTab() {
  const [fuelData, setFuelData] = useState<{
    currentPrice: number;
    breakEvenPrice: number;
    monthlyFuelCost: number;
    monthlyEarnings: number;
    profitMargin: number;
    routes: Array<{ name: string; distance: number; fuelCost: number; payout: number; profitable: boolean }>;
  } | null>(null);

  useEffect(() => {
    setFuelData({
      currentPrice: 1150,
      breakEvenPrice: 1400,
      monthlyFuelCost: 285000,
      monthlyEarnings: 450000,
      profitMargin: 36.7,
      routes: [
        { name: "Lagos → Abuja", distance: 750, fuelCost: 301300, payout: 85000, profitable: false },
        { name: "Lagos → Ibadan", distance: 130, fuelCost: 52600, payout: 25000, profitable: true },
        { name: "Abuja → Port Harcourt", distance: 620, fuelCost: 249100, payout: 72000, profitable: true },
      ],
    });
  }, []);

  if (!fuelData) return <div className="flex items-center justify-center py-16"><div className="w-6 h-6 border-2 border-gray-300 border-t-[#FF6B00] rounded-full animate-spin" /></div>;

  const headroom = fuelData.breakEvenPrice - fuelData.currentPrice;
  const headroomPercent = fuelData.breakEvenPrice > 0 ? (headroom / fuelData.breakEvenPrice) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-lg text-text-1">Fuel & Profitability</h3>
            <p className="text-xs text-text-4 mt-1">Monitor diesel prices and route profitability</p>
          </div>
          <a href="/logistics/fuel" className="px-4 h-9 bg-orange text-white text-sm font-bold rounded-lg hover:bg-orange/90 transition-colors">View Full Dashboard</a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-[10px] text-text-4 uppercase tracking-wider mb-1">Current Diesel</p>
            <p className="text-xl font-bold text-text-1">₦{fuelData.currentPrice.toLocaleString()}<span className="text-xs font-normal text-text-4">/L</span></p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-[10px] text-text-4 uppercase tracking-wider mb-1">Break-Even Price</p>
            <p className="text-xl font-bold text-text-1">₦{fuelData.breakEvenPrice.toLocaleString()}<span className="text-xs font-normal text-text-4">/L</span></p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-[10px] text-text-4 uppercase tracking-wider mb-1">Headroom</p>
            <p className={`text-xl font-bold ${headroom > 100 ? "text-green-700" : headroom > 0 ? "text-amber-600" : "text-red"}`}>₦{headroom.toLocaleString()}<span className="text-xs font-normal text-text-4">/L</span></p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-[10px] text-text-4 uppercase tracking-wider mb-1">Profit Margin</p>
            <p className={`text-xl font-bold ${fuelData.profitMargin > 25 ? "text-green-700" : fuelData.profitMargin > 10 ? "text-amber-600" : "text-red"}`}>{fuelData.profitMargin}%</p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-text-4">Fuel Price vs Break-Even</span>
            <span className="text-text-4">{Math.round(headroomPercent)}% headroom</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, (fuelData.currentPrice / fuelData.breakEvenPrice) * 100)}%`, backgroundColor: headroom > 100 ? "#16a34a" : headroom > 0 ? "#d97706" : "#dc2626" }} />
          </div>
        </div>

        <h4 className="font-semibold text-sm text-text-1 mb-3">Route Profitability</h4>
        <div className="space-y-2">
          {fuelData.routes.map((route, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${route.profitable ? "bg-green" : "bg-red"}`} />
                <div>
                  <p className="text-sm font-medium text-text-1">{route.name}</p>
                  <p className="text-[10px] text-text-4">{route.distance}km • Fuel: ₦{route.fuelCost.toLocaleString()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-text-1">₦{route.payout.toLocaleString()}</p>
                <p className={`text-[10px] font-medium ${route.profitable ? "text-green-700" : "text-red"}`}>{route.profitable ? "Profitable" : "Unprofitable"}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FleetManagementTab() {
  const vehicles = [
    { id: "VH-001", name: "Honda CB500X", type: "Motorcycle", registration: "ABC-123-XY", plate: "LAG-456", capacity: "10 kg", status: "active", fuel: 78, mileage: 34200 },
    { id: "VH-002", name: "Toyota HiAce", type: "Van", registration: "DEF-789-WZ", plate: "ABJ-789", capacity: "500 kg", status: "active", fuel: 62, mileage: 58100 },
    { id: "VH-003", name: "Yamaha Tracer 7", type: "Motorcycle", registration: "GHI-012-UV", plate: "PHC-012", capacity: "12 kg", status: "maintenance", fuel: 45, mileage: 28900 },
    { id: "VH-004", name: "Ford Transit", type: "Truck", registration: "JKL-345-RS", plate: "KAN-345", capacity: "1500 kg", status: "active", fuel: 91, mileage: 72400 },
    { id: "VH-005", name: "Bajaj Boxer", type: "Motorcycle", registration: "MNO-678-TQ", plate: "IBD-678", capacity: "8 kg", status: "inactive", fuel: 30, mileage: 41200 },
  ];

  const maintenance = [
    { vehicle: "Yamaha Tracer 7", task: "Engine Oil Change", due: "2026-07-02", priority: "high" },
    { vehicle: "Toyota HiAce", task: "Brake Pad Replacement", due: "2026-07-10", priority: "medium" },
    { vehicle: "Honda CB500X", task: "Chain Lubrication", due: "2026-07-15", priority: "low" },
    { vehicle: "Ford Transit", task: "Tire Rotation", due: "2026-07-20", priority: "medium" },
  ];

  const statusStyles: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    maintenance: "bg-amber-100 text-amber-700",
    inactive: "bg-gray-100 text-text-4",
  };

  const priorityStyles: Record<string, string> = {
    high: "bg-red-100 text-red",
    medium: "bg-amber-100 text-amber-700",
    low: "bg-blue-100 text-blue",
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-border p-4 text-center">
          <p className="text-3xl font-bold text-text-1">5</p>
          <p className="text-xs text-text-4 mt-1">Total Vehicles</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4 text-center">
          <p className="text-3xl font-bold text-green-700">188,800</p>
          <p className="text-xs text-text-4 mt-1">Total km Driven</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4 text-center">
          <p className="text-3xl font-bold text-orange">82%</p>
          <p className="text-xs text-text-4 mt-1">Utilization Rate</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm text-text-1">Fleet Vehicles</h3>
        <button className="flex items-center gap-1.5 px-4 py-2 bg-orange text-white text-xs font-bold rounded-lg hover:bg-orange/90 transition-colors">
          <Truck className="w-3.5 h-3.5" /> Add Vehicle
        </button>
      </div>

      <div className="space-y-3">
        {vehicles.map(v => (
          <div key={v.id} className="bg-white rounded-xl border border-border p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-navy/10 flex items-center justify-center">
                  <Truck className="w-5 h-5 text-navy" />
                </div>
                <div>
                  <p className="text-sm font-bold text-text-1">{v.name}</p>
                  <p className="text-[10px] text-text-4">{v.id} · {v.type}</p>
                </div>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusStyles[v.status]}`}>{v.status}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
              <div>
                <p className="text-[10px] text-text-4">Registration</p>
                <p className="text-xs font-medium text-text-1">{v.registration}</p>
              </div>
              <div>
                <p className="text-[10px] text-text-4">Plate</p>
                <p className="text-xs font-medium text-text-1">{v.plate}</p>
              </div>
              <div>
                <p className="text-[10px] text-text-4">Capacity</p>
                <p className="text-xs font-medium text-text-1">{v.capacity}</p>
              </div>
              <div>
                <p className="text-[10px] text-text-4">Mileage</p>
                <p className="text-xs font-medium text-text-1">{v.mileage.toLocaleString()} km</p>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span className="text-text-4">Fuel Level</span>
                <span className={`font-medium ${v.fuel > 50 ? "text-green-700" : v.fuel > 25 ? "text-amber-600" : "text-red"}`}>{v.fuel}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${v.fuel}%`, backgroundColor: v.fuel > 50 ? "#16a34a" : v.fuel > 25 ? "#d97706" : "#dc2626" }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-border">
        <div className="p-4 border-b border-border">
          <h3 className="font-bold text-sm text-text-1">Maintenance Schedule</h3>
        </div>
        <div className="divide-y divide-border">
          {maintenance.map((m, i) => (
            <div key={i} className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange/10 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-orange" />
                </div>
                <div>
                  <p className="text-xs font-bold text-text-1">{m.task}</p>
                  <p className="text-[10px] text-text-4">{m.vehicle} · Due {m.due}</p>
                </div>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${priorityStyles[m.priority]}`}>{m.priority}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DeliveryStatsTab() {
  const summary = {
    totalDeliveries: 1247,
    onTimeRate: 94.2,
    avgTime: 38,
    rating: 4.9,
  };

  const weeklyData = [
    { day: "Mon", count: 42 },
    { day: "Tue", count: 56 },
    { day: "Wed", count: 48 },
    { day: "Thu", count: 63 },
    { day: "Fri", count: 71 },
    { day: "Sat", count: 58 },
    { day: "Sun", count: 35 },
  ];

  const maxCount = Math.max(...weeklyData.map(d => d.count));

  const statusBreakdown = [
    { label: "Delivered", count: 1102, pct: 88.4, color: "bg-green-500" },
    { label: "In Transit", count: 89, pct: 7.1, color: "bg-blue" },
    { label: "Failed", count: 34, pct: 2.7, color: "bg-red" },
    { label: "Returned", count: 22, pct: 1.8, color: "bg-amber-500" },
  ];

  const routes = [
    { route: "Ikeja → VI", deliveries: 186, onTime: 96, avgTime: 32 },
    { route: "Marina → Lekki", deliveries: 142, onTime: 93, avgTime: 41 },
    { route: "Surulere → Yaba", deliveries: 128, onTime: 97, avgTime: 25 },
    { route: "VI → Ajah", deliveries: 98, onTime: 89, avgTime: 52 },
    { route: "Ikorodu → mainland", deliveries: 87, onTime: 91, avgTime: 45 },
  ];

  const hourlyData = [
    { hour: "6AM", vol: 12 }, { hour: "7AM", vol: 28 }, { hour: "8AM", vol: 45 },
    { hour: "9AM", vol: 62 }, { hour: "10AM", vol: 78 }, { hour: "11AM", vol: 85 },
    { hour: "12PM", vol: 70 }, { hour: "1PM", vol: 55 }, { hour: "2PM", vol: 48 },
    { hour: "3PM", vol: 52 }, { hour: "4PM", vol: 68 }, { hour: "5PM", vol: 74 },
    { hour: "6PM", vol: 58 }, { hour: "7PM", vol: 35 }, { hour: "8PM", vol: 18 },
  ];

  const maxVol = Math.max(...hourlyData.map(h => h.vol));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-border p-4 text-center">
          <div className="w-8 h-8 rounded-lg bg-navy/10 flex items-center justify-center mx-auto mb-2">
            <Package className="w-4 h-4 text-navy" />
          </div>
          <p className="text-2xl font-bold text-text-1">{summary.totalDeliveries.toLocaleString()}</p>
          <p className="text-[10px] text-text-4">Total Deliveries</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4 text-center">
          <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center mx-auto mb-2">
            <CheckCircle className="w-4 h-4 text-green-700" />
          </div>
          <p className="text-2xl font-bold text-green-700">{summary.onTimeRate}%</p>
          <p className="text-[10px] text-text-4">On-Time Rate</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4 text-center">
          <div className="w-8 h-8 rounded-lg bg-orange/10 flex items-center justify-center mx-auto mb-2">
            <Clock className="w-4 h-4 text-orange" />
          </div>
          <p className="text-2xl font-bold text-orange">{summary.avgTime} min</p>
          <p className="text-[10px] text-text-4">Avg Delivery Time</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4 text-center">
          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center mx-auto mb-2">
            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-500">{summary.rating}</p>
          <p className="text-[10px] text-text-4">Customer Rating</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="font-bold text-sm text-text-1 mb-4">Weekly Deliveries</h3>
        <div className="flex items-end gap-2 h-40">
          {weeklyData.map(d => (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] font-medium text-text-1">{d.count}</span>
              <div className="w-full rounded-t-md transition-all" style={{ height: `${(d.count / maxCount) * 100}%`, backgroundColor: d.day === "Fri" ? "#FF6B00" : "#0A1628" }} />
              <span className="text-[10px] text-text-4">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="font-bold text-sm text-text-1 mb-4">Delivery by Status</h3>
        <div className="space-y-3">
          {statusBreakdown.map(s => (
            <div key={s.label}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-text-3 font-medium">{s.label}</span>
                <span className="text-text-4">{s.count} ({s.pct}%)</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-bold text-sm text-text-1">Route Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-gray-50">
                <th className="text-left px-4 py-3 text-xs text-text-4 font-medium">Route</th>
                <th className="text-center px-4 py-3 text-xs text-text-4 font-medium">Deliveries</th>
                <th className="text-center px-4 py-3 text-xs text-text-4 font-medium">On-Time %</th>
                <th className="text-center px-4 py-3 text-xs text-text-4 font-medium">Avg Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {routes.map((r, i) => (
                <tr key={i}>
                  <td className="px-4 py-3 text-xs font-medium text-text-1">{r.route}</td>
                  <td className="text-center px-4 py-3 text-xs text-text-2">{r.deliveries}</td>
                  <td className="text-center px-4 py-3">
                    <span className={`text-xs font-medium ${r.onTime >= 95 ? "text-green-700" : r.onTime >= 90 ? "text-amber-600" : "text-red"}`}>{r.onTime}%</span>
                  </td>
                  <td className="text-center px-4 py-3 text-xs text-text-2">{r.avgTime} min</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="font-bold text-sm text-text-1 mb-4">Delivery Volume by Hour</h3>
        <div className="flex items-end gap-1 h-32">
          {hourlyData.map(h => (
            <div key={h.hour} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full rounded-t-md transition-all" style={{ height: `${(h.vol / maxVol) * 100}%`, backgroundColor: h.vol > 70 ? "#FF6B00" : h.vol > 40 ? "#0A1628" : "#94a3b8" }} />
              <span className="text-[8px] text-text-4">{h.hour}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ==================== SETTINGS ==================== */
function SettingsTab() {
  const [online, setOnline] = useState(true);
  const [notifications, setNotifications] = useState({ push: true, sms: true, email: false });
  const [workingHours, setWorkingHours] = useState({ start: "06:00", end: "20:00" });

  return (
    <div className="space-y-4">
      {/* Availability */}
      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="font-bold text-sm text-text-1 mb-4">Availability</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {online ? <Wifi className="w-5 h-5 text-green-600" /> : <WifiOff className="w-5 h-5 text-red" />}
            <div>
              <p className="text-sm font-medium text-text-1">Online / Offline</p>
              <p className="text-xs text-text-4">{online ? "You're accepting delivery requests" : "You're not accepting deliveries"}</p>
            </div>
          </div>
          <button
            onClick={() => setOnline(!online)}
            className={`relative w-12 h-6 rounded-full transition-colors ${online ? "bg-green-500" : "bg-gray-300"}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${online ? "translate-x-6" : "translate-x-0.5"}`} />
          </button>
        </div>
      </div>

      {/* Working Hours */}
      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="font-bold text-sm text-text-1 mb-4">Working Hours</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-text-4 block mb-1">Start Time</label>
            <input type="time" value={workingHours.start} onChange={e => setWorkingHours(w => ({ ...w, start: e.target.value }))} className="w-full h-10 px-3 border border-border rounded-lg text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-text-4 block mb-1">End Time</label>
            <input type="time" value={workingHours.end} onChange={e => setWorkingHours(w => ({ ...w, end: e.target.value }))} className="w-full h-10 px-3 border border-border rounded-lg text-sm" />
          </div>
        </div>
      </div>

      {/* Coverage Area */}
      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="font-bold text-sm text-text-1 mb-4">Coverage Area</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-text-4 block mb-1">Base Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-4" />
              <input defaultValue="Lagos, Nigeria" className="w-full h-10 pl-9 pr-3 border border-border rounded-lg text-sm" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-text-4 block mb-1">Delivery Radius</label>
            <select defaultValue="15" className="w-full h-10 px-3 border border-border rounded-lg text-sm">
              {["5", "10", "15", "20", "25", "30", "50", "100"].map(r => <option key={r} value={r}>{r} km</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Vehicle Details */}
      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="font-bold text-sm text-text-1 mb-4">Vehicle Details</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-medium text-text-4 block mb-1">Vehicle Type</label>
            <input defaultValue="Motorcycle" className="w-full h-10 px-3 border border-border rounded-lg text-sm bg-gray-50" readOnly />
          </div>
          <div>
            <label className="text-xs font-medium text-text-4 block mb-1">Registration</label>
            <input defaultValue="ABC-123-XY" className="w-full h-10 px-3 border border-border rounded-lg text-sm bg-gray-50" readOnly />
          </div>
          <div>
            <label className="text-xs font-medium text-text-4 block mb-1">Max Capacity</label>
            <input defaultValue="10 kg" className="w-full h-10 px-3 border border-border rounded-lg text-sm bg-gray-50" readOnly />
          </div>
        </div>
      </div>

      {/* Bank Account */}
      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="font-bold text-sm text-text-1 mb-4">Bank Account</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-medium text-text-4 block mb-1">Bank Name</label>
            <input defaultValue="GTBank" className="w-full h-10 px-3 border border-border rounded-lg text-sm bg-gray-50" readOnly />
          </div>
          <div>
            <label className="text-xs font-medium text-text-4 block mb-1">Account Number</label>
            <input defaultValue="0123456789" className="w-full h-10 px-3 border border-border rounded-lg text-sm bg-gray-50" readOnly />
          </div>
          <div>
            <label className="text-xs font-medium text-text-4 block mb-1">Account Name</label>
            <input defaultValue="John Doe" className="w-full h-10 px-3 border border-border rounded-lg text-sm bg-gray-50" readOnly />
          </div>
        </div>
        <div className="mt-3">
          <button className="px-4 py-2 bg-navy text-white font-bold rounded-lg hover:bg-navy/90 transition-colors text-xs">Update Bank Details</button>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="font-bold text-sm text-text-1 mb-4">Notification Preferences</h3>
        <div className="space-y-3">
          {[
            { key: "push" as const, label: "Push Notifications", desc: "Receive job alerts in-app", icon: Bell },
            { key: "sms" as const, label: "SMS Notifications", desc: "Get job alerts via SMS", icon: Phone },
            { key: "email" as const, label: "Email Notifications", desc: "Weekly summary & updates", icon: Mail },
          ].map(item => {
            const Icon = item.icon;
            return (
              <div key={item.key} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-text-4" />
                  <div>
                    <p className="text-sm font-medium text-text-1">{item.label}</p>
                    <p className="text-xs text-text-4">{item.desc}</p>
                  </div>
                </div>
                <button
                  onClick={() => setNotifications(n => ({ ...n, [item.key]: !n[item.key] }))}
                  className={`relative w-10 h-5 rounded-full transition-colors ${notifications[item.key] ? "bg-orange" : "bg-gray-300"}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${notifications[item.key] ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Save Button */}
      <button className="w-full py-3 bg-navy text-white font-bold rounded-xl hover:bg-navy/90 transition-colors text-sm">Save Settings</button>
    </div>
  );
}
