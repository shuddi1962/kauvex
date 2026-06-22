"use client";
import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import VendorShell from "@/components/vendor/vendor-shell";
import { Upload, FileText, Shield, CheckCircle, Clock, AlertCircle, X, ArrowLeft, ChevronRight, Loader2, Package } from "lucide-react";

function ApprovalRequestForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const productId = searchParams.get("productId");
  const prefillBrand = searchParams.get("brand") || "";
  const prefillCategory = searchParams.get("category") || "";

  const [category, setCategory] = useState(prefillCategory);
  const [brand, setBrand] = useState(prefillBrand);
  const [contactEmail, setContactEmail] = useState("");
  const [documentType, setDocumentType] = useState<"invoice" | "authorization">("invoice");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const tokenRes = await fetch("/api/auth/session-token");
        const { token } = await tokenRes.json();
        if (!token) return;
        const res = await fetch("/api/v1/vendors/approval-requests", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (json.data) setRequests(json.data);
      } catch {}
    };
    fetchRequests();
  }, []);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!category.trim()) { showToast("error", "Category is required"); return; }
    if (!brand.trim()) { showToast("error", "Brand is required"); return; }
    if (!contactEmail.trim()) { showToast("error", "Contact email is required"); return; }

    setSubmitting(true);
    try {
      const tokenRes = await fetch("/api/auth/session-token");
      const { token } = await tokenRes.json();
      if (!token) { showToast("error", "Not authenticated"); return; }

      const res = await fetch("/api/v1/vendors/approval-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          product_id: productId || "new",
          category_name: category,
          brand_name: brand,
          contact_email: contactEmail,
        }),
      });
      const json = await res.json();
      if (!res.ok) { showToast("error", json.error || "Failed to submit"); return; }

      showToast("success", "Approval request submitted!");

      // Redirect to offer page after short delay
      if (productId) {
        setTimeout(() => router.push(`/vendor/products/${productId}/offer`), 1500);
      }
    } catch {
      showToast("error", "Network error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <VendorShell title="Approval Request" subtitle="Request permission to sell in gated categories and brands">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm flex items-center gap-2 ${
          toast.type === "success" ? "bg-green-600" : "bg-red-600"
        }`}>
          {toast.type === "success" ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
          {toast.message}
        </div>
      )}

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Breadcrumb */}
        {productId && (
          <div className="flex items-center gap-2 text-xs text-text-4">
            <Link href="/vendor/catalog" className="hover:text-text-1 transition-colors">Catalog</Link>
            <ChevronRight size={10} />
            <span className="text-text-2 font-semibold">Approval Request</span>
          </div>
        )}

        {/* Info banner */}
        <div className="bg-amber-50 border border-amber/20 rounded-xl p-4 flex items-start gap-3">
          <Shield size={18} className="text-amber shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-800">
              {productId ? "Approval needed to list this product" : "You need approval to sell"}
            </p>
            <p className="text-xs text-amber-700">
              {productId
                ? "This product is in a gated category. Submit your details below and we'll review your application. Once approved, you'll be able to create an offer."
                : "Some categories and brands require approval before listing. Submit documentation below to request access. Approval usually takes 2-3 business days."}
            </p>
          </div>
        </div>

        {/* Product preview */}
        {productId && prefillBrand && (
          <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
              <Package size={18} className="text-text-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-text-1">{prefillBrand} product</p>
              <p className="text-xs text-text-4">Category: {category || "N/A"} · Brand: {brand}</p>
            </div>
          </div>
        )}

        {/* Request form */}
        <div className="bg-white rounded-xl border border-border p-6">
          <h3 className="font-bold text-base text-text-1 mb-1">Submit Approval Application</h3>
          <p className="text-xs text-text-4 mb-4">Fill in the details below to request approval to sell this product.</p>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-text-2 block mb-1">Category *</label>
                <select value={category} onChange={e => setCategory(e.target.value)}
                  className="w-full h-10 px-3 border border-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange/20">
                  <option value="">Select Category</option>
                  <option value="Surveillance & CCTV">Surveillance & CCTV</option>
                  <option value="Fire Alarm Systems">Fire Alarm Systems</option>
                  <option value="Access Control">Access Control</option>
                  <option value="Marine Accessories">Marine Accessories</option>
                  <option value="Networking">Networking</option>
                  <option value="Solar & Power">Solar & Power</option>
                  <option value="Safety Equipment">Safety Equipment</option>
                  <option value="UPS & Inverters">UPS & Inverters</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-text-2 block mb-1">Brand *</label>
                <input value={brand} onChange={e => setBrand(e.target.value)} placeholder="e.g. Hikvision"
                  className="w-full h-10 px-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange/20" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-text-2 block mb-1">Contact Email *</label>
              <input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)}
                placeholder="vendor@example.com"
                className="w-full h-10 px-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange/20" />
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
            <button onClick={handleSubmit} disabled={submitting}
              className="px-6 h-10 bg-orange text-white text-sm font-bold rounded-xl hover:bg-orange/90 transition-colors flex items-center gap-2 disabled:opacity-50">
              {submitting ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}
              {submitting ? "Submitting..." : "Submit Application"}
            </button>
            {productId && (
              <Link href={`/vendor/products/${productId}/offer`}
                className="px-6 h-10 border border-border text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors flex items-center">
                Skip to Offer
              </Link>
            )}
          </div>
        </div>

        {/* Existing requests */}
        {requests.length > 0 && (
          <div className="bg-white rounded-xl border border-border p-5">
            <h3 className="font-bold text-sm text-text-1 mb-4">Your Approval Requests</h3>
            <div className="space-y-3">
              {requests.map((r: any) => (
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
                      <p className="text-xs font-bold text-text-1">{r.category_name || "General"}</p>
                      <p className="text-[10px] text-text-4">Brand: {r.brand_name || "N/A"} · {new Date(r.created_at).toLocaleDateString()}</p>
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
        )}
      </div>
    </VendorShell>
  );
}

export default function ApprovalRequestPage() {
  return (
    <Suspense fallback={
      <VendorShell title="Approval Request" subtitle="Loading...">
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-text-4" />
        </div>
      </VendorShell>
    }>
      <ApprovalRequestForm />
    </Suspense>
  );
}
