"use client";

import { useState } from "react";
import {
  Shield,
  Plus,
  AlertTriangle,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  ChevronDown,
  Eye,
  Calendar,
  DollarSign,
  Search,
  Filter,
  ArrowRight,
  ChevronRight,
  Upload,
  X,
} from "lucide-react";

interface Claim {
  id: string;
  waybill: string;
  type: "damaged" | "lost" | "delay" | "incorrect";
  status: "submitted" | "under_review" | "evidence_required" | "approved" | "denied" | "resolved";
  filedDate: string;
  amount: number;
  currency: string;
  description: string;
  timeline: Array<{
    date: string;
    status: string;
    note: string;
  }>;
}

const MOCK_CLAIMS: Claim[] = [
  {
    id: "CLM-2026-001",
    waybill: "KVX-20345",
    type: "damaged",
    status: "under_review",
    filedDate: "2026-01-15",
    amount: 45000,
    currency: "NGN",
    description: "Package arrived with visible damage. Item inside was cracked on delivery.",
    timeline: [
      { date: "2026-01-15", status: "submitted", note: "Claim filed by sender" },
      { date: "2026-01-16", status: "under_review", note: "Claim assigned to review team" },
      { date: "2026-01-17", status: "evidence_required", note: "Photos of damage requested" },
    ],
  },
  {
    id: "CLM-2026-002",
    waybill: "KVX-20298",
    type: "lost",
    status: "approved",
    filedDate: "2026-01-10",
    amount: 120000,
    currency: "NGN",
    description: "Package never delivered. Last scan was at sorting facility 7 days ago.",
    timeline: [
      { date: "2026-01-10", status: "submitted", note: "Claim filed" },
      { date: "2026-01-11", status: "under_review", note: "Investigation initiated" },
      { date: "2026-01-13", status: "evidence_required", note: "Delivery proof requested" },
      { date: "2026-01-15", status: "under_review", note: "Courier confirmed package lost" },
      { date: "2026-01-17", status: "approved", note: "Full compensation approved — ₦120,000" },
    ],
  },
  {
    id: "CLM-2026-003",
    waybill: "KVX-20312",
    type: "delay",
    status: "resolved",
    filedDate: "2026-01-08",
    amount: 15000,
    currency: "NGN",
    description: "Express delivery took 8 days instead of promised 2-day delivery.",
    timeline: [
      { date: "2026-01-08", status: "submitted", note: "Delay claim filed" },
      { date: "2026-01-09", status: "under_review", note: "SLA breach confirmed" },
      { date: "2026-01-10", status: "approved", note: "Partial refund of ₦15,000 approved" },
      { date: "2026-01-12", status: "resolved", note: "Refund credited to sender wallet" },
    ],
  },
  {
    id: "CLM-2026-004",
    waybill: "KVX-20401",
    type: "incorrect",
    status: "denied",
    filedDate: "2026-01-05",
    amount: 35000,
    currency: "NGN",
    description: "Wrong item delivered to recipient. Claimed wrong contents.",
    timeline: [
      { date: "2026-01-05", status: "submitted", note: "Incorrect item claim filed" },
      { date: "2026-01-06", status: "under_review", note: "Reviewing package weight at origin" },
      { date: "2026-01-08", status: "denied", note: "Weight matches manifest — claim denied" },
    ],
  },
  {
    id: "CLM-2026-005",
    waybill: "KVX-20420",
    type: "damaged",
    status: "submitted",
    filedDate: "2026-01-18",
    amount: 28000,
    currency: "NGN",
    description: "Electronics arrived non-functional. Possible impact damage during transit.",
    timeline: [
      { date: "2026-01-18", status: "submitted", note: "Claim filed with photos" },
    ],
  },
];

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  damaged: { label: "Damaged", color: "text-red-700", bg: "bg-red-50 border-red-200" },
  lost: { label: "Lost", color: "text-orange-700", bg: "bg-orange-50 border-orange-200" },
  delay: { label: "Delay", color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200" },
  incorrect: { label: "Incorrect Item", color: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  submitted: { label: "Submitted", color: "text-blue-700 bg-blue-50 border-blue-200", icon: FileText },
  under_review: { label: "Under Review", color: "text-yellow-700 bg-yellow-50 border-yellow-200", icon: Clock },
  evidence_required: { label: "Evidence Required", color: "text-orange-700 bg-orange-50 border-orange-200", icon: AlertTriangle },
  approved: { label: "Approved", color: "text-green-700 bg-green-50 border-green-200", icon: CheckCircle2 },
  denied: { label: "Denied", color: "text-red-700 bg-red-50 border-red-200", icon: XCircle },
  resolved: { label: "Resolved", color: "text-gray-700 bg-gray-100 border-gray-200", icon: CheckCircle2 },
};

export default function ClaimsPage() {
  const [claims] = useState<Claim[]>(MOCK_CLAIMS);
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  const [showForm, setShowForm] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    waybill: "",
    type: "damaged",
    description: "",
    estimatedValue: "",
    contactEmail: "",
    contactPhone: "",
  });

  const activeClaims = claims.filter((c) => !["resolved", "denied"].includes(c.status));
  const historyClaims = claims.filter((c) => ["resolved", "denied"].includes(c.status));

  const filteredActive = activeClaims.filter(
    (c) =>
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.waybill.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredHistory = historyClaims.filter(
    (c) =>
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.waybill.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = () => {
    setShowForm(false);
    setFormData({ waybill: "", type: "damaged", description: "", estimatedValue: "", contactEmail: "", contactPhone: "" });
  };

  const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  };

  const timelineStep = (status: string) => {
    const order = ["submitted", "under_review", "evidence_required", "approved", "denied", "resolved"];
    return order.indexOf(status);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1628]">Claims & Disputes</h1>
          <p className="text-sm text-gray-500 mt-1">File and manage shipment compensation claims</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#FF6B00] text-white rounded-lg text-sm font-semibold hover:bg-[#e55f00] transition-colors"
        >
          <Plus className="w-4 h-4" />
          File New Claim
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-gray-200 p-5">
          <div className="text-sm text-gray-500">Active Claims</div>
          <div className="text-2xl font-bold text-[#0A1628] mt-1">{activeClaims.length}</div>
        </div>
        <div className="rounded-xl border border-gray-200 p-5">
          <div className="text-sm text-gray-500">Total Filed Value</div>
          <div className="text-2xl font-bold text-[#0A1628] mt-1">
            {formatCurrency(claims.reduce((sum, c) => sum + c.amount, 0))}
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 p-5">
          <div className="text-sm text-gray-500">Approved</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {claims.filter((c) => c.status === "approved" || c.status === "resolved").length}
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 p-5">
          <div className="text-sm text-gray-500">Pending Review</div>
          <div className="text-2xl font-bold text-yellow-600 mt-1">
            {claims.filter((c) => c.status === "under_review" || c.status === "evidence_required").length}
          </div>
        </div>
      </div>

      {showForm && (
        <div className="rounded-xl border border-gray-200 p-5 bg-white">
          <h2 className="text-lg font-semibold text-[#0A1628] mb-4">File New Claim</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Waybill Number</label>
              <input
                type="text"
                placeholder="e.g. KVX-20481"
                value={formData.waybill}
                onChange={(e) => setFormData((p) => ({ ...p, waybill: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Claim Type</label>
              <div className="relative">
                <select
                  value={formData.type}
                  onChange={(e) => setFormData((p) => ({ ...p, type: e.target.value }))}
                  className="w-full appearance-none px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
                >
                  <option value="damaged">Damaged</option>
                  <option value="lost">Lost</option>
                  <option value="delay">Delay</option>
                  <option value="incorrect">Incorrect Item</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Value (₦)</label>
              <input
                type="number"
                placeholder="e.g. 45000"
                value={formData.estimatedValue}
                onChange={(e) => setFormData((p) => ({ ...p, estimatedValue: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
              <input
                type="email"
                placeholder="e.g. john@example.com"
                value={formData.contactEmail}
                onChange={(e) => setFormData((p) => ({ ...p, contactEmail: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
              <input
                type="tel"
                placeholder="e.g. +234 801 234 5678"
                value={formData.contactPhone}
                onChange={(e) => setFormData((p) => ({ ...p, contactPhone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                placeholder="Describe the issue in detail..."
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] resize-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Supporting Evidence</label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#FF6B00] hover:bg-orange-50/30 cursor-pointer transition-colors">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Click to upload photos, receipts, or documents</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, PDF up to 10MB each</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-5">
            <button
              onClick={handleSubmit}
              className="px-5 py-2.5 bg-[#FF6B00] text-white rounded-lg text-sm font-semibold hover:bg-[#e55f00] transition-colors"
            >
              Submit Claim
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {selectedClaim && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-semibold text-[#0A1628]">{selectedClaim.id}</h2>
                <p className="text-sm text-gray-500">Claim Timeline</p>
              </div>
              <button
                onClick={() => setSelectedClaim(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-4 mb-5 pb-4 border-b border-gray-100">
                <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${TYPE_CONFIG[selectedClaim.type].bg} ${TYPE_CONFIG[selectedClaim.type].color}`}>
                  {TYPE_CONFIG[selectedClaim.type].label}
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_CONFIG[selectedClaim.status].color}`}>
                  {STATUS_CONFIG[selectedClaim.status].label}
                </div>
                <div className="ml-auto text-right">
                  <div className="text-xs text-gray-500">Amount</div>
                  <div className="font-bold text-[#0A1628]">{formatCurrency(selectedClaim.amount)}</div>
                </div>
              </div>

              <div className="text-sm text-gray-600 mb-5 leading-relaxed">{selectedClaim.description}</div>

              <h3 className="font-semibold text-[#0A1628] mb-4">Status Timeline</h3>
              <div className="space-y-0">
                {selectedClaim.timeline.map((event, idx) => {
                  const isLast = idx === selectedClaim.timeline.length - 1;
                  return (
                    <div key={idx} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-3 h-3 rounded-full border-2 shrink-0 ${
                            isLast ? "bg-[#FF6B00] border-[#FF6B00]" : "bg-green-500 border-green-500"
                          }`}
                        />
                        {!isLast && <div className="w-px bg-gray-200 flex-1 my-1" />}
                      </div>
                      <div className={`pb-4 ${isLast ? "" : ""}`}>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-[#0A1628] capitalize">
                            {event.status.replace(/_/g, " ")}
                          </span>
                          <span className="text-xs text-gray-400">{formatDate(event.date)}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-0.5">{event.note}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-1 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("active")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "active"
              ? "border-[#FF6B00] text-[#FF6B00]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Active Claims ({activeClaims.length})
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "history"
              ? "border-[#FF6B00] text-[#FF6B00]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Claim History ({historyClaims.length})
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search claims..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
          />
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Claim ID</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Waybill</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Filed</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Amount</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(activeTab === "active" ? filteredActive : filteredHistory).map((claim) => {
                const StatusIcon = STATUS_CONFIG[claim.status]?.icon || Clock;
                return (
                  <tr key={claim.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-3 px-4 font-mono font-semibold text-[#0A1628]">{claim.id}</td>
                    <td className="py-3 px-4 font-mono text-gray-700">{claim.waybill}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${TYPE_CONFIG[claim.type].bg} ${TYPE_CONFIG[claim.type].color}`}>
                        {TYPE_CONFIG[claim.type].label}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_CONFIG[claim.status].color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {STATUS_CONFIG[claim.status].label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{formatDate(claim.filedDate)}</td>
                    <td className="py-3 px-4 font-medium text-[#0A1628]">{formatCurrency(claim.amount)}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => setSelectedClaim(claim)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {(activeTab === "active" ? filteredActive : filteredHistory).length === 0 && (
          <div className="text-center py-8 text-gray-500">No claims found matching your search.</div>
        )}
      </div>
    </div>
  );
}
