"use client";

import { useState } from "react";
import { Shield, AlertTriangle, Bell, BarChart3, MessageSquare, CreditCard, FileText, Clock, X, CheckCircle, TrendingUp, TrendingDown, AlertCircle, Filter, ChevronDown, User, Star } from "lucide-react";
import VendorShell from "@/components/vendor/vendor-shell";

const healthMetrics = [
  { label: "Order Defect Rate", value: "1.2%", target: "< 2%", trend: "up", good: true, current: 1.2, max: 2 },
  { label: "Cancellation Rate", value: "0.5%", target: "< 2.5%", trend: "down", good: true, current: 0.5, max: 2.5 },
  { label: "Late Shipment Rate", value: "2.8%", target: "< 4%", trend: "up", good: true, current: 2.8, max: 4 },
  { label: "Policy Compliance", value: "96%", target: "> 95%", trend: "up", good: true, current: 96, max: 100 },
];

const notifications = [
  { id: "N-001", type: "alert", title: "Order Defect Rate Increasing", desc: "Your ODR has increased from 0.9% to 1.2% this month.", date: "2026-06-20", read: false },
  { id: "N-002", type: "policy", title: "Geographic Sales Restriction Violation", desc: "Product 'Marine GPS' was viewed in restricted region NG.", date: "2026-06-18", read: false },
  { id: "N-003", type: "warning", title: "Business Verification Required", desc: "Please update your business information within 30 days.", date: "2026-06-15", read: true },
  { id: "N-004", type: "policy", title: "Policy Violation: Inaccurate Product Description", desc: "Listing LED-NL-2001 has been flagged for review.", date: "2026-06-12", read: true },
  { id: "N-005", type: "alert", title: "Late Shipment Rate Warning", desc: "Your LSR is approaching the 4% threshold.", date: "2026-06-10", read: true },
];

const chargebacks = [
  { id: "CB-001", order: "ORD-3841", amount: "₦234,500", reason: "Item not as described", customer: "John D.", date: "2026-06-18", status: "disputed" },
  { id: "CB-002", order: "ORD-3820", amount: "₦89,000", reason: "Duplicate charge", customer: "Sarah M.", date: "2026-06-14", status: "pending" },
  { id: "CB-003", order: "ORD-3795", amount: "₦156,000", reason: "Product defective", customer: "Mike R.", date: "2026-06-08", status: "lost" },
];

const atozClaims = [
  { id: "A2Z-001", order: "ORD-3780", amount: "₦45,000", reason: "Late delivery", customer: "Emma W.", date: "2026-06-12", status: "pending" },
  { id: "A2Z-002", order: "ORD-3760", amount: "₦120,000", reason: "Item damaged", customer: "Tom S.", date: "2026-06-05", status: "approved" },
];

const feedbackItems = [
  { id: "F-001", rating: 5, text: "Excellent product! Fast shipping and exactly as described.", customer: "James K.", date: "2026-06-19", product: "Marine GPS Navigator" },
  { id: "F-002", rating: 3, text: "Good quality but packaging was slightly damaged.", customer: "Lisa M.", date: "2026-06-17", product: "Yacht Anchor Chain" },
  { id: "F-003", rating: 4, text: "Works great. Would buy again.", customer: "Alex P.", date: "2026-06-15", product: "LED Navigation Lights" },
  { id: "F-004", rating: 1, text: "Received wrong item. Requesting return.", customer: "Nina R.", date: "2026-06-12", product: "Marine VHF Radio" },
];

export default function AccountHealthPage() {
  const [tab, setTab] = useState<"dashboard" | "notifications" | "chargebacks" | "claims" | "feedback">("dashboard");
  const [dateFilter, setDateFilter] = useState("all");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filteredNotifications = notifications.filter((n) => {
    if (dateFilter === "all") return true;
    const days = parseInt(dateFilter);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return new Date(n.date) >= cutoff;
  });

  const tabs = [
    { id: "dashboard", label: "Health Dashboard", icon: BarChart3 },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "chargebacks", label: "Chargebacks", icon: CreditCard },
    { id: "claims", label: "A-to-Z Claims", icon: FileText },
    { id: "feedback", label: "Feedback", icon: MessageSquare },
  ];

  return (
    <VendorShell title="Account Health" subtitle="Monitor your seller performance and account standing">
      {toast && (
        <div className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 ${
          toast.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
        }`}>
          {toast.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.message}
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Deactivation Warning Banner */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle size={20} className="text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="font-bold text-sm text-red-800">Account Deactivation Warning</p>
              <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">14 days remaining</span>
            </div>
            <p className="text-xs text-red-700 mt-1">Your Order Defect Rate is approaching the threshold. Take corrective action to avoid account deactivation.</p>
            <div className="mt-2 w-full bg-red-200 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-red-600 rounded-full" style={{ width: "60%" }} />
            </div>
          </div>
          <button onClick={() => showToast("Warning dismissed", "success")} className="p-1 hover:bg-red-100 rounded-lg">
            <X size={14} className="text-red-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id as typeof tab)} className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${tab === t.id ? "bg-orange text-white" : "bg-white border border-border text-text-3 hover:border-orange"}`}>
                <Icon size={14} /> {t.label}
              </button>
            );
          })}
        </div>

        {/* Dashboard Tab */}
        {tab === "dashboard" && (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {healthMetrics.map((m) => (
                <div key={m.label} className="bg-white rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-text-4 font-medium">{m.label}</span>
                    {m.trend === "up" ? (
                      <TrendingUp size={14} className={m.good ? "text-green-500" : "text-red-500"} />
                    ) : (
                      <TrendingDown size={14} className={m.good ? "text-green-500" : "text-red-500"} />
                    )}
                  </div>
                  <p className="text-2xl font-bold text-text-1">{m.value}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-text-4">Target: {m.target}</span>
                    <span className={`text-[10px] font-semibold ${m.good ? "text-green-600" : "text-red-600"}`}>
                      {m.good ? "On Track" : "At Risk"}
                    </span>
                  </div>
                  <div className="mt-3 w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div className={`h-full rounded-full ${m.good ? "bg-green-500" : "bg-red-500"}`} style={{ width: `${(m.current / m.max) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Historical Trend */}
            <div className="bg-white rounded-xl border border-border p-5">
              <h3 className="font-bold text-sm text-text-1 mb-4">Historical Trend (Last 30 Days)</h3>
              <div className="h-48 flex items-end gap-2">
                {Array.from({ length: 30 }, (_, i) => {
                  const h = 20 + Math.random() * 60;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full bg-orange/20 rounded-t" style={{ height: `${h}%` }}>
                        <div className="w-full bg-orange rounded-t" style={{ height: `${h * 0.7}%` }} />
                      </div>
                      {i % 5 === 0 && <span className="text-[8px] text-text-4">{i + 1}</span>}
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-4 mt-3 text-[10px] text-text-4">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-orange" /> ODR</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-orange/30" /> LSR</span>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {tab === "notifications" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-text-4" />
              <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="px-3 py-2 border border-border rounded-lg text-sm bg-white focus:outline-none">
                <option value="all">All Time</option>
                <option value="7">Last 7 Days</option>
                <option value="14">Last 14 Days</option>
                <option value="30">Last 30 Days</option>
              </select>
            </div>
            <div className="space-y-2">
              {filteredNotifications.map((n) => (
                <div key={n.id} className={`bg-white rounded-xl border p-4 ${n.read ? "border-border" : "border-orange/30 bg-orange-50/30"}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      n.type === "alert" ? "bg-red-100 text-red-600" :
                      n.type === "policy" ? "bg-amber-100 text-amber-700" :
                      "bg-blue-100 text-blue"
                    }`}>
                      {n.type === "alert" ? <AlertTriangle size={15} /> :
                       n.type === "policy" ? <Shield size={15} /> :
                       <AlertCircle size={15} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-text-1">{n.title}</p>
                        {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-orange" />}
                      </div>
                      <p className="text-xs text-text-4 mt-0.5">{n.desc}</p>
                      <p className="text-[10px] text-text-4 mt-1">{new Date(n.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chargebacks Tab */}
        {tab === "chargebacks" && (
          <div className="bg-white rounded-xl border border-border overflow-x-auto">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold text-sm text-text-1">Chargeback Claims</h3>
              <span className="text-xs text-text-4">{chargebacks.length} claims</span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-gray-50 text-left">
                  <th className="px-4 py-3 text-[10px] font-semibold text-text-4 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-3 text-[10px] font-semibold text-text-4 uppercase tracking-wider">Order</th>
                  <th className="px-4 py-3 text-[10px] font-semibold text-text-4 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-[10px] font-semibold text-text-4 uppercase tracking-wider">Reason</th>
                  <th className="px-4 py-3 text-[10px] font-semibold text-text-4 uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-[10px] font-semibold text-text-4 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-[10px] font-semibold text-text-4 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {chargebacks.map((cb) => (
                  <tr key={cb.id} className="border-b border-border hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-text-1">{cb.id}</td>
                    <td className="px-4 py-3 text-xs text-text-2">{cb.order}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-text-1">{cb.amount}</td>
                    <td className="px-4 py-3 text-xs text-text-4">{cb.reason}</td>
                    <td className="px-4 py-3 text-xs text-text-2">{cb.customer}</td>
                    <td className="px-4 py-3 text-xs text-text-4">{new Date(cb.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        cb.status === "disputed" ? "bg-blue-100 text-blue" :
                        cb.status === "lost" ? "bg-red-100 text-red-600" :
                        "bg-amber-100 text-amber-700"
                      }`}>{cb.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* A-to-Z Claims Tab */}
        {tab === "claims" && (
          <div className="bg-white rounded-xl border border-border overflow-x-auto">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold text-sm text-text-1">A-to-Z Guarantee Claims</h3>
              <span className="text-xs text-text-4">{atozClaims.length} claims</span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-gray-50 text-left">
                  <th className="px-4 py-3 text-[10px] font-semibold text-text-4 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-3 text-[10px] font-semibold text-text-4 uppercase tracking-wider">Order</th>
                  <th className="px-4 py-3 text-[10px] font-semibold text-text-4 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-[10px] font-semibold text-text-4 uppercase tracking-wider">Reason</th>
                  <th className="px-4 py-3 text-[10px] font-semibold text-text-4 uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-[10px] font-semibold text-text-4 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-[10px] font-semibold text-text-4 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {atozClaims.map((cl) => (
                  <tr key={cl.id} className="border-b border-border hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-text-1">{cl.id}</td>
                    <td className="px-4 py-3 text-xs text-text-2">{cl.order}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-text-1">{cl.amount}</td>
                    <td className="px-4 py-3 text-xs text-text-4">{cl.reason}</td>
                    <td className="px-4 py-3 text-xs text-text-2">{cl.customer}</td>
                    <td className="px-4 py-3 text-xs text-text-4">{new Date(cl.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        cl.status === "approved" ? "bg-red-100 text-red-600" :
                        "bg-amber-100 text-amber-700"
                      }`}>{cl.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Feedback Tab */}
        {tab === "feedback" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-text-4">{feedbackItems.length} customer feedback items</p>
              <select className="px-3 py-2 border border-border rounded-lg text-sm bg-white focus:outline-none">
                <option>All Ratings</option>
                <option>5 Star</option>
                <option>4 Star</option>
                <option>3 Star</option>
                <option>2 Star</option>
                <option>1 Star</option>
              </select>
            </div>
            {feedbackItems.map((f) => (
              <div key={f.id} className="bg-white rounded-xl border border-border p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                    <User size={14} className="text-text-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold text-text-1">{f.customer}</p>
                      <span className="text-[10px] text-text-4">{new Date(f.date).toLocaleDateString()}</span>
                      <span className="text-[10px] text-text-4">·</span>
                      <span className="text-[10px] text-text-4">{f.product}</span>
                    </div>
                    <div className="flex items-center gap-0.5 mt-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star key={i} size={12} className={i < f.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"} />
                      ))}
                    </div>
                    <p className="text-xs text-text-2 mt-1">{f.text}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button className="text-[10px] text-green-600 font-semibold hover:underline">Reply</button>
                      <button className="text-[10px] text-orange font-semibold hover:underline">Report</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </VendorShell>
  );
}
