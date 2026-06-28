"use client";

import { useState, useEffect } from "react";
import AdminShell from "@/components/admin/admin-shell";
import { Search, FileText, RefreshCw, CheckCircle2, XCircle, AlertTriangle, Clock, Eye } from "lucide-react";

interface CustomsDocument {
  id: string;
  shipment_id: string;
  shipment_type: string;
  document_type: string;
  hs_codes: Array<{ code: string; description: string; quantity: number }>;
  declared_value: number;
  currency: string;
  origin_country: string;
  dest_country: string;
  customs_status: string;
  duties_estimated: number;
  duties_actual: number | null;
  duties_paid_by: string;
  created_at: string;
}

const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  pending: { label: "Pending", icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
  submitted: { label: "Submitted", icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
  cleared: { label: "Cleared", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
  held: { label: "Held", icon: AlertTriangle, color: "text-orange-600", bg: "bg-orange-50" },
  rejected: { label: "Rejected", icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
};

export default function CustomsDocumentsPage() {
  const [documents, setDocuments] = useState<CustomsDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedDoc, setSelectedDoc] = useState<CustomsDocument | null>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/shipping/customs");
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = documents.filter((d) => {
    if (filterStatus !== "all" && d.customs_status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      return d.shipment_id.toLowerCase().includes(q) || d.document_type.toLowerCase().includes(q);
    }
    return true;
  });

  const stats = {
    total: documents.length,
    pending: documents.filter((d) => d.customs_status === "pending").length,
    cleared: documents.filter((d) => d.customs_status === "cleared").length,
    held: documents.filter((d) => d.customs_status === "held").length,
  };

  return (
    <AdminShell title="Customs Documents" subtitle="Manage customs declarations, duties, and compliance">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total Documents</p>
          <p className="text-2xl font-bold text-[#0A1628] mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Pending</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Cleared</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.cleared}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Held</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">{stats.held}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by shipment ID or document type..."
            className="w-full h-9 pl-9 pr-3 text-sm rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]/20"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="h-9 px-3 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none"
        >
          <option value="all">All Status</option>
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <option key={key} value={key}>{cfg.label}</option>
          ))}
        </select>
        <button onClick={loadDocuments} className="h-9 px-3 border border-gray-200 text-sm font-medium rounded-lg hover:bg-gray-50 flex items-center gap-1.5">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="animate-spin text-gray-400" size={24} />
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">Document Type</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">Shipment</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">Route</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">HS Codes</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">Value</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">Duties Est.</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="p-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-sm text-gray-400">
                    {documents.length === 0 ? "No customs documents yet" : "No results found"}
                  </td>
                </tr>
              ) : (
                filtered.map((doc) => {
                  const status = STATUS_CONFIG[doc.customs_status] || STATUS_CONFIG.pending;
                  const StatusIcon = status.icon;
                  return (
                    <tr key={doc.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="p-3">
                        <span className="text-sm font-medium text-[#0A1628] capitalize">{doc.document_type.replace(/_/g, " ")}</span>
                      </td>
                      <td className="p-3">
                        <span className="text-xs font-mono text-gray-500">{doc.shipment_id?.substring(0, 8)}...</span>
                      </td>
                      <td className="p-3">
                        <span className="text-sm">{doc.origin_country} → {doc.dest_country}</span>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {(doc.hs_codes || []).slice(0, 2).map((hs, i) => (
                            <span key={i} className="text-[10px] font-mono bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                              {hs.code}
                            </span>
                          ))}
                          {(doc.hs_codes || []).length > 2 && (
                            <span className="text-[10px] text-gray-400">+{doc.hs_codes.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-sm font-medium text-[#0A1628]">
                        {doc.currency} {doc.declared_value?.toLocaleString()}
                      </td>
                      <td className="p-3 text-sm text-gray-600">
                        {doc.currency} {(doc.duties_estimated || 0).toLocaleString()}
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setSelectedDoc(doc)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center" onClick={() => setSelectedDoc(null)}>
          <div className="bg-white rounded-2xl w-[560px] p-6 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#0A1628]">Customs Document Details</h3>
              <button onClick={() => setSelectedDoc(null)} className="text-gray-400 hover:text-gray-600">X</button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Document Type</span><span className="font-medium capitalize">{selectedDoc.document_type.replace(/_/g, " ")}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Route</span><span className="font-medium">{selectedDoc.origin_country} → {selectedDoc.dest_country}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Declared Value</span><span className="font-medium">{selectedDoc.currency} {selectedDoc.declared_value?.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Duties (Estimated)</span><span className="font-medium">{selectedDoc.currency} {(selectedDoc.duties_estimated || 0).toLocaleString()}</span></div>
              {selectedDoc.duties_actual && <div className="flex justify-between"><span className="text-gray-500">Duties (Actual)</span><span className="font-medium">{selectedDoc.currency} {selectedDoc.duties_actual.toLocaleString()}</span></div>}
              <div className="flex justify-between"><span className="text-gray-500">Duties Paid By</span><span className="font-medium capitalize">{selectedDoc.duties_paid_by}</span></div>
              <div className="pt-2 border-t border-gray-100">
                <p className="text-gray-500 mb-2">HS Codes</p>
                <div className="space-y-1">
                  {(selectedDoc.hs_codes || []).map((hs, i) => (
                    <div key={i} className="flex justify-between bg-gray-50 rounded-lg px-3 py-2">
                      <span className="font-mono text-xs">{hs.code}</span>
                      <span className="text-xs text-gray-600">{hs.description}</span>
                      <span className="text-xs">x{hs.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
