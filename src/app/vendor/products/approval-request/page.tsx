"use client";
import { useState } from "react";
import Link from "next/link";
import VendorShell from "@/components/vendor/vendor-shell";
import { Upload, FileText, Shield, CheckCircle, Clock, AlertCircle, X, ArrowLeft, ChevronRight } from "lucide-react";

const approvalStatuses = [
  { id: 1, category: "Electronics > Marine Radio", brand: "Standard Horizon", status: "pending", submitted: "2024-06-15", note: "Invoice under review" },
  { id: 2, category: "Marine > Anchoring", brand: "Rocna", status: "approved", submitted: "2024-05-20", note: "Approved until 2025-06-20" },
  { id: 3, category: "Automotive > Batteries", brand: "Optima", status: "rejected", submitted: "2024-04-10", note: "Invoice did not meet requirements" },
];

export default function ApprovalRequestPage() {
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [documentType, setDocumentType] = useState<"invoice" | "authorization">("invoice");
  const [file, setFile] = useState<File | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [requests] = useState(approvalStatuses);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (status: "draft" | "submitted") => {
    if (!category.trim()) { showToast("error", "Category is required"); return; }
    if (!brand.trim()) { showToast("error", "Brand is required"); return; }
    if (!contactEmail.trim()) { showToast("error", "Contact email is required"); return; }
    showToast("success", status === "draft" ? "Draft saved" : "Approval request submitted successfully!");
  };

  return (
    <VendorShell title="Approval Request" subtitle="Request permission to sell in gated categories and brands">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
          {toast.message}
        </div>
      )}

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Info banner */}
        <div className="bg-amber-50 border border-amber/20 rounded-xl p-4 flex items-start gap-3">
          <Shield size={18} className="text-amber shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-800">You need approval to sell</p>
            <p className="text-xs text-amber-700">Some categories and brands require approval before listing. Submit documentation below to request access. Approval usually takes 2-3 business days.</p>
          </div>
        </div>

        {/* Request form */}
        <div className="bg-white rounded-xl border border-border p-6">
          <h3 className="font-bold text-base text-text-1 mb-4">New Approval Request</h3>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-text-2 block mb-1">Category *</label>
                <select value={category} onChange={e => setCategory(e.target.value)}
                  className="w-full h-10 px-3 border border-border rounded-lg text-sm bg-white">
                  <option value="">Select Category</option>
                  <option value="electronics_marine_radio">Electronics {`>`} Marine Radio</option>
                  <option value="marine_anchoring">Marine {`>`} Anchoring</option>
                  <option value="automotive_batteries">Automotive {`>`} Batteries</option>
                  <option value="electronics_navigation">Electronics {`>`} Navigation</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-text-2 block mb-1">Brand *</label>
                <input value={brand} onChange={e => setBrand(e.target.value)} placeholder="e.g. Standard Horizon"
                  className="w-full h-10 px-3 border border-border rounded-lg text-sm" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-text-2 block mb-1">Contact Email *</label>
              <input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="vendor@example.com"
                className="w-full h-10 px-3 border border-border rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold text-text-2 block mb-1">Document Type</label>
              <div className="flex gap-2">
                {(["invoice", "authorization"] as const).map(dt => (
                  <button key={dt} onClick={() => setDocumentType(dt)}
                    className={`flex-1 h-10 text-sm font-medium rounded-lg border transition-colors ${
                      documentType === dt ? "bg-orange text-white border-orange" : "bg-white text-text-3 border-border hover:border-orange"
                    }`}>
                    {dt === "invoice" ? "Purchase Invoice" : "Brand Authorization Letter"}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-text-4 mt-1">Upload a recent purchase invoice or a signed authorization letter from the brand.</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-text-2 block mb-1">Upload Document</label>
              <label className="flex items-center gap-3 p-4 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-orange/50 transition-colors">
                <Upload size={20} className="text-text-4" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-text-1">{file ? file.name : "Click to upload"}</p>
                  <p className="text-[10px] text-text-4">PDF, PNG, or JPG (max 10MB)</p>
                </div>
                {file && <button onClick={(e) => { e.preventDefault(); setFile(null); }} className="p-1 hover:bg-gray-100 rounded"><X size={14} className="text-text-4" /></button>}
                <input type="file" accept=".pdf,.png,.jpg,.jpeg" className="hidden" onChange={handleFileChange} />
              </label>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-6 pt-4 border-t border-border">
            <button onClick={() => handleSubmit("submitted")} className="px-6 h-10 bg-orange text-white text-sm font-bold rounded-xl hover:bg-orange/90 transition-colors flex items-center gap-2">
              <CheckCircle size={15} /> Submit
            </button>
            <button onClick={() => handleSubmit("draft")} className="px-6 h-10 border border-border text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">
              Save Draft
            </button>
          </div>
        </div>

        {/* Existing requests */}
        <div className="bg-white rounded-xl border border-border p-5">
          <h3 className="font-bold text-sm text-text-1 mb-4">Your Approval Requests</h3>
          <div className="space-y-3">
            {requests.map(r => (
              <div key={r.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    r.status === "approved" ? "bg-green-100" : r.status === "rejected" ? "bg-red-100" : "bg-amber-100"
                  }`}>
                    {r.status === "approved" ? <CheckCircle size={16} className="text-green-700" /> :
                     r.status === "rejected" ? <AlertCircle size={16} className="text-red-600" /> :
                     <Clock size={16} className="text-amber-700" />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-text-1">{r.category}</p>
                    <p className="text-[10px] text-text-4">Brand: {r.brand} · Submitted {r.submitted}</p>
                    <p className="text-[10px] text-text-4">{r.note}</p>
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-1 rounded-full font-semibold capitalize shrink-0 ${
                  r.status === "approved" ? "bg-green-100 text-green-700" :
                  r.status === "rejected" ? "bg-red-100 text-red-600" :
                  "bg-amber-100 text-amber-700"
                }`}>{r.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </VendorShell>
  );
}
