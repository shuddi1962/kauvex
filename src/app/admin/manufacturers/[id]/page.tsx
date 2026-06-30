"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Building2, Globe, Star, Shield, Package,
  CheckCircle, XCircle, Ban, Clock, DollarSign, Users,
  FileText, TrendingUp, AlertTriangle, Loader2,
} from "lucide-react";
import AdminShell from "@/components/admin/admin-shell";

const sampleManufacturer = {
  id: "m1",
  name: "Shenzhen Electronics Co",
  country: "China",
  city: "Shenzhen",
  category: "Electronics & Components",
  verificationTier: "factory_verified",
  status: "active",
  rating: 4.8,
  totalOrders: 342,
  totalRevenue: 45200000,
  responseRate: 98,
  responseTimeHours: 4,
  yearEstablished: 2008,
  employeeCount: "500-1000",
  factorySize: "12,000 sqm",
  website: "https://sz-electronics.cn",
  contactPerson: "Li Wei",
  contactEmail: "liwei@sz-electronics.cn",
  certifications: ["ISO 9001", "CE", "RoHS", "UL"],
  monthlyCapacity: 200000,
  capacityUtilization: 72,
  defaultMoq: 1000,
  leadTimeDays: 21,
  sampleLeadTimeDays: 7,
  customization: ["Private Label", "Custom Packaging", "OEM", "ODM"],
  currencies: ["USD", "CNY"],
  depositPercentage: 30,
  incoterms: "FOB",
  recentOrders: [
    { id: "MFG-2847", buyer: "GlobalTextile Co.", value: "$17,000", stage: "in_production", date: "2026-06-15" },
    { id: "MFG-2831", buyer: "Shenzhen Imports", value: "$16,000", stage: "quality_control", date: "2026-06-10" },
    { id: "MFG-2819", buyer: "EuroParts GmbH", value: "$18,000", stage: "delivered", date: "2026-06-01" },
  ],
  reviews: [
    { buyer: "GlobalTextile Co.", rating: 5, comment: "Excellent quality and fast production. Highly recommended.", date: "2026-06-20" },
    { buyer: "Shenzhen Imports", rating: 4, comment: "Good communication, minor delay on one batch.", date: "2026-06-18" },
    { buyer: "EuroParts GmbH", rating: 5, comment: "Perfect OEM work. Will order again.", date: "2026-06-12" },
  ],
};

const stageColors: Record<string, string> = {
  confirmed: "bg-blue-100 text-blue-700",
  sourcing: "bg-amber-100 text-amber-700",
  in_production: "bg-purple-100 text-purple-700",
  quality_control: "bg-orange-100 text-orange-700",
  ready_inspection: "bg-cyan-100 text-cyan-700",
  packed: "bg-indigo-100 text-indigo-700",
  dispatched: "bg-green-100 text-green-700",
  delivered: "bg-gray-100 text-gray-600",
};

export default function AdminManufacturerDetailPage({ params }: { params: { id: string } }) {
  const [m] = useState(sampleManufacturer);
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "orders", label: "Orders" },
    { key: "reviews", label: "Reviews" },
    { key: "settings", label: "Settings" },
  ];

  return (
    <AdminShell title={m.name} subtitle={`${m.category} · ${m.country}`}>
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/manufacturers" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft size={16} className="text-gray-500" />
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-lg">{m.country === "China" ? "🇨🇳" : "🌍"}</span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
              m.verificationTier === "factory_verified" ? "bg-green-50 text-green-700 border border-green-200" :
              m.verificationTier === "gold" ? "bg-yellow-50 text-yellow-700 border border-yellow-200" :
              "bg-gray-100 text-gray-600 border border-gray-200"
            }`}>
              <Shield size={10} /> {m.verificationTier.replace("_", " ")}
            </span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
              m.status === "active" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"
            }`}>
              {m.status}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-medium hover:bg-amber-100">
            <Ban size={12} className="inline mr-1" /> Suspend
          </button>
          <button className="px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-medium hover:bg-green-100">
            <CheckCircle size={12} className="inline mr-1" /> Verify
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-[#FF6B00] text-[#FF6B00]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Total Orders", value: String(m.totalOrders), icon: Package, color: "bg-blue-50 text-blue" },
              { label: "Revenue", value: `$${(m.totalRevenue / 1000000).toFixed(1)}M`, icon: DollarSign, color: "bg-green-50 text-green-700" },
              { label: "Avg Rating", value: `${m.rating}★`, icon: Star, color: "bg-yellow-50 text-yellow-700" },
              { label: "Response Rate", value: `${m.responseRate}%`, icon: Users, color: "bg-purple-50 text-purple-700" },
            ].map((kpi) => {
              const Icon = kpi.icon;
              return (
                <div key={kpi.label} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-gray-500">{kpi.label}</p>
                    <div className={`w-8 h-8 rounded-lg ${kpi.color} flex items-center justify-center`}>
                      <Icon size={14} />
                    </div>
                  </div>
                  <p className="font-bold text-lg text-gray-900">{kpi.value}</p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Company Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 size={15} className="text-[#FF6B00]" /> Company Details
              </h3>
              <div className="space-y-3">
                {[
                  { label: "Location", value: `${m.city}, ${m.country}` },
                  { label: "Established", value: String(m.yearEstablished) },
                  { label: "Employees", value: m.employeeCount },
                  { label: "Factory Size", value: m.factorySize },
                  { label: "Website", value: m.website },
                  { label: "Contact", value: `${m.contactPerson} · ${m.contactEmail}` },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                    <span className="text-xs text-gray-500">{item.label}</span>
                    <span className="text-xs font-medium text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Production */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Package size={15} className="text-[#FF6B00]" /> Production Details
              </h3>
              <div className="space-y-3">
                {[
                  { label: "Monthly Capacity", value: `${m.monthlyCapacity.toLocaleString()} units` },
                  { label: "Utilization", value: `${m.capacityUtilization}%` },
                  { label: "Default MOQ", value: `${m.defaultMoq.toLocaleString()} units` },
                  { label: "Lead Time", value: `${m.leadTimeDays} days` },
                  { label: "Sample Lead Time", value: `${m.sampleLeadTimeDays} days` },
                  { label: "Deposit Required", value: `${m.depositPercentage}%` },
                  { label: "Incoterms", value: m.incoterms },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                    <span className="text-xs text-gray-500">{item.label}</span>
                    <span className="text-xs font-medium text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100">
                <p className="text-[10px] text-gray-500 uppercase font-semibold mb-2">Certifications</p>
                <div className="flex flex-wrap gap-1.5">
                  {m.certifications.map((cert) => (
                    <span key={cert} className="px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-[10px] font-medium border border-green-200">{cert}</span>
                  ))}
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100">
                <p className="text-[10px] text-gray-500 uppercase font-semibold mb-2">Customization</p>
                <div className="flex flex-wrap gap-1.5">
                  {m.customization.map((c) => (
                    <span key={c} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-medium">{c}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "orders" && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase">Order</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase">Buyer</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase">Value</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase">Stage</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody>
              {m.recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                  <td className="px-4 py-3 text-xs font-semibold text-gray-900">{order.id}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{order.buyer}</td>
                  <td className="px-4 py-3 text-xs font-medium text-gray-900">{order.value}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${stageColors[order.stage] || "bg-gray-100 text-gray-600"}`}>
                      {order.stage.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{new Date(order.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "reviews" && (
        <div className="space-y-4">
          {m.reviews.map((review, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                    <Users size={14} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">{review.buyer}</p>
                    <p className="text-[10px] text-gray-500">{new Date(review.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} size={14} className={s < review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-200"} />
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">{review.comment}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === "settings" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Manufacturer Settings</h3>
          <div className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Verification Tier</label>
              <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="unverified">Unverified</option>
                <option value="document_verified">Document Verified</option>
                <option value="factory_verified" selected>Factory Verified</option>
                <option value="gold">Gold Manufacturer</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
              <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="active" selected>Active</option>
                <option value="suspended">Suspended</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Commission Rate (%)</label>
              <input type="number" defaultValue={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <button className="px-4 py-2 bg-[#FF6B00] text-white rounded-lg text-xs font-semibold hover:bg-[#e55f00]">
              Save Changes
            </button>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
