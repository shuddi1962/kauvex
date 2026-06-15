"use client";

import { useState } from "react";
import {
  Shield,
  Search,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MessageSquare,
  Send,
  Upload,
  FileText,
  Package,
  Store,
  User,
  Calendar,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import AdminShell from "@/components/admin/admin-shell";

const disputeData = [
  { id: "DIS-A7K2", customer: "John Okafor", vendor: "TechMart NG", type: "Item Not Received", status: "Open", opened: "Jun 5, 2026", deadline: "Jun 12, 2026", evidence: [{ name: "package_photo.jpg", description: "Photo of empty delivery box" }, { name: "tracking_screenshot.png", description: "Tracking showing delivered but nothing received" }], vendorResponse: "", orderAmount: "₦345,000" },
  { id: "DIS-B3M9", customer: "Amina Bello", vendor: "FashionHub", type: "Not as Described", status: "Under Review", opened: "Jun 3, 2026", deadline: "Jun 10, 2026", evidence: [{ name: "item_photo_1.jpg", description: "Color mismatch - ordered blue, received green" }, { name: "listing_screenshot.jpg", description: "Screenshot of the original listing showing blue" }], vendorResponse: "We apologize for the mix-up. A replacement has been shipped.", orderAmount: "₦128,500" },
  { id: "DIS-C5X8", customer: "David Chen", vendor: "GadgetPro", type: "Damaged", status: "Open", opened: "Jun 4, 2026", deadline: "Jun 11, 2026", evidence: [{ name: "damage_photo.jpg", description: "Cracked screen on arrival" }, { name: "box_damage.jpg", description: "Outer box showing impact damage" }], vendorResponse: "", orderAmount: "₦2,450,000" },
  { id: "DIS-D2P4", customer: "Grace Nwankwo", vendor: "HomeEssentials", type: "Wrong Item", status: "Resolved", opened: "May 28, 2026", deadline: "Jun 4, 2026", evidence: [{ name: "received_item.jpg", description: "Received a toaster instead of a blender" }], vendorResponse: "Full refund has been processed. We will arrange return pickup.", orderAmount: "₦67,800" },
  { id: "DIS-E9R1", customer: "Emmanuel Ude", vendor: "AutoParts NG", type: "Item Not Received", status: "Under Review", opened: "Jun 1, 2026", deadline: "Jun 8, 2026", evidence: [{ name: "order_confirmation.png", description: "Order confirmation showing 7 day delivery" }, { name: "chat_logs.png", description: "Vendor communication log" }], vendorResponse: "Item was dispatched on time. We are investigating with the courier.", orderAmount: "₦890,000" },
  { id: "DIS-F6T7", customer: "Sarah Adeyemi", vendor: "BeautyBay", type: "Damaged", status: "Resolved", opened: "May 25, 2026", deadline: "Jun 1, 2026", evidence: [{ name: "leakage_photo.jpg", description: "Product leaked during transit" }], vendorResponse: "Partial refund of 50% issued as mutually agreed.", orderAmount: "₦45,200" },
  { id: "DIS-G3W2", customer: "Michael Obi", vendor: "SportZone", type: "Not as Described", status: "Open", opened: "Jun 6, 2026", deadline: "Jun 13, 2026", evidence: [{ name: "size_comparison.jpg", description: "Size difference between listed and received" }], vendorResponse: "", orderAmount: "₦210,000" },
];

const statusStyles: Record<string, string> = {
  Open: "bg-amber-50 text-amber-700 border-amber-200",
  "Under Review": "bg-blue-50 text-blue-700 border-blue-200",
  Resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const typeIcons: Record<string, typeof AlertTriangle> = {
  "Item Not Received": Package,
  "Not as Described": Search,
  "Damaged": AlertTriangle,
  "Wrong Item": XCircle,
};

export default function AdminDisputes() {
  const [statusTab, setStatusTab] = useState("All");
  const [selectedDispute, setSelectedDispute] = useState<string | null>(null);
  const [vendorResponse, setVendorResponse] = useState("");
  const [decisionNotes, setDecisionNotes] = useState("");
  const [partialPercent, setPartialPercent] = useState("");

  const tabs = ["All", "Open", "Under Review", "Resolved"];

  const filtered = statusTab === "All" ? disputeData : disputeData.filter((d) => d.status === statusTab);

  const stats = {
    total: disputeData.length,
    open: disputeData.filter((d) => d.status === "Open").length,
    underReview: disputeData.filter((d) => d.status === "Under Review").length,
    resolved: disputeData.filter((d) => d.status === "Resolved").length,
  };

  return (
    <AdminShell title="Disputes" subtitle="Manage buyer protection cases">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-text-4 font-medium">Total Disputes</p>
            <div className="w-8 h-8 rounded-lg bg-navy/5 flex items-center justify-center">
              <Shield size={16} className="text-navy" />
            </div>
          </div>
          <p className="font-bold text-2xl text-text-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-text-4 font-medium">Open</p>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <Clock size={16} className="text-amber-600" />
            </div>
          </div>
          <p className="font-bold text-2xl text-amber-600">{stats.open}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-text-4 font-medium">Under Review</p>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Search size={16} className="text-blue" />
            </div>
          </div>
          <p className="font-bold text-2xl text-blue">{stats.underReview}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-text-4 font-medium">Resolved</p>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <CheckCircle size={16} className="text-emerald-600" />
            </div>
          </div>
          <p className="font-bold text-2xl text-emerald-600">{stats.resolved}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusTab === tab ? "bg-navy text-white" : "bg-white text-text-3 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {tab}
            {tab !== "All" && (
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                statusTab === tab ? "bg-white/20 text-white" : "bg-gray-100 text-text-4"
              }`}>
                {tab === "Open" ? stats.open : tab === "Under Review" ? stats.underReview : stats.resolved}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
            <select className="w-full pl-9 pr-8 py-2 border border-gray-200 rounded-lg text-sm text-text-2 appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-blue/20">
              <option>All Types</option>
              <option>Item Not Received</option>
              <option>Not as Described</option>
              <option>Damaged</option>
              <option>Wrong Item</option>
            </select>
            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-4 pointer-events-none" />
          </div>
          <div className="relative">
            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
            <input type="date" className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm text-text-2 focus:outline-none focus:ring-2 focus:ring-blue/20" />
          </div>
          <div className="relative">
            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
            <input type="date" className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm text-text-2 focus:outline-none focus:ring-2 focus:ring-blue/20" />
          </div>
          <div className="relative">
            <Store size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
            <select className="pl-9 pr-8 py-2 border border-gray-200 rounded-lg text-sm text-text-2 appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-blue/20">
              <option>All Storefronts</option>
              <option>KAUVEX</option>
              <option>TechMart NG</option>
              <option>FashionHub</option>
            </select>
            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-4 pointer-events-none" />
          </div>
          <div className="relative">
            <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
            <input
              type="text"
              placeholder="Vendor name..."
              className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm text-text-2 focus:outline-none focus:ring-2 focus:ring-blue/20 w-40"
            />
          </div>
        </div>
      </div>

      {/* Disputes Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left text-[11px] text-text-4 font-semibold uppercase tracking-wider px-4 py-3">Case #</th>
                <th className="text-left text-[11px] text-text-4 font-semibold uppercase tracking-wider px-4 py-3">Customer</th>
                <th className="text-left text-[11px] text-text-4 font-semibold uppercase tracking-wider px-4 py-3">Vendor</th>
                <th className="text-left text-[11px] text-text-4 font-semibold uppercase tracking-wider px-4 py-3">Type</th>
                <th className="text-left text-[11px] text-text-4 font-semibold uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-left text-[11px] text-text-4 font-semibold uppercase tracking-wider px-4 py-3">Opened</th>
                <th className="text-left text-[11px] text-text-4 font-semibold uppercase tracking-wider px-4 py-3">Deadline</th>
                <th className="text-right text-[11px] text-text-4 font-semibold uppercase tracking-wider px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((dispute) => {
                const TypeIcon = typeIcons[dispute.type] || AlertTriangle;
                const isExpanded = selectedDispute === dispute.id;
                return (
                  <tr key={dispute.id} className="border-b border-gray-50 last:border-0">
                    <td colSpan={8} className="p-0">
                      <button
                        onClick={() => setSelectedDispute(isExpanded ? null : dispute.id)}
                        className="w-full flex items-center px-4 py-3.5 hover:bg-gray-50/50 transition-colors text-left"
                      >
                        <span className="w-[120px] font-mono text-sm font-medium text-text-1 shrink-0">{dispute.id}</span>
                        <span className="w-[140px] text-sm text-text-1 shrink-0">{dispute.customer}</span>
                        <span className="w-[140px] text-sm text-text-2 shrink-0">{dispute.vendor}</span>
                        <span className="w-[160px] flex items-center gap-2 shrink-0">
                          <TypeIcon size={14} className="text-text-4 shrink-0" />
                          <span className="text-sm text-text-2 truncate">{dispute.type}</span>
                        </span>
                        <span className="w-[120px] shrink-0">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles[dispute.status] || "bg-gray-50 text-gray-700 border-gray-200"}`}>
                            {dispute.status}
                          </span>
                        </span>
                        <span className="w-[110px] text-sm text-text-3 shrink-0">{dispute.opened}</span>
                        <span className="w-[110px] text-sm text-text-3 shrink-0">{dispute.deadline}</span>
                        <span className="flex-1 flex justify-end">
                          {isExpanded ? <ChevronUp size={16} className="text-text-4" /> : <ChevronDown size={16} className="text-text-4" />}
                        </span>
                      </button>

                      {/* Expanded Detail Panel */}
                      {isExpanded && (
                        <div className="bg-gray-50/70 border-t border-b border-gray-100 px-6 py-5">
                          <div className="grid lg:grid-cols-3 gap-6">
                            {/* Customer Evidence */}
                            <div>
                              <h4 className="text-xs font-semibold text-text-4 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Upload size={13} /> Customer Evidence
                              </h4>
                              <div className="space-y-3">
                                {dispute.evidence.map((ev, i) => (
                                  <div key={i} className="bg-white rounded-lg border border-gray-200 p-3">
                                    <div className="w-full h-24 bg-gray-100 rounded-lg mb-2 flex items-center justify-center">
                                      <FileText size={24} className="text-text-4" />
                                    </div>
                                    <p className="text-sm font-medium text-text-1">{ev.name}</p>
                                    <p className="text-xs text-text-4">{ev.description}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Vendor Response */}
                            <div>
                              <h4 className="text-xs font-semibold text-text-4 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <MessageSquare size={13} /> Vendor Response
                              </h4>
                              <div className="bg-white rounded-lg border border-gray-200 p-3">
                                {dispute.vendorResponse ? (
                                  <div className="flex items-start gap-3 mb-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                      <Store size={14} className="text-blue" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-text-1">{dispute.vendor}</p>
                                      <p className="text-xs text-text-4 mt-1">{dispute.vendorResponse}</p>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-xs text-text-4 italic">No response yet</p>
                                )}
                                <textarea
                                  value={vendorResponse}
                                  onChange={(e) => setVendorResponse(e.target.value)}
                                  placeholder="Type vendor response..."
                                  rows={3}
                                  className="w-full mt-3 border border-gray-200 rounded-lg p-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue/20 focus:border-blue"
                                />
                                <div className="flex justify-end mt-2">
                                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue text-white rounded-lg text-xs font-medium hover:bg-blue-600 transition-colors">
                                    <Send size={12} /> Send to Vendor
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Decision Panel */}
                            <div>
                              <h4 className="text-xs font-semibold text-text-4 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Shield size={13} /> Decision
                              </h4>
                              <div className="bg-white rounded-lg border border-gray-200 p-3 space-y-3">
                                <div className="flex items-center gap-2">
                                  <button className="flex-1 px-3 py-2 bg-red text-white rounded-lg text-xs font-medium hover:bg-red-600 transition-colors">
                                    Full Refund
                                  </button>
                                  <button className="flex-1 px-3 py-2 bg-orange text-white rounded-lg text-xs font-medium hover:bg-orange-600 transition-colors">
                                    Partial Refund
                                  </button>
                                  <button className="flex-1 px-3 py-2 bg-gray-200 text-text-3 rounded-lg text-xs font-medium hover:bg-gray-300 transition-colors">
                                    Reject
                                  </button>
                                </div>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    value={partialPercent}
                                    onChange={(e) => setPartialPercent(e.target.value)}
                                    placeholder="%"
                                    min="1"
                                    max="100"
                                    className="w-16 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange"
                                  />
                                  <span className="text-xs text-text-4">partial refund %</span>
                                </div>
                                <textarea
                                  value={decisionNotes}
                                  onChange={(e) => setDecisionNotes(e.target.value)}
                                  placeholder="Decision notes..."
                                  rows={2}
                                  className="w-full border border-gray-200 rounded-lg p-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue/20 focus:border-blue"
                                />
                                <button className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-blue text-white rounded-lg text-xs font-medium hover:bg-blue-600 transition-colors">
                                  <Send size={12} /> Send Decision
                                </button>
                              </div>
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
            <Shield className="w-12 h-12 text-text-4 mx-auto mb-3" />
            <h3 className="font-semibold text-text-1 mb-1">No disputes found</h3>
            <p className="text-sm text-text-3">Try adjusting your filters</p>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/30">
          <p className="text-xs text-text-4">Showing {filtered.length} of {disputeData.length} disputes</p>
          <div className="flex items-center gap-1">
            <button className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors">
              <ChevronLeft size={14} className="text-text-4" />
            </button>
            <button className="w-7 h-7 bg-navy text-white rounded-lg text-xs font-medium">1</button>
            <button className="w-7 h-7 hover:bg-gray-200 rounded-lg text-xs text-text-3 font-medium">2</button>
            <button className="w-7 h-7 hover:bg-gray-200 rounded-lg text-xs text-text-3 font-medium">3</button>
            <button className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors">
              <ChevronRight size={14} className="text-text-4" />
            </button>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
