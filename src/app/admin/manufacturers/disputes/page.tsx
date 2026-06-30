"use client";

import { useState } from "react";
import {
  Shield, Search, ChevronDown, ChevronUp, Clock, CheckCircle,
  AlertTriangle, MessageSquare, Send, FileText, Package, Store,
  Calendar, Filter, X, Loader2, Upload, Eye,
} from "lucide-react";
import AdminShell from "@/components/admin/admin-shell";

const disputeData = [
  {
    id: "MDIS-001", orderNumber: "ORD-MFG-8842", type: "Quality Issue",
    raisedBy: "Buyer (John Okafor)", manufacturer: "Shenzhen Electronics Co",
    status: "Open", opened: "2026-06-25", deadline: "2026-07-02",
    orderAmount: "$45,200", description: "Received batch of 500 USB-C connectors with defective pins. 15% failure rate on QC test.",
    evidence: [
      { name: "qc_failure_report.pdf", description: "QC test results showing 15% failure rate" },
      { name: "defective_batch_photos.jpg", description: "Photos of defective connectors" },
    ],
    productionPhotos: ["production_line_batch.jpg", "packaging_before_ship.jpg"],
    communication: [
      { sender: "buyer", name: "John Okafor", message: "Batch received with quality issues. 15% defective rate.", date: "2026-06-25" },
      { sender: "manufacturer", name: "Li Wei", message: "We apologize. Can you send the QC report? We will investigate.", date: "2026-06-26" },
    ],
  },
  {
    id: "MDIS-002", orderNumber: "ORD-MFG-8839", type: "Late Delivery",
    raisedBy: "Buyer (Amina Bello)", manufacturer: "Tiruppur Textiles Ltd",
    status: "Under Review", opened: "2026-06-22", deadline: "2026-06-29",
    orderAmount: "$28,900", description: "Order was due on June 15th. Still not shipped as of June 22nd. 7 days late.",
    evidence: [
      { name: "order_confirmation.pdf", description: "Original order with June 15 delivery date" },
      { name: "no_shipment_proof.png", description: "Screenshot showing no tracking info" },
    ],
    productionPhotos: ["warehouse_stock_pile.jpg"],
    communication: [
      { sender: "buyer", name: "Amina Bello", message: "Order is 7 days overdue. Please provide updated timeline.", date: "2026-06-22" },
      { sender: "manufacturer", name: "Priya Sharma", message: "Raw material delay. New delivery date: June 28th.", date: "2026-06-23" },
      { sender: "buyer", name: "Amina Bello", message: "Unacceptable. Need compensation for late delivery.", date: "2026-06-24" },
    ],
  },
  {
    id: "MDIS-003", orderNumber: "ORD-MFG-8835", type: "Wrong Specification",
    raisedBy: "Buyer (David Chen)", manufacturer: "Guangzhou Plastics Ltd",
    status: "Open", opened: "2026-06-20", deadline: "2026-06-27",
    orderAmount: "$12,800", description: "Ordered 1000kg of HDPE pellets in blue (Pantone 2945C). Received green (Pantone 347C).",
    evidence: [
      { name: "color_mismatch.jpg", description: "Side-by-side color comparison" },
      { name: "original_order_form.pdf", description: "Order form specifying Pantone 2945C blue" },
    ],
    productionPhotos: [],
    communication: [
      { sender: "buyer", name: "David Chen", message: "Color mismatch. Ordered blue, received green.", date: "2026-06-20" },
    ],
  },
  {
    id: "MDIS-004", orderNumber: "ORD-MFG-8830", type: "Payment Dispute",
    raisedBy: "Manufacturer (Tokyo Components)", buyer: "Kauvex Buyer Account #4421",
    status: "Resolved", opened: "2026-06-10", deadline: "2026-06-17",
    orderAmount: "$152,000", description: "Manufacturer claims full payment not received. Escrow shows partial release.",
    evidence: [
      { name: "bank_statement.pdf", description: "Manufacturer bank statement" },
      { name: "escrow_log.pdf", description: "Escrow transaction log" },
    ],
    productionPhotos: [],
    communication: [
      { sender: "manufacturer", name: "Yuki Tanaka", message: "Payment of $50,800 still pending from escrow.", date: "2026-06-10" },
      { sender: "admin", name: "Kauvex Admin", message: "Reviewing escrow records. Will resolve within 48 hours.", date: "2026-06-11" },
    ],
    resolution: { type: "Full Release", notes: "Escrow logs confirmed partial release error. Full $152,000 released to manufacturer.", resolvedBy: "Admin Team", resolvedDate: "2026-06-14" },
  },
  {
    id: "MDIS-005", orderNumber: "ORD-MFG-8828", type: "Quality Issue",
    raisedBy: "Buyer (Grace Nwankwo)", manufacturer: "Istanbul Ceramics GmbH",
    status: "Open", opened: "2026-06-28", deadline: "2026-07-05",
    orderAmount: "$37,500", description: "Ceramic tiles have hairline cracks. Approx 20% of shipment damaged.",
    evidence: [
      { name: "cracked_tiles_1.jpg", description: "Close-up of hairline cracks" },
      { name: "cracked_tiles_2.jpg", description: "Batch inspection photos" },
      { name: "unboxing_video.mp4", description: "Video of unboxing showing pre-existing cracks" },
    ],
    productionPhotos: ["kiln_inspection.jpg", "final_qc_pass.jpg"],
    communication: [
      { sender: "buyer", name: "Grace Nwankwo", message: "20% of tiles have hairline cracks. Unacceptable quality.", date: "2026-06-28" },
      { sender: "manufacturer", name: "Hans Mueller", message: "Surprising. Our QC passed all tiles. Possible transit damage?", date: "2026-06-29" },
    ],
  },
];

const statusStyles: Record<string, string> = {
  Open: "bg-amber-50 text-amber-700 border-amber-200",
  "Under Review": "bg-blue-50 text-blue-700 border-blue-200",
  Resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const typeIcons: Record<string, typeof AlertTriangle> = {
  "Quality Issue": AlertTriangle,
  "Late Delivery": Clock,
  "Wrong Specification": Package,
  "Payment Dispute": Shield,
};

export default function AdminManufacturerDisputesPage() {
  const [statusTab, setStatusTab] = useState("All");
  const [selectedDispute, setSelectedDispute] = useState<string | null>(null);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolveForm, setResolveForm] = useState({ type: "", notes: "" });
  const [resolving, setResolving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const tabs = ["All", "Open", "Under Review", "Resolved"];

  const filtered = disputeData.filter((d) => {
    const matchStatus = statusTab === "All" || d.status === statusTab;
    const matchSearch = d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.orderNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const stats = {
    total: disputeData.length,
    open: disputeData.filter((d) => d.status === "Open").length,
    underReview: disputeData.filter((d) => d.status === "Under Review").length,
    resolved: disputeData.filter((d) => d.status === "Resolved").length,
  };

  const activeDispute = disputeData.find((d) => d.id === selectedDispute);

  const handleResolve = async () => {
    if (!resolveForm.type || !activeDispute) return;
    setResolving(true);
    try {
      const res = await fetch(`/api/v1/admin/manufacturers/disputes/${activeDispute.id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resolveForm),
      });
      if (res.ok) {
        setShowResolveModal(false);
        setSelectedDispute(null);
        setResolveForm({ type: "", notes: "" });
      }
    } catch {
      // silent
    } finally {
      setResolving(false);
    }
  };

  return (
    <AdminShell title="Manufacturer Disputes" subtitle="Resolve buyer-manufacturer disputes">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Disputes", value: String(stats.total), icon: Shield, color: "bg-blue-50 text-blue" },
          { label: "Open", value: String(stats.open), icon: Clock, color: "bg-amber-50 text-amber-700" },
          { label: "Under Review", value: String(stats.underReview), icon: Search, color: "bg-blue-50 text-blue-700" },
          { label: "Resolved", value: String(stats.resolved), icon: CheckCircle, color: "bg-emerald-50 text-emerald-700" },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-500 font-medium">{kpi.label}</p>
                <div className={`w-8 h-8 rounded-lg ${kpi.color} flex items-center justify-center`}>
                  <Icon size={16} />
                </div>
              </div>
              <p className="font-bold text-xl text-gray-900">{kpi.value}</p>
            </div>
          );
        })}
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusTab === tab ? "bg-[#0A1628] text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {tab}
            {tab !== "All" && (
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                statusTab === tab ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
              }`}>
                {tab === "Open" ? stats.open : tab === "Under Review" ? stats.underReview : stats.resolved}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by dispute ID or order number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
          />
        </div>
      </div>

      {/* Disputes Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left text-[11px] text-gray-500 font-semibold uppercase tracking-wider px-4 py-3">Dispute #</th>
                <th className="text-left text-[11px] text-gray-500 font-semibold uppercase tracking-wider px-4 py-3">Order #</th>
                <th className="text-left text-[11px] text-gray-500 font-semibold uppercase tracking-wider px-4 py-3">Type</th>
                <th className="text-left text-[11px] text-gray-500 font-semibold uppercase tracking-wider px-4 py-3">Raised By</th>
                <th className="text-left text-[11px] text-gray-500 font-semibold uppercase tracking-wider px-4 py-3">Date</th>
                <th className="text-left text-[11px] text-gray-500 font-semibold uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-right text-[11px] text-gray-500 font-semibold uppercase tracking-wider px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((dispute) => {
                const TypeIcon = typeIcons[dispute.type] || AlertTriangle;
                const isExpanded = selectedDispute === dispute.id;
                return (
                  <tr key={dispute.id} className="border-b border-gray-50 last:border-0">
                    <td colSpan={7} className="p-0">
                      <button
                        onClick={() => setSelectedDispute(isExpanded ? null : dispute.id)}
                        className="w-full flex items-center px-4 py-3.5 hover:bg-gray-50/50 transition-colors text-left"
                      >
                        <span className="w-[120px] font-mono text-sm font-medium text-gray-900 shrink-0">{dispute.id}</span>
                        <span className="w-[140px] font-mono text-xs text-gray-600 shrink-0">{dispute.orderNumber}</span>
                        <span className="w-[150px] flex items-center gap-2 shrink-0">
                          <TypeIcon size={14} className="text-gray-400 shrink-0" />
                          <span className="text-sm text-gray-700 truncate">{dispute.type}</span>
                        </span>
                        <span className="w-[150px] text-sm text-gray-600 shrink-0 truncate">{dispute.raisedBy}</span>
                        <span className="w-[100px] text-sm text-gray-500 shrink-0">{dispute.opened}</span>
                        <span className="w-[120px] shrink-0">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles[dispute.status] || "bg-gray-50 text-gray-700 border-gray-200"}`}>
                            {dispute.status}
                          </span>
                        </span>
                        <span className="flex-1 flex justify-end">
                          {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                        </span>
                      </button>

                      {/* Expanded Detail Panel */}
                      {isExpanded && (
                        <div className="bg-gray-50/70 border-t border-b border-gray-100 px-6 py-5">
                          {/* Dispute Info Bar */}
                          <div className="flex items-center gap-4 mb-4 text-sm">
                            <span className="text-gray-600">Amount: <span className="font-semibold text-gray-900">{dispute.orderAmount}</span></span>
                            <span className="text-gray-600">Deadline: <span className="font-semibold text-gray-900">{dispute.deadline}</span></span>
                            {dispute.manufacturer && (
                              <span className="text-gray-600">Manufacturer: <span className="font-semibold text-gray-900">{dispute.manufacturer}</span></span>
                            )}
                          </div>

                          {/* Description */}
                          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Dispute Description</p>
                            <p className="text-sm text-gray-700">{dispute.description}</p>
                          </div>

                          <div className="grid lg:grid-cols-3 gap-6">
                            {/* Evidence */}
                            <div>
                              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Upload size={13} /> Buyer Evidence
                              </h4>
                              <div className="space-y-2">
                                {dispute.evidence.map((ev, i) => (
                                  <div key={i} className="bg-white rounded-lg border border-gray-200 p-3">
                                    <div className="w-full h-20 bg-gray-100 rounded-lg mb-2 flex items-center justify-center">
                                      <FileText size={20} className="text-gray-400" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-900">{ev.name}</p>
                                    <p className="text-xs text-gray-500">{ev.description}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Production Photos & Communication */}
                            <div>
                              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Eye size={13} /> Production Photos
                              </h4>
                              {dispute.productionPhotos.length > 0 ? (
                                <div className="flex flex-wrap gap-2 mb-4">
                                  {dispute.productionPhotos.map((photo, i) => (
                                    <div key={i} className="w-20 h-20 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                                      <FileText size={16} className="text-gray-400" />
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-gray-400 italic mb-4">No production photos</p>
                              )}

                              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <MessageSquare size={13} /> Communication History
                              </h4>
                              <div className="space-y-2">
                                {dispute.communication.map((msg, i) => (
                                  <div key={i} className={`p-3 rounded-lg ${msg.sender === "buyer" ? "bg-blue-50" : msg.sender === "manufacturer" ? "bg-orange-50" : "bg-gray-100"}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xs font-semibold text-gray-900">{msg.name}</span>
                                      <span className="text-[10px] text-gray-500">{msg.date}</span>
                                    </div>
                                    <p className="text-xs text-gray-700">{msg.message}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Resolution Panel */}
                            <div>
                              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Shield size={13} /> Resolution
                              </h4>
                              {dispute.resolution ? (
                                <div className="bg-green-50 rounded-lg border border-green-200 p-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle size={14} className="text-green-600" />
                                    <span className="text-sm font-semibold text-green-800">{dispute.resolution.type}</span>
                                  </div>
                                  <p className="text-xs text-green-700 mb-2">{dispute.resolution.notes}</p>
                                  <p className="text-[10px] text-green-600">Resolved by {dispute.resolution.resolvedBy} on {dispute.resolution.resolvedDate}</p>
                                </div>
                              ) : (
                                <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
                                  <div>
                                    <label className="text-xs font-semibold text-gray-700 mb-1 block">Resolution Type</label>
                                    <select
                                      value={resolveForm.type}
                                      onChange={(e) => setResolveForm({ ...resolveForm, type: e.target.value })}
                                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] bg-white"
                                    >
                                      <option value="">Select resolution...</option>
                                      <option value="full_refund">Full Refund</option>
                                      <option value="partial_refund">Partial Refund</option>
                                      <option value="rework">Rework / Replacement</option>
                                      <option value="rejected">Dispute Rejected</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="text-xs font-semibold text-gray-700 mb-1 block">Notes</label>
                                    <textarea
                                      value={resolveForm.notes}
                                      onChange={(e) => setResolveForm({ ...resolveForm, notes: e.target.value })}
                                      placeholder="Resolution notes..."
                                      rows={3}
                                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
                                    />
                                  </div>
                                  <button
                                    onClick={handleResolve}
                                    disabled={!resolveForm.type || resolving}
                                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-[#FF6B00] text-white rounded-lg text-sm font-semibold hover:bg-[#e55f00] transition-colors disabled:opacity-50"
                                  >
                                    {resolving ? (
                                      <Loader2 size={14} className="animate-spin" />
                                    ) : (
                                      <Send size={14} />
                                    )}
                                    Resolve Dispute
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-700 mb-1">No disputes found</h3>
            <p className="text-sm text-gray-500">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
