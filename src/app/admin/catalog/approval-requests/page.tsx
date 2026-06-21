"use client";

import { useState } from "react";
import AdminShell from "@/components/admin/admin-shell";
import {
  Search, CheckCircle, XCircle, Clock, FileText, User,
  AlertTriangle, Filter, Eye,
} from "lucide-react";

type ApprovalStatus = "pending" | "approved" | "rejected";

interface ApprovalRequest {
  id: number;
  vendor: string;
  vendor_email: string;
  type: "category" | "brand";
  name: string;
  documents: { name: string; url: string }[];
  status: ApprovalStatus;
  rejection_reason: string;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

const defaultRequests: ApprovalRequest[] = [
  {
    id: 1, vendor: "SecureTech NG", vendor_email: "info@securetech.ng",
    type: "brand", name: "Hikvision",
    documents: [{ name: "Brand Authorization Letter", url: "#" }, { name: "Certificate of Authenticity", url: "#" }, { name: "Purchase Invoice", url: "#" }],
    status: "pending", rejection_reason: "", submitted_at: "2026-06-15", reviewed_at: null, reviewed_by: null,
  },
  {
    id: 2, vendor: "MarinePlus Ltd", vendor_email: "sales@marineplus.com",
    type: "category", name: "Marine Equipment",
    documents: [{ name: "Import Duty Receipt", url: "#" }, { name: "SON Certificate", url: "#" }],
    status: "pending", rejection_reason: "", submitted_at: "2026-06-14", reviewed_at: null, reviewed_by: null,
  },
  {
    id: 3, vendor: "PharmaDistributors", vendor_email: "orders@pharmadistributors.ng",
    type: "category", name: "Pharmaceuticals",
    documents: [{ name: "NAFDAC Registration", url: "#" }, { name: "Purchase Invoice", url: "#" }, { name: "Good Storage Practice Cert", url: "#" }],
    status: "approved", rejection_reason: "", submitted_at: "2026-06-10", reviewed_at: "2026-06-12", reviewed_by: "Super Admin",
  },
  {
    id: 4, vendor: "AutoParts Hub", vendor_email: "info@autopartshub.ng",
    type: "brand", name: "Bosch",
    documents: [{ name: "Brand Authorization Letter", url: "#" }],
    status: "rejected", rejection_reason: "Incomplete documentation - missing Certificate of Authenticity",
    submitted_at: "2026-06-08", reviewed_at: "2026-06-11", reviewed_by: "Super Admin",
  },
  {
    id: 5, vendor: "ElectroWorld", vendor_email: "contact@electroworld.com",
    type: "category", name: "Electronics",
    documents: [{ name: "Purchase Invoice", url: "#" }],
    status: "pending", rejection_reason: "", submitted_at: "2026-06-13", reviewed_at: null, reviewed_by: null,
  },
  {
    id: 6, vendor: "SafetyFirst Supplies", vendor_email: "hello@safetyfirst.ng",
    type: "brand", name: "Honeywell",
    documents: [{ name: "Brand Authorization Letter", url: "#" }, { name: "Certificate of Authenticity", url: "#" }, { name: "FCC Compliance", url: "#" }],
    status: "approved", rejection_reason: "", submitted_at: "2026-06-05", reviewed_at: "2026-06-07", reviewed_by: "Super Admin",
  },
  {
    id: 7, vendor: "ChemCorp Nigeria", vendor_email: "sales@chemcorp.ng",
    type: "category", name: "Chemicals",
    documents: [{ name: "SON Certificate", url: "#" }, { name: "NAFDAC Registration", url: "#" }],
    status: "rejected", rejection_reason: "Expired NAFDAC registration document",
    submitted_at: "2026-06-01", reviewed_at: "2026-06-04", reviewed_by: "Super Admin",
  },
  {
    id: 8, vendor: "CCTV Solutions", vendor_email: "info@cctvsolutions.ng",
    type: "brand", name: "Dahua",
    documents: [{ name: "Brand Authorization Letter", url: "#" }, { name: "Certificate of Authenticity", url: "#" }],
    status: "pending", rejection_reason: "", submitted_at: "2026-06-16", reviewed_at: null, reviewed_by: null,
  },
];

export default function ApprovalRequestsPage() {
  const [requests, setRequests] = useState<ApprovalRequest[]>(defaultRequests);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ApprovalStatus>("all");
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showReject, setShowReject] = useState<number | null>(null);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" }>({ show: false, message: "", type: "success" });

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const filtered = requests.filter(r => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (search && !r.vendor.toLowerCase().includes(search.toLowerCase()) && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleApprove = (id: number) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: "approved" as ApprovalStatus, reviewed_at: new Date().toISOString().slice(0, 10), reviewed_by: "Super Admin" } : r));
    showToast("Request approved successfully");
    setSelectedRequest(null);
  };

  const handleReject = (id: number) => {
    if (!rejectReason.trim()) return;
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: "rejected" as ApprovalStatus, rejection_reason: rejectReason, reviewed_at: new Date().toISOString().slice(0, 10), reviewed_by: "Super Admin" } : r));
    showToast("Request rejected");
    setShowReject(null);
    setRejectReason("");
    setSelectedRequest(null);
  };

  const statusBadge = (status: ApprovalStatus) => {
    switch (status) {
      case "pending": return <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700"><Clock size={10} /> Pending</span>;
      case "approved": return <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-700"><CheckCircle size={10} /> Approved</span>;
      case "rejected": return <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-700"><XCircle size={10} /> Rejected</span>;
    }
  };

  return (
    <AdminShell title="Approval Requests" subtitle="Review and manage vendor catalog approval requests">
      {toast.show && (
        <div className={`fixed top-4 right-4 z-[100] px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium text-white ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
          {toast.message}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Requests", value: requests.length, color: "#1641C4" },
          { label: "Pending", value: requests.filter(r => r.status === "pending").length, color: "#F59E0B" },
          { label: "Approved", value: requests.filter(r => r.status === "approved").length, color: "#10B981" },
          { label: "Rejected", value: requests.filter(r => r.status === "rejected").length, color: "#EF4444" },
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
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search vendor or category/brand..." className="w-full h-9 pl-9 pr-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue" />
          </div>
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {(["all", "pending", "approved", "rejected"] as const).map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 text-xs rounded-md capitalize ${statusFilter === s ? "bg-white shadow-sm font-medium" : "text-text-4"}`}>{s}</button>
            ))}
          </div>
        </div>
        <span className="text-xs text-text-4"><Filter size={12} className="inline mr-1" />{filtered.length} of {requests.length} requests</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-5 py-3 font-medium text-text-4">Vendor</th>
              <th className="text-left px-5 py-3 font-medium text-text-4">Type</th>
              <th className="text-left px-5 py-3 font-medium text-text-4">Category / Brand</th>
              <th className="text-left px-5 py-3 font-medium text-text-4">Documents</th>
              <th className="text-center px-5 py-3 font-medium text-text-4">Status</th>
              <th className="text-right px-5 py-3 font-medium text-text-4">Submitted</th>
              <th className="text-right px-5 py-3 font-medium text-text-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(r => (
              <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                      <User size={14} className="text-blue" />
                    </div>
                    <div>
                      <p className="font-medium text-text-1 text-sm">{r.vendor}</p>
                      <p className="text-[10px] text-text-4">{r.vendor_email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${r.type === "category" ? "bg-blue-50 text-blue" : "bg-purple-50 text-purple-700"}`}>
                    {r.type === "category" ? "Category" : "Brand"}
                  </span>
                </td>
                <td className="px-5 py-3 font-medium text-text-1">{r.name}</td>
                <td className="px-5 py-3">
                  <div className="flex flex-wrap gap-1">
                    {r.documents.map((d, i) => (
                      <span key={i} className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-orange-50 text-orange">
                        <FileText size={8} /> {d.name}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-3 text-center">{statusBadge(r.status)}</td>
                <td className="px-5 py-3 text-right text-text-4 text-xs">{r.submitted_at}</td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => setSelectedRequest(r)} className="p-1.5 hover:bg-gray-100 rounded-lg text-text-4 hover:text-blue">
                    <Eye size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-5 py-8 text-center text-sm text-text-4">No approval requests found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setSelectedRequest(null)}>
          <div className="bg-white rounded-2xl w-full max-w-[560px]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-semibold text-lg">Approval Request Details</h3>
              <button onClick={() => setSelectedRequest(null)} className="text-text-4 hover:text-text-2"><AlertTriangle size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-text-4 mb-0.5">Vendor</p>
                  <p className="text-sm font-medium text-text-1">{selectedRequest.vendor}</p>
                </div>
                <div>
                  <p className="text-xs text-text-4 mb-0.5">Email</p>
                  <p className="text-sm text-text-2">{selectedRequest.vendor_email}</p>
                </div>
                <div>
                  <p className="text-xs text-text-4 mb-0.5">Type</p>
                  <p className="text-sm font-medium text-text-1 capitalize">{selectedRequest.type}</p>
                </div>
                <div>
                  <p className="text-xs text-text-4 mb-0.5">Name</p>
                  <p className="text-sm font-medium text-text-1">{selectedRequest.name}</p>
                </div>
                <div>
                  <p className="text-xs text-text-4 mb-0.5">Status</p>
                  <div>{statusBadge(selectedRequest.status)}</div>
                </div>
                <div>
                  <p className="text-xs text-text-4 mb-0.5">Submitted</p>
                  <p className="text-sm text-text-2">{selectedRequest.submitted_at}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-text-4 mb-2 font-medium">Submitted Documents</p>
                <div className="space-y-2">
                  {selectedRequest.documents.map((d, i) => (
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

              {selectedRequest.status === "rejected" && selectedRequest.rejection_reason && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-100">
                  <p className="text-xs font-medium text-red-700 mb-1">Rejection Reason</p>
                  <p className="text-sm text-red-600">{selectedRequest.rejection_reason}</p>
                </div>
              )}

              {selectedRequest.reviewed_at && (
                <div className="text-xs text-text-4">
                  Reviewed by {selectedRequest.reviewed_by} on {selectedRequest.reviewed_at}
                </div>
              )}
            </div>

            {selectedRequest.status === "pending" && (
              <div className="flex gap-2 p-5 border-t border-gray-100">
                <button onClick={() => { setShowReject(selectedRequest.id); }} className="flex-1 h-10 rounded-lg border border-red-200 text-red text-sm font-medium hover:bg-red-50 flex items-center justify-center gap-1.5">
                  <XCircle size={14} /> Reject
                </button>
                <button onClick={() => handleApprove(selectedRequest.id)} className="flex-1 h-10 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 flex items-center justify-center gap-1.5">
                  <CheckCircle size={14} /> Approve
                </button>
              </div>
            )}

            {(selectedRequest.status === "approved" || selectedRequest.status === "rejected") && (
              <div className="p-5 border-t border-gray-100">
                <button onClick={() => setSelectedRequest(null)} className="w-full h-10 rounded-lg border border-gray-200 text-sm font-medium text-text-3 hover:bg-gray-50">Close</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showReject && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => { setShowReject(null); setRejectReason(""); }}>
          <div className="bg-white rounded-2xl w-full max-w-[460px]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-semibold text-lg">Reject Request</h3>
              <button onClick={() => { setShowReject(null); setRejectReason(""); }} className="text-text-4 hover:text-text-2"><XCircle size={18} /></button>
            </div>
            <div className="p-5">
              <label className="text-sm font-medium text-text-2 block mb-2">Rejection Reason *</label>
              <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                rows={4} placeholder="Explain why this request is being rejected..."
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-red resize-none" />
            </div>
            <div className="flex gap-2 p-5 border-t border-gray-100">
              <button onClick={() => { setShowReject(null); setRejectReason(""); }} className="flex-1 h-10 rounded-lg border border-gray-200 text-sm font-medium text-text-3 hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleReject(showReject)} disabled={!rejectReason.trim()}
                className="flex-1 h-10 rounded-lg bg-red text-white text-sm font-semibold hover:bg-red/90 disabled:opacity-50">Reject Request</button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
