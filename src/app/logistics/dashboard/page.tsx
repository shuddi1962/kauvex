"use client";

import { useState } from "react";
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
} from "lucide-react";

type TabId = "available" | "active" | "history" | "earnings" | "performance" | "settings";

export default function LogisticsDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>("available");
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showProofModal, setShowProofModal] = useState(false);
  const [deliveryPin, setDeliveryPin] = useState("");

  const tabs = [
    { id: "available" as TabId, label: "Available Jobs" },
    { id: "active" as TabId, label: "My Active Jobs" },
    { id: "history" as TabId, label: "Job History" },
    { id: "earnings" as TabId, label: "Earnings" },
    { id: "performance" as TabId, label: "Performance" },
    { id: "settings" as TabId, label: "Settings" },
  ];

  return (
    <div>
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
const mockJobs = [
  { id: "JOB-8742", pickup: "Ikeja City Mall, Lagos", dropoff: "VI, Lagos 106104", distance: "12.5 km", weight: "Small (< 2 kg)", payout: 2500, type: "Express", minTier: "New", expiresIn: 14, pickupCode: "PK-482" },
  { id: "JOB-8741", pickup: "Marina, Lagos Island", dropoff: "Lekki Phase 1", distance: "18.2 km", weight: "Medium (2-10 kg)", payout: 3800, type: "Standard", minTier: "Verified", expiresIn: 8, pickupCode: "PK-481" },
  { id: "JOB-8740", pickup: "Surulere, Lagos", dropoff: "Yaba, Lagos", distance: "6.8 km", weight: "Small (< 2 kg)", payout: 1800, type: "Express", minTier: "New", expiresIn: 3, pickupCode: "PK-480" },
  { id: "JOB-8739", pickup: "Apapa Wharf, Lagos", dropoff: "Ikeja GRA", distance: "22 km", weight: "Large (10-50 kg)", payout: 5500, type: "Heavy", minTier: "Trusted", expiresIn: 11, pickupCode: "PK-479" },
  { id: "JOB-8738", pickup: "Victoria Island, Lagos", dropoff: "Ajah, Lagos", distance: "28 km", weight: "Medium (2-10 kg)", payout: 4200, type: "Standard", minTier: "Verified", expiresIn: 6, pickupCode: "PK-478" },
  { id: "JOB-8737", pickup: "Ogba, Ikeja", dropoff: "Maryland, Lagos", distance: "4.5 km", weight: "Small (< 2 kg)", payout: 1500, type: "Express", minTier: "New", expiresIn: 9, pickupCode: "PK-477" },
];

function AvailableJobsTab() {
  const [filters, setFilters] = useState({ type: "all", minPayout: "", maxDistance: "" });
  const [accepted, setAccepted] = useState<string[]>([]);

  const filtered = mockJobs.filter(j => {
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
const activeJobs = [
  { id: "JOB-8742", pickup: "Ikeja City Mall, Lagos", dropoff: "VI, Lagos 106104", status: "picked-up", customer: "Chioma A.", customerPhone: "+234 812 *** 4567", payout: 2500, timeline: ["Assigned", "Arrived at Pickup", "Picked Up", "In Transit", "Delivered"], currentStage: 2 },
  { id: "JOB-8738", pickup: "Victoria Island, Lagos", dropoff: "Ajah, Lagos", status: "assigned", customer: "Emeka O.", customerPhone: "+234 803 *** 7890", payout: 4200, timeline: ["Assigned", "Arrived at Pickup", "Picked Up", "In Transit", "Delivered"], currentStage: 0 },
  { id: "JOB-8735", pickup: "Ikeja GRA, Lagos", dropoff: "Surulere, Lagos", status: "in-transit", customer: "Tolu B.", customerPhone: "+234 909 *** 2345", payout: 3200, timeline: ["Assigned", "Arrived at Pickup", "Picked Up", "In Transit", "Delivered"], currentStage: 3 },
];

function ActiveJobsTab({ onOpenProof, deliveryPin, setDeliveryPin }: { onOpenProof: () => void; deliveryPin: string; setDeliveryPin: (v: string) => void }) {
  const statusColors: Record<string, string> = {
    assigned: "bg-blue-100 text-blue",
    "arrived-pickup": "bg-amber-100 text-amber-700",
    "picked-up": "bg-purple-100 text-purple-700",
    "in-transit": "bg-indigo-100 text-indigo-600",
    delivered: "bg-green-100 text-green-700",
  };

  return (
    <div className="space-y-4">
      {activeJobs.map(job => {
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

      {activeJobs.length === 0 && (
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
const jobHistory = [
  { id: "JOB-8730", date: "2026-06-22", pickup: "Ikeja", dropoff: "VI", payout: 2500, rating: 5, status: "completed" },
  { id: "JOB-8728", date: "2026-06-22", pickup: "Surulere", dropoff: "Yaba", payout: 1800, rating: 4, status: "completed" },
  { id: "JOB-8725", date: "2026-06-21", pickup: "Marina", dropoff: "Lekki", payout: 3800, rating: 5, status: "completed" },
  { id: "JOB-8722", date: "2026-06-21", pickup: "Apapa", dropoff: "Ikeja", payout: 5500, rating: 0, status: "cancelled" },
  { id: "JOB-8720", date: "2026-06-20", pickup: "VI", dropoff: "Ajah", payout: 4200, rating: 5, status: "completed" },
  { id: "JOB-8718", date: "2026-06-20", pickup: "Ogba", dropoff: "Maryland", payout: 1500, rating: 4, status: "completed" },
];

function JobHistoryTab() {
  const [filterStatus, setFilterStatus] = useState("all");

  const filtered = jobHistory.filter(j => filterStatus === "all" || j.status === filterStatus);
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

  const earningsData = {
    today: { earned: 12450, pending: 2500, paid: 9950, jobs: 4 },
    week: { earned: 78200, pending: 23400, paid: 54800, jobs: 18 },
    month: { earned: 285000, pending: 42000, paid: 243000, jobs: 72 },
    all: { earned: 1245000, pending: 0, paid: 1245000, jobs: 340 },
  };

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
