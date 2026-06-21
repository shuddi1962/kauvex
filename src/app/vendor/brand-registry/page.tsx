"use client";

import { useState } from "react";
import { Shield, Upload, Award, FileText, Search, CheckCircle, XCircle, Clock, AlertTriangle, Plus, Trash2, ExternalLink, Globe, Image, Building2, AlertCircle } from "lucide-react";
import VendorShell from "@/components/vendor/vendor-shell";

const enrollmentStatus = "approved";

const benefits = [
  { label: "A+ Content (EBC)", desc: "Enhanced brand storytelling on product pages", active: true },
  { label: "Sponsored Brands", desc: "Custom brand ads with logo and headline", active: true },
  { label: "Brand Store", desc: "Multi-page brand destination", active: true },
  { label: "Brand Analytics", desc: "Brand health and search analytics", active: true },
  { label: "Brand Protection", desc: "Automated counterfeit detection", active: false },
  { label: "Vine Program", desc: "Early reviewer access", active: true },
];

const demoReported = [
  { id: "RPT-001", listing: "Premium Marine GPS", seller: "OceanGear", brand: "NavPro", date: "2026-06-15", status: "investigating" },
  { id: "RPT-002", listing: "Yacht Anchor Chain 20mm", seller: "MarineMart", brand: "AnchorKing", date: "2026-06-10", status: "resolved" },
  { id: "RPT-003", listing: "LED Navigation Lights (Set)", seller: "BoatPartsPro", brand: "Lumitec", date: "2026-06-05", status: "pending" },
];

export default function BrandRegistryPage() {
  const [tab, setTab] = useState<"enroll" | "benefits" | "report">("benefits");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [form, setForm] = useState({ brandName: "", trademarkNo: "", trademarkOffice: "", website: "" });
  const [reported, setReported] = useState(demoReported);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleEnroll = () => {
    if (!form.brandName || !form.trademarkNo || !form.trademarkOffice) {
      showToast("Please fill in all required fields", "error");
      return;
    }
    showToast("Enrollment submitted successfully! Pending review.", "success");
  };

  const inputCls = "w-full px-3 py-2.5 border border-border rounded-lg text-sm text-text-1 placeholder:text-text-4 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20";

  return (
    <VendorShell title="Brand Registry" subtitle="Protect and grow your brand on KAUVEX">
      {toast && (
        <div className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 ${
          toast.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
        }`}>
          {toast.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.message}
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Status Banner */}
        <div className={`rounded-xl border p-4 flex items-start gap-3 ${
          enrollmentStatus === "approved" ? "bg-green-50 border-green-200" :
          enrollmentStatus === "pending" ? "bg-amber-50 border-amber-200" :
          "bg-gray-50 border-gray-200"
        }`}>
          {enrollmentStatus === "approved" ? (
            <CheckCircle size={20} className="text-green-600 shrink-0 mt-0.5" />
          ) : enrollmentStatus === "pending" ? (
            <Clock size={20} className="text-amber-600 shrink-0 mt-0.5" />
          ) : (
            <Shield size={20} className="text-gray-400 shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-semibold text-sm text-text-1">
              {enrollmentStatus === "approved" ? "Brand Registered" :
               enrollmentStatus === "pending" ? "Enrollment Pending Review" :
               "Not Enrolled"}
            </p>
            <p className="text-xs text-text-4 mt-0.5">
              {enrollmentStatus === "approved" ? "Your brand is verified. All benefits are now available." :
               enrollmentStatus === "pending" ? "Our team is reviewing your trademark documents. This usually takes 2-3 business days." :
               "Register your brand to unlock exclusive selling benefits and brand protection tools."}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto">
          <button onClick={() => setTab("benefits")} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${tab === "benefits" ? "bg-orange text-white" : "bg-white border border-border text-text-3 hover:border-orange"}`}>
            <Award size={14} className="inline mr-1.5" /> Benefits
          </button>
          <button onClick={() => setTab("enroll")} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${tab === "enroll" ? "bg-orange text-white" : "bg-white border border-border text-text-3 hover:border-orange"}`}>
            <Shield size={14} className="inline mr-1.5" /> Enrollment
          </button>
          <button onClick={() => setTab("report")} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${tab === "report" ? "bg-orange text-white" : "bg-white border border-border text-text-3 hover:border-orange"}`}>
            <AlertTriangle size={14} className="inline mr-1.5" /> Counterfeit Reports
          </button>
        </div>

        {/* Benefits Tab */}
        {tab === "benefits" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {benefits.map((b) => (
              <div key={b.label} className={`bg-white rounded-xl border p-5 ${b.active ? "border-border" : "border-gray-200 opacity-60"}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${b.active ? "bg-orange/10 text-orange" : "bg-gray-100 text-gray-400"}`}>
                    <Award size={15} />
                  </div>
                  {b.active ? <CheckCircle size={14} className="text-green-500" /> : <Clock size={14} className="text-gray-300" />}
                </div>
                <h4 className="text-sm font-bold text-text-1">{b.label}</h4>
                <p className="text-xs text-text-4 mt-1">{b.desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* Enrollment Tab */}
        {tab === "enroll" && (
          <div className="bg-white rounded-xl border border-border p-6 max-w-2xl">
            <h3 className="font-bold text-base text-text-1 mb-1">Brand Enrollment Form</h3>
            <p className="text-xs text-text-4 mb-6">Provide your trademark details to enroll in Brand Registry</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-2 mb-1.5">Brand Name *</label>
                <input value={form.brandName} onChange={(e) => setForm({ ...form, brandName: e.target.value })} className={inputCls} placeholder="e.g. NavPro Marine" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-2 mb-1.5">Trademark Registration Number *</label>
                  <input value={form.trademarkNo} onChange={(e) => setForm({ ...form, trademarkNo: e.target.value })} className={inputCls} placeholder="e.g. TM-123456789" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-2 mb-1.5">Trademark Office / Country *</label>
                  <select value={form.trademarkOffice} onChange={(e) => setForm({ ...form, trademarkOffice: e.target.value })} className={inputCls}>
                    <option value="">Select office...</option>
                    <option value="USPTO">USPTO (United States)</option>
                    <option value="EUIPO">EUIPO (European Union)</option>
                    <option value="UKIPO">UKIPO (United Kingdom)</option>
                    <option value="CIPO">CIPO (Canada)</option>
                    <option value="WIPO">WIPO (International)</option>
                    <option value="JPO">JPO (Japan)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-2 mb-1.5">Official Brand Website URL</label>
                <div className="relative">
                  <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
                  <input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className={`${inputCls} pl-10`} placeholder="https://www.yourbrand.com" />
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-xs font-semibold text-text-3 mb-3 flex items-center gap-1"><Upload size={14} /> Document Upload</p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Proof of Trademark", desc: "PDF or image of registration certificate" },
                    { label: "Brand Logo / Packaging", desc: "Product images showing brand logo" },
                  ].map((doc) => (
                    <div key={doc.label} className="h-28 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-orange/40 transition-colors">
                      <Image size={20} className="text-gray-300 mb-1" />
                      <span className="text-xs font-medium text-text-3">{doc.label}</span>
                      <span className="text-[9px] text-text-4 mt-0.5">{doc.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={handleEnroll} className="w-full py-3 bg-orange text-white font-bold rounded-xl hover:bg-orange/90 transition-all">
                <Shield size={16} className="inline mr-2" /> Submit Enrollment
              </button>
            </div>
          </div>
        )}

        {/* Counterfeit Reports Tab */}
        {tab === "report" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-border p-6">
              <h3 className="font-bold text-base text-text-1 mb-1">Report Counterfeit Listing</h3>
              <p className="text-xs text-text-4 mb-4">Submit suspected counterfeit listings for investigation</p>

              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-text-2 mb-1.5">Product Listing URL *</label>
                  <input className={inputCls} placeholder="https://kauvex.com/product/..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-2 mb-1.5">Seller Name</label>
                  <input className={inputCls} placeholder="e.g. OceanGear" />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-text-2 mb-1.5">Reason for Report *</label>
                <select className={inputCls}>
                  <option value="">Select reason...</option>
                  <option value="counterfeit">Suspected Counterfeit Product</option>
                  <option value="trademark">Trademark Infringement</option>
                  <option value="unauthorized">Unauthorized Reseller</option>
                  <option value="quality">Quality / Safety Concern</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-text-2 mb-1.5">Additional Details</label>
                <textarea className={`${inputCls} min-h-[80px]`} placeholder="Provide any additional information or evidence..." rows={3} />
              </div>
              <div className="flex items-center gap-3">
                <label className="h-28 w-28 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-orange/40 transition-colors">
                  <Upload size={16} className="text-gray-300 mb-1" />
                  <span className="text-[9px] text-text-4">Upload Evidence</span>
                </label>
                <button onClick={() => showToast("Report submitted for investigation", "success")} className="px-6 py-2.5 bg-orange text-white font-bold rounded-xl hover:bg-orange/90 transition-all">
                  <AlertTriangle size={14} className="inline mr-1.5" /> Submit Report
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-border overflow-x-auto">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="font-semibold text-sm text-text-1">Your Reported Listings</h3>
                <span className="text-xs text-text-4">{reported.length} reports</span>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-gray-50 text-left">
                    <th className="px-4 py-3 text-[10px] font-semibold text-text-4 uppercase tracking-wider">Report ID</th>
                    <th className="px-4 py-3 text-[10px] font-semibold text-text-4 uppercase tracking-wider">Listing</th>
                    <th className="px-4 py-3 text-[10px] font-semibold text-text-4 uppercase tracking-wider">Seller</th>
                    <th className="px-4 py-3 text-[10px] font-semibold text-text-4 uppercase tracking-wider">Brand</th>
                    <th className="px-4 py-3 text-[10px] font-semibold text-text-4 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-[10px] font-semibold text-text-4 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-[10px] font-semibold text-text-4 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody>
                  {reported.map((r) => (
                    <tr key={r.id} className="border-b border-border hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-text-1">{r.id}</td>
                      <td className="px-4 py-3 text-xs text-text-2">{r.listing}</td>
                      <td className="px-4 py-3 text-xs text-text-2">{r.seller}</td>
                      <td className="px-4 py-3 text-xs text-text-2">{r.brand}</td>
                      <td className="px-4 py-3 text-xs text-text-4">{new Date(r.date).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          r.status === "resolved" ? "bg-green-100 text-green-700" :
                          r.status === "investigating" ? "bg-blue-100 text-blue" :
                          "bg-amber-100 text-amber-700"
                        }`}>{r.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <button className="text-orange hover:underline text-xs flex items-center gap-1"><ExternalLink size={12} /> View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </VendorShell>
  );
}
