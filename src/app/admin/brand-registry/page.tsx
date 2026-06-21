"use client";

import { useState } from "react";
import AdminShell from "@/components/admin/admin-shell";
import {
  Search, CheckCircle, XCircle, Clock, FileText, User,
  AlertTriangle, Building2, Globe, Eye, X, MessageSquare,
} from "lucide-react";

type ApplicationStatus = "pending" | "approved" | "rejected";

interface BrandApplication {
  id: number;
  vendor: string;
  vendor_email: string;
  brand_name: string;
  trademark_info: string;
  trademark_number: string;
  jurisdiction: string;
  documents: { name: string; url: string }[];
  status: ApplicationStatus;
  notes: string;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

const defaultApplications: BrandApplication[] = [
  {
    id: 1, vendor: "SecureTech NG", vendor_email: "info@securetech.ng",
    brand_name: "SecureGuard", trademark_info: "Registered trademark in Nigeria",
    trademark_number: "NG-TM-2024-45678", jurisdiction: "Nigeria",
    documents: [{ name: "Trademark Certificate", url: "#" }, { name: "Business Registration", url: "#" }],
    status: "pending", notes: "", submitted_at: "2026-06-10", reviewed_at: null, reviewed_by: null,
  },
  {
    id: 2, vendor: "MarinePlus Ltd", vendor_email: "sales@marineplus.com",
    brand_name: "AquaMarine Pro", trademark_info: "Pending trademark application",
    trademark_number: "NG-TM-2025-89123", jurisdiction: "Nigeria",
    documents: [{ name: "Trademark Application Receipt", url: "#" }, { name: "Product Sample Photos", url: "#" }],
    status: "pending", notes: "", submitted_at: "2026-06-08", reviewed_at: null, reviewed_by: null,
  },
  {
    id: 3, vendor: "PharmaDistributors", vendor_email: "orders@pharmadistributors.ng",
    brand_name: "HealthPlus Rx", trademark_info: "Registered trademark in Nigeria",
    trademark_number: "NG-TM-2023-34567", jurisdiction: "Nigeria",
    documents: [{ name: "Trademark Certificate", url: "#" }, { name: "NAFDAC License", url: "#" }, { name: "Business Registration", url: "#" }],
    status: "approved", notes: "All documents verified. Brand approved for all categories.", submitted_at: "2026-05-20", reviewed_at: "2026-05-25", reviewed_by: "Super Admin",
  },
  {
    id: 4, vendor: "AutoParts Hub", vendor_email: "info@autopartshub.ng",
    brand_name: "AutoPro NG", trademark_info: "Registered trademark in Nigeria",
    trademark_number: "NG-TM-2024-23456", jurisdiction: "Nigeria",
    documents: [{ name: "Trademark Certificate", url: "#" }],
    status: "rejected", notes: "Trademark certificate does not match the brand name submitted. Please resubmit with correct documentation.",
    submitted_at: "2026-05-15", reviewed_at: "2026-05-22", reviewed_by: "Super Admin",
  },
  {
    id: 5, vendor: "ElectroWorld", vendor_email: "contact@electroworld.com",
    brand_name: "ElectraHome", trademark_info: "International trademark (WIPO)",
    trademark_number: "WIPO-2025-78901", jurisdiction: "International",
    documents: [{ name: "WIPO Registration", url: "#" }, { name: "Power of Attorney", url: "#" }],
    status: "pending", notes: "", submitted_at: "2026-06-12", reviewed_at: null, reviewed_by: null,
  },
  {
    id: 6, vendor: "SafetyFirst Supplies", vendor_email: "hello@safetyfirst.ng",
    brand_name: "SafePro", trademark_info: "Registered trademark in Nigeria",
    trademark_number: "NG-TM-2023-12345", jurisdiction: "Nigeria",
    documents: [{ name: "Trademark Certificate", url: "#" }, { name: "Business Registration", url: "#" }, { name: "SON Certificate", url: "#" }],
    status: "approved", notes: "Brand approved. Eligible for safety equipment category.", submitted_at: "2026-04-10", reviewed_at: "2026-04-18", reviewed_by: "Super Admin",
  },
  {
    id: 7, vendor: "ChemCorp Nigeria", vendor_email: "sales@chemcorp.ng",
    brand_name: "ChemiSafe", trademark_info: "Registered trademark in Nigeria",
    trademark_number: "NG-TM-2024-56789", jurisdiction: "Nigeria",
    documents: [{ name: "Trademark Certificate", url: "#" }, { name: "NAFDAC Registration", url: "#" }],
    status: "rejected", notes: "NAFDAC registration is expired. Please renew and resubmit.",
    submitted_at: "2026-03-28", reviewed_at: "2026-04-05", reviewed_by: "Super Admin",
  },
  {
    id: 8, vendor: "CCTV Solutions", vendor_email: "info@cctvsolutions.ng",
    brand_name: "ViewTech", trademark_info: "Pending trademark application",
    trademark_number: "NG-TM-2026-01234", jurisdiction: "Nigeria",
    documents: [{ name: "Trademark Application Receipt", url: "#" }],
    status: "pending", notes: "", submitted_at: "2026-06-14", reviewed_at: null, reviewed_by: null,
  },
];

export default function BrandRegistryPage() {
  const [applications, setApplications] = useState<BrandApplication[]>(defaultApplications);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ApplicationStatus>("all");
  const [selectedApp, setSelectedApp] = useState<BrandApplication | null>(null);
  const [showReview, setShowReview] = useState<BrandApplication | null>(null);
  const [reviewAction, setReviewAction] = useState<"approve" | "reject">("approve");
  const [reviewNotes, setReviewNotes] = useState("");
  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" }>({ show: false, message: "", type: "success" });

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const filtered = applications.filter(a => {
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    if (search && !a.brand_name.toLowerCase().includes(search.toLowerCase()) && !a.vendor.toLowerCase().includes(search.toLowerCase()) && !a.trademark_number.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleReview = () => {
    if (!showReview) return;
    if (reviewAction === "reject" && !reviewNotes.trim()) { showToast("Please provide rejection notes", "error"); return; }

    setApplications(prev => prev.map(a => a.id === showReview.id ? {
      ...a,
      status: reviewAction === "approve" ? "approved" as ApplicationStatus : "rejected" as ApplicationStatus,
      notes: reviewNotes,
      reviewed_at: new Date().toISOString().slice(0, 10),
      reviewed_by: "Super Admin",
    } : a));

    showToast(`Brand ${reviewAction === "approve" ? "approved" : "rejected"} successfully`);
    setShowReview(null);
    setReviewNotes("");
    setSelectedApp(null);
  };

  const statusBadge = (s: ApplicationStatus) => {
    switch (s) {
      case "pending": return <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700"><Clock size={10} /> Pending</span>;
      case "approved": return <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-700"><CheckCircle size={10} /> Approved</span>;
      case "rejected": return <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-700"><XCircle size={10} /> Rejected</span>;
    }
  };

  return (
    <AdminShell title="Brand Registry" subtitle="Review and manage vendor brand registration applications">
      {toast.show && (
        <div className={`fixed top-4 right-4 z-[100] px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium text-white ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
          {toast.message}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Applications", value: applications.length, color: "#1641C4" },
          { label: "Pending Review", value: applications.filter(a => a.status === "pending").length, color: "#F59E0B" },
          { label: "Approved", value: applications.filter(a => a.status === "approved").length, color: "#10B981" },
          { label: "Rejected", value: applications.filter(a => a.status === "rejected").length, color: "#EF4444" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 rounded-full -translate-y-1/2 translate-x-1/2 opacity-10" style={{ backgroundColor: s.color }} />
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-text-4">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-56">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search brand, vendor, or TM #..." className="w-full h-9 pl-9 pr-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue" />
          </div>
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {(["all", "pending", "approved", "rejected"] as const).map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 text-xs rounded-md capitalize ${statusFilter === s ? "bg-white shadow-sm font-medium" : "text-text-4"}`}>{s}</button>
            ))}
          </div>
        </div>
        <span className="text-xs text-text-4">{filtered.length} of {applications.length} applications</span>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-5 py-3 font-medium text-text-4">Brand</th>
              <th className="text-left px-5 py-3 font-medium text-text-4">Vendor</th>
              <th className="text-left px-5 py-3 font-medium text-text-4">Trademark</th>
              <th className="text-left px-5 py-3 font-medium text-text-4">Jurisdiction</th>
              <th className="text-left px-5 py-3 font-medium text-text-4">Documents</th>
              <th className="text-center px-5 py-3 font-medium text-text-4">Status</th>
              <th className="text-right px-5 py-3 font-medium text-text-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(a => (
              <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                      <Building2 size={14} className="text-orange" />
                    </div>
                    <p className="font-medium text-text-1">{a.brand_name}</p>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center">
                      <User size={12} className="text-blue" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-1">{a.vendor}</p>
                      <p className="text-[10px] text-text-4">{a.vendor_email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <div>
                    <p className="text-sm text-text-1">{a.trademark_info}</p>
                    <p className="text-[10px] font-mono text-text-4">{a.trademark_number}</p>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                    <Globe size={10} /> {a.jurisdiction}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex flex-wrap gap-1">
                    {a.documents.map((d, i) => (
                      <span key={i} className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-orange-50 text-orange">
                        <FileText size={8} /> {d.name}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-3 text-center">{statusBadge(a.status)}</td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => setSelectedApp(a)} className="p-1.5 hover:bg-gray-100 rounded-lg text-text-4 hover:text-blue" title="View details">
                      <Eye size={14} />
                    </button>
                    {a.status === "pending" && (
                      <button onClick={() => { setShowReview(a); setReviewAction("approve"); setReviewNotes(a.notes || ""); }}
                        className="p-1.5 hover:bg-green-50 rounded-lg text-green-600" title="Review">
                        <MessageSquare size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-5 py-8 text-center text-sm text-text-4">No brand applications found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setSelectedApp(null)}>
          <div className="bg-white rounded-2xl w-full max-w-[560px]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-semibold text-lg">Brand Application Details</h3>
              <button onClick={() => setSelectedApp(null)} className="text-text-4 hover:text-text-2"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
                  <Building2 size={24} className="text-orange" />
                </div>
                <div>
                  <p className="font-semibold text-lg text-text-1">{selectedApp.brand_name}</p>
                  <p className="text-xs text-text-4">by {selectedApp.vendor}</p>
                </div>
                <div className="ml-auto">{statusBadge(selectedApp.status)}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-text-4 mb-0.5">Vendor Email</p>
                  <p className="text-sm text-text-2">{selectedApp.vendor_email}</p>
                </div>
                <div>
                  <p className="text-xs text-text-4 mb-0.5">Jurisdiction</p>
                  <p className="text-sm text-text-2">{selectedApp.jurisdiction}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-text-4 mb-0.5">Trademark Info</p>
                  <p className="text-sm text-text-1">{selectedApp.trademark_info}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-text-4 mb-0.5">Trademark Number</p>
                  <p className="text-sm font-mono text-text-1">{selectedApp.trademark_number}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-text-4 mb-2 font-medium">Submitted Documents</p>
                <div className="space-y-2">
                  {selectedApp.documents.map((d, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2">
                        <FileText size={14} className="text-orange" />
                        <span className="text-sm text-text-1">{d.name}</span>
                      </div>
                      <button onClick={() => window.open(d.url, "_blank")} className="text-xs text-blue hover:underline">View</button>
                    </div>
                  ))}
                </div>
              </div>

              {selectedApp.notes && (
                <div className={`p-3 rounded-lg ${selectedApp.status === "rejected" ? "bg-red-50 border border-red-100" : "bg-blue-50 border border-blue-100"}`}>
                  <p className="text-xs font-medium mb-1">{selectedApp.status === "rejected" ? "Rejection Notes" : "Review Notes"}</p>
                  <p className={`text-sm ${selectedApp.status === "rejected" ? "text-red-600" : "text-blue-700"}`}>{selectedApp.notes}</p>
                </div>
              )}

              {selectedApp.reviewed_at && (
                <div className="text-xs text-text-4">
                  Reviewed by {selectedApp.reviewed_by} on {selectedApp.reviewed_at}
                </div>
              )}
            </div>

            <div className="flex gap-2 p-5 border-t border-gray-100">
              {selectedApp.status === "pending" ? (
                <>
                  <button onClick={() => { setSelectedApp(null); setShowReview(selectedApp); setReviewAction("reject"); setReviewNotes(""); }}
                    className="flex-1 h-10 rounded-lg border border-red-200 text-red text-sm font-medium hover:bg-red-50 flex items-center justify-center gap-1.5">
                    <XCircle size={14} /> Reject
                  </button>
                  <button onClick={() => { setSelectedApp(null); setShowReview(selectedApp); setReviewAction("approve"); setReviewNotes(""); }}
                    className="flex-1 h-10 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 flex items-center justify-center gap-1.5">
                    <CheckCircle size={14} /> Approve
                  </button>
                </>
              ) : (
                <button onClick={() => setSelectedApp(null)} className="w-full h-10 rounded-lg border border-gray-200 text-sm font-medium text-text-3 hover:bg-gray-50">Close</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReview && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => { setShowReview(null); setReviewNotes(""); }}>
          <div className="bg-white rounded-2xl w-full max-w-[480px]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-semibold text-lg">{reviewAction === "approve" ? "Approve" : "Reject"} Brand</h3>
              <button onClick={() => { setShowReview(null); setReviewNotes(""); }} className="text-text-4 hover:text-text-2"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <Building2 size={18} className="text-orange" />
                <div>
                  <p className="font-semibold text-text-1">{showReview.brand_name}</p>
                  <p className="text-xs text-text-4">{showReview.vendor}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setReviewAction("approve")}
                  className={`flex-1 h-10 rounded-lg text-sm font-medium border transition-all ${reviewAction === "approve" ? "bg-green-50 border-green-300 text-green-700" : "border-gray-200 text-text-3 hover:bg-gray-50"}`}>
                  <CheckCircle size={14} className="inline mr-1" /> Approve
                </button>
                <button onClick={() => setReviewAction("reject")}
                  className={`flex-1 h-10 rounded-lg text-sm font-medium border transition-all ${reviewAction === "reject" ? "bg-red-50 border-red-300 text-red-700" : "border-gray-200 text-text-3 hover:bg-gray-50"}`}>
                  <XCircle size={14} className="inline mr-1" /> Reject
                </button>
              </div>

              {reviewAction === "reject" && (
                <div>
                  <label className="text-sm font-medium text-text-2 block mb-1.5">Rejection Reason *</label>
                  <textarea value={reviewNotes} onChange={e => setReviewNotes(e.target.value)}
                    rows={3} placeholder="Explain why this brand application is being rejected..."
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-red resize-none" />
                </div>
              )}

              {reviewAction === "approve" && (
                <div>
                  <label className="text-sm font-medium text-text-2 block mb-1.5">Approval Notes (optional)</label>
                  <textarea value={reviewNotes} onChange={e => setReviewNotes(e.target.value)}
                    rows={2} placeholder="Any notes or conditions for approval..."
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue resize-none" />
                </div>
              )}
            </div>
            <div className="flex gap-2 p-5 border-t border-gray-100">
              <button onClick={() => { setShowReview(null); setReviewNotes(""); }} className="flex-1 h-10 rounded-lg border border-gray-200 text-sm font-medium text-text-3 hover:bg-gray-50">Cancel</button>
              <button onClick={handleReview} disabled={reviewAction === "reject" && !reviewNotes.trim()}
                className={`flex-1 h-10 rounded-lg text-white text-sm font-semibold disabled:opacity-50 ${reviewAction === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red hover:bg-red/90"}`}>
                {reviewAction === "approve" ? "Approve Brand" : "Reject Brand"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
